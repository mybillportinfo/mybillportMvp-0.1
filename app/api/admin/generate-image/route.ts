import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getAdminDb } from '../../../lib/adminSdk';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

async function verifyAdmin(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  try {
    const decoded = await getAuth().verifyIdToken(token);
    if (ADMIN_EMAILS.includes(decoded.email?.toLowerCase() || '')) {
      return decoded.uid;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const uid = await verifyAdmin(req);
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not configured. Add it in your environment variables.' },
      { status: 503 }
    );
  }

  try {
    const { prompt, size = '1024x1024', quality = 'standard', style = 'vivid', count = 1 } = await req.json();
    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt.trim(),
        n: Math.min(count, 1),
        size,
        quality,
        style,
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        { error: err.error?.message || 'OpenAI API error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const images = data.data?.map((img: any) => ({
      url: img.url,
      revised_prompt: img.revised_prompt,
    })) || [];

    const db = getAdminDb();
    await db.collection('adminGeneratedImages').add({
      uid,
      prompt: prompt.trim(),
      size,
      quality,
      style,
      images,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, images });
  } catch (err: any) {
    console.error('[admin/generate-image]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
