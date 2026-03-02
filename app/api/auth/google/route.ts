import { NextResponse } from 'next/server';
import { getOAuth2Client } from '../../lib/gmailService';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const oauth2Client = getOAuth2Client();
    const appUrl = process.env.APP_URL || 'https://mybillport.com';

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      prompt: 'select_account',
      state: 'signin',
    });

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error({ route: '/api/auth/google', step: 'handler', error: error.message });
    const appUrl = process.env.APP_URL || 'https://mybillport.com';
    return NextResponse.redirect(`${appUrl}/login?error=google_init_failed`);
  }
}
