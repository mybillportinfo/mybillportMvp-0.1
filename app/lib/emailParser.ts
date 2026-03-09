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

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function parseEmailForBill(
  subject: string,
  textBody: string,
  htmlBody?: string
): Promise<ParsedBillData> {
  const content = `Email subject: ${subject}\n\n${textBody || htmlBody || ''}`.slice(0, 8000);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
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
      if (match.matched) {
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
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.3,
      matchedProviderId,
      matchedProviderName,
      rawText: content.slice(0, 500),
    };
  } catch (err: any) {
    console.error('[emailParser] Extraction failed:', err.message);
    return {
      vendor: null,
      amount: null,
      dueDate: null,
      accountNumber: null,
      category: null,
      confidence: 0,
    };
  }
}
