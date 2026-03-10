export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
    }

    const secret = process.env.RECAPTCHA_V2_SECRET_KEY;
    if (!secret) {
      console.warn('[recaptcha-v2] RECAPTCHA_V2_SECRET_KEY not set — skipping verification');
      return NextResponse.json({ success: true, skipped: true });
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });

    if (!response.ok) {
      console.error('[recaptcha-v2] siteverify HTTP error:', response.status);
      return NextResponse.json({ success: false, error: 'Verification service error' }, { status: 500 });
    }

    const data = await response.json();

    if (!data.success) {
      console.warn('[recaptcha-v2] Failed:', data['error-codes']);
      return NextResponse.json({ success: false, error: 'Human verification failed' }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[recaptcha-v2] handler error:', err.message);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
