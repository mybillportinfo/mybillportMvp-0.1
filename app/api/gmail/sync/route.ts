import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../../lib/authVerify';
import {
  getAuthenticatedGmailClient,
  checkDuplicateGmailMessage,
  storePendingBill,
  PendingBill,
} from '../../../lib/gmailService';
import { PROVIDER_REGISTRY } from '../../../lib/providerRegistry';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const maxDuration = 60;

const GMAIL_API_TIMEOUT_MS = 15000;
const CLAUDE_TIMEOUT_MS = 25000;
const MAX_EMAILS_TO_PROCESS = 150;

// ─── Claude Prompt ────────────────────────────────────────────────────────────
const BILL_PARSE_PROMPT = `You are a bill parsing specialist. Extract ONLY the following from this billing email:

- merchant: Clean official company name (e.g. "Enbridge" not "ebill@enbridge.com"). Use sender name/domain.
- amount: The CURRENT bill amount due as a plain number (e.g. 80.81). 
  RULES for amount:
  • Use "New Bill Amount", "Amount Due", "Payment Due", "Current Charges", "Total Due", "Balance Due"
  • DO NOT use account balance, previous balance, cumulative totals, or credit amounts
  • If multiple candidates, pick the one explicitly labeled as current payment
  • Return null if genuinely not found
- dueDate: Payment due date in YYYY-MM-DD format. Look for "Due Date", "Payment Due", "Pay By". Return null if not found.
- accountNumber: Account or bill number if present. Return null if not found.
- confidence: "high" if amount AND dueDate found clearly, "medium" if one found, "low" if neither found
- category: One of: utilities, telecom, government, insurance, banking, credit_cards, housing, transportation, education, subscriptions, property, miscellaneous

Return ONLY a valid JSON object with exactly these 6 fields. No markdown, no explanation, no code blocks.
Example: {"merchant":"Enbridge","amount":80.81,"dueDate":"2026-03-18","accountNumber":"7234568901","confidence":"high","category":"utilities"}

EMAIL CONTENT:
`;

// ─── Search Queries ───────────────────────────────────────────────────────────
function buildSearchQueries(): string[] {
  return [
    'subject:(invoice OR bill OR statement OR receipt) newer_than:90d',
    'subject:("amount due" OR "payment due" OR "due date" OR "billing notice" OR "your bill") newer_than:90d',
    'subject:("account statement" OR "billing statement" OR "payment reminder" OR "balance due") newer_than:90d',
    'subject:(subscription OR renewal OR "auto-pay" OR autopay) newer_than:90d',
    'subject:(ebill OR "e-bill" OR "new bill" OR "current bill" OR "account summary") newer_than:90d',
    'subject:(overdue OR "past due" OR "final notice" OR "payment confirmation") newer_than:90d',
  ];
}

// ─── Billing Email Filter ─────────────────────────────────────────────────────
function isBillingEmail(from: string, subject: string, snippet: string): boolean {
  const text = `${from} ${subject} ${snippet}`.toLowerCase();
  const billingKeywords = [
    'invoice', 'bill', 'statement', 'receipt', 'payment', 'amount due',
    'balance due', 'due date', 'billing', 'subscription', 'renewal',
    'account summary', 'charges', 'total due', 'pay now', 'autopay',
    'auto-pay', 'overdue', 'reminder', 'ebill', 'e-bill', 'new bill',
    'current charges', 'pay by', 'payment due', 'final notice',
  ];
  return billingKeywords.some(kw => text.includes(kw));
}

// ─── HTML → Text (robust) ────────────────────────────────────────────────────
function htmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
    .replace(/<(br|p|div|tr|li|h[1-6])[^>]*>/gi, '\n')
    .replace(/<td[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-zA-Z]+;/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Email Text Extraction ────────────────────────────────────────────────────
function extractEmailText(payload: any): { text: string; hasPdfAttachment: boolean; pdfAttachmentId: string | null; pdfFilename: string | null } {
  let plainText = '';
  let htmlText = '';
  let hasPdfAttachment = false;
  let pdfAttachmentId: string | null = null;
  let pdfFilename: string | null = null;

  function traverse(part: any) {
    if (!part) return;

    const mime = (part.mimeType || '').toLowerCase();

    if (mime === 'text/plain' && part.body?.data) {
      plainText += Buffer.from(part.body.data, 'base64url').toString('utf-8') + '\n';
    } else if (mime === 'text/html' && part.body?.data) {
      const raw = Buffer.from(part.body.data, 'base64url').toString('utf-8');
      htmlText += htmlToText(raw) + '\n';
    } else if (mime === 'application/pdf') {
      hasPdfAttachment = true;
      pdfAttachmentId = part.body?.attachmentId || null;
      pdfFilename = part.filename || 'attachment.pdf';
    } else if (mime.startsWith('multipart/') && part.parts) {
      for (const subPart of part.parts) traverse(subPart);
      return;
    }

    if (part.parts) {
      for (const subPart of part.parts) traverse(subPart);
    }
  }

  traverse(payload);

  const text = plainText.trim() || htmlText.trim();
  return {
    text: text.slice(0, 10000),
    hasPdfAttachment,
    pdfAttachmentId,
    pdfFilename,
  };
}

// ─── PDF Text Extraction ──────────────────────────────────────────────────────
async function extractPdfText(gmail: any, messageId: string, attachmentId: string): Promise<string | null> {
  try {
    const attachResponse = await withTimeout(
      gmail.users.messages.attachments.get({ userId: 'me', messageId, id: attachmentId }),
      GMAIL_API_TIMEOUT_MS,
      'gmail.getAttachment'
    );
    const data = attachResponse.data.data;
    if (!data) return null;

    const buffer = Buffer.from(data, 'base64url');
    const pdfParse = (await import('pdf-parse')).default;
    const result = await pdfParse(buffer);
    return result.text?.slice(0, 8000) || null;
  } catch (err: any) {
    console.error({ route: '/api/gmail/sync', step: 'pdfExtract', error: err.message });
    return null;
  }
}

// ─── Regex-Based Pre-Extraction ───────────────────────────────────────────────
interface RegexExtraction {
  amount: number | null;
  dueDate: string | null;
  isBillingCandidate: boolean;
}

function regexExtract(subject: string, body: string): RegexExtraction {
  const subjectLower = subject.toLowerCase();
  const bodyLower = body.toLowerCase();
  const fullText = `${subject}\n${body}`;

  // Is this a billing candidate by subject keywords?
  const billingSubjectKeywords = ['bill', 'invoice', 'statement', 'ebill', 'e-bill', 'amount due', 'payment due', 'receipt', 'overdue'];
  const isBillingCandidate = billingSubjectKeywords.some(kw => subjectLower.includes(kw));

  // ── Amount extraction ──
  // Try context-aware extraction first (look for amounts near "due" keywords)
  const amountContextPatterns = [
    /(?:new bill amount|amount due|payment due|total due|balance due|current charges|current bill|pay this amount)[^\d$]*\$?\s*([\d,]+\.?\d{0,2})/gi,
    /\$\s*([\d,]+\.?\d{0,2})\s*(?:is due|due|owed)/gi,
  ];

  let amount: number | null = null;

  for (const pattern of amountContextPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(fullText)) !== null) {
      const val = parseFloat(match[1].replace(/,/g, ''));
      if (val > 0 && val < 100000) {
        amount = val;
        break;
      }
    }
    if (amount !== null) break;
  }

  // Fallback: find all dollar amounts in the text, prefer reasonable bill amounts
  if (amount === null) {
    const allAmounts: number[] = [];
    const dollarPattern = /\$\s*([\d,]+\.\d{2})/g;
    let m: RegExpExecArray | null;
    while ((m = dollarPattern.exec(fullText)) !== null) {
      const val = parseFloat(m[1].replace(/,/g, ''));
      if (val > 0.5 && val < 50000) allAmounts.push(val);
    }

    if (allAmounts.length > 0) {
      // Prefer amounts in a typical utility bill range (1–10,000)
      const candidates = allAmounts.filter(v => v >= 1 && v <= 10000);
      if (candidates.length > 0) {
        // Take the smallest if multiple (often the actual payment, not balance)
        amount = candidates.sort((a, b) => a - b)[0];
      } else {
        amount = allAmounts[0];
      }
    }
  }

  // ── Date extraction ──
  let dueDate: string | null = null;

  // Context-aware date search first
  const dueDateContextPatterns = [
    /(?:due date|payment due|pay by|due on|due before)[:\s]+([A-Za-z]+ \d{1,2},?\s*\d{4})/gi,
    /(?:due date|payment due|pay by|due on|due before)[:\s]+(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/gi,
    /(?:due date|payment due|pay by|due on|due before)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/gi,
    /(?:due date|payment due|pay by|due on|due before)[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2})/gi,
  ];

  for (const pattern of dueDateContextPatterns) {
    const match = pattern.exec(fullText);
    if (match) {
      const parsed = parseAnyDate(match[1]);
      if (parsed) { dueDate = parsed; break; }
    }
  }

  // Fallback: find any date pattern in the text
  if (!dueDate) {
    const rawDatePatterns = [
      /\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/g,
      /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\b/g,
      /\b([A-Za-z]+ \d{1,2},?\s*\d{4})\b/g,
    ];
    for (const pattern of rawDatePatterns) {
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(fullText)) !== null) {
        const parsed = parseAnyDate(m[1]);
        if (parsed) { dueDate = parsed; break; }
      }
      if (dueDate) break;
    }
  }

  return { amount, dueDate, isBillingCandidate };
}

function parseAnyDate(raw: string): string | null {
  try {
    const s = raw.trim();

    // YYYY/MM/DD or YYYY-MM-DD
    const ymd = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (ymd) {
      const [, y, m, d] = ymd;
      if (parseInt(m) >= 1 && parseInt(m) <= 12 && parseInt(d) >= 1 && parseInt(d) <= 31) {
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
    }

    // MM/DD/YYYY or DD/MM/YYYY
    const mdy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (mdy) {
      const [, a, b, y] = mdy;
      const ai = parseInt(a), bi = parseInt(b);
      if (ai >= 1 && ai <= 12) return `${y}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`;
      if (bi >= 1 && bi <= 12) return `${y}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`;
    }

    // "March 18, 2026" or "18 March 2026"
    const months: Record<string, string> = {
      january: '01', february: '02', march: '03', april: '04',
      may: '05', june: '06', july: '07', august: '08',
      september: '09', october: '10', november: '11', december: '12',
    };
    const named = s.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})$/);
    if (named) {
      const mo = months[named[1].toLowerCase()];
      if (mo) return `${named[3]}-${mo}-${named[2].padStart(2, '0')}`;
    }
    const named2 = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
    if (named2) {
      const mo = months[named2[2].toLowerCase()];
      if (mo) return `${named2[3]}-${mo}-${named2[1].padStart(2, '0')}`;
    }
  } catch {
    return null;
  }
  return null;
}

// ─── Merchant Name from Email ─────────────────────────────────────────────────
function extractMerchantFromEmail(from: string, subject: string): string {
  // Try display name first: "Enbridge eBilling" <ebill@enbridge.com>
  const displayName = from.match(/^"?([^"<]+)"?\s*</);
  if (displayName) {
    const name = displayName[1].trim()
      .replace(/\bnoreply\b/gi, '')
      .replace(/\bbilling\b/gi, '')
      .replace(/\bebilling\b/gi, '')
      .replace(/\bnotification\b/gi, '')
      .replace(/[^a-zA-Z0-9\s&.'\-]/g, '')
      .trim();
    if (name.length > 1) return capitalizeWords(name);
  }

  // Try extracting from email domain: ebill@enbridge.com → Enbridge
  const domainMatch = from.match(/@([a-zA-Z0-9-]+)\./);
  if (domainMatch) {
    const domain = domainMatch[1];
    const stopWords = ['mail', 'email', 'notify', 'alert', 'noreply', 'no-reply', 'billing', 'info'];
    if (!stopWords.includes(domain.toLowerCase())) {
      return capitalizeWords(domain);
    }
  }

  // Try first meaningful word from subject
  const words = subject.replace(/[^a-zA-Z\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  if (words.length > 0) return capitalizeWords(words[0]);

  return 'Unknown';
}

function capitalizeWords(s: string): string {
  return s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// ─── Provider Registry Match ──────────────────────────────────────────────────
function matchProvider(from: string, subject: string, body: string): {
  providerId: string;
  providerName: string;
  category: string;
} | null {
  const searchText = `${from} ${subject} ${body}`.toLowerCase();
  for (const [id, provider] of Object.entries(PROVIDER_REGISTRY)) {
    const name = (provider as any).name.toLowerCase();
    if (name.length > 2 && searchText.includes(name)) {
      return { providerId: id, providerName: (provider as any).name, category: (provider as any).category };
    }
  }
  return null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getHeaderValue(headers: any[], name: string): string {
  return headers?.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms: ${label}`)), ms)
  );
  return Promise.race([promise, timeout]);
}

// ─── Claude Parsing ───────────────────────────────────────────────────────────
async function parseBillWithClaude(emailText: string, subject: string, from: string): Promise<{
  merchant: string;
  amount: number | null;
  dueDate: string | null;
  accountNumber: string | null;
  confidence: 'high' | 'medium' | 'low';
  category: string;
} | null> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error({ route: '/api/gmail/sync', step: 'claudeInit', error: 'No Anthropic API key' });
      return null;
    }

    const client = new Anthropic({
      apiKey,
      baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL || undefined,
    });

    const contentToAnalyze = `From: ${from}\nSubject: ${subject}\n\n${emailText}`.slice(0, 8000);

    const response = await withTimeout(
      client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: BILL_PARSE_PROMPT + contentToAnalyze }],
      }),
      CLAUDE_TIMEOUT_MS,
      'Claude bill parsing'
    );

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const p = JSON.parse(jsonMatch[0]);
    return {
      merchant: typeof p.merchant === 'string' && p.merchant.length > 0 ? p.merchant : 'Unknown',
      amount: typeof p.amount === 'number' && p.amount > 0 ? p.amount : null,
      dueDate: typeof p.dueDate === 'string' && p.dueDate.length > 0 ? p.dueDate : null,
      accountNumber: typeof p.accountNumber === 'string' ? p.accountNumber : null,
      confidence: ['high', 'medium', 'low'].includes(p.confidence) ? p.confidence : 'low',
      category: typeof p.category === 'string' ? p.category : 'miscellaneous',
    };
  } catch (err: any) {
    console.error({ route: '/api/gmail/sync', step: 'claudeParse', error: err.message });
    return null;
  }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authResult = await verifyFirebaseToken(authHeader);
    if (!authResult.valid || !authResult.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.uid;

    // ── Get Gmail client ──
    let gmail: any;
    try {
      gmail = await withTimeout(getAuthenticatedGmailClient(userId), GMAIL_API_TIMEOUT_MS, 'getGmailClient');
    } catch (err: any) {
      console.error({ route: '/api/gmail/sync', step: 'getGmailClient', error: err.message });
      if (err.message?.includes('Gmail not connected')) {
        return NextResponse.json({ error: 'Gmail not connected. Please connect your Gmail first.' }, { status: 400 });
      }
      throw err;
    }

    // ── Search for billing emails ──
    const seenIds = new Set<string>();
    const allMessages: { id: string }[] = [];

    for (const query of buildSearchQueries()) {
      try {
        const res = await withTimeout(
          gmail.users.messages.list({ userId: 'me', q: query, maxResults: 30 }),
          GMAIL_API_TIMEOUT_MS,
          `gmail.list`
        );
        for (const msg of (res.data.messages || [])) {
          if (msg.id && !seenIds.has(msg.id)) {
            seenIds.add(msg.id);
            allMessages.push(msg);
          }
        }
      } catch (err: any) {
        console.error({ route: '/api/gmail/sync', step: 'listMessages', error: err.message });
      }
    }

    console.log({ route: '/api/gmail/sync', step: 'search', emailsFound: allMessages.length });

    if (allMessages.length === 0) {
      return NextResponse.json({
        success: true,
        scanned: 0, candidates: 0, parsed: 0, drafted: 0, skipped: 0, errors: 0,
        message: 'No billing emails found in the last 90 days. Check that billing emails are in your inbox (not spam).',
      });
    }

    // ── Process each email ──
    let scanned = 0;
    let candidates = 0;
    let parsed = 0;
    let drafted = 0;
    let skipped = 0;
    let errors = 0;

    const skippedReasons: Record<string, number> = {};

    const toProcess = allMessages.slice(0, MAX_EMAILS_TO_PROCESS);

    for (const msg of toProcess) {
      try {
        if (!msg.id) continue;
        scanned++;

        // Duplicate check
        const isDuplicate = await checkDuplicateGmailMessage(userId, msg.id);
        if (isDuplicate) {
          skipped++;
          skippedReasons['already imported'] = (skippedReasons['already imported'] || 0) + 1;
          continue;
        }

        // Fetch full message
        let fullMessage: any;
        try {
          fullMessage = await withTimeout(
            gmail.users.messages.get({ userId: 'me', id: msg.id, format: 'full' }),
            GMAIL_API_TIMEOUT_MS,
            `gmail.get(${msg.id})`
          );
        } catch (err: any) {
          errors++;
          console.error({ route: '/api/gmail/sync', step: 'getMessage', error: err.message });
          continue;
        }

        const headers = fullMessage.data.payload?.headers || [];
        const from = getHeaderValue(headers, 'From');
        const subject = getHeaderValue(headers, 'Subject');
        const date = getHeaderValue(headers, 'Date');
        const snippet = fullMessage.data.snippet || '';

        // Pre-filter: must look like a billing email
        if (!isBillingEmail(from, subject, snippet)) {
          skipped++;
          skippedReasons['not billing'] = (skippedReasons['not billing'] || 0) + 1;
          continue;
        }

        candidates++;

        // Extract text from email body
        const { text: emailText, hasPdfAttachment, pdfAttachmentId, pdfFilename } = extractEmailText(fullMessage.data.payload || {});

        // If email has a PDF and limited body text, try to extract from PDF
        let pdfText: string | null = null;
        if (hasPdfAttachment && pdfAttachmentId && emailText.length < 500) {
          pdfText = await extractPdfText(gmail, msg.id, pdfAttachmentId);
        }

        const textForParsing = (pdfText || emailText || snippet).slice(0, 10000);

        // Run regex pre-extraction (deterministic, no AI)
        const regexResult = regexExtract(subject, textForParsing);

        // Match against known providers
        const providerMatch = matchProvider(from, subject, textForParsing);

        // Try Claude for full structured extraction
        let claudeResult = await parseBillWithClaude(textForParsing, subject, from);

        // Determine final values — Claude preferred, regex as fallback, never discard
        const finalMerchant =
          providerMatch?.providerName ||
          (claudeResult?.merchant && claudeResult.merchant !== 'Unknown' ? claudeResult.merchant : null) ||
          extractMerchantFromEmail(from, subject);

        const finalAmount = claudeResult?.amount ?? regexResult.amount ?? null;
        const finalDueDate = claudeResult?.dueDate ?? regexResult.dueDate ?? null;
        const finalAccountNumber = claudeResult?.accountNumber ?? null;
        const finalCategory = providerMatch?.category || claudeResult?.category || 'miscellaneous';

        let finalConfidence: 'high' | 'medium' | 'low';
        if (finalAmount !== null && finalDueDate !== null) finalConfidence = 'high';
        else if (finalAmount !== null || finalDueDate !== null) finalConfidence = 'medium';
        else finalConfidence = 'low';

        if (claudeResult) parsed++;

        // ALWAYS store — even if amount/dueDate are null
        const pendingBill: Omit<PendingBill, 'id'> = {
          userId,
          gmailMessageId: msg.id,
          merchantName: finalMerchant,
          amount: finalAmount,
          dueDate: finalDueDate,
          accountNumber: finalAccountNumber,
          confidence: finalConfidence,
          rawEmailSnippet: snippet.slice(0, 500),
          emailSubject: subject.slice(0, 200),
          emailFrom: from.slice(0, 200),
          emailDate: date,
          status: 'pending',
          createdAt: Date.now(),
          matchedProviderId: providerMatch?.providerId,
          matchedProviderName: providerMatch?.providerName,
          category: finalCategory,
        };

        await storePendingBill(pendingBill);
        drafted++;

      } catch (err: any) {
        console.error({ route: '/api/gmail/sync', step: 'processMessage', messageId: msg.id, error: err.message });
        errors++;
      }
    }

    console.log({ route: '/api/gmail/sync', step: 'complete', scanned, candidates, parsed, drafted, skipped, errors });

    // ── Build result message ──
    let message: string;
    if (drafted > 0) {
      const fullyParsed = drafted; // all drafted, some may have null fields
      message = `Scan complete — ${drafted} new bill${drafted > 1 ? 's' : ''} added to Pending Bills (${parsed} fully parsed by AI, ${drafted - parsed} via regex/fallback). Review them to confirm details.`;
    } else if (skipped > 0 && candidates === 0) {
      message = `Scanned ${scanned} emails — all ${skipped} have already been imported previously.`;
    } else if (candidates > 0 && drafted === 0) {
      message = `Found ${candidates} billing email${candidates > 1 ? 's' : ''} but all encountered errors. Check logs.`;
    } else {
      message = `Scanned ${scanned} emails — no new billing emails detected in the last 90 days.`;
    }

    return NextResponse.json({
      success: true,
      scanned,
      candidates,
      parsed,
      drafted,
      skipped,
      errors,
      skippedReasons,
      message,
    });

  } catch (error: any) {
    console.error({ route: '/api/gmail/sync', step: 'handler', error: error.message });

    if (error.message?.includes('Gmail not connected')) {
      return NextResponse.json({ error: 'Gmail not connected. Please connect your Gmail first.' }, { status: 400 });
    }
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return NextResponse.json({ error: 'Gmail access expired. Please reconnect your Gmail.' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to scan Gmail bills' }, { status: 500 });
  }
}
