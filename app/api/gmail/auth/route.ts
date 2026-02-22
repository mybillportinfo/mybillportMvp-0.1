import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../../lib/authVerify';
import { getAuthUrl } from '../../../lib/gmailService';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authResult = await verifyFirebaseToken(authHeader);

    if (!authResult.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authUrl = getAuthUrl(authResult.uid!);
    return NextResponse.json({ authUrl });
  } catch (error: any) {
    console.error('Gmail auth error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Gmail authorization URL' },
      { status: 500 }
    );
  }
}
