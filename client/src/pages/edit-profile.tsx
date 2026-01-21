import { Layout } from "@/components/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProfile, useUpdateProfile } from "@/hooks/use-profiles";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { insertProfileSchema } from "@shared/schema";
import { useLocation, useRoute } from "wouter";
import { useEffect } from "react";
import { Loader2, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

// Extend schema with strict validation for all mandatory fields
const currentYear = new Date().getFullYear();
const formSchema = insertProfileSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Gender is required"),
  birthMonth: z.coerce.number().min(1, "Birth month is required").max(12),
  birthYear: z.coerce.number().min(1940).max(currentYear - 18, "Must be at least 18 years old"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  nativePlace: z.string().min(1, "Native place is required"),
  nativeLanguage: z.string().min(1, "Native language is required"),
  denomination: z.string().min(1, "Denomination is required"),
  otherDenomination: z.string().optional(),
  occupation: z.string().min(1, "Occupation is required"),
  visaType: z.string().min(1, "Visa type is required"),
  height: z.string().min(1, "Height is required"),
  yearsInUS: z.coerce.number().min(0, "Years in US is required"),
  aboutMe: z.string().min(10, "Please write at least 10 characters about yourself"),
  partnerPreferences: z.string().min(10, "Please write at least 10 characters about partner preferences"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  createdBy: z.string().min(1, "Please specify who is creating this profile"),
  createdByName: z.string().optional(),
  education: z.string().min(1, "Education is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  hasChildren: z.string().optional(),
  familyType: z.string().min(1, "Family type is required"),
  diet: z.string().min(1, "Diet preference is required"),
  drinking: z.string().min(1, "Please specify drinking habits"),
  smoking: z.string().min(1, "Please specify smoking habits"),
  willingToRelocate: z.string().min(1, "Please specify willingness to relocate"),
  fathersOccupation: z.string().optional(),
  mothersOccupation: z.string().optional(),
  siblings: z.string().optional(),
}).refine((data) => {
  // Require otherDenomination when denomination is "Other"
  if (data.denomination === "Other" && (!data.otherDenomination || data.otherDenomination.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Please specify your church/denomination name",
  path: ["otherDenomination"],
}).refine((data) => {
  // Require createdByName when createdBy is not "Self"
  if (data.createdBy !== "Self" && (!data.createdByName || data.createdByName.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Please provide the name of the person creating this profile",
  path: ["createdByName"],
}).refine((data) => {
  if (data.maritalStatus !== "Never Married" && (!data.hasChildren || data.hasChildren.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Please specify if you have children",
  path: ["hasChildren"],
});

export default function EditProfile() {
  const [, params] = useRoute("/edit-profile/:id");
  const profileId = parseInt(params?.id || "0");
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile, isLoading: profileLoading } = useProfile(profileId);
  const { mutate, isPending } = useUpdateProfile();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "",
      birthMonth: undefined,
      birthYear: undefined,
      country: "",
      city: "",
      nativePlace: "",
      nativeLanguage: "",
      denomination: "",
      otherDenomination: "",
      occupation: "",
      visaType: "",
      height: "",
      yearsInUS: undefined,
      aboutMe: "",
      partnerPreferences: "",
      photoUrl: "",
      createdBy: "Self",
      createdByName: "",
      phoneNumber: "",
      education: "",
      maritalStatus: "",
      hasChildren: "",
      familyType: "",
      diet: "",
      drinking: "",
      smoking: "",
      willingToRelocate: "",
      fathersOccupation: "",
      mothersOccupation: "",
      siblings: "",
    }
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        gender: profile.gender || "",
        birthMonth: profile.birthMonth ?? undefined,
        birthYear: profile.birthYear ?? undefined,
        country: profile.country || "",
        city: profile.city || "",
        nativePlace: profile.nativePlace || "",
        nativeLanguage: profile.nativeLanguage || "",
        denomination: profile.denomination || "",
        otherDenomination: profile.otherDenomination || "",
        occupation: profile.occupation || "",
        visaType: profile.visaType || "",
        height: profile.height || "",
        yearsInUS: profile.yearsInUS ?? undefined,
        aboutMe: profile.aboutMe || "",
        partnerPreferences: profile.partnerPreferences || "",
        photoUrl: profile.photoUrl || "",
        createdBy: profile.createdBy || "",
        createdByName: profile.createdByName || "",
        phoneNumber: profile.phoneNumber || "",
        education: profile.education || "",
        maritalStatus: profile.maritalStatus || "",
        hasChildren: profile.hasChildren || "",
        familyType: profile.familyType || "",
        diet: profile.diet || "",
        drinking: profile.drinking || "",
        smoking: profile.smoking || "",
        willingToRelocate: profile.willingToRelocate || "",
        fathersOccupation: profile.fathersOccupation || "",
        mothersOccupation: profile.mothersOccupation || "",
        siblings: profile.siblings || "",
      });
    }
  }, [profile, form]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ title: "Login Required", description: "Please login to edit a profile", variant: "destructive" });
      setTimeout(() => window.location.href = "/api/login", 1000);
    }
  }, [authLoading, isAuthenticated, toast]);

  useEffect(() => {
    // Allow if user owns the profile OR if user is admin
    if (!profileLoading && profile && user && profile.userId !== user.id && !(user as any).isAdmin) {
      toast({ title: "Unauthorized", description: "You can only edit your own profiles", variant: "destructive" });
      setLocation("/my-profile");
    }
  }, [profileLoading, profile, user, toast, setLocation]);

  if (authLoading || profileLoading) {
    return <Layout><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div></Layout>;
  }

  if (!profile) {
    return <Layout><div className="container py-20 text-center"><h2 className="text-2xl font-bold">Profile not found</h2></div></Layout>;
  }

  function onSubmit(data: z.infer<typeof formSchema>) {
    mutate({ id: profileId, data }, {
      onSuccess: () => {
        setLocation("/my-profile");
      }
    });
  }

  const cityOptions: Record<string, string[]> = {
    "USA": [
      "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
      "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis", "Seattle", "Denver", "Oklahoma City",
      "Nashville", "El Paso", "Washington DC", "Boston", "Las Vegas", "Detroit", "Portland", "Memphis", "Louisville", "Baltimore",
      "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Mesa", "Sacramento", "Atlanta", "Kansas City", "Colorado Springs", "Omaha",
      "Raleigh", "Miami", "Long Beach", "Virginia Beach", "Oakland", "Minneapolis", "Tulsa", "Tampa", "Arlington", "Wichita",
      "New Orleans", "Cleveland", "Bakersfield", "Aurora", "Anaheim", "Honolulu", "Santa Ana", "Riverside", "Corpus Christi", "Lexington",
      "Henderson", "Stockton", "Saint Paul", "Cincinnati", "St. Louis", "Pittsburgh", "Greensboro", "Lincoln", "Anchorage", "Plano",
      "Orlando", "Irvine", "Newark", "Durham", "Chula Vista", "Toledo", "Fort Wayne", "St. Petersburg", "Laredo", "Jersey City",
      "Chandler", "Madison", "Lubbock", "Scottsdale", "Reno", "Buffalo", "Gilbert", "Glendale", "North Las Vegas", "Winston-Salem",
      "Chesapeake", "Norfolk", "Fremont", "Garland", "Irving", "Hialeah", "Richmond", "Boise", "Spokane", "Frisco", "Other"
    ],
    "Canada": ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton", "Winnipeg", "Other"],
    "UK": ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Edinburgh", "Bristol", "Liverpool", "Other"],
    "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra", "Other"],
    "Germany": ["Berlin", "Munich", "Frankfurt", "Hamburg", "Cologne", "Stuttgart", "Other"],
    "Singapore": ["Singapore"],
    "UAE": ["Dubai", "Abu Dhabi", "Sharjah", "Other"],
    "New Zealand": ["Auckland", "Wellington", "Christchurch", "Other"],
    "Ireland": ["Dublin", "Cork", "Galway", "Limerick", "Other"],
    "Switzerland": ["Zurich", "Geneva", "Basel", "Bern", "Other"],
    "Netherlands": ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Other"],
    "India": ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Kochi", "Other"],
    "Other": ["Other"]
  };

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">Update your details below.</p>
        </div>

        <Card className="p-8 shadow-lg border-primary/10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 text-primary">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl><Input placeholder="John" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthMonth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birth Month</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">January</SelectItem>
                            <SelectItem value="2">February</SelectItem>
                            <SelectItem value="3">March</SelectItem>
                            <SelectItem value="4">April</SelectItem>
                            <SelectItem value="5">May</SelectItem>
                            <SelectItem value="6">June</SelectItem>
                            <SelectItem value="7">July</SelectItem>
                            <SelectItem value="8">August</SelectItem>
                            <SelectItem value="9">September</SelectItem>
                            <SelectItem value="10">October</SelectItem>
                            <SelectItem value="11">November</SelectItem>
                            <SelectItem value="12">December</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birth Year</FormLabel>
                        <FormControl><Input type="number" placeholder="1990" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 text-primary">Location & Background</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USA">United States</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => {
                      const country = form.watch("country");
                      const cities = country ? (cityOptions[country] || ["Other"]) : [];
                      return (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            City
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>If your city is not listed, select the nearest city</p>
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!country}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={country ? "Select city" : "Select country first"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cities.map(city => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="nativePlace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Native Place in India</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Kerala, Tamil Nadu, Punjab" value={field.value || ""} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nativeLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Native Language</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Malayalam">Malayalam</SelectItem>
                            <SelectItem value="Tamil">Tamil</SelectItem>
                            <SelectItem value="Telugu">Telugu</SelectItem>
                            <SelectItem value="Kannada">Kannada</SelectItem>
                            <SelectItem value="Hindi">Hindi</SelectItem>
                            <SelectItem value="Punjabi">Punjabi</SelectItem>
                            <SelectItem value="Bengali">Bengali</SelectItem>
                            <SelectItem value="Marathi">Marathi</SelectItem>
                            <SelectItem value="Gujarati">Gujarati</SelectItem>
                            <SelectItem value="Konkani">Konkani</SelectItem>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="denomination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Denomination / Church</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select denomination" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Catholic">Catholic</SelectItem>
                            <SelectItem value="Pentecostal">Pentecostal</SelectItem>
                            <SelectItem value="Orthodox">Orthodox</SelectItem>
                            <SelectItem value="Protestant">Protestant</SelectItem>
                            <SelectItem value="Jacobite">Jacobite</SelectItem>
                            <SelectItem value="Marthoma">Marthoma</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="otherDenomination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Church/Denomination Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder={form.watch("denomination") === "Other" ? "Enter your church or denomination name" : "Select 'Other' above to enter"}
                            value={field.value || ""} 
                            onChange={field.onChange}
                            disabled={form.watch("denomination") !== "Other"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl><Input placeholder="Software Engineer" value={field.value || ""} onChange={field.onChange} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visaType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visa Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visa type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="US Citizen">US Citizen</SelectItem>
                            <SelectItem value="Green Card">Green Card</SelectItem>
                            <SelectItem value="H1B">H1B</SelectItem>
                            <SelectItem value="H4">H4</SelectItem>
                            <SelectItem value="L1">L1</SelectItem>
                            <SelectItem value="L2">L2</SelectItem>
                            <SelectItem value="OPT">OPT</SelectItem>
                            <SelectItem value="F1">F1 (Student)</SelectItem>
                            <SelectItem value="Work Permit">Work Permit</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select height" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="4'8&quot;">4'8" (142 cm)</SelectItem>
                            <SelectItem value="4'9&quot;">4'9" (145 cm)</SelectItem>
                            <SelectItem value="4'10&quot;">4'10" (147 cm)</SelectItem>
                            <SelectItem value="4'11&quot;">4'11" (150 cm)</SelectItem>
                            <SelectItem value="5'0&quot;">5'0" (152 cm)</SelectItem>
                            <SelectItem value="5'1&quot;">5'1" (155 cm)</SelectItem>
                            <SelectItem value="5'2&quot;">5'2" (157 cm)</SelectItem>
                            <SelectItem value="5'3&quot;">5'3" (160 cm)</SelectItem>
                            <SelectItem value="5'4&quot;">5'4" (163 cm)</SelectItem>
                            <SelectItem value="5'5&quot;">5'5" (165 cm)</SelectItem>
                            <SelectItem value="5'6&quot;">5'6" (168 cm)</SelectItem>
                            <SelectItem value="5'7&quot;">5'7" (170 cm)</SelectItem>
                            <SelectItem value="5'8&quot;">5'8" (173 cm)</SelectItem>
                            <SelectItem value="5'9&quot;">5'9" (175 cm)</SelectItem>
                            <SelectItem value="5'10&quot;">5'10" (178 cm)</SelectItem>
                            <SelectItem value="5'11&quot;">5'11" (180 cm)</SelectItem>
                            <SelectItem value="6'0&quot;">6'0" (183 cm)</SelectItem>
                            <SelectItem value="6'1&quot;">6'1" (185 cm)</SelectItem>
                            <SelectItem value="6'2&quot;">6'2" (188 cm)</SelectItem>
                            <SelectItem value="6'3&quot;">6'3" (191 cm)</SelectItem>
                            <SelectItem value="6'4&quot;">6'4" (193 cm)</SelectItem>
                            <SelectItem value="6'5&quot;">6'5" (196 cm)</SelectItem>
                            <SelectItem value="6'6&quot;">6'6" (198 cm)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="yearsInUS"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years in USA</FormLabel>
                        <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value?.toString() || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select years" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">Less than 1 year</SelectItem>
                            <SelectItem value="1">1 year</SelectItem>
                            <SelectItem value="2">2 years</SelectItem>
                            <SelectItem value="3">3 years</SelectItem>
                            <SelectItem value="4">4 years</SelectItem>
                            <SelectItem value="5">5 years</SelectItem>
                            <SelectItem value="6">6 years</SelectItem>
                            <SelectItem value="7">7 years</SelectItem>
                            <SelectItem value="8">8 years</SelectItem>
                            <SelectItem value="9">9 years</SelectItem>
                            <SelectItem value="10">10 years</SelectItem>
                            <SelectItem value="15">10-15 years</SelectItem>
                            <SelectItem value="20">15-20 years</SelectItem>
                            <SelectItem value="25">20+ years</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Background & Lifestyle */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 text-primary">Background & Lifestyle</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Highest Education</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select education" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="High School">High School</SelectItem>
                            <SelectItem value="Diploma">Diploma</SelectItem>
                            <SelectItem value="Bachelor's">Bachelor's Degree</SelectItem>
                            <SelectItem value="Master's">Master's Degree</SelectItem>
                            <SelectItem value="PhD">PhD / Doctorate</SelectItem>
                            <SelectItem value="MD">MD (Medical Doctor)</SelectItem>
                            <SelectItem value="MBA">MBA</SelectItem>
                            <SelectItem value="Other Professional">Other Professional Degree</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Never Married">Never Married</SelectItem>
                            <SelectItem value="Divorced">Divorced</SelectItem>
                            <SelectItem value="Widowed">Widowed</SelectItem>
                            <SelectItem value="Annulled">Annulled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hasChildren"
                    render={({ field }) => {
                      const maritalStatus = form.watch("maritalStatus");
                      const showField = maritalStatus && maritalStatus !== "Never Married";
                      return (
                        <FormItem>
                          <FormLabel>Do you have children?</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value || ""} 
                            disabled={!showField}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={showField ? "Select..." : "Only for divorced/widowed"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="No">No children</SelectItem>
                              <SelectItem value="Yes - lives with me">Yes - lives with me</SelectItem>
                              <SelectItem value="Yes - doesn't live with me">Yes - doesn't live with me</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="familyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Family Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select family type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Nuclear">Nuclear Family</SelectItem>
                            <SelectItem value="Joint">Joint Family</SelectItem>
                            <SelectItem value="Extended">Extended Family</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="diet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diet Preference</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select diet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                            <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                            <SelectItem value="Eggetarian">Eggetarian</SelectItem>
                            <SelectItem value="Vegan">Vegan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="drinking"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Drinking</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Never">Never</SelectItem>
                            <SelectItem value="Occasionally">Occasionally</SelectItem>
                            <SelectItem value="Regularly">Regularly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="smoking"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Smoking</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Never">Never</SelectItem>
                            <SelectItem value="Occasionally">Occasionally</SelectItem>
                            <SelectItem value="Regularly">Regularly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="willingToRelocate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Willing to Relocate?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="Maybe">Maybe / Depends</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Family Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 text-primary">Family Details (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fathersOccupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Occupation</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Retired Teacher, Business" 
                            value={field.value || ""} 
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mothersOccupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Occupation</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Homemaker, Nurse" 
                            value={field.value || ""} 
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="siblings"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Siblings</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 1 elder brother (married), 1 younger sister" 
                            value={field.value || ""} 
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 text-primary">About & Preferences</h3>
                <FormField
                  control={form.control}
                  name="aboutMe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Me</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about yourself, your interests, hobbies, and what makes you unique..." 
                          className="min-h-[120px]"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partnerPreferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partner Preferences</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your ideal partner: age range, education, location, values..." 
                          className="min-h-[120px]"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 text-primary">Contact & Photo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl><Input placeholder="+1 (555) 123-4567" value={field.value || ""} onChange={field.onChange} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="photoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Photo URL</FormLabel>
                        <FormControl><Input placeholder="https://example.com/photo.jpg" value={field.value || ""} onChange={field.onChange} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" size="lg" className="flex-1" disabled={isPending}>
                  {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => setLocation("/my-profile")}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </Layout>
  );
}
