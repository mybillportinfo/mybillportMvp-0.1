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

  const uid = auth.uid;
  const db = getAdminDb();

  const docRef = db.collection('emailAliases').doc(uid);
  const snap = await docRef.get();

  if (snap.exists) {
    const aliasTag = snap.data()?.aliasTag as string;
    return NextResponse.json({ aliasTag });
  }

  const aliasTag = uid.slice(0, 8).toLowerCase().replace(/[^a-z0-9]/g, 'x');
  await docRef.set({
    userId: uid,
    aliasTag,
    email: `bills+${aliasTag}@mybillport.com`,
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ aliasTag });
}
