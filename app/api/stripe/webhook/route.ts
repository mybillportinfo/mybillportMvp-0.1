import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminDb } from '../../../lib/adminSdk';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-01-28.clover' });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('[stripe/webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    const db = getAdminDb();

    const getUidFromCustomer = async (customerId: string): Promise<string | null> => {
      const snap = await db.collection('userProfiles')
        .where('stripeCustomerId', '==', customerId)
        .limit(1)
        .get();
      return snap.empty ? null : snap.docs[0].id;
    };

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;
        let uid = session.metadata?.firebaseUid ?? null;
        if (!uid && session.customer) {
          uid = await getUidFromCustomer(session.customer as string);
        }
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        if (!uid) uid = sub.metadata?.firebaseUid ?? null;
        if (!uid) break;
        await db.collection('userProfiles').doc(uid).set({
          subscription: {
            status: 'active',
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0]?.price.id || '',
            currentPeriodEnd: (sub as any).current_period_end,
          },
          stripeCustomerId: session.customer,
        }, { merge: true });
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const uid = sub.metadata?.firebaseUid || await getUidFromCustomer(sub.customer as string);
        if (!uid) break;
        await db.collection('userProfiles').doc(uid).set({
          subscription: {
            status: sub.status === 'active' ? 'active' : sub.status === 'canceled' ? 'canceled' : 'inactive',
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0]?.price.id || '',
            currentPeriodEnd: (sub as any).current_period_end,
          },
        }, { merge: true });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const uid = sub.metadata?.firebaseUid || await getUidFromCustomer(sub.customer as string);
        if (!uid) break;
        await db.collection('userProfiles').doc(uid).set({
          subscription: {
            status: 'canceled',
            stripeSubscriptionId: sub.id,
            currentPeriodEnd: (sub as any).current_period_end,
          },
        }, { merge: true });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const uid = await getUidFromCustomer(invoice.customer as string);
        if (!uid) break;
        await db.collection('userProfiles').doc(uid).set({
          subscription: { status: 'past_due' },
        }, { merge: true });
        break;
      }
    }
  } catch (err: any) {
    console.error('[stripe/webhook] Handler error:', err.message);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
