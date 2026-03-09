import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { verifyFirebaseToken } from '../../lib/authVerify';
import { getAdminDb } from '../../lib/adminSdk';

export const runtime = 'nodejs';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const auth = await verifyFirebaseToken(req.headers.get('authorization'));
  if (!auth.valid || !auth.uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { billId } = await req.json();
  if (!billId) return NextResponse.json({ error: 'billId required' }, { status: 400 });

  try {
    const db = getAdminDb();
    const billDoc = await db.collection('bills').doc(billId).get();
    if (!billDoc.exists || billDoc.data()?.userId !== auth.uid) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    const bill = billDoc.data()!;
    const paymentsSnap = await db.collection('bills').doc(billId).collection('payments').orderBy('paidAt', 'desc').limit(6).get();
    const payments = paymentsSnap.docs.map(d => d.data());
    const totalPaid = payments.reduce((s: number, p: any) => s + (p.amount || 0), 0);
    const monthsAsCustomer = payments.length;

    const prompt = `You are a bill negotiation expert helping a Canadian customer lower their bill. Generate a short, polite, and effective negotiation script they can use to call or email their provider.

Bill details:
- Provider: ${bill.companyName}
- Category: ${bill.category || 'service'}
- Current monthly amount: $${bill.totalAmount}
- Account number: ${bill.accountNumber || 'not provided'}
- Months as customer: ${monthsAsCustomer > 0 ? monthsAsCustomer : 'multiple'}
- Total paid to date: ${totalPaid > 0 ? '$' + totalPaid.toFixed(2) : 'significant amount'}

Write a 4-6 sentence script that:
1. States loyalty as a long-term customer
2. Mentions they are considering switching to a competitor
3. Asks for a loyalty discount or rate review
4. Keeps a polite but firm tone
5. Is specific to the Canadian market

Return only the script text, no additional commentary.`;

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    const script = response.content[0].type === 'text' ? response.content[0].text : '';
    return NextResponse.json({ script });
  } catch (err: any) {
    console.error('[negotiate]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
