import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, DollarSign, TrendingDown, TrendingUp, Target, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Transaction } from "@shared/schema";

const budgetFormSchema = z.object({
  budgetAmount: z.number().positive("Budget amount must be positive"),
});

type BudgetFormData = z.infer<typeof budgetFormSchema>;

export default function DailyBudget() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const currentDay = currentDate.getDate();
  
  // Get the number of days in current month
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const remainingDays = daysInMonth - currentDay + 1;

  // Fetch current month's budget
  const { data: monthlyBudget, isLoading: budgetLoading } = useQuery({
    queryKey: ["/api/monthly-budget", currentMonth, currentYear],
    queryFn: () => 
      fetch(`/api/monthly-budget/${currentMonth}/${currentYear}`)
        .then(res => res.json())
        .then(data => data === null ? null : data),
  });

  // Fetch this month's expenses
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    queryFn: api.getTransactions,
  });

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      budgetAmount: monthlyBudget?.budgetAmount ? parseFloat(monthlyBudget.budgetAmount) : 0,
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: (data: { budgetAmount: number }) =>
      fetch("/api/monthly-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: currentMonth,
          year: currentYear,
          budgetAmount: data.budgetAmount,
          spentAmount: currentMonthExpenses,
        }),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/monthly-budget", currentMonth, currentYear] });
      toast({
        title: "Success",
        description: "Monthly budget updated successfully",
      });
      setIsModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update budget",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BudgetFormData) => {
    createBudgetMutation.mutate(data);
  };

  if (budgetLoading || transactionsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Calculate this month's expenses
  const currentMonthExpenses = transactions?.filter((transaction: Transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transaction.type === 'expense' &&
      transactionDate.getMonth() === currentMonth - 1 &&
      transactionDate.getFullYear() === currentYear
    );
  }).reduce((sum: number, transaction: Transaction) => sum + parseFloat(transaction.amount), 0) || 0;

  const budgetAmount = monthlyBudget?.budgetAmount ? parseFloat(monthlyBudget.budgetAmount) : 0;
  const remainingBudget = budgetAmount - currentMonthExpenses;
  const dailyBudget = remainingDays > 0 ? remainingBudget / remainingDays : 0;
  const budgetProgress = budgetAmount > 0 ? (currentMonthExpenses / budgetAmount) * 100 : 0;

  // Today's expenses
  const todayExpenses = transactions?.filter((transaction: Transaction) => {
    const transactionDate = new Date(transaction.date);
    const today = new Date();
    return (
      transaction.type === 'expense' &&
      transactionDate.toDateString() === today.toDateString()
    );
  }).reduce((sum: number, transaction: Transaction) => sum + parseFloat(transaction.amount), 0) || 0;

  const isOverBudget = currentMonthExpenses > budgetAmount;
  const isOverDailyBudget = todayExpenses > dailyBudget;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Daily Budget Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your daily spending and stay within your monthly budget.
          </p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Target className="mr-2 h-4 w-4" />
              Set Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Set Monthly Budget</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="budgetAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Budget Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="2000"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createBudgetMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createBudgetMutation.isPending ? "Saving..." : "Save Budget"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today's Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              ${dailyBudget.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Remaining for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Today's Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${isOverDailyBudget ? 'text-red-600' : 'text-green-600'}`}>
              ${todayExpenses.toFixed(2)}
            </p>
            {isOverDailyBudget && (
              <Badge variant="destructive" className="mt-1">
                Over daily budget
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Monthly Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              ${currentMonthExpenses.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              of ${budgetAmount.toFixed(2)} budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Days Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {remainingDays}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              days left this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Monthly Budget Progress
          </CardTitle>
          <CardDescription>
            Track your spending against your monthly budget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Budget Progress</span>
              <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                {Math.round(budgetProgress)}%
              </span>
            </div>
            <Progress 
              value={Math.min(budgetProgress, 100)} 
              className={isOverBudget ? "bg-red-100" : ""} 
            />
            
            {isOverBudget && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700 dark:text-red-400">
                  You've exceeded your monthly budget by ${(currentMonthExpenses - budgetAmount).toFixed(2)}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Remaining Budget</p>
                <p className={`font-medium ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${remainingBudget.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Average Daily Budget</p>
                <p className="font-medium">
                  ${(budgetAmount / daysInMonth).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Budget Set State */}
      {!monthlyBudget && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No budget set for this month
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Set a monthly budget to start tracking your daily spending and stay on target.
            </p>
            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Target className="mr-2 h-4 w-4" />
              Set Your First Budget
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}