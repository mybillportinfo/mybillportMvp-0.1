'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Search, Loader2, AlertCircle, Fingerprint, ShieldCheck, CreditCard, Mail, Copy, Check, Lock, AlertTriangle, X } from 'lucide-react';
import { getPaymentUrl, getGoogleSearchUrl, paymentUrls } from '../lib/paymentUrls';
import { useAuth } from '../contexts/AuthContext';
import { useBiometricPayment } from '../hooks/useBiometricPayment';
import { useData } from '../contexts/DataContext';

function PaymentContent() {
  const searchParams = useSearchParams();
  const billerParam = searchParams.get('biller') || '';
  const amountParam = searchParams.get('amount') || '';
  const { user } = useAuth();
  const { profile } = useData();
  const { authenticate, verifying, error: biometricError } = useBiometricPayment();
  const [biometricVerified, setBiometricVerified] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState('');

  const [interacCopied, setInteracCopied] = useState(false);
  const [showInteracSheet, setShowInteracSheet] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [stripeEnabled, setStripeEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/payment-config')
      .then(r => r.json())
      .then(d => setStripeEnabled(!!d.stripeEnabled))
      .catch(() => setStripeEnabled(false));
  }, []);

  const dueDateParam = searchParams.get('dueDate') || '';
  const daysUntilDue = dueDateParam
    ? Math.ceil((new Date(dueDateParam).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const isDueSoon = daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0;
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

  const [selectedBiller, setSelectedBiller] = useState(billerParam);
  const [searchInput, setSearchInput] = useState('');
  const [filteredBillers, setFilteredBillers] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const allBillerNames = [...new Set(Object.keys(paymentUrls))].sort();

  useEffect(() => {
    if (billerParam) {
      setSelectedBiller(billerParam);
    }
  }, [billerParam]);

  useEffect(() => {
    if (searchInput.trim().length > 0) {
      const lower = searchInput.toLowerCase();
      const matches = allBillerNames.filter(name =>
        name.toLowerCase().includes(lower)
      );
      setFilteredBillers(matches.slice(0, 8));
      setShowDropdown(true);
    } else {
      setFilteredBillers([]);
      setShowDropdown(false);
    }
  }, [searchInput]);

  const paymentUrl = selectedBiller ? getPaymentUrl(selectedBiller) : null;

  const handleSelectBiller = (name: string) => {
    setSelectedBiller(name);
    setSearchInput('');
    setShowDropdown(false);
  };

  const biometricRequired = profile?.biometricEnabled === true;

  const handlePayNow = async () => {
    if (!paymentUrl) return;
    if (biometricRequired && !biometricVerified) {
      const ok = await authenticate();
      if (!ok) return;
      setBiometricVerified(true);
    }
    window.open(paymentUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFindPayment = async () => {
    if (biometricRequired && !biometricVerified) {
      const ok = await authenticate();
      if (!ok) return;
      setBiometricVerified(true);
    }
    const url = getGoogleSearchUrl(selectedBiller);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const interacRef = `${selectedBiller.replace(/\s+/g, '-').toUpperCase().slice(0, 10)}-${Date.now().toString().slice(-6)}`;

  const copyField = (text: string, field: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleInterac = () => {
    setShowInteracSheet(true);
  };

  const handleCopyInteracDetails = () => {
    if (!amountParam || !selectedBiller) return;
    const details = `Bill: ${selectedBiller}\nAmount: $${parseFloat(amountParam).toFixed(2)} CAD${dueDateParam ? `\nDue: ${dueDateParam}` : ''}\nReference: ${interacRef}`;
    navigator.clipboard.writeText(details).catch(() => {});
    setInteracCopied(true);
    setTimeout(() => setInteracCopied(false), 2500);
  };

  const handleStripePayment = async () => {
    if (!amountParam || !selectedBiller || !user) return;
    setStripeLoading(true);
    setStripeError('');
    try {
      const token = await user.getIdToken();
      const billId = searchParams.get('billId') || '';
      const res = await fetch('/api/create-payment-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: amountParam, billerName: selectedBiller, billId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setStripeError(data.error || 'Failed to start payment. Please try again.');
      }
    } catch {
      setStripeError('Network error. Please try again.');
    } finally {
      setStripeLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-slate-800 px-6 py-5">
          <Link href="/app" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors mb-3">
            <ArrowLeft className="w-4 h-4" />
            Back to Bills
          </Link>
          <h1 className="text-xl font-bold text-white">Pay Your Bill</h1>
          {amountParam && (
            <p className="text-[#4D6A9F] text-sm mt-1 font-medium">Amount: ${parseFloat(amountParam).toFixed(2)} CAD</p>
          )}
        </div>

        <div className="p-6">
          {selectedBiller ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-slate-600">
                  {selectedBiller.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">{selectedBiller}</h2>
              {amountParam && (
                <p className="text-slate-500 text-sm mb-3">${parseFloat(amountParam).toFixed(2)} CAD</p>
              )}

              {/* Urgency message */}
              {amountParam && (isDueSoon || isOverdue) && (
                <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg mb-3 text-left ${isOverdue ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'}`}>
                  <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isOverdue ? 'text-red-500' : 'text-orange-500'}`} />
                  <div>
                    <p className={`text-xs font-semibold ${isOverdue ? 'text-red-700' : 'text-orange-700'}`}>
                      {isOverdue ? 'Bill overdue — pay now to avoid late fees' : `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} — pay now to stay on track`}
                    </p>
                    <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-500' : 'text-orange-500'}`}>
                      ${parseFloat(amountParam).toFixed(2)} CAD{dueDateParam ? ` · Due ${dueDateParam}` : ''}
                    </p>
                  </div>
                </div>
              )}

              {/* Trust signals */}
              <div className="flex items-center justify-center gap-3 mb-4 px-3 py-2 bg-slate-50 rounded-lg">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">Secure payments · Powered by Stripe · PCI Compliant</span>
              </div>

              {biometricRequired && (
                <div className={`flex items-center gap-2 mt-4 mb-2 p-3 rounded-lg text-sm ${biometricVerified ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-600'}`}>
                  {biometricVerified ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      <span>Identity verified</span>
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-4 h-4 text-slate-400" />
                      <span>Biometric verification required to pay</span>
                    </>
                  )}
                </div>
              )}

              {biometricError && (
                <p className="text-xs text-red-500 text-center mt-2">{biometricError}</p>
              )}

              {paymentUrl ? (
                <div className="space-y-3 mt-4">
                  <button
                    onClick={handlePayNow}
                    disabled={verifying}
                    className="w-full py-4 px-6 bg-[#4D6A9F] hover:bg-[#3d5a8f] disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        {biometricRequired && !biometricVerified && <Fingerprint className="w-4 h-4" />}
                        Pay Now on {selectedBiller} Website
                        <ExternalLink className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-xs text-slate-400 text-center">
                    {biometricRequired && !biometricVerified ? 'Tap to verify your identity and pay' : 'Opens in a new tab'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700">
                        We don&apos;t have a direct payment link for this biller yet. You can search for their payment page below.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleFindPayment}
                    disabled={verifying}
                    className="w-full py-4 px-6 bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Find Payment Page
                      </>
                    )}
                  </button>
                  <p className="text-xs text-slate-400 text-center">
                    Searches Google for &quot;{selectedBiller} pay bill online&quot;
                  </p>
                </div>
              )}

            {/* Additional payment options — shown when amount is available */}
            {amountParam && (
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                <p className="text-xs text-slate-400 uppercase font-medium mb-3">More Ways to Pay</p>

                {/* Stripe card payment — shown only when configured */}
                {stripeEnabled === true && (
                  <>
                    <button
                      onClick={handleStripePayment}
                      disabled={stripeLoading || !user}
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      {stripeLoading
                        ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</>
                        : <><CreditCard className="w-4 h-4" />Pay ${parseFloat(amountParam).toFixed(2)} with Card</>
                      }
                    </button>
                    {stripeError && (
                      <p className="text-xs text-red-500 text-center">{stripeError}</p>
                    )}
                  </>
                )}

                {/* Interac e-Transfer */}
                <button
                  onClick={handleInterac}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Mail className="w-4 h-4" />
                  Send Interac e-Transfer Request
                </button>
              </div>
            )}

          </div>
          ) : (
            <div>
              <p className="text-slate-500 text-sm mb-4">Select your biller to go to their payment page:</p>

              <div className="relative mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onFocus={() => {
                      if (searchInput.trim().length > 0) setShowDropdown(true);
                    }}
                    placeholder="Search for a biller..."
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4D6A9F] focus:border-transparent"
                  />
                </div>

                {showDropdown && filteredBillers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                    {filteredBillers.map((name) => (
                      <button
                        key={name}
                        onClick={() => handleSelectBiller(name)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 text-sm border-b border-slate-100 last:border-b-0 transition-colors"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}

                {showDropdown && searchInput.trim().length > 0 && filteredBillers.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 p-4">
                    <p className="text-sm text-slate-500 mb-2">No matching biller found</p>
                    <button
                      onClick={() => handleSelectBiller(searchInput.trim())}
                      className="text-sm text-[#4D6A9F] hover:text-[#3d5a8f] font-medium"
                    >
                      Use &quot;{searchInput.trim()}&quot; anyway
                    </button>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-400 uppercase font-medium mb-3">Popular Billers</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Rogers', 'Bell', 'Telus', 'Toronto Hydro', 'Hydro One', 'Enbridge', 'BC Hydro', 'Fido'].map(name => (
                    <button
                      key={name}
                      onClick={() => handleSelectBiller(name)}
                      className="text-left px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm text-slate-700 font-medium transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">
            Need help? Contact <a href="mailto:mybillportinfo@gmail.com" className="text-[#4D6A9F] hover:underline">mybillportinfo@gmail.com</a>
          </p>
        </div>
      </div>

      {/* Interac e-Transfer bottom sheet */}
      {showInteracSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowInteracSheet(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white w-full max-w-md rounded-t-2xl p-6 pb-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-5" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Interac e-Transfer</h3>
              <button onClick={() => setShowInteracSheet(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment details card */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5">
              <div className="space-y-3">
                {[
                  { label: 'Biller', value: selectedBiller, field: 'biller' },
                  { label: 'Amount', value: `$${parseFloat(amountParam).toFixed(2)} CAD`, field: 'amount', bold: true },
                  ...(dueDateParam ? [{ label: 'Due', value: dueDateParam, field: 'due' }] : []),
                  { label: 'Reference', value: interacRef, field: 'ref', mono: true },
                ].map(({ label, value, field, bold, mono }) => (
                  <div key={field} className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 w-20 flex-shrink-0">{label}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-sm text-right truncate ${bold ? 'font-bold text-emerald-700' : mono ? 'font-mono text-slate-700' : 'font-semibold text-slate-800'}`}>
                        {value}
                      </span>
                      <button
                        onClick={() => copyField(value, field)}
                        className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 rounded-lg flex-shrink-0 transition-colors"
                      >
                        {copiedField === field ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              {/* Email request button — opens mail app with pre-filled details */}
              <a
                href={`mailto:?subject=${encodeURIComponent(`Interac e-Transfer Request — ${selectedBiller} $${parseFloat(amountParam).toFixed(2)}`)}&body=${encodeURIComponent(
                  `Hi,\n\nPlease send an Interac e-Transfer for the following bill:\n\n` +
                  `Biller: ${selectedBiller}\n` +
                  `Amount: $${parseFloat(amountParam).toFixed(2)} CAD\n` +
                  (dueDateParam ? `Due Date: ${dueDateParam}\n` : '') +
                  `Reference / Message: ${interacRef}\n\n` +
                  `Steps:\n1. Open your banking app\n2. Go to Interac e-Transfer → Send Money\n3. Enter the amount and reference above\n4. Submit — funds arrive within 30 min–24h\n\nThank you!`
                )}`}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                onClick={() => setShowInteracSheet(false)}
              >
                <Mail className="w-4 h-4" />
                Send Payment Request by Email
              </a>

              <button
                onClick={handleCopyInteracDetails}
                className="w-full py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {interacCopied
                  ? <><Check className="w-4 h-4 text-emerald-600" /> All Details Copied!</>
                  : <><Copy className="w-4 h-4" /> Copy All Details</>
                }
              </button>

              <p className="text-xs text-slate-400 text-center pt-1">
                Open your banking app → Interac e-Transfer → Send Money
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4 py-8">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#4D6A9F] animate-spin" />
        </div>
      }>
        <PaymentContent />
      </Suspense>
    </div>
  );
}
