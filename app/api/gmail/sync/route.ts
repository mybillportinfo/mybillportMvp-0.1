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

const BILL_PARSE_PROMPT = `You are a bill parser for Canadian bills. Extract the following from this email content:
- merchant (the company name, clean official name)
- amount (total amount due as a number, without currency symbol, null if not found)
- dueDate (in YYYY-MM-DD format, null if not found)
- accountNumber (if present, else null)
- confidence (high, medium, or low based on how clearly the data was found)
- category (one of: utilities, telecom, government, insurance, banking, credit_cards, housing, transportation, education, subscriptions, property, miscellaneous)

Return ONLY a JSON object with these exact fields. No markdown, no explanation.
Example: {"merchant":"Bell Canada","amount":89.50,"dueDate":"2026-03-15","accountNumber":"1234567890","confidence":"high","category":"telecom"}

If a field cannot be determined, use null. For amount, only use the final "Total Due" or "Amount Due", not subtotals.
Canadian bills may use DD/MM/YYYY format - normalize to YYYY-MM-DD.

Email content:
`;

function buildBillerSearchQuery(): string {
  const billerNames: string[] = [];
  const billerDomains: string[] = [];

  for (const [, provider] of Object.entries(PROVIDER_REGISTRY)) {
    billerNames.push(provider.name.toLowerCase());
  }

  const commonDomains = [
    'torontohydro.com', 'hydroone.com', 'hydroottawa.com', 'hydroquebec.com',
    'bchydro.com', 'enmax.com', 'epcor.com', 'hydro.mb.ca', 'saskpower.com',
    'nbpower.com', 'nspower.com', 'enbridgegas.com', 'fortisbc.com',
    'bell.ca', 'rogers.com', 'telus.com', 'fido.ca', 'koodo.com',
    'virginplus.ca', 'freedommobile.ca', 'videotron.com', 'sasktel.com',
    'td.com', 'rbc.com', 'bmo.com', 'scotiabank.com', 'cibc.com',
    'nbc.ca', 'tangerine.ca', 'simplii.com', 'pcfinancial.ca',
    'sunlife.ca', 'manulife.ca', 'greatswest.com', 'canadapost.ca',
    'canadalife.com', 'intact.net', 'desjardins.com', 'wawanesa.com',
    'cooperators.ca', 'insurancecompany.ca',
    'netflix.com', 'spotify.com', 'disney.com', 'amazon.ca', 'apple.com',
    'costco.ca', 'canadiantire.ca',
  ];
  billerDomains.push(...commonDomains);

  const keywords = [
    'bill', 'invoice', 'statement', 'payment due', 'amount due',
    'your bill is ready', 'account statement', 'billing statement',
    'payment reminder', 'balance due',
  ];

  const fromParts = billerDomains.slice(0, 30).map(d => `from:${d}`);
  const subjectParts = keywords.slice(0, 5).map(k => `subject:${k}`);

  return `(${fromParts.join(' OR ')} OR ${subjectParts.join(' OR ')}) newer_than:30d`;
}

function extractEmailText(payload: any): string {
  let text = '';

  if (payload.body?.data) {
    text += Buffer.from(payload.body.data, 'base64url').toString('utf-8');
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text += Buffer.from(part.body.data, 'base64url').toString('utf-8');
      } else if (part.mimeType === 'text/html' && part.body?.data && !text) {
        const html = Buffer.from(part.body.data, 'base64url').toString('utf-8');
        text += html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      } else if (part.parts) {
        text += extractEmailText(part);
      }
    }
  }

  return text.slice(0, 8000);
}

function getHeaderValue(headers: any[], name: string): string {
  const header = headers?.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
  return header?.value || '';
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
      return {
        providerId: id,
        providerName: provider.name,
        category: provider.category,
      };
    }
  }

  return null;
}

async function parseBillWithClaude(emailText: string, subject: string): Promise<{
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
      console.error('No Anthropic API key available for bill parsing');
      return null;
    }

    const client = new Anthropic({
      apiKey,
      baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL || undefined,
    });

    const contentToAnalyze = `Subject: ${subject}\n\n${emailText}`.slice(0, 6000);

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: BILL_PARSE_PROMPT + contentToAnalyze,
      }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      merchant: parsed.merchant || 'Unknown',
      amount: typeof parsed.amount === 'number' ? parsed.amount : null,
      dueDate: parsed.dueDate || null,
      accountNumber: parsed.accountNumber || null,
      confidence: ['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'low',
      category: parsed.category || 'miscellaneous',
    };
  } catch (error) {
    console.error('Claude parsing error:', error);
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
    const gmail = await getAuthenticatedGmailClient(userId);

    const searchQuery = buildBillerSearchQuery();
    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults: 20,
    });

    const messages = listResponse.data.messages || [];
    if (messages.length === 0) {
      return NextResponse.json({
        success: true,
        found: 0,
        added: 0,
        skipped: 0,
        message: 'No bill emails found in your Gmail. We searched the last 30 days for emails from known Canadian billers.',
      });
    }

    let added = 0;
    let skipped = 0;
    let errors = 0;
    const results: { merchant: string; amount: number | null; status: string }[] = [];

    for (const msg of messages) {
      try {
        if (!msg.id) continue;

        const isDuplicate = await checkDuplicateGmailMessage(userId, msg.id);
        if (isDuplicate) {
          skipped++;
          continue;
        }

        const fullMessage = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full',
        });

        const headers = fullMessage.data.payload?.headers || [];
        const from = getHeaderValue(headers, 'From');
        const subject = getHeaderValue(headers, 'Subject');
        const date = getHeaderValue(headers, 'Date');
        const snippet = fullMessage.data.snippet || '';

        const emailText = extractEmailText(fullMessage.data.payload || {});
        if (!emailText && !snippet) {
          skipped++;
          continue;
        }

        const providerMatch = matchProvider(from, subject, emailText || snippet);

        const parsed = await parseBillWithClaude(emailText || snippet, subject);
        if (!parsed) {
          errors++;
          continue;
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
          status: 'added',
        });
      } catch (msgError) {
        console.error('Error processing message:', msgError);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      found: messages.length,
      added,
      skipped,
      errors,
      results,
      message: added > 0
        ? `Found ${added} new bill${added > 1 ? 's' : ''} in your Gmail. Review them in Pending Bills.`
        : 'No new bills found. All previously found bills have already been processed.',
    });
  } catch (error: any) {
    console.error('Gmail sync error:', error);

    if (error.message?.includes('Gmail not connected')) {
      return NextResponse.json({ error: 'Gmail not connected. Please connect your Gmail first.' }, { status: 400 });
    }
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return NextResponse.json({ error: 'Gmail access expired. Please reconnect your Gmail.' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to sync Gmail bills' }, { status: 500 });
  }
}
