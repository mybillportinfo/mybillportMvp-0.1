import React, { useState } from 'react';
import { ArrowLeft, Plus, CreditCard, Wallet, Gift, Building, Bitcoin } from 'lucide-react';

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'debit',
      name: 'TD Canada Trust Debit',
      last4: '4532',
      isDefault: true,
      icon: '💳'
    },
    {
      id: 2,
      type: 'credit',
      name: 'RBC Visa Credit Card',
      last4: '8901',
      isDefault: false,
      icon: '💎'
    }
  ]);

  const [showAddMethod, setShowAddMethod] = useState(false);
  const [selectedType, setSelectedType] = useState('');

  const paymentTypes = [
    { id: 'debit', name: 'Debit Card', icon: CreditCard, color: 'bg-blue-50 text-blue-700 border-blue-200', available: true },
    { id: 'credit', name: 'Credit Card', icon: CreditCard, color: 'bg-green-50 text-green-700 border-green-200', available: true },
    { id: 'gift', name: 'Gift Card', icon: Gift, color: 'bg-purple-50 text-purple-700 border-purple-200', available: true },
    { id: 'interac', name: 'Interac e-Transfer', icon: Building, color: 'bg-orange-50 text-orange-700 border-orange-200', available: true },
    { id: 'crypto', name: 'Cryptocurrency', icon: Bitcoin, color: 'bg-yellow-50 text-yellow-700 border-yellow-200', available: false }
  ];

  const handleAddPaymentMethod = (type: string) => {
    if (type === 'crypto') {
      alert("Cryptocurrency payments coming soon!\n\nWe're working on integrating secure crypto payment options including Bitcoin, Ethereum, and other popular cryptocurrencies. This feature will be available in a future update.");
      return;
    }

    setSelectedType(type);
    setShowAddMethod(true);
  };

  const handleSavePaymentMethod = () => {
    const typeInfo = paymentTypes.find(t => t.id === selectedType);
    const newMethod = {
      id: paymentMethods.length + 1,
      type: selectedType,
      name: `New ${typeInfo?.name}`,
      last4: '0000',
      isDefault: false,
      icon: selectedType === 'debit' ? '💳' : selectedType === 'credit' ? '💎' : selectedType === 'gift' ? '🎁' : '🏦'
    };

    setPaymentMethods([...paymentMethods, newMethod]);
    setShowAddMethod(false);
    setSelectedType('');
    
    alert(`${typeInfo?.name} added successfully!\n\nYour new payment method has been securely saved and is ready to use for bill payments.`);
  };

  const handleSetDefault = (id: number) => {
    setPaymentMethods(methods => 
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    alert("Default payment method updated!\n\nThis payment method will now be used for automatic bill payments.");
  };

  const handleRemoveMethod = (id: number) => {
    const method = paymentMethods.find(m => m.id === id);
    if (method?.isDefault) {
      alert("Cannot remove default payment method!\n\nPlease set another payment method as default before removing this one.");
      return;
    }
    
    setPaymentMethods(methods => methods.filter(method => method.id !== id));
    alert("Payment method removed successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="flex items-center space-x-4 p-4">
            <button onClick={() => window.history.back()} className="p-1 text-gray-600 hover:text-blue-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img src="/logo.png" alt="MyBillPort Logo" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Payment Methods</h1>
              <p className="text-sm text-gray-600">Manage your payment options</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Current Payment Methods */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Payment Methods</h2>
            <div className="space-y-3">
              {paymentMethods.map(method => (
                <div key={method.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <p className="font-medium text-gray-800">{method.name}</p>
                        <p className="text-sm text-gray-600">•••• {method.last4}</p>
                        {method.isDefault && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!method.isDefault && (
                        <button
                          onClick={() => handleSetDefault(method.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 border border-blue-600 rounded"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveMethod(method.id)}
                        className="text-xs text-red-600 hover:text-red-700 px-2 py-1 border border-red-600 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Payment Method */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Payment Method</h2>
            <div className="grid grid-cols-1 gap-3">
              {paymentTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleAddPaymentMethod(type.id)}
                  disabled={!type.available}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                    type.available 
                      ? `${type.color} hover:scale-105 transform` 
                      : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <type.icon className="w-6 h-6" />
                    <div className="text-left">
                      <p className="font-medium">{type.name}</p>
                      {!type.available && (
                        <p className="text-xs">Coming Soon</p>
                      )}
                    </div>
                  </div>
                  <Plus className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Payment Security Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-800">Secure Payment Processing</p>
                <p className="text-sm text-blue-700 mt-1">
                  All payment methods are encrypted and securely stored. We use bank-level security to protect your financial information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Payment Method Modal */}
        {showAddMethod && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Add {paymentTypes.find(t => t.id === selectedType)?.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedType === 'gift' ? 'Gift Card Number' : 
                     selectedType === 'interac' ? 'Email Address' : 'Card Number'}
                  </label>
                  <input
                    type={selectedType === 'interac' ? 'email' : 'text'}
                    placeholder={selectedType === 'gift' ? 'Enter gift card number' : 
                               selectedType === 'interac' ? 'Enter email address' : 'Enter card number'}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {selectedType !== 'interac' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {selectedType === 'gift' ? 'PIN' : 'CVV'}
                        </label>
                        <input
                          type="text"
                          placeholder={selectedType === 'gift' ? '1234' : '123'}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedType === 'interac' ? 'Security Question' : 'Cardholder Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={selectedType === 'interac' ? 'Enter security question' : 'Enter name on card'}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddMethod(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePaymentMethod}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Add Method
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}