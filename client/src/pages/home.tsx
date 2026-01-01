import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Heart, Users, Search, UserPlus } from "lucide-react";

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">NRIChristianMatrimony</h1>
          </div>
          <nav className="flex items-center gap-2 flex-wrap">
            <Link href="/profiles">
              <Button variant="ghost" data-testid="link-browse-profiles">
                <Search className="h-4 w-4 mr-2" />
                Browse Profiles
              </Button>
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/create-profile">
                  <Button variant="ghost" data-testid="link-create-profile">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Profile
                  </Button>
                </Link>
                <Link href="/my-profile">
                  <Button variant="ghost" data-testid="link-my-profile">
                    My Profile
                  </Button>
                </Link>
                <a href="/api/logout">
                  <Button variant="outline" data-testid="button-logout">
                    Logout
                  </Button>
                </a>
              </>
            ) : (
              <a href="/api/login">
                <Button data-testid="button-login">
                  Login
                </Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Find Your Perfect Match</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A trusted platform for NRI Christians seeking meaningful relationships. 
            Parents and well-wishers can also create profiles for their loved ones.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Family Involvement</CardTitle>
              <CardDescription>
                Parents, siblings, and friends can create profiles on behalf of their loved ones
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Christian Values</CardTitle>
              <CardDescription>
                Connect with like-minded Christians who share your faith and values
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Search className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Smart Search</CardTitle>
              <CardDescription>
                Filter by denomination, location, age, and more to find compatible matches
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          {isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Welcome back, {user?.firstName || user?.email || 'User'}!
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link href="/profiles">
                  <Button size="lg" data-testid="button-browse-now">
                    <Search className="h-5 w-5 mr-2" />
                    Browse Profiles
                  </Button>
                </Link>
                <Link href="/create-profile">
                  <Button size="lg" variant="outline" data-testid="button-create-now">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create a Profile
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground">
                Join our community today - It's completely free!
              </p>
              <a href="/api/login">
                <Button size="lg" data-testid="button-get-started">
                  Get Started
                </Button>
              </a>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>NRIChristianMatrimony - Free Matchmaking for the Christian Community</p>
        </div>
      </footer>
    </div>
  );
}
