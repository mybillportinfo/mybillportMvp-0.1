import Anthropic from '@anthropic-ai/sdk';
import { fuzzyMatchProvider } from './fuzzyMatch';

export interface ParsedBillData {
  vendor: string | null;
  amount: number | null;
  dueDate: string | null;
  accountNumber: string | null;
  category: string | null;
  confidence: number;
  matchedProviderId?: string;
  matchedProviderName?: string;
  rawText?: string;
}

const EMAIL_EXTRACTION_PROMPT = `You are an expert bill/invoice extractor for Canadian bills received via email. Analyze this email content and extract bill information.

Return ONLY a valid JSON object:
{
  "vendor": "Company/vendor name or null",
  "amount": <number or null>,
  "dueDate": "YYYY-MM-DD or null",
  "accountNumber": "account number or null",
  "category": "one of: utilities, telecom, insurance, banking, government, transportation, streaming, internet, phone, subscriptions, property, miscellaneous, or null",
  "confidence": <0.0 to 1.0 overall confidence>
}

Rules:
- For amount: prefer "Total Due", "Amount Due", "Balance Due". Pick the final payable amount.
- For dates: prefer "Due Date", "Payment Due" over invoice date.
- Canadian bills may use DD/MM/YYYY format. Normalize to YYYY-MM-DD.
- If the email is clearly a bill/invoice, confidence should be 0.7+.
- If the email is a confirmation or receipt (already paid), still extract the amount.
- If this does not appear to be a bill at all, set confidence to 0.1 or below.
- Return ONLY the JSON, no markdown.`;

function extractAmountFromText(text: string): number | null {
  const patterns = [
    /(?:amount\s*due|total\s*due|balance\s*due|total\s*amount|amount\s*owing)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    /\$\s*([\d,]+\.\d{2})/,
    /(?:pay|due|owing|balance)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) {
      const val = parseFloat(m[1].replace(/,/g, ''));
      if (val > 0 && val < 100000) return val;
    }
  }
  return null;
}

function extractDateFromText(text: string): string | null {
  const patterns = [
    /(?:due\s*date|payment\s*due|due\s*by|due\s*on)[:\s]*(\w+\s+\d{1,2},?\s*\d{4})/i,
    /(?:due\s*date|payment\s*due|due\s*by|due\s*on)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(?:due\s*date|payment\s*due|due\s*by|due\s*on)[:\s]*(\d{4}-\d{2}-\d{2})/i,
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) {
      const d = new Date(m[1]);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    }
  }
  return null;
}

function extractAccountFromText(text: string): string | null {
  const patterns = [
    /(?:account\s*(?:number|no|#|num)?)[:\s]*([A-Z0-9][\w\s\-]{3,25})/i,
    /(?:acct|a\/c)[:\s#]*([A-Z0-9][\w\s\-]{3,25})/i,
  ];
  for (const pat of patterns) {
    const m = text.match(pat);
    if (m) return m[1].trim();
  }
  return null;
}

function extractVendorFromSubject(subject: string): string | null {
  let cleaned = subject.replace(/^(fw:|fwd:|re:)\s*/gi, '').trim();
  cleaned = cleaned
    .replace(/\b(your|my|new|monthly|bill|invoice|statement|payment|reminder|notice|alert|notification)\b/gi, '')
    .replace(/[-–—|:]/g, ' ')
    .replace(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b\s*\d{0,4}/gi, '')
    .replace(/\d{4}/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned || null;
}

export async function parseEmailForBill(
  subject: string,
  textBody: string,
  htmlBody?: string
): Promise<ParsedBillData> {
  const content = `Email subject: ${subject}\n\n${textBody || htmlBody || ''}`.slice(0, 8000);
  const fullText = `${subject} ${textBody || ''} ${htmlBody || ''}`;

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `${EMAIL_EXTRACTION_PROMPT}\n\nEmail content:\n${content}`,
        },
      ],
    });

    const raw = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    let matchedProviderId: string | undefined;
    let matchedProviderName: string | undefined;

    if (parsed.vendor) {
      const match = fuzzyMatchProvider(parsed.vendor);
      if (match) {
        matchedProviderId = match.providerId;
        matchedProviderName = match.providerName;
      }
    }

    return {
      vendor: parsed.vendor || null,
      amount: typeof parsed.amount === 'number' ? parsed.amount : null,
      dueDate: parsed.dueDate || null,
      accountNumber: parsed.accountNumber || null,
      category: parsed.category || null,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      matchedProviderId,
      matchedProviderName,
      rawText: content.slice(0, 500),
    };
  } catch (err: any) {
    console.error('[emailParser] AI extraction failed, using regex fallback:', err.message);

    const vendorFromSubject = extractVendorFromSubject(subject);
    const amount = extractAmountFromText(fullText);
    const dueDate = extractDateFromText(fullText);
    const accountNumber = extractAccountFromText(fullText);

    let matchedProviderId: string | undefined;
    let matchedProviderName: string | undefined;
    if (vendorFromSubject) {
      const match = fuzzyMatchProvider(vendorFromSubject);
      if (match) {
        matchedProviderId = match.providerId;
        matchedProviderName = match.providerName;
      }
    }

    const hasData = !!(amount || dueDate || accountNumber);
    return {
      vendor: matchedProviderName || vendorFromSubject,
      amount,
      dueDate,
      accountNumber,
      category: null,
      confidence: hasData ? 0.5 : 0.3,
      matchedProviderId,
      matchedProviderName,
      rawText: content.slice(0, 500),
    };
  }
}
