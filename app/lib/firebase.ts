'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
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
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
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
  billType: string;
  amount: number;
  dueDate: Date;
  createdAt: Date;
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

let _recaptchaVerifier: RecaptchaVerifier | null = null;

export function setupRecaptcha(elementId: string) {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase not available');
  if (_recaptchaVerifier) {
    _recaptchaVerifier.clear();
    _recaptchaVerifier = null;
  }
  _recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
    size: 'invisible',
  });
  return _recaptchaVerifier;
}

export function sendPhoneOtp(phoneNumber: string): Promise<ConfirmationResult> {
  const auth = getFirebaseAuth();
  if (!auth) return Promise.reject(new Error('Firebase not available'));
  if (!_recaptchaVerifier) return Promise.reject(new Error('reCAPTCHA not initialized'));
  return signInWithPhoneNumber(auth, phoneNumber, _recaptchaVerifier);
}

export function clearRecaptcha() {
  if (_recaptchaVerifier) {
    _recaptchaVerifier.clear();
    _recaptchaVerifier = null;
  }
}

export type { User, ConfirmationResult };
