import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/contexts/auth-context";
import { UserProvider } from "@/contexts/user-context";

// Pages
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Paths from "@/pages/paths";
import Store from "@/pages/store";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";

// Admin Pages
import Admin from "@/pages/admin/index";
import AdminTrails from "@/pages/admin/trails";
import AdminLevels from "@/pages/admin/levels";
import AdminExercises from "@/pages/admin/exercises";
import AdminUsers from "@/pages/admin/users";
import AdminTransactions from "@/pages/admin/transactions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/paths" component={Paths} />
      <Route path="/store" component={Store} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/profile" component={Profile} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={Admin} />
      <Route path="/admin/trails" component={AdminTrails} />
      <Route path="/admin/levels" component={AdminLevels} />
      <Route path="/admin/exercises" component={AdminExercises} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/transactions" component={AdminTransactions} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
