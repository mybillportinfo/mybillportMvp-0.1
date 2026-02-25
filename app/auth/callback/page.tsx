'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithCustomToken } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('No authentication token received');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    async function authenticate() {
      try {
        const { getAuth } = await import('firebase/auth');
        const { initializeApp, getApps, getApp } = await import('firebase/app');

        let app;
        if (getApps().length > 0) {
          app = getApp();
        } else {
          app = initializeApp({
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
          });
        }

        const auth = getAuth(app);
        await signInWithCustomToken(auth, token!);
        router.push('/app');
      } catch (err: any) {
        console.error('Custom token sign-in error:', err);
        setError('Sign-in failed. Please try again.');
        setTimeout(() => router.push('/login'), 2000);
      }
    }

    authenticate();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="text-center">
        {error ? (
          <div className="text-red-400 text-lg">{error}</div>
        ) : (
          <>
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Signing you in...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Signing you in...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
