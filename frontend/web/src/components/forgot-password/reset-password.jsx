import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Check, X } from "lucide-react";
import '@/assets/style/ExtensionStyle/PasswordStrengthMeter.css';

const PasswordCriteria = ({ password }) => {
  const criteria = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className='password-criteria'>
      {criteria.map((item) => (
        <div key={item.label} className='criteria-item'>
          {item.met ? (
            <Check className='icon check' />
          ) : (
            <X className='icon x' />
          )}
          <span className={item.met ? "strong-text" : "text-gray-500"}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const PasswordStrengthMeter = ({ password }) => {
  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/\d/)) strength++;
    if (pass.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const strength = getStrength(password);

  const getColorClass = (strength) => {
    if (strength === 0) return "weak";
    if (strength === 1) return "weak";
    if (strength === 2) return "fair";
    if (strength === 3) return "good";
    return "strong";
  };

  const getStrengthText = (strength) => {
    if (strength === 0) return "Very Weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  return (
    <div className='meter'>
      <div className='meter-header'>
        <span>Password Strength</span>
        <span className={`text-sm font-medium ${strength >= 3 ? "strong-text" : strength >= 2 ? "text-yellow-600" : "weak-text"}`}>
          {getStrengthText(strength)}
        </span>
      </div>

      <div className='meter-bar'>
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={index < strength ? `h-2 ${getColorClass(strength)}` : "bg-gray-300"}
          />
        ))}
      </div>
      <PasswordCriteria password={password} />
    </div>
  );
};

const formSchema = z.object({
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function ResetPasswordForm({ token, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await AuthService.resetPassword({
        token,
        ...data,
      });
      onSuccess();
    } catch (error) {
      form.setError("root", {
        message: error.message || "Failed to reset password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const watchPassword = form.watch("newPassword");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm">New Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-2 py-1 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm">Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-2 py-1 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="pt-1">
          <PasswordStrengthMeter password={watchPassword} />
        </div>

        <Button 
          type="submit" 
          className="w-full h-9"
          disabled={isLoading}
        >
          {isLoading ? "Resetting Password..." : "Reset Password"}
        </Button>
      </form>
    </Form>
  );
}