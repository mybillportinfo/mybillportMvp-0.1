import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../../lib/authVerify';
import { getPendingBills, updatePendingBillStatus } from '../../../lib/gmailService';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authResult = await verifyFirebaseToken(authHeader);

    if (!authResult.valid || !authResult.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bills = await getPendingBills(authResult.uid);
    return NextResponse.json({ bills });
  } catch (error: any) {
    console.error('Fetch pending bills error:', error);
    return NextResponse.json({ error: 'Failed to fetch pending bills' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authResult = await verifyFirebaseToken(authHeader);

    if (!authResult.valid || !authResult.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { billId, action } = body;

    if (!billId || !['confirm', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const status = action === 'confirm' ? 'confirmed' : 'rejected';
    await updatePendingBillStatus(billId, status as 'confirmed' | 'rejected', authResult.uid);

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    console.error('Update pending bill error:', error);
    return NextResponse.json({ error: 'Failed to update pending bill' }, { status: 500 });
  }
}
