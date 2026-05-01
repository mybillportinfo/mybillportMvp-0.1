'use client';

import Link from 'next/link';
import { Bell, Bot, LayoutDashboard, Plus, ArrowRight, CheckCircle2, Circle } from 'lucide-react';

interface EmptyStateOnboardingProps {
  onAddBill: () => void;
}

export default function EmptyStateOnboarding({ onAddBill }: EmptyStateOnboardingProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 w-full">
      <div className="w-full max-w-lg">

        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 mb-4 text-center shadow-xl">
          <div className="w-16 h-16 bg-[#4D6A9F]/20 border border-[#4D6A9F]/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <LayoutDashboard className="w-8 h-8 text-[#4D6A9F]" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Welcome to MyBillPort 👋</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            You&apos;re one step away from never missing a bill payment again.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-slate-900/60 rounded-xl p-4 text-center border border-slate-700/60">
              <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Bell className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-white text-xs font-semibold mb-1">Smart Reminders</p>
              <p className="text-slate-500 text-[11px] leading-snug">Alerts 7, 3 &amp; 1 day before bills are due</p>
            </div>

            <div className="bg-slate-900/60 rounded-xl p-4 text-center border border-slate-700/60">
              <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-white text-xs font-semibold mb-1">AI Bill Scanning</p>
              <p className="text-slate-500 text-[11px] leading-snug">Upload a photo or PDF — we extract everything</p>
            </div>

            <div className="bg-slate-900/60 rounded-xl p-4 text-center border border-slate-700/60">
              <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <LayoutDashboard className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-white text-xs font-semibold mb-1">All Bills in One Place</p>
              <p className="text-slate-500 text-[11px] leading-snug">Stop juggling 5 different apps and websites</p>
            </div>
          </div>

          <button
            onClick={onAddBill}
            className="w-full flex items-center justify-center gap-2 bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-semibold py-4 px-6 rounded-xl transition-colors text-base shadow-lg shadow-[#4D6A9F]/20 mb-3"
          >
            <Plus className="w-5 h-5" />
            Add Your First Bill
          </button>

          <Link
            href="/scan-bill"
            className="flex items-center justify-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors py-2"
          >
            <Bot className="w-4 h-4" />
            Or scan a bill with AI
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl px-5 py-4">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Getting started</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300 text-sm line-through decoration-slate-600">Create your account</span>
            </div>
            <div className="flex items-center gap-3">
              <Circle className="w-5 h-5 text-slate-600 flex-shrink-0" />
              <button onClick={onAddBill} className="text-white text-sm hover:text-[#4D6A9F] transition-colors text-left">
                Add your first bill
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Circle className="w-5 h-5 text-slate-600 flex-shrink-0" />
              <Link href="/settings" className="text-slate-400 text-sm hover:text-white transition-colors">
                Enable bill reminders
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Circle className="w-5 h-5 text-slate-600 flex-shrink-0" />
              <Link href="/settings" className="text-slate-400 text-sm hover:text-white transition-colors">
                Go premium for unlimited bills
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
