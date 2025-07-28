import { 
  type User, 
  type InsertUser,
  type Transaction,
  type InsertTransaction,
  type SavingsGoal,
  type InsertSavingsGoal,
  type RecurringTransaction,
  type InsertRecurringTransaction,
  type SalaryAllocation,
  type InsertSalaryAllocation
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Transaction methods
  getTransactions(userId: string): Promise<Transaction[]>;
  getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;

  // Savings goal methods
  getSavingsGoals(userId: string): Promise<SavingsGoal[]>;
  createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateSavingsGoal(id: string, goal: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined>;
  deleteSavingsGoal(id: string): Promise<boolean>;

  // Recurring transaction methods
  getRecurringTransactions(userId: string): Promise<RecurringTransaction[]>;
  createRecurringTransaction(transaction: InsertRecurringTransaction): Promise<RecurringTransaction>;
  updateRecurringTransaction(id: string, transaction: Partial<InsertRecurringTransaction>): Promise<RecurringTransaction | undefined>;
  deleteRecurringTransaction(id: string): Promise<boolean>;

  // Salary allocation methods
  getSalaryAllocation(userId: string): Promise<SalaryAllocation | undefined>;
  createOrUpdateSalaryAllocation(allocation: InsertSalaryAllocation): Promise<SalaryAllocation>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private transactions: Map<string, Transaction>;
  private savingsGoals: Map<string, SavingsGoal>;
  private recurringTransactions: Map<string, RecurringTransaction>;
  private salaryAllocations: Map<string, SalaryAllocation>;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.savingsGoals = new Map();
    this.recurringTransactions = new Map();
    this.salaryAllocations = new Map();
    
    // Initialize with demo user and data
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Create demo user
    const demoUser: User = {
      id: "demo-user-1",
      username: "demo",
      password: "password"
    };
    this.users.set(demoUser.id, demoUser);

    // Create demo salary allocation
    const salaryAllocation: SalaryAllocation = {
      id: randomUUID(),
      userId: demoUser.id,
      monthlySalary: "5200.00",
      essentials: "60.00",
      savings: "25.00",
      lifestyle: "15.00",
      createdAt: new Date()
    };
    this.salaryAllocations.set(demoUser.id, salaryAllocation);

    // Create demo savings goals
    const emergencyFund: SavingsGoal = {
      id: randomUUID(),
      userId: demoUser.id,
      name: "Emergency Fund",
      targetAmount: "10000.00",
      currentAmount: "3500.00",
      monthlyTarget: "500.00",
      createdAt: new Date()
    };
    this.savingsGoals.set(emergencyFund.id, emergencyFund);

    const carGoal: SavingsGoal = {
      id: randomUUID(),
      userId: demoUser.id,
      name: "New Car",
      targetAmount: "25000.00",
      currentAmount: "8200.00",
      monthlyTarget: "800.00",
      createdAt: new Date()
    };
    this.savingsGoals.set(carGoal.id, carGoal);

    const vacationGoal: SavingsGoal = {
      id: randomUUID(),
      userId: demoUser.id,
      name: "Vacation",
      targetAmount: "5000.00",
      currentAmount: "1800.00",
      monthlyTarget: "300.00",
      createdAt: new Date()
    };
    this.savingsGoals.set(vacationGoal.id, vacationGoal);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Transaction methods
  async getTransactions(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => 
        transaction.userId === userId &&
        new Date(transaction.date) >= startDate &&
        new Date(transaction.date) <= endDate
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      amount: insertTransaction.amount.toString(),
      date: new Date(insertTransaction.date),
      createdAt: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updateData: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const updated = {
      ...transaction,
      ...updateData,
      ...(updateData.amount && { amount: updateData.amount.toString() }),
      ...(updateData.date && { date: new Date(updateData.date) })
    };
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Savings goal methods
  async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    return Array.from(this.savingsGoals.values())
      .filter(goal => goal.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createSavingsGoal(insertGoal: InsertSavingsGoal): Promise<SavingsGoal> {
    const id = randomUUID();
    const goal: SavingsGoal = {
      ...insertGoal,
      id,
      targetAmount: insertGoal.targetAmount.toString(),
      currentAmount: (insertGoal.currentAmount || 0).toString(),
      monthlyTarget: insertGoal.monthlyTarget?.toString() || null,
      createdAt: new Date()
    };
    this.savingsGoals.set(id, goal);
    return goal;
  }

  async updateSavingsGoal(id: string, updateData: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined> {
    const goal = this.savingsGoals.get(id);
    if (!goal) return undefined;

    const updated = {
      ...goal,
      ...updateData,
      ...(updateData.targetAmount && { targetAmount: updateData.targetAmount.toString() }),
      ...(updateData.currentAmount !== undefined && { currentAmount: updateData.currentAmount.toString() }),
      ...(updateData.monthlyTarget && { monthlyTarget: updateData.monthlyTarget.toString() })
    };
    this.savingsGoals.set(id, updated);
    return updated;
  }

  async deleteSavingsGoal(id: string): Promise<boolean> {
    return this.savingsGoals.delete(id);
  }

  // Recurring transaction methods
  async getRecurringTransactions(userId: string): Promise<RecurringTransaction[]> {
    return Array.from(this.recurringTransactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  }

  async createRecurringTransaction(insertTransaction: InsertRecurringTransaction): Promise<RecurringTransaction> {
    const id = randomUUID();
    const transaction: RecurringTransaction = {
      ...insertTransaction,
      id,
      amount: insertTransaction.amount.toString(),
      nextDueDate: new Date(insertTransaction.nextDueDate),
      isActive: true,
      createdAt: new Date()
    };
    this.recurringTransactions.set(id, transaction);
    return transaction;
  }

  async updateRecurringTransaction(id: string, updateData: Partial<InsertRecurringTransaction>): Promise<RecurringTransaction | undefined> {
    const transaction = this.recurringTransactions.get(id);
    if (!transaction) return undefined;

    const updated = {
      ...transaction,
      ...updateData,
      ...(updateData.amount && { amount: updateData.amount.toString() }),
      ...(updateData.nextDueDate && { nextDueDate: new Date(updateData.nextDueDate) })
    };
    this.recurringTransactions.set(id, updated);
    return updated;
  }

  async deleteRecurringTransaction(id: string): Promise<boolean> {
    return this.recurringTransactions.delete(id);
  }

  // Salary allocation methods
  async getSalaryAllocation(userId: string): Promise<SalaryAllocation | undefined> {
    return this.salaryAllocations.get(userId);
  }

  async createOrUpdateSalaryAllocation(insertAllocation: InsertSalaryAllocation): Promise<SalaryAllocation> {
    const existing = this.salaryAllocations.get(insertAllocation.userId);
    const id = existing?.id || randomUUID();
    
    const allocation: SalaryAllocation = {
      ...insertAllocation,
      id,
      monthlySalary: insertAllocation.monthlySalary.toString(),
      essentials: insertAllocation.essentials.toString(),
      savings: insertAllocation.savings.toString(),
      lifestyle: insertAllocation.lifestyle.toString(),
      createdAt: existing?.createdAt || new Date()
    };
    
    this.salaryAllocations.set(insertAllocation.userId, allocation);
    return allocation;
  }
}

export const storage = new MemStorage();
