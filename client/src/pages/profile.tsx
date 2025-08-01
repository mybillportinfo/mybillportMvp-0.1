import BottomNavigation from "../components/bottom-navigation";
import { User, Settings, Bell, CreditCard, Shield, HelpCircle, LogOut } from "lucide-react";
// @ts-ignore
import { logoutUser } from "../../../services/auth.js";

export default function Profile() {
  const handleMenuClick = (item: string) => {
    switch (item) {
      case "Personal Information":
        alert("Personal Information - Feature coming soon!\n\nThis will allow you to:\n• Update your name and profile\n• Change contact details\n• Manage account preferences");
        break;
      case "Payment Methods":
        alert("Payment Methods - Feature coming soon!\n\nThis will allow you to:\n• Add credit/debit cards\n• Manage bank accounts\n• Set default payment method");
        break;
      case "Notifications":
        alert("Notifications - Feature coming soon!\n\nThis will allow you to:\n• Set bill due date reminders\n• Configure payment confirmations\n• Manage email/SMS alerts");
        break;
      case "Security":
        alert("Security - Feature coming soon!\n\nThis will allow you to:\n• Change your password\n• Enable two-factor authentication\n• Review login activity");
        break;
      case "App Settings":
        alert("App Settings - Feature coming soon!\n\nThis will allow you to:\n• Choose app theme (light/dark)\n• Set currency preferences\n• Configure display options");
        break;
      case "Help & Support":
        window.location.href = "mailto:mybillportinfo@gmail.com?subject=MyBillPort Support Request&body=Hi MyBillPort Team,%0D%0A%0D%0AI need help with:%0D%0A%0D%0A[Please describe your issue here]%0D%0A%0D%0AThank you!";
        break;
      default:
        alert("Feature coming soon!");
    }
  };

  const menuItems = [
    { icon: User, label: "Personal Information" },
    { icon: CreditCard, label: "Payment Methods" },
    { icon: Bell, label: "Notifications" },
    { icon: Shield, label: "Security" },
    { icon: Settings, label: "App Settings" },
    { icon: HelpCircle, label: "Help & Support" },
  ];

  return (
    <>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm p-1">
            <img 
              src="/logo.png" 
              alt="MyBillPort Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <h1 className="text-xl font-bold">MyBillPort</h1>
        </div>
        <h2 className="text-lg font-semibold">Profile</h2>
      </header>

      {/* Content */}
      <div className="flex-1 p-4 pb-20 overflow-y-auto bg-gray-50">
        {/* User Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">John Doe</h2>
              <p className="text-gray-500">johndoe@example.com</p>
              <p className="text-sm text-green-600 font-medium">Verified Account</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuClick(item.label)}
              className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-medium text-gray-800">{item.label}</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button 
          onClick={async () => {
            try {
              await logoutUser();
              window.location.href = "/login";
            } catch (error) {
              console.error("Logout error:", error);
              window.location.href = "/login";
            }
          }}
          className="w-full mt-6 bg-red-50 text-red-600 rounded-2xl p-4 flex items-center justify-center space-x-2 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>

        {/* App Version */}
        <div className="text-center mt-6 text-gray-400 text-sm">
          MyBillPort v1.0.0
        </div>
      </div>

      <BottomNavigation activeTab="profile" />
    </>
  );
}
