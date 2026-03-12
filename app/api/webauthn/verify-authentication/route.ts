import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../../lib/authVerify';
import { getAdminDb } from '../../../lib/adminSdk';
import { verifyAuthentication } from '../../../lib/webauthn';
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
      return NextResponse.json({ error: 'No challenge found' }, { status: 400 });
    }

    const challengeData = challengeDoc.data()!;
    const { challenge, expiresAt } = challengeData;

    if (challengeData.type !== 'authentication') {
      await db.collection('webauthnChallenges').doc(auth.uid).delete();
      return NextResponse.json({ error: 'Invalid challenge type' }, { status: 400 });
    }

    if (new Date() > expiresAt.toDate?.() || new Date() > new Date(expiresAt)) {
      await db.collection('webauthnChallenges').doc(auth.uid).delete();
      return NextResponse.json({ error: 'Challenge expired' }, { status: 400 });
    }

    const profileSnap = await db.collection('userProfiles').doc(auth.uid).get();
    const profile = profileSnap.data();

    if (!profile?.biometricCredentialId || !profile?.biometricPublicKey) {
      return NextResponse.json({ error: 'No biometric credential found' }, { status: 400 });
    }

    const publicKey = isoBase64URL.toBuffer(profile.biometricPublicKey);

    const verification = await verifyAuthentication(
      response,
      challenge,
      publicKey,
      profile.biometricCounter || 0,
      profile.biometricCredentialId,
    );

    if (!verification.verified) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 400 });
    }

    await db.collection('userProfiles').doc(auth.uid).set({
      biometricCounter: verification.authenticationInfo.newCounter,
    }, { merge: true });

    await db.collection('webauthnChallenges').doc(auth.uid).delete();

    return NextResponse.json({ verified: true });
  } catch (err: any) {
    console.error('[webauthn/verify-authentication] Error:', err.message);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
