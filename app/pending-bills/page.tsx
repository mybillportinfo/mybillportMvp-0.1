'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Home, Plus, Settings, Loader2, Check, X, Mail, Inbox,
  DollarSign, Calendar, Building2, Hash, AlertTriangle, CheckCircle,
  RefreshCw, Sparkles, Pencil, Info, TrendingDown, BarChart2,
} from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { addBill } from '../lib/firebase';

interface PendingBill {
  id: string;
  userId: string;
  gmailMessageId: string;
  merchantName: string;
  billerDomain: string | null;
  amount: number | null;
  dueDate: string | null;
  accountNumber: string | null;
  accountNumberDisplay: string | null;
  statementDate: string | null;
  minimumPayment: number | null;
  totalBalance: number | null;
  currency: string;
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number;
  detectionMethod: 'regex' | 'ai' | 'hybrid';
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

interface EditState {
  merchantName: string;
  amount: string;
  dueDate: string;
  accountNumber: string;
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, EditState>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchPendingBills();
  }, [user]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
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
      if (data.error) setError(data.error);
      else setBills(data.bills || []);
    } catch {
      setError('Failed to load pending bills');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (bill: PendingBill) => {
    setEditingId(bill.id);
    setEdits(prev => ({
      ...prev,
      [bill.id]: {
        merchantName: bill.merchantName || '',
        amount: bill.amount !== null ? String(bill.amount) : '',
        dueDate: bill.dueDate || '',
        accountNumber: bill.accountNumber || '',
      },
    }));
  };

  const cancelEdit = () => setEditingId(null);

  const updateEdit = (billId: string, field: keyof EditState, value: string) => {
    setEdits(prev => ({ ...prev, [billId]: { ...prev[billId], [field]: value } }));
  };

  const getBillWithEdits = (bill: PendingBill): PendingBill => {
    const e = edits[bill.id];
    if (!e) return bill;
    return {
      ...bill,
      merchantName: e.merchantName.trim() || bill.merchantName,
      amount: e.amount !== '' ? parseFloat(e.amount) : null,
      dueDate: e.dueDate.trim() || null,
      accountNumber: e.accountNumber.trim() || null,
    };
  };

  const handleConfirm = async (bill: PendingBill) => {
    if (!user) return;
    const finalBill = getBillWithEdits(bill);

    if (!finalBill.amount || finalBill.amount <= 0) {
      setError('Please enter a valid amount before adding this bill.');
      return;
    }
    if (!finalBill.dueDate) {
      setError('Please enter a due date before adding this bill.');
      return;
    }

    setProcessingId(bill.id);
    setError(null);
    try {
      const providerId = finalBill.matchedProviderId || `custom_${finalBill.merchantName.toLowerCase().replace(/\s+/g, '_')}`;
      const providerName = finalBill.matchedProviderName || finalBill.merchantName;
      const isCustomProvider = !finalBill.matchedProviderId;

      await addBill(user.uid, {
        companyName: finalBill.merchantName,
        accountNumber: finalBill.accountNumber || '',
        dueDate: new Date(finalBill.dueDate),
        totalAmount: finalBill.amount,
        paidAmount: 0,
        status: 'unpaid',
        providerId,
        providerName,
        isCustomProvider,
        category: finalBill.category || undefined,
      });

      const token = await user.getIdToken();
      await fetch('/api/gmail/pending', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId: bill.id, action: 'confirm' }),
      });

      setBills(prev => prev.filter(b => b.id !== bill.id));
      setEditingId(null);
      setSuccessMessage(`${finalBill.merchantName} bill added to your dashboard!`);
    } catch (err: any) {
      setError(`Failed to add bill: ${err.message || 'Unknown error'}`);
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
      if (data.error) setError(data.error);
      else {
        setSuccessMessage(data.message);
        await fetchPendingBills();
      }
    } catch {
      setError('Failed to sync Gmail');
    } finally {
      setSyncing(false);
    }
  };

  const confidenceBadge = (bill: PendingBill) => {
    const score = bill.confidenceScore ?? 0;
    const label = bill.confidence;
    if (label === 'high')
      return <span className="px-2 py-0.5 bg-green-900/50 text-green-400 text-xs font-medium rounded-full border border-green-700/50">{score}% confident</span>;
    if (label === 'medium')
      return <span className="px-2 py-0.5 bg-yellow-900/50 text-yellow-400 text-xs font-medium rounded-full border border-yellow-700/50">{score}% — review</span>;
    return <span className="px-2 py-0.5 bg-red-900/50 text-red-400 text-xs font-medium rounded-full border border-red-700/50">{score}% — edit</span>;
  };

  const methodBadge = (method: string) => {
    if (method === 'regex') return <span className="text-xs text-teal-500">regex</span>;
    if (method === 'ai') return <span className="text-xs text-purple-400">AI</span>;
    return <span className="text-xs text-blue-400">hybrid</span>;
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
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <Link href="/settings" className="flex items-center text-slate-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Settings
        </Link>
        <div className="flex items-center justify-between mb-1">
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
            {syncing
              ? <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />
              : <RefreshCw className="w-5 h-5 text-teal-400" />}
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Alerts */}
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

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-3 text-teal-500" />
            <p>Loading pending bills...</p>
          </div>

        /* Empty state */
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">No Pending Bills</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              No new bills found in your Gmail. Tap Scan to search for recent billing emails.
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

        /* Bill list */
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-sm">{bills.length} bill{bills.length !== 1 ? 's' : ''} to review</p>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Sparkles className="w-3 h-3" />
                Tap ✏ to edit any field
              </div>
            </div>

            {bills.map(bill => {
              const isEditing = editingId === bill.id;
              const isExpanded = expandedId === bill.id;
              const e = edits[bill.id];
              const isProcessing = processingId === bill.id;
              const needsEdit = bill.amount === null || !bill.dueDate;

              return (
                <div key={bill.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                  <div className="p-4 space-y-3">

                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-teal-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <input
                              type="text"
                              value={e?.merchantName || ''}
                              onChange={ev => updateEdit(bill.id, 'merchantName', ev.target.value)}
                              className="w-full bg-slate-700 text-white rounded-lg px-3 py-1.5 text-sm font-semibold border border-slate-600 focus:border-teal-500 focus:outline-none"
                              placeholder="Company name"
                            />
                          ) : (
                            <h3 className="text-white font-semibold truncate">{bill.merchantName}</h3>
                          )}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-slate-400 text-xs truncate">{bill.emailSubject || bill.emailFrom}</p>
                            {bill.detectionMethod && methodBadge(bill.detectionMethod)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {confidenceBadge(bill)}
                        <button
                          onClick={() => isEditing ? cancelEdit() : startEdit(bill)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-700 transition-colors"
                          title={isEditing ? 'Cancel edit' : 'Edit fields'}
                        >
                          {isEditing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Missing fields warning */}
                    {needsEdit && !isEditing && (
                      <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-700/30 rounded-lg px-3 py-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <p className="text-amber-400 text-xs">
                          {bill.amount === null && !bill.dueDate
                            ? 'Amount and due date not found — tap ✏ to enter them'
                            : bill.amount === null
                            ? 'Amount not found — tap ✏ to enter it'
                            : 'Due date not found — tap ✏ to enter it'}
                        </p>
                      </div>
                    )}

                    {/* Amount + Due Date */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1.5">
                          <DollarSign className="w-3 h-3" />
                          Amount Due
                        </div>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={e?.amount || ''}
                            onChange={ev => updateEdit(bill.id, 'amount', ev.target.value)}
                            className="w-full bg-slate-700 text-white rounded-lg px-2 py-1.5 text-sm font-semibold border border-slate-600 focus:border-teal-500 focus:outline-none"
                            placeholder="0.00"
                          />
                        ) : (
                          <p className={`font-semibold text-sm ${bill.amount !== null ? 'text-white' : 'text-red-400'}`}>
                            {bill.amount !== null
                              ? `${bill.currency === 'CAD' ? 'CAD' : bill.currency} $${bill.amount.toFixed(2)}`
                              : 'Tap ✏ to add'}
                          </p>
                        )}
                      </div>

                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1.5">
                          <Calendar className="w-3 h-3" />
                          Due Date
                        </div>
                        {isEditing ? (
                          <input
                            type="date"
                            value={e?.dueDate || ''}
                            onChange={ev => updateEdit(bill.id, 'dueDate', ev.target.value)}
                            className="w-full bg-slate-700 text-white rounded-lg px-2 py-1.5 text-sm font-semibold border border-slate-600 focus:border-teal-500 focus:outline-none"
                          />
                        ) : (
                          <p className={`font-semibold text-sm ${bill.dueDate ? 'text-white' : 'text-red-400'}`}>
                            {bill.dueDate || 'Tap ✏ to add'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Account number (editable) */}
                    <div className="bg-slate-900/50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                        <Hash className="w-3 h-3" />
                        Account Number {isEditing ? '(optional)' : ''}
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={e?.accountNumber || ''}
                          onChange={ev => updateEdit(bill.id, 'accountNumber', ev.target.value)}
                          className="w-full bg-slate-700 text-white rounded-lg px-2 py-1.5 text-sm border border-slate-600 focus:border-teal-500 focus:outline-none"
                          placeholder="Account number"
                        />
                      ) : (
                        <p className={`text-sm font-mono ${bill.accountNumber ? 'text-white' : 'text-slate-500'}`}>
                          {bill.accountNumberDisplay || bill.accountNumber || '—'}
                        </p>
                      )}
                    </div>

                    {/* Extra fields (collapsed by default, shown on expand) */}
                    {(bill.minimumPayment || bill.totalBalance || bill.statementDate) && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : bill.id)}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors w-full"
                      >
                        <Info className="w-3 h-3" />
                        {isExpanded ? 'Hide details' : 'Show more details'}
                      </button>
                    )}

                    {isExpanded && (
                      <div className="grid grid-cols-2 gap-2">
                        {bill.minimumPayment !== null && (
                          <div className="bg-slate-900/50 rounded-lg p-2.5">
                            <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                              <TrendingDown className="w-3 h-3" />
                              Min. Payment
                            </div>
                            <p className="text-white text-sm font-semibold">${bill.minimumPayment.toFixed(2)}</p>
                          </div>
                        )}
                        {bill.totalBalance !== null && (
                          <div className="bg-slate-900/50 rounded-lg p-2.5">
                            <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                              <BarChart2 className="w-3 h-3" />
                              Total Balance
                            </div>
                            <p className="text-white text-sm font-semibold">${bill.totalBalance.toFixed(2)}</p>
                          </div>
                        )}
                        {bill.statementDate && (
                          <div className="bg-slate-900/50 rounded-lg p-2.5 col-span-2">
                            <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                              <Calendar className="w-3 h-3" />
                              Statement Date
                            </div>
                            <p className="text-white text-sm">{bill.statementDate}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Email snippet */}
                    {bill.rawEmailSnippet && (
                      <p className="text-slate-500 text-xs line-clamp-2 italic">"{bill.rawEmailSnippet}"</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex border-t border-slate-700/50">
                    <button
                      onClick={() => handleReject(bill)}
                      disabled={isProcessing}
                      className="flex-1 py-3 text-red-400 hover:bg-red-500/10 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                    <div className="w-px bg-slate-700/50" />
                    <button
                      onClick={() => handleConfirm(bill)}
                      disabled={isProcessing}
                      className="flex-1 py-3 text-teal-400 hover:bg-teal-500/10 transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Add to Bills
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Bottom nav */}
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
