import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Plus, AlertCircle, Loader2, Zap, Wifi, Phone, CreditCard, FileText, CheckCircle, Calendar, AlertTriangle, Settings, Home, Bell } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Bill {
  id: string;
  name: string;
  amount: string;
  dueDate: string;
  billType: "hydro" | "internet" | "phone" | "subscription" | "other";
  isPaid: number;
}

type BillStatus = "upcoming" | "due-soon" | "overdue";

function getBillStatus(dueDate: string): BillStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "overdue";
  if (diffDays <= 3) return "due-soon";
  return "upcoming";
}

function getDaysUntilDue(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getBillIcon(billType: string) {
  switch (billType) {
    case "hydro": return <Zap className="w-5 h-5" />;
    case "internet": return <Wifi className="w-5 h-5" />;
    case "phone": return <Phone className="w-5 h-5" />;
    case "subscription": return <CreditCard className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function MVPDashboard() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBills = async () => {
    try {
      const response = await fetch("/api/bills");
      if (!response.ok) throw new Error("Failed to fetch bills");
      const data = await response.json();
      setBills(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bills");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const handleMarkPaid = async (billId: string) => {
    try {
      const response = await fetch(`/api/bills/${billId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to mark as paid");
      
      const refreshResponse = await fetch("/api/bills");
      if (refreshResponse.ok) {
        const freshBills = await refreshResponse.json();
        setBills(freshBills);
      }
      toast({ title: "Bill marked as paid" });
    } catch {
      toast({ title: "Error", description: "Failed to update bill", variant: "destructive" });
    }
  };

  const unpaidBills = bills.filter(b => Number(b.isPaid) === 0);
  const paidBills = bills.filter(b => Number(b.isPaid) === 1);
  
  const sortedBills = [...unpaidBills].sort((a, b) => {
    const statusOrder = { overdue: 0, "due-soon": 1, upcoming: 2 };
    const statusA = getBillStatus(a.dueDate);
    const statusB = getBillStatus(b.dueDate);
    return statusOrder[statusA] - statusOrder[statusB];
  });

  const overdueBills = unpaidBills.filter(b => getBillStatus(b.dueDate) === "overdue");
  const dueSoonBills = unpaidBills.filter(b => getBillStatus(b.dueDate) === "due-soon");

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card-premium p-8 text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-slate-900">Unable to Load Bills</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary px-6 py-2">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="pt-12 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-emerald rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-white">MyBillPort</span>
            </div>
            <Link href="/settings">
              <button className="p-2 text-slate-400 hover:text-white transition-colors">
                <Settings className="w-6 h-6" />
              </button>
            </Link>
          </div>
          
          <h1 className="text-2xl font-semibold text-white mb-1">{getGreeting()}</h1>
          <p className="text-slate-400">Here's your bill overview</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="summary-card text-center">
            <div className="w-10 h-10 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-2xl font-bold text-white">{bills.length}</p>
            <p className="text-xs text-slate-400 mt-1">Total Bills</p>
          </div>
          
          <div className="summary-card text-center">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400">{dueSoonBills.length}</p>
            <p className="text-xs text-slate-400 mt-1">Due Soon</p>
          </div>
          
          <div className="summary-card text-center">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{overdueBills.length}</p>
            <p className="text-xs text-slate-400 mt-1">Overdue</p>
          </div>
        </div>

        {/* Bills Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Your Bills</h2>
          <Link href="/add-bill">
            <button className="btn-primary px-4 py-2 text-sm flex items-center">
              <Plus className="w-4 h-4 mr-1.5" /> Add Bill
            </button>
          </Link>
        </div>

        {sortedBills.length === 0 ? (
          <div className="card-premium p-8 text-center">
            <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 text-lg mb-2">All caught up!</h3>
            <p className="text-slate-500 mb-6">No bills pending. Add a new bill to get started.</p>
            <Link href="/add-bill">
              <button className="btn-primary px-6 py-3 w-full">
                <Plus className="w-5 h-5 mr-2 inline" /> Add Your First Bill
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedBills.map(bill => {
              const status = getBillStatus(bill.dueDate);
              const daysUntil = getDaysUntilDue(bill.dueDate);
              
              return (
                <div key={bill.id} className="card-premium p-4 flex items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                    status === "overdue" ? "bg-red-100 text-red-600" :
                    status === "due-soon" ? "bg-amber-100 text-amber-600" :
                    "bg-emerald-100 text-emerald-600"
                  }`}>
                    {getBillIcon(bill.billType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{bill.name}</p>
                    <p className="text-sm text-slate-500">
                      {daysUntil < 0 
                        ? `${Math.abs(daysUntil)} days overdue` 
                        : daysUntil === 0 
                          ? "Due today" 
                          : `Due in ${daysUntil} days`}
                    </p>
                  </div>
                  
                  <div className="text-right mr-3">
                    <p className="font-bold text-slate-900">${Number(bill.amount).toFixed(2)}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      status === "overdue" ? "status-overdue" :
                      status === "due-soon" ? "status-due-soon" :
                      "status-upcoming"
                    }`}>
                      {status === "overdue" ? "Overdue" : status === "due-soon" ? "Due Soon" : "Upcoming"}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleMarkPaid(bill.id)}
                    className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                    title="Mark as paid"
                  >
                    <CheckCircle className="w-6 h-6" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Paid Bills Section */}
        {paidBills.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-4">Paid This Month</h2>
            <div className="space-y-2">
              {paidBills.map(bill => (
                <div key={bill.id} className="card-dark p-4 flex items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center mr-3 text-slate-500">
                    {getBillIcon(bill.billType)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-400">{bill.name}</p>
                  </div>
                  <p className="font-medium text-slate-500">${Number(bill.amount).toFixed(2)}</p>
                  <CheckCircle className="w-5 h-5 text-emerald-500 ml-3" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800">
        <div className="max-w-md mx-auto px-6 py-3 flex justify-around">
          <Link href="/app">
            <button className="nav-item nav-item-active">
              <Home className="w-6 h-6" />
              <span className="text-xs">Home</span>
            </button>
          </Link>
          <Link href="/add-bill">
            <button className="nav-item">
              <Plus className="w-6 h-6" />
              <span className="text-xs">Add Bill</span>
            </button>
          </Link>
          <Link href="/settings">
            <button className="nav-item">
              <Settings className="w-6 h-6" />
              <span className="text-xs">Settings</span>
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
