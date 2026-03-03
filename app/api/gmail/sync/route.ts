import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../../lib/authVerify';
import {
  getAuthenticatedGmailClient,
  checkDuplicateGmailMessage,
  storePendingBill,
  PendingBill,
} from '../../../lib/gmailService';
import { PROVIDER_REGISTRY } from '../../../lib/providerRegistry';
import { extractWithRegex } from '../../../lib/extractWithRegex';
import { computeConfidence, scoreToLabel, detectionMethod, ExtractionSources } from '../../../lib/confidenceScorer';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const maxDuration = 60;

const GMAIL_API_TIMEOUT_MS = 15000;
const CLAUDE_TIMEOUT_MS = 25000;
const MAX_EMAILS_TO_PROCESS = 150;

// ─── Claude Prompt ────────────────────────────────────────────────────────────
const AI_PROMPT = `You are an expert billing data extractor. Given the email content, return a JSON object with these exact fields:

- billerName: Clean company name (e.g. "Enbridge", "Rogers", "Bell"). Use sender name/domain if unclear.
- accountNumber: Customer account or reference number. May contain spaces or dashes — extract as-is. Use null if not found.
- amountDue: The CURRENT amount owed as a plain number. Prefer labels: "Amount Due", "New Bill Amount", "Current Charges", "Payment Due". Do NOT use balance, previous balance, or credit. null if not found.
- dueDate: Payment due date as YYYY-MM-DD. Look for "Due Date", "Pay By", "Payment Due". null if not found.
- statementDate: Date the statement was issued as YYYY-MM-DD. null if not found.
- minimumPayment: Minimum payment amount as a number. null if not present.
- totalBalance: Total account balance as a number (if different from amountDue). null if not present.
- currency: "CAD" unless explicitly stated otherwise.
- category: One of: utilities, telecom, government, insurance, banking, credit_cards, housing, transportation, education, subscriptions, property, miscellaneous

Rules:
- Return ONLY valid JSON. No markdown, no explanation.
- If a field is not present, use null.
- Account numbers may be partially masked (e.g., ****1234) — extract the visible part.
- Prefer specificity: "Enbridge Gas" → "Enbridge"

EMAIL:
`;

// ─── Gmail Search Queries ─────────────────────────────────────────────────────
function buildSearchQueries(): string[] {
  return [
    'subject:(invoice OR bill OR statement OR receipt) newer_than:90d',
    'subject:("amount due" OR "payment due" OR "due date" OR "billing notice" OR "your bill") newer_than:90d',
    'subject:("account statement" OR "billing statement" OR "payment reminder" OR "balance due") newer_than:90d',
    'subject:(subscription OR renewal OR "auto-pay" OR autopay) newer_than:90d',
    'subject:(ebill OR "e-bill" OR "new bill" OR "current bill" OR "account summary") newer_than:90d',
    'subject:(overdue OR "past due" OR "final notice" OR "payment confirmation") newer_than:90d',
    '("due date" OR "amount due" OR "payment due" OR "balance due") newer_than:90d',
    '("bill" OR "invoice") ("due" OR "amount") newer_than:90d',
    'in:inbox newer_than:30d',
  ];
}

// ─── Billing Email Pre-filter ─────────────────────────────────────────────────
function isBillingEmail(from: string, subject: string, snippet: string, body: string): boolean {
  const text = `${from} ${subject} ${snippet} ${body.slice(0, 500)}`.toLowerCase();
  const keywords = [
    'invoice', 'bill', 'statement', 'receipt', 'payment', 'amount due',
    'balance due', 'due date', 'billing', 'subscription', 'renewal',
    'account summary', 'charges', 'total due', 'pay now', 'autopay',
    'auto-pay', 'overdue', 'reminder', 'ebill', 'e-bill', 'new bill',
    'current charges', 'pay by', 'payment due', 'final notice',
  ];
  return keywords.some(kw => text.includes(kw));
}

// ─── HTML → Plain Text ────────────────────────────────────────────────────────
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
    .replace(/&[a-zA-Z0-9]+;/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Extract Email Body Text ──────────────────────────────────────────────────
function extractEmailText(payload: any): string {
  let plainText = '';
  let htmlText = '';

  function traverse(part: any) {
    if (!part) return;
    const mime = (part.mimeType || '').toLowerCase();
    if (mime === 'text/plain' && part.body?.data) {
      plainText += Buffer.from(part.body.data, 'base64url').toString('utf-8') + '\n';
    } else if (mime === 'text/html' && part.body?.data) {
      htmlText += htmlToText(Buffer.from(part.body.data, 'base64url').toString('utf-8')) + '\n';
    }
    if (part.parts) for (const sub of part.parts) traverse(sub);
  }

  traverse(payload);
  return (plainText.trim() || htmlText.trim()).slice(0, 10000);
}

// ─── Extract Sender Domain ────────────────────────────────────────────────────
function extractDomain(from: string): string | null {
  const m = from.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  return m ? m[1].toLowerCase() : null;
}

// ─── Extract Display Name from From Header ────────────────────────────────────
function extractSenderName(from: string): string {
  const display = from.match(/^"?([^"<]+)"?\s*</);
  if (display) {
    const name = display[1].trim()
      .replace(/\bnoreply\b|\bno-reply\b|\bbilling\b|\bebilling\b|\bnotification\b|\balert\b/gi, '')
      .replace(/[^a-zA-Z0-9\s&.'\-]/g, '')
      .trim();
    if (name.length > 1) return capitalise(name);
  }
  const domain = extractDomain(from);
  if (domain) {
    const parts = domain.split('.');
    const label = parts[0];
    const skip = ['mail', 'email', 'notify', 'alerts', 'noreply', 'info', 'billing'];
    const chosen = skip.includes(label) && parts.length > 1 ? parts[1] : label;
    return capitalise(chosen);
  }
  return 'Unknown';
}

function capitalise(s: string): string {
  return s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// ─── Provider Registry Match ──────────────────────────────────────────────────
function matchProvider(from: string, subject: string, body: string): {
  providerId: string; providerName: string; category: string;
} | null {
  const text = `${from} ${subject} ${body.slice(0, 2000)}`.toLowerCase();
  for (const [id, p] of Object.entries(PROVIDER_REGISTRY)) {
    const name = (p as any).name.toLowerCase();
    if (name.length > 2 && text.includes(name)) {
      return { providerId: id, providerName: (p as any).name, category: (p as any).category };
    }
  }
  return null;
}

// ─── Timeout Wrapper ─────────────────────────────────────────────────────────
async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  const t = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms)
  );
  return Promise.race([promise, t]);
}

// ─── Claude AI Extraction ─────────────────────────────────────────────────────
interface AIResult {
  billerName: string | null;
  accountNumber: string | null;
  amountDue: number | null;
  dueDate: string | null;
  statementDate: string | null;
  minimumPayment: number | null;
  totalBalance: number | null;
  currency: string;
  category: string;
}

async function extractWithAI(emailText: string, from: string, subject: string): Promise<AIResult | null> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
    if (!apiKey) return null;

    const client = new Anthropic({
      apiKey,
      baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL || undefined,
    });

    const content = `From: ${from}\nSubject: ${subject}\n\n${emailText}`.slice(0, 8000);

    const response = await withTimeout(
      client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 600,
        messages: [{ role: 'user', content: AI_PROMPT + content }],
      }),
      CLAUDE_TIMEOUT_MS,
      'Claude extraction'
    );

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const p = JSON.parse(jsonMatch[0]);
    return {
      billerName: typeof p.billerName === 'string' ? p.billerName.trim() : null,
      accountNumber: typeof p.accountNumber === 'string' ? p.accountNumber.trim() : null,
      amountDue: typeof p.amountDue === 'number' && p.amountDue > 0 ? p.amountDue : null,
      dueDate: typeof p.dueDate === 'string' && p.dueDate.length > 0 ? p.dueDate : null,
      statementDate: typeof p.statementDate === 'string' && p.statementDate.length > 0 ? p.statementDate : null,
      minimumPayment: typeof p.minimumPayment === 'number' && p.minimumPayment > 0 ? p.minimumPayment : null,
      totalBalance: typeof p.totalBalance === 'number' && p.totalBalance > 0 ? p.totalBalance : null,
      currency: typeof p.currency === 'string' ? p.currency : 'CAD',
      category: typeof p.category === 'string' ? p.category : 'miscellaneous',
    };
  } catch (err: any) {
    console.error({ route: '/api/gmail/sync', step: 'AI', error: err.message });
    return null;
  }
}

// ─── Get Header Value ─────────────────────────────────────────────────────────
function header(headers: any[], name: string): string {
  return headers?.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyFirebaseToken(request.headers.get('authorization'));
    if (!authResult.valid || !authResult.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authResult.uid;

    // Get Gmail client
    let gmail: any;
    try {
      gmail = await withTimeout(getAuthenticatedGmailClient(userId), GMAIL_API_TIMEOUT_MS, 'getGmailClient');
    } catch (err: any) {
      if (err.message?.includes('Gmail not connected')) {
        return NextResponse.json({ error: 'Gmail not connected. Please connect your Gmail first.' }, { status: 400 });
      }
      throw err;
    }

    // Search for billing emails across all queries, deduplicating by message ID
    const seenIds = new Set<string>();
    const allMessages: { id: string }[] = [];

    for (const query of buildSearchQueries()) {
      try {
        const res = await withTimeout(
          gmail.users.messages.list({ userId: 'me', q: query, maxResults: 30 }),
          GMAIL_API_TIMEOUT_MS,
          'gmail.list'
        ) as any;
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

    if (allMessages.length === 0) {
      return NextResponse.json({
        success: true, scanned: 0, candidates: 0, parsed: 0, drafted: 0,
        skipped: 0, errors: 0,
        message: 'No billing emails found in the last 90 days. Check your inbox is not empty or in spam.',
      });
    }

    let scanned = 0, candidates = 0, aiParsed = 0, drafted = 0, skipped = 0, errors = 0;

    for (const msg of allMessages.slice(0, MAX_EMAILS_TO_PROCESS)) {
      try {
        if (!msg.id) continue;
        scanned++;

        // Duplicate check
        if (await checkDuplicateGmailMessage(userId, msg.id)) { skipped++; continue; }

        // Fetch full message
        let full: any;
        try {
          full = await withTimeout(
            gmail.users.messages.get({ userId: 'me', id: msg.id, format: 'full' }),
            GMAIL_API_TIMEOUT_MS,
            `gmail.get`
          ) as any;
        } catch (err: any) {
          errors++; continue;
        }

        const headers = full.data.payload?.headers || [];
        const from    = header(headers, 'From');
        const subject = header(headers, 'Subject');
        const date    = header(headers, 'Date');
        const snippet = full.data.snippet || '';
        const body    = extractEmailText(full.data.payload || {});
        const text    = (body || snippet).slice(0, 10000);

        // Pre-filter: must look like a billing email
        if (!isBillingEmail(from, subject, snippet, body)) { skipped++; continue; }
        candidates++;

        // ── Step 1: Deterministic regex extraction ──
        const regex = extractWithRegex(text);

        // ── Step 2: Provider registry match ──
        const provider = matchProvider(from, subject, text);

        // ── Step 3: AI extraction for fields not found by regex ──
        const needsAI = !regex.amountDue || !regex.dueDate || !regex.accountNumber;
        let ai: AIResult | null = null;
        if (needsAI) {
          ai = await extractWithAI(text, from, subject);
          if (ai) aiParsed++;
        }

        // ── Step 4: Merge — regex takes priority, AI fills gaps ──
        const finalAmount      = regex.amountDue      ?? ai?.amountDue      ?? null;
        const finalDueDate     = regex.dueDate        ?? ai?.dueDate        ?? null;
        const finalAccountNum  = regex.accountNumber  ?? ai?.accountNumber  ?? null;
        // Display: prefer regex's space-preserved format; fall back to cleaned or AI
        const finalAccountNumDisplay = regex.accountNumberDisplay ?? regex.accountNumber ?? ai?.accountNumber ?? null;
        const finalStmtDate    = regex.statementDate  ?? ai?.statementDate  ?? null;
        const finalMinPayment  = regex.minimumPayment ?? ai?.minimumPayment ?? null;
        const finalTotalBal    = regex.totalBalance   ?? ai?.totalBalance   ?? null;

        const finalMerchant =
          provider?.providerName ||
          (ai?.billerName && ai.billerName !== 'Unknown' ? ai.billerName : null) ||
          extractSenderName(from);

        const finalCategory = provider?.category || ai?.category || 'miscellaneous';
        const finalCurrency = ai?.currency || 'CAD';
        const billerDomain  = extractDomain(from);

        // ── Step 5: Confidence scoring ──
        const sources: ExtractionSources = {
          amountFromRegex:   regex.amountDue !== null,
          amountFromAI:      ai?.amountDue != null && regex.amountDue === null,
          dateFromRegex:     regex.dueDate !== null,
          dateFromAI:        ai?.dueDate != null && regex.dueDate === null,
          accountFromRegex:  regex.accountNumber !== null,
          accountFromAI:     ai?.accountNumber != null && regex.accountNumber === null,
          billerFromRegistry: !!provider,
        };

        const score  = computeConfidence({ amountDue: finalAmount, dueDate: finalDueDate, accountNumber: finalAccountNum, billerName: finalMerchant }, sources);
        const label  = scoreToLabel(score);
        const method = detectionMethod(sources);

        // ── Step 6: Store — always, even if fields are incomplete ──
        const pendingBill: Omit<PendingBill, 'id'> = {
          userId,
          gmailMessageId: msg.id,
          merchantName: finalMerchant,
          billerDomain,
          amount: finalAmount,
          dueDate: finalDueDate,
          accountNumber: finalAccountNum,
          accountNumberDisplay: finalAccountNumDisplay,
          statementDate: finalStmtDate,
          minimumPayment: finalMinPayment,
          totalBalance: finalTotalBal,
          currency: finalCurrency,
          confidence: label,
          confidenceScore: score,
          detectionMethod: method,
          rawEmailSnippet: snippet.slice(0, 500),
          emailSubject: subject.slice(0, 200),
          emailFrom: from.slice(0, 200),
          emailDate: date,
          status: 'pending',
          createdAt: Date.now(),
          matchedProviderId: provider?.providerId,
          matchedProviderName: provider?.providerName,
          category: finalCategory,
        };

        await storePendingBill(pendingBill);
        drafted++;

        console.log({
          route: '/api/gmail/sync', step: 'stored',
          merchant: finalMerchant, score, method,
          amount: finalAmount, dueDate: finalDueDate, accountNumber: finalAccountNum,
        });

      } catch (err: any) {
        console.error({ route: '/api/gmail/sync', step: 'processMsg', error: err.message });
        errors++;
      }
    }

    console.log({ route: '/api/gmail/sync', step: 'complete', scanned, candidates, aiParsed, drafted, skipped, errors });

    let message: string;
    if (drafted > 0) {
      message = `Scan complete — ${drafted} new bill${drafted > 1 ? 's' : ''} added to Pending Bills (${aiParsed} AI-parsed, ${drafted - aiParsed} regex-only). Review and confirm them.`;
    } else if (skipped > 0 && candidates === 0) {
      message = `Scanned ${scanned} emails — all ${skipped} were already imported previously.`;
    } else if (candidates > 0 && drafted === 0) {
      message = `Found ${candidates} billing emails but encountered errors storing them.`;
    } else {
      message = `Scanned ${scanned} emails — no new billing emails detected in the last 90 days.`;
    }

    return NextResponse.json({ success: true, scanned, candidates, aiParsed, drafted, skipped, errors, message });

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
