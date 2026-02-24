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
  console.log('[Google Sign-In] Starting sign-in callback handling');
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/gmail/callback`;
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  console.log('[Google Sign-In] Exchanging code for tokens...');
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.id_token) {
    console.error('[Google Sign-In] No id_token in response');
    return NextResponse.redirect(`${appUrl}/login?error=no_id_token`);
  }

  console.log('[Google Sign-In] Verifying ID token...');
  const ticket = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: clientId!,
  });
  const payload = ticket.getPayload();

  if (!payload?.sub || !payload?.email) {
    console.error('[Google Sign-In] Invalid token payload');
    return NextResponse.redirect(`${appUrl}/login?error=invalid_token`);
  }

  console.log('[Google Sign-In] Authenticated Google user:', payload.email);

  const adminApp = getFirebaseAdmin();
  const adminAuth = getAdminAuth(adminApp);

  let firebaseUid: string;
  try {
    const existingUser = await adminAuth.getUserByEmail(payload.email);
    firebaseUid = existingUser.uid;
    console.log('[Google Sign-In] Found existing Firebase user:', firebaseUid);
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      console.log('[Google Sign-In] Creating new Firebase user for:', payload.email);
      const newUser = await adminAuth.createUser({
        email: payload.email,
        displayName: payload.name || undefined,
        photoURL: payload.picture || undefined,
        emailVerified: payload.email_verified || false,
      });
      firebaseUid = newUser.uid;
      console.log('[Google Sign-In] Created new Firebase user:', firebaseUid);

      try {
        await fetch(`${appUrl}/api/send-welcome-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: payload.email, displayName: payload.name || undefined }),
        });
      } catch {}
    } else {
      console.error('[Google Sign-In] Firebase Admin error:', err.code, err.message);
      throw err;
    }
  }

  console.log('[Google Sign-In] Creating custom token for uid:', firebaseUid);
  const customToken = await adminAuth.createCustomToken(firebaseUid);
  console.log('[Google Sign-In] Custom token created successfully');

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
    console.error('Gmail callback error:', error?.code || error?.message || error);
    if (isSignIn) {
      const errMsg = encodeURIComponent(error?.code || error?.message || 'auth_failed');
      return NextResponse.redirect(`${appUrl}/login?error=${errMsg}`);
    }
    return NextResponse.redirect(`${appUrl}/settings?gmail=error&reason=token_exchange_failed`);
  }
}
