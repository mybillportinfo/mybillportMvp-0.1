import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../../lib/authVerify';
import { getGmailConnectionStatus } from '../../../lib/gmailService';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authResult = await verifyFirebaseToken(authHeader);

    if (!authResult.valid || !authResult.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await getGmailConnectionStatus(authResult.uid);
    return NextResponse.json(status);
  } catch (error: any) {
    console.error('Gmail status error:', error);
    return NextResponse.json({ error: 'Failed to check Gmail status' }, { status: 500 });
  }
}
