import { google } from 'googleapis';
import { getAdminDb } from './adminSdk';
import crypto from 'crypto';

export function getOAuth2Client() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI ||
    `${process.env.APP_URL || 'https://mybillport.com'}/api/gmail/callback`;

  if (!clientId || !clientSecret) {
    console.error('[gmailService] Missing GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET');
    throw new Error('Gmail OAuth credentials not configured. Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in Vercel.');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function getStateSecret(): string {
  const secret = process.env.GMAIL_CLIENT_SECRET;
  if (!secret) throw new Error('GMAIL_CLIENT_SECRET is required for OAuth state signing');
  return secret;
}

export function signOAuthState(userId: string): string {
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${userId}:${nonce}`;
  const hmac = crypto.createHmac('sha256', getStateSecret()).update(payload).digest('hex');
  return `${payload}:${hmac}`;
}

export function verifyOAuthState(state: string): string | null {
  try {
    const parts = state.split(':');
    if (parts.length !== 3) return null;
    const [userId, nonce, signature] = parts;
    if (!userId || !nonce || !signature) return null;
    if (!/^[a-f0-9]{64}$/i.test(signature)) return null;
    if (!/^[a-f0-9]{32}$/i.test(nonce)) return null;
    const payload = `${userId}:${nonce}`;
    const expected = crypto.createHmac('sha256', getStateSecret()).update(payload).digest('hex');
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
    return userId;
  } catch {
    return null;
  }
}

export function getAuthUrl(userId: string): string {
  const oauth2Client = getOAuth2Client();
  const signedState = signOAuthState(userId);
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: true,
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    state: signedState,
  });
}

export interface GmailTokenData {
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
  email: string;
  connectedAt: number;
  updatedAt: number;
}

export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken: string | null;
  expiryDate: number;
}> {
  const oauth2Client = getOAuth2Client();

  let tokens: any;
  try {
    const result = await oauth2Client.getToken(code);
    tokens = result.tokens;
  } catch (err: any) {
    console.error({ route: 'gmailService.exchangeCodeForTokens', step: 'getToken', error: err.message, code: err.code });
    throw new Error(`Token exchange failed: ${err.message}`);
  }

  if (!tokens.access_token) {
    console.error({ route: 'gmailService.exchangeCodeForTokens', step: 'validate', error: 'No access_token in token response' });
    throw new Error('Failed to obtain access token from Google');
  }

  if (!tokens.refresh_token) {
    console.warn({ route: 'gmailService.exchangeCodeForTokens', step: 'validate', warning: 'No refresh_token — user may have already granted access. Will attempt to use stored refresh token.' });
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || null,
    expiryDate: tokens.expiry_date || Date.now() + 3600 * 1000,
  };
}

export async function storeGmailTokens(userId: string, tokens: GmailTokenData): Promise<void> {
  const db = getAdminDb();
  await db.collection('userGmailTokens').doc(userId).set(tokens, { merge: true });
}

export async function getGmailTokens(userId: string): Promise<GmailTokenData | null> {
  const db = getAdminDb();
  const doc = await db.collection('userGmailTokens').doc(userId).get();
  if (!doc.exists) return null;
  return doc.data() as GmailTokenData;
}

export async function revokeGmailToken(accessToken: string): Promise<void> {
  try {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessToken)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  } catch (err: any) {
    console.warn('[gmailService] Token revocation failed (non-fatal):', err.message);
  }
}

export async function deleteGmailTokens(userId: string): Promise<void> {
  const db = getAdminDb();
  await db.collection('userGmailTokens').doc(userId).delete();
}

export async function getAuthenticatedGmailClient(userId: string) {
  const tokens = await getGmailTokens(userId);
  if (!tokens) {
    console.error({ route: 'gmailService.getAuthenticatedGmailClient', step: 'getTokens', error: 'No Gmail tokens found for user', userId });
    throw new Error('Gmail not connected');
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expiry_date: tokens.expiryDate,
  });

  oauth2Client.on('tokens', async (newTokens) => {
    if (newTokens.access_token) {
      const updated: Partial<GmailTokenData> = {
        accessToken: newTokens.access_token,
        expiryDate: newTokens.expiry_date || Date.now() + 3600 * 1000,
        updatedAt: Date.now(),
      };
      if (newTokens.refresh_token) {
        updated.refreshToken = newTokens.refresh_token;
      }
      try {
        await storeGmailTokens(userId, { ...tokens, ...updated });
      } catch (err: any) {
        console.error({ route: 'gmailService.tokenRefresh', step: 'storeUpdatedTokens', error: err.message });
      }
    }
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export interface PendingBill {
  id?: string;
  userId: string;
  gmailMessageId: string;
  merchantName: string;
  amount: number | null;
  dueDate: string | null;
  accountNumber: string | null;
  confidence: 'high' | 'medium' | 'low';
  rawEmailSnippet: string;
  emailSubject: string;
  emailFrom: string;
  emailDate: string;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: number;
  matchedProviderId?: string;
  matchedProviderName?: string;
  category?: string;
}

export async function storePendingBill(bill: Omit<PendingBill, 'id'>): Promise<string> {
  const db = getAdminDb();
  const docRef = await db.collection('pendingBills').add(bill);
  return docRef.id;
}

export async function getPendingBills(userId: string): Promise<PendingBill[]> {
  const db = getAdminDb();
  const snapshot = await db.collection('pendingBills')
    .where('userId', '==', userId)
    .where('status', '==', 'pending')
    .orderBy('createdAt', 'desc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PendingBill));
}

export async function checkDuplicateGmailMessage(userId: string, gmailMessageId: string): Promise<boolean> {
  const db = getAdminDb();
  const snapshot = await db.collection('pendingBills')
    .where('userId', '==', userId)
    .where('gmailMessageId', '==', gmailMessageId)
    .limit(1)
    .get();
  return !snapshot.empty;
}

export async function updatePendingBillStatus(billId: string, status: 'confirmed' | 'rejected', userId: string): Promise<void> {
  const db = getAdminDb();
  const doc = await db.collection('pendingBills').doc(billId).get();
  if (!doc.exists) throw new Error('Pending bill not found');
  const data = doc.data();
  if (data?.userId !== userId) throw new Error('Unauthorized: bill does not belong to user');
  await db.collection('pendingBills').doc(billId).update({ status });
}

export async function getGmailConnectionStatus(userId: string): Promise<{
  connected: boolean;
  email?: string;
  connectedAt?: number;
  hasRefreshToken?: boolean;
}> {
  const tokens = await getGmailTokens(userId);
  if (!tokens) return { connected: false, hasRefreshToken: false };
  return {
    connected: true,
    email: tokens.email,
    connectedAt: tokens.connectedAt,
    hasRefreshToken: !!tokens.refreshToken,
  };
}
