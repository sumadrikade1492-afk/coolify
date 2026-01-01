import { Layout } from "@/components/layout";
import { useProfile } from "@/hooks/use-profiles";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Briefcase, Church, User, Heart, Phone, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

export default function ProfileDetail() {
  const [, params] = useRoute("/profile/:id");
  const id = parseInt(params?.id || "0");
  const { data: profile, isLoading } = useProfile(id);
  const { isAuthenticated } = useAuth();
  const [contactOpen, setContactOpen] = useState(false);

  if (isLoading) return <Layout><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div></Layout>;
  
  if (!profile) return (
    <Layout>
       <div className="container py-20 text-center">
         <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
         <Link href="/profiles"><Button>Back to Profiles</Button></Link>
       </div>
    </Layout>
  );

  const photoUrl = profile.photoUrl || `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&background=fde68a&color=92400e&size=400`;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link href="/profiles" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Browse
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Photo & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-4 border-none shadow-lg overflow-hidden">
               <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted mb-4 relative">
                 <img 
                   src={photoUrl} 
                   alt={profile.firstName} 
                   className="w-full h-full object-cover"
                 />
               </div>
               
               <div className="space-y-3">
                 <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                   <DialogTrigger asChild>
                     <Button className="w-full text-lg h-12" size="lg">
                       Contact Profile
                     </Button>
                   </DialogTrigger>
                   <DialogContent>
                     <DialogHeader>
                       <DialogTitle>Contact Information</DialogTitle>
                       <DialogDescription>
                         {isAuthenticated ? (
                           <div className="py-4 space-y-4">
                             <div className="p-4 bg-muted rounded-lg border">
                               <p className="font-semibold text-lg flex items-center gap-2">
                                 <Phone className="w-5 h-5 text-primary" />
                                 {profile.phoneNumber || "No phone number listed"}
                               </p>
                               <p className="text-sm text-muted-foreground mt-1">
                                 Please mention you found them on NRI Christian Matrimony.
                               </p>
                             </div>
                             {profile.phoneVerified && (
                               <div className="flex items-center text-green-600 text-sm font-medium">
                                 <CheckCircle className="w-4 h-4 mr-2" />
                                 Phone Number Verified
                               </div>
                             )}
                           </div>
                         ) : (
                           <div className="py-6 text-center">
                             <p className="mb-4">You must be logged in to view contact details.</p>
                             <a href="/api/login"><Button>Login Now</Button></a>
                           </div>
                         )}
                       </DialogDescription>
                     </DialogHeader>
                   </DialogContent>
                 </Dialog>
                 
                 <Button variant="outline" className="w-full">
                   <Heart className="w-4 h-4 mr-2" /> Shortlist
                 </Button>
               </div>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-serif font-bold text-lg mb-4">Profile Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2 border-primary/10">
                  <span className="text-muted-foreground">Profile ID</span>
                  <span className="font-mono font-bold">{profile.id}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-primary/10">
                  <span className="text-muted-foreground">Posted By</span>
                  <span className="font-medium">
                    {profile.createdBy === "Self" 
                      ? "Self" 
                      : profile.createdByName 
                        ? `${profile.createdByName} (${profile.createdBy})`
                        : profile.createdBy}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2 border-primary/10">
                  <span className="text-muted-foreground">Active</span>
                  <span className="font-medium">Recently</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-serif font-bold text-foreground">
                  {profile.firstName} {profile.lastName}
                </h1>
                {profile.phoneVerified && (
                  <Badge className="bg-green-600 hover:bg-green-700">Verified</Badge>
                )}
              </div>
              <p className="text-xl text-muted-foreground mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5" /> {profile.city}, {profile.country}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="p-6">
                 <h3 className="font-serif font-bold text-xl mb-4 text-primary flex items-center gap-2">
                   <User className="w-5 h-5" /> Basic Details
                 </h3>
                 <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-2">
                     <span className="text-muted-foreground">Age</span>
                     <span className="font-medium">{(() => {
                       const today = new Date();
                       const currentYear = today.getFullYear();
                       const currentMonth = today.getMonth() + 1;
                       let age = currentYear - profile.birthYear;
                       if (currentMonth < profile.birthMonth) age--;
                       return age;
                     })()} Years</span>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                     <span className="text-muted-foreground">Gender</span>
                     <span className="font-medium">{profile.gender}</span>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                     <span className="text-muted-foreground">Occupation</span>
                     <span className="font-medium">{profile.occupation || "N/A"}</span>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                     <span className="text-muted-foreground">Height</span>
                     <span className="font-medium">{profile.height || "N/A"}</span>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                     <span className="text-muted-foreground">Visa Type</span>
                     <span className="font-medium">{profile.visaType || "N/A"}</span>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                     <span className="text-muted-foreground">Years in USA</span>
                     <span className="font-medium">
                       {profile.yearsInUS !== null && profile.yearsInUS !== undefined
                         ? profile.yearsInUS === 0 
                           ? "Less than 1 year"
                           : profile.yearsInUS >= 20
                             ? "20+ years"
                             : profile.yearsInUS >= 15
                               ? "15-20 years"
                               : profile.yearsInUS > 10
                                 ? "10-15 years"
                                 : `${profile.yearsInUS} years`
                         : "N/A"}
                     </span>
                   </div>
                 </div>
               </Card>

               <Card className="p-6">
                 <h3 className="font-serif font-bold text-xl mb-4 text-primary flex items-center gap-2">
                   <Church className="w-5 h-5" /> Background
                 </h3>
                 <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-2">
                     <span className="text-muted-foreground">Denomination</span>
                     <span className="font-medium">
                       {profile.denomination === "Other" && profile.otherDenomination 
                         ? profile.otherDenomination 
                         : profile.denomination}
                     </span>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                     <span className="text-muted-foreground">Native Place</span>
                     <span className="font-medium">{profile.nativePlace || "N/A"}</span>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                     <span className="text-muted-foreground">Native Language</span>
                     <span className="font-medium">{profile.nativeLanguage || "N/A"}</span>
                   </div>
                 </div>
               </Card>
            </div>

            <Card className="p-6">
              <h3 className="font-serif font-bold text-xl mb-4 text-primary">About {profile.firstName}</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {profile.aboutMe || "No description provided."}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-serif font-bold text-xl mb-4 text-primary">Partner Preferences</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {profile.partnerPreferences || "No specific preferences listed."}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
