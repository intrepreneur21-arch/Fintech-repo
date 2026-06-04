import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, TrendingUp, FileText, CreditCard } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { formatCurrency } from "@/lib/utils";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Fetch dashboard data
  const analytics = trpc.paymentPages.getDashboardAnalytics.useQuery(
    undefined,
    { enabled: !!user }
  );

  const pages = trpc.paymentPages.list.useQuery(undefined, { enabled: !!user });
  const recentTxns = trpc.paymentPages.getRecentTransactions.useQuery(
    { limit: 10 },
    { enabled: !!user }
  );

  if (authLoading || analytics.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const data = analytics.data;
  const planLimits = {
    free: { pages: 1, transactions: 10 },
    starter: { pages: 5, transactions: 500 },
    pro: { pages: Infinity, transactions: Infinity },
  };

  const limits = planLimits[user.planTier as keyof typeof planLimits] || planLimits.free;
  const pagesUsagePercent =
    limits.pages === Infinity ? 0 : ((data?.pagesUsed || 0) / limits.pages) * 100;
  const txnUsagePercent =
    limits.transactions === Infinity
      ? 0
      : ((data?.transactionsUsed || 0) / limits.transactions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Welcome back, {user.name || "User"}
            </p>
          </div>
          <Button
            onClick={() => navigate("/create-page")}
            className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Plus className="h-4 w-4" />
            Create Payment Page
          </Button>
        </div>

        {/* Plan Info Banner */}
        <Card className="mb-8 border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {user.planTier === "free"
                    ? "Free Plan"
                    : user.planTier === "starter"
                      ? "Starter Plan"
                      : "Pro Plan"}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {user.planTier === "free"
                    ? "1 page, 10 transactions/month"
                    : user.planTier === "starter"
                      ? "5 pages, 500 transactions/month"
                      : "Unlimited pages and transactions"}
                </p>
              </div>
              {user.planTier !== "pro" && (
                <Button variant="outline" className="gap-2">
                  Upgrade Plan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card className="border-0 bg-white shadow-sm dark:bg-slate-900">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Pages
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {data?.totalPages || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm dark:bg-slate-900">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Transactions
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {data?.totalTransactions || 0}
                  </p>
                </div>
                <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
                  <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm dark:bg-slate-900">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Revenue
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency((data?.totalRevenue || 0) / 100)}
                  </p>
                </div>
                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm dark:bg-slate-900">
            <CardContent className="pt-6">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  This Month
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Pages</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {data?.pagesUsed || 0}/{limits.pages === Infinity ? "∞" : limits.pages}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                      style={{ width: `${Math.min(pagesUsagePercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pages" className="space-y-4">
          <TabsList className="bg-white dark:bg-slate-900">
            <TabsTrigger value="pages">Payment Pages</TabsTrigger>
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="space-y-4">
            <Card className="border-0 bg-white shadow-sm dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Your Payment Pages</CardTitle>
                <CardDescription>
                  Manage and monitor all your payment pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pages.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : pages.data && pages.data.length > 0 ? (
                  <div className="space-y-3">
                    {pages.data.map((page) => (
                      <div
                        key={page.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
                      >
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">
                            {page.productName}
                          </h4>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {formatCurrency(page.amount / 100)} •{" "}
                            {page.isRecurring ? "Recurring" : "One-time"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={page.status === "active" ? "default" : "secondary"}
                          >
                            {page.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-slate-600 dark:text-slate-400">
                      No payment pages yet. Create one to get started!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card className="border-0 bg-white shadow-sm dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Latest transactions across all your payment pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentTxns.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : recentTxns.data && recentTxns.data.length > 0 ? (
                  <div className="space-y-3">
                    {recentTxns.data.map((txn) => (
                      <div
                        key={txn.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
                      >
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {txn.customerEmail}
                          </p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {formatCurrency(txn.amount / 100)}
                            </p>
                            <Badge
                              variant={
                                txn.status === "success"
                                  ? "default"
                                  : txn.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="mt-1"
                            >
                              {txn.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-slate-600 dark:text-slate-400">
                      No transactions yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
