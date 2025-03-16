import React, { memo } from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";
import { toast } from "react-hot-toast";

const AccountSecuritySection = memo(({ 
  profileData,
  updateSettings
}) => {
  return (
    <div className="rounded-lg border p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Account Security</Label>
            <p className="text-sm text-muted-foreground">
              Additional security settings for your account
            </p>
          </div>
          <Switch
            checked={profileData?.security?.multiFactorAuth || false}
            onCheckedChange={(checked) => {
              toast.promise(
                updateSettings('security', { multiFactorAuth: checked }),
                {
                  loading: 'Updating security settings...',
                  success: 'Security settings updated',
                  error: 'Failed to update security settings'
                }
              )
            }}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          Two-factor authentication is {profileData?.security?.multiFactorAuth ? 'enabled' : 'disabled'}
        </div>
      </div>
    </div>
  );
});

AccountSecuritySection.displayName = 'AccountSecuritySection';

export default AccountSecuritySection;
