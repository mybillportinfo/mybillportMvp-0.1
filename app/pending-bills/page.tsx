'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Home, Plus, Settings, Loader2, Check, X, Mail, Inbox,
  DollarSign, Calendar, Building2, Hash, AlertTriangle, CheckCircle,
  RefreshCw, Receipt, Sparkles
} from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { addBill } from '../lib/firebase';
import { PROVIDER_REGISTRY } from '../lib/providerRegistry';

interface PendingBill {
  id: string;
  userId: string;
  gmailMessageId: string;
  merchantName: string;
  amount: number | null;
  dueDate: string | null;
  accountNumber: string | null;
  confidence: 'high' | 'medium' | 'low';
  rawEmailSnippet: string;
  emailSubject: string;
  emailFrom: string;
  emailDate: string;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: number;
  matchedProviderId?: string;
  matchedProviderName?: string;
  category?: string;
}

export default function PendingBillsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bills, setBills] = useState<PendingBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchPendingBills();
  }, [user]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchPendingBills = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/gmail/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setBills(data.bills || []);
      }
    } catch {
      setError('Failed to load pending bills');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bill: PendingBill) => {
    if (!user) return;
    setProcessingId(bill.id);
    try {
      const providerId = bill.matchedProviderId || `custom_${bill.merchantName.toLowerCase().replace(/\s+/g, '_')}`;
      const providerName = bill.matchedProviderName || bill.merchantName;
      const isCustomProvider = !bill.matchedProviderId;

      await addBill(user.uid, {
        companyName: bill.merchantName,
        accountNumber: bill.accountNumber || '',
        dueDate: bill.dueDate ? new Date(bill.dueDate) : new Date(),
        totalAmount: bill.amount || 0,
        paidAmount: 0,
        status: 'unpaid',
        providerId,
        providerName,
        isCustomProvider,
        category: bill.category || undefined,
      });

      const token = await user.getIdToken();
      await fetch('/api/gmail/pending', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ billId: bill.id, action: 'confirm' }),
      });

      setBills(prev => prev.filter(b => b.id !== bill.id));
      setSuccessMessage(`${bill.merchantName} bill added to your dashboard!`);
    } catch (err: any) {
      setError(`Failed to add ${bill.merchantName}: ${err.message || 'Unknown error'}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (bill: PendingBill) => {
    if (!user) return;
    setProcessingId(bill.id);
    try {
      const token = await user.getIdToken();
      await fetch('/api/gmail/pending', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ billId: bill.id, action: 'reject' }),
      });

      setBills(prev => prev.filter(b => b.id !== bill.id));
    } catch {
      setError('Failed to reject bill');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/gmail/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSuccessMessage(data.message);
        await fetchPendingBills();
      }
    } catch {
      setError('Failed to sync Gmail');
    } finally {
      setSyncing(false);
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">High confidence</span>;
      case 'medium':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Medium confidence</span>;
      case 'low':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">Low confidence</span>;
      default:
        return null;
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pb-24">
      <div className="px-5 pt-12 pb-6">
        <Link href="/settings" className="flex items-center text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Settings
        </Link>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]">
              <Inbox className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Pending Bills</h1>
              <p className="text-slate-400 text-sm">Bills found in your Gmail</p>
            </div>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="p-2.5 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50"
            title="Scan Gmail for new bills"
          >
            {syncing ? <Loader2 className="w-5 h-5 text-teal-400 animate-spin" /> : <RefreshCw className="w-5 h-5 text-teal-400" />}
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {successMessage && (
          <div className="bg-teal-500/10 border border-teal-500/30 text-teal-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-3 text-teal-500" />
            <p>Loading pending bills...</p>
          </div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">No Pending Bills</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              No new bills found in your Gmail. Click the refresh button to scan for recent bill emails.
            </p>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {syncing ? 'Scanning...' : 'Scan Gmail'}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-sm">
                {bills.length} bill{bills.length > 1 ? 's' : ''} found
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Sparkles className="w-3 h-3" />
                AI-extracted
              </div>
            </div>

            {bills.map(bill => (
              <div key={bill.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{bill.merchantName}</h3>
                        <p className="text-slate-400 text-xs">{bill.emailSubject}</p>
                      </div>
                    </div>
                    {getConfidenceBadge(bill.confidence)}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                        <DollarSign className="w-3 h-3" />
                        Amount
                      </div>
                      <p className="text-white font-semibold">
                        {bill.amount !== null ? `$${bill.amount.toFixed(2)}` : 'Not found'}
                      </p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                        <Calendar className="w-3 h-3" />
                        Due Date
                      </div>
                      <p className="text-white font-semibold">
                        {bill.dueDate || 'Not found'}
                      </p>
                    </div>
                  </div>

                  {bill.accountNumber && (
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Hash className="w-3.5 h-3.5" />
                      Account: {bill.accountNumber}
                    </div>
                  )}

                  {bill.matchedProviderName && (
                    <div className="flex items-center gap-2 text-teal-400 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      Matched: {bill.matchedProviderName}
                    </div>
                  )}

                  <p className="text-slate-500 text-xs line-clamp-2">{bill.rawEmailSnippet}</p>
                </div>

                <div className="flex border-t border-slate-700/50">
                  <button
                    onClick={() => handleReject(bill)}
                    disabled={processingId === bill.id}
                    className="flex-1 py-3 text-red-400 hover:bg-red-500/10 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                  <div className="w-px bg-slate-700/50" />
                  <button
                    onClick={() => handleConfirm(bill)}
                    disabled={processingId === bill.id || bill.amount === null}
                    className="flex-1 py-3 text-teal-400 hover:bg-teal-500/10 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processingId === bill.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Add to Bills
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700 py-3 px-6">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/app" className="nav-item">
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
