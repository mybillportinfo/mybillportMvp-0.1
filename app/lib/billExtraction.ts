export interface BillExtractionResult {
  vendor: string;
  amount: number | null;
  dueDate: string | null;
  billingPeriod: string | null;
  accountNumber: string | null;
  currency: string;
  category: string | null;
  subcategory: string | null;
  confidence: {
    overall: number;
    vendor: number;
    amount: number;
    dueDate: number;
  };
  rawText?: string;
  matchedProviderId?: string;
  matchedProviderName?: string;
  isCustomProvider?: boolean;
}

export interface ExtractionRequest {
  fileData: string;
  fileType: 'image' | 'pdf';
  mimeType: string;
}

export interface ExtractionResponse {
  success: boolean;
  data?: BillExtractionResult;
  error?: string;
}
