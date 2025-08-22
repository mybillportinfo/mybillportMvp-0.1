import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
// @ts-ignore
import PayButton from "../components/PayButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, CheckCircle, Plus } from "lucide-react";
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

export default function FastDashboard() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Single API call with local state management
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await fetch("/api/bills");
        const data = await response.json();
        setBills(data.filter((bill: Bill) => bill.isPaid === 0)); // Only unpaid bills
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch bills:", error);
        setIsLoading(false);
      }
    };

    fetchBills();
    
    // Refresh every 2 minutes (less frequent than the hook version)
    const interval = setInterval(fetchBills, 120000);
    return () => clearInterval(interval);
  }, []);

  // Optimized categorization with useMemo
  const { overdue, dueSoon, others, stats } = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const in7 = new Date(startOfToday);
    in7.setDate(in7.getDate() + 7);

    const categories = {
      overdue: [] as Bill[],
      dueSoon: [] as Bill[],
      others: [] as Bill[]
    };

    bills.forEach(bill => {
      const dueDate = new Date(bill.dueDate);
      if (dueDate < startOfToday) {
        categories.overdue.push(bill);
      } else if (dueDate <= in7) {
        categories.dueSoon.push(bill);
      } else {
        categories.others.push(bill);
      }
    });

    return {
      ...categories,
      stats: {
        overdueCount: categories.overdue.length,
        dueSoonCount: categories.dueSoon.length,
        othersCount: categories.others.length
      }
    };
  }, [bills]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading bills...</p>
        </div>
      </div>
    );
  }

  const BillCard = ({ bill }: { bill: Bill }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{bill.icon}</span>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {bill.name}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {bill.company}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 ml-2">
        <div className="text-right">
          <div className="font-bold text-gray-900 dark:text-gray-100">
            ${Number(bill.amount).toFixed(2)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {new Date(bill.dueDate).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
          </div>
        </div>
        <PayButton bill={bill} size="sm" />
      </div>
    </div>
  );

  const Section = ({ title, items, icon, badgeColor }: { 
    title: string, 
    items: Bill[], 
    icon: React.ReactNode, 
    badgeColor: string 
  }) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
          <Badge className={`${badgeColor} text-white text-xs`}>{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-2 text-sm">No bills</p>
        ) : (
          <div className="space-y-2">
            {items.slice(0, 5).map(bill => (
              <BillCard key={bill.id} bill={bill} />
            ))}
            {items.length > 5 && (
              <p className="text-center text-sm text-gray-500 pt-2">
                +{items.length - 5} more bills
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">MyBillPort</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Quick bill overview</p>
          </div>
          <Link href="/add-bill">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </Link>
        </div>

        {/* Compact Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <Card className="bg-red-50 border-red-200 p-3">
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">{stats.overdueCount}</div>
              <div className="text-red-800 text-xs">Overdue</div>
            </div>
          </Card>
          <Card className="bg-orange-50 border-orange-200 p-3">
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">{stats.dueSoonCount}</div>
              <div className="text-orange-800 text-xs">Due Soon</div>
            </div>
          </Card>
          <Card className="bg-blue-50 border-blue-200 p-3">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{stats.othersCount}</div>
              <div className="text-blue-800 text-xs">Upcoming</div>
            </div>
          </Card>
        </div>

        {/* Bill Sections */}
        {overdue.length > 0 && (
          <Section 
            title="Overdue" 
            items={overdue}
            icon={<AlertCircle className="w-4 h-4 text-red-600" />}
            badgeColor="bg-red-600"
          />
        )}
        
        {dueSoon.length > 0 && (
          <Section 
            title="Due Soon" 
            items={dueSoon}
            icon={<Calendar className="w-4 h-4 text-orange-600" />}
            badgeColor="bg-orange-600"
          />
        )}
        
        {others.length > 0 && (
          <Section 
            title="Upcoming" 
            items={others}
            icon={<CheckCircle className="w-4 h-4 text-blue-600" />}
            badgeColor="bg-blue-600"
          />
        )}

        {bills.length === 0 && (
          <Card className="text-center py-8">
            <CardContent>
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">No bills to display</p>
              <Link href="/add-bill">
                <Button className="bg-blue-600 hover:bg-blue-700">Add Your First Bill</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}