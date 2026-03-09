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

  const appUrl = process.env.APP_URL || 'https://mybillport.com';

  try {
    const db = getAdminDb();
    const profileDoc = await db.collection('userProfiles').doc(auth.uid).get();
    const customerId = profileDoc.data()?.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json({ error: 'No billing account found. Please subscribe first.' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/settings?tab=billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[stripe/portal]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
