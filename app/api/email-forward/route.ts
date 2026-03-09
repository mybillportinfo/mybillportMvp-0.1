import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../lib/adminSdk';
import { parseEmailForBill } from '../../lib/emailParser';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

function extractAliasTag(toField: string): string | null {
  const match = toField.match(/bills\+([a-zA-Z0-9_-]+)@/i);
  return match ? match[1] : null;
}

async function findUserByAlias(db: FirebaseFirestore.Firestore, aliasTag: string): Promise<string | null> {
  const snap = await db.collection('emailAliases')
    .where('aliasTag', '==', aliasTag)
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0].data().userId;
}

export async function POST(req: NextRequest) {
  const secret = process.env.INBOUND_EMAIL_TOKEN;
  if (secret) {
    const provided = req.headers.get('x-webhook-secret') || req.nextUrl.searchParams.get('token');
    if (provided !== secret) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  let toField = '';
  let subject = '';
  let textBody = '';
  let htmlBody = '';

  try {
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      toField = body.to || body.envelope?.to?.[0] || '';
      subject = body.subject || '';
      textBody = body.text || '';
      htmlBody = body.html || '';
    } else {
      const formData = await req.formData();
      toField = formData.get('to')?.toString() || '';
      subject = formData.get('subject')?.toString() || '';
      textBody = formData.get('text')?.toString() || '';
      htmlBody = formData.get('html')?.toString() || '';
    }
  } catch (err: any) {
    console.error('[email-forward] Parse error:', err.message);
    return NextResponse.json({ error: 'Parse failed' }, { status: 400 });
  }

  if (!toField) {
    return NextResponse.json({ error: 'Missing to field' }, { status: 400 });
  }

  const aliasTag = extractAliasTag(toField);
  if (!aliasTag) {
    console.warn('[email-forward] No alias tag in:', toField);
    return NextResponse.json({ error: 'Invalid recipient format' }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const userId = await findUserByAlias(db, aliasTag);
    if (!userId) {
      console.warn('[email-forward] Unknown alias tag:', aliasTag);
      return NextResponse.json({ received: true });
    }

    const extracted = await parseEmailForBill(subject, textBody, htmlBody);

    if (extracted.confidence < 0.3) {
      console.log('[email-forward] Low confidence, skipping:', extracted.confidence, subject);
      return NextResponse.json({ received: true, skipped: true, reason: 'low_confidence' });
    }

    await db.collection('pendingBills').doc(userId).collection('items').add({
      userId,
      source: 'email-forward',
      emailSubject: subject,
      vendor: extracted.matchedProviderName || extracted.vendor || 'Unknown',
      amount: extracted.amount,
      dueDate: extracted.dueDate,
      accountNumber: extracted.accountNumber,
      category: extracted.category,
      confidence: extracted.confidence,
      matchedProviderId: extracted.matchedProviderId || null,
      matchedProviderName: extracted.matchedProviderName || null,
      status: 'pending',
      createdAt: Timestamp.now(),
    });

    console.log('[email-forward] Pending bill created for user:', userId);
    return NextResponse.json({ received: true, created: true });
  } catch (err: any) {
    console.error('[email-forward] Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
