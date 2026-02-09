'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Plus, Settings, Loader2, AlertTriangle, Search, X } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { addBill, fetchBills, createBillAddedNotification } from '../lib/firebase';
import { searchBillers, canadianBillers, BillerEntry } from '../lib/canadianBillers';

const FREE_PLAN_LIMIT = 3;

export default function AddBillPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [billCount, setBillCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);

  const [suggestions, setSuggestions] = useState<BillerEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('other');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleCompanyInput = (value: string) => {
    setCompanyName(value);
    if (value.trim().length > 0) {
      const results = searchBillers(value);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectBiller = (biller: BillerEntry) => {
    setCompanyName(biller.name);
    setSelectedCategory(biller.category);
    setShowSuggestions(false);
    setSuggestions([]);
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

    if (!companyName.trim()) {
      setError('Please enter a company name');
      return;
    }

    if (!accountNumber.trim()) {
      setError('Please enter an account number');
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
        companyName: companyName.trim(),
        accountNumber: accountNumber.trim(),
        category: selectedCategory,
        amount: parseFloat(amount),
        dueDate: selectedDate,
        isPaid: false,
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

            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={companyName}
                  onChange={(e) => handleCompanyInput(e.target.value)}
                  onFocus={() => {
                    if (companyName.trim()) {
                      const results = searchBillers(companyName);
                      setSuggestions(results);
                      setShowSuggestions(results.length > 0);
                    }
                  }}
                  placeholder="Search or type company name..."
                  className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
                {companyName && (
                  <button
                    type="button"
                    onClick={() => { setCompanyName(''); setSuggestions([]); setShowSuggestions(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestionsRef} className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((biller, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectBiller(biller)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-b-0 transition-colors"
                    >
                      <span className="font-medium text-slate-800">{biller.name}</span>
                      <span className="text-xs text-slate-400 capitalize">{biller.category.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-1">
                Search from {canadianBillers.length}+ Canadian billers or type your own
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Number *</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter your account number"
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Bill Amount (CAD) *</label>
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
