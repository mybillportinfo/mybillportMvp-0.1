import Anthropic from '@anthropic-ai/sdk';

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface BillScanResult {
  company: string;
  amount: number;
  dueDate: string;
  accountNumber: string;
  category: string;
  type: string;
  confidence: number;
  extractedText: string;
}

export async function scanBillImage(base64Image: string): Promise<BillScanResult> {
  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this bill image and extract the following information. Return ONLY a JSON object with these exact fields:

{
  "company": "Company name (e.g., 'Hydro One', 'Rogers', 'Bell Canada')",
  "amount": "Amount due as a number (e.g., 125.50)",
  "dueDate": "Due date in YYYY-MM-DD format (e.g., '2025-08-15')",
  "accountNumber": "Account number with partial masking (e.g., '****-****-1234')",
  "category": "Bill category (e.g., 'Electricity', 'Mobile', 'Internet', 'Water', 'Gas', 'Credit Card')",
  "type": "Bill type (utility, phone, credit_card, internet, water, gas)",
  "confidence": "Confidence level as percentage (0-100)",
  "extractedText": "Key text found on the bill"
}

Focus on Canadian companies and standard bill formats. If you can't find specific information, use reasonable defaults but lower the confidence score accordingly.`
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }]
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        const result = JSON.parse(content.text);
        
        // Validate and clean the result
        return {
          company: result.company || 'Unknown Company',
          amount: parseFloat(result.amount) || 0,
          dueDate: result.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          accountNumber: result.accountNumber || '****-****-0000',
          category: result.category || 'General',
          type: result.type || 'utility',
          confidence: Math.min(100, Math.max(0, parseInt(result.confidence) || 85)),
          extractedText: result.extractedText || 'Bill information extracted'
        };
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        throw new Error('Failed to parse bill information from image');
      }
    } else {
      throw new Error('Unexpected response format from AI');
    }
  } catch (error) {
    console.error('AI bill scanning error:', error);
    throw new Error('Failed to analyze bill image: ' + (error as Error).message);
  }
}