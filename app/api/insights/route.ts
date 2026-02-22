import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

interface BillData {
  companyName: string;
  totalAmount: number;
  dueDate: string;
  status: string;
  category?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
  avgRecurringAmount?: number;
  amountDeviationPercent?: number;
}

function generateDeterministicInsights(bills: BillData[], billerName: string) {
  const billerBills = bills.filter(b => b.companyName.toLowerCase() === billerName.toLowerCase());
  const sorted = [...billerBills].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const amounts = sorted.map(b => b.totalAmount);

  if (amounts.length < 2) {
    return {
      summary: `You have 1 bill from ${billerName} for $${amounts[0]?.toFixed(2) || '0.00'}.`,
      trend: 'Not enough data to determine a trend yet.',
      tips: ['Add more bills from this provider to see trends and insights.'],
      percentChange: null,
      avgAmount: amounts[0] || 0,
      minAmount: amounts[0] || 0,
      maxAmount: amounts[0] || 0,
    };
  }

  const avg = amounts.reduce((s, v) => s + v, 0) / amounts.length;
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const latest = amounts[amounts.length - 1];
  const previous = amounts[amounts.length - 2];
  const pctChange = previous > 0 ? ((latest - previous) / previous) * 100 : 0;

  const last3 = amounts.slice(-3);
  const last3Avg = last3.reduce((s, v) => s + v, 0) / last3.length;

  let trend = '';
  if (Math.abs(pctChange) < 2) {
    trend = `Your ${billerName} bill has been stable. The latest amount is close to the previous bill.`;
  } else if (pctChange > 0) {
    trend = `Your ${billerName} bill increased ${pctChange.toFixed(1)}% from $${previous.toFixed(2)} to $${latest.toFixed(2)}.`;
  } else {
    trend = `Your ${billerName} bill decreased ${Math.abs(pctChange).toFixed(1)}% from $${previous.toFixed(2)} to $${latest.toFixed(2)}.`;
  }

  const tips: string[] = [];
  if (pctChange > 15) tips.push(`This bill spiked recently. Consider reviewing your usage or plan with ${billerName}.`);
  if (max - min > avg * 0.3) tips.push('Your bills vary significantly. A fixed-rate plan might help stabilize costs.');
  if (billerBills.some(b => b.isRecurring)) tips.push('This is a recurring bill. Setting up auto-pay could help avoid late fees.');
  if (tips.length === 0) tips.push('Your spending looks consistent. Keep it up!');

  return {
    summary: `Over ${amounts.length} bills, you've spent an average of $${avg.toFixed(2)}/bill with ${billerName}. Recent average (last 3): $${last3Avg.toFixed(2)}.`,
    trend,
    tips,
    percentChange: Math.round(pctChange * 10) / 10,
    avgAmount: Math.round(avg * 100) / 100,
    minAmount: min,
    maxAmount: max,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { bills, billerName } = await request.json();

    if (!bills || !Array.isArray(bills) || !billerName) {
      return NextResponse.json({ error: 'bills array and billerName are required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const fallback = generateDeterministicInsights(bills, billerName);
      return NextResponse.json({ ...fallback, source: 'deterministic' });
    }

    const billerBills = bills.filter((b: BillData) => b.companyName.toLowerCase() === billerName.toLowerCase());
    if (billerBills.length < 2) {
      const fallback = generateDeterministicInsights(bills, billerName);
      return NextResponse.json({ ...fallback, source: 'deterministic' });
    }

    const sorted = [...billerBills].sort((a: BillData, b: BillData) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const amounts = sorted.map((b: BillData) => b.totalAmount);
    const avg = amounts.reduce((s: number, v: number) => s + v, 0) / amounts.length;

    const billSummary = sorted.map((b: BillData) => `- ${new Date(b.dueDate).toLocaleDateString('en-CA')}: $${b.totalAmount.toFixed(2)} (${b.status})`).join('\n');

    const prompt = `You are a Canadian personal finance assistant for a bill management app called MyBillPort. Analyze these bills from "${billerName}" and provide insights.

Bill History (oldest to newest):
${billSummary}

Average amount: $${avg.toFixed(2)} CAD
Category: ${sorted[0]?.category || 'Unknown'}
Recurring: ${sorted[0]?.isRecurring ? 'Yes' : 'Not confirmed'}

Respond in JSON format with these exact fields:
{
  "summary": "A 1-2 sentence overview of spending with this biller",
  "trend": "Description of the trend (increasing, decreasing, stable, volatile)",
  "tips": ["Array of 2-3 actionable tips specific to this biller/category"],
  "percentChange": <number or null>,
  "avgAmount": <number>,
  "minAmount": <number>,
  "maxAmount": <number>
}

Keep tips practical and specific to Canadian consumers. Be concise.`;

    try {
      const client = new Anthropic({ apiKey });
      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });

      const textBlock = message.content.find((b: any) => b.type === 'text');
      if (textBlock && textBlock.type === 'text') {
        const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ ...parsed, source: 'ai' });
        }
      }
    } catch (aiError) {
      console.error('AI insights error, falling back:', aiError);
    }

    const fallback = generateDeterministicInsights(bills, billerName);
    return NextResponse.json({ ...fallback, source: 'deterministic' });
  } catch (error) {
    console.error('Insights API error:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
