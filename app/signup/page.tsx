'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState, useEffect, useCallback } from 'react';
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Mail, Lock, Loader2, Check, X, Receipt, DollarSign, ShieldCheck, Gift } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { RecaptchaCheckbox } from '../components/RecaptchaCheckbox';

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [captchaLoaded, setCaptchaLoaded] = useState(false);

  const { user, signup, error, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setReferralCode(ref.toUpperCase());
  }, [searchParams]);

  useEffect(() => {
    if (user) router.push('/app');
  }, [user, router]);

  const passwordChecks = {
    length: password.length >= 6,
    match: password === confirmPassword && password.length > 0,
  };

  const handleVerify = useCallback((token: string) => {
    setRecaptchaToken(token);
    setCaptchaLoaded(true);
    setLocalError(null);
  }, []);

  const handleExpire = useCallback(() => setRecaptchaToken(null), []);
  const handleCaptchaReady = useCallback(() => setCaptchaLoaded(true), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) { setLocalError('Please fill in all fields'); return; }
    if (password !== confirmPassword) { setLocalError('Passwords do not match'); return; }
    if (password.length < 6) { setLocalError('Password must be at least 6 characters'); return; }
    if (captchaLoaded && !recaptchaToken) {
      setLocalError('Please tick the "I\'m not a robot" box first.');
      return;
    }

    setIsSubmitting(true);
    clearError();
    try {
      if (recaptchaToken) {
        const res = await fetch('/api/recaptcha/v2/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: recaptchaToken }),
        });
        const result = await res.json();
        if (!result.success && !result.skipped) {
          setLocalError('Verification failed. Please tick the checkbox again.');
          setRecaptchaToken(null);
          setIsSubmitting(false);
          return;
        }
      }
      await signup(email, password, referralCode.trim() || undefined);
      router.push('/app');
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;
  const buttonDisabled = isSubmitting || (captchaLoaded && !recaptchaToken);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.4)]">
              <div className="relative">
                <Receipt className="text-white w-7 h-7" />
                <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-teal-500/30">
                  <DollarSign className="text-teal-400 w-4 h-4" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
              <p className="text-slate-400 text-sm">Join My<span className="text-teal-500">BillPort</span> today</p>
            </div>
          </div>

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
              <span className="bg-slate-800/50 px-4 text-slate-500">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Referral Code <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCD1234"
                  maxLength={12}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase tracking-widest"
                />
              </div>
              {referralCode && (
                <p className="text-xs text-teal-400 mt-1">Your friend will get credit when you complete your 2nd month.</p>
              )}
            </div>

            {password && (
              <div className="bg-slate-700/30 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {passwordChecks.length ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-slate-500" />}
                  <span className={passwordChecks.length ? 'text-green-400' : 'text-slate-400'}>At least 6 characters</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {passwordChecks.match ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-slate-500" />}
                  <span className={passwordChecks.match ? 'text-green-400' : 'text-slate-400'}>Passwords match</span>
                </div>
              </div>
            )}

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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-500 hover:underline">
              Sign in
            </Link>
          </p>

          <div className="mt-5 pt-5 border-t border-slate-700/60 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
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

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
