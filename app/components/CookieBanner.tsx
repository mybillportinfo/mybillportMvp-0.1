'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Cookie } from 'lucide-react';

const STORAGE_KEY = 'mbp_cookie_consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setTimeout(() => setVisible(true), 800);
      }
    } catch {
      // localStorage unavailable (private mode, etc.)
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {}
    setVisible(false);
  }

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, 'dismissed');
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
      style={{ animation: 'slideUp 0.3s ease-out' }}
    >
      <div className="max-w-2xl mx-auto bg-slate-800 border border-slate-600/60 rounded-2xl shadow-2xl shadow-black/40 p-4 flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#4D6A9F]/20 flex items-center justify-center mt-0.5">
          <Cookie className="w-4 h-4 text-[#4D6A9F]" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium mb-1">We use cookies</p>
          <p className="text-slate-400 text-xs leading-relaxed">
            We use essential cookies to keep you signed in and remember your preferences. No advertising or tracking cookies.{' '}
            <Link href="/privacy" className="text-[#4D6A9F] hover:underline">
              Privacy Policy
            </Link>
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={accept}
              className="px-4 py-1.5 bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Accept
            </button>
            <button
              onClick={dismiss}
              className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={dismiss}
          aria-label="Close cookie banner"
          className="flex-shrink-0 text-slate-500 hover:text-white transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
