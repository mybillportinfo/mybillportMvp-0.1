import { useEffect, useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import BottomNavigation from "../components/bottom-navigation";
import { Home, CreditCard, Gift, User, LogOut, Zap, Phone, Calendar, AlertCircle, CheckCircle, DollarSign, Plus, Bell, Users } from "lucide-react";
// @ts-ignore
import { auth } from "../../../lib/firebaseConfig.js";
// @ts-ignore
import { logoutUser } from "../../../services/auth.js";
import { getBills, type FirestoreBill } from "../../../services/bills";

export default function StableDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Firebase bills data
  const { data: firebaseBills = [], isLoading: billsLoading, error: billsError } = useQuery({
    queryKey: ["firebase-bills", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      return getBills(user.uid);
    },
    enabled: !!user?.uid
  });

  // Helper function to get icon for bill
  const getBillIcon = (billName: string) => {
    const name = billName.toLowerCase();
    if (name.includes('hydro') || name.includes('electric') || name.includes('power')) return Zap;
    if (name.includes('phone') || name.includes('mobile') || name.includes('rogers') || name.includes('bell') || name.includes('telus')) return Phone;
    if (name.includes('credit') || name.includes('visa') || name.includes('mastercard') || name.includes('bank')) return CreditCard;
    return Home; // Default icon
  };

  // Helper function to get bill status
  const getBillStatus = (dueDate: Date, paid: boolean) => {
    if (paid) return 'paid';
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffInDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return 'overdue';
    if (diffInDays <= 3) return 'due_soon';
    return 'upcoming';
  };

  // Convert Firebase bills to display format and sort them
  const bills = useMemo(() => {
    const convertedBills = firebaseBills.map(bill => ({
      id: bill.id,
      company: bill.name,
      icon: getBillIcon(bill.name),
      amount: bill.amount,
      dueDate: bill.dueDate.toISOString().split('T')[0],
      status: getBillStatus(bill.dueDate, bill.paid),
      category: bill.category || 'General',
      color: bill.paid ? 'green' : getBillStatus(bill.dueDate, bill.paid) === 'due_soon' ? 'red' : 'blue',
      accountNumber: bill.accountNumber,
      frequency: bill.frequency,
      leadDays: bill.leadDays,
      paid: bill.paid
    }));

    // Sort unpaid bills by soonest due date first
    return convertedBills.sort((a, b) => {
      // Paid bills go to bottom
      if (a.paid && !b.paid) return 1;
      if (!a.paid && b.paid) return -1;
      
      // For unpaid bills, sort by due date (soonest first)
      if (!a.paid && !b.paid) {
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateA.getTime() - dateB.getTime();
      }
      
      return 0;
    });
  }, [firebaseBills]);

  // Categorize bills for section display
  const categorizedBills = useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const overdue: any[] = [];
    const dueSoon: any[] = [];
    const others: any[] = [];

    bills.filter(bill => !bill.paid).forEach(bill => {
      const dueDate = new Date(bill.dueDate);
      if (dueDate < now) {
        overdue.push(bill);
      } else if (dueDate <= sevenDaysFromNow) {
        dueSoon.push(bill);
      } else {
        others.push(bill);
      }
    });

    return { overdue, dueSoon, others };
  }, [bills]);

  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = auth.onAuthStateChanged((currentUser: any) => {
      if (!mounted) return;
      
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        window.location.href = "/login";
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
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
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTotalByCategory = (category: string) => {
    return bills
      .filter(bill => {
        const name = bill.company.toLowerCase();
        switch (category) {
          case 'utility':
            return name.includes('hydro') || name.includes('electric') || name.includes('power') || 
                   name.includes('water') || name.includes('gas') || name.includes('enbridge');
          case 'phone':
            return name.includes('phone') || name.includes('mobile') || name.includes('rogers') || 
                   name.includes('bell') || name.includes('telus') || name.includes('internet') ||
                   name.includes('wifi');
          case 'credit_card':
            return name.includes('credit') || name.includes('visa') || name.includes('mastercard') || 
                   name.includes('bank') || name.includes('td') || name.includes('rbc') || 
                   name.includes('scotiabank') || name.includes('cibc');
          default:
            return false;
        }
      })
      .reduce((sum, bill) => sum + bill.amount, 0);
  };

  const getCountByCategory = (category: string) => {
    return bills.filter(bill => {
      const name = bill.company.toLowerCase();
      switch (category) {
        case 'utility':
          return name.includes('hydro') || name.includes('electric') || name.includes('power') || 
                 name.includes('water') || name.includes('gas') || name.includes('enbridge');
        case 'phone':
          return name.includes('phone') || name.includes('mobile') || name.includes('rogers') || 
                 name.includes('bell') || name.includes('telus') || name.includes('internet') ||
                 name.includes('wifi');
        case 'credit_card':
          return name.includes('credit') || name.includes('visa') || name.includes('mastercard') || 
                 name.includes('bank') || name.includes('td') || name.includes('rbc') || 
                 name.includes('scotiabank') || name.includes('cibc');
        default:
          return false;
      }
    }).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const dueSoonCount = bills.filter(bill => bill.status === "due_soon").length;

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header with Personal Info */}
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="max-w-md mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm p-1">
                  <img 
                    src="/logo.png" 
                    alt="MyBillPort Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <h1 className="text-xl font-bold">MyBillPort</h1>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.location.href = "/profile"}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Profile"
                  data-testid="button-profile-access"
                >
                  <User className="w-5 h-5" />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Logout"
                  data-testid="button-logout-dashboard"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Personal Information Display */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Welcome back, {user.displayName || 'User'}!</h2>
                  <p className="text-white/80 text-sm">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-white/80">Account Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-md mx-auto p-4">
          {/* Quick Overview Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6 -mt-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">{dueSoonCount}</p>
                <p className="text-sm text-gray-600">Due Soon</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">${totalAmount.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Total Due</p>
              </div>
            </div>
          </div>

          {/* Category Overview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bill Categories</h3>
            <div className="space-y-3">
              {/* Utilities */}
              <button 
                onClick={() => window.location.href = "/add-bill?type=utility"}
                className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Utilities</h4>
                      <p className="text-sm text-gray-500">{getCountByCategory('utility')} bills • Click to add more</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">${getTotalByCategory('utility').toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Electric & Water</p>
                  </div>
                </div>
              </button>

              {/* Phone & Internet */}
              <button 
                onClick={() => window.location.href = "/add-bill?type=phone"}
                className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Phone & Internet</h4>
                      <p className="text-sm text-gray-500">{getCountByCategory('phone')} bills • Click to add more</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">${getTotalByCategory('phone').toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Mobile & Internet</p>
                  </div>
                </div>
              </button>

              {/* Credit Cards */}
              <button 
                onClick={() => window.location.href = "/add-bill?type=credit_card"}
                className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Credit Cards</h4>
                      <p className="text-sm text-gray-500">{getCountByCategory('credit_card')} bills • Click to add more</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">${getTotalByCategory('credit_card').toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Credit Payments</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Upcoming Bills */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Upcoming Bills</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => window.location.href = "/camera-scan"}
                  className="text-green-600 text-sm font-bold hover:text-green-700 flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-bold">**Scan Bill**</span>
                </button>
                <button 
                  onClick={() => window.location.href = "/ai-suggestions"}
                  className="text-purple-600 text-sm font-bold hover:text-purple-700 flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="font-bold">**AI Suggestions**</span>
                </button>
                <button 
                  onClick={() => window.location.href = "/live-chat"}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center space-x-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Chat</span>
                </button>
              </div>
            </div>
            
            {billsLoading && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your bills...</p>
              </div>
            )}

            {billsError && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Bills</h3>
                <p className="text-gray-600 mb-4">There was an issue loading your bills. Please try again.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  data-testid="button-retry-bills"
                >
                  Retry
                </button>
              </div>
            )}

            {!billsLoading && !billsError && bills.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No bills yet</h3>
                <p className="text-gray-600 mb-4">Add your first bill to get started with MyBillPort</p>
                <button 
                  onClick={() => window.location.href = "/add-bill"}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  data-testid="button-add-first-bill-home"
                >
                  Add Your First Bill
                </button>
              </div>
            )}

            <div className="space-y-3">
              {!billsLoading && !billsError && bills.slice(0, 3).map((bill) => {
                const IconComponent = bill.icon;
                return (
                  <button
                    key={bill.id}
                    onClick={() => window.location.href = `/bill-details/${bill.id}`}
                    className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow text-left"
                    data-testid={`bill-preview-${bill.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          bill.paid ? 'bg-green-100' : 
                          bill.status === 'due_soon' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          <IconComponent className={`w-6 h-6 ${
                            bill.paid ? 'text-green-600' : 
                            bill.status === 'due_soon' ? 'text-red-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{bill.company}</h4>
                          <p className="text-sm text-gray-500">
                            {bill.accountNumber && `#${bill.accountNumber} • `}
                            {bill.frequency}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">Due {formatDate(bill.dueDate)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">${bill.amount.toFixed(2)}</p>
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bill.status)}`}>
                          {getStatusIcon(bill.status)}
                          <span className="capitalize">{bill.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/add-bill"
                className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 py-3 px-4 rounded-xl font-medium hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Bill</span>
              </Link>
              <Link 
                href="/payments"
                className="flex items-center justify-center space-x-2 bg-green-50 text-green-700 py-3 px-4 rounded-xl font-medium hover:bg-green-100 transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                <span>Pay Bills</span>
              </Link>
              <Link 
                href="/credit-reminders"
                className="flex items-center justify-center space-x-2 bg-red-50 text-red-700 py-3 px-4 rounded-xl font-medium hover:bg-red-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold">Credit Due</span>
              </Link>
              <Link 
                href="/bill-splitting"
                className="flex items-center justify-center space-x-2 bg-purple-50 text-purple-700 py-3 px-4 rounded-xl font-medium hover:bg-purple-100 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="font-bold">Split Bills</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </>
  );
}