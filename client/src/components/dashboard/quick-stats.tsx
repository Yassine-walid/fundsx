import { ArrowUp, ArrowDown, PiggyBank, PieChart } from "lucide-react";

interface QuickStatsProps {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalSaved: number;
  budgetUsed: number;
}

export function QuickStats({ monthlyIncome, monthlyExpenses, totalSaved, budgetUsed }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Monthly Income</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${monthlyIncome.toLocaleString()}
            </p>
            <p className="text-green-600 text-sm mt-1">+8% from last month</p>
          </div>
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
            <ArrowUp className="text-green-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${monthlyExpenses.toLocaleString()}
            </p>
            <p className="text-red-600 text-sm mt-1">+12% from last month</p>
          </div>
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
            <ArrowDown className="text-red-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total Saved</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${totalSaved.toLocaleString()}
            </p>
            <p className="text-green-600 text-sm mt-1">
              {monthlyIncome > 0 ? Math.round((totalSaved / monthlyIncome) * 100) : 0}% of income
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <PiggyBank className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Budget Used</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(budgetUsed)}%
            </p>
            <p className="text-yellow-600 text-sm mt-1">
              ${Math.max(0, monthlyIncome - monthlyExpenses).toLocaleString()} remaining
            </p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
            <PieChart className="text-yellow-600" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
