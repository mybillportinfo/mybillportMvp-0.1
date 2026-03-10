import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../lib/authVerify';
import { getAdminDb } from '../../lib/adminSdk';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyFirebaseToken(req.headers.get('authorization'));
  if (!auth.valid || !auth.uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getAdminDb();
  const snap = await db
    .collection('pendingBills')
    .doc(auth.uid)
    .collection('items')
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'desc')
    .get();

  const bills = snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId,
      source: data.source,
      emailSubject: data.emailSubject || '',
      vendor: data.vendor,
      amount: data.amount,
      dueDate: data.dueDate,
      accountNumber: data.accountNumber,
      category: data.category,
      confidence: data.confidence,
      matchedProviderId: data.matchedProviderId || null,
      matchedProviderName: data.matchedProviderName || null,
      status: data.status,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
    };
  });

  return NextResponse.json({ bills });
}

export async function POST(req: NextRequest) {
  const auth = await verifyFirebaseToken(req.headers.get('authorization'));
  if (!auth.valid || !auth.uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { billId, action } = await req.json();
  if (!billId || !action) {
    return NextResponse.json({ error: 'billId and action required' }, { status: 400 });
  }

  const db = getAdminDb();
  const docRef = db.collection('pendingBills').doc(auth.uid).collection('items').doc(billId);

  if (action === 'dismiss') {
    await docRef.update({ status: 'dismissed', updatedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ success: true });
  }

  if (action === 'approve') {
    const snap = await docRef.get();
    if (!snap.exists) return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    await docRef.update({ status: 'approved', updatedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ success: true, bill: snap.data() });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
