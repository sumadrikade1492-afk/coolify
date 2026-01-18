import { Layout } from "@/components/layout";
import { useProfile } from "@/hooks/use-profiles";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Church, User, Heart, ArrowLeft, Loader2, CheckCircle, Mail, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

function getDisplayProfileId(id: number): string {
  return `NRI${14700 + id}`;
}

function calculateAge(birthMonth: number | null, birthYear: number | null): number | null {
  if (birthMonth === null || birthYear === null) return null;
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  let age = currentYear - birthYear;
  if (currentMonth < birthMonth) {
    age--;
  }
  return age;
}

export default function ProfileDetail() {
  const [, params] = useRoute("/profile/:id");
  const id = parseInt(params?.id || "0");
  const { data: profile, isLoading } = useProfile(id);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [hasExpressedInterest, setHasExpressedInterest] = useState(false);

  const expressInterestMutation = useMutation({
    mutationFn: async (targetProfileId: number) => {
      const response = await apiRequest("POST", "/api/express-interest", { targetProfileId });
      return response.json();
    },
    onSuccess: () => {
      setHasExpressedInterest(true);
      toast({
        title: "Interest Expressed",
        description: "Your interest has been sent. You'll be notified if there's mutual interest.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unable to Express Interest",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleExpressInterest = () => {
    if (profile) {
      expressInterestMutation.mutate(profile.id);
    }
  };

  if (isLoading) return <Layout><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary w-10 h-10" /></div></Layout>;
  
  if (!profile) return (
    <Layout>
       <div className="container py-20 text-center">
         <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
         <Link href="/profiles"><Button>Back to Profiles</Button></Link>
       </div>
    </Layout>
  );

  const displayId = getDisplayProfileId(profile.id);
  const age = calculateAge(profile.birthMonth, profile.birthYear);
  const firstInitial = profile.firstName?.charAt(0)?.toUpperCase() || "";
  const lastInitial = profile.lastName?.charAt(0)?.toUpperCase() || "";
  const initials = `${firstInitial}.${lastInitial}`;
  const photoUrl = profile.photoUrl || `https://ui-avatars.com/api/?name=${firstInitial}${lastInitial}&background=fde68a&color=92400e&size=400`;

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
                   alt={`Profile ${displayId}`}
                   className="w-full h-full object-cover"
                 />
               </div>
               
               <div className="space-y-3">
                 {isAuthenticated ? (
                   <Button 
                     className="w-full text-lg h-12" 
                     size="lg" 
                     data-testid="button-express-interest"
                     onClick={handleExpressInterest}
                     disabled={expressInterestMutation.isPending || hasExpressedInterest}
                   >
                     {expressInterestMutation.isPending ? (
                       <>
                         <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...
                       </>
                     ) : hasExpressedInterest ? (
                       <>
                         <CheckCircle className="w-5 h-5 mr-2" /> Interest Sent
                       </>
                     ) : (
                       <>
                         <Heart className="w-5 h-5 mr-2" /> Express Interest
                       </>
                     )}
                   </Button>
                 ) : (
                   <Link href="/login">
                     <Button className="w-full text-lg h-12" size="lg">
                       Login to Connect
                     </Button>
                   </Link>
                 )}
               </div>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-serif font-bold text-lg mb-4">Profile Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2 border-primary/10">
                  <span className="text-muted-foreground">Profile ID</span>
                  <span className="font-mono font-bold">{displayId}</span>
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
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
              </div>

              {/* Verification Badges */}
              <div className="mt-4 pt-4 border-t border-primary/10">
                <h4 className="text-sm font-semibold mb-3">Verification Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {profile.phoneVerified ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Shield className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={profile.phoneVerified ? "text-green-600 font-medium" : "text-muted-foreground"}>
                      Phone {profile.phoneVerified ? "Verified" : "Not Verified"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-medium">Email Verified</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-4 mb-2 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground" data-testid="text-profile-name">
                  {initials} - {displayId}
                </h1>
                {profile.phoneVerified && (
                  <Badge className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                )}
              </div>
              <p className="text-xl text-muted-foreground mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="flex items-center gap-2">
                  <User className="w-5 h-5" /> 
                  {profile.gender}{age !== null && `, ${age} years`}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> {profile.city}, {profile.country}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="p-6">
                 <h3 className="font-serif font-bold text-xl mb-4 text-primary flex items-center gap-2">
                   <User className="w-5 h-5" /> Basic Details
                 </h3>
                 <div className="space-y-4">
                   {age !== null && (
                     <div className="grid grid-cols-2 gap-2">
                       <span className="text-muted-foreground">Age</span>
                       <span className="font-medium">{age} Years</span>
                     </div>
                   )}
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
              <h3 className="font-serif font-bold text-xl mb-4 text-primary">About Me</h3>
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

            {/* Contact Section - Only visible when logged in */}
            {isAuthenticated && (
              <Card className="p-6 border-primary/20 bg-primary/5">
                <h3 className="font-serif font-bold text-xl mb-4 text-primary">Contact Information</h3>
                <p className="text-muted-foreground mb-4">
                  To protect privacy, contact details are shared only after mutual interest is expressed.
                </p>
                <Button 
                  className="w-full md:w-auto" 
                  data-testid="button-request-contact"
                  onClick={handleExpressInterest}
                  disabled={expressInterestMutation.isPending || hasExpressedInterest}
                >
                  {hasExpressedInterest ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" /> Interest Sent
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" /> Express Interest to Connect
                    </>
                  )}
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
