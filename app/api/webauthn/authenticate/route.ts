import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../../lib/authVerify';
import { getAdminDb } from '../../../lib/adminSdk';
import { createAuthenticationOptions } from '../../../lib/webauthn';
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

    const profileSnap = await db.collection('userProfiles').doc(auth.uid).get();
    const profile = profileSnap.data();

    if (!profile?.biometricEnabled || !profile?.biometricCredentialId) {
      return NextResponse.json({ error: 'Biometric not enabled' }, { status: 400 });
    }

    const options = await createAuthenticationOptions(profile.biometricCredentialId);

    await db.collection('webauthnChallenges').doc(auth.uid).set({
      challenge: options.challenge,
      type: 'authentication',
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    return NextResponse.json({ options });
  } catch (err: any) {
    console.error('[webauthn/authenticate] Error:', err.message);
    return NextResponse.json({ error: 'Failed to create authentication challenge' }, { status: 500 });
  }
}
