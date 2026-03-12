import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../../lib/authVerify';
import { getAdminDb } from '../../../lib/adminSdk';
import { createRegistrationOptions } from '../../../lib/webauthn';
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
    const userName = profile?.email || auth.uid;
    const displayName = profile?.displayName || profile?.username || 'User';

    const options = await createRegistrationOptions(auth.uid, userName, displayName);

    await db.collection('webauthnChallenges').doc(auth.uid).set({
      challenge: options.challenge,
      type: 'registration',
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    return NextResponse.json({ options });
  } catch (err: any) {
    console.error('[webauthn/register] Error:', err.message);
    return NextResponse.json({ error: 'Failed to generate registration options' }, { status: 500 });
  }
}
