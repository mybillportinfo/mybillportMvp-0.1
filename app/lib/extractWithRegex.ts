/**
 * Deterministic regex extraction for bill fields.
 * Runs before AI — fields found here take priority over AI results.
 *
 * Key design decisions:
 * - All account number patterns terminate at \n, 3+ spaces, or end-of-string
 *   to prevent greedy over-capture that blows the length check.
 * - Label-on-one-line / number-on-next-line patterns handle HTML table emails
 *   where <td>Account Number</td><td>91 00 64 33899 2</td> converts to two lines.
 * - Raw account text is preserved with spaces for display; cleaned (digits only)
 *   used for dedup and storage.
 */

export interface RegexExtracted {
  accountNumber: string | null;      // cleaned alphanumeric, e.g. "910064338992"
  accountNumberDisplay: string | null; // original format, e.g. "91 00 64 33899 2"
  amountDue: number | null;
  dueDate: string | null;
  statementDate: string | null;
  minimumPayment: number | null;
  totalBalance: number | null;
}

// ─── Amount helpers ───────────────────────────────────────────────────────────

function parseAmount(raw: string): number | null {
  const n = parseFloat(raw.replace(/,/g, ''));
  return isFinite(n) && n > 0 ? n : null;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

const MONTH_MAP: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04',
  jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

export function parseDate(raw: string): string | null {
  const s = raw.trim();

  // YYYY-MM-DD or YYYY/MM/DD
  const iso = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
  if (iso) {
    const [, y, m, d] = iso;
    if (+m >= 1 && +m <= 12 && +d >= 1 && +d <= 31)
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // MM/DD/YYYY or DD/MM/YYYY
  const mdy = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (mdy) {
    const [, a, b, y] = mdy;
    if (+a >= 1 && +a <= 12) return `${y}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`;
    if (+b >= 1 && +b <= 12) return `${y}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`;
  }

  // MM/DD/YY
  const mdyShort = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2})$/);
  if (mdyShort) {
    const [, m, d, y] = mdyShort;
    const year = +y >= 50 ? `19${y}` : `20${y}`;
    if (+m >= 1 && +m <= 12) return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // "March 18, 2026" or "March 18 2026"
  const named = s.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})$/);
  if (named) {
    const mo = MONTH_MAP[named[1].toLowerCase()];
    if (mo) return `${named[3]}-${mo}-${named[2].padStart(2, '0')}`;
  }

  // "18 March 2026"
  const named2 = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (named2) {
    const mo = MONTH_MAP[named2[2].toLowerCase()];
    if (mo) return `${named2[3]}-${mo}-${named2[1].padStart(2, '0')}`;
  }

  return null;
}

function findDate(text: string, keywords: string[]): string | null {
  const kw = keywords.join('|');
  const patterns = [
    new RegExp(`(?:${kw})[^\\d\\n]{0,20}([A-Za-z]+\\s+\\d{1,2},?\\s*\\d{4})`, 'i'),
    new RegExp(`(?:${kw})[^\\d\\n]{0,10}(\\d{4}[-\\/]\\d{1,2}[-\\/]\\d{1,2})`, 'i'),
    new RegExp(`(?:${kw})[^\\d\\n]{0,10}(\\d{1,2}[-\\/]\\d{1,2}[-\\/]\\d{2,4})`, 'i'),
    new RegExp(`(?:${kw})[^\\d\\n]{0,10}(\\d{1,2}\\s+[A-Za-z]+\\s+\\d{4})`, 'i'),
    // Label on one line, date on next line
    new RegExp(`(?:${kw})\\s*[:\\-]?\\s*\\n+\\s*([A-Za-z]+\\s+\\d{1,2},?\\s*\\d{4})`, 'im'),
    new RegExp(`(?:${kw})\\s*[:\\-]?\\s*\\n+\\s*(\\d{4}[-\\/]\\d{1,2}[-\\/]\\d{1,2})`, 'im'),
    new RegExp(`(?:${kw})\\s*[:\\-]?\\s*\\n+\\s*(\\d{1,2}[-\\/]\\d{1,2}[-\\/]\\d{2,4})`, 'im'),
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) {
      const d = parseDate(m[1]);
      if (d) return d;
    }
  }
  return null;
}

function findAmount(text: string, keywords: string[]): number | null {
  const kw = keywords.join('|');
  const patterns = [
    // "Amount Due: $80.81"
    new RegExp(`(?:${kw})[^\\d\\n]{0,25}\\$?\\s*([\\d,]+\\.\\d{2})`, 'i'),
    // "$80.81 due"
    new RegExp(`\\$\\s*([\\d,]+\\.\\d{2})\\s*(?:${kw})`, 'i'),
    // Dollar suffix: "80.81$"
    new RegExp(`(?:${kw})[^\\d\\n]{0,25}([\\d,]+\\.\\d{2})\\s*\\$`, 'i'),
    // Label on one line, amount on next line
    new RegExp(`(?:${kw})\\s*[:\\-]?\\s*\\n+\\s*\\$?([\\d,]+\\.\\d{2})`, 'im'),
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) {
      const v = parseAmount(m[1]);
      if (v) return v;
    }
  }
  return null;
}

// ─── Account number extraction ────────────────────────────────────────────────

/**
 * Clean account number raw capture:
 * - Trim whitespace
 * - Remove leading/trailing non-alphanumeric
 * - Return { display, cleaned } where display keeps internal spaces/dashes,
 *   cleaned is alphanumeric-only for storage and dedup.
 */
function cleanAccountNumber(raw: string): { display: string; cleaned: string } | null {
  const trimmed = raw.trim().replace(/[^A-Z0-9\s\-]/gi, '').trim();
  const display = trimmed.replace(/\s{2,}/g, ' ').trim();
  const cleaned = display.replace(/[\s\-]/g, '');

  // Must be 4–25 alphanumeric chars and contain at least one digit
  if (cleaned.length < 4 || cleaned.length > 25 || !/[0-9]/.test(cleaned)) return null;
  // Must not be all the same digit (e.g. "00000000" is not an account number)
  if (/^(.)\1+$/.test(cleaned)) return null;

  return { display, cleaned };
}

function tryAccountPatterns(text: string): { display: string; cleaned: string } | null {
  /**
   * All patterns use one of these terminators to prevent greedy over-capture:
   *   (?=\s*[\n\r]|\s{3,}|$)   — lookahead: EOL, 3+ spaces, or end-of-string
   *
   * Capture group is limited to [A-Z0-9][A-Z0-9\s\-]{2,24} (non-greedy not needed
   * because the lookahead enforces the boundary).
   */
  const EOL = String.raw`(?=[ \t]*[\n\r]|[ \t]{3,}|$)`;

  const patterns: RegExp[] = [
    // ── Same-line patterns (label immediately before number on same line) ──

    // "Account Number: 91 00 64 33899 2" or "Account #: 123456789"
    new RegExp(`(?:account|acct)[\\s#.]*(?:number|no|num|#)?[\\s:]+([A-Z0-9][A-Z0-9 \\-]{2,24})${EOL}`, 'im'),

    // "Customer/Member/Policy/Contract Number: XXXX"
    new RegExp(`(?:customer|member|client|policy|contract)[\\s]?(?:number|no|#|id)[\\s:]+([A-Z0-9][A-Z0-9 \\-]{2,24})${EOL}`, 'im'),

    // "Invoice/Bill/Statement Number: XXXX"
    new RegExp(`(?:invoice|bill|ref(?:erence)?)\\s*(?:number|no|#)[\\s:]+([A-Z0-9][A-Z0-9 \\-]{2,24})${EOL}`, 'im'),

    // ── Next-line patterns (label on one line, number on next) ──
    // Very common in HTML table emails where label and value are in separate <td>

    // "Account Number\n91 00 64 33899 2"
    new RegExp(`(?:account|acct)[\\s]*(?:number|no|num|#)?\\s*[:\\-]?\\s*[\\n\\r]+\\s*([A-Z0-9][A-Z0-9 \\-]{2,24})${EOL}`, 'im'),

    // "Customer Number\nXXXX"
    new RegExp(`(?:customer|member|client)\\s*(?:number|no|#|id)?\\s*[:\\-]?\\s*[\\n\\r]+\\s*([A-Z0-9][A-Z0-9 \\-]{2,24})${EOL}`, 'im'),

    // ── Utility-specific: "XX XX XX XXXXX X" spaced digit format ──
    // Matches after "account" keyword anywhere in 200-char window
    new RegExp(`account[^\\n]{0,80}?(\\d{2}\\s\\d{2}\\s\\d{2}\\s\\d{5}\\s\\d)`, 'i'),

    // ── Masked account formats: "****1234", "XXXX-5678", ending with 4+ digits ──
    /[*Xx]{2,}[\s\-]?([A-Z0-9]{4,12})/i,

    // ── Fallback: "Acct: XXXXX" short form ──
    /\bacct\b[\s:]+([A-Z0-9][A-Z0-9 \-]{2,18})/i,
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) {
      const result = cleanAccountNumber(m[1]);
      if (result) return result;
    }
  }
  return null;
}

// ─── Main Extraction Function ─────────────────────────────────────────────────

export function extractWithRegex(text: string): RegexExtracted {
  // Run account number extraction
  const acctResult = tryAccountPatterns(text);
  const accountNumber        = acctResult?.cleaned ?? null;
  const accountNumberDisplay = acctResult?.display ?? null;

  // Amount due
  const amountDue = findAmount(text, [
    'amount due', 'new bill amount', 'payment due', 'current charges',
    'new charges', 'total due', 'balance due', 'pay this amount',
    'please pay', 'amount owed', 'current bill', 'your bill', 'new amount',
  ]);

  // Due date
  const dueDate = findDate(text, [
    'due date', 'payment due', 'pay by', 'pay on or before',
    'due on', 'due before', 'payment by',
  ]);

  // Statement date
  const statementDate = findDate(text, [
    'statement date', 'billing date', 'bill date', 'invoice date', 'issued',
  ]);

  // Minimum payment
  const minimumPayment = findAmount(text, [
    'minimum payment', 'minimum amount', 'minimum due', 'min payment', 'min due',
    'minimum balance',
  ]);

  // Total balance
  const totalBalance = findAmount(text, [
    'total balance', 'account balance', 'current balance', 'outstanding balance',
    'total amount', 'total owing',
  ]);

  return {
    accountNumber,
    accountNumberDisplay,
    amountDue,
    dueDate,
    statementDate,
    minimumPayment,
    totalBalance,
  };
}
