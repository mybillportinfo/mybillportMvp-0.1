'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, ArrowRight, TrendingUp, Calendar, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { markBillAsPaid } from '../lib/firebase';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const billId = searchParams.get('billId') || '';
  const biller = searchParams.get('biller') || '';
  const amount = searchParams.get('amount') || '';
  const source = searchParams.get('source') || '';

  const { user } = useAuth();
  const { bills } = useData();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    // If source=redirect the bill was already marked in payment/page.tsx
    if (source === 'redirect') {
      setStatus('success');
      setConfetti(true);
      return;
    }
    if (!billId || !user) {
      setStatus('success');
      setConfetti(true);
      return;
    }
    const bill = bills.find(b => b.id === billId);
    if (bill?.status === 'paid') {
      setStatus('success');
      setConfetti(true);
      return;
    }
    if (bills.length === 0) return;

    const payAmount = bill?.totalAmount ?? parseFloat(amount) ?? 0;
    markBillAsPaid(billId, user.uid, payAmount, 'online', 'Card payment via Stripe')
      .then(() => { setStatus('success'); setConfetti(true); })
      .catch(() => setStatus('error'));
  }, [billId, user, bills, amount, source]);

  // Next unpaid bill (habit loop)
  const nextBill = bills
    .filter(b => b.id !== billId && b.status !== 'paid' && b.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const nextDaysLeft = nextBill
    ? Math.ceil((new Date(nextBill.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const totalUnpaid = bills.filter(b => b.id !== billId && b.status !== 'paid').length;

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
          <p className="text-slate-700 font-semibold text-lg">Recording your payment…</p>
          <p className="text-slate-400 text-sm mt-2">This only takes a second</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Success card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Celebration header */}
          <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-10 text-center overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="w-18 h-18 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 w-[72px] h-[72px]">
                <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
              {biller && (
                <p className="text-emerald-100 mt-1.5 text-base font-medium">
                  {biller}{amount ? ` · $${parseFloat(amount).toFixed(2)} CAD` : ''}
                </p>
              )}
            </div>
          </div>

          <div className="p-6 space-y-4">

            {/* Status message */}
            {status === 'success' ? (
              <div className="space-y-3">
                {/* Motivational stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <p className="text-emerald-800 font-bold text-sm">Late fee avoided</p>
                    <p className="text-emerald-500 text-xs mt-0.5">You paid on time</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                    <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-blue-800 font-bold text-sm">You're on track</p>
                    <p className="text-blue-500 text-xs mt-0.5">
                      {totalUnpaid === 0 ? 'All caught up!' : `${totalUnpaid} bill${totalUnpaid !== 1 ? 's' : ''} remaining`}
                    </p>
                  </div>
                </div>

                {/* Bill marked confirmation */}
                {billId && (
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                    <Sparkles className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <p className="text-slate-600 text-sm">
                      Bill automatically marked as <span className="font-semibold text-emerald-600">Paid</span> in your account
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                Payment was processed but we couldn&apos;t update your bill automatically. Please mark it as paid from the dashboard.
              </div>
            )}

            {/* Habit loop — next bill */}
            {totalUnpaid === 0 ? (
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-100 rounded-xl p-4 text-center">
                <p className="text-2xl mb-1">🎉</p>
                <p className="text-slate-700 font-bold">You're all caught up!</p>
                <p className="text-slate-500 text-sm mt-0.5">No more bills due. Great job staying on top of things.</p>
              </div>
            ) : nextBill && nextDaysLeft !== null ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Next Bill Due</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-800 font-bold">{nextBill.companyName}</p>
                    <p className={`text-sm font-medium mt-0.5 ${
                      nextDaysLeft <= 0 ? 'text-red-500' :
                      nextDaysLeft <= 3 ? 'text-orange-500' : 'text-slate-400'
                    }`}>
                      {nextDaysLeft <= 0 ? 'Due today!' :
                       nextDaysLeft === 1 ? 'Due tomorrow' :
                       `Due in ${nextDaysLeft} days`}
                    </p>
                  </div>
                  <p className="text-slate-700 font-bold text-lg">${nextBill.totalAmount?.toFixed(2)}</p>
                </div>
              </div>
            ) : null}

            {/* CTA */}
            <Link
              href="/app"
              className="w-full py-4 bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-lg shadow-[#4D6A9F]/20 active:scale-[0.98]"
            >
              Back to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>

          </div>
        </div>

        {/* Subtle footer */}
        <p className="text-center text-slate-500 text-xs mt-4">
          MyBillPort · Never miss a payment
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
