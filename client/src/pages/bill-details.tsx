import { useState } from "react";
import { useRoute } from "wouter";
import { ArrowLeft, Calendar, DollarSign, Building, Phone, CreditCard, Zap, CheckCircle, AlertCircle, Clock } from "lucide-react";

export default function BillDetails() {
  const [match, params] = useRoute("/bill-details/:id");
  const billId = params?.id;
  // Mock bill data - in real app, this would come from props or API
  const [bill] = useState({
    id: 1,
    type: "phone",
    company: "Rogers Wireless",
    icon: Phone,
    amount: 89.99,
    dueDate: "2025-08-08",
    status: "upcoming",
    category: "Mobile",
    color: "blue",
    accountNumber: "****-****-1234",
    billingPeriod: "July 1 - July 31, 2025",
    lastPayment: "June 8, 2025 - $89.99",
    autoPayEnabled: false,
    paymentHistory: [
      { date: "2025-07-08", amount: 89.99, status: "paid" },
      { date: "2025-06-08", amount: 89.99, status: "paid" },
      { date: "2025-05-08", amount: 92.50, status: "paid" },
      { date: "2025-04-08", amount: 89.99, status: "paid" }
    ]
  });

  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(bill.amount.toString());

  const handlePayNow = () => {
    alert(`Payment of $${paymentAmount} processed successfully!\n\nCompany: ${bill.company}\nTransaction ID: TX${Date.now()}\n\nYour bill has been marked as paid.`);
    setShowPayment(false);
    // In real app, would update bill status and refresh data
  };

  const handleToggleAutoPay = () => {
    alert(`Auto-pay has been ${bill.autoPayEnabled ? 'disabled' : 'enabled'} for ${bill.company}.\n\nYou will receive a confirmation email shortly.`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "due_soon": return "bg-red-100 text-red-700 border-red-200";
      case "upcoming": return "bg-blue-100 text-blue-700 border-blue-200";
      case "paid": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "due_soon": return <AlertCircle className="w-4 h-4" />;
      case "paid": return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => window.history.back()} className="p-1 text-gray-600 hover:text-blue-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img src="/logo.png" alt="MyBillPort Logo" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Bill Details</h1>
              <p className="text-sm text-gray-600">{bill.company}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Bill Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-16 h-16 bg-${bill.color}-100 rounded-2xl flex items-center justify-center`}>
                <bill.icon className={`w-8 h-8 text-${bill.color}-600`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{bill.company}</h2>
                <p className="text-gray-600">{bill.category}</p>
                <p className="text-sm text-gray-500">Account: {bill.accountNumber}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Amount Due:</span>
              <span className="text-2xl font-bold text-gray-800">${bill.amount.toFixed(2)} CAD</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Due Date:</span>
              <div className="text-right">
                <p className="font-semibold text-gray-800">{formatDate(bill.dueDate)}</p>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bill.status)}`}>
                  {getStatusIcon(bill.status)}
                  <span className="capitalize">{bill.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Billing Period:</span>
              <span className="font-medium text-gray-800">{bill.billingPeriod}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowPayment(true)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <DollarSign className="w-5 h-5" />
              <span>Pay Bill Now</span>
            </button>

            <button
              onClick={handleToggleAutoPay}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              {bill.autoPayEnabled ? 'Disable Auto-Pay' : 'Enable Auto-Pay'}
            </button>

            <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Download Statement
            </button>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment History</h3>
          
          <div className="space-y-3">
            {bill.paymentHistory.map((payment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{formatDate(payment.date)}</p>
                    <p className="text-sm text-gray-500">Online Payment</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">${payment.amount.toFixed(2)}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Paid</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Provider:</span>
              <span className="font-medium text-gray-800">{bill.company}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service Type:</span>
              <span className="font-medium text-gray-800">{bill.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Number:</span>
              <span className="font-medium text-gray-800">{bill.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Payment:</span>
              <span className="font-medium text-gray-800">{bill.lastPayment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Auto-Pay:</span>
              <span className={`font-medium ${bill.autoPayEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                {bill.autoPayEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pay Bill</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount (CAD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPayment(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayNow}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}