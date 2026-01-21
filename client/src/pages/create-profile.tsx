import { Layout } from "@/components/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProfile } from "@/hooks/use-profiles";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { insertProfileSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Loader2, HelpCircle, Phone, CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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
  if (data.denomination === "Other" && (!data.otherDenomination || data.otherDenomination.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Please specify your church/denomination name",
  path: ["otherDenomination"],
}).refine((data) => {
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

export default function CreateProfile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { mutate, isPending } = useCreateProfile();
  const { toast } = useToast();
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState("");

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

  const sendPhoneCodeMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const res = await apiRequest("POST", "/api/phone/send-code", { phoneNumber });
      return res.json();
    },
    onSuccess: () => {
      setPendingPhoneNumber(form.getValues("phoneNumber"));
      setVerifyingPhone(true);
      toast({ title: "Code sent", description: "Check your phone for the verification code" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to send code", description: error.message, variant: "destructive" });
    },
  });

  const verifyPhoneCodeMutation = useMutation({
    mutationFn: async ({ phoneNumber, code }: { phoneNumber: string; code: string }) => {
      const res = await apiRequest("POST", "/api/phone/verify-code", { phoneNumber, code });
      return res.json();
    },
    onSuccess: () => {
      setPhoneVerified(true);
      setVerifyingPhone(false);
      toast({ title: "Phone verified!", description: "Your phone number has been verified" });
    },
    onError: (error: Error) => {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ title: "Login Required", description: "Please login to create a profile", variant: "destructive" });
      setTimeout(() => window.location.href = "/api/login", 1000);
    }
  }, [authLoading, isAuthenticated, toast]);

  if (authLoading) return <Layout><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div></Layout>;

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (!phoneVerified) {
      toast({ title: "Phone verification required", description: "Please verify your phone number before creating a profile", variant: "destructive" });
      return;
    }
    mutate(data, {
      onSuccess: () => {
        setLocation("/my-profile");
      }
    });
  }

  const handleSendPhoneCode = () => {
    const phoneNumber = form.getValues("phoneNumber");
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({ title: "Invalid phone number", description: "Please enter a valid phone number", variant: "destructive" });
      return;
    }
    sendPhoneCodeMutation.mutate(phoneNumber);
  };

  const handleVerifyPhoneCode = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({ title: "Invalid code", description: "Please enter the 6-digit verification code", variant: "destructive" });
      return;
    }
    verifyPhoneCodeMutation.mutate({ phoneNumber: pendingPhoneNumber, code: verificationCode });
  };

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold mb-2">Create Your Profile</h1>
          <p className="text-muted-foreground">Share your details to help us find your perfect match.</p>
        </div>

        <Card className="p-8 shadow-lg border-primary/10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Basic Info */}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger data-testid="select-birth-month">
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
                        <FormControl><Input type="number" placeholder="1990" {...field} data-testid="input-birth-year" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Location & Background */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 text-primary">Location & Background</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-country">
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
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!country}>
                            <FormControl>
                              <SelectTrigger data-testid="select-city">
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
                          <Input 
                            placeholder="e.g., Kerala, Tamil Nadu, Punjab" 
                            value={field.value || ""} 
                            onChange={field.onChange}
                            data-testid="input-native-place"
                          />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-native-language">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-denomination">
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
                            data-testid="input-other-denomination"
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
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-visa-type">
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
                            <SelectItem value="UK Citizen">UK Citizen</SelectItem>
                            <SelectItem value="Canadian Citizen">Canadian Citizen</SelectItem>
                            <SelectItem value="Australian Citizen">Australian Citizen</SelectItem>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-height">
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
                        <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value?.toString() || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-years-in-us">
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
                  <FormField
                    control={form.control}
                    name="createdBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Created By</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-created-by">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Self">Self</SelectItem>
                            <SelectItem value="Parent">Parent</SelectItem>
                            <SelectItem value="Sibling">Sibling</SelectItem>
                            <SelectItem value="Relative">Relative</SelectItem>
                            <SelectItem value="Friend">Friend</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="createdByName"
                    render={({ field }) => {
                      const createdBy = form.watch("createdBy");
                      const isNotSelf = createdBy && createdBy !== "Self";
                      return (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={isNotSelf ? "Enter your name" : "Only for profiles created by others"}
                              value={field.value || ""} 
                              onChange={field.onChange}
                              disabled={!isNotSelf}
                              data-testid="input-created-by-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-education">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-marital-status">
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
                            defaultValue={field.value || ""} 
                            disabled={!showField}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-has-children">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-family-type">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-diet">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-drinking">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-smoking">
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
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-relocate">
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
                            data-testid="input-fathers-occupation"
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
                            data-testid="input-mothers-occupation"
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
                            data-testid="input-siblings"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Personal Info */}
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
                          placeholder="Tell us about your background, values, and interests..." 
                          className="min-h-[100px]"
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
                          placeholder="What are you looking for in a partner?" 
                          className="min-h-[100px]"
                          value={field.value || ""} 
                          onChange={field.onChange} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="photoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Photo URL</FormLabel>
                        <FormControl><Input placeholder="https://example.com/photo.jpg" value={field.value || ""} onChange={field.onChange} /></FormControl>
                        <p className="text-xs text-muted-foreground">Enter a direct link to your photo (e.g. from Google Photos, Drive, etc.)</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Phone Verification Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 text-primary">Phone Verification</h3>
                <p className="text-sm text-muted-foreground">Phone verification is required to create a profile. VOIP numbers (Google Voice, etc.) are not allowed.</p>
                
                {phoneVerified ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">Phone Verified</p>
                      <p className="text-sm text-green-700 dark:text-green-300">{pendingPhoneNumber}</p>
                    </div>
                  </div>
                ) : verifyingPhone ? (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-primary" />
                      <p className="text-sm">Enter the 6-digit code sent to <span className="font-medium">{pendingPhoneNumber}</span></p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="123456"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="text-center text-lg tracking-widest max-w-[150px]"
                        data-testid="input-phone-code"
                      />
                      <Button 
                        type="button" 
                        onClick={handleVerifyPhoneCode}
                        disabled={verifyPhoneCodeMutation.isPending}
                        data-testid="button-verify-phone-code"
                      >
                        {verifyPhoneCodeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Verify
                      </Button>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setVerifyingPhone(false);
                        setVerificationCode("");
                      }}
                      data-testid="button-change-phone"
                    >
                      Change phone number
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <div className="relative flex-1">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  placeholder="+1 234 567 8900" 
                                  className="pl-10"
                                  value={field.value || ""} 
                                  onChange={field.onChange}
                                  data-testid="input-phone-number"
                                />
                              </div>
                            </FormControl>
                            <Button 
                              type="button" 
                              onClick={handleSendPhoneCode}
                              disabled={sendPhoneCodeMutation.isPending}
                              data-testid="button-send-code"
                            >
                              {sendPhoneCodeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Send Code
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full md:w-auto" 
                  disabled={isPending || !phoneVerified}
                  data-testid="button-create-profile"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Profile...
                    </>
                  ) : !phoneVerified ? (
                    "Verify Phone to Continue"
                  ) : (
                    "Create Profile"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </Layout>
  );
}
