import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../lib/authVerify';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await verifyFirebaseToken(req.headers.get('authorization'));
  if (!auth.valid || !auth.uid) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, category, message, userAgent, page, submittedAt } = body;

    const payload = {
      email: email || '',
      category: category || '',
      message: message || '',
      userAgent: userAgent || '',
      page: page || '/',
      submittedAt: submittedAt || new Date().toISOString(),
      source: 'mybillport',
    };

    const results: Record<string, string> = {};

    const zapierUrl = process.env.ZAPIER_FEEDBACK_WEBHOOK_URL;
    if (zapierUrl) {
      try {
        const res = await fetch(zapierUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        results.zapier = res.ok ? 'sent' : `error:${res.status}`;
      } catch {
        results.zapier = 'failed';
      }
    } else {
      results.zapier = 'not_configured';
    }

    return NextResponse.json({ ok: true, results });
  } catch (err: any) {
    console.error('[automation/feedback]', err);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
