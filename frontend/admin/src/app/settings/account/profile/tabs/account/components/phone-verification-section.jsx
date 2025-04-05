import React, { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

const PhoneVerificationSection = memo(({
  personal,
  formValues,
  handleLocalChange,
  settingsLoading,
  isDirty
}) => {
  // Access the phone number directly from the personal contact
  const phoneNumber = personal?.contact?.phone?.[0]?.number;
  const isVerified = personal?.contact?.phone?.[0]?.isVerified;
  
  console.log('Phone number:', phoneNumber);
  console.log('Is verified:', isVerified);

  return (
    <div className="rounded-lg border bg-card overflow-hidden transition-all hover:shadow-md">
      <div className="bg-muted/30 px-4 py-2 border-b">
        <h3 className="text-sm font-medium flex items-center">
          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
          Phone Number
        </h3>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`text-sm font-semibold break-all ${phoneNumber ? 'text-foreground' : 'text-muted-foreground italic'}`}>
              {phoneNumber || 'No phone number set'}
            </p>
          </div>
          {isVerified ? (
            <Badge className="flex items-center gap-1 p-1 px-2 text-green-500 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">
              <CheckCircle2 className="h-3 w-3" />
              Verified
            </Badge>
          ) : phoneNumber ? (
            <Badge className="flex items-center gap-1 p-1 px-2 text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
              <AlertCircle className="h-3 w-3" />
              Unverified
            </Badge>
          ) : null}
        </div>

        {phoneNumber && !isVerified && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Verification SMS sent!")}
              className="w-full h-9 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 dark:from-green-950/30 dark:to-green-900/20 dark:hover:from-green-900/30 dark:hover:to-green-800/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Verify Phone
            </Button>
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          {phoneNumber ?
            "We'll send a verification code to this number" :
            "Add your phone number for account recovery and notifications"}
        </p>
      </div>
    </div>
  );
});

PhoneVerificationSection.displayName = 'PhoneVerificationSection';

export default PhoneVerificationSection;
