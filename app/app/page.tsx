'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Home, Plus, Settings, Loader2, Trash2, AlertTriangle, Bell, DollarSign, CheckCircle, ExternalLink, Check, X, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { fetchBills, deleteBill, fetchNotifications, checkAndCreateDueDateNotifications, sortBills, Bill, markBillAsPaid, getPaymentHistory, BillPaymentRecord, PaymentMethod } from '../lib/firebase';
import { CATEGORIES, getCategoryByValue, getSubcategory } from '../lib/categories';

const FREE_PLAN_LIMIT = 3;

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
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);
  const [markPaidModal, setMarkPaidModal] = useState<{ bill: Bill; method: PaymentMethod; confirmationCode: string; notes: string } | null>(null);
  const [markPaidLoading, setMarkPaidLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [paymentHistoryBillId, setPaymentHistoryBillId] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<BillPaymentRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadBills();
    }
  }, [user]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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

  const openMarkPaidModal = (bill: Bill) => {
    setMarkPaidModal({ bill, method: 'online', confirmationCode: '', notes: '' });
  };

  const handleMarkAsPaid = async () => {
    if (!markPaidModal || !user) return;
    const { bill, method, confirmationCode, notes } = markPaidModal;
    if (!bill.id) return;

    setMarkPaidLoading(true);
    const remaining = bill.totalAmount - bill.paidAmount;
    try {
      const result = await markBillAsPaid(
        bill.id,
        user.uid,
        remaining,
        method,
        confirmationCode || undefined,
        notes || undefined
      );
      setBills(prev => sortBills(prev.map(b =>
        b.id === bill.id ? { ...b, status: result.newStatus, paidAmount: result.newPaidAmount } : b
      )));
      setMarkPaidModal(null);
      setSuccessMessage(`${bill.companyName} marked as paid!`);
    } catch (err) {
      console.error('Failed to mark as paid:', err);
      setError('Failed to mark bill as paid. Please try again.');
    } finally {
      setMarkPaidLoading(false);
    }
  };

  const togglePaymentHistory = async (billId: string) => {
    if (paymentHistoryBillId === billId) {
      setPaymentHistoryBillId(null);
      setPaymentHistory([]);
      return;
    }
    setPaymentHistoryBillId(billId);
    setHistoryLoading(true);
    try {
      const history = await getPaymentHistory(billId);
      setPaymentHistory(history);
    } catch (err) {
      console.error('Failed to load payment history:', err);
      setPaymentHistory([]);
    } finally {
      setHistoryLoading(false);
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

  const formatPaymentDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMethodLabel = (method: string | null) => {
    switch (method) {
      case 'online': return 'Online';
      case 'mail': return 'Mail';
      case 'in-person': return 'In-Person';
      case 'other': return 'Other';
      default: return 'N/A';
    }
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

      {/* Success toast */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{successMessage}</span>
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
            const showingHistory = paymentHistoryBillId === bill.id;
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

                {/* Pay button + Mark as Paid + delete for unpaid/partial bills */}
                {!isFullyPaid && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/payment?biller=${encodeURIComponent(bill.companyName)}&amount=${remaining.toFixed(2)}`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Pay ${remaining.toFixed(2)}
                      </Link>

                      <button
                        onClick={() => openMarkPaidModal(bill)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Mark Paid
                      </button>

                      <button
                        onClick={() => bill.id && togglePaymentHistory(bill.id)}
                        className={`p-2 transition-colors rounded-lg flex-shrink-0 ${showingHistory ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:text-teal-600'}`}
                        title="Payment History"
                      >
                        <Clock className="w-4 h-4" />
                      </button>

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

                    {/* Payment History for unpaid/partial bills */}
                    {showingHistory && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        {historyLoading ? (
                          <div className="flex items-center justify-center py-3">
                            <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
                            <span className="ml-2 text-xs text-slate-400">Loading history...</span>
                          </div>
                        ) : paymentHistory.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-2">No payment records yet</p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-slate-500 uppercase">Payment History</p>
                            {paymentHistory.map((payment) => (
                              <div key={payment.id} className="bg-slate-50 rounded-lg p-3 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-slate-700">${payment.amount.toFixed(2)} CAD</span>
                                  <span className="text-slate-400">{formatPaymentDate(payment.paidAt)}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-slate-500">Method: {getMethodLabel(payment.method)}</span>
                                  {payment.confirmationCode && (
                                    <span className="text-slate-500">Ref: {payment.confirmationCode}</span>
                                  )}
                                </div>
                                {payment.notes && (
                                  <p className="text-slate-400 mt-1">{payment.notes}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Paid state */}
                {isFullyPaid && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Fully Paid</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => bill.id && togglePaymentHistory(bill.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-teal-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          History
                          {showingHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
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
                    </div>

                    {/* Payment History accordion */}
                    {showingHistory && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        {historyLoading ? (
                          <div className="flex items-center justify-center py-3">
                            <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
                            <span className="ml-2 text-xs text-slate-400">Loading history...</span>
                          </div>
                        ) : paymentHistory.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-2">No payment records yet</p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-slate-500 uppercase">Payment History</p>
                            {paymentHistory.map((payment) => (
                              <div key={payment.id} className="bg-slate-50 rounded-lg p-3 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-slate-700">${payment.amount.toFixed(2)} CAD</span>
                                  <span className="text-slate-400">{formatPaymentDate(payment.paidAt)}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-slate-500">Method: {getMethodLabel(payment.method)}</span>
                                  {payment.confirmationCode && (
                                    <span className="text-slate-500">Ref: {payment.confirmationCode}</span>
                                  )}
                                </div>
                                {payment.notes && (
                                  <p className="text-slate-400 mt-1">{payment.notes}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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

      {/* Mark as Paid Modal */}
      {markPaidModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Mark as Paid</h3>
                <p className="text-sm text-slate-500">{markPaidModal.bill.companyName} &mdash; ${markPaidModal.bill.totalAmount.toFixed(2)} CAD</p>
              </div>
              <button onClick={() => setMarkPaidModal(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {([['online', 'Online'], ['mail', 'Mail'], ['in-person', 'In-Person'], ['other', 'Other']] as [PaymentMethod, string][]).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setMarkPaidModal(prev => prev ? { ...prev, method: val } : null)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        markPaidModal.method === val
                          ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirmation Code (optional)</label>
                <input
                  type="text"
                  value={markPaidModal.confirmationCode}
                  onChange={(e) => setMarkPaidModal(prev => prev ? { ...prev, confirmationCode: e.target.value } : null)}
                  placeholder="e.g. REF-123456"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={markPaidModal.notes}
                  onChange={(e) => setMarkPaidModal(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  placeholder="e.g. Paid via bank app"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setMarkPaidModal(null)}
                  className="flex-1 py-3 px-4 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkAsPaid}
                  disabled={markPaidLoading}
                  className="flex-1 py-3 px-4 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {markPaidLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Confirm Paid
                    </>
                  )}
                </button>
              </div>
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
