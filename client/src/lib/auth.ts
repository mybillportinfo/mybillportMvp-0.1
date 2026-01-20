import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  UserCredential,
} from "firebase/auth";
import { auth } from "./firebaseClient";

// Declare google global for TypeScript
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
        oauth2: {
          initCodeClient: (config: any) => any;
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}

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
    "auth/browser-storage-blocked": "Your browser is blocking sign-in. Please disable privacy/incognito mode or try a different browser.",
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
    
    // Send branded welcome email via our backend (using MailerSend)
    try {
      const response = await fetch('/api/auth/welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          displayName: result.user.displayName || undefined 
        })
      });
      const emailResult = await response.json();
      if (emailResult.success) {
        console.log("Welcome email sent to:", email);
      } else {
        console.warn("Welcome email failed:", emailResult.error);
      }
    } catch (emailError) {
      console.warn("Failed to send welcome email:", emailError);
    }
    
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

// Google Client ID - loaded from environment variable
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export function signInWithGoogle(): Promise<UserCredential> {
  return new Promise((resolve, reject) => {
    console.log("Attempting Google sign-in with GIS");
    
    if (!window.google) {
      reject(new Error("Google Sign-In not loaded. Please refresh the page."));
      return;
    }

    // Use Google Identity Services token client
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile',
      callback: async (response: any) => {
        if (response.error) {
          console.error("Google OAuth error:", response.error);
          reject(new Error(response.error));
          return;
        }

        try {
          // Get user info from Google using the access token
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` }
          });
          const userInfo = await userInfoResponse.json();
          
          // Create Firebase credential using the access token
          const credential = GoogleAuthProvider.credential(null, response.access_token);
          const result = await signInWithCredential(auth, credential);
          
          console.log("Google sign-in successful:", result.user.uid);
          
          // Check if this is a new user (first sign-in)
          const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
          if (isNewUser && result.user.email) {
            try {
              const emailResponse = await fetch('/api/auth/welcome-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  email: result.user.email, 
                  displayName: result.user.displayName || userInfo.name || undefined 
                })
              });
              const emailResult = await emailResponse.json();
              if (emailResult.success) {
                console.log("Welcome email sent to:", result.user.email);
              }
            } catch (emailError) {
              console.warn("Failed to send welcome email:", emailError);
            }
          }
          
          resolve(result);
        } catch (error: any) {
          console.error("Firebase credential error:", error);
          reject(error);
        }
      },
    });

    // Request the access token - this opens the Google popup
    client.requestAccessToken();
  });
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
