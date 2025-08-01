import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "./pages/dashboard";
import Payments from "./pages/payments";
import Rewards from "./pages/rewards";
import Profile from "./pages/profile";
import FirebaseTest from "./pages/firebase-test";
import Signup from "./pages/signup";
import Login from "./pages/login";
import AuthDashboard from "./pages/auth-dashboard";
import EnhancedDashboard from "./pages/enhanced-dashboard";
import ForgotPassword from "./pages/forgot-password";
import SimpleDashboard from "./pages/simple-dashboard";
import TestDashboard from "./pages/test-dashboard";
import StableDashboard from "./pages/stable-dashboard";
import PersonalInfo from "./pages/personal-info";
import PaymentMethods from "./pages/payment-methods";
import Notifications from "./pages/notifications";
import Security from "./pages/security";
import AppSettings from "./pages/app-settings";
import AddBill from "./pages/add-bill";
import BillDetails from "./pages/bill-details";
import CameraScan from "./pages/camera-scan";
import AISuggestions from "./pages/ai-suggestions";
import LiveChat from "./pages/live-chat";
import AIReminders from "./pages/ai-reminders";
import CreditReminders from "./pages/credit-reminders";

function Router() {
  return (
    <Switch>
      <Route path="/" component={StableDashboard} />
      <Route path="/test" component={TestDashboard} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/dashboard" component={AuthDashboard} />
      <Route path="/enhanced-dashboard" component={EnhancedDashboard} />
      <Route path="/firebase-test" component={FirebaseTest} />
      <Route path="/payments" component={Payments} />
      <Route path="/rewards" component={Rewards} />
      <Route path="/profile" component={Profile} />
      <Route path="/personal-info" component={PersonalInfo} />
      <Route path="/payment-methods" component={PaymentMethods} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/security" component={Security} />
      <Route path="/app-settings" component={AppSettings} />
      <Route path="/add-bill" component={AddBill} />
      <Route path="/bill-details/:id" component={BillDetails} />
      <Route path="/camera-scan" component={CameraScan} />
      <Route path="/ai-suggestions" component={AISuggestions} />
      <Route path="/live-chat" component={LiveChat} />
      <Route path="/ai-reminders" component={AIReminders} />
      <Route path="/credit-reminders" component={CreditReminders} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
