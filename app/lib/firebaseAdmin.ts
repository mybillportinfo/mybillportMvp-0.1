// Server-side Firestore access using the Firebase client SDK
// This works without admin credentials - uses the same Firebase config
// Firestore security rules ensure data isolation per user

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  Timestamp,
  runTransaction,
} from "firebase/firestore";

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

function getServerDb() {
  const config = getFirebaseConfig();
  let app;
  if (getApps().length > 0) {
    app = getApp();
  } else {
    app = initializeApp(config);
  }
  return getFirestore(app);
}

// Validate that a bill exists and belongs to the specified user
// Used by create-payment-intent to validate before creating PaymentIntent
export async function validateBillOwnership(billId: string, userId: string): Promise<{
  valid: boolean;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
}> {
  try {
    const db = getServerDb();
    const billDoc = await getDoc(doc(db, 'bills', billId));

    if (!billDoc.exists()) {
      return { valid: false };
    }

    const data = billDoc.data();
    if (data.userId !== userId) {
      return { valid: false };
    }

    // Backward compatibility: support old field names
    const totalAmount = data.totalAmount || data.amount || 0;
    const paidAmount = data.paidAmount ?? data.amountPaid ?? 0;
    const remainingAmount = Math.round((totalAmount - paidAmount) * 100) / 100;

    return {
      valid: true,
      totalAmount,
      paidAmount,
      remainingAmount: Math.max(0, remainingAmount),
    };
  } catch (error: any) {
    console.error('validateBillOwnership error:', error);
    throw error;
  }
}

// Update bill payment status after Stripe webhook confirms payment
// This is the SOURCE OF TRUTH for payment state changes
// Uses Firestore transaction to prevent race conditions on concurrent payments
export async function updateBillPayment(billId: string, paymentAmount: number): Promise<void> {
  const db = getServerDb();
  const billRef = doc(db, 'bills', billId);

  await runTransaction(db, async (transaction) => {
    const billDoc = await transaction.get(billRef);
    if (!billDoc.exists()) {
      throw new Error(`Bill ${billId} not found`);
    }

    const data = billDoc.data();
    const totalAmount = data.totalAmount || data.amount || 0;
    const currentPaidAmount = data.paidAmount ?? data.amountPaid ?? 0;

    // Increment paid amount (capped at totalAmount)
    const newPaidAmount = Math.min(
      Math.round((currentPaidAmount + paymentAmount) * 100) / 100,
      totalAmount
    );

    // Determine new status based on payment amounts
    let newStatus: string;
    if (newPaidAmount >= totalAmount) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partial';
    } else {
      newStatus = 'unpaid';
    }

    transaction.update(billRef, {
      paidAmount: newPaidAmount,
      status: newStatus,
    });
  });
}

// Record payment in the payments collection for audit trail
export async function recordPayment(
  userId: string,
  billId: string,
  amount: number,
  paymentType: string,
  stripePaymentIntentId: string
): Promise<string> {
  const db = getServerDb();
  const docRef = await addDoc(collection(db, 'payments'), {
    userId,
    billId,
    amountPaid: amount,
    paymentType,
    stripePaymentIntentId,
    timestamp: Timestamp.now(),
  });
  return docRef.id;
}
