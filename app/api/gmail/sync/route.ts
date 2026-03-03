import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../../lib/authVerify';
import {
  getAuthenticatedGmailClient,
  checkDuplicateGmailMessage,
  storePendingBill,
  fetchExistingPendingMerchantKeys,
  buildMerchantKey,
  PendingBill,
} from '../../../lib/gmailService';
import { PROVIDER_REGISTRY } from '../../../lib/providerRegistry';
import { extractWithRegex } from '../../../lib/extractWithRegex';
import { computeConfidence, scoreToLabel, detectionMethod, ExtractionSources } from '../../../lib/confidenceScorer';
import { validateExtractedFields, getRoutingAction } from '../../../lib/validation';
import { classifyEmail, EmailType } from '../../../lib/emailClassifier';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const maxDuration = 60;

const GMAIL_API_TIMEOUT_MS = 15000;
const CLAUDE_TIMEOUT_MS = 25000;
const MAX_EMAILS_TO_PROCESS = 150;

// ─── Claude Prompt ────────────────────────────────────────────────────────────
// Layer 2: AI Fallback with per-field confidence scores.
// Each extracted field includes a confidence value (0.0–1.0):
//   0.90–1.00 = found with an explicit label in the email
//   0.65–0.89 = inferred from context
//   0.40–0.64 = uncertain / partial match
const AI_PROMPT = `You are an expert billing data extractor. Analyze the email and return EXACTLY this JSON structure.
Use null for any missing field. For each found field, include a confidence score (0.0–1.0).

{
  "billerName": "string",
  "accountNumber": { "value": "cleaned-no-spaces", "original": "as-found-in-email", "confidence": 0.0 } | null,
  "amountDue":     { "value": 0.00, "confidence": 0.0 } | null,
  "dueDate":       { "value": "YYYY-MM-DD", "confidence": 0.0 } | null,
  "statementDate": { "value": "YYYY-MM-DD", "confidence": 0.0 } | null,
  "minimumPayment":{ "value": 0.00, "confidence": 0.0 } | null,
  "totalBalance":  { "value": 0.00, "confidence": 0.0 } | null,
  "currency": "CAD",
  "category": "utilities|telecom|government|insurance|banking|credit_cards|housing|transportation|education|subscriptions|property|miscellaneous",
  "reasoning": "one sentence explaining key extraction decisions"
}

Confidence guide:
  0.90 = field found with explicit label ("Amount Due: $80.81")
  0.70 = field inferred from context ("Your bill is $80.81")
  0.45 = uncertain, partial, or ambiguous match

Rules:
- Return ONLY valid JSON. No markdown, no extra text.
- billerName: use sender display name / domain if company name unclear.
- accountNumber.value: remove all spaces and dashes from the raw number.
- amountDue: PREFER labels "Amount Due", "New Bill Amount", "Current Charges", "Payment Due".
  NEVER use "previous balance", "balance forward", or credit amounts.
- Account numbers may have spaces ("91 00 64 33899 2") — clean for value, keep original in original.
- If same field appears multiple times, use the one with the highest confidence.

EMAIL:
`;

// ─── Gmail Search Queries ─────────────────────────────────────────────────────
function buildSearchQueries(): string[] {
  return [
    'subject:(invoice OR bill OR statement OR receipt) newer_than:60d',
    'subject:("amount due" OR "payment due" OR "due date" OR "billing notice" OR "your bill") newer_than:60d',
    'subject:("account statement" OR "billing statement" OR "payment reminder" OR "balance due") newer_than:60d',
    'subject:(subscription OR renewal OR "auto-pay" OR autopay) newer_than:60d',
    'subject:(ebill OR "e-bill" OR "new bill" OR "current bill" OR "account summary") newer_than:60d',
    'subject:(overdue OR "past due" OR "final notice" OR "payment confirmation") newer_than:60d',
    '("due date" OR "amount due" OR "payment due" OR "balance due") newer_than:60d',
    '("bill" OR "invoice") ("due" OR "amount") newer_than:60d',
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
// Handles subdomains like myaccount.rogers.com → "Rogers"
const SKIP_SUBDOMAINS = new Set([
  'mail', 'email', 'notify', 'alerts', 'noreply', 'no-reply', 'info',
  'billing', 'ebilling', 'myaccount', 'account', 'accounts', 'notifications',
  'auto', 'secure', 'donotreply', 'do-not-reply', 'service', 'help',
  'support', 'mailer', 'postmaster', 'reply', 'statement', 'statements',
  'invoices', 'invoice', 'payment', 'payments', 'news', 'hello', 'contact',
]);

function extractSenderName(from: string): string {
  // Try display name part of "Display Name <email@domain.com>"
  const display = from.match(/^"?([^"<]+)"?\s*</);
  if (display) {
    const name = display[1].trim()
      .replace(/\bnoreply\b|\bno-reply\b|\bbilling\b|\bebilling\b|\bnotification\b|\balert\b/gi, '')
      .replace(/[^a-zA-Z0-9\s&.'\-]/g, '')
      .trim();
    if (name.length > 1) return capitalise(name);
  }

  // Fall back to domain — skip generic subdomains to find the real brand name
  const domain = extractDomain(from);
  if (domain) {
    // e.g. "myaccount.rogers.com" → ['myaccount', 'rogers', 'com'] → remove TLD → ['myaccount', 'rogers']
    const partsNoTld = domain.split('.').slice(0, -1);
    // Find first segment that is not a generic subdomain prefix
    const chosen = partsNoTld.find(p => !SKIP_SUBDOMAINS.has(p.toLowerCase()))
      ?? partsNoTld[partsNoTld.length - 1]
      ?? domain;
    return capitalise(chosen);
  }
  return 'Unknown';
}

function capitalise(s: string): string {
  return s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// ─── Provider Registry Match ──────────────────────────────────────────────────
// Pre-sort registry by name length descending so we always get the most specific
// match first — "Rogers Cable" beats "Rogers", "Bell Fibe" beats "Bell".
const SORTED_REGISTRY = Object.entries(PROVIDER_REGISTRY)
  .sort(([, a], [, b]) => b.name.length - a.name.length);

function matchProvider(from: string, subject: string, body: string): {
  providerId: string; providerName: string; category: string;
} | null {
  const text = `${from} ${subject} ${body.slice(0, 2000)}`.toLowerCase();
  for (const [id, p] of SORTED_REGISTRY) {
    const name = p.name.toLowerCase();
    if (name.length > 2 && text.includes(name)) {
      return { providerId: id, providerName: p.name, category: p.category };
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

/** A field returned by Claude with an embedded per-field confidence score */
interface AIField<T> {
  value: T;
  original?: string;
  confidence: number;  // 0.0–1.0 as requested in the prompt
}

/**
 * Structured result from Claude.
 * All data fields are either a typed AIField or null.
 * We also expose raw per-field confidence values so later layers can use them.
 */
interface AIResult {
  billerName: string | null;
  accountNumber: string | null;
  accountNumberOriginal: string | null;
  amountDue: number | null;
  dueDate: string | null;
  statementDate: string | null;
  minimumPayment: number | null;
  totalBalance: number | null;
  currency: string;
  category: string;
  // Per-field confidence values extracted from Claude's response
  fieldConfidence: {
    accountNumber: number;
    amountDue: number;
    dueDate: number;
  };
}

/** Safely resolve a field that may be a nested AIField object or a raw scalar (old format). */
function resolveField<T>(raw: unknown): AIField<T> | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'object' && raw !== null && 'value' in raw) {
    const f = raw as Record<string, unknown>;
    const v = f.value as T;
    const c = typeof f.confidence === 'number' ? Math.min(1, Math.max(0, f.confidence)) : 0.5;
    if (v === null || v === undefined) return null;
    return { value: v, original: f.original as string | undefined, confidence: c };
  }
  // Backwards compat: plain scalar value (old prompt format)
  return { value: raw as T, confidence: 0.6 };
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
        max_tokens: 700,
        messages: [{ role: 'user', content: AI_PROMPT + content }],
      }),
      CLAUDE_TIMEOUT_MS,
      'Claude extraction'
    );

    const rawText = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const p = JSON.parse(jsonMatch[0]);

    const acctField  = resolveField<string>(p.accountNumber);
    const amtField   = resolveField<number>(p.amountDue);
    const dateField  = resolveField<string>(p.dueDate);
    const stmtField  = resolveField<string>(p.statementDate);
    const minField   = resolveField<number>(p.minimumPayment);
    const balField   = resolveField<number>(p.totalBalance);

    // Validate extracted values
    const acctValue  = acctField?.value && typeof acctField.value === 'string' && acctField.value.trim().length >= 4
      ? acctField.value.trim() : null;
    const amtValue   = amtField?.value && typeof amtField.value === 'number' && amtField.value > 0
      ? amtField.value : null;
    const dateValue  = dateField?.value && typeof dateField.value === 'string' && dateField.value.length >= 8
      ? dateField.value : null;
    const stmtValue  = stmtField?.value && typeof stmtField.value === 'string' && stmtField.value.length >= 8
      ? stmtField.value : null;
    const minValue   = minField?.value && typeof minField.value === 'number' && minField.value > 0
      ? minField.value : null;
    const balValue   = balField?.value && typeof balField.value === 'number' && balField.value > 0
      ? balField.value : null;

    return {
      billerName: typeof p.billerName === 'string' ? p.billerName.trim() : null,
      accountNumber: acctValue,
      accountNumberOriginal: acctField?.original ?? acctValue,
      amountDue: amtValue,
      dueDate: dateValue,
      statementDate: stmtValue,
      minimumPayment: minValue,
      totalBalance: balValue,
      currency: typeof p.currency === 'string' ? p.currency : 'CAD',
      category: typeof p.category === 'string' ? p.category : 'miscellaneous',
      fieldConfidence: {
        accountNumber: acctValue  ? (acctField?.confidence  ?? 0.6) : 0,
        amountDue:     amtValue   ? (amtField?.confidence   ?? 0.6) : 0,
        dueDate:       dateValue  ? (dateField?.confidence  ?? 0.6) : 0,
      },
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
        message: 'No billing emails found in the last 60 days. Check your inbox or try scanning again.',
      });
    }

    // Load existing pending merchant keys — skip any biller already awaiting review
    let existingPendingKeys: Set<string>;
    try {
      existingPendingKeys = await fetchExistingPendingMerchantKeys(userId);
    } catch {
      existingPendingKeys = new Set();
    }

    // Track merchants imported in THIS scan — Gmail returns newest first,
    // so the first time we see a biller is its most recent email.
    const seenMerchantsThisScan = new Set<string>();

    let scanned = 0, candidates = 0, aiParsed = 0, drafted = 0, skipped = 0, errors = 0;
    let filteredReceipts = 0, filteredOrders = 0, filteredOther = 0;
    let skippedAlreadyPending = 0;
    const blockedBillerNames: string[] = [];

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

        // ── Classifier: only proceed if this looks like a real bill ──────────
        const emailType: EmailType = classifyEmail(subject, snippet, body);

        if (emailType === 'receipt') { filteredReceipts++; skipped++; continue; }
        if (emailType === 'order')   { filteredOrders++;   skipped++; continue; }
        if (emailType === 'promo')   { filteredOther++;    skipped++; continue; }
        if (emailType === 'other')   { filteredOther++;    skipped++; continue; }

        // emailType === 'bill' — proceed to extraction
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
        // Display: prefer regex's space-preserved format, then AI original, then cleaned
        const finalAccountNumDisplay = regex.accountNumberDisplay ?? ai?.accountNumberOriginal ?? ai?.accountNumber ?? null;
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

        // ── Step 5: Per-biller deduplication ──
        // Build merchant key using provider ID (known) or normalized name (unknown)
        const mKey = buildMerchantKey(provider?.providerId, finalMerchant);

        // Skip if we already imported a (newer) email from this biller in this scan
        if (seenMerchantsThisScan.has(mKey)) {
          console.log({ route: '/api/gmail/sync', step: 'skipDuplicate', reason: 'alreadyScanningThisBiller', merchant: finalMerchant });
          skipped++;
          continue;
        }

        // Skip if this biller already has a pending bill awaiting the user's review
        if (existingPendingKeys.has(mKey)) {
          console.log({ route: '/api/gmail/sync', step: 'skipDuplicate', reason: 'alreadyPending', merchant: finalMerchant });
          skipped++;
          skippedAlreadyPending++;
          if (blockedBillerNames.length < 5) blockedBillerNames.push(finalMerchant);
          continue;
        }

        // Mark this merchant as seen for the rest of this scan
        seenMerchantsThisScan.add(mKey);

        // ── Step 6: Confidence scoring ──
        const sources: ExtractionSources = {
          amountFromRegex:   regex.amountDue !== null,
          amountFromAI:      ai?.amountDue != null && regex.amountDue === null,
          dateFromRegex:     regex.dueDate !== null,
          dateFromAI:        ai?.dueDate != null && regex.dueDate === null,
          accountFromRegex:  regex.accountNumber !== null,
          accountFromAI:     ai?.accountNumber != null && regex.accountNumber === null,
          billerFromRegistry: !!provider,
        };

        let score  = computeConfidence({ amountDue: finalAmount, dueDate: finalDueDate, accountNumber: finalAccountNum, billerName: finalMerchant }, sources);

        // Boost score using AI per-field confidence when AI filled a gap
        // (only applied for fields that were NOT already found by regex)
        if (ai?.fieldConfidence) {
          const fc = ai.fieldConfidence;
          if (sources.amountFromAI && fc.amountDue > 0)     score = Math.min(100, score + fc.amountDue * 8);
          if (sources.dateFromAI   && fc.dueDate > 0)       score = Math.min(100, score + fc.dueDate   * 6);
          if (sources.accountFromAI && fc.accountNumber > 0) score = Math.min(100, score + fc.accountNumber * 4);
        }

        // ── Step 7: Validation & Enrichment (Layer 4) ──
        const validation = validateExtractedFields(finalAmount, finalDueDate, finalAccountNum);

        // Apply any confidence penalties from validation (e.g., amount out of range)
        score = Math.round(Math.max(0, Math.min(100, score * validation.confidenceMultiplier)));

        // Use validated (possibly corrected/nulled) values for storage
        const storedAmount     = validation.adjustedAmount     ?? finalAmount;
        const storedDueDate    = validation.adjustedDueDate    ?? finalDueDate;
        const storedAccountNum = validation.adjustedAccountNumber ?? finalAccountNum;

        const label  = scoreToLabel(score);
        const method = detectionMethod(sources);

        // ── Step 8: Routing (Layer 5) ──
        const routingAction = getRoutingAction(score, storedAmount, storedDueDate);

        // ── Step 9: Store — always, even if fields are incomplete ──
        const pendingBill: Omit<PendingBill, 'id'> = {
          userId,
          gmailMessageId: msg.id,
          merchantName: finalMerchant,
          billerDomain,
          amount: storedAmount,
          dueDate: storedDueDate,
          accountNumber: storedAccountNum,
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
          routingAction,
          emailType,
          validationWarnings: validation.warnings.length > 0 ? validation.warnings : undefined,
        };

        await storePendingBill(pendingBill);
        drafted++;

        console.log({
          route: '/api/gmail/sync', step: 'stored',
          merchant: finalMerchant, score, method, routingAction,
          amount: storedAmount, dueDate: storedDueDate, accountNumber: storedAccountNum,
          validationWarnings: validation.warnings,
        });

      } catch (err: any) {
        console.error({ route: '/api/gmail/sync', step: 'processMsg', error: err.message });
        errors++;
      }
    }

    console.log({
      route: '/api/gmail/sync', step: 'complete',
      scanned, candidates, aiParsed, drafted, skipped, errors,
      filteredReceipts, filteredOrders, filteredOther, skippedAlreadyPending,
    });

    // Build a helpful summary message
    const filterParts: string[] = [];
    if (filteredReceipts > 0) filterParts.push(`${filteredReceipts} receipt${filteredReceipts > 1 ? 's' : ''}`);
    if (filteredOrders > 0)   filterParts.push(`${filteredOrders} order${filteredOrders > 1 ? 's' : ''}`);
    if (filteredOther > 0)    filterParts.push(`${filteredOther} non-bill${filteredOther > 1 ? 's' : ''}`);
    const filterNote = filterParts.length > 0 ? ` (filtered out: ${filterParts.join(', ')})` : '';

    let message: string;
    if (drafted > 0) {
      message = `Scan complete — ${drafted} new bill${drafted > 1 ? 's' : ''} added to Pending Bills${filterNote}. Review and confirm them.`;
    } else if (skippedAlreadyPending > 0) {
      // The most common "nothing found" case — billers already have pending bills
      const names = blockedBillerNames.join(', ');
      message = `Scan complete — bills from ${names} are already waiting in your review queue. Review and confirm them to scan for new ones.`;
    } else if (candidates > 0 && drafted === 0) {
      message = `Found ${candidates} billing emails but encountered errors storing them.`;
    } else if (filterParts.length > 0) {
      message = `Scanned ${scanned} emails — no new bills found. Filtered out ${filterParts.join(', ')} that were not bills.`;
    } else {
      message = `Scanned ${scanned} emails — no new billing emails detected in the last 60 days.`;
    }

    return NextResponse.json({
      success: true, scanned, candidates, aiParsed, drafted, skipped, errors,
      filteredReceipts, filteredOrders, skippedAlreadyPending,
      pendingCount: existingPendingKeys.size,
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
