import { useState, useEffect } from "react"
import React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { 
  Phone,
  Home,
  Building,
  Globe,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Info,
  ChevronUp,
  ChevronDown
} from "lucide-react"
import { InputWithIcon } from "@/components/input-with-icon"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function ContactTab({ profile, formData, handleChange, handleSave, settingsLoading, updateSettings }) {
  useEffect(() => {
    console.log('Contact Tab Data:', {
      profile,
      contactInfo: {
        email: profile?.email,
        phone: profile?.phone,
        verifiedEmail: profile?.emailVerified,
        verifiedPhone: profile?.phoneVerified
      },
      timestamp: new Date().toISOString()
    });
  }, [profile]);

  // Local form state
  const [localForm, setLocalForm] = useState({
    phoneNumber: "",
    presentAddress: "",
    permanentAddress: "",
    nationality: ""
  });

  // Track form changes
  const [isDirty, setIsDirty] = useState(false);

  // Initialize form with data
  useEffect(() => {
    if (profile?.personal?.[0]) {
      const personal = profile.personal[0];
      setLocalForm({
        phoneNumber: personal.contactNumber || "",
        presentAddress: personal.presentAddress || "",
        permanentAddress: personal.permanentAddress || "",
        nationality: personal.nationality || ""
      });
      setIsDirty(false);
    }
  }, [profile]);

  // Collapsible state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Handle local form changes
  const handleLocalChange = (field, value) => {
    setLocalForm(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  // Phone number validation
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!isDirty) {
      toast.info("No changes to save");
      return;
    }

    const data = {
      personal: {
        contactNumber: localForm.phoneNumber,
        presentAddress: localForm.presentAddress,
        permanentAddress: localForm.permanentAddress,
        nationality: localForm.nationality
      }
    };

    handleSave(data);
  };

  return (
    <Card className="animate-in fade-in duration-300 relative">
      <Collapsible open={!isCollapsed} onOpenChange={() => setIsCollapsed(!isCollapsed)}>
        <div className="absolute right-4 top-4 flex items-center gap-2 z-10">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              {!isCollapsed ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CardHeader className="space-y-2 sm:space-y-1">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Contact Information
          </CardTitle>
          <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
            <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            Manage your contact details and verification status
          </CardDescription>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6 sm:space-y-8">
            {/* Phone Number Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Label className="text-sm sm:text-base font-medium">Phone Number</Label>
                {profile?.personal?.[0]?.isPhoneVerified && (
                  <Badge variant="success" className="h-5 sm:h-6 px-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="grid gap-3">
                <div className="relative">
                  <InputWithIcon
                    icon={Phone}
                    value={localForm.phoneNumber}
                    onChange={(e) => handleLocalChange('phoneNumber', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={`h-9 sm:h-10 ${!validatePhoneNumber(localForm.phoneNumber) && localForm.phoneNumber ? 'border-destructive' : ''}`}
                  />
                </div>
                {!validatePhoneNumber(localForm.phoneNumber) && localForm.phoneNumber && (
                  <p className="text-xs text-destructive flex items-center gap-1 -mt-1.5">
                    <AlertCircle className="h-3 w-3" />
                    Please enter a valid phone number
                  </p>
                )}
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <Label className="text-sm sm:text-base font-medium block">Address Information</Label>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <InputWithIcon
                    icon={Home}
                    label="Current Address"
                    value={localForm.presentAddress}
                    onChange={(e) => handleLocalChange('presentAddress', e.target.value)}
                    placeholder="Enter your current residential address"
                    className="h-9 sm:h-10"
                  />
                  <p className="text-xs text-muted-foreground pl-1">
                    This is where you currently live
                  </p>
                </div>

                <div className="space-y-2">
                  <InputWithIcon
                    icon={Building}
                    label="Permanent Address"
                    value={localForm.permanentAddress}
                    onChange={(e) => handleLocalChange('permanentAddress', e.target.value)}
                    placeholder="Enter your permanent address"
                    className="h-9 sm:h-10"
                  />
                  <p className="text-xs text-muted-foreground pl-1">
                    Your permanent or home address
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <Label className="text-sm sm:text-base font-medium block">Additional Information</Label>
              <div className="space-y-2">
                <InputWithIcon
                  icon={Globe}
                  label="Nationality"
                  value={localForm.nationality}
                  onChange={(e) => handleLocalChange('nationality', e.target.value)}
                  placeholder="Enter your nationality"
                  className="h-9 sm:h-10"
                />
                <p className="text-xs text-muted-foreground pl-1">
                  Your country of citizenship
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col-reverse sm:flex-row items-center justify-between border-t pt-4 sm:pt-6 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left">
              <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              {settingsLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  Saving changes...
                </span>
              ) : isDirty ? (
                "You have unsaved changes"
              ) : (
                "All changes are saved"
              )}
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={settingsLoading || !isDirty}
              className="w-full sm:w-auto h-9 sm:h-10 text-sm"
            >
              {settingsLoading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}