import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Bell, Search, TrendingUp, Calendar, DollarSign, Home, CreditCard, Gift, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// @ts-ignore
import { auth } from "../../../lib/firebaseConfig.js";
// @ts-ignore
import { logoutUser } from "../../../services/auth.js";
// @ts-ignore
import { addBill, getBills, type FirestoreBill } from "../../../services/bills";

export default function EnhancedDashboard() {
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Authentication check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser: any) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Only redirect if we're not already on login/signup pages
        const currentPath = window.location.pathname;
        if (currentPath !== "/login" && currentPath !== "/signup") {
          window.location.href = "/login";
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch bills from Firebase
  const { data: firebaseBills = [], isLoading: isLoadingFirebase } = useQuery({
    queryKey: ["firebase-bills"],
    queryFn: getBills,
    enabled: !!user,
  });

  // Fetch bills from PostgreSQL
  const { data: postgresqlBills = [], isLoading: isLoadingPostgres } = useQuery<any[]>({
    queryKey: ["/api/bills"],
    enabled: !!user,
  });

  // Add bill mutation for Firebase
  const addFirebaseBillMutation = useMutation({
    mutationFn: addBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firebase-bills"] });
      toast({
        title: "Success",
        description: "Bill added to Firebase successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add bill",
        variant: "destructive",
      });
    },
  });

  const handleAddSampleBill = () => {
    const sampleBill: Omit<FirestoreBill, 'id'> = {
      companyName: "Sample Electric Co.",
      amount: 150.75,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      priority: "medium",
      category: "utilities",
      isPaid: false
    };

    addFirebaseBillMutation.mutate(sampleBill);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      window.location.href = "/login";
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const allBills = [...firebaseBills, ...postgresqlBills];
  const isLoading = isLoadingFirebase || isLoadingPostgres;

  return (
    <>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-600">
                <path fill="currentColor" d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1ZM10 6a2 2 0 0 1 4 0v1h-4V6Zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10Z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">MyBillPort</h1>
              <p className="text-blue-100 text-sm">Welcome, {user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Search className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="text-blue-100 hover:text-white text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 pb-20 overflow-y-auto bg-gray-50">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bills</p>
                <p className="text-2xl font-bold text-gray-900">{allBills.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Amount Due</p>
                <p className="text-2xl font-bold text-green-600">
                  ${allBills.reduce((sum, bill) => sum + (bill.amount || 0), 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="bg-blue-600 text-white p-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Bill</span>
          </button>
          <button className="bg-green-600 text-white p-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm hover:bg-green-700 transition-colors">
            <Search className="w-5 h-5" />
            <span className="font-medium">Pay Bills</span>
          </button>
        </div>

        {/* Firebase Integration Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Firebase Integration</h3>
            <button
              onClick={handleAddSampleBill}
              disabled={addFirebaseBillMutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>
                {addFirebaseBillMutation.isPending ? "Adding..." : "Add Sample Bill"}
              </span>
            </button>
          </div>
          
          {firebaseBills.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-3">
                Bills stored in Firebase Firestore ({firebaseBills.length} total):
              </p>
              {firebaseBills.map((bill) => (
                <div key={bill.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{bill.companyName}</h4>
                      <p className="text-sm text-gray-600">
                        Due: {bill.dueDate instanceof Date ? bill.dueDate.toLocaleDateString() : 'No date'}
                      </p>
                      <p className="text-sm text-gray-500">Priority: {bill.priority}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">${bill.amount}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        bill.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {bill.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No Firebase bills yet</p>
              <button
                onClick={handleAddSampleBill}
                disabled={addFirebaseBillMutation.isPending}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {addFirebaseBillMutation.isPending ? "Adding..." : "Add Your First Bill"}
              </button>
            </div>
          )}
        </div>

        {/* Recent Bills from PostgreSQL */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Bills (PostgreSQL)</h3>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-20"></div>
              ))}
            </div>
          ) : postgresqlBills.length > 0 ? (
            <div className="space-y-3">
              {postgresqlBills.slice(0, 5).map((bill: any) => (
                <div key={bill.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{bill.name}</h4>
                      <p className="text-sm text-gray-600">{bill.company}</p>
                      <p className="text-sm text-gray-500">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">${bill.amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        bill.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {bill.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No recent bills</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-md w-full bg-white border-t border-gray-100 shadow-lg">
        <div className="grid grid-cols-4 py-1">
          <button className="flex flex-col items-center py-3 px-4 text-blue-600">
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs font-semibold">Home</span>
          </button>
          <button className="flex flex-col items-center py-3 px-4 text-gray-500 hover:text-blue-600">
            <CreditCard className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Payments</span>
          </button>
          <button className="flex flex-col items-center py-3 px-4 text-gray-500 hover:text-blue-600">
            <Gift className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Rewards</span>
          </button>
          <button className="flex flex-col items-center py-3 px-4 text-gray-500 hover:text-blue-600">
            <User className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </>
  );
}