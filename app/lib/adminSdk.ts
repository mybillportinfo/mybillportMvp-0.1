import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let _app: App | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function initAdminApp(): App {
  if (_app) return _app;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    _app = existingApps[0];
    return _app;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    console.error('[adminSdk] FIREBASE_SERVICE_ACCOUNT_KEY is not set — Firebase Admin cannot initialize.');
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Set it in Vercel → Environment Variables and redeploy.');
  }

  let serviceAccount: any;
  try {
    serviceAccount = JSON.parse(serviceAccountKey);
  } catch (err: any) {
    console.error('[adminSdk] FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON:', err.message);
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. Paste the complete JSON from Firebase Console → Service Accounts → Generate new private key.');
  }

  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    console.error('[adminSdk] FIREBASE_SERVICE_ACCOUNT_KEY JSON is missing required fields:', {
      has_project_id: !!serviceAccount.project_id,
      has_private_key: !!serviceAccount.private_key,
      has_client_email: !!serviceAccount.client_email,
    });
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is missing required fields. Download a fresh service account key from Firebase Console.');
  }

  console.log('[adminSdk] Initializing Firebase Admin with project:', serviceAccount.project_id);

  _app = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });

  return _app;
}

export function getAdminApp(): App {
  return initAdminApp();
}

export function getAdminDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(initAdminApp());
  return _db;
}

export function getAdminAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(initAdminApp());
  return _auth;
}
