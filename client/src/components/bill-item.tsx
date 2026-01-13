import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bill } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays } from "date-fns";
import { Trash2 } from "lucide-react";

interface BillItemProps {
  bill: Bill;
}

const CANADIAN_UTILITY_LOGOS: Record<string, { color: string; bgColor: string }> = {
  "hydro one": { color: "text-green-600", bgColor: "bg-green-50" },
  "toronto hydro": { color: "text-blue-600", bgColor: "bg-blue-50" },
  "bc hydro": { color: "text-cyan-600", bgColor: "bg-cyan-50" },
  "alectra": { color: "text-orange-600", bgColor: "bg-orange-50" },
  "enbridge": { color: "text-yellow-600", bgColor: "bg-yellow-50" },
  "fortisbc": { color: "text-teal-600", bgColor: "bg-teal-50" },
  "rogers": { color: "text-red-600", bgColor: "bg-red-50" },
  "bell": { color: "text-blue-700", bgColor: "bg-blue-50" },
  "telus": { color: "text-purple-600", bgColor: "bg-purple-50" },
  "freedom": { color: "text-pink-600", bgColor: "bg-pink-50" },
  "fido": { color: "text-green-500", bgColor: "bg-green-50" },
  "koodo": { color: "text-pink-500", bgColor: "bg-pink-50" },
  "virgin": { color: "text-red-500", bgColor: "bg-red-50" },
  "shaw": { color: "text-blue-500", bgColor: "bg-blue-50" },
  "netflix": { color: "text-red-600", bgColor: "bg-red-50" },
  "spotify": { color: "text-green-500", bgColor: "bg-green-50" },
};

function getUtilityStyles(company: string): { color: string; bgColor: string } | null {
  const lowerCompany = company.toLowerCase();
  for (const [key, styles] of Object.entries(CANADIAN_UTILITY_LOGOS)) {
    if (lowerCompany.includes(key)) {
      return styles;
    }
  }
  return null;
}

export default function BillItem({ bill }: BillItemProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const payBillMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/bills/${bill.id}/pay`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rewards"] });
      toast({
        title: "Payment Successful!",
        description: `Your ${bill.name} has been paid successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteBillMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/bills/${bill.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      toast({
        title: "Bill Deleted",
        description: `${bill.name} has been removed from your bills.`,
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Could not delete the bill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getDueDateText = () => {
    const daysUntilDue = differenceInDays(new Date(bill.dueDate), new Date());
    
    if (daysUntilDue < 0) {
      return "Overdue";
    } else if (daysUntilDue === 0) {
      return "Due: Today";
    } else if (daysUntilDue === 1) {
      return "Due: Tomorrow";
    } else {
      return `Due: In ${daysUntilDue} days`;
    }
  };

  const getPriorityClasses = () => {
    switch (bill.priority) {
      case "urgent":
        return {
          border: "border-l-red-600",
          iconBg: "bg-red-50",
          iconText: "text-red-600",
          dueDateText: "text-red-600",
          buttonBg: "bg-red-600 hover:bg-red-700"
        };
      case "medium":
        return {
          border: "border-l-orange-500",
          iconBg: "bg-orange-50",
          iconText: "text-orange-600",
          dueDateText: "text-orange-600",
          buttonBg: "bg-orange-500 hover:bg-orange-600"
        };
      case "low":
        return {
          border: "border-l-green-600",
          iconBg: "bg-green-50",
          iconText: "text-green-600",
          dueDateText: "text-green-600",
          buttonBg: "bg-green-600 hover:bg-green-700"
        };
      default:
        return {
          border: "border-l-gray-600",
          iconBg: "bg-gray-50",
          iconText: "text-gray-600",
          dueDateText: "text-gray-600",
          buttonBg: "bg-gray-600 hover:bg-gray-700"
        };
    }
  };

  const classes = getPriorityClasses();
  const utilityStyles = getUtilityStyles(bill.company);

  if (bill.isPaid === 1) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-l-4 border-l-gray-300 p-4 opacity-75">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${utilityStyles?.bgColor || "bg-gray-100"} rounded-xl flex items-center justify-center`}>
              <i className={`${bill.icon} ${utilityStyles?.color || "text-gray-400"} text-lg`}></i>
            </div>
            <div>
              <h4 className="font-semibold text-gray-500">{bill.name}</h4>
              <p className="text-sm text-gray-400">{bill.company}</p>
              <p className="text-xs text-green-600 font-medium">Paid</p>
            </div>
          </div>
          <div className="text-right flex items-center gap-2">
            <div>
              <p className="text-lg font-bold text-gray-500">${bill.amount}</p>
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-800">
                Paid
              </span>
            </div>
            <button
              onClick={() => deleteBillMutation.mutate()}
              disabled={deleteBillMutation.isPending}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete bill"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 ${utilityStyles?.bgColor || classes.iconBg} rounded-2xl flex items-center justify-center`}>
            <i className={`${bill.icon} ${utilityStyles?.color || classes.iconText} text-lg`}></i>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">{bill.name}</h4>
            <p className="text-sm text-gray-500">{bill.company}</p>
            <p className={`text-xs ${classes.dueDateText} font-medium`}>
              {getDueDateText()}
            </p>
          </div>
        </div>
        <div className="text-right flex items-center gap-2">
          <div>
            <p className="text-lg font-bold text-gray-900">${bill.amount}</p>
            <button
              onClick={() => payBillMutation.mutate()}
              disabled={payBillMutation.isPending}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium mt-1 transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              {payBillMutation.isPending ? "..." : "Pay"}
            </button>
          </div>
          <button
            onClick={() => deleteBillMutation.mutate()}
            disabled={deleteBillMutation.isPending}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete bill"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
