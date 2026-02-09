'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  Firestore,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  browserLocalPersistence,
  setPersistence,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";

function getFirebaseConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !projectId || !appId) {
    console.error(
      `Missing Firebase configuration. Check your environment variables:\n` +
      `  NEXT_PUBLIC_FIREBASE_API_KEY: ${apiKey ? '✓' : '✗ MISSING'}\n` +
      `  NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${projectId ? '✓' : '✗ MISSING'}\n` +
      `  NEXT_PUBLIC_FIREBASE_APP_ID: ${appId ? '✓' : '✗ MISSING'}`
    );
    return null;
  }

  return {
    apiKey,
    authDomain: `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: `${projectId}.appspot.com`,
    appId,
  };
}

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;
  if (_app) return _app;

  if (getApps().length > 0) {
    _app = getApp();
    return _app;
  }

  const config = getFirebaseConfig();
  if (!config) {
    return null;
  }

  _app = initializeApp(config);
  return _app;
}

function getFirebaseDb(): Firestore | null {
  if (_db) return _db;
  const app = getFirebaseApp();
  if (!app) return null;
  _db = getFirestore(app);
  return _db;
}

function getFirebaseAuth(): Auth | null {
  if (_auth) return _auth;
  const app = getFirebaseApp();
  if (!app) return null;
  _auth = getAuth(app);
  setPersistence(_auth, browserLocalPersistence).catch(console.error);
  return _auth;
}

export interface Bill {
  id?: string;
  userId: string;
  providerName: string;
  provider?: string;
  billType: string;
  amount: number;
  dueDate: Date;
  createdAt: Date;
}

export interface AppNotification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  relatedBillId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface UserPreferences {
  inAppReminders: boolean;
}

export function registerUser(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) return Promise.reject(new Error('Firebase not available'));
  return createUserWithEmailAndPassword(auth, email, password).then(r => r.user);
}

export function loginUser(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) return Promise.reject(new Error('Firebase not available'));
  return signInWithEmailAndPassword(auth, email, password).then(r => r.user);
}

export function logoutUser() {
  const auth = getFirebaseAuth();
  if (!auth) return Promise.resolve();
  return signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function addBill(userId: string, bill: Omit<Bill, 'id' | 'userId' | 'createdAt'>) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not available');
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be authenticated to add bills');
  }

  await currentUser.getIdToken(true);

  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not available');
  const docRef = await addDoc(collection(db, "bills"), {
    ...bill,
    userId,
    dueDate: Timestamp.fromDate(new Date(bill.dueDate)),
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function fetchBills(userId: string): Promise<Bill[]> {
  try {
    const auth = getFirebaseAuth();
    if (!auth) return [];
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return [];
    }

    await currentUser.getIdToken(true);

    const db = getFirebaseDb();
    if (!db) return [];
    const q = query(
      collection(db, "bills"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);

    const bills = snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        providerName: data.providerName,
        provider: data.provider || '',
        billType: data.billType,
        amount: data.amount,
        dueDate: data.dueDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
    return bills.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  } catch (error) {
    console.error('Firestore fetchBills error:', error);
    throw error;
  }
}

export async function deleteBill(billId: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not available');
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be authenticated to delete bills');
  }

  await currentUser.getIdToken(true);
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not available');
  await deleteDoc(doc(db, "bills", billId));
}

// --- Notification Functions ---

export async function addNotification(userId: string, notification: Omit<AppNotification, 'id' | 'userId' | 'createdAt'>) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not available');
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User must be authenticated');

  await currentUser.getIdToken(true);
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not available');

  const docRef = await addDoc(collection(db, "notifications"), {
    ...notification,
    userId,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  try {
    const auth = getFirebaseAuth();
    if (!auth) return [];
    const currentUser = auth.currentUser;
    if (!currentUser) return [];

    await currentUser.getIdToken(true);
    const db = getFirebaseDb();
    if (!db) return [];

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId,
        title: data.title,
        message: data.message,
        relatedBillId: data.relatedBillId || undefined,
        isRead: data.isRead || false,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error('Firestore fetchNotifications error:', error);
    throw error;
  }
}

export async function markNotificationRead(notificationId: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not available');
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User must be authenticated');

  await currentUser.getIdToken(true);
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not available');
  await updateDoc(doc(db, "notifications", notificationId), { isRead: true });
}

export async function markAllNotificationsRead(userId: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not available');
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User must be authenticated');

  await currentUser.getIdToken(true);
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not available');

  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("isRead", "==", false)
  );
  const snapshot = await getDocs(q);
  const updates = snapshot.docs.map(d => updateDoc(doc(db, "notifications", d.id), { isRead: true }));
  await Promise.all(updates);
}

// --- User Preferences Functions ---

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  try {
    const auth = getFirebaseAuth();
    if (!auth) return { inAppReminders: true };
    const currentUser = auth.currentUser;
    if (!currentUser) return { inAppReminders: true };

    await currentUser.getIdToken(true);
    const db = getFirebaseDb();
    if (!db) return { inAppReminders: true };

    const docSnap = await getDoc(doc(db, "userPreferences", userId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { inAppReminders: data.inAppReminders !== false };
    }
    return { inAppReminders: true };
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return { inAppReminders: true };
  }
}

export async function setUserPreferences(userId: string, prefs: UserPreferences) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not available');
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User must be authenticated');

  await currentUser.getIdToken(true);
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not available');
  await setDoc(doc(db, "userPreferences", userId), prefs, { merge: true });
}

// --- Notification Helpers ---

export async function createBillAddedNotification(userId: string, billName: string, billId: string) {
  const prefs = await getUserPreferences(userId);
  if (!prefs.inAppReminders) return;

  await addNotification(userId, {
    title: "Bill Added",
    message: `"${billName}" has been added to your bills.`,
    relatedBillId: billId,
    isRead: false,
  });
}

export async function checkAndCreateDueSoonNotifications(userId: string, bills: Bill[]) {
  const prefs = await getUserPreferences(userId);
  if (!prefs.inAppReminders) return;

  const now = new Date();
  const dueSoonBills = bills.filter(bill => {
    const diffTime = new Date(bill.dueDate).getTime() - now.getTime();
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= 3;
  });

  for (const bill of dueSoonBills) {
    const daysUntil = Math.ceil((new Date(bill.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const dueText = daysUntil === 0 ? "due today" : `due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;

    await addNotification(userId, {
      title: "Bill Due Soon",
      message: `"${bill.providerName}" ($${bill.amount.toFixed(2)}) is ${dueText}.`,
      relatedBillId: bill.id,
      isRead: false,
    });
  }
}

export function signInWithGoogle() {
  const auth = getFirebaseAuth();
  if (!auth) return Promise.reject(new Error('Firebase not available'));
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider).then(r => r.user);
}

export function resetPassword(email: string) {
  const auth = getFirebaseAuth();
  if (!auth) return Promise.reject(new Error('Firebase not available'));
  return sendPasswordResetEmail(auth, email);
}

// TODO: FUTURE - Push Notifications
// - Register FCM tokens per user device
// - Send push notifications via Firebase Cloud Messaging
// - Background notification handling for mobile web

// TODO: FUTURE - Email Reminders
// - Scheduled email reminders via Cloud Functions
// - Configurable reminder intervals per user
// - Weekly/monthly bill summary emails via MailerSend
// - Overdue bill escalation emails

// TODO: FUTURE - Gmail Bill Ingestion
// - Connect user's Gmail account via OAuth2
// - Parse incoming emails for bill notifications
// - Auto-detect bill amounts and due dates from email content
// - Supported providers: Hydro, Rogers, Bell, Telus, etc.
// - User confirms before adding auto-detected bills

// TODO: FUTURE - Subscription Plans
// - Premium plan with unlimited bills
// - Stripe payment integration for upgrades
// - Plan management in settings
// - Usage analytics and insights

export type { User };
