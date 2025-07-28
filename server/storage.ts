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
  type InsertSalaryAllocation,
  users,
  transactions,
  savingsGoals,
  recurringTransactions,
  salaryAllocations
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  private async initializeDemoData() {
    // Check if demo user already exists
    const existingUser = await this.getUserByUsername("demo");
    if (existingUser) {
      return; // Demo data already exists
    }

    // Create demo user
    const demoUser = await this.createUser({
      username: "demo",
      password: "password"
    });

    // Create demo salary allocation
    await this.createOrUpdateSalaryAllocation({
      userId: demoUser.id,
      monthlySalary: 5200,
      essentials: 60,
      savings: 25,
      lifestyle: 15
    });

    // Create demo savings goals
    await this.createSavingsGoal({
      userId: demoUser.id,
      name: "Emergency Fund",
      targetAmount: 10000,
      currentAmount: 3500,
      monthlyTarget: 500
    });

    await this.createSavingsGoal({
      userId: demoUser.id,
      name: "New Car",
      targetAmount: 25000,
      currentAmount: 8200,
      monthlyTarget: 800
    });

    await this.createSavingsGoal({
      userId: demoUser.id,
      name: "Vacation",
      targetAmount: 5000,
      currentAmount: 1800,
      monthlyTarget: 300
    });

    // Create some sample transactions
    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    await this.createTransaction({
      userId: demoUser.id,
      type: "income",
      amount: 5200,
      category: "Salary",
      description: "Monthly Salary",
      date: currentMonth
    });

    await this.createTransaction({
      userId: demoUser.id,
      type: "expense",
      amount: 1200,
      category: "Bills & Utilities",
      description: "Rent Payment",
      date: new Date(currentMonth.getTime() + 86400000) // next day
    });

    await this.createTransaction({
      userId: demoUser.id,
      type: "expense",
      amount: 65,
      category: "Food & Dining",
      description: "Grocery Shopping",
      date: new Date(currentMonth.getTime() + 172800000) // 2 days later
    });

    await this.createTransaction({
      userId: demoUser.id,
      type: "expense",
      amount: 45,
      category: "Transport",
      description: "Gas Station",
      date: new Date(currentMonth.getTime() + 259200000) // 3 days later
    });

    // Create sample recurring transactions
    await this.createRecurringTransaction({
      userId: demoUser.id,
      type: "expense",
      amount: 1200,
      category: "Rent",
      description: "Monthly Rent",
      frequency: "monthly",
      nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1)
    });

    await this.createRecurringTransaction({
      userId: demoUser.id,
      type: "expense",
      amount: 89,
      category: "Utilities",
      description: "Internet Bill",
      frequency: "monthly",
      nextDueDate: new Date(today.getFullYear(), today.getMonth(), 15)
    });
  }

  constructor() {
    // Initialize demo data when the storage is created
    this.initializeDemoData().catch(console.error);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Transaction methods
  async getTransactions(userId: string): Promise<Transaction[]> {
    return await db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(transactions.date);
  }

  async getTransactionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await db.select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .orderBy(transactions.date);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values({
      ...insertTransaction,
      amount: insertTransaction.amount.toString(),
      date: new Date(insertTransaction.date)
    }).returning();
    return transaction;
  }

  async updateTransaction(id: string, updateData: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const updateValues: any = { ...updateData };
    if (updateData.amount) updateValues.amount = updateData.amount.toString();
    if (updateData.date) updateValues.date = new Date(updateData.date);

    const [transaction] = await db.update(transactions)
      .set(updateValues)
      .where(eq(transactions.id, id))
      .returning();
    return transaction || undefined;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id));
    return result.rowCount > 0;
  }

  // Savings goal methods
  async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    return await db.select()
      .from(savingsGoals)
      .where(eq(savingsGoals.userId, userId))
      .orderBy(savingsGoals.createdAt);
  }

  async createSavingsGoal(insertGoal: InsertSavingsGoal): Promise<SavingsGoal> {
    const [goal] = await db.insert(savingsGoals).values({
      ...insertGoal,
      targetAmount: insertGoal.targetAmount.toString(),
      currentAmount: (insertGoal.currentAmount || 0).toString(),
      monthlyTarget: insertGoal.monthlyTarget?.toString() || null
    }).returning();
    return goal;
  }

  async updateSavingsGoal(id: string, updateData: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined> {
    const updateValues: any = { ...updateData };
    if (updateData.targetAmount) updateValues.targetAmount = updateData.targetAmount.toString();
    if (updateData.currentAmount !== undefined) updateValues.currentAmount = updateData.currentAmount.toString();
    if (updateData.monthlyTarget) updateValues.monthlyTarget = updateData.monthlyTarget.toString();

    const [goal] = await db.update(savingsGoals)
      .set(updateValues)
      .where(eq(savingsGoals.id, id))
      .returning();
    return goal || undefined;
  }

  async deleteSavingsGoal(id: string): Promise<boolean> {
    const result = await db.delete(savingsGoals).where(eq(savingsGoals.id, id));
    return result.rowCount > 0;
  }

  // Recurring transaction methods
  async getRecurringTransactions(userId: string): Promise<RecurringTransaction[]> {
    return await db.select()
      .from(recurringTransactions)
      .where(eq(recurringTransactions.userId, userId))
      .orderBy(recurringTransactions.nextDueDate);
  }

  async createRecurringTransaction(insertTransaction: InsertRecurringTransaction): Promise<RecurringTransaction> {
    const [transaction] = await db.insert(recurringTransactions).values({
      ...insertTransaction,
      amount: insertTransaction.amount.toString(),
      nextDueDate: new Date(insertTransaction.nextDueDate)
    }).returning();
    return transaction;
  }

  async updateRecurringTransaction(id: string, updateData: Partial<InsertRecurringTransaction>): Promise<RecurringTransaction | undefined> {
    const updateValues: any = { ...updateData };
    if (updateData.amount) updateValues.amount = updateData.amount.toString();
    if (updateData.nextDueDate) updateValues.nextDueDate = new Date(updateData.nextDueDate);

    const [transaction] = await db.update(recurringTransactions)
      .set(updateValues)
      .where(eq(recurringTransactions.id, id))
      .returning();
    return transaction || undefined;
  }

  async deleteRecurringTransaction(id: string): Promise<boolean> {
    const result = await db.delete(recurringTransactions).where(eq(recurringTransactions.id, id));
    return result.rowCount > 0;
  }

  // Salary allocation methods
  async getSalaryAllocation(userId: string): Promise<SalaryAllocation | undefined> {
    const [allocation] = await db.select()
      .from(salaryAllocations)
      .where(eq(salaryAllocations.userId, userId));
    return allocation || undefined;
  }

  async createOrUpdateSalaryAllocation(insertAllocation: InsertSalaryAllocation): Promise<SalaryAllocation> {
    const existing = await this.getSalaryAllocation(insertAllocation.userId);
    
    const allocationData = {
      ...insertAllocation,
      monthlySalary: insertAllocation.monthlySalary.toString(),
      essentials: insertAllocation.essentials.toString(),
      savings: insertAllocation.savings.toString(),
      lifestyle: insertAllocation.lifestyle.toString()
    };

    if (existing) {
      const [allocation] = await db.update(salaryAllocations)
        .set(allocationData)
        .where(eq(salaryAllocations.userId, insertAllocation.userId))
        .returning();
      return allocation;
    } else {
      const [allocation] = await db.insert(salaryAllocations)
        .values(allocationData)
        .returning();
      return allocation;
    }
  }
}

export const storage = new DatabaseStorage();
