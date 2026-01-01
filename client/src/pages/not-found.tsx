import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[80vh] w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4 p-8 shadow-xl border-none text-center">
          <CardContent className="pt-6">
            <div className="flex mb-6 gap-2 justify-center text-red-500">
              <AlertCircle className="h-12 w-12" />
            </div>

            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">404 Page Not Found</h1>
            <p className="mt-4 text-sm text-gray-600 mb-8">
              We couldn't find the page you were looking for. It might have been moved or deleted.
            </p>

            <Link href="/">
              <Button className="w-full font-bold">Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
