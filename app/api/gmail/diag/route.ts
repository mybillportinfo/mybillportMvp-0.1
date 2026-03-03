import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '../../../lib/authVerify';
import { getAuthenticatedGmailClient } from '../../../lib/gmailService';

export const runtime = 'nodejs';
export const maxDuration = 60;

function getHeaderValue(headers: any[], name: string): string {
  return headers?.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
}

function walkMimeParts(part: any, depth = 0): any[] {
  const results: any[] = [];
  if (!part) return results;

  const mime = part.mimeType || 'unknown';
  const hasData = !!part.body?.data;
  const dataLen = part.body?.data ? Buffer.from(part.body.data, 'base64url').length : 0;
  const attachmentId = part.body?.attachmentId || null;
  const filename = part.filename || null;

  results.push({
    depth,
    mimeType: mime,
    hasData,
    dataBytes: dataLen,
    attachmentId,
    filename,
  });

  if (part.parts) {
    for (const sub of part.parts) {
      results.push(...walkMimeParts(sub, depth + 1));
    }
  }

  return results;
}

function extractAllText(part: any): { plain: string; html: string } {
  let plain = '';
  let html = '';

  function walk(p: any) {
    if (!p) return;
    const mime = (p.mimeType || '').toLowerCase();

    if (mime === 'text/plain' && p.body?.data) {
      plain += Buffer.from(p.body.data, 'base64url').toString('utf-8') + '\n';
    } else if (mime === 'text/html' && p.body?.data) {
      const raw = Buffer.from(p.body.data, 'base64url').toString('utf-8');
      html += raw
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim() + '\n';
    }

    if (p.parts) {
      for (const sub of p.parts) walk(sub);
    }
  }

  walk(part);
  return { plain, html };
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const authResult = await verifyFirebaseToken(authHeader);
    if (!authResult.valid || !authResult.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.uid;
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || 'newer_than:90d';
    const maxResults = parseInt(url.searchParams.get('max') || '20', 10);

    let gmail: any;
    try {
      gmail = await getAuthenticatedGmailClient(userId);
    } catch (err: any) {
      return NextResponse.json({ error: `Gmail auth failed: ${err.message}` }, { status: 400 });
    }

    // ── Step 1: List messages ──
    let listData: any;
    try {
      const res = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      });
      listData = res.data;
    } catch (err: any) {
      return NextResponse.json({
        error: `Gmail list failed: ${err.message}`,
        query,
      }, { status: 500 });
    }

    const messages = listData.messages || [];
    const resultCount = messages.length;
    const nextPageToken = listData.nextPageToken || null;

    if (resultCount === 0) {
      return NextResponse.json({
        query,
        resultCount: 0,
        nextPageToken,
        message: 'Gmail returned ZERO messages for this query. The query is too narrow or the inbox is empty.',
        emails: [],
      });
    }

    // ── Step 2: Fetch details for each message ──
    const emailDetails: any[] = [];

    for (const msg of messages.slice(0, maxResults)) {
      try {
        const full = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full',
        });

        const headers = full.data.payload?.headers || [];
        const from = getHeaderValue(headers, 'From');
        const subject = getHeaderValue(headers, 'Subject');
        const date = getHeaderValue(headers, 'Date');
        const snippet = full.data.snippet || '';

        const mimeParts = walkMimeParts(full.data.payload || {});
        const { plain, html } = extractAllText(full.data.payload || {});

        const chosenText = plain.trim() || html.trim();

        emailDetails.push({
          id: msg.id,
          from,
          subject,
          date,
          snippet: snippet.slice(0, 200),
          mimeStructure: mimeParts,
          plainTextLength: plain.trim().length,
          htmlTextLength: html.trim().length,
          chosenTextLength: chosenText.length,
          chosenTextSource: plain.trim().length > 0 ? 'text/plain' : (html.trim().length > 0 ? 'text/html' : 'empty'),
          first500Chars: chosenText.slice(0, 500),
          containsDollarSign: chosenText.includes('$'),
          dollarAmounts: (chosenText.match(/\$[\d,]+\.?\d{0,2}/g) || []).slice(0, 10),
          containsDate: /\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(chosenText),
        });
      } catch (err: any) {
        emailDetails.push({ id: msg.id, error: err.message });
      }
    }

    return NextResponse.json({
      query,
      resultCount,
      nextPageToken,
      processedCount: emailDetails.length,
      emails: emailDetails,
      summary: {
        withPlainText: emailDetails.filter(e => e.plainTextLength > 0).length,
        withHtmlText: emailDetails.filter(e => e.htmlTextLength > 0).length,
        withDollarAmount: emailDetails.filter(e => e.containsDollarSign).length,
        withDate: emailDetails.filter(e => e.containsDate).length,
        empty: emailDetails.filter(e => e.chosenTextLength === 0).length,
      },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
