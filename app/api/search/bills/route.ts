export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { verifyFirebaseToken } from '../../../lib/authVerify';
import { getAdminDb } from '../../../lib/adminSdk';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const auth = await verifyFirebaseToken(authHeader);
  if (!auth.valid || !auth.uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const uid = auth.uid;

  const { query } = await req.json();
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return NextResponse.json({ error: 'Query too short' }, { status: 400 });
  }

  const db = getAdminDb();
  const snap = await db.collection('bills').where('userId', '==', uid).get();
  const bills = snap.docs.map((d) => ({
    id: d.id,
    biller: d.data().biller || d.data().vendor || '',
    amount: d.data().amount,
    dueDate: d.data().dueDate,
    status: d.data().status,
    category: d.data().category,
    notes: d.data().notes || '',
    description: d.data().description || '',
  }));

  if (bills.length === 0) {
    return NextResponse.json({ results: [], explanation: 'You have no bills to search.' });
  }

  // Use Replit AI integration when available (free, text-only), else user's key
  const replitBase = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
  const replitKey  = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
  const useReplit  = !!(replitBase && replitKey);
  const anthropic = useReplit
    ? new Anthropic({ apiKey: replitKey!, baseURL: replitBase! })
    : new Anthropic({ apiKey: (process.env.ANTHROPIC_API_KEY || '').replace(/[\s\r\n\t]/g, '').trim() });
  const searchModel = useReplit ? 'claude-haiku-4-5' : 'claude-haiku-4-5';

  const prompt = `You are a smart bill search engine. The user has the following bills:

${JSON.stringify(bills, null, 2)}

The user's natural language search query is: "${query.trim()}"

Find all bills that match this query. Be flexible with vendor names — "Roger" matches "Rogers", partial names and typos should match. Consider the biller/vendor name, amount, due date (relative terms like "last month", "this year", "summer" referring to Jun-Aug), status (paid, unpaid, overdue, partial), category, and notes.

Return a JSON object with:
- "matches": array of objects with { "id": string, "reason": string } — one entry per matching bill
- "summary": a short human-readable sentence describing what you found (e.g. "Found 3 bills from Rogers totalling $342.00")

Only return valid JSON. No markdown, no code fences.`;

  const response = await anthropic.messages.create({
    model: searchModel,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  let parsed: { matches: { id: string; reason: string }[]; summary: string };
  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    parsed = JSON.parse(text);
  } catch {
    parsed = { matches: [], summary: 'Could not parse search results.' };
  }

  return NextResponse.json({
    results: parsed.matches || [],
    summary: parsed.summary || `Found ${parsed.matches?.length ?? 0} matching bills.`,
  });
}
