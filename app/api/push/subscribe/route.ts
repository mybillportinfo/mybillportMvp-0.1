export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../lib/adminSdk';

export async function POST(req: NextRequest) {
  try {
    const { userId, subscription } = await req.json();

    if (!userId || !subscription?.endpoint) {
      return NextResponse.json({ error: 'Missing userId or subscription' }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection('pushSubscriptions').doc(userId).set({
      userId,
      subscription,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[push/subscribe]', err.message);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    const db = getAdminDb();
    await db.collection('pushSubscriptions').doc(userId).delete();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[push/unsubscribe]', err.message);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
