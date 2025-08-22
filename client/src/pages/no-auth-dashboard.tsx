import { useState, useEffect } from "react";
import { Link } from "wouter";
// @ts-ignore
import PayButton from "../components/PayButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, CheckCircle, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Bill {
  id: string;
  name: string;
  company: string;
  amount: string;
  dueDate: string;
  priority: "urgent" | "medium" | "low";
  icon: string;
  isPaid: number;
}

export default function NoAuthDashboard() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadBills = async () => {
      try {
        console.log("Loading bills from API...");
        
        const response = await fetch("/api/bills", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        console.log("API Response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch bills: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Bills loaded:", data.length, "total bills");
        
        if (mounted) {
          const unpaidBills = data.filter((bill: Bill) => bill.isPaid === 0);
          setBills(unpaidBills);
          setError(null);
        }
      } catch (err) {
        console.error("Error loading bills:", err);
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

    return () => {
      mounted = false;
    };
  }, []);

  // Categorize bills
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in7Days = new Date(startOfToday);
  in7Days.setDate(in7Days.getDate() + 7);

  const overdue = bills.filter(bill => new Date(bill.dueDate) < startOfToday);
  const dueSoon = bills.filter(bill => {
    const dueDate = new Date(bill.dueDate);
    return dueDate >= startOfToday && dueDate <= in7Days;
  });
  const upcoming = bills.filter(bill => new Date(bill.dueDate) > in7Days);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Bills</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-white p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">MyBillPort</h1>
              <p className="text-blue-100">Manage your bills and payments</p>
            </div>
            <Link href="/add-bill">
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                <Plus className="w-4 h-4 mr-2" />
                Add Bill
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{overdue.length}</div>
              <div className="text-blue-100 text-sm">Overdue</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{dueSoon.length}</div>
              <div className="text-blue-100 text-sm">Due Soon</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{upcoming.length}</div>
              <div className="text-blue-100 text-sm">Upcoming</div>
            </div>
          </div>
        </div>

        {/* Bills Sections */}
        {overdue.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                Overdue Bills
                <Badge variant="destructive">{overdue.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overdue.map(bill => (
                  <div key={bill.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{bill.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{bill.name}</h3>
                        <p className="text-sm text-gray-600">{bill.company}</p>
                        <p className="text-xs text-red-600">
                          Due: {new Date(bill.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-lg">${Number(bill.amount).toFixed(2)}</div>
                      </div>
                      <PayButton bill={bill} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {dueSoon.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Calendar className="w-5 h-5" />
                Due Soon (Next 7 Days)
                <Badge className="bg-orange-600">{dueSoon.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dueSoon.map(bill => (
                  <div key={bill.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{bill.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{bill.name}</h3>
                        <p className="text-sm text-gray-600">{bill.company}</p>
                        <p className="text-xs text-orange-600">
                          Due: {new Date(bill.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-lg">${Number(bill.amount).toFixed(2)}</div>
                      </div>
                      <PayButton bill={bill} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {upcoming.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <CheckCircle className="w-5 h-5" />
                Upcoming Bills
                <Badge className="bg-blue-600">{upcoming.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcoming.slice(0, 5).map(bill => (
                  <div key={bill.id} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{bill.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{bill.name}</h3>
                        <p className="text-sm text-gray-600">{bill.company}</p>
                        <p className="text-xs text-blue-600">
                          Due: {new Date(bill.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-lg">${Number(bill.amount).toFixed(2)}</div>
                      </div>
                      <PayButton bill={bill} />
                    </div>
                  </div>
                ))}
                {upcoming.length > 5 && (
                  <p className="text-center text-gray-500 py-2">
                    +{upcoming.length - 5} more upcoming bills
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {bills.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Bills Yet</h2>
              <p className="text-gray-600 mb-6">Get started by adding your first bill</p>
              <Link href="/add-bill">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Bill
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Link href="/payments">
            <Button variant="outline" className="w-full h-12">
              Make Payment
            </Button>
          </Link>
          <Link href="/bills-dashboard">
            <Button variant="outline" className="w-full h-12">
              View All Bills
            </Button>
          </Link>
          <Link href="/add-bill">
            <Button variant="outline" className="w-full h-12">
              Add New Bill
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}