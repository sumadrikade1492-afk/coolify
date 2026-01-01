import { useMutation } from "@tanstack/react-query";
import { phoneVerificationApi } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type SendCodeInput = z.infer<typeof phoneVerificationApi.sendCode.input>;
type VerifyCodeInput = z.infer<typeof phoneVerificationApi.verifyCode.input>;

export function useSendVerificationCode() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: SendCodeInput) => {
      const res = await fetch(phoneVerificationApi.sendCode.path, {
        method: phoneVerificationApi.sendCode.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.message || "Failed to send code");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Code Sent", description: "Check your phone for the verification code." });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to send code",
        variant: "destructive" 
      });
    }
  });
}

export function useVerifyCode() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: VerifyCodeInput) => {
      const res = await fetch(phoneVerificationApi.verifyCode.path, {
        method: phoneVerificationApi.verifyCode.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.message || "Failed to verify code");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Verified", description: "Phone number verified successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Invalid code",
        variant: "destructive" 
      });
    }
  });
}
