import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../lib/authVerify';
import { getAdminDb } from '../../lib/adminSdk';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function makeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
}

export async function GET(req: NextRequest) {
  const auth = await verifyFirebaseToken(req.headers.get('authorization'));
  if (!auth.valid || !auth.uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const uid = auth.uid;
  const db = getAdminDb();

  const profileRef = db.collection('userProfiles').doc(uid);
  const profileSnap = await profileRef.get();
  const profile = profileSnap.data() || {};

  if (profile.referralCode) {
    return NextResponse.json({ code: profile.referralCode });
  }

  const raw = profile.username || profile.displayName || uid.slice(0, 6);
  const base = makeCode(raw);
  const fallback = base.length >= 3 ? base : uid.slice(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, 'X');

  let code = fallback;
  let suffix = 2;
  for (let i = 0; i < 10; i++) {
    const snap = await db.collection('referralCodes').doc(code).get();
    if (!snap.exists) break;
    code = `${fallback}${suffix++}`;
  }

  await db.collection('referralCodes').doc(code).set({
    uid,
    createdAt: FieldValue.serverTimestamp(),
  });

  await profileRef.set({
    referralCode: code,
    referralCount: 0,
    referralFreeMonths: 0,
  }, { merge: true });

  return NextResponse.json({ code });
}
