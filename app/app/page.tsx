'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { Home, Plus, Settings, Loader2, Trash2, AlertTriangle, Bell, DollarSign, CreditCard, Zap, Wifi, Phone, MoreHorizontal, CheckCircle } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { fetchBills, deleteBill, fetchNotifications, checkAndCreateDueDateNotifications, logPayment, createPaymentNotification, Bill } from '../lib/firebase';

const FREE_PLAN_LIMIT = 3;

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [dueSoonChecked, setDueSoonChecked] = useState(false);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const payment = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    if (payment === 'success' && sessionId && user) {
      verifyAndLogPayment(sessionId);
      window.history.replaceState({}, '', '/app');
    } else if (payment === 'cancelled') {
      setError('Payment was cancelled.');
      window.history.replaceState({}, '', '/app');
    }
  }, [searchParams, user]);

  const verifyAndLogPayment = async (sessionId: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();

      if (!data.verified) {
        setError('Payment could not be verified. Please contact support if you were charged.');
        return;
      }

      if (data.userId !== user.uid) {
        setError('Payment verification mismatch.');
        return;
      }

      await logPayment(user.uid, data.billId, data.amountPaid, sessionId);
      await createPaymentNotification(user.uid, data.companyName, data.amountPaid, data.billId).catch(console.error);

      setPaymentSuccess(`Payment of $${data.amountPaid.toFixed(2)} for "${data.companyName}" processed successfully!`);
      setTimeout(() => setPaymentSuccess(null), 5000);
      loadBills();
    } catch (err) {
      console.error('Failed to verify payment:', err);
      setError('Failed to verify payment. Please check your Stripe account.');
    }
  };

  useEffect(() => {
    if (user) {
      loadBills();
    }
  }, [user]);

  const loadBills = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const userBills = await fetchBills(user.uid);
      setBills(userBills);

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

  const handlePay = async (bill: Bill, payType: 'full' | 'half') => {
    if (!bill.id || !user) return;
    setPayingBillId(bill.id);
    setError(null);

    const amount = payType === 'full' ? bill.amount : Math.round(bill.amount * 50) / 100;

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billId: bill.id,
          amount,
          companyName: bill.companyName,
          userId: user.uid,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      setPayingBillId(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "hydro": return <Zap className="w-5 h-5 text-yellow-600" />;
      case "internet": return <Wifi className="w-5 h-5 text-blue-600" />;
      case "credit_card": return <CreditCard className="w-5 h-5 text-indigo-600" />;
      case "subscription": return <DollarSign className="w-5 h-5 text-purple-600" />;
      case "phone": return <Phone className="w-5 h-5 text-green-600" />;
      default: return <MoreHorizontal className="w-5 h-5 text-gray-600" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "hydro": return "bg-yellow-100";
      case "internet": return "bg-blue-100";
      case "credit_card": return "bg-indigo-100";
      case "subscription": return "bg-purple-100";
      case "phone": return "bg-green-100";
      default: return "bg-gray-100";
    }
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - now.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusText = (bill: Bill) => {
    if (bill.isPaid) return "Paid";
    const daysUntil = getDaysUntilDue(bill.dueDate);
    if (daysUntil < 0) return `${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'} overdue`;
    if (daysUntil === 0) return "Due today";
    return `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`;
  };

  const getStatusStyle = (bill: Bill) => {
    if (bill.isPaid) return "text-green-500";
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

  const unpaidBills = bills.filter(b => !b.isPaid);
  const totalOwing = unpaidBills.reduce((sum, b) => sum + b.amount, 0);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const isAtLimit = bills.length >= FREE_PLAN_LIMIT;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pb-24">
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

      {paymentSuccess && (
        <div className="px-4 mb-4">
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{paymentSuccess}</span>
          </div>
        </div>
      )}

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

      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white font-semibold">Your Bills</h2>
          {!loading && (
            <span className="text-xs text-slate-500">{bills.length}/{FREE_PLAN_LIMIT} used</span>
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
        ) : (
          bills.map((bill) => {
            const isConfirming = confirmDeleteId === bill.id;
            const isPaying = payingBillId === bill.id;
            return (
              <div key={bill.id} className="bg-white rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 ${getIconBg(bill.category)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {getIcon(bill.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800">{bill.companyName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Acct: {bill.accountNumber || '—'}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">{formatDueDate(bill.dueDate)}</span>
                      <span className={`text-xs font-medium ${getStatusStyle(bill)}`}>
                        {getStatusText(bill)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-slate-800 text-lg">${bill.amount.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400">CAD</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => handlePay(bill, 'full')}
                      disabled={isPaying}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors disabled:opacity-50"
                    >
                      {isPaying ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <DollarSign className="w-3.5 h-3.5" />
                      )}
                      Pay Full
                    </button>

                    <button
                      onClick={() => handlePay(bill, 'half')}
                      disabled={isPaying}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      {isPaying ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <DollarSign className="w-3.5 h-3.5" />
                      )}
                      Pay Half (${(bill.amount / 2).toFixed(2)})
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
