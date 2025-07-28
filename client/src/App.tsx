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

function Router() {
  return (
    <Switch>
      <Route path="/" component={EnhancedDashboard} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={AuthDashboard} />
      <Route path="/enhanced-dashboard" component={EnhancedDashboard} />
      <Route path="/firebase-test" component={FirebaseTest} />
      <Route path="/payments" component={Payments} />
      <Route path="/rewards" component={Rewards} />
      <Route path="/profile" component={Profile} />
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
