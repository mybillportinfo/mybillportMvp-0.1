'use client';

import { useEffect, useRef, useCallback } from 'react';
import { loadGoogleGIS, signInWithGoogleCredential } from '../lib/firebase';
import { getAdditionalUserInfo } from 'firebase/auth';
import { trackUserLogin, trackUserSignup } from '../lib/analyticsService';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    handleGoogleCredential?: (response: any) => void;
  }
}

export default function GoogleSignInButton({ onSuccess, onError, disabled }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const handleCredential = useCallback(async (response: any) => {
    if (!response?.credential) {
      onError?.('No credential received from Google');
      return;
    }
    try {
      const result = await signInWithGoogleCredential(response.credential);
      const additionalInfo = getAdditionalUserInfo(result);
      const isNewUser = additionalInfo?.isNewUser ?? false;
      if (isNewUser) {
        try {
          await fetch('/api/send-welcome-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: result.user.email, displayName: result.user.displayName || undefined }),
          });
        } catch {}
        trackUserSignup('google');
      } else {
        trackUserLogin('google');
      }
      onSuccess?.();
    } catch (err: any) {
      console.error('Firebase credential sign-in error:', err);
      onError?.(err?.message || 'Google sign-in failed');
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !buttonRef.current) return;

    loadGoogleGIS().then(() => {
      const google = (window as any).google;
      if (!google?.accounts?.id || !buttonRef.current) return;

      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: buttonRef.current.offsetWidth || 400,
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });
    }).catch((err) => {
      console.error('Failed to load Google sign-in:', err);
    });
  }, [handleCredential]);

  return (
    <div className="w-full">
      <div
        ref={buttonRef}
        className={`w-full flex items-center justify-center ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        style={{ minHeight: '44px' }}
      />
    </div>
  );
}
