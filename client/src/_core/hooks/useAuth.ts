/**
 * useAuth Hook
 * Provides authentication state and methods
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { User } from "../../../drizzle/schema";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const meQuery = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  useEffect(() => {
    if (meQuery.isLoading) {
      setLoading(true);
    } else {
      setLoading(false);
      if (meQuery.isError) {
        setError(meQuery.error as Error);
      }
    }
  }, [meQuery.isLoading, meQuery.isError, meQuery.error]);

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return {
    user: meQuery.data || null,
    loading,
    error,
    isAuthenticated: !!meQuery.data,
    logout,
  };
}
