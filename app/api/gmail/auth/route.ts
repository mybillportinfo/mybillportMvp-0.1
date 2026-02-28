import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../../lib/authVerify';
import { getAuthUrl } from '../../../lib/gmailService';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error({ route: '/api/gmail/auth', step: 'envCheck', error: 'GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET is missing' });
      return NextResponse.json(
        { error: 'Gmail OAuth is not configured. Contact support.' },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get('authorization');
    const authResult = await verifyFirebaseToken(authHeader);

    if (!authResult.valid || !authResult.uid) {
      console.error({ route: '/api/gmail/auth', step: 'tokenVerify', error: authResult.error });
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: 401 });
    }

    const authUrl = getAuthUrl(authResult.uid);
    return NextResponse.json({ authUrl });
  } catch (error: any) {
    console.error({ route: '/api/gmail/auth', step: 'handler', error: error.message, stack: error.stack });
    return NextResponse.json(
      { error: error?.message || 'Failed to generate Gmail authorization URL' },
      { status: 500 }
    );
  }
}
