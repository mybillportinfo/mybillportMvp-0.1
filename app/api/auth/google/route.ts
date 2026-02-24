import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const runtime = 'nodejs';

function getAppUrl(): string {
  if (process.env.NODE_ENV === 'development' && process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return process.env.APP_URL || 'https://mybillport.com';
}

export async function GET() {
  try {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const appUrl = getAppUrl();
    const redirectUri = `${appUrl}/api/gmail/callback`;

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      prompt: 'select_account',
      state: 'signin',
    });

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('Google auth init error:', error);
    const appUrl = getAppUrl();
    return NextResponse.redirect(`${appUrl}/login?error=google_init_failed`);
  }
}

