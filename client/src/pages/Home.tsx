import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">AI Fintech Platform Builder</h1>
        <p className="text-xl text-gray-600 mb-8">
          Create payment pages instantly using natural language prompts
        </p>
        {isAuthenticated ? (
          <Button onClick={() => (window.location.href = "/dashboard")} className="px-8 py-3 text-lg">
            Go to Dashboard
          </Button>
        ) : (
          <Button onClick={() => (window.location.href = "/auth/login")} className="px-8 py-3 text-lg">
            Get Started
          </Button>
        )}
      </div>
    </div>
  );
}
