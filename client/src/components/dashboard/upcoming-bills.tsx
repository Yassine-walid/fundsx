import { Plus, Home, Wifi, PiggyBank, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecurringTransaction } from "@shared/schema";
import { format, differenceInDays } from "date-fns";

interface UpcomingBillsProps {
  recurringTransactions: RecurringTransaction[];
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'rent':
    case 'housing':
      return <Home className="text-red-600" size={16} />;
    case 'internet':
    case 'utilities':
      return <Wifi className="text-blue-600" size={16} />;
    case 'savings':
      return <PiggyBank className="text-green-600" size={16} />;
    case 'insurance':
      return <Car className="text-purple-600" size={16} />;
    default:
      return <Home className="text-gray-600" size={16} />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'rent':
    case 'housing':
      return 'bg-red-100 dark:bg-red-900';
    case 'internet':
    case 'utilities':
      return 'bg-blue-100 dark:bg-blue-900';
    case 'savings':
      return 'bg-green-100 dark:bg-green-900';
    case 'insurance':
      return 'bg-purple-100 dark:bg-purple-900';
    default:
      return 'bg-gray-100 dark:bg-gray-900';
  }
};

const getDueStatus = (dueDate: Date) => {
  const daysUntilDue = differenceInDays(dueDate, new Date());
  
  if (daysUntilDue < 0) {
    return { text: 'Overdue', color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' };
  } else if (daysUntilDue === 0) {
    return { text: 'Due today', color: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' };
  } else if (daysUntilDue <= 3) {
    return { text: `Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`, color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' };
  } else {
    return { text: 'Auto-pay', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' };
  }
};

export function UpcomingBills({ recurringTransactions }: UpcomingBillsProps) {
  return (
    <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Upcoming Bills & Recurring Transactions
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 hover:text-blue-700 border-blue-600 hover:border-blue-700"
        >
          <Plus size={16} className="mr-1" />
          Add Recurring
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recurringTransactions.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No upcoming bills or recurring transactions. Add some to track your regular expenses.
            </p>
          </div>
        ) : (
          recurringTransactions.slice(0, 4).map((transaction) => {
            const dueStatus = getDueStatus(new Date(transaction.nextDueDate));
            
            return (
              <div key={transaction.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(transaction.category)}`}>
                    {getCategoryIcon(transaction.category)}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${dueStatus.color}`}>
                    {dueStatus.text}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">{transaction.description}</h4>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  ${parseFloat(transaction.amount).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {transaction.frequency.charAt(0).toUpperCase() + transaction.frequency.slice(1)} • Due {format(new Date(transaction.nextDueDate), 'MMM d')}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
