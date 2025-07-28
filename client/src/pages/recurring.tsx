import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, addWeeks, addMonths, addYears, differenceInDays } from "date-fns";
import { Plus, RotateCcw, Calendar, Edit, Trash2, Home, Wifi, PiggyBank, Car } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { RecurringTransaction } from "@shared/schema";

const formSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  frequency: z.enum(["weekly", "monthly", "yearly"]),
  nextDueDate: z.string().min(1, "Next due date is required"),
});

type FormData = z.infer<typeof formSchema>;

const categories = [
  "Rent",
  "Utilities",
  "Internet",
  "Insurance",
  "Subscriptions",
  "Salary",
  "Investment",
  "Bills & Utilities",
  "Food & Dining",
  "Transport",
  "Healthcare",
  "Other"
];

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'rent':
    case 'housing':
      return <Home className="text-red-600" size={16} />;
    case 'internet':
    case 'utilities':
      return <Wifi className="text-blue-600" size={16} />;
    case 'savings':
    case 'investment':
      return <PiggyBank className="text-green-600" size={16} />;
    case 'insurance':
      return <Car className="text-purple-600" size={16} />;
    default:
      return <RotateCcw className="text-gray-600" size={16} />;
  }
};

const getCategoryColor = (category: string, type: string) => {
  if (type === 'income') return 'bg-green-100 dark:bg-green-900';
  
  switch (category.toLowerCase()) {
    case 'rent':
    case 'housing':
      return 'bg-red-100 dark:bg-red-900';
    case 'internet':
    case 'utilities':
      return 'bg-blue-100 dark:bg-blue-900';
    case 'savings':
    case 'investment':
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
  } else if (daysUntilDue <= 7) {
    return { text: `Due in ${daysUntilDue} days`, color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' };
  } else {
    return { text: 'Scheduled', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' };
  }
};

export default function Recurring() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recurringTransactions = [], isLoading } = useQuery({
    queryKey: ["/api/recurring-transactions"],
    queryFn: api.getRecurringTransactions,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      category: "",
      description: "",
      frequency: "monthly",
      nextDueDate: new Date().toISOString().split('T')[0],
    },
  });

  const createMutation = useMutation({
    mutationFn: api.createRecurringTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-stats"] });
      toast({
        title: "Success",
        description: "Recurring transaction created successfully",
      });
      form.reset();
      setIsModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create recurring transaction",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  const totalMonthlyExpenses = recurringTransactions
    .filter((t: RecurringTransaction) => t.type === 'expense')
    .reduce((sum, t) => {
      const amount = parseFloat(t.amount);
      switch (t.frequency) {
        case 'weekly':
          return sum + (amount * 4.33); // Average weeks per month
        case 'yearly':
          return sum + (amount / 12);
        default:
          return sum + amount;
      }
    }, 0);

  const totalMonthlyIncome = recurringTransactions
    .filter((t: RecurringTransaction) => t.type === 'income')
    .reduce((sum, t) => {
      const amount = parseFloat(t.amount);
      switch (t.frequency) {
        case 'weekly':
          return sum + (amount * 4.33);
        case 'yearly':
          return sum + (amount / 12);
        default:
          return sum + amount;
      }
    }, 0);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Recurring Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your regular bills, subscriptions, and automatic payments.
          </p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Recurring
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Recurring Transaction</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transaction type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Transaction description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextDueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Transaction"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Active Recurring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {recurringTransactions.filter((t: RecurringTransaction) => t.isActive).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Monthly Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ${totalMonthlyIncome.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              ${totalMonthlyExpenses.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recurring Transactions Grid */}
      {recurringTransactions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <RotateCcw className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No recurring transactions yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Set up your bills and regular payments to automate your financial tracking.
            </p>
            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Recurring Transaction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recurringTransactions.map((transaction: RecurringTransaction) => {
            const dueStatus = getDueStatus(new Date(transaction.nextDueDate));
            const amount = parseFloat(transaction.amount);
            
            return (
              <Card key={transaction.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(transaction.category, transaction.type)}`}>
                        {getCategoryIcon(transaction.category)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{transaction.description}</CardTitle>
                        <CardDescription>{transaction.category}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${amount.toLocaleString()}
                      </span>
                      <Badge variant="outline" className={dueStatus.color}>
                        {dueStatus.text}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Frequency</p>
                        <p className="font-medium capitalize">{transaction.frequency}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Next Due</p>
                        <p className="font-medium">{format(new Date(transaction.nextDueDate), 'MMM d, yyyy')}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {transaction.frequency.charAt(0).toUpperCase() + transaction.frequency.slice(1)} payment
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
