/**
 * Shared Constants
 */

export const COOKIE_NAME = "session";

export const PLAN_LIMITS = {
  free: {
    pages: 1,
    transactions: 10,
  },
  starter: {
    pages: 5,
    transactions: 500,
  },
  pro: {
    pages: Infinity,
    transactions: Infinity,
  },
};

export const PLAN_PRICES = {
  free: 0,
  starter: 1900, // ₹19 in paise
  pro: 9900, // ₹99 in paise
};

export const SUPPORTED_LANGUAGES = ["en", "hi", "mr"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
