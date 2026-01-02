import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Search, Heart, Shield, Globe, Users, Church } from "lucide-react";
import { useProfiles } from "@/hooks/use-profiles";
import { ProfileCard } from "@/components/profile-card";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import heroImage from "@assets/nrichristian_1767329613951.png";

export default function Home() {
  const { data: profiles, isLoading } = useProfiles();
  const { isAuthenticated } = useAuth();

  // Show only a few profiles on home
  const featuredProfiles = profiles?.slice(0, 4) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[650px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage}
            alt="Christian Wedding Couple" 
            className="w-full h-full object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>

        <div className="container relative z-10 px-6 md:px-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <span className="inline-block text-yellow-300 text-sm font-semibold tracking-wider uppercase mb-4">
              Christian Matrimony for NRIs
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
              Find Your <br/>
              <span className="text-yellow-300">Soulmate</span> in Faith
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 font-light leading-relaxed">
              Join Christian families worldwide in finding meaningful, 
              faith-centered unions. Your perfect match awaits.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/profiles">
                <Button size="lg" className="bg-yellow-500 text-gray-900 font-semibold rounded-full shadow-xl" data-testid="button-hero-browse">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Profiles
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link href="/register">
                  <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/50 font-semibold rounded-full backdrop-blur-sm" data-testid="button-hero-register">
                    Register Free
                  </Button>
                </Link>
              )}
            </div>

            
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-yellow-50/30 dark:to-yellow-950/10">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm font-semibold tracking-wider uppercase">Our Promise</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mt-2 mb-4">Why Families Trust Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We are committed to helping Christian families find meaningful connections rooted in shared faith and values.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 text-center group hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 text-white rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <Globe className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Global NRI Reach</h3>
              <p className="text-muted-foreground text-sm">Connecting Christian families from USA, UK, Canada, Australia, and beyond.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 text-center group hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 text-white rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Verified Profiles</h3>
              <p className="text-muted-foreground text-sm">Manual verification and phone validation to ensure genuine profiles.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 text-center group hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 text-white rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <Church className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Denomination Focused</h3>
              <p className="text-muted-foreground text-sm">Filter matches by specific denominations to find shared faith values.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 text-center group hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 text-white rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Family Involvement</h3>
              <p className="text-muted-foreground text-sm">Parents and family members can create profiles on behalf of their loved ones.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Profiles Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-between items-end gap-4 mb-12"
          >
            <div>
              <span className="text-primary text-sm font-semibold tracking-wider uppercase">Meet Our Members</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mt-2">Featured Profiles</h2>
            </div>
            <Link href="/profiles">
              <Button variant="outline" className="font-semibold" data-testid="button-view-all-profiles">
                View All Profiles
              </Button>
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : featuredProfiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProfiles.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-2xl">
              <Heart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No profiles yet</h3>
              <p className="text-muted-foreground mb-6">Be the first to create your profile and start your journey!</p>
              <Link href="/create-profile">
                <Button className="bg-primary text-white" data-testid="button-empty-create-profile">Create Your Profile</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/90 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Ready to Find Your Soulmate?</h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join our community of faith-focused singles and families. Your perfect match could be just a click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-yellow-400 text-gray-900 font-semibold rounded-full" data-testid="button-cta-register">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/profiles">
                <Button size="lg" variant="outline" className="border-white text-white font-semibold rounded-full" data-testid="button-cta-browse">
                  Browse Profiles
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
