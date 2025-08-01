import { useLocation } from "wouter";
import { Home, CreditCard, Gift, User } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/payments", icon: CreditCard, label: "Payments" },
    { path: "/payment-methods", icon: Gift, label: "Methods" },
    { path: "/profile", icon: User, label: "Profile" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => window.location.href = item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}