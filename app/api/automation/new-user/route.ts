import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, displayName, uid, signupDate } = body;

    const payload = {
      email: email || '',
      displayName: displayName || '',
      uid: uid || '',
      signupDate: signupDate || new Date().toISOString(),
      source: 'mybillport',
    };

    const results: Record<string, string> = {};

    const zapierUrl = process.env.ZAPIER_USER_SIGNUP_WEBHOOK_URL;
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

    const makeUrl = process.env.MAKE_USER_SIGNUP_WEBHOOK_URL;
    if (makeUrl) {
      try {
        const res = await fetch(makeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        results.make = res.ok ? 'sent' : `error:${res.status}`;
      } catch {
        results.make = 'failed';
      }
    } else {
      results.make = 'not_configured';
    }

    return NextResponse.json({ ok: true, results });
  } catch (err: any) {
    console.error('[automation/new-user]', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
