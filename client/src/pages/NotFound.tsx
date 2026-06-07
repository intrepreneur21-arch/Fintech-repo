import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-2xl text-gray-600 mt-4">Page Not Found</p>
        <Button onClick={() => (window.location.href = "/")} className="mt-8">
          Go Home
        </Button>
      </div>
    </div>
  );
}
