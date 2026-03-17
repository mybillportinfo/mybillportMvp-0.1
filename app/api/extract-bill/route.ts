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
import { checkServerRateLimit } from '../../lib/serverRateLimit';
import { tryBillerParsers } from '../../lib/parsers';

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';

// Models resolved inside handler at request time (env vars may differ per environment)

const EXTRACTION_PROMPT = `You are an expert bill/invoice data extractor. Analyze this bill and extract the following information as accurately as possible.

Return ONLY a valid JSON object with these fields:
{
  "vendor": "Company/vendor name (clean, official name)",
  "amount": <number or null if not found>,
  "dueDate": "YYYY-MM-DD format or null if not found",
  "billingPeriod": "e.g. Jan 1 - Jan 31, 2026 or null",
  "accountNumber": "account/customer number or null",
  "currency": "3-letter currency code (e.g. CAD, USD, GBP, EUR, AUD, INR)",
  "category": "one of: utilities, telecom, government, insurance, banking, transportation, education, subscriptions, property, miscellaneous, or null",
  "confidenceVendor": <0.0 to 1.0>,
  "confidenceAmount": <0.0 to 1.0>,
  "confidenceDueDate": <0.0 to 1.0>
}

Rules:
- For amount: prefer "Total Due", "Amount Due", "Balance Due", "Total Amount" over subtotals. Choose the final payable amount.
- For dates: prefer "Due Date", "Payment Due" over invoice date or billing date.
- For vendor: use the official company name, not abbreviations.
- Bills may use DD/MM/YYYY, MM/DD/YYYY, or other regional formats. Normalize to YYYY-MM-DD.
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
    if (!appCheckResult.valid) {
      console.log(`[extract-bill] app-check: not verified (skipping — token not available)`);
    }

    // Resolve credentials at request time — Replit integration is localhost-only,
    // Vercel deployments fall back to the user's own ANTHROPIC_API_KEY.
    const replitBase = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
    const replitKey  = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
    const useReplitAI = !!(replitBase && replitKey);

    let apiKey: string | null = null;
    let anthropicBaseURL: string | undefined = undefined;
    let MODELS: string[];

    if (useReplitAI) {
      apiKey = replitKey!;
      anthropicBaseURL = replitBase!;
      MODELS = ["claude-sonnet-4-6", "claude-haiku-4-5"];
    } else {
      const apiKeyRaw = process.env.ANTHROPIC_API_KEY;
      apiKey = apiKeyRaw ? apiKeyRaw.replace(/[\s\r\n\t]/g, '').trim() : null;
      MODELS = ["claude-3-5-sonnet-20241022"];
    }

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

    // Server-side durable rate limit (survives cold starts, blocks API-level abuse)
    const serverRateCheck = await checkServerRateLimit(`extract_${verifiedUserId}`, 10, 60 * 60 * 1000);
    if (!serverRateCheck.allowed) {
      const hoursLeft = Math.ceil(serverRateCheck.resetsIn / (1000 * 60 * 60));
      return NextResponse.json({
        success: false,
        error: `You've reached the scan limit (10 scans/hour). Try again in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}.`,
        rateLimited: true,
        resetsIn: serverRateCheck.resetsIn,
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
    const anthropic = new Anthropic({ apiKey, ...(anthropicBaseURL ? { baseURL: anthropicBaseURL } : {}) });
    console.log(`[extract-bill] using ${useReplitAI ? 'Replit AI integration' : 'user API key'}, models=${MODELS.join(',')}`);
    let extractedJson: any;
    let extractionMethod = 'claude-vision';
    let usedModel = '';

    const messages: any[] = [];

    if (sanitizedFileType === 'image') {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const mediaType = validTypes.includes(mimeType) ? mimeType : 'image/jpeg';
      messages.push({
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
      });
    } else if (sanitizedFileType === 'pdf') {
      messages.push({
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
      });
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported file type' }, { status: 400 });
    }

    let lastError: any = null;
    for (const model of MODELS) {
      try {
        console.log(`[extract-bill] trying model=${model}`);
        const response = await anthropic.messages.create({
          model,
          max_tokens: 8192,
          temperature: 0,
          messages,
        });
        const text = response.content[0].type === 'text' ? response.content[0].text : '';
        extractedJson = parseJsonResponse(text);
        usedModel = model;
        lastError = null;
        break;
      } catch (err: any) {
        console.error(`[extract-bill] model=${model} failed:`, err?.status, err?.message?.substring(0, 200));
        lastError = err;
        if (err?.message?.includes('Could not process image') || err?.message?.includes('Could not process')) {
          throw err;
        }
      }
    }

    if (lastError && !extractedJson) {
      throw lastError;
    }

    if (extractedJson) {
      try {
        const rawText = [
          extractedJson.vendor,
          extractedJson.accountNumber,
          String(extractedJson.amount),
          extractedJson.dueDate,
          extractedJson.billingPeriod,
        ].filter(Boolean).join(' ');
        const parserResult = tryBillerParsers(rawText);
        if (parserResult && parserResult.confidence > calculateOverall(extractedJson)) {
          extractedJson = {
            ...extractedJson,
            vendor: parserResult.vendor,
            amount: parserResult.amount ?? extractedJson.amount,
            dueDate: parserResult.dueDate ?? extractedJson.dueDate,
            billingPeriod: parserResult.billingPeriod ?? extractedJson.billingPeriod,
            accountNumber: parserResult.accountNumber ?? extractedJson.accountNumber,
            currency: parserResult.currency,
            category: parserResult.category,
            confidenceVendor: Math.max(extractedJson.confidenceVendor ?? 0.5, parserResult.confidence),
          };
          extractionMethod = 'claude-vision+parser';
        }
      } catch (parserErr) {
        console.warn('[extract-bill] parser overlay failed, continuing with Claude result:', parserErr);
      }
    }

    const processingMs = Date.now() - startTime;
    console.log(`[extract-bill] uid=${verifiedUserId.substring(0, 8)}... fileType=${sanitizedFileType} model=${usedModel} method=${extractionMethod} ms=${processingMs}`);

    if (!extractedJson) {
      return NextResponse.json({ success: false, error: 'Failed to parse bill data. Please try again or enter manually.' }, { status: 422 });
    }

    const providerMatch = fuzzyMatchProvider(extractedJson.vendor || '');
    const overallConfidence = calculateOverall(extractedJson);

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
        overall: overallConfidence,
        vendor: extractedJson.confidenceVendor ?? 0.5,
        amount: extractedJson.confidenceAmount ?? 0.5,
        dueDate: extractedJson.confidenceDueDate ?? 0.5,
      },
      matchedProviderId: providerMatch?.providerId || undefined,
      matchedProviderName: providerMatch?.providerName || undefined,
      isCustomProvider: !providerMatch,
      extractionMethod,
      confidenceLevel: overallConfidence >= 0.9 ? 'high' as const
        : overallConfidence >= 0.7 ? 'medium' as const
        : 'low' as const,
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
    const errorMsg = error?.message || '';
    const errorStatus = error?.status;
    console.error('[extract-bill] FULL ERROR:', JSON.stringify({
      status: errorStatus,
      message: errorMsg.substring(0, 500),
      type: error?.error?.type,
      name: error?.name,
      code: error?.code,
      errorBody: error?.error ? JSON.stringify(error.error).substring(0, 300) : undefined,
    }));

    if (errorMsg.includes('Could not process image') || errorMsg.includes('Could not process')) {
      return NextResponse.json(
        { success: false, error: 'Could not read the image. Please ensure the photo is clear, well-lit, and shows the bill details.' },
        { status: 400 }
      );
    }
    if (errorStatus === 429) {
      return NextResponse.json(
        { success: false, error: 'AI service is temporarily busy. Please wait a moment and try again.' },
        { status: 429 }
      );
    }
    if (errorStatus === 401 || errorMsg.includes('authentication') || errorMsg.includes('api_key') || errorMsg.includes('invalid x-api-key')) {
      return NextResponse.json(
        { success: false, error: 'AI service authentication failed. The API key may be invalid or expired.' },
        { status: 500 }
      );
    }
    if (errorMsg.includes('not_found') || errorMsg.includes('does not exist') || errorMsg.includes('model:')) {
      return NextResponse.json(
        { success: false, error: 'AI model not available. Please try again shortly.' },
        { status: 500 }
      );
    }
    if (errorMsg.includes('credit balance is too low') || errorMsg.includes('insufficient_quota') || errorMsg.includes('billing')) {
      return NextResponse.json(
        { success: false, error: 'AI service is temporarily unavailable. Please try again in a few minutes or enter the bill details manually.' },
        { status: 503 }
      );
    }
    if (errorStatus === 400) {
      return NextResponse.json(
        { success: false, error: `AI service error: ${errorMsg.substring(0, 150)}` },
        { status: 400 }
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
