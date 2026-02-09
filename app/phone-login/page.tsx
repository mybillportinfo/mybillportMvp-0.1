'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Loader2, Shield } from "lucide-react";
import { setupRecaptcha, sendPhoneOtp, clearRecaptcha, ConfirmationResult } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function PhoneLogin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<boolean>(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/app');
    }
  }, [user, router]);

  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (!recaptchaRef.current) {
        setupRecaptcha('recaptcha-container');
        recaptchaRef.current = true;
      }
      const result = await sendPhoneOtp(phoneNumber);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send verification code';
      if (message.includes('auth/invalid-phone-number')) {
        setError('Please enter a valid phone number with country code (e.g. +16471234567).');
      } else if (message.includes('auth/too-many-requests')) {
        setError('Too many attempts. Please try again later.');
      } else if (message.includes('Firebase not available')) {
        setError('Unable to connect to authentication service. Please refresh and try again.');
      } else {
        setError('Failed to send verification code. Please try again.');
      }
      recaptchaRef.current = false;
      clearRecaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await confirmationResult.confirm(otp);
      router.push('/app');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      if (message.includes('auth/invalid-verification-code')) {
        setError('Invalid code. Please check and try again.');
      } else if (message.includes('auth/code-expired')) {
        setError('Code expired. Please request a new one.');
        setStep('phone');
        setOtp('');
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/login" className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Login
        </Link>

        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 gradient-navy rounded-xl flex items-center justify-center border border-slate-600">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Phone Sign In</h1>
              <p className="text-slate-400 text-sm">
                {step === 'phone' ? 'Enter your phone number' : 'Enter the verification code'}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+16471234567"
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <p className="text-slate-500 text-xs mt-1">Include country code (e.g. +1 for Canada/US)</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-accent py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Verification Code</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 tracking-widest text-lg"
                    maxLength={6}
                    required
                  />
                </div>
                <p className="text-slate-500 text-xs mt-1">Enter the 6-digit code sent to {phoneNumber}</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otp.length < 6}
                className="w-full btn-accent py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Sign In'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError(null);
                  recaptchaRef.current = false;
                  clearRecaptcha();
                }}
                className="w-full text-slate-400 hover:text-white text-sm py-2 transition-colors"
              >
                Use a different number
              </button>
            </form>
          )}

          <div id="recaptcha-container" />

          <p className="text-center text-slate-400 mt-6 text-sm">
            Prefer email?{' '}
            <Link href="/login" className="text-teal-500 hover:underline">
              Sign in with email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
