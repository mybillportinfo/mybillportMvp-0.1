import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../../lib/authVerify';
import { getAdminDb } from '../../../lib/adminSdk';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await verifyFirebaseToken(req.headers.get('authorization'));
  if (!auth.valid || !auth.uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();

    await db.collection('userProfiles').doc(auth.uid).set({
      biometricEnabled: false,
      biometricCredentialId: FieldValue.delete(),
      biometricPublicKey: FieldValue.delete(),
      biometricCounter: FieldValue.delete(),
      biometricCreatedAt: FieldValue.delete(),
    }, { merge: true });

    return NextResponse.json({ disabled: true });
  } catch (err: any) {
    console.error('[webauthn/disable] Error:', err.message);
    return NextResponse.json({ error: 'Failed to disable biometric' }, { status: 500 });
  }
}
