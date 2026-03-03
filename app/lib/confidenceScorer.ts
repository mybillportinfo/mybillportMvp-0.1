/**
 * Confidence scoring for extracted bill data.
 * Returns a score 0–100 based on which fields were found and how.
 */

export interface ExtractionSources {
  amountFromRegex: boolean;
  amountFromAI: boolean;
  dateFromRegex: boolean;
  dateFromAI: boolean;
  accountFromRegex: boolean;
  accountFromAI: boolean;
  billerFromRegistry: boolean;
}

export interface ScoredFields {
  amountDue: number | null;
  dueDate: string | null;
  accountNumber: string | null;
  billerName: string;
}

/**
 * Weighted confidence score:
 * - amountDue:     regex=40, AI=30, missing=0
 * - dueDate:       regex=30, AI=20, missing=0
 * - accountNumber: regex=20, AI=15, missing=0
 * - billerName:    registry=10, AI=8
 */
export function computeConfidence(fields: ScoredFields, sources: ExtractionSources): number {
  let score = 0;

  // Amount (40 points)
  if (fields.amountDue !== null) {
    score += sources.amountFromRegex ? 40 : (sources.amountFromAI ? 30 : 0);
  }

  // Due date (30 points)
  if (fields.dueDate !== null) {
    score += sources.dateFromRegex ? 30 : (sources.dateFromAI ? 20 : 0);
  }

  // Account number (20 points)
  if (fields.accountNumber !== null) {
    score += sources.accountFromRegex ? 20 : (sources.accountFromAI ? 15 : 0);
  }

  // Biller name (10 points)
  score += sources.billerFromRegistry ? 10 : 8;

  return Math.min(100, Math.max(0, score));
}

/**
 * Map numeric score to legacy confidence label for display.
 */
export function scoreToLabel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

/**
 * Determine detection method label.
 */
export function detectionMethod(sources: ExtractionSources): 'regex' | 'ai' | 'hybrid' {
  const usedRegex = sources.amountFromRegex || sources.dateFromRegex || sources.accountFromRegex;
  const usedAI = sources.amountFromAI || sources.dateFromAI || sources.accountFromAI;
  if (usedRegex && usedAI) return 'hybrid';
  if (usedRegex) return 'regex';
  return 'ai';
}
