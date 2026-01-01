import { Layout } from "@/components/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProfile } from "@/hooks/use-profiles";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { insertProfileSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Loader2, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

// Extend schema with strict types for form
const currentYear = new Date().getFullYear();
const formSchema = insertProfileSchema.extend({
  birthMonth: z.coerce.number().min(1).max(12),
  birthYear: z.coerce.number().min(1940).max(currentYear - 18, "Must be at least 18 years old"),
});

export default function CreateProfile() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { mutate, isPending } = useCreateProfile();
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
      aboutMe: "",
      partnerPreferences: "",
      photoUrl: "",
      createdBy: "Self",
      createdByName: "",
      phoneNumber: "",
    }
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({ title: "Login Required", description: "Please login to create a profile", variant: "destructive" });
      setTimeout(() => window.location.href = "/api/login", 1000);
    }
  }, [authLoading, isAuthenticated, toast]);

  if (authLoading) return <Layout><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div></Layout>;

  function onSubmit(data: z.infer<typeof formSchema>) {
    mutate(data, {
      onSuccess: () => {
        setLocation("/my-profile");
      }
    });
  }

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
                            {/* Hidden for US-focused rollout - uncomment when expanding to other countries
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                            <SelectItem value="Australia">Australia</SelectItem>
                            <SelectItem value="Germany">Germany</SelectItem>
                            <SelectItem value="Singapore">Singapore</SelectItem>
                            <SelectItem value="UAE">United Arab Emirates</SelectItem>
                            <SelectItem value="New Zealand">New Zealand</SelectItem>
                            <SelectItem value="Ireland">Ireland</SelectItem>
                            <SelectItem value="Switzerland">Switzerland</SelectItem>
                            <SelectItem value="Netherlands">Netherlands</SelectItem>
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                            */}
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
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (for verification)</FormLabel>
                        <FormControl><Input placeholder="+1234567890" value={field.value || ""} onChange={field.onChange} /></FormControl>
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
                        <p className="text-xs text-muted-foreground">Enter a direct link to your photo (e.g. from Google Photos, Drive, etc.)</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Profile...
                    </>
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
