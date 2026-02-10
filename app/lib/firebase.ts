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

export type BillStatus = "unpaid" | "partially_paid" | "paid";
export type BillingFrequency = "monthly" | "biweekly" | "annual";

export interface Bill {
  id?: string;
  userId: string;
  category: string;
  subcategory: string;
  providerName: string;
  accountNumber: string;
  dueDate: Date;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: BillStatus;
  billingFrequency: BillingFrequency;
  notes: string;
  createdAt: Date;
}

export type NotificationType = "bill_added" | "due_soon" | "due_today" | "overdue" | "payment_success";

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

export interface Payment {
  id?: string;
  userId: string;
  billId: string;
  amountPaid: number;
  paymentType: string;
  timestamp: Date;
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
  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, "bills"), {
    userId,
    category: bill.category,
    subcategory: bill.subcategory || '',
    providerName: bill.providerName,
    accountNumber: bill.accountNumber || '',
    dueDate: Timestamp.fromDate(new Date(bill.dueDate)),
    amount: bill.amount,
    paidAmount: 0,
    remainingAmount: bill.amount,
    status: "unpaid",
    billingFrequency: bill.billingFrequency || 'monthly',
    notes: bill.notes || '',
    createdAt: now,
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
      const amount = data.amount || 0;
      const paidAmount = data.paidAmount ?? data.amountPaid ?? 0;
      const providerName = data.providerName || data.companyName || data.billName || '';

      let status: BillStatus = "unpaid";
      if (data.status) {
        status = data.status;
      } else if (data.paymentStatus) {
        status = data.paymentStatus;
      } else if (data.isPaid) {
        status = "paid";
      } else if (paidAmount > 0) {
        status = "partially_paid";
      }

      return {
        id: d.id,
        userId: data.userId,
        category: data.category || data.billType || 'other',
        subcategory: data.subcategory || '',
        providerName,
        accountNumber: data.accountNumber || '',
        dueDate: data.dueDate?.toDate() || new Date(),
        amount,
        paidAmount,
        remainingAmount: data.remainingAmount ?? data.remainingBalance ?? (amount - paidAmount),
        status,
        billingFrequency: data.billingFrequency || 'monthly',
        notes: data.notes || '',
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });

    return bills;
  } catch (error) {
    console.error('Firestore fetchBills error:', error);
    throw error;
  }
}

export function sortBills(bills: Bill[]): Bill[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return [...bills].sort((a, b) => {
    const aIsPaid = a.status === 'paid';
    const bIsPaid = b.status === 'paid';
    if (aIsPaid && !bIsPaid) return 1;
    if (!aIsPaid && bIsPaid) return -1;
    if (aIsPaid && bIsPaid) return 0;

    const aDue = new Date(a.dueDate);
    const bDue = new Date(b.dueDate);
    aDue.setHours(0, 0, 0, 0);
    bDue.setHours(0, 0, 0, 0);
    const aOverdue = aDue < now;
    const bOverdue = bDue < now;
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    return aDue.getTime() - bDue.getTime();
  });
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

  const updateData: { [x: string]: string | number | boolean | Timestamp } = {};

  if (updates.providerName !== undefined) updateData.providerName = updates.providerName;
  if (updates.accountNumber !== undefined) updateData.accountNumber = updates.accountNumber;
  if (updates.amount !== undefined) updateData.amount = updates.amount;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory;
  if (updates.dueDate !== undefined) updateData.dueDate = Timestamp.fromDate(new Date(updates.dueDate));
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.paidAmount !== undefined) updateData.paidAmount = updates.paidAmount;
  if (updates.remainingAmount !== undefined) updateData.remainingAmount = updates.remainingAmount;
  if (updates.billingFrequency !== undefined) updateData.billingFrequency = updates.billingFrequency;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

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

export async function payBill(userId: string, billId: string, payType: 'full' | 'half') {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not available');
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User must be authenticated');

  await currentUser.getIdToken(true);
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not available');

  const billDoc = await getDoc(doc(db, "bills", billId));
  if (!billDoc.exists()) throw new Error('Bill not found');

  const billData = billDoc.data();
  const totalAmount = billData.amount || 0;
  const currentPaid = billData.paidAmount ?? billData.amountPaid ?? 0;
  const currentRemaining = billData.remainingAmount ?? billData.remainingBalance ?? (totalAmount - currentPaid);

  let paymentAmount: number;
  let newPaidAmount: number;
  let newRemainingAmount: number;
  let newStatus: BillStatus;

  if (payType === 'full') {
    paymentAmount = currentRemaining;
    newPaidAmount = totalAmount;
    newRemainingAmount = 0;
    newStatus = "paid";
  } else {
    paymentAmount = Math.round((currentRemaining / 2) * 100) / 100;
    newPaidAmount = Math.round((currentPaid + paymentAmount) * 100) / 100;
    newRemainingAmount = Math.round((totalAmount - newPaidAmount) * 100) / 100;
    newStatus = newRemainingAmount <= 0 ? "paid" : "partially_paid";
    if (newRemainingAmount <= 0) {
      newRemainingAmount = 0;
      newPaidAmount = totalAmount;
    }
  }

  await updateDoc(doc(db, "bills", billId), {
    paidAmount: newPaidAmount,
    remainingAmount: newRemainingAmount,
    status: newStatus,
    isPaid: newStatus === "paid",
    paymentStatus: newStatus,
    amountPaid: newPaidAmount,
    remainingBalance: newRemainingAmount,
  });

  await addDoc(collection(db, "payments"), {
    userId,
    billId,
    amountPaid: paymentAmount,
    paymentType: payType,
    timestamp: Timestamp.now(),
  });

  return { paymentAmount, newPaidAmount, newRemainingAmount, newStatus };
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

export async function createBillAddedNotification(userId: string, providerName: string, billId: string) {
  const prefs = await getUserPreferences(userId);
  if (!prefs.inAppReminders) return;

  await addNotification(userId, {
    title: "Bill Added",
    message: `Your bill for "${providerName}" was added successfully.`,
    type: "bill_added",
    relatedBillId: billId,
    isRead: false,
  });
}

export async function createPaymentNotification(userId: string, providerName: string, amountPaid: number, billId: string) {
  const prefs = await getUserPreferences(userId);
  if (!prefs.inAppReminders) return;

  await addNotification(userId, {
    title: "Payment Recorded",
    message: `Payment of $${amountPaid.toFixed(2)} for "${providerName}" was recorded.`,
    type: "payment_success",
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
    if (bill.status === "paid") continue;

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
      message = `"${bill.providerName}" ($${bill.amount.toFixed(2)}) is ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} overdue.`;
    } else if (daysUntil === 0) {
      type = "due_today";
      title = "Bill Due Today";
      message = `"${bill.providerName}" ($${bill.amount.toFixed(2)}) is due today.`;
    } else if (daysUntil === 1) {
      type = "due_soon";
      title = "Bill Due Tomorrow";
      message = `"${bill.providerName}" ($${bill.amount.toFixed(2)}) is due tomorrow.`;
    } else if (daysUntil <= 3 && daysUntil > 1) {
      type = "due_soon";
      title = "Bill Due Soon";
      message = `"${bill.providerName}" ($${bill.amount.toFixed(2)}) is due in ${daysUntil} days.`;
    } else if (daysUntil === 7) {
      type = "due_soon";
      title = "Bill Due in 7 Days";
      message = `"${bill.providerName}" ($${bill.amount.toFixed(2)}) is due in 7 days.`;
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
