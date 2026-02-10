'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Plus, Settings, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { addBill, fetchBills, createBillAddedNotification } from '../lib/firebase';

const FREE_PLAN_LIMIT = 3;

export default function AddBillPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [billCount, setBillCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadBillCount();
    }
  }, [user]);

  const loadBillCount = async () => {
    if (!user) return;
    setLoadingCount(true);
    try {
      const bills = await fetchBills(user.uid);
      setBillCount(bills.length);
    } catch {
      setBillCount(null);
    } finally {
      setLoadingCount(false);
    }
  };

  const isAtLimit = billCount !== null && billCount >= FREE_PLAN_LIMIT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be logged in');
      return;
    }

    if (isAtLimit) {
      setError(`Free plan allows up to ${FREE_PLAN_LIMIT} bills. Upgrade to add more.`);
      return;
    }

    if (!companyName.trim()) {
      setError('Please enter a company name');
      return;
    }

    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      setError('Please enter a valid amount greater than $0');
      return;
    }

    if (!dueDate) {
      setError('Please select a due date');
      return;
    }

    const selectedDate = new Date(dueDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError('Due date must be today or a future date');
      return;
    }

    setIsSubmitting(true);

    try {
      const billId = await addBill(user.uid, {
        companyName: companyName.trim(),
        accountNumber: accountNumber.trim(),
        dueDate: selectedDate,
        totalAmount: parseFloat(totalAmount),
        paidAmount: 0,
        status: "unpaid",
      });

      await createBillAddedNotification(user.uid, companyName.trim(), billId).catch(console.error);

      setSuccess(true);
      setTimeout(() => {
        router.push('/app');
      }, 1000);
    } catch (err) {
      console.error('Failed to add bill:', err);
      setError('Failed to add bill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pb-24">
      <div className="px-5 pt-12 pb-6">
        <Link href="/app" className="flex items-center text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-white text-2xl font-semibold">Add New Bill</h1>
        <p className="text-slate-400">Track a new recurring bill</p>
      </div>

      <div className="px-4">
        {!loadingCount && billCount !== null && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${
            isAtLimit
              ? 'bg-red-500/10 border border-red-500/30 text-red-400'
              : 'bg-slate-800/50 border border-slate-700 text-slate-400'
          }`}>
            {isAtLimit ? (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            ) : null}
            <span>
              {isAtLimit
                ? `Free plan allows up to ${FREE_PLAN_LIMIT} bills. Upgrade to add more.`
                : `${billCount} of ${FREE_PLAN_LIMIT} bills used (Free Plan)`
              }
            </span>
          </div>
        )}

        {success ? (
          <div className="bg-teal-500/10 border border-teal-500/30 text-teal-400 px-4 py-6 rounded-xl text-center">
            <p className="text-lg font-semibold">Bill added successfully!</p>
            <p className="text-sm mt-1">Redirecting to dashboard...</p>
          </div>
        ) : isAtLimit ? (
          <div className="bg-white rounded-xl p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Bill Limit Reached</h2>
            <p className="text-slate-600">
              Free plan allows up to {FREE_PLAN_LIMIT} bills. Upgrade to add more.
            </p>
            <Link
              href="/app"
              className="inline-block btn-accent px-6 py-3 rounded-lg font-semibold"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Bell Canada, Hydro One"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter your account number (optional)"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Amount (CAD) *</label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loadingCount}
              className="w-full btn-accent py-3 rounded-lg font-semibold mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Bill'
              )}
            </button>
          </form>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700 py-3 px-6">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/app" className="nav-item">
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/add-bill" className="nav-item nav-item-active">
            <Plus className="w-6 h-6" />
            <span className="text-xs">Add Bill</span>
          </Link>
          <Link href="/settings" className="nav-item">
            <Settings className="w-6 h-6" />
            <span className="text-xs">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
