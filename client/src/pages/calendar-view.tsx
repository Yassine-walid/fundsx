import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { Transaction } from "@shared/schema";

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/transactions"],
    queryFn: api.getTransactions,
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTransactionsForDay = (date: Date) => {
    return transactions.filter((transaction: Transaction) => 
      isSameDay(new Date(transaction.date), date)
    );
  };

  const getDayTotal = (date: Date) => {
    const dayTransactions = getTransactionsForDay(date);
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expenses = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    return { income, expenses, net: income - expenses };
  };

  const monthlyStats = {
    income: transactions
      .filter((t: Transaction) => 
        t.type === 'income' && 
        new Date(t.date) >= monthStart && 
        new Date(t.date) <= monthEnd
      )
      .reduce((sum, t) => sum + parseFloat(t.amount), 0),
    expenses: transactions
      .filter((t: Transaction) => 
        t.type === 'expense' && 
        new Date(t.date) >= monthStart && 
        new Date(t.date) <= monthEnd
      )
      .reduce((sum, t) => sum + parseFloat(t.amount), 0),
    transactionCount: transactions.filter((t: Transaction) => 
      new Date(t.date) >= monthStart && 
      new Date(t.date) <= monthEnd
    ).length
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Calendar View</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualize your expenses and income across time with an intuitive calendar interface.
          </p>
        </div>
        <Button onClick={goToToday} variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Today
        </Button>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ${monthlyStats.income.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              ${monthlyStats.expenses.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {monthlyStats.transactionCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Click on any day to view detailed transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {WEEKDAYS.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayTransactions = getTransactionsForDay(day);
              const dayTotal = getDayTotal(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[100px] p-2 border rounded-lg transition-colors cursor-pointer
                    ${isCurrentMonth 
                      ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700' 
                      : 'bg-gray-100 dark:bg-gray-900 text-gray-400'
                    }
                    ${isToday ? 'ring-2 ring-blue-500' : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      isToday ? 'text-blue-600 font-bold' : 
                      isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {dayTransactions.length > 0 && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {dayTransactions.length}
                      </Badge>
                    )}
                  </div>
                  
                  {dayTransactions.length > 0 && (
                    <div className="space-y-1">
                      {dayTotal.income > 0 && (
                        <div className="text-xs text-green-600 font-medium">
                          +${dayTotal.income.toLocaleString()}
                        </div>
                      )}
                      {dayTotal.expenses > 0 && (
                        <div className="text-xs text-red-600 font-medium">
                          -${dayTotal.expenses.toLocaleString()}
                        </div>
                      )}
                      
                      {/* Show first few transactions */}
                      {dayTransactions.slice(0, 2).map((transaction: Transaction) => (
                        <div key={transaction.id} className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {transaction.description}
                        </div>
                      ))}
                      
                      {dayTransactions.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayTransactions.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-blue-500"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span className="text-green-600">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 rounded"></div>
              <span className="text-red-600">Expenses</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">3</Badge>
              <span>Number of transactions</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
