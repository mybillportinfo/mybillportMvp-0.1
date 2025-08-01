import { useState, useCallback, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, CreditCard, DollarSign, Building2, Banknote } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";

interface Account {
  account_id: string;
  name: string;
  official_name: string;
  type: string;
  subtype: string;
  balance: {
    available: number | null;
    current: number | null;
    currency: string | null;
  };
}

interface AccountsResponse {
  accounts: Account[];
  institution: string;
}

export default function PlaidIntegration() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch link token on component mount
  useEffect(() => {
    async function createLinkToken() {
      try {
        setLoading(true);
        const response = await fetch('/api/create_link_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to create link token');
        }
        
        const data = await response.json();
        setLinkToken(data.link_token);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    createLinkToken();
  }, []);

  // Handle successful Plaid Link
  const onSuccess = useCallback(async (public_token: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/exchange_public_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to exchange token');
      }

      const data = await response.json();
      setAccessToken(data.access_token);
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect account');
    } finally {
      setLoading(false);
    }
  }, []);

  // Configure Plaid Link
  const config = {
    token: linkToken,
    onSuccess,
    onExit: (err: any) => {
      if (err != null) {
        setError(`Plaid Link exited with error: ${err.error_message || 'Unknown error'}`);
      }
    },
    onEvent: (eventName: string, metadata: any) => {
      console.log('Plaid Link Event:', eventName, metadata);
    },
  };

  const { open, ready } = usePlaidLink(config);

  // Debug info for testing
  useEffect(() => {
    console.log('Plaid Integration Debug:', {
      linkToken: linkToken ? 'present' : 'missing',
      ready,
      loading,
      isConnected,
      error
    });
  }, [linkToken, ready, loading, isConnected, error]);

  // Fetch accounts data
  const { data: accountsData, isLoading: accountsLoading, error: accountsError } = useQuery<AccountsResponse>({
    queryKey: ['/api/accounts'],
    enabled: isConnected && !!accessToken,
    refetchOnWindowFocus: false,
  });

  const formatCurrency = (amount: number | null, currency: string | null = 'USD') => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getAccountIcon = (type: string, subtype: string) => {
    if (type === 'depository') {
      if (subtype === 'checking') return <Banknote className="w-5 h-5 text-blue-600" />;
      if (subtype === 'savings') return <DollarSign className="w-5 h-5 text-green-600" />;
    }
    if (type === 'credit') return <CreditCard className="w-5 h-5 text-purple-600" />;
    return <Building2 className="w-5 h-5 text-gray-600" />;
  };

  const getAccountTypeColor = (type: string, subtype: string) => {
    if (type === 'depository') {
      if (subtype === 'checking') return 'bg-blue-100 text-blue-800';
      if (subtype === 'savings') return 'bg-green-100 text-green-800';
    }
    if (type === 'credit') return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MyBillPort - Bank Integration</h1>
          <p className="text-gray-600">Connect your bank account to automatically track bills and manage payments</p>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isConnected ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                Connect Your Bank Account
              </CardTitle>
              <CardDescription>
                Securely connect your bank account using Plaid to automatically sync your financial data.
                This demo uses Plaid's Sandbox environment for testing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Bank-level security with 256-bit encryption</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Read-only access to account balances and transactions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Your banking credentials are never stored on our servers</span>
                </div>
                
                <Separator />
                
                <Button 
                  onClick={() => open()} 
                  disabled={!ready || loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Connecting...' : 'Connect Your Bank'}
                </Button>
                
                {!ready && !loading && (
                  <p className="text-sm text-gray-500 text-center">
                    Initializing secure connection...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully connected to your bank account! Your accounts are now synced.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-6 h-6" />
                  Connected Accounts
                </CardTitle>
                <CardDescription>
                  Your bank accounts and current balances
                </CardDescription>
              </CardHeader>
              <CardContent>
                {accountsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading accounts...</span>
                  </div>
                ) : accountsError ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load accounts. {accountsError instanceof Error ? accountsError.message : 'Unknown error'}
                    </AlertDescription>
                  </Alert>
                ) : accountsData?.accounts ? (
                  <div className="space-y-4">
                    {accountsData.accounts.map((account) => (
                      <div key={account.account_id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getAccountIcon(account.type, account.subtype)}
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {account.official_name || account.name}
                              </h3>
                              {account.official_name && account.name !== account.official_name && (
                                <p className="text-sm text-gray-600">{account.name}</p>
                              )}
                            </div>
                          </div>
                          <Badge className={getAccountTypeColor(account.type, account.subtype)}>
                            {account.subtype || account.type}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Current Balance</p>
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(account.balance.current, account.balance.currency)}
                            </p>
                          </div>
                          {account.balance.available !== null && (
                            <div>
                              <p className="text-sm font-medium text-gray-600">Available Balance</p>
                              <p className="text-lg font-bold text-green-600">
                                {formatCurrency(account.balance.available, account.balance.currency)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Your accounts are now connected and will sync automatically</li>
                        <li>• Set up bill pay from your connected accounts</li>
                        <li>• Enable automatic bill detection and scheduling</li>
                        <li>• Monitor your spending and get personalized insights</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No accounts found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsConnected(false);
                  setAccessToken(null);
                  setError(null);
                }}
              >
                Connect Another Account
              </Button>
            </div>
          </div>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About This Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose text-sm text-gray-600">
              <p>
                This is a demonstration of Plaid's Sandbox environment. In production, you would:
              </p>
              <ul className="mt-2 space-y-1">
                <li>• Use production Plaid API keys</li>
                <li>• Connect real bank accounts</li>
                <li>• Store access tokens securely in your database</li>
                <li>• Implement proper user authentication</li>
                <li>• Add webhook handling for real-time updates</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}