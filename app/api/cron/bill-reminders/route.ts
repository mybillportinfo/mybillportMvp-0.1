export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getAdminDb } from '../../../lib/adminSdk';
import { Timestamp } from 'firebase-admin/firestore';

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY!;
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:hello@mybillport.com';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
}

function toDate(val: any): Date {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (val instanceof Timestamp) return val.toDate();
  if (val?.seconds) return new Date(val.seconds * 1000);
  return new Date(val);
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

async function sendPush(subscription: any, title: string, body: string, url: string) {
  const payload = JSON.stringify({ title, body, url, icon: '/icon-192.png', badge: '/icon-192.png' });
  await webpush.sendNotification(subscription, payload);
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });
  }

  const db = getAdminDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const in7 = new Date(today);
  in7.setDate(in7.getDate() + 7);

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  try {
    const billsSnap = await db.collection('bills')
      .where('status', 'in', ['unpaid', 'partial'])
      .get();

    const userNotifications = new Map<string, { title: string; body: string; url: string }[]>();

    for (const doc of billsSnap.docs) {
      const bill = doc.data();
      const dueDate = toDate(bill.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const daysUntilDue = daysBetween(today, dueDate);

      let title = '';
      let body = '';

      if (daysUntilDue < 0) {
        title = `⚠️ Overdue: ${bill.companyName}`;
        body = `Your $${bill.totalAmount} bill is ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} overdue. Pay now to avoid late fees.`;
      } else if (daysUntilDue === 0) {
        title = `🔔 Due today: ${bill.companyName}`;
        body = `Your $${bill.totalAmount} bill is due today. Tap to pay now.`;
      } else if (daysUntilDue === 1) {
        title = `⏰ Due tomorrow: ${bill.companyName}`;
        body = `Your $${bill.totalAmount} bill is due tomorrow. Don't forget to pay.`;
      } else if (daysUntilDue === 3) {
        title = `📅 Due in 3 days: ${bill.companyName}`;
        body = `Your $${bill.totalAmount} bill is due in 3 days.`;
      } else if (daysUntilDue === 7) {
        title = `📋 Coming up: ${bill.companyName}`;
        body = `Your $${bill.totalAmount} bill is due in 1 week.`;
      } else {
        continue;
      }

      const uid = bill.userId;
      if (!uid) continue;

      if (!userNotifications.has(uid)) userNotifications.set(uid, []);
      userNotifications.get(uid)!.push({ title, body, url: '/app' });
    }

    for (const [uid, notifications] of userNotifications) {
      const subDoc = await db.collection('pushSubscriptions').doc(uid).get();
      if (!subDoc.exists) { skipped++; continue; }

      const { subscription } = subDoc.data()!;

      for (const notif of notifications) {
        try {
          await sendPush(subscription, notif.title, notif.body, notif.url);
          sent++;
        } catch (err: any) {
          if (err.statusCode === 410) {
            await db.collection('pushSubscriptions').doc(uid).delete();
          } else {
            errors++;
          }
        }
      }
    }

    console.log(`[cron/bill-reminders] sent=${sent} skipped=${skipped} errors=${errors}`);
    return NextResponse.json({ success: true, sent, skipped, errors });
  } catch (err: any) {
    console.error('[cron/bill-reminders]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
