import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, storeGmailTokens, getOAuth2Client, getGmailTokens, verifyOAuthState } from '../../../lib/gmailService';
import { google } from 'googleapis';
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

export const runtime = 'nodejs';

function getAppUrl(): string {
  if (process.env.NODE_ENV === 'development' && process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return process.env.APP_URL || 'https://mybillport.com';
}

function getFirebaseAdmin(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) return existingApps[0];

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      return initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    } catch {
      return initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  }
  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

async function handleSignIn(code: string, appUrl: string): Promise<NextResponse> {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/gmail/callback`;
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.id_token) {
    return NextResponse.redirect(`${appUrl}/login?error=no_id_token`);
  }

  const ticket = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: clientId!,
  });
  const payload = ticket.getPayload();

  if (!payload?.sub || !payload?.email) {
    return NextResponse.redirect(`${appUrl}/login?error=invalid_token`);
  }

  const adminApp = getFirebaseAdmin();
  const adminAuth = getAdminAuth(adminApp);

  let firebaseUid: string;
  try {
    const existingUser = await adminAuth.getUserByEmail(payload.email);
    firebaseUid = existingUser.uid;
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
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
      throw err;
    }
  }

  const customToken = await adminAuth.createCustomToken(firebaseUid);

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
      if (error) {
        return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(error)}`);
      }
      if (!code) {
        return NextResponse.redirect(`${appUrl}/login?error=no_code`);
      }
      return await handleSignIn(code, appUrl);
    }

    if (error) {
      return NextResponse.redirect(`${appUrl}/settings?gmail=error&reason=${encodeURIComponent(error)}`);
    }

    if (!code || !stateParam) {
      return NextResponse.redirect(`${appUrl}/settings?gmail=error&reason=no_code`);
    }

    const userId = verifyOAuthState(stateParam);
    if (!userId) {
      return NextResponse.redirect(`${appUrl}/settings?gmail=error&reason=invalid_state`);
    }

    const tokens = await exchangeCodeForTokens(code);

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ access_token: tokens.accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const gmailEmail = profile.data.emailAddress || '';

    let refreshToken = tokens.refreshToken;
    if (!refreshToken) {
      const existing = await getGmailTokens(userId);
      refreshToken = existing?.refreshToken || null;
    }

    if (!refreshToken) {
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

    return NextResponse.redirect(`${appUrl}/settings?gmail=connected`);
  } catch (error: any) {
    console.error('Gmail callback error:', error);
    if (isSignIn) {
      return NextResponse.redirect(`${appUrl}/login?error=auth_failed`);
    }
    return NextResponse.redirect(`${appUrl}/settings?gmail=error&reason=token_exchange_failed`);
  }
}
