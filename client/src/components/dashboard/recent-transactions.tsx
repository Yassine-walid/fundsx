import { ShoppingCart, Car, ArrowUp, Film, Utensils } from "lucide-react";
import { format } from "date-fns";
import type { Transaction } from "@shared/schema";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'food & dining':
      return <Utensils className="text-red-600" size={16} />;
    case 'transport':
      return <Car className="text-blue-600" size={16} />;
    case 'entertainment':
      return <Film className="text-purple-600" size={16} />;
    case 'shopping':
      return <ShoppingCart className="text-red-600" size={16} />;
    case 'salary':
      return <ArrowUp className="text-green-600" size={16} />;
    default:
      return <ShoppingCart className="text-gray-600" size={16} />;
  }
};

const getCategoryColor = (category: string, type: string) => {
  if (type === 'income') return 'bg-green-100 dark:bg-green-900';
  
  switch (category.toLowerCase()) {
    case 'food & dining':
      return 'bg-red-100 dark:bg-red-900';
    case 'transport':
      return 'bg-blue-100 dark:bg-blue-900';
    case 'entertainment':
      return 'bg-purple-100 dark:bg-purple-900';
    case 'shopping':
      return 'bg-red-100 dark:bg-red-900';
    default:
      return 'bg-gray-100 dark:bg-gray-900';
  }
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
        <a href="/expenses" className="text-blue-600 hover:text-blue-700 text-sm">View all</a>
      </div>
      
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No transactions yet. Add your first transaction to get started.
            </p>
          </div>
        ) : (
          transactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(transaction.category, transaction.type)}`}>
                  {getCategoryIcon(transaction.category)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(transaction.date), 'MMM d')} • {transaction.category}
                  </p>
                </div>
              </div>
              <span className={`font-semibold ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
