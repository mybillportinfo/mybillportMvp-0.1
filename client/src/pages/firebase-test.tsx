import React, { useState, useEffect } from "react";
// @ts-ignore
import { addBill, getBills, type FirestoreBill } from "../../../services/bills.ts";
import BottomNavigation from "../components/bottom-navigation";

export default function FirebaseTest() {
  const [bills, setBills] = useState<FirestoreBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      const fetchedBills = await getBills();
      setBills(fetchedBills);
    } catch (error) {
      console.error("Error loading bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBill = async () => {
    try {
      setAdding(true);
      const newBill = {
        name: "Hydro One",
        amount: 95.50,
        dueDate: "2025-08-10",
        category: "Electricity",
        status: "pending",
        company: "Hydro One",
        priority: "medium",
        icon: "fas fa-bolt"
      };
      
      await addBill(newBill);
      await loadBills(); // Refresh the list
    } catch (error) {
      console.error("Error adding bill:", error);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-600">
                <path fill="currentColor" d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1ZM10 6a2 2 0 0 1 4 0v1h-4V6Zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10Z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold">MyBillPort</h1>
          </div>
          <h2 className="text-lg font-semibold">Firebase Test</h2>
        </header>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <button
              onClick={handleAddBill}
              disabled={adding}
              className="bg-green-500 text-white px-6 py-3 rounded-2xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {adding ? "Adding Bill..." : "Add Sample Bill"}
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Firebase Bills ({bills.length})</h3>
            
            {bills.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No bills found. Add one to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bills.map((bill) => (
                  <div key={bill.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                          <i className={`${bill.icon || 'fas fa-file-invoice'} text-blue-600 text-lg`}></i>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{bill.name}</h4>
                          <p className="text-sm text-gray-500">{bill.company || bill.category}</p>
                          <p className="text-xs text-gray-400">Due: {bill.dueDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${bill.amount}</p>
                        <span className="text-xs text-gray-500">{bill.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNavigation activeTab="home" />
    </>
  );
}