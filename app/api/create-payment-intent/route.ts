import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient } from '../../lib/stripeServer';
import crypto from 'crypto';

// POST /api/create-payment-intent
// Creates a Stripe PaymentIntent for a bill payment
// The client sends bill details; Stripe processes the payment
// Bill status updates happen via: 1) client-side after confirmation, 2) webhook as backup
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { billId, userId, paymentType, amount } = body;

    // Validate required fields
    if (!billId || !userId || !paymentType) {
      return NextResponse.json(
        { error: 'Missing required fields: billId, userId, paymentType' },
        { status: 400 }
      );
    }

    if (paymentType !== 'full' && paymentType !== 'partial') {
      return NextResponse.json(
        { error: 'paymentType must be "full" or "partial"' },
        { status: 400 }
      );
    }

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'amount must be a positive number' },
        { status: 400 }
      );
    }

    // Convert to cents for Stripe
    const amountCents = Math.round(amount * 100);

    // Stripe minimum is 50 cents (CAD)
    if (amountCents < 50) {
      return NextResponse.json(
        { error: 'Minimum payment amount is $0.50 CAD' },
        { status: 400 }
      );
    }

    // Generate deterministic idempotency key to prevent duplicate charges on retries
    // Uses billId + userId + paymentType + amountCents for determinism
    // Client can optionally send an idempotencyToken for extra uniqueness between separate payments
    const idempotencyToken = body.idempotencyToken || '';
    const idempotencyKey = crypto
      .createHash('sha256')
      .update(`${billId}-${userId}-${paymentType}-${amountCents}-${idempotencyToken}`)
      .digest('hex');

    // Create Stripe PaymentIntent
    const stripe = await getStripeClient();
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amountCents,
        currency: 'cad',
        metadata: {
          billId,
          userId,
          paymentType,
          paymentAmountDollars: (amountCents / 100).toFixed(2),
        },
        description: `Bill payment (${paymentType}) - ${billId}`,
      },
      {
        idempotencyKey,
      }
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountCents / 100,
    });
  } catch (error: any) {
    console.error('create-payment-intent error:', error);

    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
