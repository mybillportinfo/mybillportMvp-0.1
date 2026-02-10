import Stripe from 'stripe';

// Server-side Stripe client using Replit connection API credentials
// Falls back to environment variable STRIPE_SECRET_KEY if connection API unavailable

let _stripe: Stripe | null = null;
let _publishableKey: string | null = null;

async function getCredentialsFromConnectionAPI(): Promise<{ secretKey: string; publishableKey: string } | null> {
  try {
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
    const xReplitToken = process.env.REPL_IDENTITY
      ? 'repl ' + process.env.REPL_IDENTITY
      : process.env.WEB_REPL_RENEWAL
        ? 'depl ' + process.env.WEB_REPL_RENEWAL
        : null;

    if (!hostname || !xReplitToken) return null;

    const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
    const targetEnvironment = isProduction ? 'production' : 'development';

    const url = new URL(`https://${hostname}/api/v2/connection`);
    url.searchParams.set('include_secrets', 'true');
    url.searchParams.set('connector_names', 'stripe');
    url.searchParams.set('environment', targetEnvironment);

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken,
      },
    });

    const data = await response.json();
    const connection = data.items?.[0];

    if (connection?.settings?.publishable && connection?.settings?.secret) {
      return {
        publishableKey: connection.settings.publishable,
        secretKey: connection.settings.secret,
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function getCredentials(): Promise<{ secretKey: string; publishableKey: string }> {
  // Try Replit connection API first
  const connCreds = await getCredentialsFromConnectionAPI();
  if (connCreds) return connCreds;

  // Fall back to environment variables
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.VITE_STRIPE_PUBLIC_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

  if (!secretKey) {
    throw new Error('Stripe secret key not found. Set STRIPE_SECRET_KEY or configure Stripe connection.');
  }

  return { secretKey, publishableKey };
}

// Get Stripe SDK instance (server-side only)
export async function getStripeClient(): Promise<Stripe> {
  if (!_stripe) {
    const { secretKey } = await getCredentials();
    _stripe = new Stripe(secretKey);
  }
  return _stripe;
}

// Get publishable key for frontend
export async function getStripePublishableKey(): Promise<string> {
  if (!_publishableKey) {
    const { publishableKey } = await getCredentials();
    _publishableKey = publishableKey;
  }
  return _publishableKey;
}
