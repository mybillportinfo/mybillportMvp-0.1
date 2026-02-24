'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Lock, Loader2, Receipt, DollarSign } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const { user, login, error, clearError } = useAuth();
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const urlError = searchParams?.get('error');

  useEffect(() => {
    if (urlError) {
      const errorMap: Record<string, string> = {
        google_init_failed: 'Could not start Google sign-in. Please try again.',
        no_code: 'Google sign-in was cancelled.',
        no_id_token: 'Google sign-in failed. Please try again.',
        invalid_token: 'Google sign-in failed. Please try again.',
        auth_failed: 'Google sign-in failed. Please try again or use email.',
      };
      setGoogleError(errorMap[urlError] || 'Google sign-in failed. Please try again.');
      window.history.replaceState({}, '', '/login');
    }
  }, [urlError]);

  useEffect(() => {
    if (user) {
      router.push('/app');
    }
  }, [user, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    clearError();
    try {
      await login(email, password);
      router.push('/app');
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = googleError || error;

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
              <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
              <p className="text-slate-400 text-sm">Sign in to My<span className="text-teal-500">BillPort</span></p>
            </div>
          </div>

          {displayError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {displayError}
            </div>
          )}

          <div className="space-y-3 mb-6">
            <GoogleSignInButton
              onSuccess={() => router.push('/app')}
              onError={(err) => setGoogleError(err)}
              disabled={isSubmitting}
            />
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-sm text-teal-500 hover:underline">
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-accent py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
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
            <Link href="/signup" className="text-teal-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
