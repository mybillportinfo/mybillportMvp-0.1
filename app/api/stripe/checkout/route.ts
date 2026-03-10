import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyFirebaseToken } from '../../../lib/authVerify';
import { getAdminDb } from '../../../lib/adminSdk';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-01-28.clover' });

export async function POST(req: NextRequest) {
  const auth = await verifyFirebaseToken(req.headers.get('authorization'));
  if (!auth.valid || !auth.uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: 'Stripe price not configured. Set STRIPE_PRICE_ID env var.' }, { status: 500 });
  }

  const appUrl = process.env.APP_URL || 'https://mybillport.com';

  try {
    const db = getAdminDb();
    const profileDoc = await db.collection('userProfiles').doc(auth.uid).get();
    const profile = profileDoc.data();
    let customerId: string | undefined = profile?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: auth.email || profile?.email || '',
        metadata: { firebaseUid: auth.uid },
      });
      customerId = customer.id;
      await db.collection('userProfiles').doc(auth.uid).set(
        { stripeCustomerId: customerId },
        { merge: true }
      );
    }

    const referralFreeMonths: number = profile?.referralFreeMonths || 0;
    const trialDays = referralFreeMonths > 0 ? referralFreeMonths * 30 : undefined;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/settings?tab=billing`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { firebaseUid: auth.uid },
        ...(trialDays ? { trial_period_days: trialDays } : {}),
      },
    });

    if (referralFreeMonths > 0) {
      await db.collection('userProfiles').doc(auth.uid).update({ referralFreeMonths: 0 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[stripe/checkout]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
