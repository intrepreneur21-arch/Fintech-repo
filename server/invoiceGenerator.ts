/**
 * Invoice generation service
 * Creates invoices from transactions and generates PDF exports
 */

import { storagePut } from "./storage";

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate?: Date;
  
  // Seller info
  sellerName: string;
  sellerEmail: string;
  sellerPhone?: string;
  sellerGSTIN?: string;
  sellerAddress?: string;
  
  // Customer info
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerGSTIN?: string;
  customerAddress?: string;
  
  // Payment details
  productName: string;
  description?: string;
  quantity: number;
  unitPrice: number; // in rupees
  taxRate: number; // percentage (e.g., 18 for 18% GST)
  
  // Payment info
  paymentMethod: string;
  transactionId: string;
  paymentDate: Date;
  
  // Additional
  notes?: string;
  termsAndConditions?: string;
}

/**
 * Calculate invoice totals
 */
export function calculateInvoiceTotals(data: InvoiceData) {
  const subtotal = data.quantity * data.unitPrice;
  const taxAmount = (subtotal * data.taxRate) / 100;
  const total = subtotal + taxAmount;
  
  return {
    subtotal,
    taxAmount,
    total,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Generate HTML invoice
 */
export function generateInvoiceHTML(data: InvoiceData): string {
  const totals = calculateInvoiceTotals(data);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    
    .invoice-container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      border-bottom: 2px solid #007bff;
      padding-bottom: 20px;
    }
    
    .company-info h1 {
      font-size: 28px;
      color: #007bff;
      margin-bottom: 8px;
    }
    
    .company-info p {
      font-size: 14px;
      color: #666;
      margin: 4px 0;
    }
    
    .invoice-meta {
      text-align: right;
    }
    
    .invoice-meta h2 {
      font-size: 24px;
      color: #333;
      margin-bottom: 12px;
    }
    
    .invoice-meta p {
      font-size: 14px;
      color: #666;
      margin: 4px 0;
    }
    
    .invoice-number {
      font-weight: 600;
      color: #007bff;
    }
    
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    
    .party {
      padding: 20px;
      background: #f9f9f9;
      border-radius: 6px;
    }
    
    .party h3 {
      font-size: 14px;
      font-weight: 600;
      color: #007bff;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    
    .party p {
      font-size: 14px;
      color: #333;
      margin: 6px 0;
      line-height: 1.6;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    .items-table thead {
      background: #007bff;
      color: white;
    }
    
    .items-table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    
    .items-table td {
      padding: 12px;
      border-bottom: 1px solid #eee;
      font-size: 14px;
    }
    
    .items-table tbody tr:last-child td {
      border-bottom: 2px solid #007bff;
    }
    
    .text-right {
      text-align: right;
    }
    
    .totals {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }
    
    .totals-table {
      width: 300px;
    }
    
    .totals-table tr td {
      padding: 10px;
      font-size: 14px;
      border: none;
    }
    
    .totals-table tr td:first-child {
      text-align: left;
      font-weight: 500;
    }
    
    .totals-table tr td:last-child {
      text-align: right;
      font-weight: 600;
    }
    
    .total-row {
      background: #f0f0f0;
      font-size: 16px !important;
      font-weight: 700 !important;
      border-top: 2px solid #007bff !important;
      border-bottom: 2px solid #007bff !important;
    }
    
    .payment-info {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 6px;
      margin-bottom: 30px;
    }
    
    .payment-info h4 {
      font-size: 14px;
      font-weight: 600;
      color: #007bff;
      margin-bottom: 10px;
    }
    
    .payment-info p {
      font-size: 14px;
      color: #333;
      margin: 6px 0;
    }
    
    .notes {
      background: #fffbea;
      padding: 20px;
      border-left: 4px solid #ffc107;
      border-radius: 4px;
      margin-bottom: 30px;
    }
    
    .notes h4 {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }
    
    .notes p {
      font-size: 13px;
      color: #666;
      line-height: 1.6;
    }
    
    .footer {
      border-top: 1px solid #eee;
      padding-top: 20px;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .invoice-container {
        box-shadow: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="invoice-header">
      <div class="company-info">
        <h1>${data.sellerName}</h1>
        <p>${data.sellerEmail}</p>
        ${data.sellerPhone ? `<p>Phone: ${data.sellerPhone}</p>` : ""}
        ${data.sellerAddress ? `<p>${data.sellerAddress}</p>` : ""}
        ${data.sellerGSTIN ? `<p>GSTIN: ${data.sellerGSTIN}</p>` : ""}
      </div>
      <div class="invoice-meta">
        <h2>INVOICE</h2>
        <p><span class="invoice-number">#${data.invoiceNumber}</span></p>
        <p>Date: ${formatDate(data.invoiceDate)}</p>
        ${data.dueDate ? `<p>Due Date: ${formatDate(data.dueDate)}</p>` : ""}
      </div>
    </div>
    
    <div class="parties">
      <div class="party">
        <h3>Bill From</h3>
        <p><strong>${data.sellerName}</strong></p>
        <p>${data.sellerEmail}</p>
        ${data.sellerPhone ? `<p>${data.sellerPhone}</p>` : ""}
        ${data.sellerAddress ? `<p>${data.sellerAddress}</p>` : ""}
        ${data.sellerGSTIN ? `<p>GSTIN: ${data.sellerGSTIN}</p>` : ""}
      </div>
      <div class="party">
        <h3>Bill To</h3>
        <p><strong>${data.customerName}</strong></p>
        <p>${data.customerEmail}</p>
        ${data.customerPhone ? `<p>${data.customerPhone}</p>` : ""}
        ${data.customerAddress ? `<p>${data.customerAddress}</p>` : ""}
        ${data.customerGSTIN ? `<p>GSTIN: ${data.customerGSTIN}</p>` : ""}
      </div>
    </div>
    
    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th class="text-right">Quantity</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${data.productName}</strong>
            ${data.description ? `<br><small>${data.description}</small>` : ""}
          </td>
          <td class="text-right">${data.quantity}</td>
          <td class="text-right">${formatCurrency(data.unitPrice)}</td>
          <td class="text-right">${formatCurrency(data.quantity * data.unitPrice)}</td>
        </tr>
      </tbody>
    </table>
    
    <div class="totals">
      <table class="totals-table">
        <tr>
          <td>Subtotal:</td>
          <td>${formatCurrency(totals.subtotal)}</td>
        </tr>
        <tr>
          <td>Tax (${data.taxRate}%):</td>
          <td>${formatCurrency(totals.taxAmount)}</td>
        </tr>
        <tr class="total-row">
          <td>Total Amount:</td>
          <td>${formatCurrency(totals.total)}</td>
        </tr>
      </table>
    </div>
    
    <div class="payment-info">
      <h4>Payment Information</h4>
      <p><strong>Method:</strong> ${data.paymentMethod}</p>
      <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
      <p><strong>Payment Date:</strong> ${formatDate(data.paymentDate)}</p>
      <p><strong>Status:</strong> <span style="color: #28a745; font-weight: 600;">Paid</span></p>
    </div>
    
    ${data.notes && data.notes.trim() ? `
    <div class="notes">
      <h4>Notes</h4>
      <p>${data.notes}</p>
    </div>
    ` : ""}
    
    ${data.termsAndConditions && data.termsAndConditions.trim() ? `
    <div class="notes">
      <h4>Terms & Conditions</h4>
      <p>${data.termsAndConditions}</p>
    </div>
    ` : ""}
    
    <div class="footer">
      <p>Thank you for your business!</p>
      <p>This is a computer-generated invoice and does not require a signature.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate PDF invoice and upload to storage
 * Requires weasyprint or similar PDF generation
 */
export async function generateAndStorePDFInvoice(
  data: InvoiceData,
  userId: string
): Promise<{ url: string; key: string }> {
  const html = generateInvoiceHTML(data);
  
  // Store the HTML version first
  const htmlKey = `invoices/${userId}/${data.invoiceNumber}.html`;
  const htmlResult = await storagePut(htmlKey, html, "text/html");
  
  // Note: PDF generation requires external service
  // For now, we return the HTML version
  // In production, use a service like:
  // - manus-md-to-pdf (if available)
  // - External PDF API (e.g., PDFKit, WeasyPrint)
  // - Headless browser (Puppeteer)
  
  return htmlResult;
}

/**
 * Generate invoice number based on date and sequence
 */
export function generateInvoiceNumber(userId: string, sequence: number): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const seq = String(sequence).padStart(5, "0");
  
  return `INV-${year}${month}-${seq}`;
}

/**
 * Create invoice from transaction data
 */
export interface CreateInvoiceInput {
  userId: string;
  transactionId: string;
  paymentPageId: string;
  customerId: string;
  
  // Seller info
  sellerName: string;
  sellerEmail: string;
  sellerPhone?: string;
  sellerGSTIN?: string;
  sellerAddress?: string;
  
  // Customer info
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerGSTIN?: string;
  customerAddress?: string;
  
  // Payment details
  productName: string;
  description?: string;
  amount: number; // in rupees
  taxRate?: number; // default 18%
  
  // Payment info
  paymentMethod: string;
  paymentDate: Date;
  
  // Additional
  notes?: string;
  termsAndConditions?: string;
}

export function createInvoiceData(input: CreateInvoiceInput, invoiceNumber: string): InvoiceData {
  return {
    invoiceNumber,
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    
    sellerName: input.sellerName,
    sellerEmail: input.sellerEmail,
    sellerPhone: input.sellerPhone,
    sellerGSTIN: input.sellerGSTIN,
    sellerAddress: input.sellerAddress,
    
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    customerGSTIN: input.customerGSTIN,
    customerAddress: input.customerAddress,
    
    productName: input.productName,
    description: input.description,
    quantity: 1,
    unitPrice: input.amount,
    taxRate: input.taxRate || 18,
    
    paymentMethod: input.paymentMethod,
    transactionId: input.transactionId,
    paymentDate: input.paymentDate,
    
    notes: input.notes,
    termsAndConditions: input.termsAndConditions,
  };
}
