import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PasswordCriteria = ({ password }) => {
  const criteria = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="space-y-1.5 pt-2">
      {criteria.map((item) => (
        <div key={item.label} className="flex items-center space-x-2 text-sm">
          {item.met ? (
            <Check className="h-4 w-4 text-green-500 shrink-0" />
          ) : (
            <X className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <span className={cn(
            "text-sm transition-colors",
            item.met ? "text-foreground" : "text-muted-foreground"
          )}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export function PasswordStrengthMeter({ password }) {
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
    if (strength <= 1) return "bg-destructive";
    if (strength === 2) return "bg-orange-500";
    if (strength === 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength) => {
    if (strength === 0) return "Very Weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  const getStrengthTextColor = (strength) => {
    if (strength <= 1) return "text-destructive";
    if (strength === 2) return "text-orange-500";
    if (strength === 3) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Password Strength
        </span>
        <span className={cn(
          "text-sm font-medium transition-colors",
          getStrengthTextColor(strength)
        )}>
          {getStrengthText(strength)}
        </span>
      </div>

      <div className="flex gap-2">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 w-full rounded-full transition-all duration-300",
              index < strength ? getColorClass(strength) : "bg-muted"
            )}
          />
        ))}
      </div>
      
      <PasswordCriteria password={password} />
    </div>
  );
} 