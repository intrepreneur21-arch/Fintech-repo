/**
 * Payment Pages Router
 * Handles CRUD operations for payment pages and transactions
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  paymentPages,
  transactions,
  customers,
  usageTracking,
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { parsePrompt } from "../promptParser";

/**
 * Create a new payment page from a natural language prompt
 */
export const createPaymentPageProcedure = protectedProcedure
  .input(
    z.object({
      prompt: z.string(),
      language: z.enum(["en", "hi", "mr"]).default("en"),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    // Get user's current usage
    const usage = await db
      .select()
      .from(usageTracking)
      .where(eq(usageTracking.userId, ctx.user.id))
      .limit(1);

    const currentUsage = usage[0];
    if (!currentUsage) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Usage tracking not found",
      });
    }

    // Check plan limits based on user's planTier
    const maxPages =
      ctx.user.planTier === "free"
        ? 1
        : ctx.user.planTier === "starter"
          ? 5
          : Infinity;

    if (currentUsage.pagesCreatedThisMonth >= maxPages) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You have reached the limit of ${maxPages} payment page${maxPages !== 1 ? "s" : ""} on your ${ctx.user.planTier} plan.`,
      });
    }

    // Parse the prompt
    const parsed = await parsePrompt(input.prompt);

    // Create payment page
    const slug = `${parsed.productName
      .toLowerCase()
      .replace(/\s+/g, "-")}-${Date.now()}`;

    const result = await db.insert(paymentPages).values({
      userId: ctx.user.id,
      productName: parsed.productName,
      description: parsed.description || "",
      amount: parsed.amount,
      isRecurring: parsed.isRecurring ? 1 : 0,
      billingInterval: parsed.isRecurring
        ? parsed.billingInterval || "monthly"
        : undefined,
      contactFields: parsed.contactFields,
      slug,
      status: "active",
    });

    // Increment page count
    await db
      .update(usageTracking)
      .set({
        pagesCreatedThisMonth: currentUsage.pagesCreatedThisMonth + 1,
      })
      .where(eq(usageTracking.userId, ctx.user.id));

    // Fetch and return the created page
    const pages = await db
      .select()
      .from(paymentPages)
      .where(eq(paymentPages.id, result[0].insertId))
      .limit(1);

    if (!pages[0]) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return {
      id: pages[0].id,
      productName: pages[0].productName,
      amount: pages[0].amount,
      isRecurring: pages[0].isRecurring === 1,
      status: pages[0].status,
      slug: pages[0].slug,
      createdAt: pages[0].createdAt,
    };
  });

/**
 * Get all payment pages for the user
 */
export const listPaymentPagesProcedure = protectedProcedure.query(
  async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const pages = await db
      .select()
      .from(paymentPages)
      .where(eq(paymentPages.userId, ctx.user.id))
      .orderBy(desc(paymentPages.createdAt));

    return pages.map((page) => ({
      id: page.id,
      productName: page.productName,
      amount: page.amount,
      isRecurring: page.isRecurring === 1,
      status: page.status,
      slug: page.slug,
      createdAt: page.createdAt,
      transactionCount: 0,
    }));
  }
);

/**
 * Get a single payment page with transaction history
 */
export const getPaymentPageProcedure = protectedProcedure
  .input(z.object({ pageId: z.number() }))
  .query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const page = await db
      .select()
      .from(paymentPages)
      .where(
        and(
          eq(paymentPages.id, input.pageId),
          eq(paymentPages.userId, ctx.user.id)
        )
      )
      .limit(1);

    if (!page[0]) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    // Get transaction count
    const txnCount = await db
      .select({ count: sql`COUNT(*)` })
      .from(transactions)
      .where(eq(transactions.paymentPageId, input.pageId));

    return {
      id: page[0].id,
      productName: page[0].productName,
      description: page[0].description,
      amount: page[0].amount,
      isRecurring: page[0].isRecurring === 1,
      contactFields: page[0].contactFields.split(","),
      status: page[0].status,
      slug: page[0].slug,
      createdAt: page[0].createdAt,
      transactionCount: Number(txnCount[0]?.count || 0),
    };
  });

/**
 * Get transaction history for a payment page
 */
export const getTransactionsProcedure = protectedProcedure
  .input(
    z.object({
      pageId: z.number(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    })
  )
  .query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    // Verify page ownership
    const page = await db
      .select()
      .from(paymentPages)
      .where(
        and(
          eq(paymentPages.id, input.pageId),
          eq(paymentPages.userId, ctx.user.id)
        )
      )
      .limit(1);

    if (!page[0]) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const txns = await db
      .select()
      .from(transactions)
      .where(eq(transactions.paymentPageId, input.pageId))
      .orderBy(desc(transactions.createdAt))
      .limit(input.limit)
      .offset(input.offset);

    return txns.map((txn) => ({
      id: txn.id,
      customerId: txn.customerId,
      amount: txn.amount,
      status: txn.status,
      paymentMethod: txn.paymentMethod,
      razorpayPaymentId: txn.razorpayPaymentId,
      createdAt: txn.createdAt,
    }));
  });

/**
 * Get dashboard analytics
 */
export const getDashboardAnalyticsProcedure = protectedProcedure.query(
  async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    // Get total pages
    const pageCount = await db
      .select({ count: sql`COUNT(*)` })
      .from(paymentPages)
      .where(eq(paymentPages.userId, ctx.user.id));

    // Get total transactions
    const txnCount = await db
      .select({ count: sql`COUNT(*)` })
      .from(transactions)
      .where(eq(transactions.userId, ctx.user.id));

    // Get total revenue
    const revenue = await db
      .select({ total: sql`SUM(amount)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, ctx.user.id),
          eq(transactions.status, "success")
        )
      );

    // Get usage tracking
    const usage = await db
      .select()
      .from(usageTracking)
      .where(eq(usageTracking.userId, ctx.user.id))
      .limit(1);

    const currentUsage = usage[0];
    const user = ctx.user;

    return {
      totalPages: Number(pageCount[0]?.count || 0),
      totalTransactions: Number(txnCount[0]?.count || 0),
      totalRevenue: Number(revenue[0]?.total || 0),
      currentPlan: user.planTier || "free",
      pagesUsed: currentUsage?.pagesCreatedThisMonth || 0,
      transactionsUsed: currentUsage?.transactionsThisMonth || 0,
    };
  }
);

/**
 * Get a payment page by slug (public endpoint for customers)
 */
export const getBySlugProcedure = protectedProcedure
  .input(z.object({ slug: z.string() }))
  .query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const page = await db
      .select()
      .from(paymentPages)
      .where(eq(paymentPages.slug, input.slug))
      .limit(1);

    if (!page[0]) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return {
      id: page[0].id,
      productName: page[0].productName,
      description: page[0].description,
      amount: page[0].amount,
      isRecurring: page[0].isRecurring === 1,
      contactFields: page[0].contactFields.split(","),
      slug: page[0].slug,
    };
  });

/**
 * Get recent transactions across all pages
 */
export const getRecentTransactionsProcedure = protectedProcedure
  .input(
    z.object({
      limit: z.number().default(10),
    })
  )
  .query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const txns = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, ctx.user.id))
      .orderBy(desc(transactions.createdAt))
      .limit(input.limit);

    // Get customer info for each transaction
    const customerIdSet = new Set(txns.map((t) => t.customerId));
    const customerIds = Array.from(customerIdSet);
    const customerMap = new Map();

    if (customerIds.length > 0) {
      const custData = await db
        .select()
        .from(customers)
        .where(sql`${customers.id} IN (${sql.raw(customerIds.join(","))})`);
      custData.forEach((c) => customerMap.set(c.id, c));
    }

    return txns.map((txn) => {
      const cust = customerMap.get(txn.customerId);
      return {
        id: txn.id,
        amount: txn.amount,
        status: txn.status,
        customerEmail: cust?.email || "Unknown",
        createdAt: txn.createdAt,
      };
    });
  });

export const paymentPagesRouter = router({
  create: createPaymentPageProcedure,
  list: listPaymentPagesProcedure,
  get: getPaymentPageProcedure,
  getBySlug: getBySlugProcedure,
  getTransactions: getTransactionsProcedure,
  getDashboardAnalytics: getDashboardAnalyticsProcedure,
  getRecentTransactions: getRecentTransactionsProcedure,
});
