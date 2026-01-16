import { Link } from "wouter";
import { ChevronRight, User, Bell, Link2, CreditCard, LogOut, Home, Plus, Settings as SettingsIcon, Mail, Cloud, Crown } from "lucide-react";

export default function Settings() {
  const handleLogout = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="pt-12 pb-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 gradient-emerald rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold text-white">MyBillPort</span>
          </div>
          <h1 className="text-2xl font-semibold text-white">Settings</h1>
        </div>

        {/* Profile Section */}
        <div className="card-premium p-5 mb-4">
          <div className="flex items-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
              <User className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-lg">MyBillPort User</p>
              <p className="text-sm text-slate-500">user@example.com</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* Plan Card */}
        <div className="card-premium p-5 mb-6 border-2 border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mr-3">
                <Crown className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Free Plan</p>
                <p className="text-sm text-slate-500">Up to 5 bills</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
              Active
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-3">Unlock unlimited bills and advanced features</p>
            <button className="w-full py-2.5 bg-slate-100 text-slate-500 font-medium rounded-xl cursor-not-allowed">
              Premium Coming Soon
            </button>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="space-y-3">
          {/* Notifications */}
          <div className="card-premium p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">Notifications</p>
                <p className="text-sm text-slate-500">Email reminders enabled</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* Connected Accounts Header */}
          <div className="pt-4 pb-2">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Connected Accounts</h3>
          </div>

          {/* Gmail Integration */}
          <div className="card-premium p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-3">
                <Mail className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">Gmail</p>
                <p className="text-sm text-slate-500">Auto-detect bills from email</p>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
                Coming Soon
              </span>
            </div>
          </div>

          {/* iCloud Integration */}
          <div className="card-premium p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mr-3">
                <Cloud className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">Apple Mail</p>
                <p className="text-sm text-slate-500">iCloud bill detection</p>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="card-premium p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">Payment Methods</p>
                <p className="text-sm text-slate-500">Manage saved cards</p>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Logout */}
          <div className="pt-4">
            <button 
              onClick={handleLogout}
              className="card-premium p-4 w-full text-left flex items-center hover:bg-red-50 transition-colors"
            >
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-3">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <p className="font-medium text-red-600">Log Out</p>
            </button>
          </div>
        </div>

        {/* App Version */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">MyBillPort v1.0.0</p>
          <p className="text-xs text-slate-600 mt-1">Made in Canada</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800">
        <div className="max-w-md mx-auto px-6 py-3 flex justify-around">
          <Link href="/app">
            <button className="nav-item">
              <Home className="w-6 h-6" />
              <span className="text-xs">Home</span>
            </button>
          </Link>
          <Link href="/add-bill">
            <button className="nav-item">
              <Plus className="w-6 h-6" />
              <span className="text-xs">Add Bill</span>
            </button>
          </Link>
          <Link href="/settings">
            <button className="nav-item nav-item-active">
              <SettingsIcon className="w-6 h-6" />
              <span className="text-xs">Settings</span>
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
