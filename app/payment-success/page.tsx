'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, ArrowLeft, PartyPopper } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { markBillAsPaid } from '../lib/firebase';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const billId = searchParams.get('billId') || '';
  const biller = searchParams.get('biller') || '';
  const amount = searchParams.get('amount') || '';
  const { user } = useAuth();
  const { bills } = useData();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    if (!billId || !user) {
      setStatus('success');
      return;
    }
    const bill = bills.find(b => b.id === billId);
    if (bill?.status === 'paid') {
      setStatus('success');
      return;
    }
    if (bills.length === 0) return;

    const payAmount = bill?.totalAmount ?? parseFloat(amount) ?? 0;
    markBillAsPaid(billId, user.uid, payAmount, 'online', 'Card payment via Stripe')
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [billId, user, bills, amount]);

  const nextBill = bills
    .filter(b => b.id !== billId && b.status !== 'paid' && b.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const nextDaysLeft = nextBill
    ? Math.ceil((new Date(nextBill.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Recording your payment…</p>
          <p className="text-slate-400 text-sm mt-1">Just a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-emerald-600 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
          {biller && (
            <p className="text-emerald-100 mt-1 text-sm">
              {biller}{amount ? ` — $${parseFloat(amount).toFixed(2)} CAD` : ''}
            </p>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* Auto-recorded confirmation */}
          {status === 'success' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <PartyPopper className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-800 font-semibold text-sm">
                  {amount ? `$${parseFloat(amount).toFixed(2)} payment recorded automatically` : 'Payment recorded automatically'}
                </p>
                <p className="text-emerald-600 text-xs mt-0.5">
                  {billId ? 'Bill marked as paid · You avoided a late fee!' : 'You\'ll receive a receipt from Stripe by email.'}
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
              Payment was processed but we couldn&apos;t update your bill automatically. Please mark it as paid from the dashboard.
            </div>
          )}

          {/* Next bill reminder */}
          {nextBill && nextDaysLeft !== null && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase font-medium mb-1">Next Bill Due</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-700 font-semibold text-sm">{nextBill.companyName}</p>
                  <p className="text-slate-400 text-xs">
                    {nextDaysLeft <= 0 ? 'Due today' : nextDaysLeft === 1 ? 'Due tomorrow' : `Due in ${nextDaysLeft} days`}
                  </p>
                </div>
                <p className="text-slate-700 font-bold text-sm">${nextBill.totalAmount?.toFixed(2)}</p>
              </div>
            </div>
          )}

          <Link
            href="/app"
            className="w-full py-3 bg-[#4D6A9F] hover:bg-[#3d5a8f] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            Back to Dashboard
          </Link>

          <Link
            href="/app"
            className="w-full py-2 border border-slate-200 text-slate-500 font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            View all bills
          </Link>
        </div>
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
