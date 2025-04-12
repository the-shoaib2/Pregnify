import React, { memo } from 'react';
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const AccountStatusSection = memo(({ 
  accountStatus,
  profileData,
  formatDate
}) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Account Status</Label>
            <p className="text-sm text-muted-foreground">
              Your account is {accountStatus?.status?.toLowerCase() || 'inactive'}
            </p>
          </div>
          <Badge 
            variant={accountStatus?.status === 'ACTIVE' ? 'success' : 'secondary'}
            className="uppercase"
          >
            {accountStatus?.status || 'INACTIVE'}
          </Badge>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Created</Label>
            <p className="text-sm font-medium">
              {formatDate(profileData?.timestamps?.created)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Last Login</Label>
            <p className="text-sm font-medium">
              {formatDate(profileData?.activity?.lastLogin)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

AccountStatusSection.displayName = 'AccountStatusSection';

export default AccountStatusSection;
