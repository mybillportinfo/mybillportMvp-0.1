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
  limit,
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
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  getAdditionalUserInfo,
} from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck, getToken } from "firebase/app-check";
import { getAnalytics, logEvent, Analytics, isSupported as isAnalyticsSupported } from "firebase/analytics";

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
let _appCheck: AppCheck | null = null;
let _analytics: Analytics | null = null;

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

  initAppCheck(_app);
  initAnalytics(_app);

  return _app;
}

function initAppCheck(app: FirebaseApp) {
  if (_appCheck) return;
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) return;

  try {
    if (process.env.NODE_ENV === 'development') {
      (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    _appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (e) {
    // App Check init can fail silently in some environments
  }
}

function initAnalytics(app: FirebaseApp) {
  if (_analytics) return;
  try {
    isAnalyticsSupported().then((supported) => {
      if (supported && app) {
        _analytics = getAnalytics(app);
      }
    });
  } catch (e) {
    // Analytics not supported in this environment
  }
}

export function getFirebaseAnalytics(): Analytics | null {
  return _analytics;
}

export async function getAppCheckToken(): Promise<string | null> {
  if (!_appCheck) return null;
  try {
    const result = await getToken(_appCheck, false);
    return result.token;
  } catch {
    return null;
  }
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

export type RecurringFrequency = 'monthly' | 'quarterly' | 'yearly';

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
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
  recurringConfidence?: number;
  avgRecurringAmount?: number;
  amountDeviationPercent?: number;
  amountDeviationFlag?: boolean;
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
  notifyDays: number[];
}

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  photoURL: string | null;
  updatedAt?: any;
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

export function loadGoogleGIS(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Not in browser'));
    if ((window as any).google?.accounts?.id) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google sign-in'));
    document.head.appendChild(script);
  });
}

export async function signInWithGoogleCredential(idToken: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not available');
  const credential = GoogleAuthProvider.credential(idToken);
  return await signInWithCredential(auth, credential);
}

export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  if (!auth) return Promise.reject(new Error('Firebase not available'));
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({ prompt: 'select_account' });
  await signInWithRedirect(auth, provider);
}

export async function handleGoogleRedirectResult() {
  const auth = getFirebaseAuth();
  if (!auth) return null;
  try {
    return await getRedirectResult(auth);
  } catch (err: any) {
    console.error('Google redirect result error:', err?.code, err?.message);
    return null;
  }
}

export function resetPassword(email: string) {
  const auth = getFirebaseAuth();
  if (!auth) return Promise.reject(new Error('Firebase not available'));
  return sendPasswordResetEmail(auth, email);
}

// --- Account Info ---

export function getLinkedProviders(): string[] {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) return [];
  return auth.currentUser.providerData.map(p => p.providerId);
}

// --- MFA Error Detection ---

export function isMfaError(error: any): boolean {
  return error?.code === 'auth/multi-factor-auth-required';
}

// --- User Profile ---

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const db = getFirebaseDb();
    if (!db) return null;
    const docSnap = await getDoc(doc(db, "userProfiles", userId));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) throw new Error('Must be signed in');
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not available');
  await setDoc(doc(db, "userProfiles", userId), {
    ...profile,
    userId,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function updateUserEmail(newEmail: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) throw new Error('Must be signed in');
  const { updateEmail } = await import('firebase/auth');
  await updateEmail(auth.currentUser, newEmail);
}

export async function updateUserDisplayName(displayName: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) throw new Error('Must be signed in');
  const { updateProfile } = await import('firebase/auth');
  await updateProfile(auth.currentUser, { displayName });
}

export async function updateUserProfilePhoto(photoURL: string | null): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) throw new Error('Must be signed in');
  const { updateProfile } = await import('firebase/auth');
  await updateProfile(auth.currentUser, { photoURL });
}

export async function deleteUserAccount(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) throw new Error('Must be signed in');

  const userId = auth.currentUser.uid;
  const db = getFirebaseDb();

  if (db) {
    try {
      const billsQuery = query(collection(db, "bills"), where("userId", "==", userId));
      const billSnap = await getDocs(billsQuery);
      const batch = writeBatch(db);
      billSnap.docs.forEach(d => batch.delete(d.ref));

      const notifsQuery = query(collection(db, "notifications"), where("userId", "==", userId));
      const notifsSnap = await getDocs(notifsQuery);
      notifsSnap.docs.forEach(d => batch.delete(d.ref));

      batch.delete(doc(db, "userPreferences", userId));
      batch.delete(doc(db, "userProfiles", userId));

      await batch.commit();
    } catch {}
  }

  await auth.currentUser.delete();
}

export type { User };

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
        isRecurring: data.isRecurring ?? undefined,
        recurringFrequency: data.recurringFrequency ?? undefined,
        recurringConfidence: data.recurringConfidence ?? undefined,
        avgRecurringAmount: data.avgRecurringAmount ?? undefined,
        amountDeviationPercent: data.amountDeviationPercent ?? undefined,
        amountDeviationFlag: data.amountDeviationFlag ?? undefined,
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

export async function updateBill(
  billId: string,
  userId: string,
  updates: {
    companyName?: string;
    accountNumber?: string;
    dueDate?: Date;
    totalAmount?: number;
    category?: string;
    subcategory?: string;
    billingCycle?: BillingCycle;
    notes?: string;
  }
): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not available');
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('User must be authenticated');

  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not available');

  const billRef = doc(db, "bills", billId);
  const billSnap = await getDoc(billRef);
  if (!billSnap.exists()) throw new Error('Bill not found');
  if (billSnap.data().userId !== userId) throw new Error('Unauthorized');

  const updateData: Record<string, any> = { updatedAt: serverTimestamp() };

  if (updates.companyName !== undefined) {
    updateData.companyName = updates.companyName;
    updateData.providerName = updates.companyName;
  }
  if (updates.accountNumber !== undefined) updateData.accountNumber = updates.accountNumber;
  if (updates.dueDate !== undefined) updateData.dueDate = Timestamp.fromDate(new Date(updates.dueDate));
  if (updates.totalAmount !== undefined) {
    if (updates.totalAmount <= 0) throw new Error('Amount must be greater than 0');
    updateData.totalAmount = updates.totalAmount;
    const currentPaid = Number(billSnap.data().paidAmount) || 0;
    if (currentPaid >= updates.totalAmount && updates.totalAmount > 0) {
      updateData.status = 'paid';
    } else if (currentPaid > 0) {
      updateData.status = 'partial';
    } else {
      updateData.status = 'unpaid';
    }
  }
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory;
  if (updates.billingCycle !== undefined) updateData.billingCycle = updates.billingCycle;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  await updateDoc(billRef, updateData);
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

    let snapshot;
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      snapshot = await getDocs(q);
    } catch (indexError) {
      try {
        const fallbackQ = query(
          collection(db, "notifications"),
          where("userId", "==", userId)
        );
        snapshot = await getDocs(fallbackQ);
      } catch (fallbackError) {
        return [];
      }
    }

    const results: AppNotification[] = [];
    for (const d of snapshot.docs) {
      try {
        const data = d.data();
        let createdAtDate: Date;
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
          createdAtDate = data.createdAt.toDate();
        } else if (data.createdAt instanceof Date) {
          createdAtDate = data.createdAt;
        } else if (typeof data.createdAt === 'string' || typeof data.createdAt === 'number') {
          createdAtDate = new Date(data.createdAt);
        } else {
          createdAtDate = new Date();
        }

        results.push({
          id: d.id,
          userId: data.userId,
          title: data.title || '',
          message: data.message || '',
          type: data.type || 'bill_added',
          relatedBillId: data.relatedBillId || undefined,
          isRead: data.isRead || false,
          createdAt: createdAtDate,
        });
      } catch {
        continue;
      }
    }

    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return results;
  } catch (error) {
    return [];
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

const DEFAULT_NOTIFY_DAYS = [7, 2, 1, 0];

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  try {
    const auth = getFirebaseAuth();
    if (!auth) return { inAppReminders: true, notifyDays: DEFAULT_NOTIFY_DAYS };
    const currentUser = auth.currentUser;
    if (!currentUser) return { inAppReminders: true, notifyDays: DEFAULT_NOTIFY_DAYS };

    await currentUser.getIdToken(true);
    const db = getFirebaseDb();
    if (!db) return { inAppReminders: true, notifyDays: DEFAULT_NOTIFY_DAYS };

    const docSnap = await getDoc(doc(db, "userPreferences", userId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      const notifyDays = Array.isArray(data.notifyDays) ? data.notifyDays : DEFAULT_NOTIFY_DAYS;
      return {
        inAppReminders: data.inAppReminders !== false,
        notifyDays,
      };
    }
    return { inAppReminders: true, notifyDays: DEFAULT_NOTIFY_DAYS };
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return { inAppReminders: true, notifyDays: DEFAULT_NOTIFY_DAYS };
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

  const notifyDays = prefs.notifyDays || [7, 2, 1, 0];
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
    } else if (notifyDays.includes(daysUntil)) {
      if (daysUntil === 0) {
        type = "due_today";
        title = "Bill Due Today";
        message = `"${bill.companyName}" ($${bill.totalAmount.toFixed(2)}) is due today.`;
      } else if (daysUntil === 1) {
        type = "due_soon";
        title = "Bill Due Tomorrow";
        message = `"${bill.companyName}" ($${bill.totalAmount.toFixed(2)}) is due tomorrow.`;
      } else {
        type = "due_soon";
        title = `Bill Due in ${daysUntil} Days`;
        message = `"${bill.companyName}" ($${bill.totalAmount.toFixed(2)}) is due in ${daysUntil} days.`;
      }
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

  return { updated, skipped, total };
}

// --- Recurring Intelligence Engine ---

export interface RecurringDetection {
  isRecurring: boolean;
  frequency: RecurringFrequency | null;
  confidence: number;
  avgAmount: number;
  deviationPercent: number | null;
  deviationFlag: boolean;
}

export function detectRecurringPatterns(bills: Bill[]): Map<string, RecurringDetection> {
  const results = new Map<string, RecurringDetection>();
  const grouped = new Map<string, Bill[]>();

  for (const bill of bills) {
    const key = (bill.providerId && bill.providerId !== 'unknown')
      ? bill.providerId
      : bill.companyName.toLowerCase().trim();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(bill);
  }

  for (const [, group] of grouped) {
    if (group.length < 2) {
      for (const b of group) {
        if (b.id) results.set(b.id, { isRecurring: false, frequency: null, confidence: 0, avgAmount: b.totalAmount, deviationPercent: null, deviationFlag: false });
      }
      continue;
    }

    const sorted = [...group].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const dayDiff = Math.round((new Date(sorted[i].dueDate).getTime() - new Date(sorted[i - 1].dueDate).getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff > 0) intervals.push(dayDiff);
    }

    let frequency: RecurringFrequency | null = null;
    let matchingIntervals = 0;

    if (intervals.length > 0) {
      const avg = intervals.reduce((s, v) => s + v, 0) / intervals.length;
      if (avg >= 25 && avg <= 35) {
        frequency = 'monthly';
        matchingIntervals = intervals.filter(d => d >= 25 && d <= 35).length;
      } else if (avg >= 80 && avg <= 100) {
        frequency = 'quarterly';
        matchingIntervals = intervals.filter(d => d >= 80 && d <= 100).length;
      } else if (avg >= 350 && avg <= 380) {
        frequency = 'yearly';
        matchingIntervals = intervals.filter(d => d >= 350 && d <= 380).length;
      }
    }

    const confidence = intervals.length > 0 && frequency
      ? (matchingIntervals / intervals.length) * (Math.min(sorted.length, 5) / 5)
      : 0;
    const isRecurring = confidence >= 0.5 && frequency !== null;

    const amounts = sorted.map(b => b.totalAmount);
    const avgAmount = amounts.reduce((s, v) => s + v, 0) / amounts.length;
    const recentAmounts = amounts.slice(-3);
    const recentAvg = recentAmounts.reduce((s, v) => s + v, 0) / recentAmounts.length;

    for (const bill of sorted) {
      const diff = Math.abs(bill.totalAmount - recentAvg);
      const pctDiff = recentAvg > 0 ? ((bill.totalAmount - recentAvg) / recentAvg) * 100 : 0;
      const deviationFlag = isRecurring && (diff > recentAvg * 0.15 || diff > 10);

      if (bill.id) {
        results.set(bill.id, {
          isRecurring,
          frequency,
          confidence: Math.round(confidence * 100) / 100,
          avgAmount: Math.round(recentAvg * 100) / 100,
          deviationPercent: Math.round(pctDiff * 10) / 10,
          deviationFlag: bill === sorted[sorted.length - 1] ? deviationFlag : false,
        });
      }
    }
  }

  return results;
}

export function applyRecurringDetection(bills: Bill[]): Bill[] {
  const detections = detectRecurringPatterns(bills);
  return bills.map(bill => {
    if (!bill.id) return bill;
    const det = detections.get(bill.id);
    if (!det) return bill;

    const isRecurring = bill.recurringConfidence === 1.0 ? true : det.isRecurring;
    const recurringFrequency = bill.recurringConfidence === 1.0 ? (bill.recurringFrequency || det.frequency || undefined) : (det.frequency || undefined);
    const recurringConfidence = bill.recurringConfidence === 1.0 ? 1.0 : det.confidence;

    const amountDeviationFlag = bill.amountDeviationFlag === false ? false : det.deviationFlag;

    return {
      ...bill,
      isRecurring,
      recurringFrequency,
      recurringConfidence,
      avgRecurringAmount: det.avgAmount,
      amountDeviationPercent: det.deviationPercent ?? undefined,
      amountDeviationFlag,
    };
  });
}

export async function persistRecurringFlags(billId: string, detection: RecurringDetection): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;

  const updateData: Record<string, any> = {
    isRecurring: detection.isRecurring,
    recurringConfidence: detection.confidence,
    avgRecurringAmount: detection.avgAmount,
    lastAnalyzedAt: serverTimestamp(),
  };
  if (detection.frequency) updateData.recurringFrequency = detection.frequency;
  if (detection.deviationPercent !== null) updateData.amountDeviationPercent = detection.deviationPercent;
  updateData.amountDeviationFlag = detection.deviationFlag;

  await updateDoc(doc(db, "bills", billId), updateData);
}

export async function confirmRecurring(billId: string, userId: string, frequency: RecurringFrequency): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not available');

  const billRef = doc(db, "bills", billId);
  const billSnap = await getDoc(billRef);
  if (!billSnap.exists()) throw new Error('Bill not found');
  if (billSnap.data().userId !== userId) throw new Error('Unauthorized');

  await updateDoc(billRef, {
    isRecurring: true,
    recurringFrequency: frequency,
    recurringConfidence: 1.0,
    lastAnalyzedAt: serverTimestamp(),
  });
}

export async function dismissAmountAlert(billId: string, userId: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not available');

  const billRef = doc(db, "bills", billId);
  const billSnap = await getDoc(billRef);
  if (!billSnap.exists()) throw new Error('Bill not found');
  if (billSnap.data().userId !== userId) throw new Error('Unauthorized');

  await updateDoc(billRef, {
    amountDeviationFlag: false,
  });
}

export function checkForRecurringProvider(bills: Bill[], companyName: string, providerId?: string): { found: boolean; count: number; frequency: RecurringFrequency | null } {
  const key = providerId && providerId !== 'unknown'
    ? providerId
    : companyName.toLowerCase().trim();

  const matches = bills.filter(b => {
    const bKey = (b.providerId && b.providerId !== 'unknown')
      ? b.providerId
      : b.companyName.toLowerCase().trim();
    return bKey === key;
  });

  if (matches.length === 0) return { found: false, count: 0, frequency: null };

  const sorted = [...matches].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  let frequency: RecurringFrequency | null = 'monthly';

  if (sorted.length >= 2) {
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const d = Math.round((new Date(sorted[i].dueDate).getTime() - new Date(sorted[i - 1].dueDate).getTime()) / (1000 * 60 * 60 * 24));
      if (d > 0) intervals.push(d);
    }
    if (intervals.length > 0) {
      const avg = intervals.reduce((s, v) => s + v, 0) / intervals.length;
      if (avg >= 80 && avg <= 100) frequency = 'quarterly';
      else if (avg >= 350 && avg <= 380) frequency = 'yearly';
    }
  }

  return { found: true, count: matches.length, frequency };
}

export interface FeedbackData {
  category: string;
  message: string;
  userEmail: string;
  userName: string;
  userId: string;
  createdAt: Date;
}

export async function submitFeedback(
  userId: string,
  userEmail: string,
  userName: string,
  category: string,
  message: string,
  page?: string,
  userAgent?: string
): Promise<string> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Database not available');
  if (!category.trim()) throw new Error('Please select a category');
  if (!message.trim()) throw new Error('Please enter a message');
  if (message.trim().length < 10) throw new Error('Message must be at least 10 characters');

  const docRef = await addDoc(collection(db, 'feedback'), {
    userId,
    userEmail,
    userName: userName || 'BillPort User',
    category: category.trim(),
    message: message.trim(),
    status: 'new',
    page: page || '/',
    userAgent: userAgent || '',
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}
