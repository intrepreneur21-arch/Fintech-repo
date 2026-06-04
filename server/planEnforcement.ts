/**
 * Plan enforcement and usage tracking service
 * Manages tiered pricing limits and usage tracking
 */

export type PlanTier = "free" | "starter" | "pro";

export interface PlanLimits {
  tier: PlanTier;
  name: string;
  price: number; // in rupees, 0 for free
  billingCycle: "monthly" | "free";
  maxPages: number;
  maxTransactions: number;
  features: string[];
}

/**
 * Plan tier definitions
 */
export const PLAN_TIERS: Record<PlanTier, PlanLimits> = {
  free: {
    tier: "free",
    name: "Free",
    price: 0,
    billingCycle: "free",
    maxPages: 1,
    maxTransactions: 10,
    features: [
      "1 payment page",
      "10 transactions/month",
      "Basic invoice generation",
      "Email support",
    ],
  },
  starter: {
    tier: "starter",
    name: "Starter",
    price: 1900, // ₹19/month in paise
    billingCycle: "monthly",
    maxPages: 5,
    maxTransactions: 500,
    features: [
      "5 payment pages",
      "500 transactions/month",
      "Advanced invoice templates",
      "Priority email support",
      "Payment analytics",
    ],
  },
  pro: {
    tier: "pro",
    name: "Pro",
    price: 9900, // ₹99/month in paise
    billingCycle: "monthly",
    maxPages: Infinity,
    maxTransactions: Infinity,
    features: [
      "Unlimited payment pages",
      "Unlimited transactions",
      "Custom branding",
      "API access",
      "Webhook support",
      "24/7 priority support",
      "Advanced analytics",
    ],
  },
};

/**
 * Usage tracking data
 */
export interface UsageData {
  userId: string;
  tier: PlanTier;
  currentMonth: string; // YYYY-MM format
  pagesCreated: number;
  transactionsProcessed: number;
  lastResetDate: Date;
}

/**
 * Check if user has reached page limit
 */
export function hasReachedPageLimit(usage: UsageData): boolean {
  const limits = PLAN_TIERS[usage.tier];
  return usage.pagesCreated >= limits.maxPages;
}

/**
 * Check if user has reached transaction limit
 */
export function hasReachedTransactionLimit(usage: UsageData): boolean {
  const limits = PLAN_TIERS[usage.tier];
  return usage.transactionsProcessed >= limits.maxTransactions;
}

/**
 * Get remaining pages for user
 */
export function getRemainingPages(usage: UsageData): number {
  const limits = PLAN_TIERS[usage.tier];
  if (limits.maxPages === Infinity) return Infinity;
  return Math.max(0, limits.maxPages - usage.pagesCreated);
}

/**
 * Get remaining transactions for user
 */
export function getRemainingTransactions(usage: UsageData): number {
  const limits = PLAN_TIERS[usage.tier];
  if (limits.maxTransactions === Infinity) return Infinity;
  return Math.max(0, limits.maxTransactions - usage.transactionsProcessed);
}

/**
 * Get usage percentage for display
 */
export function getUsagePercentage(usage: UsageData): {
  pages: number;
  transactions: number;
} {
  const limits = PLAN_TIERS[usage.tier];

  return {
    pages:
      limits.maxPages === Infinity
        ? 0
        : Math.min(100, (usage.pagesCreated / limits.maxPages) * 100),
    transactions:
      limits.maxTransactions === Infinity
        ? 0
        : Math.min(
            100,
            (usage.transactionsProcessed / limits.maxTransactions) * 100
          ),
  };
}

/**
 * Check if usage should be reset (monthly billing cycle)
 */
export function shouldResetUsage(usage: UsageData): boolean {
  const limits = PLAN_TIERS[usage.tier];
  if (limits.billingCycle !== "monthly") return false;

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return usage.currentMonth !== currentMonth;
}

/**
 * Reset usage for new billing cycle
 */
export function resetUsage(usage: UsageData): UsageData {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return {
    ...usage,
    currentMonth,
    pagesCreated: 0,
    transactionsProcessed: 0,
    lastResetDate: now,
  };
}

/**
 * Increment page count
 */
export function incrementPageCount(usage: UsageData): UsageData {
  return {
    ...usage,
    pagesCreated: usage.pagesCreated + 1,
  };
}

/**
 * Increment transaction count
 */
export function incrementTransactionCount(usage: UsageData): UsageData {
  return {
    ...usage,
    transactionsProcessed: usage.transactionsProcessed + 1,
  };
}

/**
 * Format plan price for display
 */
export function formatPlanPrice(tier: PlanTier): string {
  const plan = PLAN_TIERS[tier];

  if (plan.price === 0) {
    return "Free";
  }

  const rupees = plan.price / 100;
  return `₹${rupees}/month`;
}

/**
 * Get plan comparison data
 */
export function getPlanComparison(): Array<{
  tier: PlanTier;
  name: string;
  price: string;
  pages: string;
  transactions: string;
  features: string[];
}> {
  return Object.values(PLAN_TIERS).map((plan) => ({
    tier: plan.tier,
    name: plan.name,
    price: formatPlanPrice(plan.tier),
    pages:
      plan.maxPages === Infinity
        ? "Unlimited"
        : `${plan.maxPages} page${plan.maxPages !== 1 ? "s" : ""}`,
    transactions:
      plan.maxTransactions === Infinity
        ? "Unlimited"
        : `${plan.maxTransactions} transactions/month`,
    features: plan.features,
  }));
}

/**
 * Validate if user can perform action based on plan
 */
export interface ActionValidation {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
}

export function validatePageCreation(usage: UsageData): ActionValidation {
  if (hasReachedPageLimit(usage)) {
    const limits = PLAN_TIERS[usage.tier];
    return {
      allowed: false,
      reason: `You have reached the limit of ${limits.maxPages} payment page${limits.maxPages !== 1 ? "s" : ""} on your ${limits.name} plan.`,
      upgradeRequired: usage.tier !== "pro",
    };
  }

  return { allowed: true };
}

export function validateTransaction(usage: UsageData): ActionValidation {
  if (hasReachedTransactionLimit(usage)) {
    const limits = PLAN_TIERS[usage.tier];
    return {
      allowed: false,
      reason: `You have reached the limit of ${limits.maxTransactions} transactions/month on your ${limits.name} plan.`,
      upgradeRequired: usage.tier !== "pro",
    };
  }

  return { allowed: true };
}

/**
 * Get upgrade suggestion
 */
export function getUpgradeSuggestion(usage: UsageData): PlanTier | null {
  const limits = PLAN_TIERS[usage.tier];

  // Check if approaching limits
  const pageUsagePercent =
    limits.maxPages === Infinity
      ? 0
      : (usage.pagesCreated / limits.maxPages) * 100;
  const transactionUsagePercent =
    limits.maxTransactions === Infinity
      ? 0
      : (usage.transactionsProcessed / limits.maxTransactions) * 100;

  // Suggest upgrade if using more than 80% of any limit
  if (pageUsagePercent > 80 || transactionUsagePercent > 80) {
    if (usage.tier === "free") return "starter";
    if (usage.tier === "starter") return "pro";
  }

  return null;
}

/**
 * Create initial usage record
 */
export function createInitialUsage(
  userId: string,
  tier: PlanTier = "free"
): UsageData {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return {
    userId,
    tier,
    currentMonth,
    pagesCreated: 0,
    transactionsProcessed: 0,
    lastResetDate: now,
  };
}
