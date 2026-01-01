import { Layout } from "@/components/layout";
import { ProfileCard } from "@/components/profile-card";
import { useProfiles } from "@/hooks/use-profiles";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Search, Loader2, FilterX } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function Profiles() {
  const [filters, setFilters] = useState({
    gender: "",
    denomination: "",
    country: "",
    minAge: "",
    maxAge: "",
  });

  // Debounced/applied filters could be added here for perf, 
  // but for now we pass directly to hook which handles re-fetching.
  // We'll use a separate state for "applied" to prevent fetching on every keystroke if needed,
  // but for simplicity with small data, direct is fine.
  
  const { data: profiles, isLoading, error } = useProfiles(filters as any);

  const resetFilters = () => {
    setFilters({
      gender: "",
      denomination: "",
      country: "",
      minAge: "",
      maxAge: "",
    });
  };

  return (
    <Layout>
      <div className="bg-primary/5 py-12 mb-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Find Your Partner</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Browse through our verified profiles to find someone who shares your faith and values.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        {/* Filters */}
        <div className="bg-card border rounded-xl p-6 shadow-sm mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            <div className="space-y-2">
              <Label>Looking For</Label>
              <Select 
                value={filters.gender} 
                onValueChange={(val) => setFilters(prev => ({ ...prev, gender: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Groom (Male)</SelectItem>
                  <SelectItem value="Female">Bride (Female)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Denomination</Label>
              <Select 
                value={filters.denomination} 
                onValueChange={(val) => setFilters(prev => ({ ...prev, denomination: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Catholic">Catholic</SelectItem>
                  <SelectItem value="Pentecostal">Pentecostal</SelectItem>
                  <SelectItem value="Orthodox">Orthodox</SelectItem>
                  <SelectItem value="Protestant">Protestant</SelectItem>
                  <SelectItem value="Jacobite">Jacobite</SelectItem>
                  <SelectItem value="Marthoma">Marthoma</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Country</Label>
              <Select 
                value={filters.country} 
                onValueChange={(val) => setFilters(prev => ({ ...prev, country: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USA">United States</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="Singapore">Singapore</SelectItem>
                  <SelectItem value="UAE">United Arab Emirates</SelectItem>
                  <SelectItem value="New Zealand">New Zealand</SelectItem>
                  <SelectItem value="Ireland">Ireland</SelectItem>
                  <SelectItem value="India">India</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Min Age</Label>
              <Input 
                type="number" 
                placeholder="18" 
                value={filters.minAge}
                onChange={(e) => setFilters(prev => ({ ...prev, minAge: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Max Age</Label>
              <Input 
                type="number" 
                placeholder="60" 
                value={filters.maxAge}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAge: e.target.value }))}
              />
            </div>

            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <FilterX className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Finding matches...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">
            Error loading profiles. Please try again.
          </div>
        ) : profiles?.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No profiles found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search filters to see more results.</p>
            <Button onClick={resetFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {profiles?.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
