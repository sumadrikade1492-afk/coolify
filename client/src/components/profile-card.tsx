import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Church, Ruler, CreditCard } from "lucide-react";
import { Link } from "wouter";
import type { Profile } from "@shared/schema";
import { motion } from "framer-motion";

function calculateAge(birthMonth: number, birthYear: number): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  let age = currentYear - birthYear;
  if (currentMonth < birthMonth) {
    age--;
  }
  return age;
}

export function ProfileCard({ profile }: { profile: Profile }) {
  // Use a nice placeholder if no photo
  const photoUrl = profile.photoUrl || `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&background=fde68a&color=92400e&size=200`;
  const age = calculateAge(profile.birthMonth, profile.birthYear);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-white">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img 
            src={photoUrl} 
            alt={`${profile.firstName} ${profile.lastName}`}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 right-3">
             <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm shadow-sm font-medium">
               {age} yrs
             </Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
            <h3 className="text-white font-serif text-xl font-bold truncate">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="text-white/90 text-sm truncate">{profile.occupation || "Not specified"}</p>
          </div>
        </div>
        
        <CardContent className="p-5 flex-1 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Church className="w-4 h-4 text-primary" />
            <span className="truncate">{profile.denomination}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="truncate">{profile.city}, {profile.country}</span>
          </div>
          {profile.height && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Ruler className="w-4 h-4 text-primary" />
              <span className="truncate">{profile.height}</span>
            </div>
          )}
          {profile.visaType && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="truncate">{profile.visaType}</span>
            </div>
          )}
          
          <div className="pt-2 flex flex-wrap gap-2">
            {profile.phoneVerified && (
              <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700">
                Verified
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          <Link href={`/profile/${profile.id}`} className="w-full">
            <Button className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors duration-300 font-semibold shadow-none hover:shadow-md">
              View Full Profile
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
