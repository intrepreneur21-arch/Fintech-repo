import { describe, expect, it } from "vitest";
import { generateSlug, validateParsedPrompt } from "./promptParser";
import type { ParsedPrompt } from "./promptParser";

describe("Prompt Parser", () => {
  describe("generateSlug", () => {
    it("should generate slug from product name", () => {
      expect(generateSlug("iPhone 15 Pro Max")).toBe("iphone-15-pro-max");
    });

    it("should handle special characters", () => {
      expect(generateSlug("Product & Service (Premium)")).toBe(
        "product-service-premium"
      );
    });

    it("should handle multiple spaces", () => {
      expect(generateSlug("Multiple   Spaces   Here")).toBe(
        "multiple-spaces-here"
      );
    });

    it("should limit slug length to 50 chars", () => {
      const longName =
        "This is a very long product name that should be truncated";
      const slug = generateSlug(longName);
      expect(slug.length).toBeLessThanOrEqual(50);
    });

    it("should handle empty string", () => {
      expect(generateSlug("")).toBe("");
    });
  });

  describe("validateParsedPrompt", () => {
    const validPrompt: ParsedPrompt = {
      productName: "iPhone 15",
      amount: 5000000, // ₹50,000
      contactFields: "both",
      isRecurring: false,
      language: "en",
    };

    it("should validate correct prompt", () => {
      const result = validateParsedPrompt(validPrompt);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject empty product name", () => {
      const prompt = { ...validPrompt, productName: "" };
      const result = validateParsedPrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Product name is required");
    });

    it("should reject zero or negative amount", () => {
      const prompt = { ...validPrompt, amount: 0 };
      const result = validateParsedPrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Amount must be greater than 0");
    });

    it("should reject amount exceeding max limit", () => {
      const prompt = { ...validPrompt, amount: 10000001 }; // > ₹100,000
      const result = validateParsedPrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Amount is too large (max ₹100,000)");
    });

    it("should reject invalid contact fields", () => {
      const prompt = { ...validPrompt, contactFields: "invalid" as any };
      const result = validateParsedPrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Contact fields must be phone, email, or both"
      );
    });

    it("should reject recurring without billing interval", () => {
      const prompt = { ...validPrompt, isRecurring: true };
      const result = validateParsedPrompt(prompt);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Billing interval must be specified for recurring payments"
      );
    });

    it("should accept recurring with valid billing interval", () => {
      const prompt = {
        ...validPrompt,
        isRecurring: true,
        billingInterval: "monthly" as const,
      };
      const result = validateParsedPrompt(prompt);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept phone only contact field", () => {
      const prompt = { ...validPrompt, contactFields: "phone" };
      const result = validateParsedPrompt(prompt);
      expect(result.valid).toBe(true);
    });

    it("should accept email only contact field", () => {
      const prompt = { ...validPrompt, contactFields: "email" };
      const result = validateParsedPrompt(prompt);
      expect(result.valid).toBe(true);
    });
  });
});
