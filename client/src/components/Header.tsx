import { Link } from "wouter";
import { Bell, User, LogOut } from "lucide-react";

interface HeaderProps {
  userName?: string;
  showNotifications?: boolean;
  onLogout?: () => void;
}

export default function Header({ userName, showNotifications = true, onLogout }: HeaderProps) {
  return (
    <header className="bg-gradient-to-br from-slate-800 to-slate-900 text-white">
      <div className="px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center shadow-sm border border-slate-600">
              <img 
                src="/logo.png" 
                alt="MyBillPort" 
                className="w-7 h-7 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<span class="text-white font-bold text-lg">M</span>';
                }}
              />
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">MyBill</span>
              <span className="text-slate-400">Port</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {showNotifications && (
              <Link href="/notifications">
                <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
              </Link>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {userName && (
          <h2 className="text-2xl font-semibold">Welcome back</h2>
        )}
      </div>
    </header>
  );
}
