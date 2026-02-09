'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Lock, Loader2, Check, X, Phone } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { user, signup, loginWithGoogle, error, clearError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/app');
    }
  }, [user, router]);

  const passwordChecks = {
    length: password.length >= 6,
    match: password === confirmPassword && password.length > 0,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      await signup(email, password);
      router.push('/app');
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setLocalError(null);
    clearError();
    try {
      await loginWithGoogle();
      router.push('/app');
    } catch {
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const displayError = localError || error;
  const isLoading = isSubmitting || isGoogleLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 gradient-navy rounded-xl flex items-center justify-center border border-slate-600">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create Account</h1>
              <p className="text-slate-400 text-sm">Start managing your bills</p>
            </div>
          </div>

          {displayError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {displayError}
            </div>
          )}

          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-50 text-gray-800 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            <button
              disabled
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-700/50 text-slate-500 rounded-lg font-medium cursor-not-allowed border border-slate-600/50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
              <span className="text-xs bg-slate-600/50 px-2 py-0.5 rounded-full ml-auto">Coming Soon</span>
            </button>

            <Link
              href="/phone-login"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors border border-slate-600/50"
            >
              <Phone className="w-5 h-5" />
              Continue with Phone Number
            </Link>
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

            {password && (
              <div className="bg-slate-700/30 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {passwordChecks.length ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-slate-500" />
                  )}
                  <span className={passwordChecks.length ? 'text-green-400' : 'text-slate-400'}>
                    At least 6 characters
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {passwordChecks.match ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-slate-500" />
                  )}
                  <span className={passwordChecks.match ? 'text-green-400' : 'text-slate-400'}>
                    Passwords match
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-accent py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
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
        </div>
      </div>
    </div>
  );
}
