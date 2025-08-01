import { useState } from "react";
import { ArrowLeft, Zap, Phone, CreditCard, Home, Building, Wifi, Car } from "lucide-react";

export default function AddBill() {
  const [billData, setBillData] = useState({
    type: "",
    company: "",
    amount: "",
    dueDate: "",
    category: "",
    accountNumber: ""
  });

  // Canadian service providers and utilities
  const billTypes = {
    utility: {
      name: "Utilities",
      icon: Zap,
      color: "yellow",
      providers: [
        "Hydro One (Ontario)",
        "BC Hydro (British Columbia)", 
        "Epcor (Alberta)",
        "SaskPower (Saskatchewan)",
        "Manitoba Hydro",
        "NB Power (New Brunswick)",
        "Nova Scotia Power",
        "Newfoundland Power",
        "Enmax (Calgary)",
        "ATCO (Alberta)",
        "Union Gas",
        "Enbridge Gas",
        "FortisBC"
      ]
    },
    phone: {
      name: "Phone & Internet",
      icon: Phone,
      color: "blue", 
      providers: [
        "Rogers Wireless",
        "Bell Canada",
        "Telus",
        "Freedom Mobile",
        "Fido",
        "Koodo Mobile",
        "Virgin Mobile",
        "Chatr",
        "Public Mobile",
        "Lucky Mobile",
        "Shaw Internet",
        "Cogeco",
        "Videotron",
        "Eastlink",
        "TekSavvy"
      ]
    },
    credit_card: {
      name: "Credit Cards",
      icon: CreditCard,
      color: "purple",
      providers: [
        "RBC Royal Bank",
        "TD Canada Trust",
        "Bank of Montreal (BMO)",
        "Scotiabank",
        "CIBC",
        "National Bank",
        "Tangerine",
        "MBNA Canada",
        "Capital One Canada",
        "American Express Canada",
        "Canadian Tire Mastercard",
        "PC Financial Mastercard"
      ]
    },
    insurance: {
      name: "Insurance",
      icon: Car,
      color: "green",
      providers: [
        "Intact Insurance",
        "Desjardins Insurance",
        "Aviva Canada",
        "Wawanesa Insurance",
        "Co-operators",
        "State Farm Canada",
        "Allstate Canada",
        "RSA Canada",
        "Economical Insurance",
        "Belairdirect"
      ]
    }
  };

  const handleSave = () => {
    if (!billData.type || !billData.company || !billData.amount || !billData.dueDate) {
      alert("Please fill in all required fields");
      return;
    }

    // Here you would typically save to database
    // For now, we'll just show success and redirect
    alert(`Bill added successfully!\n\nCompany: ${billData.company}\nAmount: $${billData.amount}\nDue Date: ${billData.dueDate}`);
    window.location.href = "/";
  };

  const selectedType = billTypes[billData.type as keyof typeof billTypes];

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
              <h1 className="text-xl font-bold text-gray-800">Add New Bill</h1>
              <p className="text-sm text-gray-600">Add a Canadian bill to track</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Bill Type Selection */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Bill Type</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(billTypes).map(([key, type]) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={key}
                  onClick={() => setBillData({...billData, type: key, company: "", category: type.name})}
                  className={`p-4 rounded-xl border text-center transition-colors ${
                    billData.type === key 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm font-medium">{type.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Company Selection */}
        {billData.type && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Company</h3>
            <select
              value={billData.company}
              onChange={(e) => setBillData({...billData, company: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Choose a Canadian provider...</option>
              {selectedType?.providers.map((provider) => (
                <option key={provider} value={provider}>{provider}</option>
              ))}
              <option value="other">Other (Custom)</option>
            </select>

            {billData.company === "other" && (
              <input
                type="text"
                placeholder="Enter company name"
                value={billData.company}
                onChange={(e) => setBillData({...billData, company: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mt-3"
              />
            )}
          </div>
        )}

        {/* Bill Details */}
        {billData.company && billData.company !== "other" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bill Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Due (CAD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={billData.amount}
                    onChange={(e) => setBillData({...billData, amount: e.target.value})}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={billData.dueDate}
                  onChange={(e) => setBillData({...billData, dueDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number (Optional)</label>
                <input
                  type="text"
                  placeholder="Enter account number"
                  value={billData.accountNumber}
                  onChange={(e) => setBillData({...billData, accountNumber: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {billData.type && billData.company && billData.amount && billData.dueDate && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {selectedType && (
                  <div className={`w-12 h-12 bg-${selectedType.color}-100 rounded-xl flex items-center justify-center`}>
                    <selectedType.icon className={`w-6 h-6 text-${selectedType.color}-600`} />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-800">{billData.company}</h4>
                  <p className="text-sm text-gray-500">{billData.category}</p>
                  <p className="text-xs text-gray-500">Due: {new Date(billData.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">${billData.amount}</p>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">Upcoming</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSave}
            disabled={!billData.type || !billData.company || !billData.amount || !billData.dueDate}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add Bill to Dashboard
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Canadian Info Note */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Canadian Integration:</strong> We support all major Canadian service providers including utilities, telecom, banking, and insurance companies across all provinces.
          </p>
        </div>
      </div>
    </div>
  );
}