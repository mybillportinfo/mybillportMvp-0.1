import { getAdminApp } from './adminSdk';
import { getAuth } from 'firebase-admin/auth';
import { getAppCheck } from 'firebase-admin/app-check';

export async function verifyFirebaseToken(authHeader: string | null): Promise<{
  valid: boolean;
  uid?: string;
  email?: string;
  error?: string;
}> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or malformed Authorization header' };
  }

  const idToken = authHeader.split('Bearer ')[1];
  if (!idToken || idToken.length < 100) {
    return { valid: false, error: 'Invalid token format' };
  }

  try {
    const app = getAdminApp();
    const auth = getAuth(app);
    const decoded = await auth.verifyIdToken(idToken, true);
    return { valid: true, uid: decoded.uid, email: decoded.email };
  } catch (error: any) {
    const code = error?.code || '';
    console.error({ route: 'authVerify', step: 'verifyIdToken', code, error: error?.message });
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.error('[authVerify] FIREBASE_SERVICE_ACCOUNT_KEY is not set — Admin SDK cannot verify tokens');
    }
    if (code === 'auth/id-token-expired') return { valid: false, error: 'Token expired' };
    if (code === 'auth/id-token-revoked') return { valid: false, error: 'Token revoked' };
    if (code === 'auth/argument-error') return { valid: false, error: 'Invalid token' };
    return { valid: false, error: 'Authentication failed' };
  }
}

export async function verifyAppCheckToken(appCheckToken: string | null): Promise<{
  valid: boolean;
  error?: string;
}> {
  if (!appCheckToken) return { valid: false, error: 'Missing App Check token' };
  try {
    const app = getAdminApp();
    const appCheck = getAppCheck(app);
    await appCheck.verifyToken(appCheckToken);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid App Check token' };
  }
}

export function sanitizeString(input: unknown, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  return input.slice(0, maxLength).replace(/[<>]/g, '');
}

export function isValidMimeType(mimeType: string): boolean {
  const ALLOWED_MIME_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf',
  ];
  return ALLOWED_MIME_TYPES.includes(mimeType);
}
