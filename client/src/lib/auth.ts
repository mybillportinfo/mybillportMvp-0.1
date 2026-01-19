import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  UserCredential,
} from "firebase/auth";
import { auth } from "./firebaseClient";

export function getFirebaseErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password is too weak. Please choose a stronger password.",
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password. Please check your credentials.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
    "auth/popup-closed-by-user": "Sign-in cancelled. Please try again.",
    "auth/popup-blocked": "Pop-up was blocked. Please allow pop-ups for this site and try again.",
    "auth/cancelled-popup-request": "Sign-in cancelled. Please try again.",
    "auth/account-exists-with-different-credential": "An account already exists with this email using a different sign-in method.",
    "auth/network-request-failed": "Network error. Please check your internet connection.",
    "auth/operation-not-allowed": "This sign-in method is not enabled. Please contact support.",
    "auth/unauthorized-domain": "This domain is not authorized for sign-in. Please contact support.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/firebase-app-check-token-is-invalid": "Authentication service configuration error. Please try again later or contact support.",
  };
  return errorMessages[errorCode] || `Authentication error: ${errorCode}`;
}

export async function registerUser(email: string, password: string): Promise<UserCredential> {
  try {
    console.log("Attempting to register user:", email);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Registration successful:", result.user.uid);
    return result;
  } catch (error: any) {
    console.error("Registration error:", error.code, error.message);
    throw error;
  }
}

export async function loginUser(email: string, password: string): Promise<UserCredential> {
  try {
    console.log("Attempting to login user:", email);
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login successful:", result.user.uid);
    return result;
  } catch (error: any) {
    console.error("Login error:", error.code, error.message);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  return signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    console.log("Attempting Google sign-in");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    const result = await signInWithPopup(auth, provider);
    console.log("Google sign-in successful:", result.user.uid);
    return result;
  } catch (error: any) {
    console.error("Google sign-in error:", error.code, error.message);
    throw error;
  }
}

export async function signInWithApple(): Promise<UserCredential> {
  try {
    console.log("Attempting Apple sign-in");
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    const result = await signInWithPopup(auth, provider);
    console.log("Apple sign-in successful:", result.user.uid);
    return result;
  } catch (error: any) {
    console.error("Apple sign-in error:", error.code, error.message);
    throw error;
  }
}
