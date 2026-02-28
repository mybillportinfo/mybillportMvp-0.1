const REQUIRED_SERVER_VARS: Array<{ key: string; description: string }> = [
  { key: 'FIREBASE_SERVICE_ACCOUNT_KEY', description: 'Firebase Admin SDK service account JSON' },
  { key: 'GMAIL_CLIENT_ID', description: 'Google OAuth Client ID for Gmail' },
  { key: 'GMAIL_CLIENT_SECRET', description: 'Google OAuth Client Secret for Gmail' },
  { key: 'APP_URL', description: 'Production app URL (e.g. https://mybillport.com)' },
];

let validated = false;

export function validateEnv(): void {
  if (validated) return;

  const missing: string[] = [];

  for (const { key, description } of REQUIRED_SERVER_VARS) {
    if (!process.env[key]) {
      missing.push(`  - ${key}: ${description}`);
    }
  }

  if (missing.length > 0) {
    const msg = [
      '[validateEnv] STARTUP ERROR: Missing required environment variables.',
      ...missing,
      'Set these in Vercel → Project Settings → Environment Variables, then redeploy.',
    ].join('\n');
    console.error(msg);
    throw new Error(`Missing required environment variables: ${missing.map(m => m.trim().split(':')[0]).join(', ')}`);
  }

  const saKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY!;
  try {
    const parsed = JSON.parse(saKey);
    if (!parsed.project_id || !parsed.private_key || !parsed.client_email) {
      throw new Error('Service account JSON is missing required fields (project_id, private_key, client_email)');
    }
  } catch (err: any) {
    console.error('[validateEnv] FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON:', err.message);
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. Paste the full JSON from Firebase Console → Service Accounts → Generate Key.');
  }

  validated = true;
}

export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`[getRequiredEnv] Missing required env var: ${key}`);
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
