declare module '../lib/firebaseConfig.js' {
  import { Auth } from 'firebase/auth';
  import { Firestore } from 'firebase/firestore';
  export const auth: Auth;
  export const db: Firestore;
  export const googleProvider: any;
}

declare module '../services/auth.js' {
  export function registerUser(email: string, password: string): Promise<any>;
  export function loginUser(email: string, password: string): Promise<any>;
  export function logoutUser(): Promise<void>;
}