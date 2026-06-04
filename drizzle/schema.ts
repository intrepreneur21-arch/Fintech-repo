import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** User's current subscription plan */
  planTier: mysqlEnum("planTier", ["free", "starter", "pro"]).default("free").notNull(),
  /** Razorpay customer ID for recurring payments */
  razorpayCustomerId: varchar("razorpayCustomerId", { length: 128 }),
  /** Razorpay subscription ID if user has active subscription */
  razorpaySubscriptionId: varchar("razorpaySubscriptionId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Payment pages created by users via AI prompt
 */
export const paymentPages = mysqlTable("paymentPages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Product/service name */
  productName: varchar("productName", { length: 255 }).notNull(),
  /** Amount in paise (₹1 = 100 paise) */
  amount: int("amount").notNull(),
  /** Product description */
  description: text("description"),
  /** Whether this is a recurring/subscription payment */
  isRecurring: int("isRecurring").default(0).notNull(),
  /** Billing interval if recurring (monthly, yearly, etc) */
  billingInterval: varchar("billingInterval", { length: 32 }),
  /** Contact fields to collect (phone, email, both) */
  contactFields: varchar("contactFields", { length: 50 }).notNull(),
  /** Unique slug for payment page URL */
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  /** Razorpay plan ID if recurring */
  razorpayPlanId: varchar("razorpayPlanId", { length: 128 }),
  /** Page status (active, archived) */
  status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentPage = typeof paymentPages.$inferSelect;
export type InsertPaymentPage = typeof paymentPages.$inferInsert;

/**
 * Customer records for each payment page
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  paymentPageId: int("paymentPageId").notNull(),
  userId: int("userId").notNull(),
  /** Customer phone number */
  phone: varchar("phone", { length: 20 }),
  /** Customer email */
  email: varchar("email", { length: 320 }),
  /** Customer name if provided */
  name: varchar("name", { length: 255 }),
  /** Razorpay customer ID */
  razorpayCustomerId: varchar("razorpayCustomerId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Transaction records for all payments
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  paymentPageId: int("paymentPageId").notNull(),
  customerId: int("customerId").notNull(),
  userId: int("userId").notNull(),
  /** Amount in paise */
  amount: int("amount").notNull(),
  /** Currency (INR) */
  currency: varchar("currency", { length: 3 }).default("INR").notNull(),
  /** Razorpay payment ID */
  razorpayPaymentId: varchar("razorpayPaymentId", { length: 128 }).notNull().unique(),
  /** Razorpay order ID */
  razorpayOrderId: varchar("razorpayOrderId", { length: 128 }),
  /** Transaction status (pending, success, failed, refunded) */
  status: mysqlEnum("status", ["pending", "success", "failed", "refunded"]).default("pending").notNull(),
  /** Payment method (card, upi, netbanking, etc) */
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Invoices generated after successful payments
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: int("transactionId").notNull(),
  userId: int("userId").notNull(),
  customerId: int("customerId").notNull(),
  /** Invoice number for reference */
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  /** Amount in paise */
  amount: int("amount").notNull(),
  /** PDF file storage key */
  pdfStorageKey: varchar("pdfStorageKey", { length: 255 }),
  /** Invoice status */
  status: mysqlEnum("status", ["draft", "sent", "viewed", "paid"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Usage tracking for plan enforcement
 */
export const usageTracking = mysqlTable("usageTracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  /** Number of payment pages created this month */
  pagesCreatedThisMonth: int("pagesCreatedThisMonth").default(0).notNull(),
  /** Number of transactions this month */
  transactionsThisMonth: int("transactionsThisMonth").default(0).notNull(),
  /** Month tracking (YYYY-MM format) */
  currentMonth: varchar("currentMonth", { length: 7 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UsageTracking = typeof usageTracking.$inferSelect;
export type InsertUsageTracking = typeof usageTracking.$inferInsert;
