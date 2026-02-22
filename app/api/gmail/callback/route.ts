import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, storeGmailTokens, getOAuth2Client, getGmailTokens, verifyOAuthState } from '../../../lib/gmailService';
import { google } from 'googleapis';

export const runtime = 'nodejs';

function getAppUrl(): string {
  if (process.env.NODE_ENV === 'development' && process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return process.env.APP_URL || 'https://mybillport.com';
}

export async function GET(request: NextRequest) {
  const appUrl = getAppUrl();
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const stateParam = searchParams.get('state');

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
    return NextResponse.redirect(`${appUrl}/settings?gmail=error&reason=token_exchange_failed`);
  }
}
