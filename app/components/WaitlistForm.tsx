'use client';

import { useState } from 'react';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-[#FFB347] rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-[#1E2A3A]" />
        </div>
        <p className="text-[#FFB347] font-medium">You're on the list — we'll be in touch.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link href="/login" className="bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-bold px-10 py-4 rounded-full transition-colors inline-flex items-center gap-2 text-base shadow-lg shadow-[#4D6A9F]/25">
        Start managing your bills free <ArrowRight className="w-5 h-5" />
      </Link>
      <div>
        <p className="text-xs text-slate-500 mb-3">Or get notified when new features drop</p>
        <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 bg-white/5 border border-white/10 text-white placeholder:text-slate-600 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#4D6A9F]/50"
          />
          <button type="submit" className="bg-white/10 hover:bg-white/15 text-white rounded-full px-5 py-3 text-sm font-medium flex items-center gap-1.5 justify-center transition-colors">
            <Mail className="w-4 h-4" /> Notify me
          </button>
        </form>
      </div>
    </div>
  );
}
