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
import { Loader2 } from "lucide-react";
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
      location: "",
      nativePlace: "",
      nativeLanguage: "",
      denomination: "",
      otherDenomination: "",
      occupation: "",
      visaType: "",
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
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Location (City, Country)</FormLabel>
                        <FormControl><Input placeholder="New York, USA" {...field} data-testid="input-location" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
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
                  {form.watch("denomination") === "Other" && (
                    <FormField
                      control={form.control}
                      name="otherDenomination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Church/Denomination Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your church or denomination name" 
                              value={field.value || ""} 
                              onChange={field.onChange}
                              data-testid="input-other-denomination"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
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
                  {form.watch("createdBy") !== "Self" && form.watch("createdBy") && (
                    <FormField
                      control={form.control}
                      name="createdByName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your name" 
                              value={field.value || ""} 
                              onChange={field.onChange}
                              data-testid="input-created-by-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
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
