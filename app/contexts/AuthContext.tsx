'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  subscribeToAuth,
  loginUser,
  registerUser,
  logoutUser,
  signInWithGoogle,
  isMfaError,
} from '../lib/firebase';
import { getAdditionalUserInfo } from 'firebase/auth';
import { trackUserLogin, trackUserSignup } from '../lib/analyticsService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      await loginUser(email, password);
      trackUserLogin('email');
    } catch (err: unknown) {
      if (isMfaError(err)) {
        setError('Your account has multi-factor authentication enabled, which is no longer supported. Please contact support at hello@mybillport.com to reset your account security settings.');
        setLoading(false);
        return;
      }
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(getAuthErrorMessage(message));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const newUser = await registerUser(email, password);
      trackUserSignup('email');
      try {
        await fetch('/api/send-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, displayName: newUser.displayName || undefined }),
        });
      } catch {}
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(getAuthErrorMessage(message));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogleFn = async () => {
    setError(null);
    setLoading(true);
    try {
      const credential = await signInWithGoogle();
      const additionalInfo = getAdditionalUserInfo(credential);
      const isNewUser = additionalInfo?.isNewUser ?? false;
      const googleUser = credential.user;
      if (isNewUser) {
        try {
          await fetch('/api/send-welcome-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: googleUser.email, displayName: googleUser.displayName || undefined }),
          });
        } catch {}
        trackUserSignup('google');
      } else {
        trackUserLogin('google');
      }
    } catch (err: unknown) {
      if (isMfaError(err)) {
        setError('Your account has multi-factor authentication enabled, which is no longer supported. Please contact support at hello@mybillport.com to reset your account security settings.');
        setLoading(false);
        return;
      }
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(getAuthErrorMessage(message));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await logoutUser();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      user, loading, error, login, signup,
      loginWithGoogle: loginWithGoogleFn,
      logout, clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function getAuthErrorMessage(errorMessage: string): string {
  if (errorMessage.includes('auth/email-already-in-use')) {
    return 'This email is already registered. Please sign in instead.';
  }
  if (errorMessage.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (errorMessage.includes('auth/weak-password')) {
    return 'Password must be at least 6 characters.';
  }
  if (errorMessage.includes('auth/user-not-found') || errorMessage.includes('auth/wrong-password') || errorMessage.includes('auth/invalid-credential')) {
    return 'Invalid email or password.';
  }
  if (errorMessage.includes('auth/too-many-requests')) {
    return 'Too many attempts. Please try again later.';
  }
  if (errorMessage.includes('auth/popup-closed-by-user')) {
    return 'Sign-in was cancelled. Please try again.';
  }
  if (errorMessage.includes('auth/popup-blocked')) {
    return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
  }
  if (errorMessage.includes('auth/cancelled-popup-request')) {
    return 'Sign-in was cancelled. Please try again.';
  }
  if (errorMessage.includes('auth/account-exists-with-different-credential')) {
    return 'An account already exists with a different sign-in method. Try signing in with your email instead.';
  }
  if (errorMessage.includes('auth/requires-recent-login')) {
    return 'For security, please sign out and sign back in before making this change.';
  }
  if (errorMessage.includes('Firebase not available')) {
    return 'Unable to connect to authentication service. Please refresh and try again.';
  }
  return errorMessage;
}
