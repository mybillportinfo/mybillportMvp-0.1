/**
 * Layer 4: Validation & Enrichment
 *
 * Business rule checks on extracted fields.
 * Returns adjusted values and a confidence multiplier.
 * Bad values are nulled out rather than silently kept.
 */

export type RoutingAction = 'auto_accept' | 'user_review' | 'user_correction' | 'manual';

export interface ValidationResult {
  adjustedAmount: number | null;
  adjustedDueDate: string | null;
  adjustedAccountNumber: string | null;
  warnings: string[];
  confidenceMultiplier: number;
}

export function validateExtractedFields(
  amount: number | null,
  dueDate: string | null,
  accountNumber: string | null,
): ValidationResult {
  const warnings: string[] = [];
  let adjustedAmount = amount;
  let adjustedDueDate = dueDate;
  let adjustedAccountNumber = accountNumber;
  let confidenceMultiplier = 1.0;

  // ── Amount validation ──────────────────────────────────────────────────────
  if (amount !== null) {
    if (!isFinite(amount) || amount <= 0) {
      warnings.push(`Amount ${amount} is not a valid positive number`);
      adjustedAmount = null;
      confidenceMultiplier *= 0.6;
    } else if (amount > 50000) {
      // Could be a 6-digit account number picked up as amount
      warnings.push(`Amount $${amount.toFixed(2)} exceeds $50,000 — likely misidentified`);
      adjustedAmount = null;
      confidenceMultiplier *= 0.5;
    } else if (amount < 0.50) {
      // Pennies are almost certainly garbage
      warnings.push(`Amount $${amount.toFixed(2)} is less than $0.50 — likely noise`);
      adjustedAmount = null;
      confidenceMultiplier *= 0.7;
    }
  }

  // ── Due date validation ────────────────────────────────────────────────────
  if (dueDate) {
    const parsed = new Date(dueDate + 'T00:00:00');
    if (isNaN(parsed.getTime())) {
      warnings.push(`Due date "${dueDate}" is not a valid date`);
      adjustedDueDate = null;
      confidenceMultiplier *= 0.8;
    } else {
      const now = new Date();
      const twoYearsPast = new Date(now);
      twoYearsPast.setFullYear(now.getFullYear() - 2);
      const twoYearsFuture = new Date(now);
      twoYearsFuture.setFullYear(now.getFullYear() + 2);

      if (parsed < twoYearsPast) {
        warnings.push(`Due date ${dueDate} is more than 2 years in the past`);
        adjustedDueDate = null;         // Too old to be a real due date
        confidenceMultiplier *= 0.6;
      } else if (parsed > twoYearsFuture) {
        warnings.push(`Due date ${dueDate} is more than 2 years in the future`);
        adjustedDueDate = null;
        confidenceMultiplier *= 0.7;
      } else if (parsed < now) {
        // Past due — keep it (bill might be overdue) but slightly reduce confidence
        confidenceMultiplier *= 0.9;
      }
    }
  }

  // ── Account number validation ──────────────────────────────────────────────
  if (accountNumber) {
    const cleaned = accountNumber.replace(/[^A-Z0-9]/gi, '');
    if (cleaned.length < 4) {
      warnings.push(`Account number "${accountNumber}" is too short (< 4 chars)`);
      adjustedAccountNumber = null;
      confidenceMultiplier *= 0.9;
    } else if (cleaned.length > 25) {
      warnings.push(`Account number "${accountNumber}" is too long (> 25 chars)`);
      adjustedAccountNumber = null;
      confidenceMultiplier *= 0.9;
    } else if (!/[0-9]/.test(cleaned)) {
      warnings.push(`Account number "${accountNumber}" contains no digits`);
      adjustedAccountNumber = null;
      confidenceMultiplier *= 0.85;
    }
  }

  return {
    adjustedAmount,
    adjustedDueDate,
    adjustedAccountNumber,
    warnings,
    confidenceMultiplier,
  };
}

/**
 * Layer 5: Threshold-based routing.
 *
 * Determines what action the UI should suggest to the user:
 *   auto_accept    → score ≥ 88 AND amount AND dueDate both present → show "Ready"
 *   user_review    → score ≥ 65 AND amount present → show "Review"
 *   user_correction→ score ≥ 35 → show "Needs Input"
 *   manual         → score < 35 → show "Enter Manually"
 */
export function getRoutingAction(
  score: number,
  amount: number | null,
  dueDate: string | null,
): RoutingAction {
  if (score >= 88 && amount !== null && dueDate !== null) return 'auto_accept';
  if (score >= 65 && amount !== null) return 'user_review';
  if (score >= 35) return 'user_correction';
  return 'manual';
}
