import { google } from 'googleapis';
import { getAdminDb } from './adminSdk';
import crypto from 'crypto';

export function getRedirectUri(): string {
  if (process.env.GMAIL_REDIRECT_URI) return process.env.GMAIL_REDIRECT_URI;
  const appUrl = process.env.APP_URL || 'https://mybillport.com';
  return `${appUrl}/api/gmail/callback`;
}

export function getOAuth2Client() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = getRedirectUri();

  if (!clientId || !clientSecret) {
    console.error('[gmailService] Missing GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET');
    throw new Error('Gmail OAuth credentials not configured. Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in Vercel.');
  }

  console.log('[gmailService] OAuth2Client config:', {
    clientId: clientId.slice(0, 20) + '...',
    redirectUri,
    hasSecret: !!clientSecret,
  });

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
    const googleError = err.response?.data;
    console.error({
      route: 'gmailService.exchangeCodeForTokens',
      step: 'getToken',
      googleRawError: googleError,
      errorCode: googleError?.error,
      errorDescription: googleError?.error_description,
      httpStatus: err.status || err.code,
      message: err.message,
    });
    const detail = googleError?.error || err.message;
    throw new Error(`Google token exchange failed: ${detail}`);
  }

  if (!tokens.access_token) {
    console.error({ route: 'gmailService.exchangeCodeForTokens', step: 'validate', error: 'No access_token in response' });
    throw new Error('Failed to obtain access token from Google');
  }

  if (!tokens.refresh_token) {
    console.warn('[gmailService] No refresh_token returned — user may have granted access before. Will attempt stored token.');
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
    console.error({ route: 'gmailService.getAuthenticatedGmailClient', step: 'getTokens', error: 'No Gmail tokens found', userId });
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
      if (newTokens.refresh_token) updated.refreshToken = newTokens.refresh_token;
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
  // Core extraction
  merchantName: string;
  billerDomain: string | null;
  amount: number | null;
  dueDate: string | null;
  accountNumber: string | null;       // cleaned alphanumeric (for dedup/storage)
  accountNumberDisplay: string | null; // original format with spaces (for display)
  statementDate: string | null;
  minimumPayment: number | null;
  totalBalance: number | null;
  currency: string;
  // Confidence
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number;
  detectionMethod: 'regex' | 'ai' | 'hybrid';
  // Email metadata
  rawEmailSnippet: string;
  emailSubject: string;
  emailFrom: string;
  emailDate: string;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: number;
  // Provider matching
  matchedProviderId?: string;
  matchedProviderName?: string;
  category?: string;
}

/**
 * Build a normalized key for deduplication.
 * Known providers → "provider:<registryId>" (most reliable)
 * Unknown → "name:<first12charsOfNormalizedName>"
 */
export function buildMerchantKey(matchedProviderId: string | undefined, merchantName: string): string {
  if (matchedProviderId) return `provider:${matchedProviderId}`;
  const norm = merchantName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
  return `name:${norm}`;
}

/**
 * Return a Set of merchant keys for all PENDING bills belonging to this user.
 * Used at scan start so we can skip billers already awaiting review.
 */
export async function fetchExistingPendingMerchantKeys(userId: string): Promise<Set<string>> {
  const db = getAdminDb();
  const snapshot = await db.collection('pendingBills')
    .where('userId', '==', userId)
    .get();

  const keys = new Set<string>();
  for (const doc of snapshot.docs) {
    const d = doc.data();
    if (d.status !== 'pending') continue;
    keys.add(buildMerchantKey(d.matchedProviderId, d.merchantName || ''));
  }
  return keys;
}

export async function storePendingBill(bill: Omit<PendingBill, 'id'>): Promise<string> {
  const db = getAdminDb();
  const docRef = await db.collection('pendingBills').add(bill);
  return docRef.id;
}

export async function getPendingBills(userId: string): Promise<PendingBill[]> {
  const db = getAdminDb();
  // Single-field filter only — avoids requiring a composite Firestore index.
  // Status filtering and sorting are done in memory.
  const snapshot = await db.collection('pendingBills')
    .where('userId', '==', userId)
    .get();
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as PendingBill))
    .filter(b => b.status === 'pending')
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export async function checkDuplicateGmailMessage(userId: string, gmailMessageId: string): Promise<boolean> {
  const db = getAdminDb();
  // Single-field filter per query — avoids composite index requirements.
  // Status filtering done in memory.
  const snapshot = await db.collection('pendingBills')
    .where('userId', '==', userId)
    .where('gmailMessageId', '==', gmailMessageId)
    .limit(5)
    .get();
  if (snapshot.empty) return false;
  // Block re-import only if pending or confirmed; allow if all are rejected
  return snapshot.docs.some(doc => {
    const status = doc.data().status;
    return status === 'pending' || status === 'confirmed';
  });
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
