/**
 * Currency parsing and normalization utilities
 * Handles ₹ symbol, rupees to paise conversion, and amount validation
 */

/**
 * Parse amount string and convert to paise
 * Handles formats like:
 * - "₹50000" or "50000"
 * - "₹50,000" or "50,000"
 * - "50000 rupees"
 * - "₹50 thousand"
 * - "50k"
 *
 * @param amountStr - Amount string to parse
 * @returns Amount in paise (₹1 = 100 paise)
 * @throws Error if amount cannot be parsed
 */
export function parseAmountToPaise(amountStr: string): number {
  if (!amountStr || typeof amountStr !== "string") {
    throw new Error("Invalid amount: must be a non-empty string");
  }

  // Normalize: remove whitespace, convert to lowercase
  let normalized = amountStr.trim().toLowerCase();

  // Remove currency symbol
  normalized = normalized.replace(/[₹$]/g, "").trim();

  // Handle "thousand" or "k" suffix
  if (normalized.endsWith("k") || normalized.endsWith("thousand")) {
    const numStr = normalized.replace(/k|thousand/g, "").trim();
    const num = parseFloat(numStr);
    if (isNaN(num)) {
      throw new Error(`Invalid amount: cannot parse "${amountStr}"`);
    }
    return Math.round(num * 1000 * 100); // Convert to rupees then to paise
  }

  // Handle "lakh" suffix (1 lakh = 100,000)
  if (normalized.endsWith("lakh")) {
    const numStr = normalized.replace(/lakh/g, "").trim();
    const num = parseFloat(numStr);
    if (isNaN(num)) {
      throw new Error(`Invalid amount: cannot parse "${amountStr}"`);
    }
    return Math.round(num * 100000 * 100); // Convert to rupees then to paise
  }

  // Remove commas and "rupees" text
  normalized = normalized
    .replace(/,/g, "")
    .replace(/rupees?/g, "")
    .trim();

  // Parse the number
  const rupees = parseFloat(normalized);

  if (isNaN(rupees) || rupees < 0) {
    throw new Error(`Invalid amount: cannot parse "${amountStr}"`);
  }

  // Convert rupees to paise
  return Math.round(rupees * 100);
}

/**
 * Format paise amount to rupees string
 * @param paise - Amount in paise
 * @returns Formatted rupees string (e.g., "₹50,000")
 */
export function formatPaiseToRupees(paise: number): string {
  if (!Number.isInteger(paise) || paise < 0) {
    throw new Error("Invalid paise amount");
  }

  const rupees = paise / 100;
  return `₹${rupees.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

/**
 * Validate amount is within acceptable range
 * @param paise - Amount in paise
 * @returns true if valid, false otherwise
 */
export function isValidAmount(paise: number): boolean {
  // Minimum: ₹1 (100 paise)
  // Maximum: ₹100,000 (10,000,000 paise)
  return Number.isInteger(paise) && paise >= 100 && paise <= 10000000;
}

/**
 * Parse amount from various formats used in prompts
 * Handles Hindi/Marathi text patterns as well
 * @param text - Text containing amount information
 * @returns Amount in paise or null if not found
 */
export function extractAmountFromText(text: string): number | null {
  if (!text) return null;

  // Pattern 1: ₹50000 or ₹50,000
  const rupeesPattern = /₹\s*([0-9,]+(?:\.[0-9]{1,2})?)/;
  const rupeesMatch = text.match(rupeesPattern);
  if (rupeesMatch) {
    try {
      return parseAmountToPaise(rupeesMatch[1]);
    } catch {
      // Continue to next pattern
    }
  }

  // Pattern 2: 50000 rupees or 50000 रुपये (Hindi) or 50000 रुपये (Marathi)
  const rupeeTextPattern = /([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:rupees?|रुपये?|रुपये)/i;
  const rupeeTextMatch = text.match(rupeeTextPattern);
  if (rupeeTextMatch) {
    try {
      return parseAmountToPaise(rupeeTextMatch[1]);
    } catch {
      // Continue to next pattern
    }
  }

  // Pattern 3: 50k or 50 thousand
  const thousandPattern = /([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:k|thousand)/i;
  const thousandMatch = text.match(thousandPattern);
  if (thousandMatch) {
    try {
      return parseAmountToPaise(thousandMatch[1] + "k");
    } catch {
      // Continue to next pattern
    }
  }

  // Pattern 4: 1 lakh or 1 लाख (Hindi) or 1 लाख (Marathi)
  const lakhPattern = /([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:lakh|लाख)/i;
  const lakhMatch = text.match(lakhPattern);
  if (lakhMatch) {
    try {
      return parseAmountToPaise(lakhMatch[1] + " lakh");
    } catch {
      // Continue to next pattern
    }
  }

  // Pattern 5: Just a number (assume rupees)
  const numberPattern = /\b([0-9]{2,})\b/;
  const numberMatch = text.match(numberPattern);
  if (numberMatch) {
    try {
      return parseAmountToPaise(numberMatch[1]);
    } catch {
      // Continue
    }
  }

  return null;
}
