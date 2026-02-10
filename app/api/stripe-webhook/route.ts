import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeClient } from '../../lib/stripeServer';

// Stripe webhook endpoint
// Handles: payment_intent.succeeded, payment_intent.payment_failed
// This serves as a backup confirmation path
// Primary bill updates happen client-side after Stripe confirms the payment
// The webhook logs events and can reconcile any missed updates

export async function POST(req: NextRequest) {
  try {
    // Read raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('Webhook: Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Get webhook secret from environment
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Webhook: STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature and construct event
    const stripe = await getStripeClient();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // Handle specific event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { billId, userId, paymentType, paymentAmountDollars } = paymentIntent.metadata;

        if (!billId || !userId) {
          console.error('Webhook: PaymentIntent missing required metadata', paymentIntent.id);
          break;
        }

        const paymentAmount = parseFloat(paymentAmountDollars || '0') || paymentIntent.amount / 100;

        console.log(`[WEBHOOK] Payment succeeded: PI=${paymentIntent.id}, bill=${billId}, user=${userId}, type=${paymentType}, amount=$${paymentAmount.toFixed(2)}`);

        // Bill update is handled client-side (user is authenticated in Firestore)
        // This webhook log serves as an audit trail and backup confirmation
        // In production with Firebase Admin SDK, you would update Firestore here
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { billId, userId } = paymentIntent.metadata;

        console.error(`[WEBHOOK] Payment failed: PI=${paymentIntent.id}, bill=${billId}, user=${userId}, reason=${paymentIntent.last_payment_error?.message}`);
        break;
      }

      default:
        break;
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing error' },
      { status: 500 }
    );
  }
}
