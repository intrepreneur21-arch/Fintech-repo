import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export function AppHeader() {
  const { user, logout, loading } = useAuth();
  const [location, navigate] = useLocation();

  const isHome = location === "/";
  const isDashboard = location === "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 font-bold text-slate-900 dark:text-white"
        >
          <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 p-2">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="hidden sm:inline">PaymentBuilder AI</span>
        </button>

        {/* Navigation */}
        <nav className="hidden gap-8 md:flex">
          {user && (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className={`text-sm font-medium transition-colors ${
                  isDashboard
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate("/create-page")}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Create Page
              </button>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <LanguageToggle />

          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          ) : user ? (
            <button
              onClick={() => logout()}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Logout
            </button>
          ) : (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
