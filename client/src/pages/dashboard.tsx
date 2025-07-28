import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { IncomeExpensesChart } from "@/components/dashboard/income-expenses-chart";
import { SavingsGoals } from "@/components/dashboard/savings-goals";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { ExpensesByCategory } from "@/components/dashboard/expenses-by-category";
import { UpcomingBills } from "@/components/dashboard/upcoming-bills";
import { api } from "@/lib/api";

export default function Dashboard() {
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ["/api/dashboard-stats"],
    queryFn: api.getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-80" />
          <Skeleton className="h-80" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6 overflow-y-auto h-full">
      <QuickStats
        monthlyIncome={dashboardStats.monthlyIncome}
        monthlyExpenses={dashboardStats.monthlyExpenses}
        totalSaved={dashboardStats.totalSaved}
        budgetUsed={dashboardStats.budgetUsed}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <IncomeExpensesChart data={dashboardStats.monthlyData} />
        <SavingsGoals goals={dashboardStats.savingsGoals} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions transactions={dashboardStats.recentTransactions} />
        <ExpensesByCategory categoryExpenses={dashboardStats.categoryExpenses} />
      </div>

      <UpcomingBills recurringTransactions={[]} />
    </main>
  );
}
