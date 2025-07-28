import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

import Dashboard from "@/pages/dashboard";
import SalaryManagement from "@/pages/salary-management";
import Expenses from "@/pages/expenses";
import SavingsGoals from "@/pages/savings-goals";
import Recurring from "@/pages/recurring";
import CalendarView from "@/pages/calendar-view";
import NotFound from "@/pages/not-found";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

function Layout({ children, title, subtitle }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-budget-light dark:bg-gray-900 transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <TopBar title={title} subtitle={subtitle} />
        {children}
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Layout title="Dashboard" subtitle="Welcome back! Here's your financial overview.">
          <Dashboard />
        </Layout>
      </Route>
      
      <Route path="/salary">
        <Layout title="Salary Management" subtitle="Configure your monthly income and budget allocation.">
          <SalaryManagement />
        </Layout>
      </Route>
      
      <Route path="/expenses">
        <Layout title="Expenses" subtitle="Track and manage all your financial transactions.">
          <Expenses />
        </Layout>
      </Route>
      
      <Route path="/savings">
        <Layout title="Savings Goals" subtitle="Set and track your financial goals for the future.">
          <SavingsGoals />
        </Layout>
      </Route>
      
      <Route path="/recurring">
        <Layout title="Recurring Transactions" subtitle="Manage your bills and automatic payments.">
          <Recurring />
        </Layout>
      </Route>
      
      <Route path="/calendar">
        <Layout title="Calendar View" subtitle="Visualize your expenses across time.">
          <CalendarView />
        </Layout>
      </Route>
      
      <Route path="/settings">
        <Layout title="Settings" subtitle="Configure your application preferences.">
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Settings page coming soon...</p>
            </div>
          </div>
        </Layout>
      </Route>
      
      <Route path="/help">
        <Layout title="Help" subtitle="Get assistance and learn how to use the application.">
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Help documentation coming soon...</p>
            </div>
          </div>
        </Layout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="budget-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
