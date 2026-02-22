'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Home, Plus, Settings, Loader2, Trash2, AlertTriangle, Bell, DollarSign, CheckCircle, ExternalLink, Check, X, Clock, ChevronDown, ChevronUp, Pencil, Receipt, TrendingUp, TrendingDown, Minus, Sparkles, BarChart3, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { fetchBills, deleteBill, fetchNotifications, checkAndCreateDueDateNotifications, sortBills, Bill, markBillAsPaid, getPaymentHistory, BillPaymentRecord, PaymentMethod, updateBill, BillingCycle, applyRecurringDetection, persistRecurringFlags, detectRecurringPatterns, dismissAmountAlert, RecurringFrequency } from '../lib/firebase';
import { CATEGORIES, getCategoryByValue, getSubcategory } from '../lib/categories';
import { trackBillPaid, trackBillDeleted, trackBillEdited, trackPaymentRedirect } from '../lib/analyticsService';
import { detectSpike, calculateAnnualProjections, calculateSavingsScore, SpikeInfo, AnnualProjection, SavingsScore } from '../lib/billAnalytics';

const FREE_PLAN_LIMIT = 5;
const BILLS_PER_PAGE = 10;

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
  const [editModal, setEditModal] = useState<{
    bill: Bill;
    companyName: string;
    accountNumber: string;
    totalAmount: string;
    dueDate: string;
    notes: string;
  } | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(BILLS_PER_PAGE);
  const [annualProjection, setAnnualProjection] = useState<{ perBiller: AnnualProjection[]; totalAnnual: number } | null>(null);
  const [savingsScore, setSavingsScore] = useState<SavingsScore | null>(null);
  const [showProjectionDetail, setShowProjectionDetail] = useState(false);
  const [insightsModal, setInsightsModal] = useState<{ bill: Bill; loading: boolean; data: any | null; error: string | null } | null>(null);

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
      const withRecurring = applyRecurringDetection(userBills);
      setBills(sortBills(withRecurring));

      const detections = detectRecurringPatterns(userBills);
      detections.forEach((det, billId) => {
        persistRecurringFlags(billId, det).catch(console.error);
      });

      if (!dueSoonChecked && userBills.length > 0) {
        setDueSoonChecked(true);
        await checkAndCreateDueDateNotifications(user.uid, userBills).catch(console.error);
      }

      const notifs = await fetchNotifications(user.uid).catch(() => []);
      setUnreadNotifCount(notifs.filter(n => !n.isRead).length);

      const projections = calculateAnnualProjections(withRecurring);
      setAnnualProjection(projections);
      const scoreResult = calculateSavingsScore(withRecurring);
      setSavingsScore(scoreResult);
    } catch (err) {
      console.error('Failed to fetch bills:', err);
      setError('Failed to load bills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async (bill: Bill) => {
    setInsightsModal({ bill, loading: true, data: null, error: null });
    try {
      const billsData = bills.map(b => ({
        companyName: b.companyName,
        totalAmount: b.totalAmount,
        dueDate: new Date(b.dueDate).toISOString(),
        status: b.status,
        category: b.category,
        isRecurring: b.isRecurring,
        recurringFrequency: b.recurringFrequency,
        avgRecurringAmount: b.avgRecurringAmount,
        amountDeviationPercent: b.amountDeviationPercent,
      }));
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bills: billsData, billerName: bill.companyName }),
      });
      if (!res.ok) throw new Error('Failed to fetch insights');
      const data = await res.json();
      setInsightsModal(prev => prev ? { ...prev, loading: false, data } : null);
    } catch (err: any) {
      setInsightsModal(prev => prev ? { ...prev, loading: false, error: err.message || 'Failed to load insights' } : null);
    }
  };

  const handleDeleteBill = async (billId: string) => {
    setDeletingId(billId);
    try {
      await deleteBill(billId);
      const updated = bills.filter(b => b.id !== billId);
      setBills(updated);
      setAnnualProjection(calculateAnnualProjections(updated));
      setSavingsScore(calculateSavingsScore(updated));
      setConfirmDeleteId(null);
      trackBillDeleted();
    } catch (err) {
      console.error('Failed to delete bill:', err);
      setError('Failed to delete bill. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDismissAmountAlert = async (bill: Bill) => {
    if (!bill.id || !user) return;
    try {
      await dismissAmountAlert(bill.id, user.uid);
      setBills(prev => prev.map(b => b.id === bill.id ? { ...b, amountDeviationFlag: false } : b));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  const openEditModal = (bill: Bill) => {
    const dueDateStr = new Date(bill.dueDate).toISOString().split('T')[0];
    setEditModal({
      bill,
      companyName: bill.companyName,
      accountNumber: bill.accountNumber || '',
      totalAmount: String(bill.totalAmount),
      dueDate: dueDateStr,
      notes: '',
    });
  };

  const handleEditBill = async () => {
    if (!editModal || !user) return;
    const { bill, companyName, accountNumber, totalAmount, dueDate, notes } = editModal;
    if (!bill.id) return;

    const amount = parseFloat(totalAmount);
    if (!companyName.trim()) { setError('Biller name is required'); return; }
    if (isNaN(amount) || amount <= 0) { setError('Amount must be greater than 0'); return; }
    if (!dueDate) { setError('Due date is required'); return; }

    setEditLoading(true);
    try {
      await updateBill(bill.id, user.uid, {
        companyName: companyName.trim(),
        accountNumber: accountNumber.trim(),
        totalAmount: amount,
        dueDate: new Date(dueDate),
        notes: notes.trim() || undefined,
      });
      const updatedBills = sortBills(bills.map(b =>
        b.id === bill.id ? {
          ...b,
          companyName: companyName.trim(),
          accountNumber: accountNumber.trim(),
          totalAmount: amount,
          dueDate: new Date(dueDate),
          status: amount <= (b.paidAmount || 0) && amount > 0 ? 'paid' : (b.paidAmount || 0) > 0 ? 'partial' : 'unpaid',
        } : b
      ));
      setBills(updatedBills);
      setAnnualProjection(calculateAnnualProjections(updatedBills));
      setSavingsScore(calculateSavingsScore(updatedBills));
      setEditModal(null);
      setSuccessMessage(`${companyName} updated!`);
      trackBillEdited();
    } catch (err: any) {
      console.error('Failed to update bill:', err);
      setError(err.message || 'Failed to update bill. Please try again.');
    } finally {
      setEditLoading(false);
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
    const remaining = Math.max(bill.totalAmount - (bill.paidAmount || 0), 0);
    try {
      const result = await markBillAsPaid(
        bill.id,
        user.uid,
        remaining,
        method,
        confirmationCode || undefined,
        notes || undefined
      );
      const updatedPaid = sortBills(bills.map(b =>
        b.id === bill.id ? { ...b, status: result.newStatus, paidAmount: result.newPaidAmount } : b
      ));
      setBills(updatedPaid);
      setAnnualProjection(calculateAnnualProjections(updatedPaid));
      setSavingsScore(calculateSavingsScore(updatedPaid));
      setMarkPaidModal(null);
      setSuccessMessage(`${bill.companyName} marked as paid!`);
      const isOnTime = new Date(bill.dueDate) >= new Date();
      trackBillPaid(isOnTime, remaining, method);
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (insightsModal) setInsightsModal(null);
        if (editModal) setEditModal(null);
        if (markPaidModal) setMarkPaidModal(null);
      }
    };
    if (editModal || markPaidModal || insightsModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [editModal, markPaidModal, insightsModal]);

  useEffect(() => {
    setVisibleCount(BILLS_PER_PAGE);
  }, [categoryFilter]);

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
  const visibleBills = filteredBills.slice(0, visibleCount);
  const hasMore = visibleCount < filteredBills.length;
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
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]">
              <div className="relative">
                <Receipt className="text-white w-6 h-6" />
                <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-teal-500/30">
                  <DollarSign className="text-teal-400 w-3 h-3" />
                </div>
              </div>
            </div>
            <span className="text-white font-bold text-xl tracking-tighter">My<span className="text-teal-500">BillPort</span></span>
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

      {(() => {
        const recurringBills = bills.filter(b => b.isRecurring && b.status !== 'paid');
        const recurringTotal = recurringBills.reduce((sum, b) => sum + Math.max(b.totalAmount - (b.paidAmount || 0), 0), 0);
        if (recurringBills.length === 0) return null;
        return (
          <div className="px-4 mb-4">
            <div className="summary-card flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-lg">🔄</div>
              <div>
                <p className="text-white font-semibold">{recurringBills.length} Recurring Bill{recurringBills.length !== 1 ? 's' : ''}</p>
                <p className="text-xs text-slate-400">${recurringTotal.toFixed(2)} upcoming recurring</p>
              </div>
            </div>
          </div>
        );
      })()}

      {!loading && bills.length > 0 && annualProjection && savingsScore && (
        <div className="px-4 grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setShowProjectionDetail(!showProjectionDetail)}
            className="summary-card text-left hover:border-teal-500/40 transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-teal-400" />
              <span className="text-xs text-slate-400">Annual Projection</span>
            </div>
            <p className="text-xl font-bold text-teal-400">${annualProjection.totalAnnual.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-[10px] text-slate-500">{annualProjection.perBiller.length} biller{annualProjection.perBiller.length !== 1 ? 's' : ''} tracked</p>
          </button>

          <div className="summary-card text-left">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-teal-400" />
              <span className="text-xs text-slate-400">Savings Score</span>
            </div>
            <div className="flex items-center gap-2">
              <p className={`text-xl font-bold ${savingsScore.color}`}>{savingsScore.score}</p>
              <span className="text-[10px] text-slate-500">/100</span>
            </div>
            <p className={`text-[10px] font-medium ${savingsScore.color}`}>{savingsScore.label}</p>
          </div>
        </div>
      )}

      {showProjectionDetail && annualProjection && (
        <div className="px-4 mb-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-sm">Annual Cost Breakdown</h3>
                <p className="text-xs text-slate-400">Estimated yearly spending per biller</p>
              </div>
              <button onClick={() => setShowProjectionDetail(false)} className="p-1 hover:bg-slate-700 rounded-lg">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="divide-y divide-slate-700/50 max-h-64 overflow-y-auto">
              {annualProjection.perBiller.map((p, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm text-white truncate">{p.billerName}</span>
                    {p.trend === 'rising' && <ArrowUpRight className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                    {p.trend === 'falling' && <ArrowDownRight className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />}
                    {p.trend === 'stable' && <Minus className="w-3 h-3 text-slate-500 flex-shrink-0" />}
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-medium text-teal-400">${p.annualEstimate.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</p>
                    <p className="text-[10px] text-slate-500">${p.monthlyAvg.toFixed(2)}/bill</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 bg-slate-700/30 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Total Annual Estimate</span>
              <span className="text-sm font-bold text-teal-400">${annualProjection.totalAnnual.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      )}

      {!loading && savingsScore && savingsScore.factors.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex flex-wrap gap-1.5">
            {savingsScore.factors.slice(0, 3).map((f, i) => (
              <span key={i} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${
                f.impact === 'positive' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                f.impact === 'negative' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                'bg-slate-700 text-slate-400 border border-slate-600'
              }`}>
                {f.impact === 'positive' ? '✓' : f.impact === 'negative' ? '!' : '•'} {f.label}
              </span>
            ))}
          </div>
        </div>
      )}

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
            <span className="text-xs text-slate-500">
              {filteredBills.length} bill{filteredBills.length !== 1 ? 's' : ''}
              {hasMore ? ` (showing ${visibleCount})` : ''}
              {categoryFilter !== 'all' ? ` in ${getCategoryByValue(categoryFilter)?.label || categoryFilter}` : ` (${bills.length}/${FREE_PLAN_LIMIT} used — Free Plan)`}
            </span>
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
          visibleBills.map((bill) => {
            const isConfirming = confirmDeleteId === bill.id;
            const isFullyPaid = bill.status === "paid";
            const isPartial = bill.status === "partial";
            const remaining = Math.max(bill.totalAmount - (bill.paidAmount || 0), 0);
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
                      {bill.isRecurring && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700" title={`Recurring bill – ${Math.round((bill.recurringConfidence || 0) * 100)}% confidence`}>
                          🔄 {bill.recurringFrequency === 'monthly' ? 'Monthly' : bill.recurringFrequency === 'quarterly' ? 'Quarterly' : bill.recurringFrequency === 'yearly' ? 'Yearly' : 'Recurring'}
                        </span>
                      )}
                      {(() => {
                        const spike = detectSpike(bill, bills);
                        if (!spike.type) return null;
                        return (
                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                            spike.type === 'increase' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`} title={`${spike.percent}% ${spike.type} vs ${spike.comparedTo}`}>
                            {spike.type === 'increase' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {spike.percent}% {spike.type === 'increase' ? 'up' : 'down'}
                          </span>
                        );
                      })()}
                    </div>
                    {billCategory && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {billCategory.label}{billSubcategory ? ` \u2022 ${billSubcategory.label}` : ''}
                        {bill.billingCycle && bill.billingCycle !== 'monthly' ? ` \u2022 ${bill.billingCycle}` : ''}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">Due: {formatDueDate(bill.dueDate)}</span>
                      {!isFullyPaid && (
                        <span className={`text-xs font-medium ${getDueDateColor(bill)}`}>
                          {getDueDateText(bill)}
                        </span>
                      )}
                    </div>
                    {!isFullyPaid && remaining > 0 && (
                      <p className="text-xs font-medium text-slate-600 mt-0.5">
                        Amount due: <span className="text-teal-600">${remaining.toFixed(2)}</span>
                      </p>
                    )}
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

                {bill.amountDeviationFlag && bill.isRecurring && bill.amountDeviationPercent !== undefined && (
                  <div className={`mt-2 px-3 py-2 rounded-lg text-xs flex items-center justify-between ${
                    (bill.amountDeviationPercent || 0) > 0 ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 ${(bill.amountDeviationPercent || 0) > 0 ? 'text-red-500' : 'text-amber-500'}`} />
                      <span className={(bill.amountDeviationPercent || 0) > 0 ? 'text-red-700' : 'text-amber-700'}>
                        {(bill.amountDeviationPercent || 0) > 0 ? 'Increased' : 'Decreased'} {Math.abs(bill.amountDeviationPercent || 0).toFixed(1)}% from avg ${(bill.avgRecurringAmount || 0).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDismissAmountAlert(bill)}
                      className="text-slate-400 hover:text-slate-600 ml-2"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Pay button + Mark as Paid + delete for unpaid/partial bills */}
                {!isFullyPaid && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/payment?biller=${encodeURIComponent(bill.companyName)}&amount=${remaining.toFixed(2)}`}
                        onClick={() => trackPaymentRedirect(bill.companyName, true)}
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
                        onClick={() => openEditModal(bill)}
                        className="p-2 transition-colors rounded-lg flex-shrink-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Edit Bill"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => fetchInsights(bill)}
                        className="p-2 transition-colors rounded-lg flex-shrink-0 text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                        title="AI Insights"
                      >
                        <Sparkles className="w-4 h-4" />
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
                          onClick={() => openEditModal(bill)}
                          className="p-2 transition-colors rounded-lg flex-shrink-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          title="Edit Bill"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => fetchInsights(bill)}
                          className="p-2 transition-colors rounded-lg flex-shrink-0 text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                          title="AI Insights"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
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

      {!loading && hasMore && (
        <div className="px-4 mt-3">
          <button
            onClick={() => setVisibleCount(prev => prev + BILLS_PER_PAGE)}
            className="w-full py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            Load More ({filteredBills.length - visibleCount} remaining)
          </button>
        </div>
      )}

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
                <p className="text-sm text-slate-500">{markPaidModal.bill.companyName}</p>
                <p className="text-sm text-teal-600 font-medium">
                  ${(markPaidModal.bill.totalAmount - markPaidModal.bill.paidAmount).toFixed(2)} due
                  {' \u2022 '}{formatDueDate(markPaidModal.bill.dueDate)}
                </p>
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

      {/* Edit Bill Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Edit Bill</h3>
                <p className="text-sm text-slate-500">{editModal.bill.companyName}</p>
              </div>
              <button onClick={() => setEditModal(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Biller Name</label>
                <input
                  type="text"
                  value={editModal.companyName}
                  onChange={(e) => setEditModal(prev => prev ? { ...prev, companyName: e.target.value } : null)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Number (optional)</label>
                <input
                  type="text"
                  value={editModal.accountNumber}
                  onChange={(e) => setEditModal(prev => prev ? { ...prev, accountNumber: e.target.value } : null)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={editModal.totalAmount}
                    onChange={(e) => setEditModal(prev => prev ? { ...prev, totalAmount: e.target.value } : null)}
                    onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }}
                    className="w-full pl-7 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={editModal.dueDate}
                  onChange={(e) => setEditModal(prev => prev ? { ...prev, dueDate: e.target.value } : null)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={editModal.notes}
                  onChange={(e) => setEditModal(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  placeholder="e.g. Updated from Enbridge website"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditModal(null)}
                  className="flex-1 py-3 px-4 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditBill}
                  disabled={editLoading}
                  className="flex-1 py-3 px-4 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {editLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Modal */}
      {insightsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">AI Insights</h3>
                  <p className="text-sm text-slate-500">{insightsModal.bill.companyName}</p>
                </div>
              </div>
              <button onClick={() => setInsightsModal(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-5">
              {insightsModal.loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  <p className="text-sm text-slate-500">Analyzing your bills...</p>
                </div>
              )}

              {insightsModal.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {insightsModal.error}
                </div>
              )}

              {insightsModal.data && (
                <div className="space-y-4">
                  {insightsModal.data.source === 'ai' && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700">
                      <Sparkles className="w-3 h-3" /> AI-Powered
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-slate-700 leading-relaxed">{insightsModal.data.summary}</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Trend</h4>
                    <div className="flex items-center gap-2">
                      {insightsModal.data.percentChange !== null && insightsModal.data.percentChange !== undefined && (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          insightsModal.data.percentChange > 5 ? 'bg-red-100 text-red-700' :
                          insightsModal.data.percentChange < -5 ? 'bg-green-100 text-green-700' :
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {insightsModal.data.percentChange > 0 ? <TrendingUp className="w-3 h-3" /> : insightsModal.data.percentChange < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {insightsModal.data.percentChange > 0 ? '+' : ''}{insightsModal.data.percentChange}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-2">{insightsModal.data.trend}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-500 mb-1">Average</p>
                      <p className="text-sm font-semibold text-slate-800">${insightsModal.data.avgAmount?.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-500 mb-1">Lowest</p>
                      <p className="text-sm font-semibold text-green-600">${insightsModal.data.minAmount?.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-500 mb-1">Highest</p>
                      <p className="text-sm font-semibold text-red-600">${insightsModal.data.maxAmount?.toFixed(2)}</p>
                    </div>
                  </div>

                  {insightsModal.data.tips && insightsModal.data.tips.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Tips</h4>
                      <div className="space-y-2">
                        {insightsModal.data.tips.map((tip: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-teal-500 mt-0.5 flex-shrink-0">•</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
