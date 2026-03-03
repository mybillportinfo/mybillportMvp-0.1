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

const BILL_PARSE_PROMPT = `You are a bill parser. Extract the following from this email content:
- merchant (the company name, clean official name)
- amount (total amount due as a number, without currency symbol, null if not found)
- dueDate (in YYYY-MM-DD format, null if not found)
- accountNumber (if present, else null)
- confidence (high, medium, or low based on how clearly the data was found)
- category (one of: utilities, telecom, government, insurance, banking, credit_cards, housing, transportation, education, subscriptions, property, miscellaneous)

Return ONLY a JSON object with these exact fields. No markdown, no explanation.
Example: {"merchant":"Rogers","amount":89.50,"dueDate":"2026-03-15","accountNumber":"1234567890","confidence":"high","category":"telecom"}

Rules:
- For amount: only use the FINAL total (Amount Due, Total Due, Balance Due). Ignore subtotals.
- For dueDate: normalize any date format to YYYY-MM-DD
- For merchant: use the clean company name (e.g. "Netflix" not "Netflix Inc billing@netflix.com")
- If a field cannot be determined, use null

Email content:
`;

function buildSearchQueries(): string[] {
  return [
    'subject:(invoice OR bill OR statement OR receipt) newer_than:90d',
    'subject:("amount due" OR "payment due" OR "due date" OR "billing notice" OR "your bill") newer_than:90d',
    'subject:("account statement" OR "billing statement" OR "payment reminder" OR "balance due") newer_than:90d',
    'subject:(subscription OR renewal OR "auto-pay" OR autopay) newer_than:90d',
  ];
}

function isBillingEmail(from: string, subject: string, snippet: string): boolean {
  const text = `${from} ${subject} ${snippet}`.toLowerCase();
  const billingKeywords = [
    'invoice', 'bill', 'statement', 'receipt', 'payment', 'amount due',
    'balance due', 'due date', 'billing', 'subscription', 'renewal',
    'account summary', 'charges', 'total due', 'pay now', 'autopay',
    'auto-pay', 'overdue', 'reminder',
  ];
  return billingKeywords.some(kw => text.includes(kw));
}

function extractEmailText(payload: any): string {
  let plainText = '';
  let htmlText = '';

  function traverse(part: any) {
    if (!part) return;

    if (part.mimeType === 'text/plain' && part.body?.data) {
      plainText += Buffer.from(part.body.data, 'base64url').toString('utf-8') + '\n';
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      const html = Buffer.from(part.body.data, 'base64url').toString('utf-8');
      htmlText += html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim() + '\n';
    } else if (part.body?.data && !part.mimeType?.startsWith('image')) {
      plainText += Buffer.from(part.body.data, 'base64url').toString('utf-8') + '\n';
    }

    if (part.parts) {
      for (const subPart of part.parts) traverse(subPart);
    }
  }

  traverse(payload);

  const result = plainText.trim() || htmlText.trim();
  return result.slice(0, 8000);
}

function getHeaderValue(headers: any[], name: string): string {
  const header = headers?.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
  return header?.value || '';
}

function extractDomainFromEmail(from: string): string {
  const match = from.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  return match ? match[1].toLowerCase() : '';
}

function matchProvider(from: string, subject: string, body: string): {
  providerId: string;
  providerName: string;
  category: string;
} | null {
  const searchText = `${from} ${subject} ${body}`.toLowerCase();
  for (const [id, provider] of Object.entries(PROVIDER_REGISTRY)) {
    const name = provider.name.toLowerCase();
    if (searchText.includes(name)) {
      return { providerId: id, providerName: provider.name, category: provider.category };
    }
  }
  return null;
}

function extractMerchantFromEmail(from: string, subject: string): string {
  const nameMatch = from.match(/^"?([^"<@]+)"?\s*</);
  if (nameMatch) {
    const name = nameMatch[1].trim().replace(/[^a-zA-Z0-9\s&.'-]/g, '').trim();
    if (name && name.length > 1) return name;
  }
  const domain = extractDomainFromEmail(from);
  if (domain) {
    return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
  }
  return 'Unknown';
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms: ${label}`)), ms)
  );
  return Promise.race([promise, timeout]);
}

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

    const contentToAnalyze = `From: ${from}\nSubject: ${subject}\n\n${emailText}`.slice(0, 6000);

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

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      merchant: parsed.merchant || 'Unknown',
      amount: typeof parsed.amount === 'number' && parsed.amount > 0 ? parsed.amount : null,
      dueDate: parsed.dueDate || null,
      accountNumber: parsed.accountNumber || null,
      confidence: ['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'low',
      category: parsed.category || 'miscellaneous',
    };
  } catch (error: any) {
    console.error({ route: '/api/gmail/sync', step: 'claudeParse', error: error.message });
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authResult = await verifyFirebaseToken(authHeader);

    if (!authResult.valid || !authResult.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.uid;

    let gmail: any;
    try {
      gmail = await withTimeout(
        getAuthenticatedGmailClient(userId),
        GMAIL_API_TIMEOUT_MS,
        'getAuthenticatedGmailClient'
      );
    } catch (err: any) {
      console.error({ route: '/api/gmail/sync', step: 'getGmailClient', error: err.message });
      if (err.message?.includes('Gmail not connected')) {
        return NextResponse.json({ error: 'Gmail not connected. Please connect your Gmail first.' }, { status: 400 });
      }
      throw err;
    }

    const seenMessageIds = new Set<string>();
    const allMessages: { id: string }[] = [];

    for (const query of buildSearchQueries()) {
      try {
        const listResponse = await withTimeout(
          gmail.users.messages.list({ userId: 'me', q: query, maxResults: 25 }),
          GMAIL_API_TIMEOUT_MS,
          `gmail.list: ${query.slice(0, 40)}`
        );
        const msgs = listResponse.data.messages || [];
        for (const msg of msgs) {
          if (msg.id && !seenMessageIds.has(msg.id)) {
            seenMessageIds.add(msg.id);
            allMessages.push(msg);
          }
        }
      } catch (err: any) {
        console.error({ route: '/api/gmail/sync', step: 'listMessages', query: query.slice(0, 50), error: err.message });
      }
    }

    console.log({ route: '/api/gmail/sync', step: 'search', totalFound: allMessages.length });

    if (allMessages.length === 0) {
      return NextResponse.json({
        success: true,
        found: 0,
        added: 0,
        skipped: 0,
        errors: 0,
        message: 'No billing emails found in your Gmail in the last 90 days. Make sure your billing emails are in your inbox and not spam.',
      });
    }

    let added = 0;
    let skipped = 0;
    let errors = 0;
    const results: { merchant: string; amount: number | null; status: string }[] = [];

    for (const msg of allMessages.slice(0, 50)) {
      try {
        if (!msg.id) continue;

        const isDuplicate = await checkDuplicateGmailMessage(userId, msg.id);
        if (isDuplicate) { skipped++; continue; }

        let fullMessage: any;
        try {
          fullMessage = await withTimeout(
            gmail.users.messages.get({ userId: 'me', id: msg.id, format: 'full' }),
            GMAIL_API_TIMEOUT_MS,
            `gmail.get(${msg.id})`
          );
        } catch (err: any) {
          console.error({ route: '/api/gmail/sync', step: 'getMessage', messageId: msg.id, error: err.message });
          errors++;
          continue;
        }

        const headers = fullMessage.data.payload?.headers || [];
        const from = getHeaderValue(headers, 'From');
        const subject = getHeaderValue(headers, 'Subject');
        const date = getHeaderValue(headers, 'Date');
        const snippet = fullMessage.data.snippet || '';

        if (!isBillingEmail(from, subject, snippet)) {
          skipped++;
          continue;
        }

        const emailText = extractEmailText(fullMessage.data.payload || {});
        const textForParsing = emailText || snippet;

        if (!textForParsing) { skipped++; continue; }

        const providerMatch = matchProvider(from, subject, textForParsing);

        let parsed = await parseBillWithClaude(textForParsing, subject, from);

        if (!parsed) {
          parsed = {
            merchant: providerMatch?.providerName || extractMerchantFromEmail(from, subject),
            amount: null,
            dueDate: null,
            accountNumber: null,
            confidence: 'low',
            category: providerMatch?.category || 'miscellaneous',
          };
        }

        const pendingBill: Omit<PendingBill, 'id'> = {
          userId,
          gmailMessageId: msg.id,
          merchantName: providerMatch?.providerName || parsed.merchant,
          amount: parsed.amount,
          dueDate: parsed.dueDate,
          accountNumber: parsed.accountNumber,
          confidence: parsed.confidence,
          rawEmailSnippet: snippet.slice(0, 500),
          emailSubject: subject.slice(0, 200),
          emailFrom: from.slice(0, 200),
          emailDate: date,
          status: 'pending',
          createdAt: Date.now(),
          matchedProviderId: providerMatch?.providerId,
          matchedProviderName: providerMatch?.providerName,
          category: providerMatch?.category || parsed.category,
        };

        await storePendingBill(pendingBill);
        added++;
        results.push({
          merchant: pendingBill.merchantName,
          amount: pendingBill.amount,
          status: parsed.confidence,
        });
      } catch (msgError: any) {
        console.error({ route: '/api/gmail/sync', step: 'processMessage', messageId: msg.id, error: msgError.message });
        errors++;
      }
    }

    console.log({ route: '/api/gmail/sync', step: 'complete', found: allMessages.length, added, skipped, errors });

    let message: string;
    if (added > 0) {
      message = `Found ${added} new bill${added > 1 ? 's' : ''} in your Gmail. Review them in Pending Bills.`;
    } else if (skipped > 0 && added === 0) {
      message = `Scanned ${allMessages.length} billing emails — all have already been processed previously.`;
    } else {
      message = `Scanned ${allMessages.length} emails but could not extract bill details. Try again or add bills manually.`;
    }

    return NextResponse.json({
      success: true,
      found: allMessages.length,
      added,
      skipped,
      errors,
      results,
      message,
    });
  } catch (error: any) {
    console.error({ route: '/api/gmail/sync', step: 'handler', error: error.message, stack: error.stack });

    if (error.message?.includes('Gmail not connected')) {
      return NextResponse.json({ error: 'Gmail not connected. Please connect your Gmail first.' }, { status: 400 });
    }
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return NextResponse.json({ error: 'Gmail access expired. Please reconnect your Gmail.' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to sync Gmail bills' }, { status: 500 });
  }
}
