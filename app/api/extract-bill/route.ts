import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { fuzzyMatchProvider } from '../../lib/fuzzyMatch';
import {
  checkRateLimit,
  getContentHash,
  checkFileHashDuplicate,
  validateAndSanitizeExtraction,
} from '../../lib/extractionGuards';
import { verifyFirebaseToken, verifyAppCheckToken, isValidMimeType, sanitizeString } from '../../lib/authVerify';

export const runtime = "nodejs";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

const EXTRACTION_PROMPT = `You are an expert bill/invoice data extractor for Canadian bills. Analyze this bill and extract the following information as accurately as possible.

Return ONLY a valid JSON object with these fields:
{
  "vendor": "Company/vendor name (clean, official name)",
  "amount": <number or null if not found>,
  "dueDate": "YYYY-MM-DD format or null if not found",
  "billingPeriod": "e.g. Jan 1 - Jan 31, 2026 or null",
  "accountNumber": "account/customer number or null",
  "currency": "CAD or USD",
  "category": "one of: utilities, telecom, government, insurance, banking, transportation, education, subscriptions, property, miscellaneous, or null",
  "confidenceVendor": <0.0 to 1.0>,
  "confidenceAmount": <0.0 to 1.0>,
  "confidenceDueDate": <0.0 to 1.0>
}

Rules:
- For amount: prefer "Total Due", "Amount Due", "Balance Due", "Total Amount" over subtotals. Choose the final payable amount.
- For dates: prefer "Due Date", "Payment Due" over invoice date or billing date.
- For vendor: use the official company name, not abbreviations.
- Canadian bills may use DD/MM/YYYY format. Normalize to YYYY-MM-DD.
- If multiple amounts exist, pick the one closest to "Total Due" or "Amount Due".
- Confidence scores reflect how certain you are about each extracted value.
- If amount not confidently found, set confidenceAmount below 0.5.
- If date invalid or uncertain, set confidenceDueDate below 0.5.
- Return ONLY the JSON object, no markdown, no explanation.`;


export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authResult = await verifyFirebaseToken(authHeader);

    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const verifiedUserId = authResult.uid!;

    const appCheckHeader = request.headers.get('x-firebase-appcheck');
    const appCheckResult = await verifyAppCheckToken(appCheckHeader);
    const appCheckEnforced = process.env.APPCHECK_ENFORCEMENT === 'true';
    if (!appCheckResult.valid) {
      if (appCheckEnforced) {
        return NextResponse.json(
          { success: false, error: 'App verification failed' },
          { status: 401 }
        );
      }
      console.log(`[extract-bill] app-check: not verified (enforcement=${appCheckEnforced})`);
    }

    const apiKeyRaw = process.env.ANTHROPIC_API_KEY;
    const apiKey = apiKeyRaw ? apiKeyRaw.replace(/[\s\r\n\t]/g, '').trim() : null;

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'AI service not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { fileData, fileType, mimeType } = body;

    if (!fileData || !fileType) {
      return NextResponse.json({ success: false, error: 'Missing file data' }, { status: 400 });
    }

    const sanitizedFileType = sanitizeString(fileType, 20);
    const validFileTypes = ['image', 'pdf'];
    if (!validFileTypes.includes(sanitizedFileType)) {
      return NextResponse.json({ success: false, error: 'Unsupported file type' }, { status: 400 });
    }

    if (mimeType && !isValidMimeType(mimeType)) {
      return NextResponse.json({ success: false, error: 'Unsupported MIME type' }, { status: 400 });
    }

    const MAX_BASE64_SIZE = 14 * 1024 * 1024;
    if (typeof fileData !== 'string' || fileData.length > MAX_BASE64_SIZE) {
      return NextResponse.json({ success: false, error: 'File is too large. Please use a file under 10MB.' }, { status: 413 });
    }

    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!base64Regex.test(fileData.substring(0, 100))) {
      return NextResponse.json({ success: false, error: 'Invalid file data format' }, { status: 400 });
    }

    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      request.headers.get('x-real-ip') || 
                      'unknown';

    const userRateCheck = checkRateLimit(verifiedUserId);
    if (!userRateCheck.allowed) {
      const hoursLeft = Math.ceil(userRateCheck.resetsIn / (1000 * 60 * 60));
      return NextResponse.json({
        success: false,
        error: `You've reached the daily scan limit (10 scans/day). Try again in ${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}.`,
        rateLimited: true,
        resetsIn: userRateCheck.resetsIn,
      }, { status: 429 });
    }

    const ipRateCheck = checkRateLimit(`ip_${ipAddress}`);
    if (!ipRateCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Too many requests from this location. Please try again later.',
        rateLimited: true,
      }, { status: 429 });
    }

    const fileHash = getContentHash(fileData);
    if (checkFileHashDuplicate(verifiedUserId, fileHash)) {
      return NextResponse.json({
        success: false,
        error: 'This file was already scanned recently. Use the previous result or try a different file.',
        duplicateFile: true,
      }, { status: 409 });
    }

    const startTime = Date.now();
    const anthropic = new Anthropic({ apiKey });
    let extractedJson: any;

    if (sanitizedFileType === 'image') {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const mediaType = validTypes.includes(mimeType) ? mimeType : 'image/jpeg';

      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: 8192,
        temperature: 0,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: EXTRACTION_PROMPT },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: fileData,
              },
            },
          ],
        }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      extractedJson = parseJsonResponse(text);
    } else if (sanitizedFileType === 'pdf') {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: 8192,
        temperature: 0,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: EXTRACTION_PROMPT },
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: fileData,
              },
            } as any,
          ],
        }],
      });

      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      extractedJson = parseJsonResponse(text);
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported file type' }, { status: 400 });
    }

    const processingMs = Date.now() - startTime;
    console.log(`[extract-bill] uid=${verifiedUserId.substring(0, 8)}... fileType=${sanitizedFileType} ms=${processingMs}`);

    if (!extractedJson) {
      return NextResponse.json({ success: false, error: 'Failed to parse bill data. Please try again or enter manually.' }, { status: 422 });
    }

    const providerMatch = fuzzyMatchProvider(extractedJson.vendor || '');

    const rawResult = {
      vendor: sanitizeString(extractedJson.vendor, 200),
      amount: extractedJson.amount ?? null,
      dueDate: extractedJson.dueDate || null,
      billingPeriod: sanitizeString(extractedJson.billingPeriod, 100),
      accountNumber: sanitizeString(extractedJson.accountNumber, 50),
      currency: extractedJson.currency || 'CAD',
      category: providerMatch?.category || extractedJson.category || null,
      subcategory: providerMatch?.types?.[0] || null,
      confidence: {
        overall: calculateOverall(extractedJson),
        vendor: extractedJson.confidenceVendor ?? 0.5,
        amount: extractedJson.confidenceAmount ?? 0.5,
        dueDate: extractedJson.confidenceDueDate ?? 0.5,
      },
      matchedProviderId: providerMatch?.providerId || undefined,
      matchedProviderName: providerMatch?.providerName || undefined,
      isCustomProvider: !providerMatch,
    };

    const validation = validateAndSanitizeExtraction(rawResult as any);

    if (validation.correctedAmount !== undefined) {
      rawResult.amount = validation.correctedAmount;
    }
    if (validation.correctedDate !== undefined) {
      rawResult.dueDate = validation.correctedDate;
    }

    return NextResponse.json({
      success: true,
      data: rawResult,
      validation: {
        warnings: validation.warnings,
        errors: validation.errors,
      },
    });
  } catch (error: any) {
    console.error('[extract-bill] error:', error?.status, error?.message?.substring(0, 200));
    const errorMsg = error?.message || '';
    if (errorMsg.includes('Could not process image') || errorMsg.includes('Could not process') || error?.status === 400) {
      return NextResponse.json(
        { success: false, error: 'Could not read the image. Please ensure the photo is clear, well-lit, and shows the bill details.' },
        { status: 400 }
      );
    }
    if (error?.status === 429) {
      return NextResponse.json(
        { success: false, error: 'AI service is temporarily busy. Please wait a moment and try again.' },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to process bill. Please try again or enter manually.' },
      { status: 500 }
    );
  }
}

function parseJsonResponse(text: string): any {
  try {
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { return null; }
    }
    return null;
  }
}

function calculateOverall(data: any): number {
  const v = data.confidenceVendor ?? 0.5;
  const a = data.confidenceAmount ?? 0.5;
  const d = data.confidenceDueDate ?? 0.5;
  return Math.round((v * 0.3 + a * 0.4 + d * 0.3) * 100) / 100;
}
