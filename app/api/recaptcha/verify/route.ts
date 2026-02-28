import { NextRequest, NextResponse } from 'next/server';

const SITE_KEY = '6Lfby0ksAAAAAPcrsjoe3qZjjD03IxkvRW8pZanp';
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mybillport-8e05a';
const MIN_SCORE = 0.5;

export async function POST(req: NextRequest) {
  try {
    const { token, action } = await req.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
    }

    const apiKey = process.env.RECAPTCHA_API_KEY;
    if (!apiKey) {
      console.warn('[recaptcha] RECAPTCHA_API_KEY not set — skipping server-side verification');
      return NextResponse.json({ success: true, score: 1.0, skipped: true });
    }

    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${PROJECT_ID}/assessments?key=${apiKey}`;
    const body = {
      event: { token, expectedAction: action, siteKey: SITE_KEY },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error({ route: '/api/recaptcha/verify', step: 'apiCall', error: errorText });
      return NextResponse.json({ success: false, error: 'reCAPTCHA verification failed' }, { status: 500 });
    }

    const data = await response.json();
    const score: number = data.riskAnalysis?.score ?? 0;
    const valid = data.tokenProperties?.valid ?? false;
    const actionMatches = !action || data.tokenProperties?.action === action;

    if (!valid || !actionMatches || score < MIN_SCORE) {
      console.warn('[recaptcha] Failed:', { valid, score, action, tokenAction: data.tokenProperties?.action });
      return NextResponse.json({ success: false, score, error: 'Suspicious activity detected' }, { status: 403 });
    }

    return NextResponse.json({ success: true, score });
  } catch (err: any) {
    console.error({ route: '/api/recaptcha/verify', step: 'handler', error: err.message });
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
