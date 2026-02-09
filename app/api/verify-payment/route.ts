import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

async function getStripeClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken || !hostname) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) throw new Error('No Stripe credentials available');
    return new Stripe(secretKey);
  }

  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
  const targetEnvironment = isProduction ? 'production' : 'development';

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', 'stripe');
  url.searchParams.set('environment', targetEnvironment);

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'X_REPLIT_TOKEN': xReplitToken
    }
  });

  const data = await response.json();
  const connectionSettings = data.items?.[0];

  if (!connectionSettings?.settings?.secret) {
    throw new Error('Stripe connection not found');
  }

  return new Stripe(connectionSettings.settings.secret);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    const stripe = await getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        verified: false,
        error: 'Payment not completed',
      });
    }

    return NextResponse.json({
      verified: true,
      billId: session.metadata?.billId,
      userId: session.metadata?.userId,
      amountPaid: parseFloat(session.metadata?.amountPaid || '0'),
      companyName: session.metadata?.companyName || '',
    });
  } catch (error: unknown) {
    console.error('Verify payment error:', error);
    const message = error instanceof Error ? error.message : 'Failed to verify payment';
    return NextResponse.json({ error: message, verified: false }, { status: 500 });
  }
}
