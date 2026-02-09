'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Plus, Settings, Zap, Wifi, Phone, CreditCard, FileText, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { addBill, fetchBills, createBillAddedNotification } from '../lib/firebase';

const FREE_PLAN_LIMIT = 5;

const billCategories = [
  { id: "hydro", label: "Hydro", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
  { id: "internet", label: "Internet", icon: Wifi, color: "bg-blue-100 text-blue-600" },
  { id: "phone", label: "Phone", icon: Phone, color: "bg-green-100 text-green-600" },
  { id: "subscription", label: "Subscription", icon: CreditCard, color: "bg-purple-100 text-purple-600" },
  { id: "other", label: "Other", icon: FileText, color: "bg-slate-100 text-slate-600" },
];

export default function AddBillPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [billName, setBillName] = useState('');
  const [provider, setProvider] = useState('');
  const [category, setCategory] = useState('other');
  const [amount, setAmount] = useState('');
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
      setError(`Free plan allows up to ${FREE_PLAN_LIMIT} bills. Remove a bill or upgrade to add more.`);
      return;
    }

    if (!billName.trim()) {
      setError('Please enter a bill name');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
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
        billName: billName.trim(),
        provider: provider.trim(),
        category,
        amount: parseFloat(amount),
        dueDate: selectedDate,
        isPaid: false,
      });

      await createBillAddedNotification(user.uid, billName.trim(), billId).catch(console.error);

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
                ? `Free plan allows up to ${FREE_PLAN_LIMIT} bills. Remove a bill to add a new one.`
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
              Your free plan allows up to {FREE_PLAN_LIMIT} bills. Please remove an existing bill before adding a new one.
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Bill Name *</label>
              <input
                type="text"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
                placeholder="e.g., Electricity Bill"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
              <input
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="e.g., Toronto Hydro"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {billCategories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-xl flex flex-col items-center transition-all ${
                        isSelected
                          ? "bg-slate-100 border-2 border-teal-500"
                          : "bg-slate-50 border-2 border-transparent hover:border-slate-200"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-1.5 ${cat.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-medium ${isSelected ? "text-teal-600" : "text-slate-600"}`}>
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (CAD) *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0.01"
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
