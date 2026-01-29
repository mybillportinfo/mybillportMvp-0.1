import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNavigation from "@/components/bottom-navigation";
import { 
  ArrowLeft, 
  Mail, 
  RefreshCw, 
  Plus, 
  Loader2,
  Zap,
  Phone,
  Wifi,
  CreditCard,
  Home,
  Tv,
  Shield,
  Building2,
  FileText,
  Check,
  AlertCircle,
  LogOut,
  ExternalLink
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface EmailBill {
  id: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  company: string;
  amount: number | null;
  dueDate: string | null;
  category: string;
  confidence: number;
}

const getCategoryIcon = (category: string) => {
  const icons: Record<string, typeof Zap> = {
    'utilities': Zap,
    'phone': Phone,
    'internet': Wifi,
    'insurance': Shield,
    'subscription': Tv,
    'credit-card': CreditCard,
    'banking': Building2,
    'housing': Home,
    'other': FileText
  };
  return icons[category] || FileText;
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'utilities': 'bg-yellow-100 text-yellow-700',
    'phone': 'bg-blue-100 text-blue-700',
    'internet': 'bg-purple-100 text-purple-700',
    'insurance': 'bg-green-100 text-green-700',
    'subscription': 'bg-pink-100 text-pink-700',
    'credit-card': 'bg-red-100 text-red-700',
    'banking': 'bg-indigo-100 text-indigo-700',
    'housing': 'bg-orange-100 text-orange-700',
    'other': 'bg-gray-100 text-gray-700'
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};

export default function EmailBills() {
  const [addedBills, setAddedBills] = useState<Set<string>>(new Set());
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const connectedParam = urlParams.get('connected');
  const errorParam = urlParams.get('error');
  const emailParam = urlParams.get('email');

  useEffect(() => {
    if (connectedParam === 'true') {
      toast({
        title: "Gmail Connected!",
        description: emailParam ? `Connected as ${emailParam}` : "Your Gmail is now connected."
      });
      window.history.replaceState({}, '', '/email-bills');
    } else if (errorParam) {
      toast({
        title: "Connection Failed",
        description: decodeURIComponent(errorParam),
        variant: "destructive"
      });
      window.history.replaceState({}, '', '/email-bills');
    }
  }, [connectedParam, errorParam, emailParam]);

  const { data: gmailStatus, isLoading: statusLoading } = useQuery<{
    connected: boolean;
    email?: string;
  }>({
    queryKey: ['/api/gmail/status']
  });

  const { data, isLoading, error, refetch, isRefetching } = useQuery<{
    success: boolean;
    bills: EmailBill[];
    count: number;
    connectedEmail?: string;
    needsConnection?: boolean;
  }>({
    queryKey: ['/api/email-bills'],
    enabled: gmailStatus?.connected === true,
    retry: false
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/gmail/connect');
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data;
    },
    onSuccess: (data) => {
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Connection Error",
        description: error.message || "Failed to start Gmail connection",
        variant: "destructive"
      });
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/gmail/disconnect');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gmail/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/email-bills'] });
      toast({
        title: "Disconnected",
        description: "Gmail has been disconnected."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect Gmail",
        variant: "destructive"
      });
    }
  });

  const addBillMutation = useMutation({
    mutationFn: async (bill: EmailBill) => {
      const dueDate = bill.dueDate 
        ? new Date(bill.dueDate).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const iconMap: Record<string, string> = {
        'utilities': 'zap',
        'phone': 'phone',
        'internet': 'wifi',
        'insurance': 'shield',
        'subscription': 'tv',
        'credit-card': 'credit-card',
        'banking': 'building-2',
        'housing': 'home',
        'other': 'file-text'
      };

      return apiRequest('POST', '/api/bills', {
        userId: "1",
        name: bill.subject.slice(0, 50),
        company: bill.company,
        amount: bill.amount?.toString() || "0",
        dueDate: dueDate,
        priority: "medium",
        icon: iconMap[bill.category] || 'file-text',
        isPaid: 0
      });
    },
    onSuccess: (_, bill) => {
      setAddedBills(prev => new Set(Array.from(prev).concat(bill.id)));
      queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
      toast({
        title: "Bill Added",
        description: `${bill.company} bill has been added to your bills.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add bill",
        variant: "destructive"
      });
    }
  });

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-CA', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const needsConnection = !gmailStatus?.connected;
  const isConnecting = connectMutation.isPending;

  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 pb-24">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/app">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Mail className="w-6 h-6 text-teal-600" />
              <h1 className="text-xl font-bold text-gray-900">Email Bills</h1>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-4" />
            <p className="text-gray-600">Checking connection...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 pb-24">
      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/app">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Mail className="w-6 h-6 text-slate-700" />
            <h1 className="text-xl font-bold text-gray-900">Email Bills</h1>
          </div>
        </div>

        {needsConnection ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Connect Your Gmail</h2>
              <p className="text-gray-600 mb-4 text-sm">
                Connect your Gmail account to automatically scan for bills and invoices in your inbox.
              </p>
              <p className="text-gray-500 text-xs mb-6">
                We'll only read email metadata to find bills. Your emails stay private and secure.
              </p>
              <Button 
                className="w-full bg-teal-600 hover:bg-teal-700 mb-3"
                onClick={() => connectMutation.mutate()}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Connect Gmail
                  </>
                )}
              </Button>
              <Link href="/app">
                <Button variant="outline" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-4" />
            <p className="text-gray-600">Scanning your emails for bills...</p>
          </div>
        ) : (
          <>
            <Card className="border-0 shadow-md mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Gmail Connected</p>
                      <p className="text-xs text-gray-500">{gmailStatus?.email || data?.connectedEmail}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => disconnectMutation.mutate()}
                    disabled={disconnectMutation.isPending}
                  >
                    {disconnectMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Found {data?.count || 0} potential bills
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                {isRefetching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span className="ml-1">Rescan</span>
              </Button>
            </div>

            {data?.bills && data.bills.length > 0 ? (
              <div className="space-y-3">
                {data.bills.map((bill) => {
                  const Icon = getCategoryIcon(bill.category);
                  const isAdded = addedBills.has(bill.id);

                  return (
                    <Card key={bill.id} className="border-0 shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getCategoryColor(bill.category)}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="font-medium text-gray-900 truncate">
                                  {bill.company}
                                </h3>
                                <p className="text-xs text-gray-500 truncate">
                                  {bill.subject}
                                </p>
                              </div>
                              {bill.amount && (
                                <span className="font-semibold text-gray-900 whitespace-nowrap">
                                  ${bill.amount.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs capitalize">
                                {bill.category}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {formatDate(bill.date)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {Math.round(bill.confidence * 100)}% match
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <Button
                            size="sm"
                            className={isAdded 
                              ? "w-full bg-green-600 hover:bg-green-600" 
                              : "w-full bg-teal-600 hover:bg-teal-700"
                            }
                            onClick={() => !isAdded && addBillMutation.mutate(bill)}
                            disabled={isAdded || addBillMutation.isPending}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Added
                              </>
                            ) : addBillMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-1" />
                                Add to Bills
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">No Bills Found</h3>
                  <p className="text-sm text-gray-500">
                    We didn't find any bill-related emails in your inbox.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
