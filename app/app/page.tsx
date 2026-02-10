'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Home, Plus, Settings, Loader2, Trash2, AlertTriangle, Bell, DollarSign, CheckCircle, X, Filter } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { fetchBills, deleteBill, fetchNotifications, checkAndCreateDueDateNotifications, sortBills, Bill, updateBillAfterPayment } from '../lib/firebase';
import { CATEGORIES, getCategoryByValue, getSubcategory } from '../lib/categories';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const FREE_PLAN_LIMIT = 3;

// Stripe promise - loaded once from our API
let stripePromise: Promise<Stripe | null> | null = null;
function getStripe() {
  if (!stripePromise) {
    stripePromise = fetch('/api/stripe-publishable-key')
      .then(r => r.json())
      .then(data => {
        if (data.publishableKey) {
          return loadStripe(data.publishableKey);
        }
        console.error('No Stripe publishable key');
        return null;
      })
      .catch(err => {
        console.error('Failed to load Stripe:', err);
        return null;
      });
  }
  return stripePromise;
}

// Payment form component rendered inside Stripe Elements
function PaymentForm({ onSuccess, onError, onCancel }: {
  onSuccess: (paymentIntentId: string) => void;
  onError: (msg: string) => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        onError('Payment was not completed. Please try again.');
      }
    } catch (err: any) {
      onError(err.message || 'Payment processing error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 py-3 px-4 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 py-3 px-4 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Pay Now'
          )}
        </button>
      </div>
    </form>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [dueSoonChecked, setDueSoonChecked] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Payment modal state
  const [paymentModal, setPaymentModal] = useState<{
    bill: Bill;
    payType: 'full' | 'partial';
    clientSecret: string | null;
    partialAmount: string;
    step: 'amount' | 'card';
    idempotencyToken: string;
  } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadBills();
      getStripe().then(s => setStripeInstance(s));
    }
  }, [user]);

  const loadBills = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const userBills = await fetchBills(user.uid);
      setBills(sortBills(userBills));

      if (!dueSoonChecked && userBills.length > 0) {
        setDueSoonChecked(true);
        await checkAndCreateDueDateNotifications(user.uid, userBills).catch(console.error);
      }

      const notifs = await fetchNotifications(user.uid).catch(() => []);
      setUnreadNotifCount(notifs.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch bills:', err);
      setError('Failed to load bills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBill = async (billId: string) => {
    setDeletingId(billId);
    try {
      await deleteBill(billId);
      setBills(bills.filter(b => b.id !== billId));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Failed to delete bill:', err);
      setError('Failed to delete bill. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Open payment modal
  const openPaymentModal = (bill: Bill, payType: 'full' | 'partial') => {
    setPaymentError(null);
    const remaining = bill.totalAmount - bill.paidAmount;
    const token = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    if (payType === 'full') {
      setPaymentModal({
        bill,
        payType: 'full',
        clientSecret: null,
        partialAmount: remaining.toFixed(2),
        step: 'card',
        idempotencyToken: token,
      });
      createPaymentIntent(bill, 'full', remaining, token);
    } else {
      setPaymentModal({
        bill,
        payType: 'partial',
        clientSecret: null,
        partialAmount: '',
        step: 'amount',
        idempotencyToken: token,
      });
    }
  };

  // Create payment intent via our API
  const createPaymentIntent = async (bill: Bill, payType: string, amount: number, idempotencyToken?: string) => {
    if (!user) return;
    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId: bill.id,
          userId: user.uid,
          paymentType: payType,
          amount,
          idempotencyToken: idempotencyToken || paymentModal?.idempotencyToken || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      setPaymentModal(prev => prev ? {
        ...prev,
        clientSecret: data.clientSecret,
        step: 'card',
        partialAmount: amount.toFixed(2),
      } : null);
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to create payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle partial amount submission
  const handlePartialAmountSubmit = () => {
    if (!paymentModal) return;
    const amount = parseFloat(paymentModal.partialAmount);
    const remaining = paymentModal.bill.totalAmount - paymentModal.bill.paidAmount;

    if (isNaN(amount) || amount <= 0) {
      setPaymentError('Please enter a valid amount');
      return;
    }
    if (amount < 0.50) {
      setPaymentError('Minimum payment is $0.50 CAD');
      return;
    }
    if (amount > remaining) {
      setPaymentError(`Amount cannot exceed remaining balance of $${remaining.toFixed(2)}`);
      return;
    }

    createPaymentIntent(paymentModal.bill, 'partial', amount);
  };

  // Handle successful payment - update Firestore immediately
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!paymentModal || !user) return;

    const billName = paymentModal.bill.companyName || '';
    const paymentAmount = parseFloat(paymentModal.partialAmount) || 0;
    const billId = paymentModal.bill.id;

    setPaymentModal(null);

    try {
      if (billId) {
        await updateBillAfterPayment(user.uid, billId, paymentAmount, paymentIntentId);
      }
      setPaymentSuccess(`Payment of $${paymentAmount.toFixed(2)} for "${billName}" was successful!`);
      await loadBills();
    } catch (err: any) {
      console.error('Failed to update bill after payment:', err);
      setPaymentSuccess(`Payment for "${billName}" was processed. Refreshing...`);
      setTimeout(() => loadBills(), 2000);
    }

    setTimeout(() => setPaymentSuccess(null), 6000);
  };

  // Handle payment error
  const handlePaymentError = (msg: string) => {
    setPaymentError(msg);
  };

  const closePaymentModal = () => {
    setPaymentModal(null);
    setPaymentError(null);
    setPaymentLoading(false);
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - now.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (bill: Bill) => {
    if (bill.status === "paid") {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Paid</span>;
    }
    if (bill.status === "partial") {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Partial</span>;
    }
    const daysUntil = getDaysUntilDue(bill.dueDate);
    if (daysUntil < 0) {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">{Math.abs(daysUntil)}d overdue</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Unpaid</span>;
  };

  const getDueDateText = (bill: Bill) => {
    if (bill.status === "paid") return '';
    const daysUntil = getDaysUntilDue(bill.dueDate);
    if (daysUntil < 0) return `${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} overdue`;
    if (daysUntil === 0) return "Due today";
    if (daysUntil === 1) return "Due tomorrow";
    return `Due in ${daysUntil} days`;
  };

  const getDueDateColor = (bill: Bill) => {
    if (bill.status === "paid") return "text-green-500";
    const daysUntil = getDaysUntilDue(bill.dueDate);
    if (daysUntil < 0) return "text-red-500";
    if (daysUntil <= 3) return "text-amber-500";
    return "text-teal-600";
  };

  const formatDueDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  const filteredBills = categoryFilter === 'all'
    ? bills
    : bills.filter(b => b.category === categoryFilter);
  const unpaidBills = bills.filter(b => b.status !== 'paid');
  const totalOwing = unpaidBills.reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);
  const usedCategories = [...new Set(bills.map(b => b.category).filter(Boolean))] as string[];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const isAtLimit = bills.length >= FREE_PLAN_LIMIT;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-navy rounded-xl flex items-center justify-center border border-slate-600">
              <span className="text-white font-bold">B</span>
            </div>
            <span className="text-white font-semibold text-lg">BillPort</span>
          </div>
          <Link href="/notifications" className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <Bell className="w-6 h-6 text-slate-300" />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </span>
            )}
          </Link>
        </div>
        <p className="text-slate-400">{greeting()}</p>
        <p className="text-white text-2xl font-semibold">Here&apos;s your overview</p>
      </div>

      {/* Success message */}
      {paymentSuccess && (
        <div className="px-4 mb-4">
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{paymentSuccess}</span>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-6">
        <div className="summary-card text-center">
          <p className="text-2xl font-bold text-white">{bills.length}</p>
          <p className="text-xs text-slate-400">Total Bills</p>
        </div>
        <div className="summary-card text-center">
          <p className="text-2xl font-bold text-teal-400">${totalOwing.toFixed(2)}</p>
          <p className="text-xs text-slate-400">Total Owing</p>
        </div>
      </div>

      {isAtLimit && (
        <div className="px-4 mb-4">
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Free plan limit reached ({FREE_PLAN_LIMIT}/{FREE_PLAN_LIMIT} bills). Remove a bill to add more.</span>
          </div>
        </div>
      )}

      {error && (
        <div className="px-4 mb-4">
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline hover:no-underline">Dismiss</button>
          </div>
        </div>
      )}

      {/* Category filter */}
      {!loading && usedCategories.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All ({bills.length})
            </button>
            {usedCategories.map(catVal => {
              const cat = getCategoryByValue(catVal);
              const count = bills.filter(b => b.category === catVal).length;
              return (
                <button
                  key={catVal}
                  onClick={() => setCategoryFilter(catVal)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    categoryFilter === catVal
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {cat?.icon || ''} {cat?.label || catVal} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bills list */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white font-semibold">Your Bills</h2>
          {!loading && (
            <span className="text-xs text-slate-500">{filteredBills.length} bill{filteredBills.length !== 1 ? 's' : ''} {categoryFilter !== 'all' ? `in ${getCategoryByValue(categoryFilter)?.label || categoryFilter}` : `(${bills.length}/${FREE_PLAN_LIMIT} used)`}</span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
          </div>
        ) : bills.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700">
            <p className="text-slate-400 mb-4">No bills yet</p>
            <Link href="/add-bill" className="btn-accent px-6 py-2 rounded-lg inline-block">
              Add Your First Bill
            </Link>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700">
            <p className="text-slate-400 mb-2">No bills in this category</p>
            <button onClick={() => setCategoryFilter('all')} className="text-teal-400 text-sm underline hover:no-underline">Show all bills</button>
          </div>
        ) : (
          filteredBills.map((bill) => {
            const isConfirming = confirmDeleteId === bill.id;
            const isFullyPaid = bill.status === "paid";
            const isPartial = bill.status === "partial";
            const remaining = bill.totalAmount - bill.paidAmount;
            const billCategory = bill.category ? getCategoryByValue(bill.category) : null;
            const billSubcategory = bill.category && bill.subcategory ? getSubcategory(bill.category, bill.subcategory) : null;
            return (
              <div key={bill.id} className="bg-white rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">
                    {billCategory?.icon || <DollarSign className="w-5 h-5 text-slate-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800">{bill.companyName}</p>
                      {getStatusBadge(bill)}
                    </div>
                    {billCategory && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {billCategory.label}{billSubcategory ? ` \u2022 ${billSubcategory.label}` : ''}
                        {bill.billingCycle && bill.billingCycle !== 'monthly' ? ` \u2022 ${bill.billingCycle}` : ''}
                      </p>
                    )}
                    {bill.accountNumber && (
                      <p className="text-xs text-slate-500 mt-0.5">Acct: {bill.accountNumber}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">{formatDueDate(bill.dueDate)}</span>
                      {!isFullyPaid && (
                        <span className={`text-xs font-medium ${getDueDateColor(bill)}`}>
                          {getDueDateText(bill)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-slate-800 text-lg">${bill.totalAmount.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400">CAD</p>
                    {isPartial && (
                      <p className="text-xs text-blue-500 font-medium mt-0.5">
                        ${remaining.toFixed(2)} left
                      </p>
                    )}
                    {bill.paidAmount > 0 && (
                      <p className="text-xs text-green-500 font-medium mt-0.5">
                        ${bill.paidAmount.toFixed(2)} paid
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment + delete buttons for unpaid/partial bills */}
                {!isFullyPaid && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={() => openPaymentModal(bill, 'full')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        {isPartial ? `Pay Remaining ($${remaining.toFixed(2)})` : 'Pay Full'}
                      </button>

                      <button
                        onClick={() => openPaymentModal(bill, 'partial')}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        Pay Partial
                      </button>
                    </div>

                    {deletingId === bill.id ? (
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(isConfirming ? null : bill.id!)}
                        className={`p-2 transition-colors rounded-lg flex-shrink-0 ${isConfirming ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-500'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Paid state */}
                {isFullyPaid && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Fully Paid</span>
                    </div>
                    {deletingId === bill.id ? (
                      <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(isConfirming ? null : bill.id!)}
                        className={`p-2 transition-colors rounded-lg flex-shrink-0 ${isConfirming ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-500'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Delete confirmation */}
                {isConfirming && (
                  <div className="mt-3 pt-3 border-t border-red-100 flex items-center justify-between bg-red-50 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
                    <p className="text-sm text-red-600 font-medium">Delete this bill?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-1.5 text-sm text-slate-600 hover:bg-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => bill.id && handleDeleteBill(bill.id)}
                        className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {!loading && !isAtLimit && bills.length > 0 && (
        <div className="px-4 mt-4">
          <Link
            href="/add-bill"
            className="block w-full text-center btn-accent py-3 rounded-lg font-semibold"
          >
            Add Another Bill
          </Link>
        </div>
      )}

      {/* Stripe Payment Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {paymentModal.payType === 'full' ? 'Pay Full Amount' : 'Pay Partial Amount'}
                </h3>
                <p className="text-sm text-slate-500">{paymentModal.bill.companyName}</p>
              </div>
              <button onClick={closePaymentModal} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-5">
              {/* Bill summary */}
              <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Amount</span>
                  <span className="font-medium text-slate-700">${paymentModal.bill.totalAmount.toFixed(2)} CAD</span>
                </div>
                {paymentModal.bill.paidAmount > 0 && (
                  <div className="flex justify-between mt-1">
                    <span className="text-slate-500">Already Paid</span>
                    <span className="font-medium text-green-600">${paymentModal.bill.paidAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between mt-1 pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Remaining</span>
                  <span className="font-bold text-slate-800">
                    ${(paymentModal.bill.totalAmount - paymentModal.bill.paidAmount).toFixed(2)} CAD
                  </span>
                </div>
              </div>

              {paymentError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                  {paymentError}
                </div>
              )}

              {/* Step 1: Partial amount input */}
              {paymentModal.step === 'amount' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Payment Amount (CAD) *
                    </label>
                    <input
                      type="number"
                      value={paymentModal.partialAmount}
                      onChange={(e) => {
                        setPaymentError(null);
                        setPaymentModal(prev => prev ? { ...prev, partialAmount: e.target.value } : null);
                      }}
                      placeholder="0.00"
                      step="0.01"
                      min="0.50"
                      max={paymentModal.bill.totalAmount - paymentModal.bill.paidAmount}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                      autoFocus
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Minimum: $0.50 CAD | Maximum: ${(paymentModal.bill.totalAmount - paymentModal.bill.paidAmount).toFixed(2)} CAD
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={closePaymentModal}
                      className="flex-1 py-3 px-4 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePartialAmountSubmit}
                      disabled={paymentLoading}
                      className="flex-1 py-3 px-4 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {paymentLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Continue to Payment'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Stripe card input */}
              {paymentModal.step === 'card' && paymentLoading && !paymentModal.clientSecret && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
                  <span className="ml-2 text-slate-500">Preparing payment...</span>
                </div>
              )}

              {paymentModal.step === 'card' && paymentModal.clientSecret && stripeInstance && (
                <Elements
                  stripe={stripeInstance}
                  options={{
                    clientSecret: paymentModal.clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#0d9488',
                        borderRadius: '8px',
                      },
                    },
                  }}
                >
                  <PaymentForm
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    onCancel={closePaymentModal}
                  />
                </Elements>
              )}

              {paymentModal.step === 'card' && !paymentLoading && !paymentModal.clientSecret && !stripeInstance && (
                <div className="text-center py-8">
                  <p className="text-red-500 text-sm">Failed to load payment form. Please try again.</p>
                  <button onClick={closePaymentModal} className="mt-3 text-teal-600 underline text-sm">
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700 py-3 px-6">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/app" className="nav-item nav-item-active">
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/add-bill" className="nav-item">
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
