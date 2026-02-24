import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../../lib/authVerify';
import { getAuthUrl } from '../../../lib/gmailService';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authResult = await verifyFirebaseToken(authHeader);

    if (!authResult.valid) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Gmail auth error: Missing GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET');
      return NextResponse.json(
        { error: 'Gmail OAuth is not configured. Please set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET.' },
        { status: 500 }
      );
    }

    const authUrl = getAuthUrl(authResult.uid!);
    return NextResponse.json({ authUrl });
  } catch (error: any) {
    console.error('Gmail auth error:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate Gmail authorization URL' },
      { status: 500 }
    );
  }
}
