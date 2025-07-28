import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTransactionSchema,
  insertSavingsGoalSchema,
  insertRecurringTransactionSchema,
  insertSalaryAllocationSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Demo user ID for simplified authentication
  const DEMO_USER_ID = "demo-user-1";

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions(DEMO_USER_ID);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID
      });
      const transaction = await storage.createTransaction(validatedData);
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create transaction" });
      }
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(id, validatedData);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update transaction" });
      }
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTransaction(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Savings goals routes
  app.get("/api/savings-goals", async (req, res) => {
    try {
      const goals = await storage.getSavingsGoals(DEMO_USER_ID);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch savings goals" });
    }
  });

  app.post("/api/savings-goals", async (req, res) => {
    try {
      const validatedData = insertSavingsGoalSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID
      });
      const goal = await storage.createSavingsGoal(validatedData);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid savings goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create savings goal" });
      }
    }
  });

  app.put("/api/savings-goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertSavingsGoalSchema.partial().parse(req.body);
      const goal = await storage.updateSavingsGoal(id, validatedData);
      
      if (!goal) {
        return res.status(404).json({ message: "Savings goal not found" });
      }
      
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid savings goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update savings goal" });
      }
    }
  });

  // Recurring transactions routes
  app.get("/api/recurring-transactions", async (req, res) => {
    try {
      const transactions = await storage.getRecurringTransactions(DEMO_USER_ID);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recurring transactions" });
    }
  });

  app.post("/api/recurring-transactions", async (req, res) => {
    try {
      const validatedData = insertRecurringTransactionSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID
      });
      const transaction = await storage.createRecurringTransaction(validatedData);
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid recurring transaction data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create recurring transaction" });
      }
    }
  });

  // Salary allocation routes
  app.get("/api/salary-allocation", async (req, res) => {
    try {
      const allocation = await storage.getSalaryAllocation(DEMO_USER_ID);
      res.json(allocation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch salary allocation" });
    }
  });

  app.post("/api/salary-allocation", async (req, res) => {
    try {
      const validatedData = insertSalaryAllocationSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID
      });
      const allocation = await storage.createOrUpdateSalaryAllocation(validatedData);
      res.json(allocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid salary allocation data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save salary allocation" });
      }
    }
  });

  // Dashboard stats route
  app.get("/api/dashboard-stats", async (req, res) => {
    try {
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const transactions = await storage.getTransactionsByDateRange(DEMO_USER_ID, startOfMonth, endOfMonth);
      const allTransactions = await storage.getTransactions(DEMO_USER_ID);
      const savingsGoals = await storage.getSavingsGoals(DEMO_USER_ID);
      const salaryAllocation = await storage.getSalaryAllocation(DEMO_USER_ID);

      const monthlyIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const monthlyExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const totalSaved = savingsGoals
        .reduce((sum, goal) => sum + parseFloat(goal.currentAmount || "0"), 0);

      const monthlySalary = parseFloat(salaryAllocation?.monthlySalary || "0");
      const budgetUsed = monthlySalary > 0 ? (monthlyExpenses / monthlySalary) * 100 : 0;

      // Calculate category expenses
      const categoryExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
          return acc;
        }, {} as Record<string, number>);

      // Get recent transactions (last 10)
      const recentTransactions = allTransactions.slice(0, 10);

      // Calculate monthly data for chart (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i + 1, 0);
        const monthTransactions = await storage.getTransactionsByDateRange(DEMO_USER_ID, monthStart, monthEnd);
        
        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        const expenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        monthlyData.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
          income,
          expenses
        });
      }

      res.json({
        monthlyIncome,
        monthlyExpenses,
        totalSaved,
        budgetUsed,
        categoryExpenses,
        recentTransactions,
        monthlyData,
        savingsGoals
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
