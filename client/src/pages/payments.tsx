import { useState, useEffect } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ArrowLeft, CreditCard, Receipt, CheckCircle, XCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('Missing VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY ? 
  loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : null;

interface Bill {
  id: string;
  company: string;
  amount: number;
  dueDate: string;
  accountNumber: string;
}

const CheckoutForm = ({ bill, onSuccess }: { bill: Bill; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payments?success=true`,
      },
    });

    if (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: `Payment for ${bill.company} has been processed!`,
      });
      onSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900">{bill.company}</h3>
        <p className="text-sm text-gray-600">Account: {bill.accountNumber}</p>
        <p className="text-lg font-semibold text-gray-900">${bill.amount.toFixed(2)} CAD</p>
      </div>
      
      <PaymentElement />
      
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        data-testid="button-pay-bill"
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <CreditCard className="w-5 h-5" />
        )}
        {isProcessing ? 'Processing...' : `Pay $${bill.amount.toFixed(2)}`}
      </button>
    </form>
  );
};

export default function PaymentPage() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [bills] = useState<Bill[]>([
    {
      id: "1",
      company: "Rogers",
      amount: 89.99,
      dueDate: "2025-08-25",
      accountNumber: "****-1234"
    },
    {
      id: "2", 
      company: "Hydro One",
      amount: 125.50,
      dueDate: "2025-08-30",
      accountNumber: "****-5678"
    }
  ]);

  const createPaymentIntent = async (bill: Bill) => {
    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: bill.amount,
        billId: bill.id,
        description: `Payment for ${bill.company}`
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setClientSecret(data.clientSecret);
      setSelectedBill(bill);
    } catch (error: any) {
      console.error('Payment intent creation failed:', error);
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Unable to setup payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = () => {
    setClientSecret("");
    setSelectedBill(null);
    // Refresh bills or mark as paid
  };

  // Check for success parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      toast({
        title: "Payment Successful!",
        description: "Your bill payment has been processed successfully.",
      });
    }
  }, []);

  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 shadow-sm max-w-md">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-center mb-2">Payments Not Available</h2>
          <p className="text-gray-600 text-center">
            Stripe payment processing is not configured. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
          <button 
            onClick={() => window.history.back()}
            data-testid="button-back"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold" data-testid="text-page-title">Pay Bills</h1>
        </div>

        <div className="p-4 space-y-4">
          {!selectedBill ? (
            <>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Select a Bill to Pay</h2>
              
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  data-testid={`card-bill-${bill.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900" data-testid={`text-company-${bill.id}`}>
                        {bill.company}
                      </h3>
                      <p className="text-sm text-gray-600" data-testid={`text-account-${bill.id}`}>
                        Account: {bill.accountNumber}
                      </p>
                      <p className="text-sm text-gray-600" data-testid={`text-due-date-${bill.id}`}>
                        Due: {new Date(bill.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900" data-testid={`text-amount-${bill.id}`}>
                        ${bill.amount.toFixed(2)}
                      </p>
                      <button
                        onClick={() => createPaymentIntent(bill)}
                        data-testid={`button-pay-${bill.id}`}
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <button 
                  onClick={() => {
                    setSelectedBill(null);
                    setClientSecret("");
                  }}
                  data-testid="button-back-to-bills"
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-medium">Payment Details</h2>
              </div>

              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm bill={selectedBill} onSuccess={handlePaymentSuccess} />
                </Elements>
              ) : (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}