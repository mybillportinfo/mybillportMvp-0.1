// @ts-ignore
import { db } from "../lib/firebaseConfig";
import { collection, addDoc, getDocs, serverTimestamp, query, where } from "firebase/firestore";

export interface BillData {
  name: string; // Bill name (company)
  accountNumber: string;
  amount: number;
  dueDate: Date;
  frequency: 'monthly' | 'biweekly' | 'weekly';
  leadDays: 1 | 3 | 7;
  paid: boolean;
  createdAt?: any; // Firestore serverTimestamp
  userId: string;
  category?: string;
  priority?: string;
  icon?: string;
}

export interface FirestoreBill extends Omit<BillData, 'createdAt'> {
  id: string;
  createdAt: any;
}

// Add a new bill to Firestore
export async function addBill(billData: Omit<BillData, 'createdAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "bills"), {
      userId: billData.userId,
      name: billData.name,
      accountNumber: billData.accountNumber,
      amount: billData.amount,
      dueDate: billData.dueDate.toISOString(),
      frequency: billData.frequency,
      leadDays: billData.leadDays,
      paid: false,
      createdAt: serverTimestamp()
    });
    console.log('Bill added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding bill to Firestore:', error);
    throw error;
  }
}

// Get all bills from Firestore
export async function getBills(userId?: string): Promise<FirestoreBill[]> {
  let billsQuery;
  
  if (userId) {
    // Query bills for specific user
    billsQuery = query(collection(db, "bills"), where("userId", "==", userId));
  } else {
    // Get all bills (for admin or testing)
    billsQuery = collection(db, "bills");
  }
  
  const querySnapshot = await getDocs(billsQuery);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
      paid: data.paid || false,
      leadDays: data.leadDays || 3,
      frequency: data.frequency || 'monthly'
    } as FirestoreBill;
  });
}