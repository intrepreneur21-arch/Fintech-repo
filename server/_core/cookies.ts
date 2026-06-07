/**
 * Cookie Utilities
 * Handles session cookie configuration
 */

import { Request } from "express";

export interface CookieOptions {
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  httpOnly: boolean;
  path: string;
  maxAge?: number;
}

/**
 * Get session cookie options based on request
 */
export function getSessionCookieOptions(req: Request): CookieOptions {
  const isProduction = process.env.NODE_ENV === "production";
  const isSecure = req.protocol === "https" || isProduction;

  return {
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    httpOnly: true,
    path: "/",
  };
}
