interface ExpensesByCategoryProps {
  categoryExpenses: Record<string, number>;
}

export function ExpensesByCategory({ categoryExpenses }: ExpensesByCategoryProps) {
  const categories = Object.entries(categoryExpenses)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  const total = categories.reduce((sum, [, amount]) => sum + amount, 0);
  
  const categoryColors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-red-500',
    'bg-yellow-500'
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Expenses by Category</h3>
        <select className="bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
          <option>This month</option>
          <option>Last month</option>
          <option>Last 3 months</option>
        </select>
      </div>
      
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No expenses to display for this period.
            </p>
          </div>
        ) : (
          categories.map(([category, amount], index) => {
            const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
            
            return (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${categoryColors[index]}`}></div>
                  <span className="text-gray-700 dark:text-gray-300">{category}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ${amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{percentage}%</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {categories.length > 0 && (
        <div className="mt-6">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full flex">
              {categories.map(([category, amount], index) => {
                const percentage = total > 0 ? (amount / total) * 100 : 0;
                return (
                  <div 
                    key={category}
                    className={categoryColors[index]} 
                    style={{ width: `${percentage}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
