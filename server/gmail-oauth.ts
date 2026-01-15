import { google } from 'googleapis';
import { db } from './db';
import { gmailTokens } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email'
];

const oauthStates = new Map<string, { timestamp: number }>();

function getOAuth2Client() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || `${getBaseUrl()}/api/gmail/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Gmail OAuth credentials not configured. Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET.');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function getBaseUrl(): string {
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
    return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
  }
  return 'http://localhost:5000';
}

export function getAuthUrl(): { authUrl: string; state: string } {
  const oauth2Client = getOAuth2Client();
  
  const state = crypto.randomBytes(16).toString('hex');
  oauthStates.set(state, { timestamp: Date.now() });
  
  setTimeout(() => oauthStates.delete(state), 10 * 60 * 1000);
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GMAIL_SCOPES,
    prompt: 'consent',
    state
  });
  
  return { authUrl, state };
}

export function validateState(state: string): boolean {
  if (!state || !oauthStates.has(state)) {
    return false;
  }
  const stateData = oauthStates.get(state)!;
  oauthStates.delete(state);
  return Date.now() - stateData.timestamp < 10 * 60 * 1000;
}

export async function handleCallback(code: string): Promise<{ email: string; success: boolean }> {
  const oauth2Client = getOAuth2Client();
  
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();
  const email = userInfo.data.email;

  if (!email) {
    throw new Error('Could not get user email from Google');
  }

  const existingToken = await db.select().from(gmailTokens).where(eq(gmailTokens.email, email)).limit(1);

  if (existingToken.length > 0) {
    await db.update(gmailTokens)
      .set({
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || existingToken[0].refreshToken,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        updatedAt: new Date()
      })
      .where(eq(gmailTokens.email, email));
  } else {
    await db.insert(gmailTokens).values({
      email,
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token || null,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null
    });
  }

  return { email, success: true };
}

export async function getGmailClient(email?: string) {
  const tokenRecord = email 
    ? await db.select().from(gmailTokens).where(eq(gmailTokens.email, email)).limit(1)
    : await db.select().from(gmailTokens).limit(1);

  if (!tokenRecord.length) {
    throw new Error('Gmail not connected. Please connect your Gmail account first.');
  }

  const token = tokenRecord[0];
  const oauth2Client = getOAuth2Client();

  oauth2Client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken
  });

  if (token.expiresAt && new Date(token.expiresAt) < new Date()) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      await db.update(gmailTokens)
        .set({
          accessToken: credentials.access_token!,
          expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
          updatedAt: new Date()
        })
        .where(eq(gmailTokens.email, token.email));

      oauth2Client.setCredentials(credentials);
    } catch (error) {
      throw new Error('Gmail token expired. Please reconnect your Gmail account.');
    }
  }

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export async function getConnectionStatus(): Promise<{ connected: boolean; email?: string }> {
  try {
    const tokenRecord = await db.select().from(gmailTokens).limit(1);
    
    if (!tokenRecord.length) {
      return { connected: false };
    }

    return { connected: true, email: tokenRecord[0].email };
  } catch {
    return { connected: false };
  }
}

export async function disconnectGmail(email?: string): Promise<void> {
  if (email) {
    await db.delete(gmailTokens).where(eq(gmailTokens.email, email));
  } else {
    await db.delete(gmailTokens);
  }
}

export interface EmailBill {
  id: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  company: string;
  amount: number | null;
  dueDate: string | null;
  category: string;
  confidence: number;
}

const BILL_KEYWORDS = [
  'invoice', 'bill', 'payment due', 'amount due', 'statement',
  'utility', 'hydro', 'electricity', 'gas', 'water',
  'internet', 'phone', 'mobile', 'wireless', 'cable',
  'insurance', 'mortgage', 'rent', 'lease',
  'subscription', 'membership', 'renewal',
  'credit card', 'bank statement',
  'rogers', 'bell', 'telus', 'shaw', 'fido', 'koodo', 'virgin',
  'enbridge', 'hydro one', 'toronto hydro', 'bc hydro',
  'netflix', 'spotify', 'amazon prime', 'disney+',
  'td bank', 'rbc', 'scotiabank', 'bmo', 'cibc'
];

const BILL_SENDERS = [
  'noreply', 'billing', 'invoice', 'payment', 'statement',
  'customerservice', 'support', 'notifications'
];

export async function scanEmailsForBillsOAuth(maxResults: number = 50): Promise<EmailBill[]> {
  const gmail = await getGmailClient();
  
  const searchQuery = BILL_KEYWORDS.slice(0, 10).map(k => `"${k}"`).join(' OR ');
  
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: searchQuery,
    maxResults: maxResults
  });

  const messages = response.data.messages || [];
  const emailBills: EmailBill[] = [];

  for (const message of messages.slice(0, 20)) {
    try {
      const fullMessage = await gmail.users.messages.get({
        userId: 'me',
        id: message.id!,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date']
      });

      const headers = fullMessage.data.payload?.headers || [];
      const from = headers.find(h => h.name === 'From')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';
      const snippet = fullMessage.data.snippet || '';

      const billInfo = extractBillInfo(from, subject, snippet);
      
      if (billInfo.confidence > 0.3) {
        emailBills.push({
          id: message.id!,
          from,
          subject,
          date,
          snippet,
          ...billInfo
        });
      }
    } catch (err) {
      console.error('Error fetching message:', err);
    }
  }

  return emailBills.sort((a, b) => b.confidence - a.confidence);
}

function extractBillInfo(from: string, subject: string, snippet: string): {
  company: string;
  amount: number | null;
  dueDate: string | null;
  category: string;
  confidence: number;
} {
  const text = `${from} ${subject} ${snippet}`.toLowerCase();
  
  let confidence = 0;
  
  for (const keyword of BILL_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      confidence += 0.1;
    }
  }
  
  for (const sender of BILL_SENDERS) {
    if (from.toLowerCase().includes(sender)) {
      confidence += 0.15;
    }
  }

  const amountMatch = text.match(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : null;
  if (amount && amount > 5 && amount < 10000) {
    confidence += 0.2;
  }

  const dueDatePatterns = [
    /due\s*(?:date|by|on)?:?\s*(\w+\s+\d{1,2},?\s*\d{4})/i,
    /payment\s+due:?\s*(\w+\s+\d{1,2},?\s*\d{4})/i,
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/
  ];
  
  let dueDate: string | null = null;
  for (const pattern of dueDatePatterns) {
    const match = text.match(pattern);
    if (match) {
      dueDate = match[1];
      confidence += 0.1;
      break;
    }
  }

  const company = extractCompanyName(from, subject);
  
  const category = categorizeEmail(text);

  confidence = Math.min(confidence, 1);

  return { company, amount, dueDate, category, confidence };
}

function extractCompanyName(from: string, subject: string): string {
  const emailMatch = from.match(/<([^>]+)>/);
  const email = emailMatch ? emailMatch[1] : from;
  
  const nameMatch = from.match(/^([^<]+)/);
  if (nameMatch && nameMatch[1].trim() && !nameMatch[1].includes('@')) {
    return nameMatch[1].trim().replace(/"/g, '');
  }
  
  const domain = email.split('@')[1];
  if (domain) {
    const parts = domain.split('.');
    if (parts.length >= 2) {
      return parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1);
    }
  }
  
  return 'Unknown';
}

function categorizeEmail(text: string): string {
  const categories: Record<string, string[]> = {
    'utilities': ['hydro', 'electricity', 'gas', 'water', 'utility', 'enbridge'],
    'phone': ['phone', 'mobile', 'wireless', 'rogers', 'bell', 'telus', 'fido', 'koodo', 'virgin'],
    'internet': ['internet', 'wifi', 'broadband', 'shaw', 'cable'],
    'insurance': ['insurance', 'coverage', 'policy', 'premium'],
    'subscription': ['subscription', 'netflix', 'spotify', 'amazon', 'disney', 'membership'],
    'credit-card': ['credit card', 'visa', 'mastercard', 'amex'],
    'banking': ['bank', 'td', 'rbc', 'scotiabank', 'bmo', 'cibc', 'mortgage'],
    'housing': ['rent', 'lease', 'property', 'condo']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }

  return 'other';
}
