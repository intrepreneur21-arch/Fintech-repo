/**
 * tRPC Context
 * Provides user context and request/response objects to procedures
 */

import { Request, Response } from "express";
import { getUserByOpenId } from "../db";
import { User } from "../../drizzle/schema";

export interface TrpcContext {
  user: User | null;
  req: Request;
  res: Response;
}

/**
 * Create context for each request
 */
export async function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<TrpcContext> {
  let user: User | null = null;

  // Extract user from session or JWT
  const userId = (req as any).userId;
  if (userId) {
    const foundUser = await getUserByOpenId(userId);
    if (foundUser) {
      user = foundUser;
    }
  }

  return {
    user,
    req,
    res,
  };
}
