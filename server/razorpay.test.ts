import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createOrder,
  createPlan,
  createCustomer,
  createSubscription,
  fetchPayment,
  verifyWebhookSignature,
  capturePayment,
  refundPayment,
} from "./razorpay";
import crypto from "crypto";

global.fetch = vi.fn();

describe("Razorpay Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createOrder", () => {
    it("should create an order with required parameters", async () => {
      const mockOrder = {
        id: "order_123",
        entity: "order",
        amount: 5000000,
        amount_paid: 0,
        amount_due: 5000000,
        currency: "INR",
        receipt: "receipt_123",
        status: "created",
        attempts: 0,
        notes: {},
        created_at: Math.floor(Date.now() / 1000),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrder,
      });

      const order = await createOrder({
        amount: 5000000,
        description: "Test payment",
      });

      expect(order.id).toBe("order_123");
      expect(order.amount).toBe(5000000);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.razorpay.com/v1/orders",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    it("should include customer ID if provided", async () => {
      const mockOrder = {
        id: "order_123",
        entity: "order",
        amount: 5000000,
        amount_paid: 0,
        amount_due: 5000000,
        currency: "INR",
        receipt: "receipt_123",
        status: "created",
        attempts: 0,
        notes: {},
        created_at: Math.floor(Date.now() / 1000),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrder,
      });

      await createOrder({
        amount: 5000000,
        customerId: "cust_123",
        email: "test@example.com",
        phone: "9876543210",
      });

      const callArgs = (global.fetch as any).mock.calls[0];
      expect(callArgs[1].body).toContain("customer_id=cust_123");
      expect(callArgs[1].body).toContain("email=test%40example.com");
      expect(callArgs[1].body).toContain("contact=9876543210");
    });

    it("should throw error on API failure", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        text: async () => "Order creation failed",
      });

      await expect(
        createOrder({ amount: 5000000 })
      ).rejects.toThrow("Razorpay order creation failed");
    });
  });

  describe("createPlan", () => {
    it("should create a monthly plan", async () => {
      const mockPlan = {
        id: "plan_123",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlan,
      });

      const plan = await createPlan({
        period: "monthly",
        interval: 1,
        amount: 1900,
        description: "Starter Plan",
      });

      expect(plan.id).toBe("plan_123");
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.razorpay.com/v1/plans",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    it("should create a yearly plan", async () => {
      const mockPlan = {
        id: "plan_yearly",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPlan,
      });

      const plan = await createPlan({
        period: "yearly",
        interval: 1,
        amount: 9900,
      });

      expect(plan.id).toBe("plan_yearly");
    });
  });

  describe("createCustomer", () => {
    it("should create a customer", async () => {
      const mockCustomer = {
        id: "cust_123",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCustomer,
      });

      const customer = await createCustomer(
        "test@example.com",
        "9876543210",
        "John Doe"
      );

      expect(customer.id).toBe("cust_123");
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.razorpay.com/v1/customers",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  describe("createSubscription", () => {
    it("should create a subscription", async () => {
      const mockSubscription = {
        id: "sub_123",
        entity: "subscription",
        plan_id: "plan_123",
        customer_id: "cust_123",
        status: "active",
        current_start: Math.floor(Date.now() / 1000),
        current_end: Math.floor(Date.now() / 1000) + 2592000,
        ended_at: null,
        quantity: 1,
        notes: {},
        created_at: Math.floor(Date.now() / 1000),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubscription,
      });

      const subscription = await createSubscription({
        planId: "plan_123",
        customerId: "cust_123",
      });

      expect(subscription.id).toBe("sub_123");
      expect(subscription.status).toBe("active");
    });
  });

  describe("fetchPayment", () => {
    it("should fetch payment details", async () => {
      const mockPayment = {
        id: "pay_123",
        entity: "payment",
        amount: 5000000,
        currency: "INR",
        status: "captured",
        method: "card",
        order_id: "order_123",
        email: "test@example.com",
        phone: "9876543210",
        notes: {},
        created_at: Math.floor(Date.now() / 1000),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPayment,
      });

      const payment = await fetchPayment("pay_123");

      expect(payment.id).toBe("pay_123");
      expect(payment.status).toBe("captured");
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.razorpay.com/v1/payments/pay_123",
        expect.objectContaining({
          method: "GET",
        })
      );
    });
  });

  describe("verifyWebhookSignature", () => {
    it("should verify valid webhook signature", () => {
      const secret = process.env.RAZORPAY_KEY_SECRET || "test_secret";
      const payload = JSON.stringify({ event: "payment.authorized" });

      const hash = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

      const isValid = verifyWebhookSignature(payload, hash);
      expect(isValid).toBe(true);
    });

    it("should reject invalid webhook signature", () => {
      const payload = JSON.stringify({ event: "payment.authorized" });
      const invalidSignature = "invalid_signature_12345";

      const isValid = verifyWebhookSignature(payload, invalidSignature);
      expect(isValid).toBe(false);
    });
  });

  describe("capturePayment", () => {
    it("should capture an authorized payment", async () => {
      const mockPayment = {
        id: "pay_123",
        entity: "payment",
        amount: 5000000,
        currency: "INR",
        status: "captured",
        method: "card",
        order_id: "order_123",
        email: "test@example.com",
        phone: "9876543210",
        notes: {},
        created_at: Math.floor(Date.now() / 1000),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPayment,
      });

      const payment = await capturePayment("pay_123", 5000000);

      expect(payment.status).toBe("captured");
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.razorpay.com/v1/payments/pay_123/capture",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  describe("refundPayment", () => {
    it("should refund a payment", async () => {
      const mockRefund = {
        id: "rfnd_123",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRefund,
      });

      const refund = await refundPayment("pay_123", 5000000);

      expect(refund.id).toBe("rfnd_123");
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.razorpay.com/v1/payments/pay_123/refund",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    it("should refund full amount if amount not specified", async () => {
      const mockRefund = {
        id: "rfnd_123",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRefund,
      });

      await refundPayment("pay_123");

      const callArgs = (global.fetch as any).mock.calls[0];
      expect(callArgs[1].body).toBe("");
    });
  });
});
