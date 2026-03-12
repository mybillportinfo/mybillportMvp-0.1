import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../lib/adminSdk';
import { parseEmailForBill } from '../../lib/emailParser';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function extractAliasTag(toField: string): string | null {
  const match = toField.match(/bills\+([a-zA-Z0-9_-]+)@/i);
  return match ? match[1] : null;
}

function extractAliasFromEnvelope(envelopeStr: string): string | null {
  try {
    const env = JSON.parse(envelopeStr);
    const recipients: string[] = Array.isArray(env.to) ? env.to : [env.to];
    for (const addr of recipients) {
      const tag = extractAliasTag(addr);
      if (tag) return tag;
    }
  } catch {}
  return null;
}

async function findUserByAlias(db: FirebaseFirestore.Firestore, aliasTag: string): Promise<string | null> {
  const snap = await db.collection('emailAliases')
    .where('aliasTag', '==', aliasTag)
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0].data().userId;
}

export async function POST(req: NextRequest) {
  console.log('[email-forward] Webhook hit:', new Date().toISOString());

  const secret = process.env.INBOUND_EMAIL_TOKEN;
  if (secret) {
    const provided = req.headers.get('x-webhook-secret') || req.nextUrl.searchParams.get('token');
    if (provided !== secret) {
      console.warn('[email-forward] Auth failed');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  let toField = '';
  let subject = '';
  let textBody = '';
  let htmlBody = '';
  let envelope = '';

  try {
    const contentType = req.headers.get('content-type') || '';
    console.log('[email-forward] Content-Type:', contentType);

    if (contentType.includes('application/json')) {
      const body = await req.json();
      toField = body.to || '';
      subject = body.subject || '';
      textBody = body.text || '';
      htmlBody = body.html || '';
      envelope = typeof body.envelope === 'string' ? body.envelope : JSON.stringify(body.envelope || '');
    } else {
      const formData = await req.formData();
      toField = formData.get('to')?.toString() || '';
      subject = formData.get('subject')?.toString() || '';
      textBody = formData.get('text')?.toString() || '';
      htmlBody = formData.get('html')?.toString() || '';
      envelope = formData.get('envelope')?.toString() || '';
    }
  } catch (err: any) {
    console.error('[email-forward] Parse error:', err.message);
    return NextResponse.json({ error: 'Parse failed' }, { status: 400 });
  }

  console.log('[email-forward] to:', toField, '| subject:', subject, '| envelope:', envelope);

  let aliasTag = extractAliasTag(toField);
  if (!aliasTag && envelope) {
    aliasTag = extractAliasFromEnvelope(envelope);
    if (aliasTag) console.log('[email-forward] Got alias from envelope:', aliasTag);
  }

  if (!aliasTag) {
    console.warn('[email-forward] No alias tag found in to or envelope');
    return NextResponse.json({ received: true, note: 'no_alias_found' });
  }

  console.log('[email-forward] Alias tag:', aliasTag);

  try {
    const db = getAdminDb();
    const userId = await findUserByAlias(db, aliasTag);
    if (!userId) {
      console.warn('[email-forward] Unknown alias tag:', aliasTag);
      return NextResponse.json({ received: true, note: 'alias_not_found' });
    }

    console.log('[email-forward] Found user:', userId);

    const extracted = await parseEmailForBill(subject, textBody, htmlBody);
    console.log('[email-forward] Extracted:', JSON.stringify({ vendor: extracted.vendor, amount: extracted.amount, confidence: extracted.confidence }));

    if (extracted.confidence < 0.1) {
      console.log('[email-forward] Very low confidence, skipping:', extracted.confidence);
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
    console.error('[email-forward] Error:', err.message, err.stack);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
