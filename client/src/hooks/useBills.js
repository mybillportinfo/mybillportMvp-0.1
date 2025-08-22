import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

/**
 * Custom hook to fetch and manage bills data
 * Provides real-time bill updates with automatic refetching
 */
export function useBills() {
  const { data: bills = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/bills'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/bills");
      return response.json();
    },
    // Refetch every 60 seconds to reduce server load
    refetchInterval: 60000,
    // Refetch when user focuses the window
    refetchOnWindowFocus: true,
    // Cache data for 30 seconds to improve performance
    staleTime: 30000
  });

  // Filter unpaid bills and sort by due date (matching your Firestore query)
  const unpaidBills = bills
    .filter(bill => bill.isPaid === 0) // 0 = unpaid in your schema
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return {
    bills: unpaidBills,
    allBills: bills,
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook for getting bills with different filters
 */
export function useBillsFiltered(filter = 'all') {
  const { data: bills = [], isLoading, error } = useQuery({
    queryKey: ['/api/bills'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/bills");
      return response.json();
    },
    refetchInterval: 60000,
    refetchOnWindowFocus: true
  });

  const filteredBills = bills.filter(bill => {
    const now = new Date();
    const dueDate = new Date(bill.dueDate);
    const daysDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    switch (filter) {
      case 'overdue':
        return bill.isPaid === 0 && daysDiff < 0;
      case 'due-soon':
        return bill.isPaid === 0 && daysDiff >= 0 && daysDiff <= 7;
      case 'unpaid':
        return bill.isPaid === 0;
      case 'paid':
        return bill.isPaid === 1;
      default:
        return true;
    }
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return {
    bills: filteredBills,
    isLoading,
    error
  };
}