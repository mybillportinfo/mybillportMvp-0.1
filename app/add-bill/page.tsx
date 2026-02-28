'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Home, Plus, Settings, Loader2, AlertTriangle,
  ChevronDown, X, Search, Camera, ImageIcon, FileText,
  CheckCircle, AlertCircle, Pencil, Sparkles, Receipt, DollarSign
} from "lucide-react";
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import {
  addBill, fetchBills, createBillAddedNotification,
  checkForRecurringProvider, confirmRecurring, Bill, RecurringFrequency,
  getAppCheckToken,
} from '../lib/firebase';
import { CATEGORIES, BILLING_CYCLES, getCategoryByValue, getSubcategory, type MetadataField } from '../lib/categories';
import { resolveProvider } from '../lib/providerRegistry';
import ProviderAutocomplete from '../components/ProviderAutocomplete';
import type { BillExtractionResult } from '../lib/billExtraction';
import { checkForDuplicate, type DuplicateCheckResult } from '../lib/extractionGuards';
import { trackBillCreated, trackBillScanAttempt } from '../lib/analyticsService';
import { trackBillCreation, trackFailedScan } from '../lib/securityMonitor';

const FREE_PLAN_LIMIT = 5;
type AddMethod = 'select' | 'search' | 'scan' | 'review';


export default function AddBillPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [method, setMethod] = useState<AddMethod>('select');
  const [extractedData, setExtractedData] = useState<BillExtractionResult | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateCheckResult | null>(null);
  const [dismissedDuplicate, setDismissedDuplicate] = useState(false);

  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [metadataValues, setMetadataValues] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [billCount, setBillCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);
  const [existingBills, setExistingBills] = useState<Bill[]>([]);
  const [recurringModal, setRecurringModal] = useState<{
    billId: string; billerName: string; frequency: RecurringFrequency; matchCount: number;
  } | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) loadBillCount();
  }, [user]);

  const loadBillCount = async () => {
    if (!user) return;
    setLoadingCount(true);
    try {
      const bills = await fetchBills(user.uid);
      setBillCount(bills.length);
      setExistingBills(bills);
    } catch { setBillCount(null); }
    finally { setLoadingCount(false); }
  };

  const selectedCategory = useMemo(() => getCategoryByValue(category), [category]);
  const selectedSubcategory = useMemo(
    () => category && subcategory ? getSubcategory(category, subcategory) : undefined,
    [category, subcategory]
  );
  const dynamicFields: MetadataField[] = selectedSubcategory?.fields || [];

  const providerList = useMemo(() => {
    if (selectedSubcategory?.providers?.length) return selectedSubcategory.providers;
    if (selectedCategory && !subcategory) {
      const all = selectedCategory.subcategories.flatMap(s => s.providers || []);
      return [...new Set(all)];
    }
    return [];
  }, [selectedCategory, selectedSubcategory, subcategory]);
  const hasProviders = providerList.length > 0;

  const handleCategoryChange = (val: string) => { setCategory(val); setSubcategory(''); setCompanyName(''); setMetadataValues({}); };
  const handleSubcategoryChange = (val: string) => { setSubcategory(val); setCompanyName(''); setMetadataValues({}); };
  const handleMetadataChange = (key: string, value: string) => { setMetadataValues(prev => ({ ...prev, [key]: value })); };
  const isAtLimit = billCount !== null && billCount >= FREE_PLAN_LIMIT;

  const handleFileUpload = async (file: File, uploadMethod: string) => {
    if (isExtracting) return;
    setIsExtracting(true);
    setExtractionError(null);
    setValidationWarnings([]);
    setDuplicateWarning(null);
    setDismissedDuplicate(false);

    try {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setExtractionError('File is too large. Please use a file under 10MB.');
        setIsExtracting(false);
        return;
      }

      const base64 = await fileToBase64(file);
      const isPdf = file.type === 'application/pdf';

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const idToken = await user?.getIdToken();
      if (!idToken) {
        setExtractionError('Please sign in to scan bills.');
        setIsExtracting(false);
        clearTimeout(timeout);
        return;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      };
      const appCheckToken = await getAppCheckToken();
      if (appCheckToken) {
        headers['X-Firebase-AppCheck'] = appCheckToken;
      }

      const response = await fetch('/api/extract-bill', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fileData: base64,
          fileType: isPdf ? 'pdf' : 'image',
          mimeType: file.type,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const result = await response.json();

      if (!result.success) {
        setExtractionError(result.error || 'Failed to extract bill data.');
        trackBillScanAttempt(false, isPdf ? 'pdf' : 'image', result.error || 'unknown');
        trackFailedScan(result.error || 'unknown');
        setIsExtracting(false);
        return;
      }

      trackBillScanAttempt(true, isPdf ? 'pdf' : 'image');

      if (result.validation?.warnings?.length > 0) {
        setValidationWarnings(result.validation.warnings);
      }

      const dupCheck = checkForDuplicate(
        { vendor: result.data.vendor, amount: result.data.amount, dueDate: result.data.dueDate },
        existingBills,
        result.data.matchedProviderId
      );
      if (dupCheck.isDuplicate) {
        setDuplicateWarning(dupCheck);
      }

      setExtractedData(result.data);
      prefillFromExtraction(result.data);
      setMethod('review');
      toast.success('Bill data extracted successfully!');
    } catch (err: any) {
      trackBillScanAttempt(false, file.type === 'application/pdf' ? 'pdf' : 'image', err?.name || 'exception');
      trackFailedScan(err?.name || 'exception');
      if (err?.name === 'AbortError') {
        setExtractionError('Request timed out. Please try again with a smaller file.');
      } else {
        setExtractionError('Failed to process file. Please try again or enter manually.');
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const prefillFromExtraction = (data: BillExtractionResult) => {
    if (data.matchedProviderName) {
      setCompanyName(data.matchedProviderName);
    } else if (data.vendor) {
      setCompanyName(data.vendor);
    }
    if (data.amount) setTotalAmount(data.amount.toString());
    if (data.dueDate) setDueDate(data.dueDate);
    if (data.accountNumber) setAccountNumber(data.accountNumber);
    if (data.category) {
      setCategory(data.category);
      if (data.subcategory) setSubcategory(data.subcategory);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, uploadMethod: string) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, uploadMethod);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSubmitting) return;
    if (!user) { setError('You must be logged in'); return; }
    if (isAtLimit) { setError(`Free plan allows up to ${FREE_PLAN_LIMIT} bills. Upgrade to add more.`); return; }
    if (!category) { setError('Please select a category'); return; }
    if (!companyName.trim()) { setError('Please enter a provider / company name'); return; }
    if (!accountNumber.trim()) { setError('Please enter an account number'); return; }

    const parsedAmount = parseFloat(totalAmount);
    if (!totalAmount || isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than $0'); return;
    }
    if (parsedAmount > 1000000) {
      setError('Amount cannot exceed $1,000,000. Please verify the amount.'); return;
    }

    if (!dueDate) { setError('Please select a due date'); return; }

    const selectedDate = new Date(dueDate + 'T00:00:00');
    if (isNaN(selectedDate.getTime())) { setError('Invalid date format. Please select a valid date.'); return; }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) { setError('Due date must be today or a future date'); return; }
    const twoYearsOut = new Date(today);
    twoYearsOut.setFullYear(today.getFullYear() + 2);
    if (selectedDate > twoYearsOut) { setError('Due date cannot be more than 2 years in the future.'); return; }

    setIsSubmitting(true);
    try {
      const cleanMetadata: Record<string, string | number> = {};
      for (const [key, value] of Object.entries(metadataValues)) {
        if (value.trim()) {
          const field = dynamicFields.find(f => f.key === key);
          cleanMetadata[key] = field?.type === 'number' ? parseFloat(value) || 0 : value.trim();
        }
      }

      const resolved = resolveProvider(companyName.trim());
      const billId = await addBill(user.uid, {
        companyName: companyName.trim(),
        accountNumber: accountNumber.trim(),
        dueDate: selectedDate,
        totalAmount: parseFloat(totalAmount),
        paidAmount: 0,
        status: "unpaid",
        category,
        subcategory: subcategory || undefined,
        billingCycle: billingCycle as any,
        metadata: Object.keys(cleanMetadata).length > 0 ? cleanMetadata : undefined,
        providerId: resolved.providerId,
        providerName: resolved.providerName,
        isCustomProvider: resolved.isCustom || undefined,
      });

      await createBillAddedNotification(user.uid, companyName.trim(), billId).catch(() => {});

      const recurringCheck = checkForRecurringProvider(existingBills, companyName.trim(), resolved.providerId);
      if (recurringCheck.found && recurringCheck.count >= 1) {
        setRecurringModal({ billId, billerName: companyName.trim(), frequency: recurringCheck.frequency || 'monthly', matchCount: recurringCheck.count + 1 });
        setSuccess(true);
        return;
      }

      setSuccess(true);
      const creationMethod = extractedData ? 'scan' : 'manual';
      trackBillCreated(creationMethod, category);
      trackBillCreation();
      toast.success('Bill added successfully!');
      setTimeout(() => router.push('/app'), 1000);
    } catch (err) {
      setError('Failed to add bill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToMethodSelect = () => {
    setMethod('select');
    setExtractedData(null);
    setExtractionError(null);
    setValidationWarnings([]);
    setDuplicateWarning(null);
    setDismissedDuplicate(false);
    setCategory('');
    setSubcategory('');
    setCompanyName('');
    setAccountNumber('');
    setTotalAmount('');
    setDueDate('');
    setBillingCycle('monthly');
    setMetadataValues({});
    setError(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 0.5) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.5) return 'Medium';
    return 'Low';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 pb-24">
      <div className="px-5 pt-12 pb-6">
        <button
          onClick={() => method === 'select' ? router.push('/app') : resetToMethodSelect()}
          className="flex items-center text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {method === 'select' ? 'Back to Dashboard' : 'Back to Add Bill'}
        </button>
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
            <span className="text-white font-bold text-lg tracking-tight">My<span className="text-teal-500">BillPort</span></span>
          </div>
        </div>
        <p className="text-slate-400">
          {method === 'select' ? 'Choose how to add your bill' :
           method === 'review' ? 'Review extracted bill details' :
           'Track a new recurring bill'}
        </p>
      </div>

      <div className="px-4">
        {!loadingCount && billCount !== null && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${
            isAtLimit ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-slate-800/50 border border-slate-700 text-slate-400'
          }`}>
            {isAtLimit && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
            <span>{isAtLimit ? `Free plan allows up to ${FREE_PLAN_LIMIT} bills. Upgrade to add more.` : `${billCount} of ${FREE_PLAN_LIMIT} bills used — Free Plan`}</span>
          </div>
        )}

        {/* Extracting State */}
        {isExtracting && (
          <div className="bg-white rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-teal-600 animate-pulse" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Analyzing Your Bill...</h2>
            <p className="text-slate-500 text-sm">Our AI is reading and extracting bill details. This may take a few seconds.</p>
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
            </div>
          </div>
        )}

        {/* Extraction Error */}
        {extractionError && !isExtracting && (
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Could not extract bill data</p>
                <p className="mt-1">{extractionError}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={resetToMethodSelect} className="flex-1 py-3 px-4 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                Try Again
              </button>
              <button onClick={() => { setExtractionError(null); setMethod('search'); }} className="flex-1 py-3 px-4 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors">
                Enter Manually
              </button>
            </div>
          </div>
        )}

        {/* Method Selection */}
        {method === 'select' && !isExtracting && !extractionError && !success && !isAtLimit && (
          <div className="space-y-3">
            <button
              onClick={() => setMethod('search')}
              className="w-full bg-white rounded-xl p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Search className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">Add Bill Manually</p>
                <p className="text-sm text-slate-500">Enter account info</p>
              </div>
            </button>

            <div className="w-full bg-slate-100 rounded-xl p-5 flex items-center gap-4 opacity-60 cursor-not-allowed">
              <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <Camera className="w-6 h-6 text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-500">Scan or Upload Bill</p>
                </div>
                <p className="text-sm text-slate-400">AI-powered bill scanning</p>
              </div>
              <span className="text-xs bg-slate-200 text-slate-500 px-3 py-1 rounded-full font-medium whitespace-nowrap">Coming Soon</span>
            </div>
          </div>
        )}

        {/* Smart Bill Detected - Review */}
        {method === 'review' && extractedData && !success && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500/15 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-800">Smart Bill Detected</h2>
                  <p className="text-xs text-slate-400">Review and confirm the extracted details</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(extractedData.confidence.overall)}`}>
                  {getConfidenceLabel(extractedData.confidence.overall)} confidence
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
                )}

                {duplicateWarning && duplicateWarning.isDuplicate && !dismissedDuplicate && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Possible duplicate detected</p>
                      <p className="mt-0.5">{duplicateWarning.reason} — you already have a bill for "{duplicateWarning.matchedBillName}".</p>
                    </div>
                    <button type="button" onClick={() => setDismissedDuplicate(true)} className="text-amber-500 hover:text-amber-700 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {validationWarnings.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                    <p className="font-medium mb-1">Please verify:</p>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {validationWarnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                  <div className="relative">
                    <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 appearance-none bg-white">
                      <option value="">Select a category</option>
                      {CATEGORIES.map(cat => (<option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Subcategory */}
                {selectedCategory && selectedCategory.subcategories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <div className="relative">
                      <select value={subcategory} onChange={(e) => handleSubcategoryChange(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 appearance-none bg-white">
                        <option value="">Select type (optional)</option>
                        {selectedCategory.subcategories.map(sub => (<option key={sub.value} value={sub.value}>{sub.label}</option>))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Provider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700">Provider / Company Name *</label>
                    {extractedData.confidence.vendor > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getConfidenceColor(extractedData.confidence.vendor)}`}>
                        {Math.round(extractedData.confidence.vendor * 100)}%
                      </span>
                    )}
                  </div>
                  {hasProviders ? (
                    <ProviderAutocomplete providers={providerList} value={companyName} onChange={setCompanyName} placeholder="Search or type provider name" />
                  ) : (
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Rogers, Netflix, Hydro One" className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800" />
                  )}
                  {extractedData.matchedProviderName && extractedData.matchedProviderName !== companyName && (
                    <p className="text-xs text-teal-600 mt-1">Matched: {extractedData.matchedProviderName}</p>
                  )}
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                  <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Enter your account number" required className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800" />
                </div>

                {/* Dynamic metadata fields */}
                {dynamicFields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{field.label} {field.required && '*'}</label>
                    {field.type === 'select' && field.options ? (
                      <div className="relative">
                        <select value={metadataValues[field.key] || ''} onChange={(e) => handleMetadataChange(field.key, e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 appearance-none bg-white">
                          <option value="">Select...</option>
                          {field.options.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    ) : (
                      <input type={field.type === 'number' ? 'number' : 'text'} value={metadataValues[field.key] || ''} onChange={(e) => handleMetadataChange(field.key, e.target.value)} placeholder={field.placeholder || ''} step={field.type === 'number' ? '0.01' : undefined} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800" />
                    )}
                  </div>
                ))}

                {/* Due Date */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700">Due Date *</label>
                    {extractedData.confidence.dueDate > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getConfidenceColor(extractedData.confidence.dueDate)}`}>
                        {Math.round(extractedData.confidence.dueDate * 100)}%
                      </span>
                    )}
                  </div>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800" />
                </div>

                {/* Amount */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700">Amount (CAD) *</label>
                    {extractedData.confidence.amount > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getConfidenceColor(extractedData.confidence.amount)}`}>
                        {Math.round(extractedData.confidence.amount * 100)}%
                      </span>
                    )}
                  </div>
                  <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }} placeholder="0.00" step="0.01" min="0.01" className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800" />
                </div>

                {/* Billing Cycle */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Billing Cycle</label>
                  <div className="relative">
                    <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 appearance-none bg-white">
                      {BILLING_CYCLES.map(cycle => (<option key={cycle.value} value={cycle.value}>{cycle.label}</option>))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={resetToMethodSelect} className="flex-1 py-3 px-4 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting || loadingCount} className="flex-1 btn-accent py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                    {isSubmitting ? (<><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>) : (<><CheckCircle className="w-5 h-5" /> Confirm Bill</>)}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success State */}
        {success && !recurringModal && (
          <div className="bg-teal-500/10 border border-teal-500/30 text-teal-400 px-4 py-6 rounded-xl text-center">
            <p className="text-lg font-semibold">Bill added successfully!</p>
            <p className="text-sm mt-1">Redirecting to dashboard...</p>
          </div>
        )}

        {/* Bill Limit Reached */}
        {isAtLimit && !success && method === 'select' && (
          <div className="bg-white rounded-xl p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Bill Limit Reached</h2>
            <p className="text-slate-600">Free plan allows up to {FREE_PLAN_LIMIT} bills. Upgrade to add more.</p>
            <Link href="/app" className="inline-block btn-accent px-6 py-3 rounded-lg font-semibold">Go to Dashboard</Link>
          </div>
        )}

        {/* Manual Search Form */}
        {method === 'search' && !success && !isAtLimit && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <div className="relative">
                <select value={category} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 appearance-none bg-white">
                  <option value="">Select a category</option>
                  {CATEGORIES.map(cat => (<option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {selectedCategory && selectedCategory.subcategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <div className="relative">
                  <select value={subcategory} onChange={(e) => handleSubcategoryChange(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 appearance-none bg-white">
                    <option value="">Select type (optional)</option>
                    {selectedCategory.subcategories.map(sub => (<option key={sub.value} value={sub.value}>{sub.label}</option>))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Provider / Company Name *</label>
              {hasProviders ? (
                <ProviderAutocomplete providers={providerList} value={companyName} onChange={setCompanyName} placeholder="Search or type provider name" />
              ) : (
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Rogers, Netflix, Hydro One" className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
              <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Enter your account number" required className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800" />
            </div>

            {dynamicFields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{field.label} {field.required && '*'}</label>
                {field.type === 'select' && field.options ? (
                  <div className="relative">
                    <select value={metadataValues[field.key] || ''} onChange={(e) => handleMetadataChange(field.key, e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 appearance-none bg-white">
                      <option value="">Select...</option>
                      {field.options.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                ) : (
                  <input type={field.type === 'number' ? 'number' : 'text'} value={metadataValues[field.key] || ''} onChange={(e) => handleMetadataChange(field.key, e.target.value)} placeholder={field.placeholder || ''} step={field.type === 'number' ? '0.01' : undefined} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800" />
                )}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date *</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (CAD) *</label>
              <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} onKeyDown={(e) => { if (['-', 'e', 'E', '+'].includes(e.key)) e.preventDefault(); }} placeholder="0.00" step="0.01" min="0.01" className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Billing Cycle</label>
              <div className="relative">
                <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 appearance-none bg-white">
                  {BILLING_CYCLES.map(cycle => (<option key={cycle.value} value={cycle.value}>{cycle.label}</option>))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting || loadingCount} className="w-full btn-accent py-3 rounded-lg font-semibold mt-4 flex items-center justify-center gap-2 disabled:opacity-50">
              {isSubmitting ? (<><Loader2 className="w-5 h-5 animate-spin" /> Adding...</>) : 'Add Bill'}
            </button>
          </form>
        )}
      </div>

      {/* Recurring Modal */}
      {recurringModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Recurring Bill Detected</h3>
                <p className="text-sm text-slate-500">{recurringModal.billerName}</p>
              </div>
              <button onClick={() => { setRecurringModal(null); router.push('/app'); }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <p className="text-3xl mb-2">🔄</p>
                <p className="text-sm text-purple-800">
                  We noticed you have <span className="font-bold">{recurringModal.matchCount} bills</span> for <span className="font-bold">{recurringModal.billerName}</span>.
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  Would you like BillPort to track this as a <span className="font-semibold">{recurringModal.frequency}</span> recurring bill?
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setRecurringModal(null); router.push('/app'); }} className="flex-1 py-3 px-4 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                  Not Now
                </button>
                <button
                  onClick={async () => {
                    if (user && recurringModal) {
                      try {
                        await confirmRecurring(recurringModal.billId, user.uid, recurringModal.frequency);
                        const resolved = resolveProvider(recurringModal.billerName);
                        for (const b of existingBills) {
                          if (!b.id) continue;
                          const matchById = resolved.providerId && b.providerId === resolved.providerId && resolved.providerId !== 'unknown';
                          const matchByName = b.companyName.toLowerCase().trim() === recurringModal.billerName.toLowerCase().trim();
                          if (matchById || matchByName) {
                            await confirmRecurring(b.id, user.uid, recurringModal.frequency).catch(() => {});
                          }
                        }
                      } catch {}
                    }
                    setRecurringModal(null);
                    router.push('/app');
                  }}
                  className="flex-1 py-3 px-4 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
                >
                  Yes, Auto-Track
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700 py-3 px-6">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/app" className="nav-item">
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/add-bill" className="nav-item nav-item-active">
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
