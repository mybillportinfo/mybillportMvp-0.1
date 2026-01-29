import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Plus,
  Zap,
  Phone,
  Wifi,
  CreditCard,
  Home,
  Dumbbell,
  Shield,
  Tv,
  Building2,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/bottom-navigation";

interface RecurringBill {
  merchant: string;
  category: string;
  averageAmount: number;
  frequency: string;
  occurrences: number;
  lastDate: string;
  confidence: number;
}

interface RecurringBillsResponse {
  recurring_bills: RecurringBill[];
  analysis_period: { start_date: string; end_date: string };
  total_transactions_analyzed: number;
}

export default function AutoDetectBills() {
  const [addedBills, setAddedBills] = useState<Set<string>>(new Set());

  const { data, isLoading, error, refetch, isRefetching } = useQuery<RecurringBillsResponse>({
    queryKey: ['/api/recurring-bills'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const addBillMutation = useMutation({
    mutationFn: async (bill: RecurringBill) => {
      const nextDueDate = getNextDueDate(bill.lastDate, bill.frequency);
      return apiRequest('POST', '/api/bills', {
        name: bill.merchant,
        company: bill.merchant,
        amount: bill.averageAmount.toString(),
        dueDate: nextDueDate,
        priority: bill.averageAmount > 100 ? 'urgent' : bill.averageAmount > 50 ? 'medium' : 'low',
        icon: getCategoryIcon(bill.category),
        isPaid: 0,
        category: bill.category
      });
    },
    onSuccess: (_, bill) => {
      setAddedBills(prev => new Set(prev).add(bill.merchant));
      queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
      toast({
        title: "Bill Added",
        description: `${bill.merchant} has been added to your bills.`
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add bill. Please try again.",
        variant: "destructive"
      });
    }
  });

  const getNextDueDate = (lastDate: string, frequency: string): string => {
    const date = new Date(lastDate);
    switch (frequency) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'bi-weekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'annual':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }
    return date.toISOString().split('T')[0];
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'utilities': return 'zap';
      case 'phone': return 'phone';
      case 'internet': return 'wifi';
      case 'subscription': return 'tv';
      case 'insurance': return 'shield';
      case 'fitness': return 'dumbbell';
      case 'housing': return 'home';
      default: return 'credit-card';
    }
  };

  const getCategoryIconComponent = (category: string) => {
    const iconClass = "w-5 h-5";
    switch (category.toLowerCase()) {
      case 'utilities': return <Zap className={`${iconClass} text-yellow-600`} />;
      case 'phone': return <Phone className={`${iconClass} text-blue-600`} />;
      case 'internet': return <Wifi className={`${iconClass} text-purple-600`} />;
      case 'subscription': return <Tv className={`${iconClass} text-pink-600`} />;
      case 'insurance': return <Shield className={`${iconClass} text-green-600`} />;
      case 'fitness': return <Dumbbell className={`${iconClass} text-orange-600`} />;
      case 'housing': return <Home className={`${iconClass} text-teal-600`} />;
      default: return <CreditCard className={`${iconClass} text-gray-600`} />;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return <Badge className="bg-green-100 text-green-800">High</Badge>;
    if (confidence >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'Weekly';
      case 'bi-weekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'annual': return 'Annual';
      default: return frequency;
    }
  };

  const needsBankConnection = error && (error as any)?.message?.includes('No bank account connected');

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/app">
              <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Auto-Detect Bills</h1>
              <p className="text-white/80 text-sm">Find recurring bills from your bank</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 space-y-4">
          {needsBankConnection ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Bank First</h3>
                  <p className="text-gray-600 mb-6">
                    Link your bank account to automatically detect recurring bills from your transactions.
                  </p>
                  <Link href="/plaid">
                    <Button className="bg-teal-500 hover:bg-teal-600">
                      <Building2 className="w-4 h-4 mr-2" />
                      Link Bank Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-teal-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Transactions</h3>
                  <p className="text-gray-600">Looking for recurring bills in your bank history...</p>
                </div>
              </CardContent>
            </Card>
          ) : error && !needsBankConnection ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {(error as Error).message || "Failed to detect recurring bills"}
              </AlertDescription>
            </Alert>
          ) : data?.recurring_bills.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recurring Bills Found</h3>
                  <p className="text-gray-600 mb-4">
                    We analyzed {data?.total_transactions_analyzed || 0} transactions but didn't find any recurring patterns.
                  </p>
                  <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                    Scan Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Found {data?.recurring_bills.length} recurring bills
                  </p>
                  <p className="text-xs text-gray-500">
                    Analyzed {data?.total_transactions_analyzed} transactions
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetch()} 
                  disabled={isRefetching}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              <div className="space-y-3">
                {data?.recurring_bills.map((bill, index) => {
                  const isAdded = addedBills.has(bill.merchant);
                  return (
                    <Card key={index} className={isAdded ? 'bg-green-50 border-green-200' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              {getCategoryIconComponent(bill.category)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{bill.merchant}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {bill.category}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {getFrequencyLabel(bill.frequency)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {bill.occurrences} transactions • Last: {new Date(bill.lastDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              ${bill.averageAmount.toFixed(2)}
                            </p>
                            <div className="mt-1">
                              {getConfidenceBadge(bill.confidence)}
                            </div>
                          </div>
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <div className="flex justify-end">
                          {isAdded ? (
                            <Button variant="ghost" size="sm" disabled className="text-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Added
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => addBillMutation.mutate(bill)}
                              disabled={addBillMutation.isPending}
                              className="bg-teal-500 hover:bg-teal-600"
                            >
                              {addBillMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Plus className="w-4 h-4 mr-1" />
                              )}
                              Add to Bills
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {addedBills.size > 0 && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {addedBills.size} bill{addedBills.size > 1 ? 's' : ''} added to your dashboard!
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
