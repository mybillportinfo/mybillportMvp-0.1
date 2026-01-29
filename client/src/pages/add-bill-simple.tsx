import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AddBillSimple() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    billType: "other" as "hydro" | "internet" | "phone" | "subscription" | "other",
    amount: "",
    dueDay: "1"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount || !formData.dueDay) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const today = new Date();
      let dueDate = new Date(today.getFullYear(), today.getMonth(), parseInt(formData.dueDay));
      if (dueDate < today) {
        dueDate = new Date(today.getFullYear(), today.getMonth() + 1, parseInt(formData.dueDay));
      }

      const response = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          company: formData.name,
          amount: formData.amount,
          dueDate: dueDate.toISOString(),
          priority: "medium",
          icon: formData.billType,
          billType: formData.billType,
          userId: "4a30a72b-6c70-4265-90a6-784eca10347c"
        })
      });

      if (!response.ok) throw new Error("Failed to add bill");

      toast({ title: "Bill added successfully" });
      setLocation("/app");
    } catch {
      toast({ title: "Failed to add bill", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 pt-12 pb-8">
          <button onClick={() => setLocation("/app")} className="text-white mb-4 flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <h1 className="text-2xl font-semibold text-white">Add New Bill</h1>
        </div>

        <div className="px-4 -mt-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-5">
            <div>
              <Label htmlFor="name" className="text-gray-700">Bill Name</Label>
              <Input
                id="name"
                placeholder="e.g., Hydro One, Rogers Internet"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="billType" className="text-gray-700">Bill Type</Label>
              <Select
                value={formData.billType}
                onValueChange={v => setFormData(p => ({ ...p, billType: v as typeof formData.billType }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hydro">Hydro / Electric</SelectItem>
                  <SelectItem value="internet">Internet</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount" className="text-gray-700">Amount ($CAD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="dueDay" className="text-gray-700">Due Day (Monthly)</Label>
              <Select
                value={formData.dueDay}
                onValueChange={v => setFormData(p => ({ ...p, dueDay: v }))}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {i + 1}{i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"} of each month
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-base"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add Bill"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
