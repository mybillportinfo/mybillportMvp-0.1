import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";
import BillCard from "@/components/BillCard";
import { Plus, Camera, AlertCircle, Loader2, Zap, Phone, Wifi, CreditCard, Droplets, Home, Building2, Search, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Bill {
  id: string;
  name: string;
  company: string;
  amount: string;
  dueDate: string;
  priority: "urgent" | "medium" | "low";
  icon: string;
  isPaid: number;
  category?: string;
}

function getBillCategory(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('hydro') || n.includes('electric') || n.includes('power')) return 'Electric';
  if (n.includes('gas') || n.includes('enbridge')) return 'Gas';
  if (n.includes('water')) return 'Water';
  if (n.includes('phone') || n.includes('rogers') || n.includes('bell') || n.includes('telus')) return 'Phone';
  if (n.includes('internet') || n.includes('wifi')) return 'Internet';
  if (n.includes('credit') || n.includes('visa') || n.includes('mastercard')) return 'Credit';
  return 'Bill';
}

export default function NoAuthDashboard() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadBills = async () => {
      try {
        const response = await fetch("/api/bills", {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch bills: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (mounted) {
          const unpaidBills = data.filter((bill: Bill) => bill.isPaid === 0);
          setBills(unpaidBills);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load bills");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadBills();
    return () => { mounted = false; };
  }, []);

  const handleDeleteBill = async (billId: string) => {
    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete bill");
      }
      
      setBills(prev => prev.filter(bill => bill.id !== billId));
      toast({
        title: "Bill Deleted",
        description: "The bill has been removed from your list."
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete bill. Please try again.",
        variant: "destructive"
      });
    }
  };

  const totalBalance = bills.reduce((sum, bill) => sum + Number(bill.amount), 0);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Bills</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-teal-600 hover:bg-teal-700 rounded-full px-8"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-6 pt-12 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-teal-600 font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-white">
                MyBill<span className="text-slate-400">Port</span>
              </span>
            </div>
            <Link href="/camera-scan">
              <button className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
                <Camera className="w-5 h-5 text-white" />
              </button>
            </Link>
          </div>
          
          <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
        </div>

        {/* Main Content - White Card Area */}
        <div className="bg-white rounded-t-[2rem] min-h-screen px-4 pt-6 pb-24">
          {/* Total Balance Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <p className="text-gray-600 text-sm mb-1">Total Balance</p>
            <p className="text-4xl font-bold text-gray-900">${totalBalance.toFixed(2)}</p>
          </div>

          {/* Bills List */}
          <div className="space-y-3 mb-6">
            {bills.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bills Yet</h3>
                <p className="text-gray-600 mb-4">Add your first bill to get started</p>
                <Link href="/add-bill">
                  <Button className="bg-teal-600 hover:bg-teal-700 rounded-full px-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Bill
                  </Button>
                </Link>
              </div>
            ) : (
              bills.map(bill => (
                <BillCard
                  key={bill.id}
                  id={bill.id}
                  company={bill.name || bill.company}
                  category={getBillCategory(bill.name || bill.company)}
                  amount={Number(bill.amount)}
                  dueDate={bill.dueDate}
                  status={
                    new Date(bill.dueDate) < new Date() ? 'overdue' :
                    new Date(bill.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'due_soon' : 'upcoming'
                  }
                  onDelete={handleDeleteBill}
                />
              ))
            )}
          </div>

          {/* Pay All Button */}
          {bills.length > 0 && (
            <Link href="/payments">
              <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-full py-6 text-lg font-semibold shadow-lg">
                Pay All
              </Button>
            </Link>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-5 gap-1.5 mt-6">
            <Link href="/add-bill">
              <button className="flex flex-col items-center justify-center space-y-1 bg-teal-50 text-teal-700 py-3 px-1 rounded-xl font-medium hover:bg-teal-100 transition-colors w-full">
                <Plus className="w-5 h-5" />
                <span className="text-[9px]">Add Bill</span>
              </button>
            </Link>
            <Link href="/camera-scan">
              <button className="flex flex-col items-center justify-center space-y-1 bg-slate-100 text-slate-700 py-3 px-1 rounded-xl font-medium hover:bg-slate-200 transition-colors w-full">
                <Camera className="w-5 h-5" />
                <span className="text-[9px]">Scan</span>
              </button>
            </Link>
            <Link href="/plaid">
              <button className="flex flex-col items-center justify-center space-y-1 bg-blue-50 text-blue-700 py-3 px-1 rounded-xl font-medium hover:bg-blue-100 transition-colors w-full">
                <Building2 className="w-5 h-5" />
                <span className="text-[9px]">Bank</span>
              </button>
            </Link>
            <Link href="/auto-detect">
              <button className="flex flex-col items-center justify-center space-y-1 bg-purple-50 text-purple-700 py-3 px-1 rounded-xl font-medium hover:bg-purple-100 transition-colors w-full">
                <Search className="w-5 h-5" />
                <span className="text-[9px]">Auto</span>
              </button>
            </Link>
            <Link href="/email-bills">
              <button className="flex flex-col items-center justify-center space-y-1 bg-orange-50 text-orange-700 py-3 px-1 rounded-xl font-medium hover:bg-orange-100 transition-colors w-full">
                <Mail className="w-5 h-5" />
                <span className="text-[9px]">Email</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
