'use client';

import { useState } from 'react';
import { signInWithGoogle, signInWithGoogleCredential, loadGoogleGIS } from '../lib/firebase';
import { getAdditionalUserInfo } from 'firebase/auth';
import { trackUserLogin, trackUserSignup } from '../lib/analyticsService';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export default function GoogleSignInButton({ onSuccess, onError, disabled }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  const sendWelcomeEmail = async (email: string | null, displayName: string | null) => {
    if (!email) return;
    try {
      await fetch('/api/send-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, displayName: displayName || undefined }),
      });
    } catch {}
  };

  const handleResult = async (result: any) => {
    const additionalInfo = getAdditionalUserInfo(result);
    if (additionalInfo?.isNewUser) {
      await sendWelcomeEmail(result.user.email, result.user.displayName);
      trackUserSignup('google');
    } else {
      trackUserLogin('google');
    }
    onSuccess?.();
  };

  const tryGISFallback = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        reject(new Error('Google Client ID not configured'));
        return;
      }

      loadGoogleGIS().then(() => {
        const google = (window as any).google;
        if (!google?.accounts?.id) {
          reject(new Error('Google sign-in not available'));
          return;
        }

        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (!response?.credential) {
              reject(new Error('No credential received'));
              return;
            }
            try {
              const result = await signInWithGoogleCredential(response.credential);
              await handleResult(result);
              resolve();
            } catch (err: any) {
              reject(err);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: false,
        });

        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error('Google sign-in was not available. Please try again or use email sign-in.'));
          }
        });
      }).catch(reject);
    });
  };

  const handleClick = async () => {
    if (loading || disabled) return;
    setLoading(true);

    try {
      const result = await signInWithGoogle();
      if (result) {
        await handleResult(result);
      }
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || '';

      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setLoading(false);
        return;
      }

      if (code === 'auth/popup-blocked') {
        try {
          await tryGISFallback();
        } catch (gisErr: any) {
          onError?.(gisErr?.message || 'Google sign-in failed. Please try email sign-in.');
        }
        setLoading(false);
        return;
      }

      if (code === 'auth/invalid-credential' || code === 'auth/internal-error' || code === 'auth/unauthorized-domain') {
        try {
          await tryGISFallback();
        } catch (gisErr: any) {
          onError?.('Google sign-in is not available on this domain. Please use email sign-in.');
        }
        setLoading(false);
        return;
      }

      onError?.(msg || 'Google sign-in failed');
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || disabled}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      type="button"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      )}
      <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
    </button>
  );
}
