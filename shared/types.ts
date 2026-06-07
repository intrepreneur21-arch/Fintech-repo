/**
 * Shared Types
 */

export type PlanTier = "free" | "starter" | "pro";

export interface PaymentPage {
  id: number;
  userId: number;
  productName: string;
  description: string | null;
  amount: number;
  isRecurring: boolean;
  contactFields: string[];
  slug: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: number;
  userId: number;
  pageId: number;
  customerId: number | null;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amount: number;
  status: "pending" | "success" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: number;
  userId: number;
  email: string;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: number;
  userId: number;
  transactionId: number;
  invoiceNumber: string;
  storageKey: string;
  storageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageTracking {
  id: number;
  userId: number;
  pagesUsed: number;
  transactionsUsed: number;
  monthStart: Date;
  monthEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}
