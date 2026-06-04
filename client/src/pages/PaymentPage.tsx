import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export default function PaymentPage() {
  const [, params] = useLocation();
  const slug = (params as any)?.slug;

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch payment page details
  const pageQuery = trpc.paymentPages.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const page = pageQuery.data;

  if (pageQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (pageQuery.isError || !page) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Card className="border-0 bg-white shadow-sm dark:bg-slate-900 max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p>Payment page not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handlePayment = async () => {
    // Validate inputs
    if (!page.contactFields.includes("email") && !email.trim()) {
      // Email not required
    } else if (page.contactFields.includes("email") && !email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!page.contactFields.includes("phone") && !phone.trim()) {
      // Phone not required
    } else if (page.contactFields.includes("phone") && !phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    setIsProcessing(true);
    try {
      // In a real implementation, this would call a tRPC procedure to create an order
      // and then open Razorpay checkout
      toast.success("Payment initiated! (Demo mode)");
      // TODO: Integrate with Razorpay checkout
    } catch (error: any) {
      toast.error(error.message || "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="border-0 bg-white shadow-lg dark:bg-slate-900">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardTitle className="text-2xl">{page.productName}</CardTitle>
            {page.description && (
              <CardDescription className="mt-2">{page.description}</CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Amount Display */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {page.isRecurring ? "Monthly Amount" : "Amount"}
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(page.amount / 100)}
              </p>
              {page.isRecurring && (
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  Billed monthly, cancel anytime
                </p>
              )}
            </div>

            {/* Contact Fields */}
            {page.contactFields.includes("email") && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            )}

            {page.contactFields.includes("phone") && (
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            )}

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 h-12 text-base font-semibold"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${formatCurrency(page.amount / 100)}`
              )}
            </Button>

            {/* Security Note */}
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              Secure payment powered by Razorpay
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
