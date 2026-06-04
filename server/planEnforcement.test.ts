import { describe, expect, it } from "vitest";
import {
  PLAN_TIERS,
  hasReachedPageLimit,
  hasReachedTransactionLimit,
  getRemainingPages,
  getRemainingTransactions,
  getUsagePercentage,
  shouldResetUsage,
  resetUsage,
  incrementPageCount,
  incrementTransactionCount,
  formatPlanPrice,
  getPlanComparison,
  validatePageCreation,
  validateTransaction,
  getUpgradeSuggestion,
  createInitialUsage,
} from "./planEnforcement";
import type { UsageData } from "./planEnforcement";

describe("Plan Enforcement", () => {
  describe("PLAN_TIERS", () => {
    it("should define all three plan tiers", () => {
      expect(PLAN_TIERS.free).toBeDefined();
      expect(PLAN_TIERS.starter).toBeDefined();
      expect(PLAN_TIERS.pro).toBeDefined();
    });

    it("should have correct free plan limits", () => {
      expect(PLAN_TIERS.free.maxPages).toBe(1);
      expect(PLAN_TIERS.free.maxTransactions).toBe(10);
      expect(PLAN_TIERS.free.price).toBe(0);
    });

    it("should have correct starter plan limits", () => {
      expect(PLAN_TIERS.starter.maxPages).toBe(5);
      expect(PLAN_TIERS.starter.maxTransactions).toBe(500);
      expect(PLAN_TIERS.starter.price).toBe(1900); // ₹19 in paise
    });

    it("should have unlimited pro plan limits", () => {
      expect(PLAN_TIERS.pro.maxPages).toBe(Infinity);
      expect(PLAN_TIERS.pro.maxTransactions).toBe(Infinity);
      expect(PLAN_TIERS.pro.price).toBe(9900); // ₹99 in paise
    });
  });

  describe("hasReachedPageLimit", () => {
    it("should return true when free plan reaches 1 page", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "free",
        currentMonth: "2024-01",
        pagesCreated: 1,
        transactionsProcessed: 0,
        lastResetDate: new Date(),
      };

      expect(hasReachedPageLimit(usage)).toBe(true);
    });

    it("should return false when free plan has 0 pages", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "free",
        currentMonth: "2024-01",
        pagesCreated: 0,
        transactionsProcessed: 0,
        lastResetDate: new Date(),
      };

      expect(hasReachedPageLimit(usage)).toBe(false);
    });

    it("should return false for pro plan regardless of pages", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "pro",
        currentMonth: "2024-01",
        pagesCreated: 1000,
        transactionsProcessed: 0,
        lastResetDate: new Date(),
      };

      expect(hasReachedPageLimit(usage)).toBe(false);
    });
  });

  describe("hasReachedTransactionLimit", () => {
    it("should return true when free plan reaches 10 transactions", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "free",
        currentMonth: "2024-01",
        pagesCreated: 0,
        transactionsProcessed: 10,
        lastResetDate: new Date(),
      };

      expect(hasReachedTransactionLimit(usage)).toBe(true);
    });

    it("should return false when free plan has 9 transactions", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "free",
        currentMonth: "2024-01",
        pagesCreated: 0,
        transactionsProcessed: 9,
        lastResetDate: new Date(),
      };

      expect(hasReachedTransactionLimit(usage)).toBe(false);
    });

    it("should return false for pro plan regardless of transactions", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "pro",
        currentMonth: "2024-01",
        pagesCreated: 0,
        transactionsProcessed: 10000,
        lastResetDate: new Date(),
      };

      expect(hasReachedTransactionLimit(usage)).toBe(false);
    });
  });

  describe("getRemainingPages", () => {
    it("should return remaining pages for free plan", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "free",
        currentMonth: "2024-01",
        pagesCreated: 0,
        transactionsProcessed: 0,
        lastResetDate: new Date(),
      };

      expect(getRemainingPages(usage)).toBe(1);
    });

    it("should return 0 when limit reached", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "free",
        currentMonth: "2024-01",
        pagesCreated: 1,
        transactionsProcessed: 0,
        lastResetDate: new Date(),
      };

      expect(getRemainingPages(usage)).toBe(0);
    });

    it("should return Infinity for pro plan", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "pro",
        currentMonth: "2024-01",
        pagesCreated: 100,
        transactionsProcessed: 0,
        lastResetDate: new Date(),
      };

      expect(getRemainingPages(usage)).toBe(Infinity);
    });
  });

  describe("getRemainingTransactions", () => {
    it("should return remaining transactions for free plan", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "free",
        currentMonth: "2024-01",
        pagesCreated: 0,
        transactionsProcessed: 5,
        lastResetDate: new Date(),
      };

      expect(getRemainingTransactions(usage)).toBe(5);
    });

    it("should return 0 when limit reached", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "free",
        currentMonth: "2024-01",
        pagesCreated: 0,
        transactionsProcessed: 10,
        lastResetDate: new Date(),
      };

      expect(getRemainingTransactions(usage)).toBe(0);
    });

    it("should return Infinity for pro plan", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "pro",
        currentMonth: "2024-01",
        pagesCreated: 0,
        transactionsProcessed: 1000,
        lastResetDate: new Date(),
      };

      expect(getRemainingTransactions(usage)).toBe(Infinity);
    });
  });

  describe("getUsagePercentage", () => {
    it("should calculate correct usage percentage", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "starter",
        currentMonth: "2024-01",
        pagesCreated: 2,
        transactionsProcessed: 250,
        lastResetDate: new Date(),
      };

      const percentage = getUsagePercentage(usage);
      expect(percentage.pages).toBe(40); // 2/5 * 100
      expect(percentage.transactions).toBe(50); // 250/500 * 100
    });

    it("should return 0 for pro plan", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "pro",
        currentMonth: "2024-01",
        pagesCreated: 100,
        transactionsProcessed: 1000,
        lastResetDate: new Date(),
      };

      const percentage = getUsagePercentage(usage);
      expect(percentage.pages).toBe(0);
      expect(percentage.transactions).toBe(0);
    });
  });

  describe("shouldResetUsage", () => {
    it("should return false if current month matches", () => {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      const usage: UsageData = {
        userId: "user_123",
        tier: "starter",
        currentMonth,
        pagesCreated: 0,
        transactionsProcessed: 0,
        lastResetDate: now,
      };

      expect(shouldResetUsage(usage)).toBe(false);
    });

    it("should return true if month has changed", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "starter",
        currentMonth: "2023-12",
        pagesCreated: 0,
        transactionsProcessed: 0,
        lastResetDate: new Date("2023-12-01"),
      };

      expect(shouldResetUsage(usage)).toBe(true);
    });

    it("should return false for free plan", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "free",
        currentMonth: "2023-12",
        pagesCreated: 0,
        transactionsProcessed: 0,
        lastResetDate: new Date("2023-12-01"),
      };

      expect(shouldResetUsage(usage)).toBe(false);
    });
  });

  describe("resetUsage", () => {
    it("should reset usage counters", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "starter",
        currentMonth: "2023-12",
        pagesCreated: 5,
        transactionsProcessed: 500,
        lastResetDate: new Date("2023-12-01"),
      };

      const reset = resetUsage(usage);
      expect(reset.pagesCreated).toBe(0);
      expect(reset.transactionsProcessed).toBe(0);
    });

    it("should update current month", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "starter",
        currentMonth: "2023-12",
        pagesCreated: 0,
        transactionsProcessed: 0,
        lastResetDate: new Date("2023-12-01"),
      };

      const reset = resetUsage(usage);
      expect(reset.currentMonth).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe("incrementPageCount", () => {
    it("should increment page count by 1", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "starter",
        currentMonth: "2024-01",
        pagesCreated: 2,
        transactionsProcessed: 0,
        lastResetDate: new Date(),
      };

      const incremented = incrementPageCount(usage);
      expect(incremented.pagesCreated).toBe(3);
    });

    it("should not modify other properties", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "starter",
        currentMonth: "2024-01",
        pagesCreated: 2,
        transactionsProcessed: 100,
        lastResetDate: new Date(),
      };

      const incremented = incrementPageCount(usage);
      expect(incremented.transactionsProcessed).toBe(100);
      expect(incremented.tier).toBe("starter");
    });
  });

  describe("incrementTransactionCount", () => {
    it("should increment transaction count by 1", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "starter",
        currentMonth: "2024-01",
        pagesCreated: 0,
        transactionsProcessed: 100,
        lastResetDate: new Date(),
      };

      const incremented = incrementTransactionCount(usage);
      expect(incremented.transactionsProcessed).toBe(101);
    });
  });

  describe("formatPlanPrice", () => {
    it("should format free plan as Free", () => {
      expect(formatPlanPrice("free")).toBe("Free");
    });

    it("should format starter plan price", () => {
      expect(formatPlanPrice("starter")).toBe("₹19/month");
    });

    it("should format pro plan price", () => {
      expect(formatPlanPrice("pro")).toBe("₹99/month");
    });
  });

  describe("getPlanComparison", () => {
    it("should return all three plans", () => {
      const comparison = getPlanComparison();
      expect(comparison).toHaveLength(3);
      expect(comparison.map((p) => p.tier)).toEqual(["free", "starter", "pro"]);
    });

    it("should format pages correctly", () => {
      const comparison = getPlanComparison();
      expect(comparison[0].pages).toBe("1 page");
      expect(comparison[1].pages).toBe("5 pages");
      expect(comparison[2].pages).toBe("Unlimited");
    });

    it("should format transactions correctly", () => {
      const comparison = getPlanComparison();
      expect(comparison[0].transactions).toBe("10 transactions/month");
      expect(comparison[1].transactions).toBe("500 transactions/month");
      expect(comparison[2].transactions).toBe("Unlimited");
    });
  });

  describe("validatePageCreation", () => {
    it("should allow page creation when under limit", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "free",
        currentMonth: "2024-01",
        pagesCreated: 0,
        transactionsProcessed: 0,
        lastResetDate: new Date(),
      };

      const validation = validatePageCreation(usage);
      expect(validation.allowed).toBe(true);
    });

    it("should reject page creation when limit reached", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "free",
        currentMonth: "2024-01",
        pagesCreated: 1,
        transactionsProcessed: 0,
        lastResetDate: new Date(),
      };

      const validation = validatePageCreation(usage);
      expect(validation.allowed).toBe(false);
      expect(validation.upgradeRequired).toBe(true);
    });
  });

  describe("validateTransaction", () => {
    it("should allow transaction when under limit", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "free",
        currentMonth: "2024-01",
        pagesCreated: 0,
        transactionsProcessed: 5,
        lastResetDate: new Date(),
      };

      const validation = validateTransaction(usage);
      expect(validation.allowed).toBe(true);
    });

    it("should reject transaction when limit reached", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "free",
        currentMonth: "2024-01",
        pagesCreated: 0,
        transactionsProcessed: 10,
        lastResetDate: new Date(),
      };

      const validation = validateTransaction(usage);
      expect(validation.allowed).toBe(false);
      expect(validation.upgradeRequired).toBe(true);
    });
  });

  describe("getUpgradeSuggestion", () => {
    it("should suggest starter when free plan is 80% full", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "free",
        currentMonth: "2024-01",
        pagesCreated: 1,
        transactionsProcessed: 8,
        lastResetDate: new Date(),
      };

      const suggestion = getUpgradeSuggestion(usage);
      expect(suggestion).toBe("starter");
    });

    it("should suggest pro when starter plan is 80% full", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "starter",
        currentMonth: "2024-01",
        pagesCreated: 5,
        transactionsProcessed: 400,
        lastResetDate: new Date(),
      };

      const suggestion = getUpgradeSuggestion(usage);
      expect(suggestion).toBe("pro");
    });

    it("should return null when usage is low", () => {
      const usage: UsageData = {
        userId: "user_123",
        tier: "starter",
        currentMonth: "2024-01",
        pagesCreated: 1,
        transactionsProcessed: 50,
        lastResetDate: new Date(),
      };

      const suggestion = getUpgradeSuggestion(usage);
      expect(suggestion).toBeNull();
    });
  });

  describe("createInitialUsage", () => {
    it("should create usage with free tier by default", () => {
      const usage = createInitialUsage("user_123");
      expect(usage.tier).toBe("free");
      expect(usage.pagesCreated).toBe(0);
      expect(usage.transactionsProcessed).toBe(0);
    });

    it("should create usage with specified tier", () => {
      const usage = createInitialUsage("user_123", "starter");
      expect(usage.tier).toBe("starter");
    });

    it("should set current month", () => {
      const usage = createInitialUsage("user_123");
      expect(usage.currentMonth).toMatch(/^\d{4}-\d{2}$/);
    });
  });
});
