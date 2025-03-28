import { useState, useEffect, useMemo } from "react"
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
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronUp,
  ChevronDown,
  FileText,
  Copy
} from "lucide-react"
import { InputWithIcon } from "@/components/input-with-icon"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const AddressSection = ({ title, addressKey, values, onChange, copyFromPresent }) => {
  return (
    <>
      {copyFromPresent && (
        <div className="flex items-center justify-between mt-6">
          <h3 className="text-md font-medium">{title}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={copyFromPresent}
          >
            <Copy className="mr-2 h-3 w-3" />
            Same as Present Address
          </Button>
        </div>
      )}
      {!copyFromPresent && <h3 className="text-md font-medium mt-4">{title}</h3>}
      
      <div className="grid gap-4 md:grid-cols-2">
        <InputWithIcon
          icon={FileText}
          label="Street"
          value={values?.street || ''}
          onChange={(e) => onChange(`${addressKey}.street`, e.target.value)}
          placeholder="Enter street"
        />
        <InputWithIcon
          icon={FileText}
          label="City"
          value={values?.city || ''}
          onChange={(e) => onChange(`${addressKey}.city`, e.target.value)}
          placeholder="Enter city"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <InputWithIcon
          icon={FileText}
          label="State"
          value={values?.state || ''}
          onChange={(e) => onChange(`${addressKey}.state`, e.target.value)}
          placeholder="Enter state"
        />
        <InputWithIcon
          icon={FileText}
          label="Country"
          value={values?.country || ''}
          onChange={(e) => onChange(`${addressKey}.country`, e.target.value)}
          placeholder="Enter country"
        />
        <InputWithIcon
          icon={FileText}
          label="ZIP Code"
          value={values?.zipCode || ''}
          onChange={(e) => onChange(`${addressKey}.zipCode`, e.target.value)}
          placeholder="Enter ZIP code"
        />
      </div>
    </>
  );
};

export default function ContactTab({ profile, formData, handleChange, handleSave, settingsLoading, updateSettings }) {
  // Local form state - updated to include address fields
  const [localForm, setLocalForm] = useState({
    phoneNumber: "",
    address: {},
    presentAddress: {},
    permanentAddress: {},
    nationality: ""
  });

  // Track form changes
  const [isDirty, setIsDirty] = useState(false);

  // Initialize form with data
  useEffect(() => {
    if (profile?.personal?.[0]) {
      const personal = profile.personal[0];
      setLocalForm({
        phoneNumber: personal.contact?.phone || "",
        address: {
          street: personal.addresses?.current?.street || "",
          city: personal.addresses?.current?.city || "",
          state: personal.addresses?.current?.state || "",
          country: personal.addresses?.current?.country || "",
          zipCode: personal.addresses?.current?.zipCode || ""
        },
        presentAddress: {
          street: personal.addresses?.present?.street || "",
          city: personal.addresses?.present?.city || "",
          state: personal.addresses?.present?.state || "",
          country: personal.addresses?.present?.country || "",
          zipCode: personal.addresses?.present?.zipCode || ""
        },
        permanentAddress: {
          street: personal.addresses?.permanent?.street || "",
          city: personal.addresses?.permanent?.city || "",
          state: personal.addresses?.permanent?.state || "",
          country: personal.addresses?.permanent?.country || "",
          zipCode: personal.addresses?.permanent?.zipCode || ""
        },
        nationality: personal.origin?.nationality || ""
      });
      setIsDirty(false);
    }
  }, [profile]);

  // Collapsible state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Enhanced handleLocalChange to handle nested objects
  const handleLocalChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setLocalForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setLocalForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
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
        address: localForm.address,
        presentAddress: localForm.presentAddress,
        permanentAddress: localForm.permanentAddress,
        nationality: localForm.nationality
      }
    };

    handleSave(data);
  };

  // Memoize the address fields
  const AddressFields = useMemo(() => (
    <div className="space-y-4 mt-6">
      <AddressSection 
        title="Current Address"
        addressKey="address"
        values={localForm.address}
        onChange={handleLocalChange}
      />
      
      <AddressSection 
        title="Present Address"
        addressKey="presentAddress"
        values={localForm.presentAddress}
        onChange={handleLocalChange}
        copyFromPresent={() => {
          handleLocalChange('presentAddress', {
            ...localForm.address
          });
        }}
      />
      
      <AddressSection 
        title="Permanent Address"
        addressKey="permanentAddress"
        values={localForm.permanentAddress}
        onChange={handleLocalChange}
        copyFromPresent={() => {
          handleLocalChange('permanentAddress', {
            ...localForm.presentAddress
          });
        }}
      />
    </div>
  ), [localForm.address, localForm.presentAddress, localForm.permanentAddress, handleLocalChange]);

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
            {AddressFields}

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