/**
 * Deterministic regex extraction for bill fields.
 * Runs before AI — fields found here take priority over AI results.
 */

export interface RegexExtracted {
  accountNumber: string | null;
  amountDue: number | null;
  dueDate: string | null;
  statementDate: string | null;
  minimumPayment: number | null;
  totalBalance: number | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseAmount(raw: string): number | null {
  const n = parseFloat(raw.replace(/,/g, ''));
  return isFinite(n) && n > 0 ? n : null;
}

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

  // "March 18, 2026" or "18 March 2026" or "March 18 2026"
  const named = s.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})$/);
  if (named) {
    const mo = MONTH_MAP[named[1].toLowerCase()];
    if (mo) return `${named[3]}-${mo}-${named[2].padStart(2, '0')}`;
  }
  const named2 = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (named2) {
    const mo = MONTH_MAP[named2[2].toLowerCase()];
    if (mo) return `${named2[3]}-${mo}-${named2[1].padStart(2, '0')}`;
  }

  return null;
}

function findDate(text: string, keywords: string[]): string | null {
  const kw = keywords.join('|');

  // After keyword: "Due Date: March 18, 2026"
  const patterns = [
    new RegExp(`(?:${kw})[^\\d\\n]{0,20}([A-Za-z]+\\s+\\d{1,2},?\\s*\\d{4})`, 'i'),
    new RegExp(`(?:${kw})[^\\d\\n]{0,10}(\\d{4}[-\\/]\\d{1,2}[-\\/]\\d{1,2})`, 'i'),
    new RegExp(`(?:${kw})[^\\d\\n]{0,10}(\\d{1,2}[-\\/]\\d{1,2}[-\\/]\\d{2,4})`, 'i'),
    new RegExp(`(?:${kw})[^\\d\\n]{0,10}(\\d{1,2}\\s+[A-Za-z]+\\s+\\d{4})`, 'i'),
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

  // "Amount Due: $80.81" or "Amount Due $80.81"
  const prefixPatterns = [
    new RegExp(`(?:${kw})[^\\d\\n]{0,20}\\$?\\s*([\\d,]+\\.\\d{2})`, 'i'),
    // "$80.81 due"
    new RegExp(`\\$\\s*([\\d,]+\\.\\d{2})\\s*(?:${kw})`, 'i'),
  ];

  for (const p of prefixPatterns) {
    const m = text.match(p);
    if (m?.[1]) {
      const v = parseAmount(m[1]);
      if (v) return v;
    }
  }

  // Dollar suffix: "80.81$"
  const suffixPattern = new RegExp(`(?:${kw})[^\\d\\n]{0,20}([\\d,]+\\.\\d{2})\\s*\\$`, 'i');
  const sm = text.match(suffixPattern);
  if (sm?.[1]) return parseAmount(sm[1]);

  return null;
}

// ─── Main Extraction Function ─────────────────────────────────────────────────

export function extractWithRegex(text: string): RegexExtracted {
  // ── Account Number ──
  // Handles: "Account: 9100643389 2", "Account #: ****1234", "Acct No: AB-12345"
  const accountPatterns = [
    /(?:account|acct)[\s#.:]*(?:number|no|num|#)?[\s:]*([A-Z0-9][\s\-A-Z0-9]{4,29})/i,
    /(?:customer|member|client|policy|contract)[\s]?(?:number|no|#|id)[\s:]*([A-Z0-9][\s\-A-Z0-9]{4,29})/i,
    /(?:invoice|bill|statement)[\s]?(?:number|no|#)[\s:]*([A-Z0-9][\s\-A-Z0-9]{3,25})/i,
    // Masked formats: "****1234", "XXXX-5678"
    /[*Xx]{2,}[\s\-]?([A-Z0-9]{3,12})/i,
  ];

  let accountNumber: string | null = null;
  for (const p of accountPatterns) {
    const m = text.match(p);
    if (m?.[1]) {
      // Clean: remove leading/trailing spaces, keep alphanumeric only for final result
      const raw = m[1].trim().replace(/\s+/g, '').replace(/[-]/g, '');
      if (raw.length >= 4 && raw.length <= 20 && /[0-9]/.test(raw)) {
        accountNumber = raw;
        break;
      }
    }
  }

  // ── Amount Due ──
  const amountDue = findAmount(text, [
    'amount due', 'new bill amount', 'payment due', 'current charges',
    'new charges', 'total due', 'balance due', 'pay this amount',
    'please pay', 'amount owed', 'current bill', 'your bill',
  ]);

  // ── Due Date ──
  const dueDate = findDate(text, [
    'due date', 'payment due', 'pay by', 'pay on or before',
    'due on', 'due before', 'payment by', 'by',
  ]);

  // ── Statement Date ──
  const statementDate = findDate(text, [
    'statement date', 'billing date', 'bill date', 'invoice date', 'issued',
  ]);

  // ── Minimum Payment ──
  const minimumPayment = findAmount(text, [
    'minimum payment', 'minimum amount', 'minimum due', 'min payment', 'min due',
  ]);

  // ── Total Balance ──
  const totalBalance = findAmount(text, [
    'total balance', 'account balance', 'current balance', 'outstanding balance',
    'total amount', 'total owing',
  ]);

  return { accountNumber, amountDue, dueDate, statementDate, minimumPayment, totalBalance };
}
