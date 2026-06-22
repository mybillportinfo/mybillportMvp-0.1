'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { Loader2, CheckCircle, XCircle, Lock } from 'lucide-react';
import Link from 'next/link';

function AuthActionInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');
  const continueUrl = searchParams.get('continueUrl') || '/dashboard';

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'reset-form'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!oobCode || !mode) {
      setErrorMsg('Invalid or missing link parameters.');
      setStatus('error');
      return;
    }

    async function handle() {
      try {
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();

        if (mode === 'verifyEmail') {
          await applyActionCode(auth, oobCode!);
          await auth.currentUser?.reload();
          setStatus('success');
          setTimeout(() => router.push(continueUrl), 2500);

        } else if (mode === 'resetPassword') {
          await verifyPasswordResetCode(auth, oobCode!);
          setStatus('reset-form');

        } else if (mode === 'recoverEmail') {
          await applyActionCode(auth, oobCode!);
          setStatus('success');
          setTimeout(() => router.push('/login'), 2500);

        } else {
          setErrorMsg(`Unknown action mode: ${mode}`);
          setStatus('error');
        }
      } catch (err: any) {
        const msg: Record<string, string> = {
          'auth/expired-action-code': 'This link has expired. Please request a new one.',
          'auth/invalid-action-code': 'This link is invalid or has already been used.',
          'auth/user-disabled': 'This account has been disabled.',
          'auth/user-not-found': 'No account found for this link.',
        };
        setErrorMsg(msg[err?.code] || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    }

    handle();
  }, [mode, oobCode, continueUrl, router]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setResetting(true);
    setErrorMsg('');
    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      await confirmPasswordReset(auth, oobCode!, newPassword);
      setStatus('success');
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      setErrorMsg(err?.code === 'auth/weak-password' ? 'Password is too weak. Use at least 6 characters.' : 'Failed to reset password. The link may have expired.');
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">

        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-[#4D6A9F] animate-spin mx-auto mb-4" />
            <p className="text-white text-lg font-semibold">Just a moment…</p>
            <p className="text-slate-400 text-sm mt-2">Processing your request</p>
          </>
        )}

        {status === 'success' && mode === 'verifyEmail' && (
          <>
            <CheckCircle className="w-14 h-14 text-[#6BCB77] mx-auto mb-4" />
            <p className="text-white text-xl font-bold">Email verified!</p>
            <p className="text-slate-400 text-sm mt-2">Taking you to your dashboard…</p>
          </>
        )}

        {status === 'success' && mode === 'resetPassword' && (
          <>
            <CheckCircle className="w-14 h-14 text-[#6BCB77] mx-auto mb-4" />
            <p className="text-white text-xl font-bold">Password updated!</p>
            <p className="text-slate-400 text-sm mt-2">Taking you to sign in…</p>
          </>
        )}

        {status === 'success' && mode === 'recoverEmail' && (
          <>
            <CheckCircle className="w-14 h-14 text-[#6BCB77] mx-auto mb-4" />
            <p className="text-white text-xl font-bold">Email recovered!</p>
            <p className="text-slate-400 text-sm mt-2">Taking you to sign in…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <p className="text-white text-xl font-bold">Link problem</p>
            <p className="text-slate-400 text-sm mt-2 mb-6">{errorMsg}</p>
            <Link href="/login" className="inline-block bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
              Back to sign in
            </Link>
          </>
        )}

        {status === 'reset-form' && (
          <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#4D6A9F] rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Choose a new password</h1>
                <p className="text-slate-400 text-xs">At least 6 characters</p>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4D6A9F] transition-colors"
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-1.5">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4D6A9F] transition-colors"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={resetting}
                className="w-full bg-[#4D6A9F] hover:bg-[#3d5a8f] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {resetting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Set new password'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AuthAction() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#4D6A9F] animate-spin" />
        </div>
      }
    >
      <AuthActionInner />
    </Suspense>
  );
}
