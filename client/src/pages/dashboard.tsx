import { useBills } from "../hooks/useBills";
import PayButton from "../components/PayButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, CheckCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Dashboard() {
  const { bills, isLoading } = useBills();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your bills...</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in7 = new Date(startOfToday);
  in7.setDate(in7.getDate() + 7);

  // Filter bills by due date categories
  const overdue = bills.filter(b => {
    const dueDate = new Date(b.dueDate);
    return dueDate < startOfToday;
  });
  
  const dueSoon = bills.filter(b => {
    const dueDate = new Date(b.dueDate);
    return dueDate >= startOfToday && dueDate <= in7;
  });
  
  const others = bills.filter(b => {
    const dueDate = new Date(b.dueDate);
    return dueDate > in7;
  });

  const Section = ({ title, items, icon, badgeColor = "bg-gray-500" }) => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
            <Badge className={`${badgeColor} text-white`}>{items.length}</Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No bills in this category</p>
        ) : (
          <div className="space-y-3">
            {items.map(bill => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{bill.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {bill.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {bill.company}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                      ${Number(bill.amount).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(bill.dueDate).toLocaleDateString('en-CA')}
                    </div>
                  </div>
                  
                  <PayButton bill={bill} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              MyBillPort
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your bills and payments
            </p>
          </div>
          
          <Link href="/add-bill">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Bill
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{overdue.length}</div>
              <div className="text-red-800 text-sm">Overdue Bills</div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{dueSoon.length}</div>
              <div className="text-orange-800 text-sm">Due Soon</div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{others.length}</div>
              <div className="text-blue-800 text-sm">Upcoming</div>
            </CardContent>
          </Card>
        </div>

        {/* Bill Sections */}
        <Section 
          title="Overdue" 
          items={overdue}
          icon={<AlertCircle className="w-5 h-5 text-red-600" />}
          badgeColor="bg-red-600"
        />
        
        <Section 
          title="Due Soon (≤7 days)" 
          items={dueSoon}
          icon={<Calendar className="w-5 h-5 text-orange-600" />}
          badgeColor="bg-orange-600"
        />
        
        <Section 
          title="All Others" 
          items={others}
          icon={<CheckCircle className="w-5 h-5 text-blue-600" />}
          badgeColor="bg-blue-600"
        />
      </div>
    </div>
  );
}