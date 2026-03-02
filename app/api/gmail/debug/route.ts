import { NextRequest, NextResponse } from 'next/server';
import { getRedirectUri } from '../../../lib/gmailService';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const clientId = process.env.GMAIL_CLIENT_ID || 'NOT SET';
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = getRedirectUri();
  const appUrl = process.env.APP_URL || 'NOT SET (defaulting to https://mybillport.com)';
  const gmailRedirectUriEnv = process.env.GMAIL_REDIRECT_URI || 'NOT SET (computed from APP_URL)';
  const firebaseKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT SET';

  let firebaseKeyStatus = 'NOT SET';
  if (firebaseKey) {
    try {
      const parsed = JSON.parse(firebaseKey);
      if (parsed.project_id && parsed.private_key && parsed.client_email) {
        firebaseKeyStatus = `VALID JSON — project: ${parsed.project_id}, client_email: ${parsed.client_email}`;
      } else {
        firebaseKeyStatus = `INVALID JSON — missing fields: ${[
          !parsed.project_id && 'project_id',
          !parsed.private_key && 'private_key',
          !parsed.client_email && 'client_email',
        ].filter(Boolean).join(', ')}`;
      }
    } catch (err: any) {
      firebaseKeyStatus = `NOT VALID JSON — parse error: ${err.message}`;
    }
  }

  const config = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    gmail: {
      GMAIL_CLIENT_ID: clientId.length > 20
        ? `${clientId.slice(0, 20)}... (${clientId.length} chars)`
        : clientId,
      GMAIL_CLIENT_SECRET: clientSecret
        ? `SET (${clientSecret.length} chars, starts with: ${clientSecret.slice(0, 8)}...)`
        : 'NOT SET',
      GMAIL_REDIRECT_URI_env: gmailRedirectUriEnv,
      computed_redirectUri: redirectUri,
      APP_URL: appUrl,
    },
    firebase: {
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: projectId,
      FIREBASE_SERVICE_ACCOUNT_KEY: firebaseKeyStatus,
    },
    diagnosis: {
      redirectUriUsedForOAuth: redirectUri,
      note: 'The redirectUri above MUST exactly match what is registered in Google Cloud Console → Credentials → Authorized Redirect URIs (no trailing slash, exact protocol)',
      googleSignInClientId: '484703321344-nmen1eghd7oli53p5kckulcvtdv2skaf (GIS / login button)',
      gmailOAuthClientId: clientId,
      areTheyDifferent: clientId !== '484703321344-nmen1eghd7oli53p5kckulcvtdv2skaf.apps.googleusercontent.com'
        ? 'YES — this is expected. Two different OAuth clients.'
        : 'SAME — this may cause issues if not configured for both gmail.readonly and openid scopes.',
    },
  };

  console.log('[gmail/debug]', JSON.stringify(config, null, 2));

  return NextResponse.json(config);
}
