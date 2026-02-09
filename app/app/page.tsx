'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Home, Plus, Settings, Zap, Wifi, CreditCard, Phone, MoreHorizontal, Loader2, Trash2, AlertTriangle, Bell, CheckCircle, Circle, Pencil, X } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { fetchBills, deleteBill, updateBill, fetchNotifications, checkAndCreateDueDateNotifications, Bill } from '../lib/firebase';

const FREE_PLAN_LIMIT = 5;

const billCategories = [
  { id: "hydro", label: "Hydro", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
  { id: "internet", label: "Internet", icon: Wifi, color: "bg-blue-100 text-blue-600" },
  { id: "phone", label: "Phone", icon: Phone, color: "bg-green-100 text-green-600" },
  { id: "subscription", label: "Subscription", icon: CreditCard, color: "bg-purple-100 text-purple-600" },
  { id: "other", label: "Other", icon: MoreHorizontal, color: "bg-gray-100 text-gray-600" },
];

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
  const [togglingPaidId, setTogglingPaidId] = useState<string | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [editForm, setEditForm] = useState({ billName: '', provider: '', amount: '', category: '', dueDate: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

  const handleTogglePaid = async (bill: Bill) => {
    if (!bill.id) return;
    setTogglingPaidId(bill.id);
    try {
      const newPaidStatus = !bill.isPaid;
      await updateBill(bill.id, { isPaid: newPaidStatus });
      setBills(prev => prev.map(b => b.id === bill.id ? { ...b, isPaid: newPaidStatus } : b));
    } catch (err) {
      console.error('Failed to update bill:', err);
      setError('Failed to update bill status.');
    } finally {
      setTogglingPaidId(null);
    }
  };

  const openEditModal = (bill: Bill) => {
    setEditingBill(bill);
    setEditError(null);
    const dueDateStr = new Date(bill.dueDate).toISOString().split('T')[0];
    setEditForm({
      billName: bill.billName,
      provider: bill.provider,
      amount: bill.amount.toString(),
      category: bill.category,
      dueDate: dueDateStr,
    });
  };

  const handleEditSave = async () => {
    if (!editingBill?.id) return;
    setEditError(null);

    if (!editForm.billName.trim()) {
      setEditError('Bill name is required');
      return;
    }
    if (!editForm.amount || parseFloat(editForm.amount) <= 0) {
      setEditError('Amount must be greater than $0');
      return;
    }
    if (!editForm.dueDate) {
      setEditError('Due date is required');
      return;
    }

    setEditSaving(true);
    try {
      const updates = {
        billName: editForm.billName.trim(),
        provider: editForm.provider.trim(),
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        dueDate: new Date(editForm.dueDate + 'T00:00:00'),
      };
      await updateBill(editingBill.id, updates);
      setBills(prev => prev.map(b => b.id === editingBill.id ? { ...b, ...updates } : b));
      setEditingBill(null);
    } catch (err) {
      console.error('Failed to update bill:', err);
      setEditError('Failed to save changes. Please try again.');
    } finally {
      setEditSaving(false);
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

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  const unpaidBills = bills.filter(b => !b.isPaid);
  const dueSoonCount = unpaidBills.filter(b => {
    const days = getDaysUntilDue(b.dueDate);
    return days >= 0 && days <= 3;
  }).length;

  const overdueCount = unpaidBills.filter(b => getDaysUntilDue(b.dueDate) < 0).length;

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
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-white font-semibold text-lg">MyBillPort</span>
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
            const isConfirming = confirmDeleteId === bill.id;
            return (
              <div key={bill.id} className={`bg-white rounded-xl p-4 ${bill.isPaid ? 'opacity-75' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${getIconBg(bill.category)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    {getIcon(bill.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-slate-800 ${bill.isPaid ? 'line-through' : ''}`}>{bill.billName}</p>
                    {bill.provider && (
                      <p className="text-xs text-slate-500 truncate">{bill.provider}</p>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-sm font-medium ${getStatusStyle(bill)}`}>
                        {getStatusText(bill)}
                      </span>
                    </div>
                  </div>
                  <p className={`font-semibold text-slate-800 flex-shrink-0 ${bill.isPaid ? 'line-through' : ''}`}>${bill.amount.toFixed(2)}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePaid(bill)}
                      disabled={togglingPaidId === bill.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        bill.isPaid
                          ? 'bg-green-50 text-green-600 hover:bg-green-100'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {togglingPaidId === bill.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : bill.isPaid ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Circle className="w-3.5 h-3.5" />
                      )}
                      {bill.isPaid ? 'Paid' : 'Mark Paid'}
                    </button>

                    <button
                      onClick={() => openEditModal(bill)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  </div>

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

      {editingBill && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Edit Bill</h2>
              <button onClick={() => setEditingBill(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Bill Name *</label>
                <input
                  type="text"
                  value={editForm.billName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, billName: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
                <input
                  type="text"
                  value={editForm.provider}
                  onChange={(e) => setEditForm(prev => ({ ...prev, provider: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {billCategories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = editForm.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, category: cat.id }))}
                        className={`p-2 rounded-xl flex flex-col items-center transition-all ${
                          isSelected
                            ? "bg-slate-100 border-2 border-teal-500"
                            : "bg-slate-50 border-2 border-transparent hover:border-slate-200"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${cat.color}`}>
                          <Icon className="w-4 h-4" />
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
                  value={editForm.amount}
                  onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                  step="0.01"
                  min="0.01"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingBill(null)}
                  className="flex-1 py-3 rounded-lg font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={editSaving}
                  className="flex-1 btn-accent py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {editSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
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
