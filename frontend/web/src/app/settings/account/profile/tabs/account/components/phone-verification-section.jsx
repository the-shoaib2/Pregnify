import React, { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, CheckCircle2, Save } from "lucide-react";
import { toast } from "react-hot-toast";

const PhoneVerificationSection = memo(({ 
  basicInfo,
  formValues,
  handleLocalChange,
  handleSubmit,
  settingsLoading,
  isDirty
}) => {
  return (
    <div className="rounded-lg border bg-card overflow-hidden transition-all hover:shadow-md">
      <div className="bg-muted/30 px-4 py-2 border-b">
        <h3 className="text-sm font-medium flex items-center">
          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
          Phone Number
        </h3>
      </div>
      <div className="p-4">
        <div className="flex flex-col space-y-3">
          <div className="relative">
            <Input
              value={formValues.phoneNumber}
              onChange={(e) => handleLocalChange('phoneNumber', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="pr-16 text-sm"
            />
            {basicInfo?.isSmsVerified && (
              <Badge variant="success" className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit}
              disabled={settingsLoading || !isDirty || !formValues.phoneNumber}
              className="flex-1 h-8"
              variant="default"
            >
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
            
            {formValues.phoneNumber && !basicInfo?.isSmsVerified && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toast.info("Verification SMS sent!")}
                className="flex-1 h-8 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 dark:from-green-950/30 dark:to-green-900/20 dark:hover:from-green-900/30 dark:hover:to-green-800/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verify Phone
              </Button>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            {formValues.phoneNumber ? 
              "We'll send a verification code to this number" : 
              "Add your phone number for account recovery and notifications"}
          </p>
        </div>
      </div>
    </div>
  );
});

PhoneVerificationSection.displayName = 'PhoneVerificationSection';

export default PhoneVerificationSection;
