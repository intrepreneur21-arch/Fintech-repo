/**
 * Razorpay Webhook Handler
 * Processes payment confirmations and updates transaction records
 */

import { verifyWebhookSignature } from "./razorpay";
import { getDb } from "./db";
import { transactions, customers, usageTracking } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export interface RazorpayWebhookPayload {
  event: string;
  created_at: number;
  payload: {
    payment?: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        currency: string;
        status: string;
        method: string;
        description: string;
        amount_refunded: number;
        refund_status: string | null;
        captured: boolean;
        description: string;
        card_id: string | null;
        bank: string | null;
        wallet: string | null;
        vpa: string | null;
        email: string;
        contact: string;
        notes: Record<string, any>;
        fee: number;
        tax: number;
        error_code: string | null;
        error_description: string | null;
        error_source: string | null;
        error_reason: string | null;
        error_step: string | null;
        error_field: string | null;
        acquirer_data: Record<string, any>;
        international: boolean;
        recurring: boolean;
        recurring_details: Record<string, any>;
        auth_attempts: number;
        recipient_settlement_id: string | null;
        created_at: number;
      };
    };
    order?: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        amount_paid: number;
        amount_due: number;
        currency: string;
        receipt: string;
        offer_id: string | null;
        status: string;
        attempts: number;
        notes: Record<string, any>;
        created_at: number;
      };
    };
    subscription?: {
      entity: {
        id: string;
        entity: string;
        plan_id: string;
        customer_id: string;
        status: string;
        current_start: number;
        current_end: number;
        ended_at: number | null;
        quantity: number;
        notes: Record<string, any>;
        charge_at: number;
        start_at: number;
        end_at: number | null;
        auth_attempts: number;
        total_count: number;
        paid_count: number;
        customer_notify: number;
        created_at: number;
      };
    };
  };
}

/**
 * Handle payment.authorized webhook
 */
export async function handlePaymentAuthorized(payload: RazorpayWebhookPayload) {
  const payment = payload.payload.payment?.entity;
  if (!payment) return;

  const db = await getDb();
  if (!db) {
    console.warn("[Webhook] Database not available");
    return;
  }

  try {
    // Update transaction status to authorized
    await db
      .update(transactions)
      .set({
        status: "success",
        razorpayPaymentId: payment.id,
        updatedAt: new Date(),
      })
      .where(eq(transactions.razorpayOrderId, payload.payload.order?.entity.id || ""));

    console.log(`[Webhook] Payment authorized: ${payment.id}`);
  } catch (error) {
    console.error("[Webhook] Failed to handle payment.authorized:", error);
  }
}

/**
 * Handle payment.captured webhook
 */
export async function handlePaymentCaptured(payload: RazorpayWebhookPayload) {
  const payment = payload.payload.payment?.entity;
  if (!payment) return;

  const db = await getDb();
  if (!db) {
    console.warn("[Webhook] Database not available");
    return;
  }

  try {
    // Update transaction status to completed
    await db
      .update(transactions)
      .set({
        status: "success",
        razorpayPaymentId: payment.id,
        updatedAt: new Date(),
      })
      .where(eq(transactions.razorpayOrderId, payload.payload.order?.entity.id || ""));

    // Update usage tracking
    const transaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.razorpayPaymentId, payment.id))
      .limit(1);

    if (transaction.length > 0) {
      const tx = transaction[0];
      const usage = await db
        .select()
        .from(usageTracking)
        .where(eq(usageTracking.userId, tx.userId))
        .limit(1);

      if (usage.length > 0) {
        await db
          .update(usageTracking)
          .set({
            transactionsUsed: (usage[0].transactionsUsed || 0) + 1,
            updatedAt: new Date(),
          })
          .where(eq(usageTracking.userId, tx.userId));
      }
    }

    console.log(`[Webhook] Payment captured: ${payment.id}`);
  } catch (error) {
    console.error("[Webhook] Failed to handle payment.captured:", error);
  }
}

/**
 * Handle payment.failed webhook
 */
export async function handlePaymentFailed(payload: RazorpayWebhookPayload) {
  const payment = payload.payload.payment?.entity;
  if (!payment) return;

  const db = await getDb();
  if (!db) {
    console.warn("[Webhook] Database not available");
    return;
  }

  try {
    // Update transaction status to failed
    await db
      .update(transactions)
      .set({
        status: "failed",
        razorpayPaymentId: payment.id,
        updatedAt: new Date(),
      })
      .where(eq(transactions.razorpayOrderId, payload.payload.order?.entity.id || ""));

    console.log(`[Webhook] Payment failed: ${payment.id}`);
  } catch (error) {
    console.error("[Webhook] Failed to handle payment.failed:", error);
  }
}

/**
 * Handle subscription.activated webhook
 */
export async function handleSubscriptionActivated(payload: RazorpayWebhookPayload) {
  const subscription = payload.payload.subscription?.entity;
  if (!subscription) return;

  const db = await getDb();
  if (!db) {
    console.warn("[Webhook] Database not available");
    return;
  }

  try {
    // Log subscription activation
    console.log(`[Webhook] Subscription activated: ${subscription.id}`);
  } catch (error) {
    console.error("[Webhook] Failed to handle subscription.activated:", error);
  }
}

/**
 * Handle subscription.pending webhook
 */
export async function handleSubscriptionPending(payload: RazorpayWebhookPayload) {
  const subscription = payload.payload.subscription?.entity;
  if (!subscription) return;

  console.log(`[Webhook] Subscription pending: ${subscription.id}`);
}

/**
 * Handle subscription.halted webhook
 */
export async function handleSubscriptionHalted(payload: RazorpayWebhookPayload) {
  const subscription = payload.payload.subscription?.entity;
  if (!subscription) return;

  console.log(`[Webhook] Subscription halted: ${subscription.id}`);
}

/**
 * Handle subscription.cancelled webhook
 */
export async function handleSubscriptionCancelled(payload: RazorpayWebhookPayload) {
  const subscription = payload.payload.subscription?.entity;
  if (!subscription) return;

  console.log(`[Webhook] Subscription cancelled: ${subscription.id}`);
}

/**
 * Handle subscription.completed webhook
 */
export async function handleSubscriptionCompleted(payload: RazorpayWebhookPayload) {
  const subscription = payload.payload.subscription?.entity;
  if (!subscription) return;

  console.log(`[Webhook] Subscription completed: ${subscription.id}`);
}

/**
 * Process webhook based on event type
 */
export async function processWebhook(
  event: string,
  payload: RazorpayWebhookPayload
): Promise<void> {
  switch (event) {
    case "payment.authorized":
      await handlePaymentAuthorized(payload);
      break;
    case "payment.captured":
      await handlePaymentCaptured(payload);
      break;
    case "payment.failed":
      await handlePaymentFailed(payload);
      break;
    case "subscription.activated":
      await handleSubscriptionActivated(payload);
      break;
    case "subscription.pending":
      await handleSubscriptionPending(payload);
      break;
    case "subscription.halted":
      await handleSubscriptionHalted(payload);
      break;
    case "subscription.cancelled":
      await handleSubscriptionCancelled(payload);
      break;
    case "subscription.completed":
      await handleSubscriptionCompleted(payload);
      break;
    default:
      console.log(`[Webhook] Unknown event type: ${event}`);
  }
}
