/**
 * Storage Service
 * Handles file uploads to Manus S3 storage
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

// Initialize S3 client using Manus storage credentials
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "manus-storage";

/**
 * Upload file to S3 storage
 * @param key - Unique storage key (e.g., "invoices/user-123/invoice-456.pdf")
 * @param data - File content (Buffer, Uint8Array, or string)
 * @param contentType - MIME type (e.g., "application/pdf")
 * @returns Object with key and public URL
 */
export async function storagePut(
  key: string,
  data: Buffer | Uint8Array | string,
  contentType: string = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  try {
    // Convert string to Buffer if needed
    const body = typeof data === "string" ? Buffer.from(data, "utf-8") : data;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      // Make object publicly readable
      ACL: "public-read",
    });

    await s3Client.send(command);

    // Generate public URL
    const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;

    return { key, url };
  } catch (error) {
    console.error("[Storage] Failed to upload file:", error);
    throw new Error(`Failed to upload file to storage: ${key}`);
  }
}

/**
 * Get signed URL for downloading file from S3
 * @param key - Storage key
 * @param expiresIn - Expiration time in seconds (default: 3600)
 * @returns Signed URL
 */
export async function storageGet(
  key: string,
  expiresIn: number = 3600
): Promise<{ key: string; url: string }> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });

    return { key, url };
  } catch (error) {
    console.error("[Storage] Failed to get signed URL:", error);
    throw new Error(`Failed to get signed URL for key: ${key}`);
  }
}

/**
 * Generate a unique storage key for invoices
 * @param userId - User ID
 * @param invoiceId - Invoice ID
 * @returns Storage key
 */
export function generateInvoiceKey(userId: number, invoiceId: number): string {
  return `invoices/user-${userId}/invoice-${invoiceId}-${nanoid(8)}.pdf`;
}

/**
 * Generate a unique storage key for HTML invoices
 * @param userId - User ID
 * @param invoiceId - Invoice ID
 * @returns Storage key
 */
export function generateInvoiceHtmlKey(userId: number, invoiceId: number): string {
  return `invoices/user-${userId}/invoice-${invoiceId}-${nanoid(8)}.html`;
}
