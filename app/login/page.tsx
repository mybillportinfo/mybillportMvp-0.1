'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Lock, Loader2, Receipt, DollarSign, ShieldCheck, AlertTriangle } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { RecaptchaCheckbox } from '../components/RecaptchaCheckbox';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [captchaLoaded, setCaptchaLoaded] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  const lockoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { user, login, error, clearError } = useAuth();
  const router = useRouter();

  const [unverifiedBanner, setUnverifiedBanner] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('unverified') === '1') {
      setUnverifiedBanner(true);
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  useEffect(() => {
    const urlError = new URLSearchParams(window.location.search).get('error');
    if (urlError) {
      const errorMap: Record<string, string> = {
        google_init_failed: 'Could not start Google sign-in. Please try again.',
        no_code: 'Google sign-in was cancelled.',
        no_id_token: 'Google sign-in failed. Please try again.',
        invalid_token: 'Google sign-in failed. Please try again.',
        auth_failed: 'Google sign-in failed. Please try again or use email.',
        access_denied: 'Google sign-in was cancelled.',
      };
      setGoogleError(errorMap[urlError] || `Google sign-in error: ${decodeURIComponent(urlError)}`);
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockedUntil) {
      const tick = () => {
        const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
        setLockoutRemaining(remaining);
        if (remaining === 0) {
          setLockedUntil(null);
          setFailedAttempts(0);
          if (lockoutTimerRef.current) clearInterval(lockoutTimerRef.current);
        }
      };
      tick();
      lockoutTimerRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (lockoutTimerRef.current) clearInterval(lockoutTimerRef.current);
    };
  }, [lockedUntil]);

  const handleVerify = useCallback((token: string) => {
    setRecaptchaToken(token);
    setCaptchaLoaded(true);
    setGoogleError(null);
  }, []);

  const handleExpire = useCallback(() => setRecaptchaToken(null), []);
  const handleCaptchaReady = useCallback(() => setCaptchaLoaded(true), []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (lockedUntil && Date.now() < lockedUntil) {
      setGoogleError(`Too many failed attempts. Please wait ${lockoutRemaining} seconds before trying again.`);
      return;
    }

    if (captchaLoaded && !recaptchaToken) {
      setGoogleError('Please tick the "I\'m not a robot" box first.');
      return;
    }

    setIsSubmitting(true);
    clearError();
    setGoogleError(null);
    try {
      if (recaptchaToken) {
        const res = await fetch('/api/recaptcha/v2/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: recaptchaToken }),
        });
        const result = await res.json();
        if (!result.success && !result.skipped) {
          setGoogleError('Verification failed. Please tick the checkbox again.');
          setRecaptchaToken(null);
          setIsSubmitting(false);
          return;
        }
      }
      await login(email, password);
      setFailedAttempts(0);
      router.push('/dashboard');
    } catch {
      const newCount = failedAttempts + 1;
      setFailedAttempts(newCount);
      if (newCount >= MAX_FAILED_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION_MS;
        setLockedUntil(until);
        setGoogleError(`Account temporarily locked after ${MAX_FAILED_ATTEMPTS} failed attempts. Please wait 15 minutes or reset your password.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLockedOut = lockedUntil !== null && Date.now() < lockedUntil;
  const displayError = googleError || error;
  const buttonDisabled = isSubmitting || (captchaLoaded && !recaptchaToken) || isLockedOut;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#4D6A9F] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(77,106,159,0.4)]">
              <div className="relative">
                <Receipt className="text-white w-7 h-7" />
                <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-[#4D6A9F]/30">
                  <DollarSign className="text-[#4D6A9F] w-4 h-4" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
              <p className="text-slate-400 text-sm">Sign in to My<span className="text-[#4D6A9F]">BillPort</span></p>
            </div>
          </div>

          {unverifiedBanner && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-3 rounded-lg mb-4 text-sm">
              <p className="font-semibold">Please verify your email first</p>
              <p className="text-amber-400/80 text-xs mt-1">Check your inbox for the verification link we sent when you signed up. Sign in below once you've verified.</p>
            </div>
          )}

          {displayError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {displayError}
            </div>
          )}

          <div className="mb-6">
            <GoogleSignInButton disabled={isSubmitting} />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-800/50 px-4 text-slate-500">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4D6A9F]"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-sm text-[#4D6A9F] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4D6A9F]"
                  required
                />
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-3 min-h-[78px] flex items-center justify-center">
              <RecaptchaCheckbox
                onVerify={handleVerify}
                onExpire={handleExpire}
                onReady={handleCaptchaReady}
              />
            </div>

            <button
              type="submit"
              disabled={buttonDisabled}
              className="w-full btn-accent py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#4D6A9F] hover:underline">
              Sign up
            </Link>
          </p>

          <div className="mt-5 pt-5 border-t border-slate-700/60 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4D6A9F] flex-shrink-0" />
            <span>
              Protected by reCAPTCHA &mdash;{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400">Privacy</a>
              {' '}&amp;{' '}
              <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400">Terms</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
