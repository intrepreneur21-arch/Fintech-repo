/**
 * Razorpay API Routes
 * Handles order creation, payment verification, and webhook processing
 */

import { Router, Request, Response } from "express";
import { createOrder, verifyWebhookSignature } from "../razorpay";
import { processWebhook, RazorpayWebhookPayload } from "../webhookHandler";
import { getDb } from "../db";
import { transactions, customers, paymentPages } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "../_core/env";

const router = Router();

/**
 * POST /api/razorpay/create-order
 * Create a Razorpay order for payment
 */
router.post("/create-order", async (req: Request, res: Response) => {
  try {
    const { pageId, email, phone, amount, isRecurring } = req.body;

    if (!pageId || !email || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    // Get payment page details
    const page = await db
      .select()
      .from(paymentPages)
      .where(eq(paymentPages.id, pageId))
      .limit(1);

    if (!page.length) {
      return res.status(404).json({ error: "Payment page not found" });
    }

    // Create Razorpay order
    let orderId: string;

    if (isRecurring) {
      // Create subscription plan and subscription
      const planId = `plan_${pageId}_${Date.now()}`;
      const planResponse = await createOrder(amount, "INR", {
        type: "plan",
        period: "monthly",
        interval: 1,
        notes: {
          pageId,
          productName: page[0].productName,
        },
      });

      // For now, create a regular order
      // In production, implement full subscription flow
      const orderResponse = await createOrder(amount, "INR", {
        receipt: `order_${pageId}_${Date.now()}`,
        notes: {
          pageId,
          email,
          phone,
          isRecurring: true,
          productName: page[0].productName,
        },
      });

      orderId = orderResponse.id;
    } else {
      // Create one-time order
      const orderResponse = await createOrder(amount, "INR", {
        receipt: `order_${pageId}_${Date.now()}`,
        notes: {
          pageId,
          email,
          phone,
          isRecurring: false,
          productName: page[0].productName,
        },
      });

      orderId = orderResponse.id;
    }

    // Store transaction record
    await db.insert(transactions).values({
      userId: page[0].userId,
      pageId,
      customerId: 0, // Will be updated after payment
      razorpayOrderId: orderId,
      amount,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.json({
      orderId,
      keyId: ENV.razorpayKeyId,
    });
  } catch (error: any) {
    console.error("[Razorpay] Failed to create order:", error);
    return res.status(500).json({ error: error.message || "Failed to create order" });
  }
});

/**
 * POST /api/razorpay/verify-payment
 * Verify payment signature and confirm transaction
 */
router.post("/verify-payment", async (req: Request, res: Response) => {
  try {
    const { orderId, paymentId, signature, pageId, email, phone } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify Razorpay signature
    const isValid = verifyWebhookSignature(
      `${orderId}|${paymentId}`,
      signature,
      ENV.razorpayKeySecret
    );

    if (!isValid) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    // Update transaction with payment details
    const transaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.razorpayOrderId, orderId))
      .limit(1);

    if (!transaction.length) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Create or update customer
    let customerId: number;
    const existingCustomer = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);

    if (existingCustomer.length) {
      customerId = existingCustomer[0].id;
    } else {
      const newCustomer = await db.insert(customers).values({
        userId: transaction[0].userId,
        email,
        phone: phone || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      customerId = newCustomer[0].insertId as number;
    }

    // Update transaction
    await db
      .update(transactions)
      .set({
        customerId,
        razorpayPaymentId: paymentId,
        status: "success",
        updatedAt: new Date(),
      })
      .where(eq(transactions.razorpayOrderId, orderId));

    return res.json({
      success: true,
      message: "Payment verified successfully",
      transactionId: transaction[0].id,
    });
  } catch (error: any) {
    console.error("[Razorpay] Failed to verify payment:", error);
    return res.status(500).json({ error: error.message || "Failed to verify payment" });
  }
});

/**
 * POST /api/webhooks/razorpay
 * Receive and process Razorpay webhooks
 */
router.post("/webhooks/razorpay", async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-razorpay-signature"] as string;
    const body = JSON.stringify(req.body);

    if (!signature) {
      return res.status(400).json({ error: "Missing signature" });
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(
      body,
      signature,
      ENV.razorpayKeySecret
    );

    if (!isValid) {
      console.warn("[Webhook] Invalid signature");
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Process webhook
    const payload: RazorpayWebhookPayload = req.body;
    await processWebhook(payload.event, payload);

    return res.json({ success: true });
  } catch (error: any) {
    console.error("[Webhook] Failed to process webhook:", error);
    return res.status(500).json({ error: error.message || "Failed to process webhook" });
  }
});

export default router;
