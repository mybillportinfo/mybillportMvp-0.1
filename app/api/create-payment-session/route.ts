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
    console.error('[create-payment-session] STRIPE_SECRET_KEY not set');
    return NextResponse.json(
      { error: 'Card payments are not configured. Please contact support.' },
      { status: 503 }
    );
  }

  const authHeader = req.headers.get('authorization');
  const auth = await verifyFirebaseToken(authHeader);
  if (!auth.valid || !auth.uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { amount?: string; billerName?: string; billId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { amount, billerName, billId } = body;

  if (!amount || !billerName) {
    return NextResponse.json({ error: 'Missing required fields: amount, billerName' }, { status: 400 });
  }

  const amountCents = Math.round(parseFloat(amount) * 100);
  if (isNaN(amountCents) || amountCents < 50) {
    return NextResponse.json({ error: 'Amount must be at least $0.50 CAD' }, { status: 400 });
  }

  // Derive base URL — prefer forwarded host for production/Vercel
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'mybillport.com';
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const origin = `${proto}://${host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'cad',
          product_data: { name: `${billerName} — Bill Payment`, description: `Bill payment via MyBillPort` },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      metadata: { uid: auth.uid, billId: billId || '' },
      success_url: `${origin}/payment-success?billId=${encodeURIComponent(billId || '')}&biller=${encodeURIComponent(billerName)}&amount=${encodeURIComponent(amount)}`,
      cancel_url: `${origin}/payment?biller=${encodeURIComponent(billerName)}&amount=${encodeURIComponent(amount)}&billId=${encodeURIComponent(billId || '')}`,
    });

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[create-payment-session] Stripe error:', err.message);
    return NextResponse.json(
      { error: err.message || 'Failed to create payment session. Please try again.' },
      { status: 500 }
    );
  }
}
