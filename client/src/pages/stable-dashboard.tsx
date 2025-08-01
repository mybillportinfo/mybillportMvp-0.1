import { useEffect, useState } from "react";
import BottomNavigation from "../components/bottom-navigation";
import { Home, CreditCard, Gift, User, LogOut, Zap, Phone, Calendar, AlertCircle, CheckCircle, DollarSign, Plus, Bell } from "lucide-react";
// @ts-ignore
import { auth } from "../../../lib/firebaseConfig.js";
// @ts-ignore
import { logoutUser } from "../../../services/auth.js";

export default function StableDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Sample bill data with clear categories
  const [bills] = useState([
    {
      id: 1,
      type: "utility",
      company: "Electric Company",
      icon: Zap,
      amount: 125.50,
      dueDate: "2025-08-05",
      status: "due_soon",
      category: "Electricity",
      color: "yellow"
    },
    {
      id: 2,
      type: "phone",
      company: "Verizon Wireless",
      icon: Phone,
      amount: 89.99,
      dueDate: "2025-08-08",
      status: "upcoming",
      category: "Mobile",
      color: "blue"
    },
    {
      id: 3,
      type: "credit_card",
      company: "Chase Visa",
      icon: CreditCard,
      amount: 324.75,
      dueDate: "2025-08-12",
      status: "upcoming",
      category: "Credit Card",
      color: "purple"
    },
    {
      id: 4,
      type: "utility",
      company: "Water Department",
      icon: Home,
      amount: 67.25,
      dueDate: "2025-08-15",
      status: "upcoming",
      category: "Water",
      color: "blue"
    },
    {
      id: 5,
      type: "phone",
      company: "Internet Provider",
      icon: Zap,
      amount: 79.99,
      dueDate: "2025-08-18",
      status: "upcoming",
      category: "Internet",
      color: "green"
    }
  ]);

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

  const getTotalByCategory = (type: string) => {
    return bills
      .filter(bill => bill.type === type)
      .reduce((sum, bill) => sum + bill.amount, 0);
  };

  const getCountByCategory = (type: string) => {
    return bills.filter(bill => bill.type === type).length;
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
              <button
                onClick={handleLogout}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Personal Information Display */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Welcome back, John!</h2>
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
            
            <div className="space-y-3">
              {bills.slice(0, 3).map((bill) => (
                <button
                  key={bill.id}
                  onClick={() => window.location.href = `/bill-details/${bill.id}`}
                  className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-${bill.color}-100 rounded-xl flex items-center justify-center`}>
                        <bill.icon className={`w-6 h-6 text-${bill.color}-600`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{bill.company}</h4>
                        <p className="text-sm text-gray-500">{bill.category}</p>
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
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => window.location.href = "/add-bill"}
                className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 py-3 px-4 rounded-xl font-medium hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Bill</span>
              </button>
              <button 
                onClick={() => window.location.href = "/payments"}
                className="flex items-center justify-center space-x-2 bg-green-50 text-green-700 py-3 px-4 rounded-xl font-medium hover:bg-green-100 transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                <span>Pay Bills</span>
              </button>
              <button 
                onClick={() => window.location.href = "/credit-reminders"}
                className="flex items-center justify-center space-x-2 bg-red-50 text-red-700 py-3 px-4 rounded-xl font-medium hover:bg-red-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold">Credit Due</span>
              </button>
              <button 
                onClick={() => window.location.href = "/profile"}
                className="flex items-center justify-center space-x-2 bg-gray-50 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-100 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </>
  );
}