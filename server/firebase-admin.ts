import admin from 'firebase-admin';

let adminApp: any = null;
let adminDb: any = null;
let adminAuth: any = null;

export function initializeFirebaseAdmin() {
  if (adminApp) {
    return { app: adminApp, db: adminDb, auth: adminAuth };
  }

  try {
    // Check if admin app already exists
    try {
      adminApp = admin.app();
    } catch (e) {
      // No existing app, create new one
      // Initialize with service account
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      if (!serviceAccountKey) {
        console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not found. Firebase Admin features will be limited.");
        // Try to initialize with default credentials
        adminApp = admin.initializeApp();
      } else {
        let serviceAccount: admin.ServiceAccount;
        
        try {
          serviceAccount = JSON.parse(serviceAccountKey);
        } catch (parseError) {
          console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", parseError);
          throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY format. Must be valid JSON.");
        }

        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.projectId || serviceAccount.project_id
        });
      }
    }

    adminDb = admin.firestore(adminApp);
    adminAuth = admin.auth(adminApp);

    console.log("Firebase Admin initialized successfully");
    return { app: adminApp, db: adminDb, auth: adminAuth };

  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    throw error;
  }
}

export function getFirebaseAdmin() {
  if (!adminApp) {
    return initializeFirebaseAdmin();
  }
  return { app: adminApp, db: adminDb, auth: adminAuth };
}