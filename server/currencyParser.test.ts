import { describe, expect, it } from "vitest";
import {
  extractAmountFromText,
  formatPaiseToRupees,
  isValidAmount,
  parseAmountToPaise,
} from "./currencyParser";

describe("Currency Parser", () => {
  describe("parseAmountToPaise", () => {
    it("should parse rupee symbol format", () => {
      expect(parseAmountToPaise("₹50000")).toBe(5000000); // ₹50,000 = 5,000,000 paise
    });

    it("should parse rupee symbol with commas", () => {
      expect(parseAmountToPaise("₹50,000")).toBe(5000000);
    });

    it("should parse plain number", () => {
      expect(parseAmountToPaise("50000")).toBe(5000000);
    });

    it("should parse with commas", () => {
      expect(parseAmountToPaise("50,000")).toBe(5000000);
    });

    it("should parse with 'rupees' text", () => {
      expect(parseAmountToPaise("50000 rupees")).toBe(5000000);
    });

    it("should parse with 'rupee' text", () => {
      expect(parseAmountToPaise("50000 rupee")).toBe(5000000);
    });

    it("should parse thousand suffix", () => {
      expect(parseAmountToPaise("50k")).toBe(5000000);
    });

    it("should parse thousand suffix with space", () => {
      expect(parseAmountToPaise("50 thousand")).toBe(5000000);
    });

    it("should parse lakh suffix", () => {
      expect(parseAmountToPaise("1 lakh")).toBe(10000000); // 1 lakh = ₹100,000
    });

    it("should parse decimal amounts", () => {
      expect(parseAmountToPaise("₹99.99")).toBe(9999);
    });

    it("should handle case insensitivity", () => {
      expect(parseAmountToPaise("50K")).toBe(5000000);
      expect(parseAmountToPaise("50 THOUSAND")).toBe(5000000);
      expect(parseAmountToPaise("1 LAKH")).toBe(10000000);
    });

    it("should throw on invalid input", () => {
      expect(() => parseAmountToPaise("")).toThrow();
      expect(() => parseAmountToPaise("abc")).toThrow();
      expect(() => parseAmountToPaise("-1000")).toThrow();
    });

    it("should throw on non-string input", () => {
      expect(() => parseAmountToPaise(null as any)).toThrow();
      expect(() => parseAmountToPaise(undefined as any)).toThrow();
    });
  });

  describe("formatPaiseToRupees", () => {
    it("should format paise to rupees string", () => {
      expect(formatPaiseToRupees(5000000)).toBe("₹50,000");
    });

    it("should format with decimal", () => {
      expect(formatPaiseToRupees(9999)).toBe("₹99.99");
    });

    it("should format small amounts", () => {
      expect(formatPaiseToRupees(100)).toBe("₹1");
    });

    it("should format large amounts with commas", () => {
      expect(formatPaiseToRupees(10000000)).toBe("₹1,00,000");
    });

    it("should throw on invalid input", () => {
      expect(() => formatPaiseToRupees(-100)).toThrow();
      expect(() => formatPaiseToRupees(99.5)).toThrow(); // Not integer
    });
  });

  describe("isValidAmount", () => {
    it("should accept valid amounts", () => {
      expect(isValidAmount(100)).toBe(true); // ₹1
      expect(isValidAmount(5000000)).toBe(true); // ₹50,000
      expect(isValidAmount(10000000)).toBe(true); // ₹100,000 (max)
    });

    it("should reject amounts below minimum", () => {
      expect(isValidAmount(99)).toBe(false); // < ₹1
      expect(isValidAmount(0)).toBe(false);
      expect(isValidAmount(-100)).toBe(false);
    });

    it("should reject amounts above maximum", () => {
      expect(isValidAmount(10000001)).toBe(false); // > ₹100,000
    });

    it("should reject non-integer amounts", () => {
      expect(isValidAmount(100.5)).toBe(false);
    });
  });

  describe("extractAmountFromText", () => {
    it("should extract rupee symbol format", () => {
      expect(extractAmountFromText("Payment page for ₹50000")).toBe(5000000);
    });

    it("should extract from rupee text", () => {
      expect(extractAmountFromText("Amount: 50000 rupees")).toBe(5000000);
    });

    it("should extract thousand suffix", () => {
      expect(extractAmountFromText("Price is 50k")).toBe(5000000);
    });

    it("should extract lakh format", () => {
      expect(extractAmountFromText("Cost: 1 lakh")).toBe(10000000);
    });

    it("should extract from complex text", () => {
      expect(
        extractAmountFromText(
          "Payment page banao for iPhone 15, ₹50000, collect phone"
        )
      ).toBe(5000000);
    });

    it("should handle Hindi text with rupees", () => {
      expect(extractAmountFromText("₹50000 रुपये")).toBe(5000000);
    });

    it("should return null if no amount found", () => {
      expect(extractAmountFromText("No amount here")).toBeNull();
      expect(extractAmountFromText("")).toBeNull();
      expect(extractAmountFromText(null as any)).toBeNull();
    });

    it("should extract first valid amount", () => {
      expect(
        extractAmountFromText("First ₹100 then ₹50000 rupees")
      ).toBe(10000); // Finds first match
    });

    it("should handle whitespace variations", () => {
      expect(extractAmountFromText("₹  50000")).toBe(5000000);
      expect(extractAmountFromText("50000  rupees")).toBe(5000000);
    });
  });

  describe("Integration: Parse and Format", () => {
    it("should round-trip amount", () => {
      const original = "₹50,000";
      const paise = parseAmountToPaise(original);
      const formatted = formatPaiseToRupees(paise);
      expect(formatted).toBe("₹50,000");
    });

    it("should handle various input formats", () => {
      const amounts = [
        "₹100",
        "100 rupees",
        "100",
        "100k",
        "1 lakh",
      ];

      for (const amount of amounts) {
        const paise = parseAmountToPaise(amount);
        expect(isValidAmount(paise)).toBe(true);
      }
    });
  });

  describe("Edge cases", () => {
    it("should handle very small amounts", () => {
      expect(parseAmountToPaise("₹0.01")).toBe(1); // 1 paise
    });

    it("should handle amounts with multiple commas", () => {
      expect(parseAmountToPaise("₹10,00,000")).toBe(100000000); // ₹1,000,000
    });

    it("should handle mixed case and spacing", () => {
      expect(parseAmountToPaise("  ₹  50,000  RUPEES  ")).toBe(5000000);
    });

    it("should extract amount from Marathi-like text", () => {
      // Marathi uses same Devanagari script as Hindi
      expect(extractAmountFromText("₹50000 रुपये")).toBe(5000000);
    });
  });
});
