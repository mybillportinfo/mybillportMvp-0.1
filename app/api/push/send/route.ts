import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getAdminDb } from '../../../lib/adminSdk';

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY!;
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:hello@mybillport.com';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
}

export async function POST(req: NextRequest) {
  try {
    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
      return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }

    const { userId, title, body, url } = await req.json();
    if (!userId || !title) {
      return NextResponse.json({ error: 'Missing userId or title' }, { status: 400 });
    }

    const db = getAdminDb();
    const subDoc = await db.collection('pushSubscriptions').doc(userId).get();

    if (!subDoc.exists) {
      return NextResponse.json({ skipped: true, reason: 'No subscription found' });
    }

    const { subscription } = subDoc.data()!;

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/app',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    });

    await webpush.sendNotification(subscription, payload);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    // 410 Gone = subscription expired, clean it up
    if (err.statusCode === 410) {
      try {
        const { userId } = await req.json().catch(() => ({}));
        if (userId) {
          const db = getAdminDb();
          await db.collection('pushSubscriptions').doc(userId).delete();
        }
      } catch {}
    }
    console.error('[push/send]', err.message);
    return NextResponse.json({ error: 'Failed to send push' }, { status: 500 });
  }
}
