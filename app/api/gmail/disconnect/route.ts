import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../../lib/authVerify';
import { getGmailTokens, deleteGmailTokens, revokeGmailToken } from '../../../lib/gmailService';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authResult = await verifyFirebaseToken(authHeader);

    if (!authResult.valid || !authResult.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.uid;
    const tokens = await getGmailTokens(userId);

    if (tokens?.accessToken) {
      await revokeGmailToken(tokens.accessToken);
    }

    await deleteGmailTokens(userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Gmail disconnect error:', error);
    return NextResponse.json({ error: 'Failed to disconnect Gmail' }, { status: 500 });
  }
}
