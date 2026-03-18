export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyFirebaseToken } from '../../lib/authVerify';

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2026-01-28.clover' });
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: 'Card payments are not yet enabled. Please try another method.' },
      { status: 503 }
    );
  }

  const auth = await verifyFirebaseToken(req.headers.get('authorization'));
  if (!auth.valid || !auth.uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { amount, billerName, billId } = await req.json();

  if (!amount || !billerName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const amountCents = Math.round(parseFloat(amount) * 100);
  if (isNaN(amountCents) || amountCents < 50) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const origin = req.headers.get('origin') || 'https://mybillport.com';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: { name: `${billerName} — Bill Payment` },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      metadata: { uid: auth.uid, billId: billId || '' },
      success_url: `${origin}/payment-success?billId=${billId || ''}&biller=${encodeURIComponent(billerName)}&amount=${amount}`,
      cancel_url: `${origin}/payment?biller=${encodeURIComponent(billerName)}&amount=${amount}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[create-payment-session]', err.message);
    return NextResponse.json({ error: 'Failed to create payment session' }, { status: 500 });
  }
}
