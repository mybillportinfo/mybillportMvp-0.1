'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Search, Loader2, AlertCircle } from 'lucide-react';
import { getPaymentUrl, getGoogleSearchUrl, paymentUrls } from '../lib/paymentUrls';

function PaymentContent() {
  const searchParams = useSearchParams();
  const billerParam = searchParams.get('biller') || '';
  const amountParam = searchParams.get('amount') || '';

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

  const handlePayNow = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleFindPayment = () => {
    const url = getGoogleSearchUrl(selectedBiller);
    window.open(url, '_blank', 'noopener,noreferrer');
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
            <p className="text-teal-400 text-sm mt-1 font-medium">Amount: ${parseFloat(amountParam).toFixed(2)} CAD</p>
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
                <p className="text-slate-500 text-sm mb-6">${parseFloat(amountParam).toFixed(2)} CAD</p>
              )}

              {paymentUrl ? (
                <div className="space-y-3 mt-6">
                  <button
                    onClick={handlePayNow}
                    className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
                  >
                    Pay Now on {selectedBiller} Website
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-slate-400 text-center">
                    Opens in a new tab
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mt-6">
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
                    className="w-full py-4 px-6 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Find Payment Page
                  </button>
                  <p className="text-xs text-slate-400 text-center">
                    Searches Google for &quot;{selectedBiller} pay bill online&quot;
                  </p>
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
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
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
            Need help? Contact <a href="mailto:mybillportinfo@gmail.com" className="text-teal-600 hover:underline">mybillportinfo@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center px-4 py-8">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        </div>
      }>
        <PaymentContent />
      </Suspense>
    </div>
  );
}
