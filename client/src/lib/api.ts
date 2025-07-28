import { apiRequest } from "./queryClient";

export const api = {
  // Dashboard
  getDashboardStats: () => fetch("/api/dashboard-stats").then(res => res.json()),
  
  // Transactions
  getTransactions: () => fetch("/api/transactions").then(res => res.json()),
  createTransaction: (data: any) => apiRequest("POST", "/api/transactions", data),
  updateTransaction: (id: string, data: any) => apiRequest("PUT", `/api/transactions/${id}`, data),
  deleteTransaction: (id: string) => apiRequest("DELETE", `/api/transactions/${id}`),
  
  // Savings Goals
  getSavingsGoals: () => fetch("/api/savings-goals").then(res => res.json()),
  createSavingsGoal: (data: any) => apiRequest("POST", "/api/savings-goals", data),
  updateSavingsGoal: (id: string, data: any) => apiRequest("PUT", `/api/savings-goals/${id}`, data),
  
  // Recurring Transactions
  getRecurringTransactions: () => fetch("/api/recurring-transactions").then(res => res.json()),
  createRecurringTransaction: (data: any) => apiRequest("POST", "/api/recurring-transactions", data),
  
  // Salary Allocation
  getSalaryAllocation: () => fetch("/api/salary-allocation").then(res => res.json()),
  saveSalaryAllocation: (data: any) => apiRequest("POST", "/api/salary-allocation", data),
};
