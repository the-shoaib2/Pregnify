import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AuthService } from "@/services/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InputOTP } from "@/components/ui/input-otp";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

const RESEND_TIMEOUT = 60; // 60 seconds

export function VerifyCodeForm({ userId, method, type, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    // Start initial countdown
    setCountdown(RESEND_TIMEOUT);
  }, []);

  useEffect(() => {
    if (isVerified && verificationData) {
      const timer = setTimeout(() => {
        onSuccess(verificationData);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVerified, verificationData]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const response = await AuthService.verifyResetCode({
        userId,
        code: data.code,
        method,
      });
      
      // Store verification data and show success animation
      setVerificationData(response.data.data);
      setIsVerified(true);
      
      toast.success("Verification successful!");
      
    } catch (error) {
      form.setError("code", {
        message: error.message || "Invalid code",
      });
      toast.error(error.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsResending(true);
      await AuthService.sendResetCode({
        userId,
        method,
        type,
      });
      toast.success("New verification code sent");
      form.reset();
      setCountdown(RESEND_TIMEOUT);
    } catch (error) {
      toast.error(error.message || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  if (type === 'link') {
    return (
      <div className="text-center space-y-4">
        <p>We've sent a password reset link to your email.</p>
        <p className="text-sm text-muted-foreground">
          Please check your email and click the link to reset your password.
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleResendCode}
          disabled={isResending}
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Resending link...
            </>
          ) : (
            "Resend link"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "transition-all duration-500",
      isVerified && "scale-95 opacity-50"
    )}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-center block">Enter verification code</FormLabel>
                <FormControl>
                  <div className="relative">
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isLoading || isVerified}
                    />
                    {isVerified && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-md rounded-lg">
                        <CheckCircle2 className="h-8 w-8 text-green-500 animate-in zoom-in" />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-center" />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Button 
              type="submit" 
              className="w-full relative" 
              disabled={isLoading || isVerified}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : isVerified ? (
                <>
                  Verified
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                </>
              ) : (
                "Verify Code"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                className="h-auto px-2 py-1"
                onClick={handleResendCode}
                disabled={isLoading || isResending || isVerified || countdown > 0}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Resending code...
                  </>
                ) : countdown > 0 ? (
                  <span className={cn(
                    "text-xs text-foreground text-bold",
                    countdown <= 10 && "text-red-500"
                  )}>
                    Resend code in {formatTime(countdown)}
                  </span>
                ) : (
                  <span className="text-xs">
                    Didn't receive code? <span className="text-primary">Resend</span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
