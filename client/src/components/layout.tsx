import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Browse Profiles", href: "/profiles" },
    ...(isAuthenticated ? [
      { label: "Create Profile", href: "/create-profile" },
      { label: "My Profile", href: "/my-profile" }
    ] : [])
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Heart className="w-5 h-5 text-primary fill-primary/20" />
            </div>
            <span className="font-serif text-xl font-bold text-foreground">
              NRI <span className="text-primary">Christian</span> Matrimony
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === item.href ? "text-primary font-bold" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserIcon className="w-4 h-4" />
                  <span>{user?.firstName || user?.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => logout()}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-md">
                <a href="/api/login">Login / Sign Up</a>
              </Button>
            )}
          </div>

          {/* Mobile Nav */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-6 mt-8">
                {navItems.map((item) => (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={`text-lg font-medium ${
                      location === item.href ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t pt-6">
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-4">
                      <span className="text-sm text-muted-foreground">Logged in as {user?.firstName || user?.email}</span>
                      <Button variant="outline" onClick={() => logout()}>Logout</Button>
                    </div>
                  ) : (
                    <Button asChild className="w-full bg-primary text-white">
                      <a href="/api/login">Login / Sign Up</a>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="font-serif text-lg font-bold mb-4">NRI Christian Matrimony</h3>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Connecting hearts in faith across borders. We are dedicated to helping NRI Christians find their perfect life partner within their community and denomination.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/profiles" className="hover:text-primary transition-colors">Browse Profiles</Link></li>
                <li><Link href="/create-profile" className="hover:text-primary transition-colors">Create Profile</Link></li>
                <li><Link href="/" className="hover:text-primary transition-colors">Success Stories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>support@nrichristianmatrimony.com</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} NRI Christian Matrimony. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
