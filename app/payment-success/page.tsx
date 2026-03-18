'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
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
  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (billId && bills.length > 0) {
      const bill = bills.find(b => b.id === billId);
      if (bill?.status === 'paid') setMarked(true);
    }
  }, [billId, bills]);

  const handleMarkPaid = async () => {
    if (!billId || !user) return;
    setMarking(true);
    setError('');
    try {
      const bill = bills.find(b => b.id === billId);
      const payAmount = bill?.totalAmount ?? parseFloat(amount) ?? 0;
      await markBillAsPaid(
        billId,
        user.uid,
        payAmount,
        'online',
        'Card payment via Stripe'
      );
      setMarked(true);
    } catch {
      setError('Could not update bill status. Please mark it paid manually from the dashboard.');
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-emerald-600 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
          {biller && (
            <p className="text-emerald-100 mt-1 text-sm">{biller}{amount ? ` — $${parseFloat(amount).toFixed(2)} CAD` : ''}</p>
          )}
        </div>

        <div className="p-6 space-y-4">
          <p className="text-slate-600 text-sm text-center">
            Your card payment was processed. You&apos;ll receive a receipt from Stripe by email.
          </p>

          {!marked ? (
            <button
              onClick={handleMarkPaid}
              disabled={marking || !billId}
              className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {marking ? <><Loader2 className="w-4 h-4 animate-spin" />Updating...</> : '✓ Mark Bill as Paid in MyBillPort'}
            </button>
          ) : (
            <div className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold rounded-xl text-center text-sm">
              ✓ Bill marked as paid
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}

          <Link
            href="/app"
            className="w-full py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
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
