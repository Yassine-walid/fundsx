import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // 'income', 'expense', 'transfer'
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const savingsGoals = pgTable("savings_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).default("0"),
  monthlyTarget: decimal("monthly_target", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const recurringTransactions = pgTable("recurring_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  frequency: text("frequency").notNull(), // 'weekly', 'monthly', 'yearly'
  nextDueDate: timestamp("next_due_date").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const salaryAllocations = pgTable("salary_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  monthlySalary: decimal("monthly_salary", { precision: 12, scale: 2 }).notNull(),
  essentials: decimal("essentials", { precision: 5, scale: 2 }).notNull(), // percentage
  savings: decimal("savings", { precision: 5, scale: 2 }).notNull(),
  lifestyle: decimal("lifestyle", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
}).extend({
  amount: z.number().positive(),
  date: z.string().or(z.date()),
});

export const insertSavingsGoalSchema = createInsertSchema(savingsGoals).omit({
  id: true,
  createdAt: true,
}).extend({
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).optional(),
  monthlyTarget: z.number().positive().optional(),
});

export const insertRecurringTransactionSchema = createInsertSchema(recurringTransactions).omit({
  id: true,
  createdAt: true,
}).extend({
  amount: z.number().positive(),
  nextDueDate: z.string().or(z.date()),
});

export const insertSalaryAllocationSchema = createInsertSchema(salaryAllocations).omit({
  id: true,
  createdAt: true,
}).extend({
  monthlySalary: z.number().positive(),
  essentials: z.number().min(0).max(100),
  savings: z.number().min(0).max(100),
  lifestyle: z.number().min(0).max(100),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;
export type RecurringTransaction = typeof recurringTransactions.$inferSelect;
export type InsertRecurringTransaction = z.infer<typeof insertRecurringTransactionSchema>;
export type SalaryAllocation = typeof salaryAllocations.$inferSelect;
export type InsertSalaryAllocation = z.infer<typeof insertSalaryAllocationSchema>;
