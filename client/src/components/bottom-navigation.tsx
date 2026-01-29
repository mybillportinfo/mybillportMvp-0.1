import { useLocation, Link } from "wouter";
import { Home, DollarSign, Clock, User } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/app", icon: Home, label: "Home" },
    { path: "/payments", icon: DollarSign, label: "Payments" },
    { path: "/rewards", icon: Clock, label: "History" },
    { path: "/profile", icon: User, label: "Profile" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center py-3 px-2">
          {navItems.map((item) => {
            const isActive = location === item.path || 
              (item.path === "/app" && location === "/");
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <div className={`p-2 rounded-xl mb-1 transition-colors ${
                  isActive ? "bg-slate-700" : ""
                }`}>
                  <item.icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
                </div>
                <span className={`text-xs font-medium ${isActive ? "text-white" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}