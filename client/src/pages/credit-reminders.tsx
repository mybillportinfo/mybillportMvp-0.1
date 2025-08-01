import React, { useState } from 'react';
import { ArrowLeft, Calendar, CreditCard, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function CreditReminders() {
  const [reminders, setReminders] = useState([
    {
      id: 1,
      type: 'credit_card',
      provider: 'RBC Visa',
      amount: 287.45,
      dueDate: '2025-08-05',
      status: 'upcoming',
      daysUntilDue: 4,
      minimumPayment: 25.00,
      isAutoPay: true
    },
    {
      id: 2,
      type: 'credit_card',
      provider: 'TD Mastercard',
      amount: 156.78,
      dueDate: '2025-08-08',
      status: 'upcoming',
      daysUntilDue: 7,
      minimumPayment: 15.00,
      isAutoPay: false
    },
    {
      id: 3,
      type: 'credit_card',
      provider: 'Canadian Tire Triangle',
      amount: 89.23,
      dueDate: '2025-08-12',
      status: 'upcoming',
      daysUntilDue: 11,
      minimumPayment: 10.00,
      isAutoPay: true
    },
    {
      id: 4,
      type: 'credit_card',
      provider: 'Scotiabank Visa',
      amount: 0.00,
      dueDate: '2025-07-28',
      status: 'paid',
      daysUntilDue: -4,
      minimumPayment: 0.00,
      isAutoPay: true
    }
  ]);

  const [reminderSettings, setReminderSettings] = useState({
    sevenDayReminder: true,
    threeDayReminder: true,
    oneDayReminder: true,
    paymentConfirmation: true,
    overdueAlert: true,
    minimumPaymentOnly: false
  });

  const getStatusColor = (status: string, daysUntilDue: number) => {
    if (status === 'paid') return 'bg-green-50 border-green-200 text-green-800';
    if (daysUntilDue < 0) return 'bg-red-50 border-red-200 text-red-800';
    if (daysUntilDue <= 1) return 'bg-orange-50 border-orange-200 text-orange-800';
    if (daysUntilDue <= 3) return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    return 'bg-blue-50 border-blue-200 text-blue-800';
  };

  const getStatusText = (status: string, daysUntilDue: number) => {
    if (status === 'paid') return 'Paid';
    if (daysUntilDue < 0) return `Overdue by ${Math.abs(daysUntilDue)} days`;
    if (daysUntilDue === 0) return 'Due Today';
    if (daysUntilDue === 1) return 'Due Tomorrow';
    return `Due in ${daysUntilDue} days`;
  };

  const handlePayNow = (reminderId: number) => {
    const reminder = reminders.find(r => r.id === reminderId);
    alert(`Payment initiated for ${reminder?.provider}!\n\nAmount: $${reminder?.amount.toFixed(2)}\nThis will redirect you to secure payment processing.`);
  };

  const handleToggleAutoPay = (reminderId: number) => {
    setReminders(reminders.map(reminder => 
      reminder.id === reminderId 
        ? { ...reminder, isAutoPay: !reminder.isAutoPay }
        : reminder
    ));
  };

  const handleToggleSetting = (setting: string) => {
    setReminderSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleSaveSettings = () => {
    alert("Credit reminder settings saved!\n\nYou'll receive notifications based on your preferences to help you stay on top of your credit card payments.");
  };

  const upcomingReminders = reminders.filter(r => r.status === 'upcoming' && r.daysUntilDue >= 0);
  const overdueReminders = reminders.filter(r => r.daysUntilDue < 0 && r.status !== 'paid');
  const paidReminders = reminders.filter(r => r.status === 'paid');

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
              <h1 className="text-xl font-bold text-gray-800">Credit Due Date Reminders</h1>
              <p className="text-sm text-gray-600">Stay on top of your credit payments</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Overdue Reminders (Priority) */}
          {overdueReminders.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold text-red-800">Overdue Payments</h2>
              </div>
              <div className="space-y-3">
                {overdueReminders.map(reminder => (
                  <div key={reminder.id} className={`p-4 rounded-lg border-2 ${getStatusColor(reminder.status, reminder.daysUntilDue)}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-6 h-6" />
                        <div>
                          <p className="font-medium">{reminder.provider}</p>
                          <p className="text-sm opacity-75">{getStatusText(reminder.status, reminder.daysUntilDue)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${reminder.amount.toFixed(2)}</p>
                        <p className="text-xs opacity-75">Min: ${reminder.minimumPayment.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePayNow(reminder.id)}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
                      >
                        Pay Now
                      </button>
                      <button
                        onClick={() => handleToggleAutoPay(reminder.id)}
                        className="px-4 py-2 border border-red-600 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors"
                      >
                        {reminder.isAutoPay ? 'Disable AutoPay' : 'Enable AutoPay'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Reminders */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Upcoming Payments</h2>
            </div>
            <div className="space-y-3">
              {upcomingReminders.map(reminder => (
                <div key={reminder.id} className={`p-4 rounded-lg border ${getStatusColor(reminder.status, reminder.daysUntilDue)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6" />
                      <div>
                        <p className="font-medium">{reminder.provider}</p>
                        <p className="text-sm opacity-75">{getStatusText(reminder.status, reminder.daysUntilDue)}</p>
                        {reminder.isAutoPay && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                            AutoPay Enabled
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${reminder.amount.toFixed(2)}</p>
                      <p className="text-xs opacity-75">Min: ${reminder.minimumPayment.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePayNow(reminder.id)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Pay Now
                    </button>
                    <button
                      onClick={() => handleToggleAutoPay(reminder.id)}
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm hover:bg-blue-50 transition-colors"
                    >
                      {reminder.isAutoPay ? 'Disable AutoPay' : 'Enable AutoPay'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Paid */}
          {paidReminders.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-800">Recently Paid</h2>
              </div>
              <div className="space-y-3">
                {paidReminders.map(reminder => (
                  <div key={reminder.id} className={`p-4 rounded-lg border ${getStatusColor(reminder.status, reminder.daysUntilDue)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-medium">{reminder.provider}</p>
                          <p className="text-sm text-green-700">Payment Completed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-green-700">$0.00</p>
                        <p className="text-xs text-green-600">Balance Paid</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reminder Settings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h2>
            <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
              {[
                { key: 'sevenDayReminder', label: '7-day advance reminder', desc: 'Get notified a week before due date' },
                { key: 'threeDayReminder', label: '3-day advance reminder', desc: 'Get notified 3 days before due date' },
                { key: 'oneDayReminder', label: '1-day advance reminder', desc: 'Get notified the day before due date' },
                { key: 'paymentConfirmation', label: 'Payment confirmations', desc: 'Receive confirmation when payments are processed' },
                { key: 'overdueAlert', label: 'Overdue alerts', desc: 'Important alerts for overdue payments' },
                { key: 'minimumPaymentOnly', label: 'Minimum payment reminders only', desc: 'Only remind for minimum payment amounts' }
              ].map(setting => (
                <div key={setting.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{setting.label}</p>
                    <p className="text-sm text-gray-600">{setting.desc}</p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting(setting.key)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      reminderSettings[setting.key as keyof typeof reminderSettings]
                        ? 'bg-blue-600'
                        : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        reminderSettings[setting.key as keyof typeof reminderSettings]
                          ? 'translate-x-6'
                          : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleSaveSettings}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-4"
            >
              Save Reminder Settings
            </button>
          </div>

          {/* Summary Stats */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Credit Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  ${upcomingReminders.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Total Due</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {reminders.filter(r => r.isAutoPay).length}
                </p>
                <p className="text-sm text-gray-600">AutoPay Enabled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}