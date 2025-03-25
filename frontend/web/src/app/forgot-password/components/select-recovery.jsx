import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Link, MessageSquare, Check, Loader2 } from "lucide-react";
import { AuthService } from "@/services/auth";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

export function SelectRecoveryMethod({ userData, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  const recoveryOptions = [
    ...(userData.recoveryMethods.email?.options.includes('code') ? [{
      id: 'email-code',
      label: 'Send code via email',
      description: userData.maskedEmail,
      icon: Mail,
      method: 'email',
      type: 'code'
    }] : []),
    ...(userData.recoveryMethods.email?.options.includes('link') ? [{
      id: 'email-link',
      label: 'Send reset link via email',
      description: userData.maskedEmail,
      icon: Link,
      method: 'email',
      type: 'link'
    }] : []),
    ...(userData.recoveryMethods.sms ? [{
      id: 'sms-code',
      label: 'Send code via SMS',
      description: userData.maskedPhone,
      icon: MessageSquare,
      method: 'sms',
      type: 'code'
    }] : [])
  ];

  const handleMethodSelect = (option) => {
    setSelectedMethod(option);
  };

  const handleContinue = async () => {
    if (!selectedMethod) {
      toast.error("Please select a recovery method");
      return;
    }

    try {
      setIsLoading(true);
      await AuthService.sendResetCode({
        userId: userData.userId,
        method: selectedMethod.method,
        type: selectedMethod.type,
      });
      onSuccess({ 
        method: selectedMethod.method, 
        type: selectedMethod.type 
      });
    } catch (error) {
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Account Information</h3>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={userData.avatar}
                  alt={userData.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-sm font-medium leading-none truncate">{userData.name}</p>
                {userData.maskedEmail && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    {userData.maskedEmail}
                  </p>
                )}
                {!userData.recoveryMethods?.email && (
                  <p className="text-[11px] text-red-500">
                    No recovery methods available
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">How would you like to reset your password?</h3>
        
        <div className="space-y-2">
          {recoveryOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedMethod?.id === option.id;
            
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleMethodSelect(option)}
                className={cn(
                  "w-full flex items-center space-x-3 p-3 rounded-lg border text-left transition-colors",
                  "hover:bg-accent/50",
                  isSelected && "border-primary bg-accent/20",
                  !isSelected && "hover:border-primary/50"
                )}
              >
                <div className={cn(
                  "h-4 w-4 rounded-full border-2 flex-shrink-0",
                  "transition-colors duration-200",
                  isSelected ? "border-primary bg-primary" : "border-muted-foreground/30",
                )}>
                  {isSelected && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                  "bg-primary/5",
                  isSelected && "text-primary",
                  !isSelected && "text-muted-foreground"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Button 
        className="w-full h-9" 
        onClick={handleContinue}
        disabled={isLoading || !selectedMethod}
      >
        {isLoading ? (
          <>
            Sending...
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          </>
        ) : (
          "Continue"
        )}
      </Button>
    </div>
  );
} 