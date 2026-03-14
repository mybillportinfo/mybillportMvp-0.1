import { BillExtractionResult } from './billExtraction';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchedBillId?: string;
  matchedBillName?: string;
  matchScore: number;
  reason?: string;
}

export interface ValidationResult {
  isValid: boolean;
  correctedAmount?: number | null;
  correctedDate?: string | null;
  warnings: string[];
  errors: string[];
}

export function checkForDuplicate(
  extractedData: { vendor: string; amount: number | null; dueDate: string | null },
  existingBills: Array<{
    id?: string;
    companyName: string;
    totalAmount: number;
    dueDate: any;
    providerId?: string;
  }>,
  matchedProviderId?: string
): DuplicateCheckResult {
  if (!existingBills.length) return { isDuplicate: false, matchScore: 0 };

  const vendorNorm = extractedData.vendor?.toLowerCase().trim() || '';

  for (const bill of existingBills) {
    let score = 0;
    const reasons: string[] = [];

    const billNameNorm = bill.companyName?.toLowerCase().trim() || '';
    const nameMatch = matchedProviderId && bill.providerId
      ? matchedProviderId === bill.providerId
      : vendorNorm === billNameNorm || vendorNorm.includes(billNameNorm) || billNameNorm.includes(vendorNorm);

    if (nameMatch) {
      score += 0.4;
      reasons.push('same provider');
    }

    if (extractedData.amount != null && bill.totalAmount != null) {
      const diff = Math.abs(extractedData.amount - bill.totalAmount);
      if (diff < 0.01) {
        score += 0.35;
        reasons.push('same amount');
      } else if (diff / Math.max(extractedData.amount, bill.totalAmount) < 0.02) {
        score += 0.2;
        reasons.push('similar amount');
      }
    }

    if (extractedData.dueDate && bill.dueDate) {
      const extractedDate = new Date(extractedData.dueDate + 'T00:00:00');
      const billDate = bill.dueDate instanceof Date ? bill.dueDate :
        bill.dueDate?.toDate ? bill.dueDate.toDate() : new Date(bill.dueDate);
      const daysDiff = Math.abs((extractedDate.getTime() - billDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 1) {
        score += 0.25;
        reasons.push('same due date');
      } else if (daysDiff <= 3) {
        score += 0.1;
        reasons.push('similar due date');
      }
    }

    if (score >= 0.6) {
      return {
        isDuplicate: true,
        matchedBillId: bill.id,
        matchedBillName: bill.companyName,
        matchScore: score,
        reason: `Possible duplicate: ${reasons.join(', ')}`,
      };
    }
  }

  return { isDuplicate: false, matchScore: 0 };
}

export function validateAndSanitizeExtraction(data: BillExtractionResult): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  let correctedAmount = data.amount;
  let correctedDate = data.dueDate;

  if (correctedAmount != null) {
    if (isNaN(correctedAmount) || !isFinite(correctedAmount)) {
      errors.push('Extracted amount is not a valid number');
      correctedAmount = null;
    } else if (correctedAmount < 0) {
      warnings.push('Negative amount detected — converted to positive');
      correctedAmount = Math.abs(correctedAmount);
    } else if (correctedAmount > 100000) {
      warnings.push('Amount over $100,000 — please verify');
    } else if (correctedAmount < 0.01) {
      warnings.push('Amount is less than $0.01 — please verify');
    }
    if (correctedAmount != null) {
      correctedAmount = Math.round(correctedAmount * 100) / 100;
    }
  }

  if (correctedDate) {
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoRegex.test(correctedDate)) {
      const parsed = tryParseDate(correctedDate);
      if (parsed) {
        warnings.push(`Date format corrected to ${parsed}`);
        correctedDate = parsed;
      } else {
        errors.push('Could not parse the extracted date');
        correctedDate = null;
      }
    }

    if (correctedDate) {
      const dateObj = new Date(correctedDate + 'T00:00:00');
      if (isNaN(dateObj.getTime())) {
        errors.push('Extracted date is invalid');
        correctedDate = null;
      } else {
        const now = new Date();
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        const twoYearsOut = new Date(now);
        twoYearsOut.setFullYear(now.getFullYear() + 2);

        if (dateObj < oneYearAgo) {
          warnings.push('Due date is more than 1 year in the past — please verify');
        }
        if (dateObj > twoYearsOut) {
          warnings.push('Due date is more than 2 years in the future — please verify');
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    correctedAmount,
    correctedDate,
    warnings,
    errors,
  };
}

function tryParseDate(str: string): string | null {
  const ddmmyyyy = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (ddmmyyyy) {
    const [, d, m, y] = ddmmyyyy;
    const day = parseInt(d, 10);
    const month = parseInt(m, 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    if (day >= 1 && day <= 12 && month >= 1 && month <= 31) {
      return `${y}-${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}`;
    }
  }

  const mmddyyyy = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (mmddyyyy) {
    const [, m, d, y] = mmddyyyy;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  const textDate = new Date(str);
  if (!isNaN(textDate.getTime())) {
    return textDate.toISOString().split('T')[0];
  }

  return null;
}

const rateLimitCache: Map<string, { count: number; resetAt: number }> = new Map();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

export function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetsIn: number } {
  const now = Date.now();
  const entry = rateLimitCache.get(userId);

  if (!entry || now >= entry.resetAt) {
    rateLimitCache.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetsIn: RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetsIn: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetsIn: entry.resetAt - now };
}

export function getContentHash(base64Data: string): string {
  let hash = 0;
  const sample = base64Data.substring(0, 1000) + base64Data.substring(base64Data.length - 1000);
  for (let i = 0; i < sample.length; i++) {
    const char = sample.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + '_' + base64Data.length.toString(36);
}

const recentHashes: Map<string, { hash: string; timestamp: number }[]> = new Map();

export function checkFileHashDuplicate(userId: string, fileHash: string): boolean {
  const now = Date.now();
  const userHashes = recentHashes.get(userId) || [];

  const filtered = userHashes.filter(h => now - h.timestamp < 3600000);
  recentHashes.set(userId, filtered);

  if (filtered.some(h => h.hash === fileHash)) {
    return true;
  }

  filtered.push({ hash: fileHash, timestamp: now });
  recentHashes.set(userId, filtered);
  return false;
}
