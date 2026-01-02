import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, Eye, EyeOff, Phone, CheckCircle } from "lucide-react";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const verifyEmailSchema = z.object({
  code: z.string().length(6, "Please enter the 6-digit code"),
});

const phoneSchema = z.object({
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
});

const verifyPhoneSchema = z.object({
  code: z.string().length(6, "Please enter the 6-digit code"),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
type PhoneFormData = z.infer<typeof phoneSchema>;
type VerifyPhoneFormData = z.infer<typeof verifyPhoneSchema>;

type Step = "register" | "verifyEmail" | "phone" | "verifyPhone" | "complete";

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<Step>("register");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPhone, setPendingPhone] = useState("");

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
  });

  const verifyEmailForm = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { code: "" },
  });

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: "" },
  });

  const verifyPhoneForm = useForm<VerifyPhoneFormData>({
    resolver: zodResolver(verifyPhoneSchema),
    defaultValues: { code: "" },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const res = await apiRequest("POST", "/api/auth/register", {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      return res.json();
    },
    onSuccess: (result) => {
      if (result.requiresVerification) {
        setPendingEmail(result.email);
        setStep("verifyEmail");
        toast({ title: "Code sent", description: "Check your email for the verification code" });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (data: VerifyEmailFormData) => {
      const res = await apiRequest("POST", "/api/auth/verify-register", {
        code: data.code,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Email verified!", description: "Now please verify your phone number" });
      setStep("phone");
    },
    onError: (error: Error) => {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    },
  });

  const sendPhoneCodeMutation = useMutation({
    mutationFn: async (data: PhoneFormData) => {
      const res = await apiRequest("POST", "/api/phone/send-code", {
        phoneNumber: data.phoneNumber,
      });
      return res.json();
    },
    onSuccess: () => {
      setPendingPhone(phoneForm.getValues("phoneNumber"));
      setStep("verifyPhone");
      toast({ title: "Code sent", description: "Check your phone for the verification code" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to send code", description: error.message, variant: "destructive" });
    },
  });

  const verifyPhoneMutation = useMutation({
    mutationFn: async (data: VerifyPhoneFormData) => {
      const res = await apiRequest("POST", "/api/phone/verify-code", {
        phoneNumber: pendingPhone,
        code: data.code,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Phone verified!", description: "Welcome to NRI Christian Matrimony" });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    },
  });

  const skipPhoneMutation = useMutation({
    mutationFn: async () => {
      return { success: true };
    },
    onSuccess: () => {
      toast({ title: "Account created!", description: "Welcome to NRI Christian Matrimony. You can verify your phone later when creating a profile." });
      navigate("/");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            {step === "register" && "Join NRI Christian Matrimony today"}
            {step === "verifyEmail" && "Verify your email address"}
            {step === "phone" && "Add your phone number"}
            {step === "verifyPhone" && "Verify your phone number"}
          </CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            <div className={`w-3 h-3 rounded-full ${step === "register" || step === "verifyEmail" || step === "phone" || step === "verifyPhone" ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-3 h-3 rounded-full ${step === "verifyEmail" || step === "phone" || step === "verifyPhone" ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-3 h-3 rounded-full ${step === "phone" || step === "verifyPhone" ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-3 h-3 rounded-full ${step === "verifyPhone" ? "bg-primary" : "bg-muted"}`} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "register" && (
            <>
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="John" className="pl-10" {...field} data-testid="input-firstname" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} data-testid="input-lastname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="you@example.com" className="pl-10" {...field} data-testid="input-email" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="At least 8 characters"
                              className="pl-10 pr-10"
                              {...field}
                              data-testid="input-password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              className="pl-10 pr-10"
                              {...field}
                              data-testid="input-confirm-password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={registerMutation.isPending} data-testid="button-register">
                    {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </Form>
            </>
          )}

          {step === "verifyEmail" && (
            <Form {...verifyEmailForm}>
              <form onSubmit={verifyEmailForm.handleSubmit((data) => verifyEmailMutation.mutate(data))} className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code sent to <span className="font-medium text-foreground">{pendingEmail}</span>
                  </p>
                </div>
                <FormField
                  control={verifyEmailForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123456"
                          maxLength={6}
                          className="text-center text-lg tracking-widest"
                          {...field}
                          data-testid="input-verify-email-code"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={verifyEmailMutation.isPending} data-testid="button-verify-email">
                  {verifyEmailMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify Email
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep("register")}
                  data-testid="button-back"
                >
                  Back
                </Button>
              </form>
            </Form>
          )}

          {step === "phone" && (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit((data) => sendPhoneCodeMutation.mutate(data))} className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-green-600 mb-2">Email Verified!</p>
                  <p className="text-sm text-muted-foreground">
                    Now add your phone number for additional security
                  </p>
                </div>
                <FormField
                  control={phoneForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="+1 234 567 8900"
                            className="pl-10"
                            {...field}
                            data-testid="input-phone"
                          />
                        </div>
                      </FormControl>
                      <p className="text-xs text-muted-foreground">VOIP numbers (Google Voice, etc.) are not allowed</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={sendPhoneCodeMutation.isPending} data-testid="button-send-phone-code">
                  {sendPhoneCodeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Verification Code
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => skipPhoneMutation.mutate()}
                  disabled={skipPhoneMutation.isPending}
                  data-testid="button-skip-phone"
                >
                  Skip for now
                </Button>
              </form>
            </Form>
          )}

          {step === "verifyPhone" && (
            <Form {...verifyPhoneForm}>
              <form onSubmit={verifyPhoneForm.handleSubmit((data) => verifyPhoneMutation.mutate(data))} className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code sent to <span className="font-medium text-foreground">{pendingPhone}</span>
                  </p>
                </div>
                <FormField
                  control={verifyPhoneForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123456"
                          maxLength={6}
                          className="text-center text-lg tracking-widest"
                          {...field}
                          data-testid="input-verify-phone-code"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={verifyPhoneMutation.isPending} data-testid="button-verify-phone">
                  {verifyPhoneMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify Phone
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep("phone")}
                  data-testid="button-back-phone"
                >
                  Change Phone Number
                </Button>
              </form>
            </Form>
          )}

          {step === "register" && (
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium" data-testid="link-login">
                Sign in
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
