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
  runTransaction,
  writeBatch,
  serverTimestamp,
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

// Bill status: unpaid (no payment), partial (some paid), paid (fully paid)
export type BillStatus = "unpaid" | "partial" | "paid";

export type BillingCycle = 'monthly' | 'biweekly' | 'annual' | 'one-time';

// Bill data model with category support (backward compatible with old bills)
export interface Bill {
  id?: string;
  userId: string;
  companyName: string;
  accountNumber: string;
  dueDate: Date;
  totalAmount: number;
  paidAmount: number;
  status: BillStatus;
  category?: string;
  subcategory?: string;
  billingCycle?: BillingCycle;
  metadata?: Record<string, string | number>;
  providerId: string;
  providerName: string;
  isCustomProvider?: boolean;
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

export type PaymentMethod = 'online' | 'mail' | 'in-person' | 'other';

export interface Payment {
  id?: string;
  userId: string;
  billId: string;
  amountPaid: number;
  paymentType: string;
  method?: PaymentMethod;
  confirmationCode?: string;
  notes?: string;
  recordedVia: 'manual' | 'auto';
  stripePaymentIntentId?: string;
  timestamp: Date;
}

export interface BillPaymentRecord {
  id?: string;
  paidAt: Date;
  amount: number;
  method: PaymentMethod | null;
  confirmationCode?: string;
  recordedVia: 'manual';
  notes?: string;
}

export interface UserPreferences {
  inAppReminders: boolean;
}

// --- Auth functions ---

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

// --- Bill CRUD ---

export async function addBill(userId: string, bill: Omit<Bill, 'id' | 'userId' | 'createdAt'>) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not available');
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be authenticated to add bills');
  }

  if (!bill.providerName || !bill.providerName.trim()) {
    throw new Error('providerName is required');
  }
  if (!bill.providerId || !bill.providerId.trim()) {
    throw new Error('providerId is required');
  }

  await currentUser.getIdToken(true);

  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not available');
  const now = Timestamp.now();

  const billData: Record<string, any> = {
    userId,
    companyName: bill.companyName,
    accountNumber: bill.accountNumber || '',
    dueDate: Timestamp.fromDate(new Date(bill.dueDate)),
    totalAmount: bill.totalAmount,
    paidAmount: 0,
    status: "unpaid",
    providerId: bill.providerId.trim(),
    providerName: bill.providerName.trim(),
    createdAt: now,
  };

  if (bill.isCustomProvider) billData.isCustomProvider = true;
  if (bill.category) billData.category = bill.category;
  if (bill.subcategory) billData.subcategory = bill.subcategory;
  if (bill.billingCycle) billData.billingCycle = bill.billingCycle;
  if (bill.metadata && Object.keys(bill.metadata).length > 0) {
    billData.metadata = bill.metadata;
  }

  const docRef = await addDoc(collection(db, "bills"), billData);
  return docRef.id;
}

// Fetch all bills for a user, with backward compatibility for old field names
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

      // Backward compatibility: normalize old field names
      const companyName = data.companyName || data.providerName || data.billName || '';
      const totalAmount = data.totalAmount || data.amount || 0;
      const paidAmount = data.paidAmount ?? data.amountPaid ?? 0;

      // Derive status from various legacy fields
      let status: BillStatus = "unpaid";
      if (data.status === "paid" || data.isPaid) {
        status = "paid";
      } else if (data.status === "partial" || data.status === "partially_paid") {
        status = "partial";
      } else if (paidAmount > 0 && paidAmount < totalAmount) {
        status = "partial";
      } else if (paidAmount >= totalAmount && totalAmount > 0) {
        status = "paid";
      }

      return {
        id: d.id,
        userId: data.userId,
        companyName,
        accountNumber: data.accountNumber || '',
        dueDate: data.dueDate?.toDate() || new Date(),
        totalAmount,
        paidAmount,
        status,
        category: data.category || undefined,
        subcategory: data.subcategory || undefined,
        billingCycle: data.billingCycle || undefined,
        metadata: data.metadata || undefined,
        providerId: data.providerId || 'unknown',
        providerName: data.providerName || companyName,
        isCustomProvider: data.isCustomProvider || undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });

    return bills;
  } catch (error) {
    console.error('Firestore fetchBills error:', error);
    throw error;
  }
}

// Sort bills: overdue first, then upcoming by due date, paid at bottom
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

// --- Payment update (client-side, after Stripe confirms) ---
// Updates bill in Firestore after Stripe PaymentIntent succeeds
// Uses Firestore transaction to prevent race conditions
export async function updateBillAfterPayment(
  userId: string,
  billId: string,
  paymentAmount: number,
  stripePaymentIntentId: string
): Promise<{ newPaidAmount: number; newStatus: BillStatus }> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not available');
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User must be authenticated');

  await currentUser.getIdToken(true);
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not available');

  const billRef = doc(db, "bills", billId);

  // Use Firestore transaction to prevent race conditions on concurrent payments
  const result = await runTransaction(db, async (transaction) => {
    const billDoc = await transaction.get(billRef);
    if (!billDoc.exists()) throw new Error('Bill not found');

    const data = billDoc.data();
    if (data.userId !== userId) throw new Error('Unauthorized');

    const totalAmount = data.totalAmount || data.amount || 0;
    const currentPaidAmount = data.paidAmount ?? data.amountPaid ?? 0;

    // Increment paid amount (capped at totalAmount)
    const newPaidAmount = Math.min(
      Math.round((currentPaidAmount + paymentAmount) * 100) / 100,
      totalAmount
    );

    // Determine new status
    let newStatus: BillStatus;
    if (newPaidAmount >= totalAmount) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partial';
    } else {
      newStatus = 'unpaid';
    }

    // Update bill within the transaction
    transaction.update(billRef, {
      paidAmount: newPaidAmount,
      status: newStatus,
    });

    return { newPaidAmount, newStatus, totalAmount, currentPaidAmount };
  });

  // Record payment in payments collection for audit trail (outside transaction)
  await addDoc(collection(db, "payments"), {
    userId,
    billId,
    amountPaid: paymentAmount,
    paymentType: paymentAmount >= (result.totalAmount - result.currentPaidAmount) ? 'full' : 'partial',
    stripePaymentIntentId,
    timestamp: Timestamp.now(),
  });

  return { newPaidAmount: result.newPaidAmount, newStatus: result.newStatus };
}

// --- Notification functions ---

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

// --- User preferences ---

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

// --- Notification helpers ---

export async function createBillAddedNotification(userId: string, companyName: string, billId: string) {
  const prefs = await getUserPreferences(userId);
  if (!prefs.inAppReminders) return;

  await addNotification(userId, {
    title: "Bill Added",
    message: `Your bill for "${companyName}" was added successfully.`,
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
      message = `"${bill.companyName}" ($${bill.totalAmount.toFixed(2)}) is ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} overdue.`;
    } else if (daysUntil === 0) {
      type = "due_today";
      title = "Bill Due Today";
      message = `"${bill.companyName}" ($${bill.totalAmount.toFixed(2)}) is due today.`;
    } else if (daysUntil === 1) {
      type = "due_soon";
      title = "Bill Due Tomorrow";
      message = `"${bill.companyName}" ($${bill.totalAmount.toFixed(2)}) is due tomorrow.`;
    } else if (daysUntil <= 3 && daysUntil > 1) {
      type = "due_soon";
      title = "Bill Due Soon";
      message = `"${bill.companyName}" ($${bill.totalAmount.toFixed(2)}) is due in ${daysUntil} days.`;
    } else if (daysUntil === 7) {
      type = "due_soon";
      title = "Bill Due in 7 Days";
      message = `"${bill.companyName}" ($${bill.totalAmount.toFixed(2)}) is due in 7 days.`;
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

// --- Mark Bill as Paid + Payment History (subcollection) ---

export async function markBillAsPaid(
  billId: string,
  userId: string,
  amount: number,
  method: PaymentMethod = 'online',
  confirmationCode?: string,
  notes?: string
): Promise<{ newPaidAmount: number; newStatus: BillStatus }> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not available');
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User must be authenticated');

  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not available');

  const billRef = doc(db, "bills", billId);
  const now = Timestamp.now();
  const paymentAmount = Math.max(amount, 0);

  const result = await runTransaction(db, async (transaction) => {
    const billDoc = await transaction.get(billRef);
    if (!billDoc.exists()) throw new Error('Bill not found');

    const data = billDoc.data();
    if (data.userId !== userId) throw new Error('Unauthorized');

    const totalAmount = Number(data.totalAmount) || Number(data.amount) || 0;
    const currentPaidAmount = Number(data.paidAmount) || Number(data.amountPaid) || 0;
    const actualPayment = paymentAmount > 0 ? paymentAmount : Math.max(totalAmount - currentPaidAmount, 0);

    const newPaidAmount = Math.min(
      Math.round((currentPaidAmount + actualPayment) * 100) / 100,
      totalAmount
    );

    let newStatus: BillStatus;
    if (newPaidAmount >= totalAmount) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partial';
    } else {
      newStatus = 'unpaid';
    }

    transaction.update(billRef, {
      status: newStatus,
      paidAmount: newPaidAmount,
      paidAt: now,
      lastPaymentAmount: actualPayment,
      lastPaymentDate: now,
    });

    return { newPaidAmount, newStatus, actualPayment };
  });

  await addDoc(collection(db, "bills", billId, "payments"), {
    paidAt: now,
    amount: result.actualPayment,
    method: method || null,
    confirmationCode: confirmationCode || '',
    recordedVia: 'manual',
    notes: notes || '',
    userId,
  });

  await addDoc(collection(db, "payments"), {
    userId,
    billId,
    amountPaid: result.actualPayment,
    paymentType: result.newStatus === 'paid' ? 'full' : 'partial',
    method: method || null,
    recordedVia: 'manual',
    timestamp: now,
  });

  await addNotification(userId, {
    title: "Payment Recorded",
    message: `Your payment of $${result.actualPayment.toFixed(2)} has been marked as paid.`,
    type: "payment_success",
    relatedBillId: billId,
    isRead: false,
  }).catch(console.error);

  return { newPaidAmount: result.newPaidAmount, newStatus: result.newStatus };
}

export async function getPaymentHistory(billId: string): Promise<BillPaymentRecord[]> {
  const auth = getFirebaseAuth();
  if (!auth) return [];
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  await currentUser.getIdToken(true);
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(
    collection(db, "bills", billId, "payments"),
    orderBy("paidAt", "desc")
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      paidAt: data.paidAt?.toDate() || new Date(),
      amount: data.amount || 0,
      method: data.method || null,
      confirmationCode: data.confirmationCode || undefined,
      recordedVia: 'manual' as const,
      notes: data.notes || undefined,
    };
  });
}

// ONE-TIME MIGRATION: Assign default category to bills missing one
export async function migrateBillsAddCategory(): Promise<{ updated: number; skipped: number; total: number }> {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) {
    throw new Error('Must be authenticated to run migration');
  }

  await auth.currentUser.getIdToken(true);

  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not available');

  const billsSnapshot = await getDocs(collection(db, 'bills'));
  const total = billsSnapshot.size;
  let updated = 0;
  let skipped = 0;

  const batch = writeBatch(db);
  const MAX_BATCH = 500;

  billsSnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (!data.category) {
      if (updated < MAX_BATCH) {
        batch.update(doc(db, 'bills', docSnap.id), {
          category: 'miscellaneous',
          subcategory: 'other',
          migratedAt: serverTimestamp(),
        });
        updated++;
      }
    } else {
      skipped++;
    }
  });

  if (updated > 0) {
    await batch.commit();
  }

  console.log(`Migration complete: ${updated} updated, ${skipped} skipped, ${total} total`);
  return { updated, skipped, total };
}

export type { User };
