'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Plus, Settings, CalendarDays, CheckCircle, X, Loader2, Inbox, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { addBill } from '../lib/firebase';
import { resolveProvider } from '../lib/providerRegistry';

interface PendingBill {
  id: string;
  vendor: string | null;
  amount: number | null;
  dueDate: string | null;
  accountNumber: string | null;
  category: string | null;
  emailSubject: string;
  confidence: number;
  matchedProviderId: string | null;
  matchedProviderName: string | null;
  status: string;
}

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
    loadBills();
  }, [user]);

  const loadBills = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/pending-bills', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setBills(data.bills || []);
    } catch {
      setError('Could not load pending bills');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bill: PendingBill) => {
    if (!user) return;
    setProcessingId(bill.id);
    setError(null);
    try {
      const vendorName = bill.matchedProviderName || bill.vendor || 'Unknown';
      const resolved = resolveProvider(vendorName);
      await addBill(user.uid, {
        companyName: vendorName,
        totalAmount: bill.amount || 0,
        dueDate: bill.dueDate || new Date().toISOString().split('T')[0],
        status: 'unpaid' as any,
        category: bill.category || 'miscellaneous',
        accountNumber: bill.accountNumber || '',
        notes: 'Imported via email forwarding',
        providerId: resolved.providerId,
        providerName: resolved.providerName,
        isCustomProvider: resolved.isCustom || undefined,
      } as any);
      const token = await user.getIdToken();
      await fetch('/api/pending-bills', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId: bill.id, action: 'approve' }),
      });
      setBills(prev => prev.filter(b => b.id !== bill.id));
    } catch (err: any) {
      setError(err.message || 'Failed to approve bill');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismiss = async (bill: PendingBill) => {
    if (!user) return;
    setProcessingId(bill.id);
    try {
      const token = await user.getIdToken();
      await fetch('/api/pending-bills', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId: bill.id, action: 'dismiss' }),
      });
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
        <Loader2 className="w-8 h-8 text-[#4D6A9F] animate-spin" />
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
          <div className="w-10 h-10 bg-[#4D6A9F] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(77,106,159,0.3)]">
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
            <Loader2 className="w-8 h-8 text-[#4D6A9F] animate-spin" />
          </div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-white font-semibold text-lg mb-2">No pending bills</p>
            <p className="text-slate-400 text-sm mb-4">
              Bills detected from your forwarding email will appear here for review.
            </p>
            <Link href="/settings" className="inline-block text-[#4D6A9F] text-sm underline hover:no-underline">
              Set up email forwarding in Settings
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bills.map(bill => (
              <div key={bill.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">
                      {bill.matchedProviderName || bill.vendor || 'Unknown Vendor'}
                    </p>
                    {bill.emailSubject && (
                      <p className="text-slate-400 text-xs truncate mt-0.5">{bill.emailSubject}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold">
                      {bill.amount != null ? `$${bill.amount.toFixed(2)}` : 'Amount unknown'}
                    </p>
                    {bill.dueDate && (
                      <p className="text-slate-400 text-xs mt-0.5">Due {bill.dueDate}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {bill.category && (
                    <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full capitalize">
                      {bill.category}
                    </span>
                  )}
                  {bill.accountNumber && (
                    <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full">
                      Acct: {bill.accountNumber}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full ${bill.confidence >= 0.7 ? 'bg-green-900/40 text-green-400' : 'bg-amber-900/40 text-amber-400'}`}>
                    {Math.round(bill.confidence * 100)}% confidence
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(bill)}
                    disabled={processingId === bill.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#4D6A9F] text-white text-sm font-semibold rounded-lg hover:bg-[#3d5a8f] transition-colors disabled:opacity-50"
                  >
                    {processingId === bill.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Add to Bills
                  </button>
                  <button
                    onClick={() => handleDismiss(bill)}
                    disabled={processingId === bill.id}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-700 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
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
