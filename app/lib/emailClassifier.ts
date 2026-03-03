/**
 * Email Classifier — determines whether a Gmail email is a real bill,
 * a payment receipt, an order confirmation, a promotion, or something else.
 *
 * Architecture: deterministic keyword rules first (fast, no API cost).
 * Rules are ordered from most-specific to least-specific to avoid false positives.
 *
 * Only real bills proceed to the extraction pipeline.
 * Receipts, orders, and promos are silently skipped (counted but not stored).
 */

export type EmailType = 'bill' | 'receipt' | 'order' | 'promo' | 'other';

/**
 * Classify an email based on its headers and body text.
 *
 * @param subject  Email subject line
 * @param snippet  Gmail snippet (first ~200 chars of email)
 * @param body     Full decoded email body (plain text, already stripped of HTML)
 * @returns EmailType
 */
export function classifyEmail(
  subject: string,
  snippet: string,
  body: string,
): EmailType {
  const sub  = subject.toLowerCase();
  const snip = snippet.toLowerCase();
  const b    = body.slice(0, 1500).toLowerCase();

  // ── 1. Receipts / payment confirmations (most specific — check first) ──────
  // These look like bills but are NOT — they confirm a payment already made.
  const receiptSubjectKws = [
    'payment received', 'payment confirmed', 'payment confirmation',
    'thank you for your payment', 'thanks for your payment',
    'payment successful', 'payment processed', 'payment complete',
    'autopay confirmed', 'auto-pay confirmed', 'auto-pay processed',
    'automatic payment', 'pre-authorized payment', 'pre-authorized debit',
    'payment has been received', 'we received your payment',
    'transaction confirmed', 'transaction complete',
    'your payment of', 'payment of $',
  ];
  if (receiptSubjectKws.some(kw => sub.includes(kw) || snip.includes(kw))) {
    return 'receipt';
  }

  // ── 2. Order confirmations / shipping / delivery ───────────────────────────
  // e.g. "Your Rogers order confirmation", "Your order has shipped"
  const orderSubjectKws = [
    'order confirmation', 'order confirmed', 'your order',
    'order #', 'order number', 'purchase confirmation',
    'shipment', 'has shipped', 'tracking number', 'out for delivery',
    'delivery confirmed', 'delivered', 'pick up',
  ];
  if (orderSubjectKws.some(kw => sub.includes(kw))) {
    return 'order';
  }

  // ── 3. Promotional / marketing emails ─────────────────────────────────────
  const promoSubjectKws = [
    'special offer', 'exclusive offer', 'limited time', '% off', 'save now',
    'upgrade your plan', 'upgrade your service', 'referral',
    "you've earned", 'you have earned', 'reward', 'deal', 'promotion',
    'black friday', 'cyber monday', 'sale ends',
  ];
  if (promoSubjectKws.some(kw => sub.includes(kw))) {
    return 'promo';
  }

  // ── 4. Definite bills — high-signal subject keywords ──────────────────────
  const billSubjectKws = [
    'bill', 'statement', 'ebill', 'e-bill', 'invoice', 'amount due',
    'payment due', 'new charges', 'account summary', 'billing notice',
    'billing statement', 'new bill', 'current bill', 'your invoice',
    'balance due', 'payment reminder', 'balance owing',
    'final notice', 'past due', 'overdue', 'collection notice',
    'your monthly', 'monthly statement', 'account notice',
  ];
  if (billSubjectKws.some(kw => sub.includes(kw))) {
    return 'bill';
  }

  // ── 5. Bill signals found in body text (lower confidence) ─────────────────
  // These can appear in any email so we only use them when subject is ambiguous.
  const billBodyKws = [
    'amount due', 'due date', 'pay by', 'payment due',
    'current charges', 'new charges', 'total due', 'balance due',
    'please pay', 'your bill is', 'amount owing', 'pay your bill',
  ];
  if (billBodyKws.some(kw => b.includes(kw))) {
    return 'bill';
  }

  return 'other';
}

/**
 * Human-readable label for UI display.
 */
export function emailTypeLabel(type: EmailType): string {
  switch (type) {
    case 'bill':    return 'Bill';
    case 'receipt': return 'Receipt';
    case 'order':   return 'Order';
    case 'promo':   return 'Promo';
    default:        return 'Other';
  }
}
