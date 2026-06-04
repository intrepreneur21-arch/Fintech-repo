import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function CreatePaymentPage() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [language, setLanguage] = useState<"en" | "hi" | "mr">("en");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createPageMutation = trpc.paymentPages.create.useMutation();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleCreatePage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createPageMutation.mutateAsync({
        prompt: prompt.trim(),
        language,
      });

      toast.success("Payment page created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create payment page");
    } finally {
      setIsLoading(false);
    }
  };

  const examplePrompts = {
    en: "Payment page banao for Online Course, ₹5000, collect email and phone",
    hi: "₹2999 ke liye Consulting Services ka payment page banao, monthly subscription, email collect karo",
    mr: "Digital Marketing Services के लिए ₹3500 का payment page बनाओ, phone और email collect करो",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Create Payment Page
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Use AI to generate a payment page with a simple prompt
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-white shadow-sm dark:bg-slate-900">
              <CardHeader>
                <CardTitle>Describe Your Payment Page</CardTitle>
                <CardDescription>
                  Tell the AI what you want to sell and how you want to collect payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Language Selector */}
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-sm font-medium">
                    Language
                  </Label>
                  <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                      <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Prompt Input */}
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-sm font-medium">
                    Your Prompt
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="E.g., Payment page banao for Online Course, ₹5000, collect email and phone"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Include: product name, amount (₹), contact fields (email/phone), and billing type
                    (one-time or monthly)
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleCreatePage}
                  disabled={isLoading || !prompt.trim()}
                  className="w-full gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Create Payment Page
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Tips & Examples */}
          <div className="space-y-4">
            {/* Tips Card */}
            <Card className="border-0 bg-blue-50 shadow-sm dark:bg-blue-950">
              <CardHeader>
                <CardTitle className="text-base">Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Include Amount</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Use ₹ symbol, e.g., "₹5000" or "5000 rupees"
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Contact Fields</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Specify "email", "phone", or "both"
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Billing Type</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Say "monthly" or "subscription" for recurring
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Example Prompts */}
            <Card className="border-0 bg-white shadow-sm dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-base">Example Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <button
                  onClick={() => setPrompt(examplePrompts[language])}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {examplePrompts[language]}
                </button>
              </CardContent>
            </Card>

            {/* Plan Info */}
            <Card className="border-0 bg-amber-50 shadow-sm dark:bg-amber-950">
              <CardHeader>
                <CardTitle className="text-base">Your Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Current Plan</span>
                  <span className="font-semibold capitalize text-slate-900 dark:text-white">
                    {user.planTier}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Pages Created</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {user.planTier === "free" ? "1/1" : user.planTier === "starter" ? "?/5" : "∞"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
