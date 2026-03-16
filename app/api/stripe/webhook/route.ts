export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminDb } from '../../../lib/adminSdk';

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2026-01-28.clover' });
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    console.warn('[stripe/webhook] Stripe not configured — skipping');
    return NextResponse.json({ received: true });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('[stripe/webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const db = getAdminDb();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = session.metadata?.uid;
        if (!uid) break;

        const subscriptionId = session.subscription as string | null;
        const customerId = session.customer as string | null;

        await db.collection('userProfiles').doc(uid).set({
          subscription: {
            status: 'active',
            plan: 'premium',
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            activatedAt: new Date().toISOString(),
          },
        }, { merge: true });

        console.log(`[stripe/webhook] checkout.session.completed — uid=${uid} subscriptionId=${subscriptionId}`);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const uid = sub.metadata?.uid;
        if (!uid) break;

        const isActive = sub.status === 'active' || sub.status === 'trialing';

        await db.collection('userProfiles').doc(uid).set({
          subscription: {
            status: isActive ? 'active' : sub.status,
            plan: isActive ? 'premium' : 'free',
            stripeSubscriptionId: sub.id,
            updatedAt: new Date().toISOString(),
          },
        }, { merge: true });

        console.log(`[stripe/webhook] subscription.updated — uid=${uid} status=${sub.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const uid = sub.metadata?.uid;
        if (!uid) break;

        await db.collection('userProfiles').doc(uid).set({
          subscription: {
            status: 'cancelled',
            plan: 'free',
            stripeSubscriptionId: sub.id,
            cancelledAt: new Date().toISOString(),
          },
        }, { merge: true });

        console.log(`[stripe/webhook] subscription.deleted — uid=${uid}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const uid = (invoice as any).subscription_details?.metadata?.uid
          || (invoice as any).metadata?.uid;
        if (!uid) break;

        await db.collection('userProfiles').doc(uid).set({
          subscription: {
            status: 'past_due',
            updatedAt: new Date().toISOString(),
          },
        }, { merge: true });

        console.log(`[stripe/webhook] invoice.payment_failed — uid=${uid}`);
        break;
      }

      default:
        console.log(`[stripe/webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error('[stripe/webhook] Handler error:', err.message);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
