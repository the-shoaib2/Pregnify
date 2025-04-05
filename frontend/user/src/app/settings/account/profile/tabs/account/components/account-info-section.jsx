import React, { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, HelpCircle, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const AccountInfoSection = memo(({ 
  basicInfo, 
  formValues, 
  handleLocalChange, 
  usernameValidation 
}) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label className="text-muted-foreground text-sm">User ID</Label>
        <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2 border">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <code className="font-mono text-sm overflow-auto whitespace-nowrap">{basicInfo?.userID || 'N/A'}</code>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-muted-foreground text-sm flex items-center justify-between">
          <span>Username</span>
          {!usernameValidation.valid && formValues.username && (
            <span className="text-destructive text-xs flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {usernameValidation.message}
            </span>
          )}
        </Label>
        <div className="flex items-center gap-2">
          <Input 
            value={formValues.username}
            onChange={(e) => handleLocalChange('username', e.target.value)}
            placeholder="Enter username"
            className={`font-medium ${!usernameValidation.valid && formValues.username ? 'border-destructive' : ''}`}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <div className="space-y-2">
                  <h4 className="font-medium">Username Guidelines</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 3-20 characters</li>
                    <li>• Letters, numbers, underscores</li>
                    <li>• No spaces or special characters</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
});

AccountInfoSection.displayName = 'AccountInfoSection';

export default AccountInfoSection;
