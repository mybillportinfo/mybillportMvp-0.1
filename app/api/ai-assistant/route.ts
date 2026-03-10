import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { verifyFirebaseToken, sanitizeString } from '../../lib/authVerify';
import { getAdminDb } from '../../lib/adminSdk';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MAX_MESSAGES = 20;

function toDate(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (val instanceof Timestamp) return val.toDate();
  if (val?.seconds) return new Date(val.seconds * 1000);
  return new Date(val);
}

async function getBills(userId: string) {
  const db = getAdminDb();
  const snap = await db.collection('bills').where('userId', '==', userId).get();
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      companyName: data.companyName,
      category: data.category || 'Other',
      subcategory: data.subcategory || '',
      totalAmount: data.totalAmount,
      paidAmount: data.paidAmount || 0,
      status: data.status,
      dueDate: toDate(data.dueDate).toISOString().split('T')[0],
      isRecurring: data.isRecurring || false,
      billingCycle: data.billingCycle || 'monthly',
    };
  });
}

async function getBillsDue(userId: string) {
  const bills = await getBills(userId);
  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(in7.getDate() + 7);
  const today = now.toISOString().split('T')[0];
  const future = in7.toISOString().split('T')[0];
  return bills.filter(b => {
    const due = b.dueDate;
    return b.status !== 'paid' && due >= today && due <= future;
  });
}

async function getMonthlySpending(userId: string) {
  const bills = await getBills(userId);
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthName = now.toLocaleString('en-CA', { month: 'long', year: 'numeric' });

  let total = 0;
  const breakdown: Record<string, number> = {};

  for (const b of bills) {
    const due = new Date(b.dueDate + 'T00:00:00');
    if (due.getMonth() === month && due.getFullYear() === year) {
      total += b.totalAmount;
      breakdown[b.category] = (breakdown[b.category] || 0) + b.totalAmount;
    }
  }

  return {
    month: monthName,
    totalDue: Math.round(total * 100) / 100,
    totalPaid: Math.round(bills.filter(b => b.status === 'paid').reduce((s, b) => {
      const due = new Date(b.dueDate + 'T00:00:00');
      return (due.getMonth() === month && due.getFullYear() === year) ? s + b.paidAmount : s;
    }, 0) * 100) / 100,
    categoryBreakdown: breakdown,
  };
}

async function detectBillIncrease(userId: string) {
  const bills = await getBills(userId);
  const flagged = bills.filter(b => b.isRecurring);
  const db = getAdminDb();

  const results: any[] = [];
  for (const b of flagged) {
    const snap = await db.collection('bills').doc(b.id).collection('payments')
      .orderBy('paidAt', 'desc').limit(3).get();
    const payments = snap.docs.map(d => d.data());
    if (payments.length >= 2) {
      const latest = payments[0].amount;
      const prev = payments[1].amount;
      const pct = prev > 0 ? ((latest - prev) / prev) * 100 : 0;
      if (pct > 5) {
        results.push({
          bill: b.companyName,
          category: b.category,
          previousAmount: prev,
          currentAmount: latest,
          increasePercent: Math.round(pct * 10) / 10,
        });
      }
    } else if (b.totalAmount > 0) {
      results.push({ bill: b.companyName, category: b.category, currentAmount: b.totalAmount, note: 'No prior payments to compare' });
    }
  }
  return results;
}

async function getSubscriptions(userId: string) {
  const bills = await getBills(userId);
  const recurring = bills.filter(b => b.isRecurring || b.billingCycle === 'monthly' || b.billingCycle === 'annual');
  const monthlyTotal = recurring.reduce((s, b) => {
    const monthly = b.billingCycle === 'annual' ? b.totalAmount / 12 : b.totalAmount;
    return s + monthly;
  }, 0);
  return {
    subscriptions: recurring.map(b => ({
      name: b.companyName,
      category: b.category,
      amount: b.totalAmount,
      cycle: b.billingCycle,
      status: b.status,
    })),
    estimatedMonthlyTotal: Math.round(monthlyTotal * 100) / 100,
    estimatedAnnualTotal: Math.round(monthlyTotal * 12 * 100) / 100,
  };
}

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_bills',
    description: 'Fetch all bills for the user including their amounts, categories, due dates, and payment status.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_bills_due',
    description: 'Fetch bills due within the next 7 days that have not been paid.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_monthly_spending',
    description: 'Get total bill spending for the current month broken down by category.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'detect_bill_increase',
    description: 'Detect bills that have increased in amount compared to previous payments. Good for spotting unusual spikes.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_subscriptions',
    description: 'Get all recurring subscriptions with their monthly and annual cost estimates.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
];

const SYSTEM_PROMPT = `You are MyBillPort AI — a friendly, data-driven financial assistant for Canadian users managing their bills.

Your role:
- Answer questions about the user's bills clearly and concisely
- Proactively flag issues: overdue bills, unusual increases, high spending categories
- Suggest practical money-saving tips specific to Canada (telecom, utilities, insurance)
- Keep responses brief (2-5 sentences max unless listing data)
- Always use Canadian dollars ($CAD)
- Be warm and encouraging, never judgmental about spending

When asked about bills or spending, always use your tools to fetch real data first — never make up numbers.
Format dollar amounts as $X.XX. Format dates as "Monday, March 10" style.
If there are no bills in a category, say so honestly.`;

async function runTool(name: string, userId: string): Promise<any> {
  switch (name) {
    case 'get_bills': return getBills(userId);
    case 'get_bills_due': return getBillsDue(userId);
    case 'get_monthly_spending': return getMonthlySpending(userId);
    case 'detect_bill_increase': return detectBillIncrease(userId);
    case 'get_subscriptions': return getSubscriptions(userId);
    default: return { error: 'Unknown tool' };
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyFirebaseToken(req.headers.get('authorization'));
  if (!auth.valid || !auth.uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const message = sanitizeString(body.message, 500);
  if (!message) return NextResponse.json({ error: 'message required' }, { status: 400 });

  const history: Anthropic.MessageParam[] = Array.isArray(body.history)
    ? body.history.slice(-MAX_MESSAGES)
    : [];

  const messages: Anthropic.MessageParam[] = [
    ...history,
    { role: 'user', content: message },
  ];

  try {
    let response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });

    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUseBlocks.map(async (t) => {
          const result = await runTool(t.name, auth.uid!);
          return {
            type: 'tool_result' as const,
            tool_use_id: t.id,
            content: JSON.stringify(result),
          };
        })
      );

      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });

      response = await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages,
      });
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('');

    const updatedHistory: Anthropic.MessageParam[] = [
      ...history,
      { role: 'user' as const, content: message },
      { role: 'assistant' as const, content: text },
    ].slice(-MAX_MESSAGES);

    return NextResponse.json({ reply: text, history: updatedHistory });
  } catch (err: any) {
    console.error('[ai-assistant]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
