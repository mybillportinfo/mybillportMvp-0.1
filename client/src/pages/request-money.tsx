import { useState, useEffect } from "react";
import { ArrowLeft, DollarSign, Send, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
// @ts-ignore
import { auth } from "../../../lib/firebaseConfig.js";

interface RequestForm {
  toEmail: string;
  toName: string;
  amount: string;
  note: string;
}

export default function RequestMoney() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<RequestForm>({
    toEmail: "",
    toName: "",
    amount: "",
    note: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.toEmail.trim()) {
      newErrors.toEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.toEmail)) {
      newErrors.toEmail = "Please enter a valid email address";
    }

    if (!formData.toName.trim()) {
      newErrors.toName = "Name is required";
    }

    if (!formData.amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.note.trim()) {
      newErrors.note = "Note is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof RequestForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/request-money", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: formData.toEmail,
          name: formData.toName,
          amount: parseFloat(formData.amount),
          note: formData.note,
          fromUser: user.email || "User"
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(true);
        toast({
          title: "Request Sent Successfully",
          description: `Payment request for $${formData.amount} CAD sent to ${formData.toName}`,
        });
        
        // Auto redirect after 3 seconds
        setTimeout(() => {
          window.history.back();
        }, 3000);
      } else {
        throw new Error(result.error || "Failed to send payment request");
      }
    } catch (error: any) {
      console.error('Request money error:', error);
      toast({
        title: "Failed to Send Request",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h2>
          <p className="text-gray-600 mb-4">
            Payment request for ${formData.amount} CAD has been sent to {formData.toName} at {formData.toEmail}
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
            <h1 className="text-xl font-bold text-gray-900">Request Money</h1>
            <p className="text-sm text-gray-500">Send a payment request via email</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Request Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Payment Request</h3>
              <p className="text-sm text-gray-500">Send via Interac e-Transfer request</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          {/* Recipient Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Email *</label>
            <input
              type="email"
              placeholder="recipient@example.com"
              value={formData.toEmail}
              onChange={(e) => handleInputChange('toEmail', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-testid="input-recipient-email"
            />
            {errors.toEmail && (
              <p className="text-red-600 text-sm mt-1">{errors.toEmail}</p>
            )}
          </div>

          {/* Recipient Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Name *</label>
            <input
              type="text"
              placeholder="John Doe"
              value={formData.toName}
              onChange={(e) => handleInputChange('toName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-testid="input-recipient-name"
            />
            {errors.toName && (
              <p className="text-red-600 text-sm mt-1">{errors.toName}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (CAD) *</label>
            <input
              type="number"
              placeholder="0.00"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-testid="input-amount"
            />
            {errors.amount && (
              <p className="text-red-600 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note *</label>
            <textarea
              placeholder="What is this payment for?"
              rows={3}
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              data-testid="input-note"
            />
            {errors.note && (
              <p className="text-red-600 text-sm mt-1">{errors.note}</p>
            )}
          </div>
        </div>

        {/* Send Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-colors flex items-center justify-center ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            data-testid="button-send-request"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sending Request...
              </div>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send Payment Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}