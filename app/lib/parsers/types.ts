export interface ParsedBill {
  vendor: string;
  amount: number | null;
  dueDate: string | null;
  billingPeriod: string | null;
  accountNumber: string | null;
  currency: string;
  category: string;
  confidence: number;
}

export type BillerParser = (text: string) => ParsedBill | null;
