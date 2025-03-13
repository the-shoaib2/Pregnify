import { useState, useEffect } from "react"
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
  Info
} from "lucide-react"
import { InputWithIcon } from "@/components/input-with-icon"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"

export default function ContactTab({ user, formData, handleChange, handleSave, settingsLoading, updateSettings }) {
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
    if (formData?.personal?.[0]) {
      const personal = formData.personal[0];
      setLocalForm({
        phoneNumber: personal.contactNumber || "",
        presentAddress: personal.presentAddress || "",
        permanentAddress: personal.permanentAddress || "",
        nationality: personal.nationality || ""
      });
      setIsDirty(false);
    }
  }, [formData]);

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
    <Card className="animate-in fade-in duration-300">
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

      <CardContent className="space-y-6 sm:space-y-8">
        {/* Phone Number Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Label className="text-sm sm:text-base font-medium">Phone Number</Label>
            {formData?.personal?.[0]?.isPhoneVerified && (
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
    </Card>
  )
}