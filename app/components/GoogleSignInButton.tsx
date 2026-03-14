'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const CLIENT_ID = '484703321344-nmen1eghd7oli53p5kckulcvtdv2skaf.apps.googleusercontent.com';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (element: HTMLElement, config: object) => void;
          prompt: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  disabled?: boolean;
}

export default function GoogleSignInButton({ disabled }: GoogleSignInButtonProps) {
  const { loginWithGoogleToken, loading } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [gisReady, setGisReady] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const initGIS = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async (response: { credential: string }) => {
          setSigningIn(true);
          try {
            await loginWithGoogleToken(response.credential);
          } finally {
            setSigningIn(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      setGisReady(true);
    };

    if (window.google?.accounts?.id) {
      initGIS();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGIS();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [loginWithGoogleToken]);

  useEffect(() => {
    if (gisReady && buttonRef.current) {
      window.google?.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: buttonRef.current.offsetWidth || 400,
        text: 'continue_with',
        shape: 'rectangular',
      });
    }
  }, [gisReady]);

  const handleClick = () => {
    if (loading || disabled || signingIn) return;
    window.google?.accounts.id.prompt();
  };

  const isDisabled = loading || disabled || signingIn;

  if (gisReady) {
    return (
      <div
        className={`w-full rounded-lg overflow-hidden ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
        ref={buttonRef}
        style={{ minHeight: '44px' }}
      />
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      type="button"
    >
      {signingIn ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      )}
      <span>{signingIn ? 'Signing in...' : 'Continue with Google'}</span>
    </button>
  );
}
