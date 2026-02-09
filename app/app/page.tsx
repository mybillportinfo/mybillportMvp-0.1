'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Home, Plus, Settings, Zap, Wifi, CreditCard, Phone, MoreHorizontal, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { fetchBills, deleteBill, Bill } from '../lib/firebase';

const FREE_PLAN_LIMIT = 5;

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  const loadBills = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const userBills = await fetchBills(user.uid);
      setBills(userBills);
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

  const getIcon = (type: string) => {
    switch (type) {
      case "hydro": return <Zap className="w-5 h-5 text-yellow-600" />;
      case "internet": return <Wifi className="w-5 h-5 text-blue-600" />;
      case "subscription": return <CreditCard className="w-5 h-5 text-purple-600" />;
      case "phone": return <Phone className="w-5 h-5 text-green-600" />;
      default: return <MoreHorizontal className="w-5 h-5 text-gray-600" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case "hydro": return "bg-yellow-100";
      case "internet": return "bg-blue-100";
      case "subscription": return "bg-purple-100";
      case "phone": return "bg-green-100";
      default: return "bg-gray-100";
    }
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusStyle = (daysUntil: number) => {
    if (daysUntil < 0) return "text-red-500";
    if (daysUntil <= 3) return "text-amber-500";
    return "text-teal-600";
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  const dueSoonCount = bills.filter(b => {
    const days = getDaysUntilDue(b.dueDate);
    return days >= 0 && days <= 3;
  }).length;

  const overdueCount = bills.filter(b => getDaysUntilDue(b.dueDate) < 0).length;

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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 gradient-navy rounded-xl flex items-center justify-center border border-slate-600">
            <span className="text-white font-bold">M</span>
          </div>
          <span className="text-white font-semibold text-lg">MyBillPort</span>
        </div>
        <p className="text-slate-400">{greeting()}</p>
        <p className="text-white text-2xl font-semibold">Here&apos;s your overview</p>
      </div>

      <div className="px-4 grid grid-cols-3 gap-3 mb-6">
        <div className="summary-card text-center">
          <p className="text-2xl font-bold text-white">{bills.length}</p>
          <p className="text-xs text-slate-400">Total Bills</p>
        </div>
        <div className="summary-card text-center">
          <p className="text-2xl font-bold text-amber-400">{dueSoonCount}</p>
          <p className="text-xs text-slate-400">Due Soon</p>
        </div>
        <div className="summary-card text-center">
          <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
          <p className="text-xs text-slate-400">Overdue</p>
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
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
            <button onClick={loadBills} className="ml-2 underline hover:no-underline">Retry</button>
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
            const daysUntil = getDaysUntilDue(bill.dueDate);
            const isConfirming = confirmDeleteId === bill.id;
            return (
              <div key={bill.id} className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${getIconBg(bill.billType)} rounded-lg flex items-center justify-center`}>
                    {getIcon(bill.billType)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{bill.providerName}</p>
                    <p className={`text-sm ${getStatusStyle(daysUntil)}`}>
                      {daysUntil < 0
                        ? `${Math.abs(daysUntil)} days overdue`
                        : daysUntil === 0
                          ? "Due today"
                          : `Due in ${daysUntil} days`
                      }
                    </p>
                  </div>
                  <p className="font-semibold text-slate-800">${bill.amount.toFixed(2)}</p>
                  {deletingId === bill.id ? (
                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(isConfirming ? null : bill.id!)}
                      className={`p-2 transition-colors rounded-lg ${isConfirming ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-500'}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {isConfirming && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-red-600">Delete this bill?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
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
