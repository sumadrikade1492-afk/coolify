import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Search, Heart, Shield, Globe } from "lucide-react";
import { useProfiles } from "@/hooks/use-profiles";
import { ProfileCard } from "@/components/profile-card";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { data: profiles, isLoading } = useProfiles();
  const { isAuthenticated } = useAuth();

  // Show only a few profiles on home
  const featuredProfiles = profiles?.slice(0, 4) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Unsplash image: Wedding couple, elegant, cinematic */}
        {/* <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80" /> */}
        <div className="absolute inset-0 z-0">
           <img 
            src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop" 
            alt="Wedding Background" 
            className="w-full h-full object-cover"
           />
           <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-purple-900/80 mix-blend-multiply" />
           <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="container relative z-10 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 drop-shadow-lg leading-tight">
              Faith-Centered Unions <br/> Across Borders
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
              Find your perfect match within the global Christian community. 
              Safe, secure, and dedicated to building Christ-centered families.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profiles">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-bold text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Profiles
                </Button>
              </Link>
              {!isAuthenticated && (
                <a href="/api/login">
                  <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 font-bold text-lg px-8 py-6 rounded-full backdrop-blur-sm">
                    Register Free
                  </Button>
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">Why Choose Us?</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Global NRI Reach</h3>
              <p className="text-muted-foreground">Connecting Christian families from USA, UK, Canada, Australia, and beyond.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Profiles</h3>
              <p className="text-muted-foreground">Manual verification and phone validation to ensure genuine profiles.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Denomination Focused</h3>
              <p className="text-muted-foreground">Filter matches by specific denominations to find shared faith values.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Profiles Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">Featured Profiles</h2>
              <p className="text-muted-foreground">Discover recently active members</p>
            </div>
            <Link href="/profiles">
              <Button variant="ghost" className="text-primary font-semibold">View All</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
