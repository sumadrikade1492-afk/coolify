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
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const otpRequestSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpVerifySchema = z.object({
  code: z.string().length(6, "Please enter the 6-digit code"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type OtpRequestFormData = z.infer<typeof otpRequestSchema>;
type OtpVerifyFormData = z.infer<typeof otpVerifySchema>;

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [otpSent, setOtpSent] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const otpRequestForm = useForm<OtpRequestFormData>({
    resolver: zodResolver(otpRequestSchema),
    defaultValues: { email: "" },
  });

  const otpVerifyForm = useForm<OtpVerifyFormData>({
    resolver: zodResolver(otpVerifySchema),
    defaultValues: { code: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Welcome back!", description: "Login successful" });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    },
  });

  const otpRequestMutation = useMutation({
    mutationFn: async (data: OtpRequestFormData) => {
      const res = await apiRequest("POST", "/api/auth/login-otp", data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      setOtpEmail(variables.email);
      setOtpSent(true);
      toast({ title: "Code sent", description: "Check your email for the verification code" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to send code", description: error.message, variant: "destructive" });
    },
  });

  const otpVerifyMutation = useMutation({
    mutationFn: async (data: OtpVerifyFormData) => {
      const res = await apiRequest("POST", "/api/auth/verify-login-otp", { email: otpEmail, code: data.code });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Welcome back!", description: "Login successful" });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>Welcome back to NRI Christian Matrimony</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={loginMode === "password" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => { setLoginMode("password"); setOtpSent(false); }}
              data-testid="button-password-mode"
            >
              Password
            </Button>
            <Button
              variant={loginMode === "otp" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => { setLoginMode("otp"); setOtpSent(false); }}
              data-testid="button-otp-mode"
            >
              Email Code
            </Button>
          </div>

          {loginMode === "password" && (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="you@example.com"
                            className="pl-10"
                            {...field}
                            data-testid="input-email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
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
                <Button type="submit" className="w-full" disabled={loginMutation.isPending} data-testid="button-login">
                  {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </Form>
          )}

          {loginMode === "otp" && !otpSent && (
            <Form {...otpRequestForm}>
              <form onSubmit={otpRequestForm.handleSubmit((data) => otpRequestMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={otpRequestForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="you@example.com"
                            className="pl-10"
                            {...field}
                            data-testid="input-otp-email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={otpRequestMutation.isPending} data-testid="button-send-code">
                  {otpRequestMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Login Code
                </Button>
              </form>
            </Form>
          )}

          {loginMode === "otp" && otpSent && (
            <Form {...otpVerifyForm}>
              <form onSubmit={otpVerifyForm.handleSubmit((data) => otpVerifyMutation.mutate(data))} className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Enter the 6-digit code sent to {otpEmail}
                </p>
                <FormField
                  control={otpVerifyForm.control}
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
                          data-testid="input-otp-code"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={otpVerifyMutation.isPending} data-testid="button-verify-code">
                  {otpVerifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify Code
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setOtpSent(false)}
                  data-testid="button-resend-code"
                >
                  Send a new code
                </Button>
              </form>
            </Form>
          )}

          <div className="text-center space-y-2">
            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:underline" data-testid="link-forgot-password">
              Forgot your password?
            </Link>
            <div className="text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline font-medium" data-testid="link-register">
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
