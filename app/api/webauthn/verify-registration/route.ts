import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../../lib/authVerify';
import { getAdminDb } from '../../../lib/adminSdk';
import { verifyRegistration } from '../../../lib/webauthn';
import { FieldValue } from 'firebase-admin/firestore';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await verifyFirebaseToken(req.headers.get('authorization'));
  if (!auth.valid || !auth.uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { response } = await req.json();
    const db = getAdminDb();

    const challengeDoc = await db.collection('webauthnChallenges').doc(auth.uid).get();
    if (!challengeDoc.exists) {
      return NextResponse.json({ error: 'No challenge found. Please try again.' }, { status: 400 });
    }

    const challengeData = challengeDoc.data()!;
    const { challenge, expiresAt } = challengeData;

    if (challengeData.type !== 'registration') {
      await db.collection('webauthnChallenges').doc(auth.uid).delete();
      return NextResponse.json({ error: 'Invalid challenge type' }, { status: 400 });
    }

    if (new Date() > expiresAt.toDate?.() || new Date() > new Date(expiresAt)) {
      await db.collection('webauthnChallenges').doc(auth.uid).delete();
      return NextResponse.json({ error: 'Challenge expired. Please try again.' }, { status: 400 });
    }

    const verification = await verifyRegistration(response, challenge);

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    const { credential } = verification.registrationInfo;
    const publicKeyBase64 = isoBase64URL.fromBuffer(credential.publicKey);

    await db.collection('userProfiles').doc(auth.uid).set({
      biometricEnabled: true,
      biometricCredentialId: credential.id,
      biometricPublicKey: publicKeyBase64,
      biometricCounter: credential.counter,
      biometricCreatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    await db.collection('webauthnChallenges').doc(auth.uid).delete();

    return NextResponse.json({ verified: true });
  } catch (err: any) {
    console.error('[webauthn/verify-registration] Error:', err.message);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
