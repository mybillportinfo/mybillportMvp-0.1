import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForTokens,
  storeGmailTokens,
  getOAuth2Client,
  getGmailTokens,
  verifyOAuthState,
} from '../../../lib/gmailService';
import { getAdminApp } from '../../../lib/adminSdk';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { google } from 'googleapis';

export const runtime = 'nodejs';

function getAppUrl(): string {
  return process.env.APP_URL || 'https://mybillport.com';
}

async function handleSignIn(code: string, appUrl: string): Promise<NextResponse> {
  const step = { route: '/api/gmail/callback', flow: 'signIn', step: '' };

  step.step = 'initOAuth';
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/gmail/callback`;
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  step.step = 'exchangeCode';
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.id_token) {
    console.error({ ...step, step: 'validateIdToken', error: 'No id_token in token response' });
    return NextResponse.redirect(`${appUrl}/login?error=no_id_token`);
  }

  step.step = 'verifyIdToken';
  const ticket = await oauth2Client.verifyIdToken({ idToken: tokens.id_token, audience: clientId! });
  const payload = ticket.getPayload();

  if (!payload?.sub || !payload?.email) {
    console.error({ ...step, step: 'validatePayload', error: 'Invalid token payload', sub: !!payload?.sub, email: !!payload?.email });
    return NextResponse.redirect(`${appUrl}/login?error=invalid_token`);
  }

  step.step = 'lookupFirebaseUser';
  const adminAuth = getAdminAuth(getAdminApp());

  let firebaseUid: string;
  try {
    const existingUser = await adminAuth.getUserByEmail(payload.email);
    firebaseUid = existingUser.uid;
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      step.step = 'createFirebaseUser';
      const newUser = await adminAuth.createUser({
        email: payload.email,
        displayName: payload.name || undefined,
        photoURL: payload.picture || undefined,
        emailVerified: payload.email_verified || false,
      });
      firebaseUid = newUser.uid;
      try {
        await fetch(`${appUrl}/api/send-welcome-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: payload.email, displayName: payload.name || undefined }),
        });
      } catch {}
    } else {
      console.error({ ...step, step: 'getUserByEmail', error: err.message, code: err.code });
      throw err;
    }
  }

  step.step = 'createCustomToken';
  const customToken = await adminAuth.createCustomToken(firebaseUid!);

  const redirectUrl = new URL(`${appUrl}/auth/callback`);
  redirectUrl.searchParams.set('token', customToken);
  return NextResponse.redirect(redirectUrl.toString());
}

export async function GET(request: NextRequest) {
  const appUrl = getAppUrl();
  const searchParams = request.nextUrl.searchParams;
  const stateParam = searchParams.get('state');
  const isSignIn = stateParam === 'signin';

  try {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (isSignIn) {
      if (error) return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(error)}`);
      if (!code) return NextResponse.redirect(`${appUrl}/login?error=no_code`);
      return await handleSignIn(code, appUrl);
    }

    if (error) {
      console.error({ route: '/api/gmail/callback', flow: 'gmailConnect', step: 'oauthError', error });
      return NextResponse.redirect(`${appUrl}/settings?gmail=error&reason=${encodeURIComponent(error)}`);
    }

    if (!code || !stateParam) {
      console.error({ route: '/api/gmail/callback', flow: 'gmailConnect', step: 'missingParams', code: !!code, state: !!stateParam });
      return NextResponse.redirect(`${appUrl}/settings?gmail=error&reason=no_code`);
    }

    const userId = verifyOAuthState(stateParam);
    if (!userId) {
      console.error({ route: '/api/gmail/callback', flow: 'gmailConnect', step: 'verifyState', error: 'Invalid or tampered state parameter' });
      return NextResponse.redirect(`${appUrl}/settings?gmail=error&reason=invalid_state`);
    }

    const tokens = await exchangeCodeForTokens(code);

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: tokens.accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    let gmailEmail = '';
    try {
      const profile = await gmail.users.getProfile({ userId: 'me' });
      gmailEmail = profile.data.emailAddress || '';
    } catch (profileErr: any) {
      console.error({ route: '/api/gmail/callback', flow: 'gmailConnect', step: 'getProfile', error: profileErr.message });
    }

    let refreshToken = tokens.refreshToken;
    if (!refreshToken) {
      const existing = await getGmailTokens(userId);
      refreshToken = existing?.refreshToken || null;
    }

    if (!refreshToken) {
      console.error({ route: '/api/gmail/callback', flow: 'gmailConnect', step: 'validateRefreshToken', error: 'No refresh token available — user must re-authorize with prompt=consent' });
      return NextResponse.redirect(`${appUrl}/settings?gmail=error&reason=no_refresh_token`);
    }

    await storeGmailTokens(userId, {
      accessToken: tokens.accessToken,
      refreshToken,
      expiryDate: tokens.expiryDate,
      email: gmailEmail,
      connectedAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log({ route: '/api/gmail/callback', flow: 'gmailConnect', step: 'complete', userId, email: gmailEmail });
    return NextResponse.redirect(`${appUrl}/settings?gmail=connected`);
  } catch (error: any) {
    console.error({ route: '/api/gmail/callback', step: 'uncaughtError', error: error.message, stack: error.stack });
    if (isSignIn) {
      return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(error?.message || 'auth_failed')}`);
    }
    return NextResponse.redirect(`${appUrl}/settings?gmail=error&reason=token_exchange_failed`);
  }
}
