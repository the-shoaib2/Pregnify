import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Shield,
  FileText,
  User,
  Mail,
  Phone,
  Info,
  HelpCircle,
  CheckCircle2,
  Save,
  Loader,
  AlertCircle,
  Link as LinkIcon,
  MessageSquare
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { toast } from "react-hot-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { InputOTP } from "@/components/ui/input-otp"

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

export default function AccountTab({ user, formData, handleChange, handleSave, settingsLoading, updateSettings }) {
  // Extract basic info from the formData using useMemo for performance
  const basicInfo = useMemo(() => formData?.basicInfo || {}, [formData]);
  const accountStatus = useMemo(() => formData?.accountStatus || {}, [formData]);
  const personal = useMemo(() => formData?.personal?.[0] || {}, [formData]);
  
  // Create a local state for form values
  const [formValues, setFormValues] = useState({
    username: "",
    email: "",
    phoneNumber: ""
  });
  
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
  
  // Update local state when formData changes
  useEffect(() => {
    if (basicInfo || personal) {
      setFormValues({
        username: basicInfo.username || "",
        email: basicInfo.email || "",
        phoneNumber: basicInfo.phoneNumber || personal.contactNumber || "",
      });
      setIsDirty(false);
    }
  }, [basicInfo, personal]);
  
  // Local change handler
  const handleLocalChange = (field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!isDirty) {
      toast.info("No changes to save");
      return;
    }
    
    // Create the data structure expected by handleSave
    const data = {
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
    
    handleSave(data);
  };

  // Update the existing sendVerificationEmail function in the component to use the new API
  const sendVerificationEmail = async (method) => {
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
  };
  
  // Update the existing verifyOTPCode function to use the new API
  const verifyOTPCode = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    
    setIsVerifying(true);
    
    try {
      await verifyOTP(basicInfo.email, verificationCode);
      setVerificationSuccess(true);
      setSuccessMessage("Email verified successfully!");
      
      await updateSettings('verification', { emailVerified: true });
      
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
  };

  // Format dates for display
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

  // Username validation
  const validateUsername = (username) => {
    if (!username) return { valid: false, message: "Username is required" };
    if (username.length < 3) return { valid: false, message: "Username must be at least 3 characters" };
    if (username.length > 20) return { valid: false, message: "Username must be less than 20 characters" };
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return { valid: false, message: "Username can only contain letters, numbers, and underscores" };
    return { valid: true, message: "Username is valid" };
  };

  const usernameValidation = useMemo(() => validateUsername(formValues.username), [formValues.username]);

  return (
    <>
      <Card className="animate-in fade-in duration-300">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5 text-primary" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your account details and verification status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User ID and Username */}
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

          {/* Enhanced Email and Phone Verification */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Email Card - Enhanced UI */}
            <div className="rounded-lg border bg-card overflow-hidden transition-all hover:shadow-md">
              <div className="bg-muted/30 px-4 py-2 border-b">
                <h3 className="text-sm font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  Email Address
                </h3>
              </div>
              <div className="p-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm break-all ${basicInfo?.email ? 'text-foreground font-medium' : 'text-muted-foreground italic'}`}>
                      {basicInfo?.email || 'No email set'}
                    </p>
                    {basicInfo?.isEmailVerified ? (
                      <Badge className="flex items-center gap-1 p-1 px-2 text-green-500 border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : basicInfo?.email ? (
                      <Badge className="flex items-center gap-1 p-1 px-2 text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
                        <AlertCircle className="h-3 w-3" />
                        Unverified
                      </Badge>
                    ) : null}
                  </div>
                  
                  {basicInfo?.email && !basicInfo?.isEmailVerified && (
                    <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          onClick={() => setVerificationDialogOpen(true)}
                          className="w-full h-8 mt-2 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 dark:from-green-950/30 dark:to-green-900/20 dark:hover:from-green-900/30 dark:hover:to-green-800/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Verify Email
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Verify Your Email</DialogTitle>
                          <DialogDescription>
                            {!verificationSuccess ? 
                              "Choose how you'd like to verify your email address" : 
                              "Your email has been verified successfully"}
                          </DialogDescription>
                        </DialogHeader>
                        
                        {verificationSuccess ? (
                          <div className="py-6 flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-center">{successMessage}</h3>
                            <p className="text-muted-foreground text-center">
                              Your email address has been verified and your account is now fully activated.
                            </p>
                            <Button 
                              className="mt-4 w-full sm:w-auto"
                              onClick={() => setVerificationDialogOpen(false)}
                            >
                              Continue
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Tabs defaultValue="link" onValueChange={setVerificationMethod} className="w-full">
                              <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="link" className="flex items-center gap-2">
                                  <LinkIcon className="h-4 w-4" />
                                  <span>Verification Link</span>
                                </TabsTrigger>
                                <TabsTrigger value="code" className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  <span>Verification Code</span>
                                </TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="link" className="space-y-4">
                                <div className="text-center p-4 bg-muted/30 rounded-lg">
                                  <Mail className="h-12 w-12 mx-auto text-primary opacity-80 mb-2" />
                                  <h3 className="text-lg font-medium">Email Verification Link</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    We'll send a secure link to <span className="font-medium">{basicInfo.email}</span>
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-3">
                                    Click the link in the email to verify your account
                                  </p>
                                </div>
                                
                                {!verificationSent ? (
                                  <Button 
                                    onClick={() => sendVerificationEmail('link')}
                                    disabled={isVerifying}
                                    className="w-full"
                                  >
                                    {isVerifying ? (
                                      <>
                                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                      </>
                                    ) : (
                                      <>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Send Verification Link
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
                                    <CheckCircle2 className="h-5 w-5 mx-auto mb-1" />
                                    <p className="text-sm font-medium">Verification link sent!</p>
                                    <p className="text-xs mt-1">Check your email inbox and spam folder</p>
                                  </div>
                                )}
                              </TabsContent>
                              
                              <TabsContent value="code" className="space-y-4">
                                <div className="text-center p-4 bg-muted/30 rounded-lg">
                                  <MessageSquare className="h-12 w-12 mx-auto text-primary opacity-80 mb-2" />
                                  <h3 className="text-lg font-medium">Email Verification Code</h3>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    We'll send a 6-digit code to <span className="font-medium">{basicInfo.email}</span>
                                  </p>
                                </div>
                                
                                {!verificationSent ? (
                                  <Button 
                                    onClick={() => sendVerificationEmail('code')}
                                    disabled={isVerifying}
                                    className="w-full"
                                  >
                                    {isVerifying ? (
                                      <>
                                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                      </>
                                    ) : (
                                      <>
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Send Verification Code
                                      </>
                                    )}
                                  </Button>
                                ) : (
                                  <div className="space-y-4">
                                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                                        Verification code sent!
                                      </p>
                                      <p className="text-xs text-blue-600 dark:text-blue-400">
                                        Please enter the 6-digit code sent to your email.
                                      </p>
                                    </div>
                                    
                                    <div className="text-center">
                                      <InputOTP 
                                        value={verificationCode} 
                                        onChange={setVerificationCode}
                                        maxLength={6}
                                      />
                                    </div>
                                    
                                    <div className="flex gap-2">
                                      <Button 
                                        onClick={verifyOTPCode}
                                        disabled={isVerifying || verificationCode.length !== 6}
                                        className="flex-1"
                                      >
                                        {isVerifying ? (
                                          <>
                                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                                            Verifying...
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Verify Code
                                          </>
                                        )}
                                      </Button>
                                      
                                      <Button 
                                        onClick={() => sendVerificationEmail('code')}
                                        variant="outline"
                                        className="flex-1"
                                        disabled={isVerifying}
                                      >
                                        <Mail className="mr-2 h-4 w-4" />
                                        Resend Code
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </TabsContent>

                              
                            </Tabs>
                            
                            <DialogFooter className="flex items-center justify-between">
                              <DialogClose asChild>
                                <Button variant="outline" className="text-muted-foreground">
                                  Cancel
                                </Button>
                              </DialogClose>
                              
                              {verificationSent && verificationMethod === 'link' && (
                                <Button 
                                  onClick={() => sendVerificationEmail('link')}
                                  variant="outline"
                                  className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                                >
                                  <Mail className="mr-2 h-4 w-4" />
                                  Resend Link
                                </Button>
                              )}
                            </DialogFooter>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  {basicInfo?.email && !basicInfo?.isEmailVerified && (
                    <p className="text-xs text-muted-foreground mt-2">
                      We'll send a verification link or code to your email address
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Phone Number Card - Enhanced UI */}
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
          </div>

          {/* Account Status and Timeline */}
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
                    {formatDate(formData?.timestamps?.created)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">Last Login</Label>
                  <p className="text-sm font-medium">
                    {formatDate(formData?.activity?.lastLogin)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Security */}
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
                  checked={formData?.security?.multiFactorAuth || false}
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
                Two-factor authentication is {formData?.security?.multiFactorAuth ? 'enabled' : 'disabled'}
              </div>
            </div>
          </div>
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
      </Card>
    </>
  )
} 