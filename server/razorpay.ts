/**
 * Razorpay integration service
 * Handles payment creation, subscription management, and webhook verification
 */

import crypto from "crypto";
import { ENV } from "./_core/env";

export interface CreateOrderParams {
  amount: number; // in paise
  customerId?: string;
  description?: string;
  email?: string;
  phone?: string;
  notes?: Record<string, string>;
}

export interface CreateSubscriptionParams {
  planId: string;
  customerId?: string;
  quantity?: number;
  totalCount?: number;
  email?: string;
  phone?: string;
  notes?: Record<string, string>;
}

export interface CreatePlanParams {
  period: "monthly" | "yearly";
  interval: number; // 1 for monthly/yearly
  amount: number; // in paise
  description?: string;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  order_id: string;
  email: string;
  phone: string;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpaySubscription {
  id: string;
  entity: string;
  plan_id: string;
  customer_id: string;
  status: string;
  current_start: number;
  current_end: number;
  ended_at: number | null;
  quantity: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface RazorpayWebhookPayload {
  event: string;
  created_at: number;
  payload: {
    payment?: {
      entity: RazorpayPayment;
    };
    order?: {
      entity: RazorpayOrder;
    };
    subscription?: {
      entity: RazorpaySubscription;
    };
  };
}

/**
 * Create a Razorpay order for one-time payment
 */
export async function createOrder(
  params: CreateOrderParams
): Promise<RazorpayOrder> {
  const auth = Buffer.from(
    `${ENV.razorpayKeyId}:${ENV.razorpayKeySecret}`
  ).toString("base64");

  const body = new URLSearchParams({
    amount: params.amount.toString(),
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    ...(params.description && { description: params.description }),
    ...(params.customerId && { customer_id: params.customerId }),
    ...(params.email && { email: params.email }),
    ...(params.phone && { contact: params.phone }),
    ...(params.notes && { notes: JSON.stringify(params.notes) }),
  });

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Razorpay order creation failed: ${error}`);
  }

  return response.json();
}

/**
 * Create a Razorpay plan for subscription billing
 */
export async function createPlan(
  params: CreatePlanParams
): Promise<{ id: string }> {
  const auth = Buffer.from(
    `${ENV.razorpayKeyId}:${ENV.razorpayKeySecret}`
  ).toString("base64");

  const body = new URLSearchParams({
    period: params.period,
    interval: params.interval.toString(),
    amount: params.amount.toString(),
    currency: "INR",
    ...(params.description && { description: params.description }),
  });

  const response = await fetch("https://api.razorpay.com/v1/plans", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Razorpay plan creation failed: ${error}`);
  }

  return response.json();
}

/**
 * Create a Razorpay customer
 */
export async function createCustomer(
  email: string,
  phone?: string,
  name?: string
): Promise<{ id: string }> {
  const auth = Buffer.from(
    `${ENV.razorpayKeyId}:${ENV.razorpayKeySecret}`
  ).toString("base64");

  const body = new URLSearchParams({
    email,
    ...(phone && { contact: phone }),
    ...(name && { name }),
  });

  const response = await fetch("https://api.razorpay.com/v1/customers", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Razorpay customer creation failed: ${error}`);
  }

  return response.json();
}

/**
 * Create a Razorpay subscription
 */
export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<RazorpaySubscription> {
  const auth = Buffer.from(
    `${ENV.razorpayKeyId}:${ENV.razorpayKeySecret}`
  ).toString("base64");

  const body = new URLSearchParams({
    plan_id: params.planId,
    ...(params.customerId && { customer_id: params.customerId }),
    ...(params.quantity && { quantity: params.quantity.toString() }),
    ...(params.totalCount && { total_count: params.totalCount.toString() }),
    ...(params.email && { email: params.email }),
    ...(params.phone && { contact: params.phone }),
    ...(params.notes && { notes: JSON.stringify(params.notes) }),
  });

  const response = await fetch("https://api.razorpay.com/v1/subscriptions", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Razorpay subscription creation failed: ${error}`);
  }

  return response.json();
}

/**
 * Fetch payment details from Razorpay
 */
export async function fetchPayment(paymentId: string): Promise<RazorpayPayment> {
  const auth = Buffer.from(
    `${ENV.razorpayKeyId}:${ENV.razorpayKeySecret}`
  ).toString("base64");

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${paymentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Razorpay payment fetch failed: ${error}`);
  }

  return response.json();
}

/**
 * Verify webhook signature from Razorpay
 * @param payload - Raw webhook payload
 * @param signature - X-Razorpay-Signature header value
 * @returns true if signature is valid
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const hash = crypto
    .createHmac("sha256", ENV.razorpayKeySecret)
    .update(payload)
    .digest("hex");

  return hash === signature;
}

/**
 * Capture payment (for authorized payments)
 */
export async function capturePayment(
  paymentId: string,
  amount: number
): Promise<RazorpayPayment> {
  const auth = Buffer.from(
    `${ENV.razorpayKeyId}:${ENV.razorpayKeySecret}`
  ).toString("base64");

  const body = new URLSearchParams({
    amount: amount.toString(),
  });

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${paymentId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Razorpay payment capture failed: ${error}`);
  }

  return response.json();
}

/**
 * Refund a payment
 */
export async function refundPayment(
  paymentId: string,
  amount?: number
): Promise<{ id: string }> {
  const auth = Buffer.from(
    `${ENV.razorpayKeyId}:${ENV.razorpayKeySecret}`
  ).toString("base64");

  const body = new URLSearchParams({
    ...(amount && { amount: amount.toString() }),
  });

  const response = await fetch(
    `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Razorpay refund failed: ${error}`);
  }

  return response.json();
}
