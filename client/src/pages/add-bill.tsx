import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Zap, Wifi, Phone, CreditCard, FileText, Home, Plus, Settings, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const billCategories = [
  { id: "hydro", label: "Hydro", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
  { id: "internet", label: "Internet", icon: Wifi, color: "bg-blue-100 text-blue-600" },
  { id: "phone", label: "Phone", icon: Phone, color: "bg-green-100 text-green-600" },
  { id: "subscription", label: "Subscription", icon: CreditCard, color: "bg-purple-100 text-purple-600" },
  { id: "other", label: "Other", icon: FileText, color: "bg-slate-100 text-slate-600" },
];

export default function AddBill() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [billType, setBillType] = useState<string>("other");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !amount || !dueDay) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const dueDayNum = parseInt(dueDay);
    if (dueDayNum < 1 || dueDayNum > 31) {
      toast({ title: "Invalid due day", description: "Due day must be between 1 and 31", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const today = new Date();
      let dueDate = new Date(today.getFullYear(), today.getMonth(), dueDayNum);
      if (dueDate < today) {
        dueDate = new Date(today.getFullYear(), today.getMonth() + 1, dueDayNum);
      }

      const response = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          company: name.trim(),
          billType,
          amount: parseFloat(amount),
          dueDate: dueDate.toISOString(),
          priority: "medium"
        })
      });

      if (!response.ok) throw new Error("Failed to add bill");

      toast({ title: "Bill added successfully" });
      setLocation("/app");
    } catch {
      toast({ title: "Error", description: "Failed to add bill", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="pt-8 pb-6">
          <Link href="/app">
            <button className="flex items-center text-slate-400 hover:text-white transition-colors mb-6">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          </Link>
          <h1 className="text-2xl font-semibold text-white">Add New Bill</h1>
          <p className="text-slate-400 mt-1">Track a recurring bill payment</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bill Name */}
          <div className="card-premium p-5">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bill Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Toronto Hydro"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Category Selection */}
          <div className="card-premium p-5">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {billCategories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = billType === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setBillType(cat.id)}
                    className={`p-3 rounded-xl flex flex-col items-center transition-all ${
                      isSelected 
                        ? "bg-slate-100 border-2 border-primary" 
                        : "bg-slate-50 border-2 border-transparent hover:border-slate-200"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-1.5 ${cat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-medium ${isSelected ? "text-primary" : "text-slate-600"}`}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount & Due Day */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card-premium p-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount (CAD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="card-premium p-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Due Day
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  placeholder="15"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Day of month (1-31)</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary py-4 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Adding..." : "Add Bill"}
          </button>
        </form>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800">
        <div className="max-w-md mx-auto px-6 py-3 flex justify-around">
          <Link href="/app">
            <button className="nav-item">
              <Home className="w-6 h-6" />
              <span className="text-xs">Home</span>
            </button>
          </Link>
          <Link href="/add-bill">
            <button className="nav-item nav-item-active">
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
