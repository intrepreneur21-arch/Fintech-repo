import { describe, expect, it } from "vitest";
import {
  calculateInvoiceTotals,
  formatCurrency,
  formatDate,
  generateInvoiceNumber,
  generateInvoiceHTML,
  createInvoiceData,
} from "./invoiceGenerator";
import type { InvoiceData } from "./invoiceGenerator";

describe("Invoice Generator", () => {
  const mockInvoiceData: InvoiceData = {
    invoiceNumber: "INV-2401-00001",
    invoiceDate: new Date("2024-01-15"),
    dueDate: new Date("2024-02-14"),
    
    sellerName: "Acme Corp",
    sellerEmail: "billing@acme.com",
    sellerPhone: "9876543210",
    sellerGSTIN: "18AABCT1234H1Z0",
    sellerAddress: "123 Business Street, Mumbai, MH 400001",
    
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "9123456789",
    customerGSTIN: "27AABCT1234H1Z0",
    customerAddress: "456 Customer Ave, Pune, MH 411001",
    
    productName: "Premium Consulting Services",
    description: "3 hours of professional consulting",
    quantity: 1,
    unitPrice: 50000,
    taxRate: 18,
    
    paymentMethod: "Razorpay",
    transactionId: "pay_123456789",
    paymentDate: new Date("2024-01-15"),
    
    notes: "Thank you for your business!",
    termsAndConditions: "Payment terms: Net 30 days",
  };

  describe("calculateInvoiceTotals", () => {
    it("should calculate correct subtotal", () => {
      const totals = calculateInvoiceTotals(mockInvoiceData);
      expect(totals.subtotal).toBe(50000);
    });

    it("should calculate correct tax amount", () => {
      const totals = calculateInvoiceTotals(mockInvoiceData);
      expect(totals.taxAmount).toBe(9000); // 18% of 50000
    });

    it("should calculate correct total", () => {
      const totals = calculateInvoiceTotals(mockInvoiceData);
      expect(totals.total).toBe(59000); // 50000 + 9000
    });

    it("should handle different tax rates", () => {
      const data = { ...mockInvoiceData, taxRate: 5 };
      const totals = calculateInvoiceTotals(data);
      expect(totals.taxAmount).toBe(2500); // 5% of 50000
      expect(totals.total).toBe(52500);
    });

    it("should handle zero tax rate", () => {
      const data = { ...mockInvoiceData, taxRate: 0 };
      const totals = calculateInvoiceTotals(data);
      expect(totals.taxAmount).toBe(0);
      expect(totals.total).toBe(50000);
    });

    it("should handle multiple quantities", () => {
      const data = { ...mockInvoiceData, quantity: 5 };
      const totals = calculateInvoiceTotals(data);
      expect(totals.subtotal).toBe(250000); // 5 * 50000
      expect(totals.taxAmount).toBe(45000); // 18% of 250000
      expect(totals.total).toBe(295000);
    });
  });

  describe("formatCurrency", () => {
    it("should format currency with rupee symbol", () => {
      expect(formatCurrency(50000)).toBe("₹50,000.00");
    });

    it("should format currency with decimal places", () => {
      expect(formatCurrency(9999.99)).toBe("₹9,999.99");
    });

    it("should format small amounts", () => {
      expect(formatCurrency(100)).toBe("₹100.00");
    });

    it("should format large amounts with commas", () => {
      expect(formatCurrency(1000000)).toBe("₹10,00,000.00");
    });

    it("should format zero", () => {
      expect(formatCurrency(0)).toBe("₹0.00");
    });
  });

  describe("formatDate", () => {
    it("should format date in Indian locale", () => {
      const date = new Date("2024-01-15");
      expect(formatDate(date)).toBe("15 January 2024");
    });

    it("should handle different months", () => {
      const date = new Date("2024-12-25");
      expect(formatDate(date)).toBe("25 December 2024");
    });

    it("should handle single digit days", () => {
      const date = new Date("2024-03-05");
      expect(formatDate(date)).toBe("5 March 2024");
    });
  });

  describe("generateInvoiceNumber", () => {
    it("should generate invoice number with correct format", () => {
      const invoiceNum = generateInvoiceNumber("user_123", 1);
      expect(invoiceNum).toMatch(/^INV-\d{4}-\d{5}$/);
    });

    it("should pad sequence with zeros", () => {
      const invoiceNum = generateInvoiceNumber("user_123", 5);
      expect(invoiceNum).toMatch(/00005/);
    });

    it("should handle large sequence numbers", () => {
      const invoiceNum = generateInvoiceNumber("user_123", 99999);
      expect(invoiceNum).toMatch(/99999/);
    });

    it("should include current year and month", () => {
      const invoiceNum = generateInvoiceNumber("user_123", 1);
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, "0");
      expect(invoiceNum).toContain(`INV-${year}${month}`);
    });
  });

  describe("generateInvoiceHTML", () => {
    it("should generate valid HTML", () => {
      const html = generateInvoiceHTML(mockInvoiceData);
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("</html>");
    });

    it("should include invoice number", () => {
      const html = generateInvoiceHTML(mockInvoiceData);
      expect(html).toContain("INV-2401-00001");
    });

    it("should include seller information", () => {
      const html = generateInvoiceHTML(mockInvoiceData);
      expect(html).toContain("Acme Corp");
      expect(html).toContain("billing@acme.com");
      expect(html).toContain("9876543210");
    });

    it("should include customer information", () => {
      const html = generateInvoiceHTML(mockInvoiceData);
      expect(html).toContain("John Doe");
      expect(html).toContain("john@example.com");
    });

    it("should include product details", () => {
      const html = generateInvoiceHTML(mockInvoiceData);
      expect(html).toContain("Premium Consulting Services");
      expect(html).toContain("3 hours of professional consulting");
    });

    it("should include calculated totals", () => {
      const html = generateInvoiceHTML(mockInvoiceData);
      expect(html).toContain("₹50,000.00"); // subtotal
      expect(html).toContain("₹9,000.00"); // tax
      expect(html).toContain("₹59,000.00"); // total
    });

    it("should include payment information", () => {
      const html = generateInvoiceHTML(mockInvoiceData);
      expect(html).toContain("Razorpay");
      expect(html).toContain("pay_123456789");
    });

    it("should include notes if provided", () => {
      const html = generateInvoiceHTML(mockInvoiceData);
      expect(html).toContain("Thank you for your business!");
    });

    it("should include terms and conditions if provided", () => {
      const html = generateInvoiceHTML(mockInvoiceData);
      expect(html).toContain("Payment terms: Net 30 days");
    });

    it("should not include optional fields if not provided", () => {
      const data = { ...mockInvoiceData, notes: undefined, termsAndConditions: undefined };
      const html = generateInvoiceHTML(data);
      // Check that the notes section is not included
      expect(html).not.toContain("<h4>Notes</h4>");
      expect(html).not.toContain("<h4>Terms & Conditions</h4>");
    });
  });

  describe("createInvoiceData", () => {
    const createInput = {
      userId: "user_123",
      transactionId: "pay_123",
      paymentPageId: "page_123",
      customerId: "cust_123",
      
      sellerName: "Test Seller",
      sellerEmail: "seller@test.com",
      customerName: "Test Customer",
      customerEmail: "customer@test.com",
      productName: "Test Product",
      amount: 10000,
      paymentMethod: "Razorpay",
      paymentDate: new Date(),
    };

    it("should create invoice data with required fields", () => {
      const invoiceData = createInvoiceData(createInput, "INV-2401-00001");
      
      expect(invoiceData.invoiceNumber).toBe("INV-2401-00001");
      expect(invoiceData.sellerName).toBe("Test Seller");
      expect(invoiceData.customerName).toBe("Test Customer");
      expect(invoiceData.productName).toBe("Test Product");
      expect(invoiceData.unitPrice).toBe(10000);
    });

    it("should set default tax rate to 18%", () => {
      const invoiceData = createInvoiceData(createInput, "INV-2401-00001");
      expect(invoiceData.taxRate).toBe(18);
    });

    it("should use custom tax rate if provided", () => {
      const input = { ...createInput, taxRate: 5 };
      const invoiceData = createInvoiceData(input, "INV-2401-00001");
      expect(invoiceData.taxRate).toBe(5);
    });

    it("should set quantity to 1", () => {
      const invoiceData = createInvoiceData(createInput, "INV-2401-00001");
      expect(invoiceData.quantity).toBe(1);
    });

    it("should set due date to 30 days from now", () => {
      const invoiceData = createInvoiceData(createInput, "INV-2401-00001");
      const expectedDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      // Compare dates (allowing for small time differences)
      expect(invoiceData.dueDate!.getDate()).toBe(expectedDueDate.getDate());
      expect(invoiceData.dueDate!.getMonth()).toBe(expectedDueDate.getMonth());
      expect(invoiceData.dueDate!.getFullYear()).toBe(expectedDueDate.getFullYear());
    });

    it("should include optional fields if provided", () => {
      const input = {
        ...createInput,
        sellerPhone: "9876543210",
        customerPhone: "9123456789",
        description: "Test description",
        notes: "Test notes",
      };
      
      const invoiceData = createInvoiceData(input, "INV-2401-00001");
      
      expect(invoiceData.sellerPhone).toBe("9876543210");
      expect(invoiceData.customerPhone).toBe("9123456789");
      expect(invoiceData.description).toBe("Test description");
      expect(invoiceData.notes).toBe("Test notes");
    });
  });
});
