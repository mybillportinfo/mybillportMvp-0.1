import { ParsedBill, BillerParser } from './types';

export const parseEnbridge: BillerParser = (text: string): ParsedBill | null => {
  const identifiers = /enbridge\s*(gas)?/i;
  if (!identifiers.test(text)) return null;

  const accountRegex = /Account\s*[:#]?\s*([0-9]{2}\s*[0-9]{2}\s*[0-9]{2}\s*[0-9]{5}\s*[0-9])/i;
  const amountRegex = /(?:Amount\s*(?:Due|Owing)|Total\s*(?:Due|Amount|Owing)|Balance\s*(?:Due|Forward))\s*\$?\s*([\d,]+\.\d{2})/i;
  const dueDateRegex = /(?:Due\s*(?:Date|By)|Payment\s*Due|Pay\s*(?:By|Before))\s*:?\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4})/i;
  const periodRegex = /(?:Billing\s*Period|Service\s*Period|For\s*the\s*period)\s*:?\s*([\w\s,]+\d{4}\s*(?:to|-|–)\s*[\w\s,]+\d{4})/i;

  const account = accountRegex.exec(text)?.[1]?.replace(/\s+/g, ' ').trim() || null;
  const amountMatch = amountRegex.exec(text)?.[1];
  const amount = amountMatch ? parseFloat(amountMatch.replace(/,/g, '')) : null;
  const dueDateRaw = dueDateRegex.exec(text)?.[1]?.trim() || null;
  const period = periodRegex.exec(text)?.[1]?.trim() || null;

  let dueDate: string | null = null;
  if (dueDateRaw) {
    try {
      const d = new Date(dueDateRaw);
      if (!isNaN(d.getTime())) dueDate = d.toISOString().split('T')[0];
    } catch {}
  }

  let confidence = 0.5;
  if (account) confidence += 0.15;
  if (amount && amount > 0) confidence += 0.2;
  if (dueDate) confidence += 0.15;

  return {
    vendor: 'Enbridge Gas',
    amount,
    dueDate,
    billingPeriod: period,
    accountNumber: account,
    currency: 'CAD',
    category: 'utilities',
    confidence: Math.min(confidence, 1),
  };
};
