'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Plus, Settings, CalendarDays, CheckCircle, X, Loader2, Inbox, AlertCircle, Edit3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getPendingBills,
  approvePendingBill,
  dismissPendingBill,
  addBill,
  type PendingBill,
} from '../lib/firebase';

export default function PendingBillsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bills, setBills] = useState<PendingBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getPendingBills(user.uid)
      .then(setBills)
      .catch(() => setError('Could not load pending bills'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleApprove = async (bill: PendingBill) => {
    if (!user || !bill.id) return;
    setProcessingId(bill.id);
    try {
      await addBill(user.uid, {
        companyName: bill.vendor || 'Unknown',
        totalAmount: bill.amount || 0,
        dueDate: bill.dueDate || '',
        status: 'unpaid' as any,
        category: bill.category || 'miscellaneous',
        accountNumber: bill.accountNumber || '',
        notes: `Imported via email forwarding`,
        providerId: bill.matchedProviderId || null,
      } as any);
      await approvePendingBill(user.uid, bill.id);
      setBills(prev => prev.filter(b => b.id !== bill.id));
    } catch (err: any) {
      setError(err.message || 'Failed to approve bill');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismiss = async (bill: PendingBill) => {
    if (!user || !bill.id) return;
    setProcessingId(bill.id);
    try {
      await dismissPendingBill(user.uid, bill.id);
      setBills(prev => prev.filter(b => b.id !== bill.id));
    } catch {
      setError('Failed to dismiss bill');
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pb-24">
      <div className="px-5 pt-12 pb-4">
        <button onClick={() => router.push('/app')} className="flex items-center text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]">
            <Inbox className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Pending Bills</h1>
            <p className="text-slate-400 text-xs">Review bills detected from forwarded emails</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          </div>
        ) : bills.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-300 font-medium">No pending bills</p>
            <p className="text-slate-500 text-sm">Bills detected from your forwarding email will appear here for review.</p>
            <Link href="/settings?tab=forwarding" className="inline-block text-teal-400 text-sm underline hover:no-underline">
              Set up email forwarding
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm">{bills.length} bill{bills.length !== 1 ? 's' : ''} waiting for review</p>
            {bills.map((bill) => (
              <div key={bill.id} className="bg-white rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800">{bill.vendor || 'Unknown Vendor'}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        (bill.confidence || 0) >= 0.7 ? 'bg-green-100 text-green-700' :
                        (bill.confidence || 0) >= 0.4 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {Math.round((bill.confidence || 0) * 100)}% confidence
                      </span>
                    </div>
                    {bill.emailSubject && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">From: {bill.emailSubject}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5 text-sm">
                      {bill.amount != null && (
                        <span className="font-semibold text-teal-600">${bill.amount.toFixed(2)}</span>
                      )}
                      {bill.dueDate && (
                        <span className="text-slate-500">Due {bill.dueDate}</span>
                      )}
                      {bill.category && (
                        <span className="text-slate-400 capitalize">{bill.category}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(bill)}
                    disabled={processingId === bill.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                  >
                    {processingId === bill.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Add to Bills
                  </button>
                  <button
                    onClick={() => handleDismiss(bill)}
                    disabled={processingId === bill.id}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700 py-3 px-4">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/app" className="nav-item">
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/calendar" className="nav-item">
            <CalendarDays className="w-6 h-6" />
            <span className="text-xs">Calendar</span>
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
