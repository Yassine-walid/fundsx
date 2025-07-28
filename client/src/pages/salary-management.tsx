import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DollarSign, PieChart } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const formSchema = z.object({
  monthlySalary: z.number().positive("Monthly salary must be positive"),
  essentials: z.number().min(0).max(100),
  savings: z.number().min(0).max(100),
  lifestyle: z.number().min(0).max(100),
}).refine((data) => {
  const total = data.essentials + data.savings + data.lifestyle;
  return total === 100;
}, {
  message: "Allocations must add up to 100%",
  path: ["essentials"],
});

type FormData = z.infer<typeof formSchema>;

export default function SalaryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: salaryAllocation, isLoading } = useQuery({
    queryKey: ["/api/salary-allocation"],
    queryFn: api.getSalaryAllocation,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlySalary: 0,
      essentials: 60,
      savings: 25,
      lifestyle: 15,
    },
  });

  const mutation = useMutation({
    mutationFn: api.saveSalaryAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/salary-allocation"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-stats"] });
      toast({
        title: "Success",
        description: "Salary allocation saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save salary allocation",
        variant: "destructive",
      });
    },
  });

  // Set form values when data loads
  useState(() => {
    if (salaryAllocation && !form.formState.isDirty) {
      form.reset({
        monthlySalary: parseFloat(salaryAllocation.monthlySalary),
        essentials: parseFloat(salaryAllocation.essentials),
        savings: parseFloat(salaryAllocation.savings),
        lifestyle: parseFloat(salaryAllocation.lifestyle),
      });
    }
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const watchedValues = form.watch();
  const totalPercentage = watchedValues.essentials + watchedValues.savings + watchedValues.lifestyle;

  const essentialsAmount = (watchedValues.monthlySalary * watchedValues.essentials) / 100;
  const savingsAmount = (watchedValues.monthlySalary * watchedValues.savings) / 100;
  const lifestyleAmount = (watchedValues.monthlySalary * watchedValues.lifestyle) / 100;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Salary Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Set your monthly salary and allocate it across different categories to manage your budget effectively.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Salary Allocation
            </CardTitle>
            <CardDescription>
              Configure your monthly salary and how you want to allocate it across different spending categories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="monthlySalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Salary</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter your monthly salary"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="essentials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Essentials ({field.value}%)</FormLabel>
                        <FormControl>
                          <Slider
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </FormControl>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Rent, groceries, utilities, transportation
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="savings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Savings ({field.value}%)</FormLabel>
                        <FormControl>
                          <Slider
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </FormControl>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Emergency fund, investments, retirement
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lifestyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lifestyle ({field.value}%)</FormLabel>
                        <FormControl>
                          <Slider
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </FormControl>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Entertainment, dining out, hobbies, shopping
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Total Allocation:</span>
                    <span className={`font-bold ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalPercentage}%
                    </span>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={mutation.isPending || totalPercentage !== 100}
                    className="w-full"
                  >
                    {mutation.isPending ? "Saving..." : "Save Allocation"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Allocation Breakdown
            </CardTitle>
            <CardDescription>
              Visual breakdown of your salary allocation across different categories.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${watchedValues.monthlySalary.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Monthly Salary</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Essentials</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{watchedValues.essentials}%</p>
                  </div>
                  <p className="text-xl font-bold text-blue-600">
                    ${essentialsAmount.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Savings</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{watchedValues.savings}%</p>
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    ${savingsAmount.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Lifestyle</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{watchedValues.lifestyle}%</p>
                  </div>
                  <p className="text-xl font-bold text-purple-600">
                    ${lifestyleAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full flex">
                    <div className="bg-blue-500" style={{ width: `${watchedValues.essentials}%` }}></div>
                    <div className="bg-green-500" style={{ width: `${watchedValues.savings}%` }}></div>
                    <div className="bg-purple-500" style={{ width: `${watchedValues.lifestyle}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <span>Essentials</span>
                  <span>Savings</span>
                  <span>Lifestyle</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
