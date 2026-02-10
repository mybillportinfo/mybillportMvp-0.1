import { NextResponse } from 'next/server';
import { getStripePublishableKey } from '../../lib/stripeServer';

// GET /api/stripe-publishable-key
// Returns the Stripe publishable key for frontend Stripe.js initialization
export async function GET() {
  try {
    const publishableKey = await getStripePublishableKey();

    if (!publishableKey) {
      return NextResponse.json(
        { error: 'Stripe publishable key not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({ publishableKey });
  } catch (error: any) {
    console.error('Failed to get Stripe publishable key:', error);
    return NextResponse.json(
      { error: 'Failed to get Stripe configuration' },
      { status: 500 }
    );
  }
}
