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
  billName: string;
  provider: string;
  amount: number;
  category: string;
  dueDate: Date;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationType = "bill_added" | "due_soon" | "due_today" | "overdue";

export interface AppNotification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
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

export async function addBill(userId: string, bill: Omit<Bill, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not available');
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be authenticated to add bills');
  }

  await currentUser.getIdToken(true);

  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not available');
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, "bills"), {
    userId,
    billName: bill.billName,
    provider: bill.provider,
    amount: bill.amount,
    category: bill.category,
    dueDate: Timestamp.fromDate(new Date(bill.dueDate)),
    isPaid: bill.isPaid ?? false,
    createdAt: now,
    updatedAt: now,
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
        billName: data.billName || data.providerName || '',
        provider: data.provider || '',
        category: data.category || data.billType || 'other',
        amount: data.amount || 0,
        dueDate: data.dueDate?.toDate() || new Date(),
        isPaid: data.isPaid ?? false,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || data.createdAt?.toDate() || new Date(),
      };
    });
    return bills.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  } catch (error) {
    console.error('Firestore fetchBills error:', error);
    throw error;
  }
}

export async function updateBill(billId: string, updates: Partial<Omit<Bill, 'id' | 'userId' | 'createdAt'>>) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not available');
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be authenticated to update bills');
  }

  await currentUser.getIdToken(true);
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not available');

  const updateData: { [x: string]: string | number | boolean | Timestamp } = { updatedAt: Timestamp.now() };

  if (updates.billName !== undefined) updateData.billName = updates.billName;
  if (updates.provider !== undefined) updateData.provider = updates.provider;
  if (updates.amount !== undefined) updateData.amount = updates.amount;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.dueDate !== undefined) updateData.dueDate = Timestamp.fromDate(new Date(updates.dueDate));
  if (updates.isPaid !== undefined) updateData.isPaid = updates.isPaid;

  await updateDoc(doc(db, "bills", billId), updateData);
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
        type: data.type || 'bill_added',
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

export async function createBillAddedNotification(userId: string, billName: string, billId: string) {
  const prefs = await getUserPreferences(userId);
  if (!prefs.inAppReminders) return;

  await addNotification(userId, {
    title: "Bill Added",
    message: `Your bill "${billName}" was added successfully.`,
    type: "bill_added",
    relatedBillId: billId,
    isRead: false,
  });
}

async function hasRecentNotification(userId: string, billId: string, type: NotificationType): Promise<boolean> {
  try {
    const db = getFirebaseDb();
    if (!db) return false;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("relatedBillId", "==", billId),
      where("type", "==", type)
    );
    const snapshot = await getDocs(q);

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return snapshot.docs.some(d => {
      const createdAt = d.data().createdAt?.toDate();
      return createdAt && createdAt > oneDayAgo;
    });
  } catch {
    return false;
  }
}

export async function checkAndCreateDueDateNotifications(userId: string, bills: Bill[]) {
  const prefs = await getUserPreferences(userId);
  if (!prefs.inAppReminders) return;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (const bill of bills) {
    if (bill.isPaid) continue;

    const due = new Date(bill.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - now.getTime();
    const daysUntil = Math.round(diffTime / (1000 * 60 * 60 * 24));

    let type: NotificationType | null = null;
    let title = "";
    let message = "";

    if (daysUntil < 0) {
      type = "overdue";
      title = "Bill Overdue";
      message = `"${bill.billName}" ($${bill.amount.toFixed(2)}) is ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} overdue.`;
    } else if (daysUntil === 0) {
      type = "due_today";
      title = "Bill Due Today";
      message = `"${bill.billName}" ($${bill.amount.toFixed(2)}) is due today.`;
    } else if (daysUntil === 1) {
      type = "due_soon";
      title = "Bill Due Tomorrow";
      message = `"${bill.billName}" ($${bill.amount.toFixed(2)}) is due tomorrow.`;
    } else if (daysUntil === 3) {
      type = "due_soon";
      title = "Bill Due Soon";
      message = `"${bill.billName}" ($${bill.amount.toFixed(2)}) is due in 3 days.`;
    }

    if (type && bill.id) {
      const alreadySent = await hasRecentNotification(userId, bill.id, type);
      if (!alreadySent) {
        await addNotification(userId, {
          title,
          message,
          type,
          relatedBillId: bill.id,
          isRead: false,
        });
      }
    }
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

export type { User };
