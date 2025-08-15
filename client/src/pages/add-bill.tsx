import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
// @ts-ignore
import { auth } from "../../../lib/firebaseConfig.js";
import { addBill } from "../../../services/bills";

interface BillData {
  name: string;
  accountNumber: string;
  amount: string;
  dueDate: string;
  frequency: string;
  leadDays: number;
}

export default function AddBillFixed() {
  const [user, setUser] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();

  const [billData, setBillData] = useState<BillData>({
    name: "",
    accountNumber: "",
    amount: "",
    dueDate: "",
    frequency: "monthly",
    leadDays: 3
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Common Canadian providers
  const commonProviders = [
    "Rogers", "Bell", "Telus", "Shaw", "Fido", "Koodo", "Virgin Mobile",
    "Hydro One", "Toronto Hydro", "BC Hydro", "Enbridge Gas",
    "Netflix", "Spotify", "Amazon Prime", "TD Canada Trust", 
    "RBC Royal Bank", "Scotiabank", "CIBC"
  ];

  // Add bill mutation
  const addBillMutation = useMutation({
    mutationFn: async (billData: Omit<BillData, 'createdAt'>) => {
      if (!user) throw new Error("User not authenticated");
      return addBill({ ...billData, userId: user.uid });
    },
    onSuccess: (billId) => {
      // Invalidate and refetch bills for this user
      queryClient.invalidateQueries({ queryKey: ["firebase-bills", user?.uid] });
      setShowSuccess(true);
      
      toast({
        title: "Bill Added Successfully",
        description: `${billData.name} has been added to your dashboard!`,
      });
      
      // Auto-close modal after 2.5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        window.history.back();
      }, 2500);
    },
    onError: (error: any) => {
      console.error('Add bill error:', error);
      toast({
        title: "Failed to Add Bill",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser: any) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        window.location.href = "/login";
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (field: keyof BillData, value: string | number) => {
    setBillData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!billData.name.trim()) {
      errors.name = "Provider name is required";
    }

    if (!billData.accountNumber.trim()) {
      errors.accountNumber = "Account number is required";
    }

    if (!billData.amount || parseFloat(billData.amount) <= 0) {
      errors.amount = "Amount must be greater than 0";
    }

    if (!billData.dueDate) {
      errors.dueDate = "Due date is required";
    } else {
      const selectedDate = new Date(billData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.dueDate = "Due date cannot be in the past";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add bills",
        variant: "destructive",
      });
      return;
    }

    try {
      // Submit the bill with proper error handling
      await addBillMutation.mutateAsync({
        name: billData.name,
        accountNumber: billData.accountNumber,
        amount: parseFloat(billData.amount),
        dueDate: new Date(billData.dueDate),
        leadDays: billData.leadDays,
        frequency: billData.frequency,
        paid: false,
        userId: user.uid
      });
    } catch (error) {
      console.error('Error adding bill:', error);
      // Error is already handled by the mutation onError callback
    }
  };

  // Success modal
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bill Added!</h2>
          <p className="text-gray-600 mb-4">
            {billData.name} has been successfully added to your dashboard.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Redirecting you back...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center p-4">
          <button 
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors mr-3"
            data-testid="button-back"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Add New Bill</h1>
            <p className="text-sm text-gray-500">Enter your bill information</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Bill Provider Name */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Bill Provider</h3>
          <div className="space-y-3">
            {/* Common providers dropdown */}
            <select 
              value={billData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-testid="select-provider"
            >
              <option value="">Select a provider...</option>
              {commonProviders.map(provider => (
                <option key={provider} value={provider}>{provider}</option>
              ))}
              <option value="custom">Other (type your own)</option>
            </select>
            
            {/* Custom provider input */}
            {(billData.name === 'custom' || !commonProviders.includes(billData.name)) && billData.name !== '' && (
              <input
                type="text"
                placeholder="Enter provider name"
                value={billData.name === 'custom' ? '' : billData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-testid="input-custom-provider"
              />
            )}
            {validationErrors.name && (
              <p className="text-red-600 text-sm">{validationErrors.name}</p>
            )}
          </div>
        </div>

        {/* Required Fields Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Required Information</h3>
          <div className="space-y-4">
            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number *</label>
              <input
                type="text"
                placeholder="Enter account number"
                value={billData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-testid="input-account-number"
              />
              {validationErrors.accountNumber && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.accountNumber}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={billData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-testid="input-amount"
              />
              {validationErrors.amount && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.amount}</p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
              <input
                type="date"
                value={billData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-testid="input-due-date"
              />
              {validationErrors.dueDate && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.dueDate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Optional Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Optional Settings</h3>
          <div className="space-y-4">
            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
              <select
                value={billData.frequency}
                onChange={(e) => handleInputChange('frequency', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-testid="select-frequency"
              >
                <option value="monthly">Monthly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            {/* Lead Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Days</label>
              <select
                value={billData.leadDays}
                onChange={(e) => handleInputChange('leadDays', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-testid="select-lead-days"
              >
                <option value={1}>1 day before</option>
                <option value={3}>3 days before</option>
                <option value={7}>7 days before</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <button
            onClick={handleSave}
            disabled={addBillMutation.isPending}
            className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-colors ${
              addBillMutation.isPending 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            data-testid="button-save-bill"
          >
            {addBillMutation.isPending ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Adding Bill...
              </div>
            ) : (
              'Save Bill'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}