import { useState, useEffect, useMemo, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { 
  Shield,
  Info,
  Save,
  Loader,
  ChevronUp,
  ChevronDown
} from "lucide-react"
import { toast } from "react-hot-toast"
import ErrorBoundary from "@/components/error-boundary"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Lazy load section components
const AccountInfoSection = lazy(() => import('./components/account-info-section'))
const EmailVerificationSection = lazy(() => import('./components/email-verification-section'))
const PhoneVerificationSection = lazy(() => import('./components/phone-verification-section'))
const AccountStatusSection = lazy(() => import('./components/account-status-section'))
const AccountSecuritySection = lazy(() => import('./components/account-security-section'))

// API verification functions
const verifyEmailWithLink = async (email) => {
  try {
    const response = await fetch('/api/auth/verify-email/link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) throw new Error('Failed to send verification link');
    return await response.json();
  } catch (error) {
    console.error('Error sending verification link:', error);
    throw error;
  }
};

const verifyEmailWithCode = async (email) => {
  try {
    const response = await fetch('/api/auth/verify-email/code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) throw new Error('Failed to send verification code');
    return await response.json();
  } catch (error) {
    console.error('Error sending verification code:', error);
    throw error;
  }
};

const verifyOTP = async (email, code) => {
  try {
    const response = await fetch('/api/auth/verify-email/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });
    
    if (!response.ok) throw new Error('Invalid verification code');
    return await response.json();
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

const verifyPhoneNumber = async (phoneNumber) => {
  try {
    const response = await fetch('/api/auth/verify-phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber }),
    });
    
    if (!response.ok) throw new Error('Failed to send phone verification');
    return await response.json();
  } catch (error) {
    console.error('Error verifying phone number:', error);
    throw error;
  }
};

const verifyPhoneOTP = async (phoneNumber, code) => {
  try {
    const response = await fetch('/api/auth/verify-phone/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, code }),
    });
    
    if (!response.ok) throw new Error('Invalid phone verification code');
    return await response.json();
  } catch (error) {
    console.error('Error verifying phone OTP:', error);
    throw error;
  }
};

// Format dates for display - moved outside component for reuse
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return 'Invalid date';
  }
};

// Username validation - moved outside component for reuse
const validateUsername = (username) => {
  if (!username) return { valid: false, message: "Username is required" };
  if (username.length < 3) return { valid: false, message: "Username must be at least 3 characters" };
  if (username.length > 20) return { valid: false, message: "Username must be less than 20 characters" };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return { valid: false, message: "Username can only contain letters, numbers, and underscores" };
  return { valid: true, message: "Username is valid" };
};

// Loading fallback component
const SectionLoading = ({ title }) => (
  <div className="p-8 flex flex-col items-center justify-center space-y-4 animate-pulse">
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
      <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
    <p className="text-sm text-muted-foreground">Loading {title || 'section'}...</p>
  </div>
);

export default function AccountTab({ profile, handleSave, settingsLoading }) {
  // Use the profile data passed as props instead of fetching it from useAuth
  const profileData = profile || {}

  // Collapsible state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extract basic info from the profile using useMemo for performance
  const basicInfo = useMemo(() => profileData?.basicInfo || {}, [profileData]);
  const accountStatus = useMemo(() => profileData?.accountStatus || {}, [profileData]);
  const personal = useMemo(() => {
    // Handle both nested and flat structures
    if (profileData?.personal?.[0]) {
      return profileData.personal[0];
    } else if (profileData?.personal?.['0']) {
      return profileData.personal['0'];
    }
    return {};
  }, [profileData]);
  
  // Create a local state for form values
  const [formValues, setFormValues] = useState(() => ({
    username: basicInfo?.username || "",
    email: basicInfo?.email || "",
    phoneNumber: personal?.contactNumber || ""
  }));
  
  // Verification states
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState("link");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Track form changes
  const [isDirty, setIsDirty] = useState(false);
  
  // Update local state when profile changes
  useEffect(() => {
    if (basicInfo || personal) {
      setFormValues({
        username: basicInfo?.username || "",
        email: basicInfo?.email || "",
        phoneNumber: personal?.contactNumber || "",
      });
      setIsDirty(false);
    }
  }, [basicInfo, personal]);
  
  // Memoized local change handler
  const handleLocalChange = useMemo(() => (field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  }, []);
  
  // Memoized form submission handler
  const handleSubmit = useMemo(() => () => {
    if (!isDirty) {
      toast.info("No changes to save");
      return;
    }
    
    // Create the data structure expected by handleSave
    const handleSaveData = {
      basic: {
        username: formValues.username,
        email: formValues.email,
        bio: basicInfo.bio || basicInfo.description || ""
      },
      personal: {
        firstName: personal.firstName || "",
        lastName: personal.lastName || "",
        contactNumber: formValues.phoneNumber,
        dateOfBirth: personal.dateOfBirth?.split('T')[0] || "",
        genderIdentity: personal.genderIdentity || "",
      }
    };
    
    handleSave(handleSaveData);
  }, [isDirty, formValues, basicInfo, personal, handleSave]);

  // Memoized email verification functions
  const sendVerificationEmail = useMemo(() => async (method) => {
    setIsVerifying(true);
    setVerificationSent(false);
    
    try {
      if (method === 'link') {
        await verifyEmailWithLink(basicInfo.email);
      } else {
        await verifyEmailWithCode(basicInfo.email);
      }
      
      setVerificationSent(true);
      toast.success(`Verification ${method === 'link' ? 'link' : 'code'} sent to your email`);
    } catch (error) {
      toast.error("Failed to send verification email");
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  }, [basicInfo.email]);
  
  // Memoized OTP verification function
  const verifyOTPCode = useMemo(() => async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    
    setIsVerifying(true);
    
    try {
      await verifyOTP(basicInfo.email, verificationCode);
      setVerificationSuccess(true);
      setSuccessMessage("Email verified successfully!");
      
      // await updateSettings('verification', { emailVerified: true });
      
      setTimeout(() => {
        setVerificationDialogOpen(false);
        toast.success("Email verified successfully");
      }, 2000);
    } catch (error) {
      toast.error("Invalid verification code");
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  }, [basicInfo.email, verificationCode]);

  // Memoized username validation
  const usernameValidation = useMemo(() => 
    validateUsername(formValues.username), 
    [formValues.username]
  );

  // Prepare shared props for child components
  const sharedProps = useMemo(() => ({
    basicInfo,
    accountStatus,
    personal,
    formValues,
    handleLocalChange,
    handleSubmit,
    settingsLoading,
    isDirty,
    usernameValidation,
    formatDate,
    profileData,
    // Verification props
    verificationDialogOpen,
    setVerificationDialogOpen,
    verificationMethod,
    setVerificationMethod,
    verificationCode,
    setVerificationCode,
    isVerifying,
    verificationSent,
    verificationSuccess,
    successMessage,
    sendVerificationEmail,
    verifyOTPCode
  }), [
    basicInfo, accountStatus, personal, formValues, handleLocalChange,
    handleSubmit, settingsLoading, isDirty, usernameValidation, profileData,
    verificationDialogOpen, verificationMethod, verificationCode,
    isVerifying, verificationSent, verificationSuccess, successMessage,
    sendVerificationEmail, verifyOTPCode
  ]);

  return (
    <>
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
          
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-5 w-5 text-primary" />
              Account Information
            </CardTitle>
            <CardDescription>
              Your account details and verification status
            </CardDescription>
          </CardHeader>
          
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* User ID and Username */}
              <ErrorBoundary>
                <Suspense fallback={<SectionLoading title="Account Info" />}>
                  <AccountInfoSection {...sharedProps} />
                </Suspense>
              </ErrorBoundary>

              {/* Enhanced Email and Phone Verification */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Email Card - Enhanced UI */}
                <ErrorBoundary>
                  <Suspense fallback={<SectionLoading title="Email Verification" />}>
                    <EmailVerificationSection {...sharedProps} />
                  </Suspense>
                </ErrorBoundary>

                {/* Phone Number Card - Enhanced UI */}
                <ErrorBoundary>
                  <Suspense fallback={<SectionLoading title="Phone Verification" />}>
                    <PhoneVerificationSection {...sharedProps} />
                  </Suspense>
                </ErrorBoundary>
              </div>

              {/* Account Status and Timeline */}
              <ErrorBoundary>
                <Suspense fallback={<SectionLoading title="Account Status" />}>
                  <AccountStatusSection {...sharedProps} />
                </Suspense>
              </ErrorBoundary>

              {/* Account Security */}
              <ErrorBoundary>
                <Suspense fallback={<SectionLoading title="Account Security" />}>
                  <AccountSecuritySection {...sharedProps} />
                </Suspense>
              </ErrorBoundary>
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t pt-6 gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4 shrink-0" />
                <span>Changes to your account settings may require verification</span>
              </div>
              <Button 
                onClick={handleSubmit}
                disabled={settingsLoading || !isDirty}
                className="w-full sm:w-auto"
              >
                {settingsLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </>
  )
}