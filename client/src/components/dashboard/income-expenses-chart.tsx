import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface IncomeExpensesChartProps {
  data: MonthlyData[];
}

export function IncomeExpensesChart({ data }: IncomeExpensesChartProps) {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Income vs Expenses</h3>
        <select className="bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
          <option>Last 6 months</option>
          <option>Last 12 months</option>
          <option>This year</option>
        </select>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="month" 
              className="text-gray-600 dark:text-gray-400" 
            />
            <YAxis 
              className="text-gray-600 dark:text-gray-400"
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              labelClassName="text-gray-900"
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Income"
              dot={{ fill: '#10B981', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#EF4444" 
              strokeWidth={2}
              name="Expenses"
              dot={{ fill: '#EF4444', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
