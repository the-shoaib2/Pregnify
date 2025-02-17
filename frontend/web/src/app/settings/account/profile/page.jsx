import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "react-hot-toast"
import { AvatarUpload } from "@/components/avatar-upload"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { 
  MapPin, 
  Mail, 
  Phone, 
  User, 
  Calendar,
  Briefcase,
  Globe,
  Home,
  Heart,
  Flag,
  UserCheck,
  BadgeCheck,
  Clock,
  CheckCircle2,
  Loader2,
  Building,
  GraduationCap,
  Languages,
  Save,
  FileText,
  Users,
  UserPlus,
  Star,
  Activity,
  Upload,
  Shield,
  HelpCircle,
  Info,
  Calendar as CalendarIcon
} from "lucide-react"
import { useSettings } from '@/contexts/settings-context/settings-context'
import { SettingsService } from "@/services/settings/index.js"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatDistance, format } from "date-fns"
import { ProfileHeader } from "@/components/profile-header"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Loading skeleton component
function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Info Skeleton */}
        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <div className="space-y-4">
                {Array(4).fill(null).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Personal Info Skeleton */}
        <div className="space-y-6">
          {Array(2).fill(null).map((_, i) => (
            <div key={i} className="rounded-lg border p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="space-y-4">
                  {Array(3).fill(null).map((_, j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Progress Skeleton */}
      <div className="rounded-lg border p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array(6).fill(null).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Auto-save debounce function
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Add this helper function
function calculateProfileCompletion(formData) {
  if (!formData) return 0

  const fields = {
    basic: ['username', 'email', 'bio'],
    personal: ['firstName', 'lastName', 'dateOfBirth', 'genderIdentity'],
    contact: ['phoneNumber', 'presentAddress', 'nationality'],
    additional: ['occupation', 'language']
  }

  let completed = 0
  let total = 0

  Object.entries(fields).forEach(([section, fieldList]) => {
    fieldList.forEach(field => {
      total++
      if (formData[section][field]) {
        completed++
      }
    })
  })

  return Math.round((completed / total) * 100)
}

// Add this new component for account info
function AccountInfoCard({ user }) {
  // Add null check for user
  if (!user) return null;

  const accountStatus = user.accountStatus || 'INACTIVE';
  const isEmailVerified = user.isEmailVerified || false;
  const isSmsVerified = user.isSmsVerified || false;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Your account details and verification status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User ID */}
        <div className="flex items-center justify-between">
          <InputWithIcon
            icon={FileText}
            label="User ID"
            value={user.userID || ''}
            readOnly
            className="bg-muted/50"
          />
        </div>

        {/* Username */}
        <div className="flex items-center justify-between">
          <InputWithIcon
            icon={User}
            label="Username"
            value={user.username || ''}
            readOnly
            className="bg-muted/50"
          />
        </div>

        {/* Email with verification status */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Email Address
          </Label>
          <div className="flex items-center gap-2">
            <Input 
              value={user.email || ''} 
              readOnly 
              className="bg-muted/50"
            />
            {isEmailVerified ? (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                className="whitespace-nowrap"
                onClick={() => toast.info("Verification email sent!")}
              >
                Verify Email
              </Button>
            )}
          </div>
        </div>

        {/* Phone with verification status */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Phone Number
          </Label>
          <div className="flex items-center gap-2">
            <Input 
              value={user.phoneNumber || ''} 
              readOnly 
              className="bg-muted/50"
            />
            {isSmsVerified ? (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                className="whitespace-nowrap"
                onClick={() => toast.info("Verification SMS sent!")}
              >
                Verify Phone
              </Button>
            )}
          </div>
        </div>

        {/* Account Status */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label>Account Status</Label>
            <p className="text-sm text-muted-foreground">
              Your account is {accountStatus.toLowerCase()}
            </p>
          </div>
          <Badge 
            variant={accountStatus === 'ACTIVE' ? 'success' : 'secondary'}
            className="uppercase"
          >
            {accountStatus}
          </Badge>
        </div>

        {/* Created & Last Login */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Account Created</Label>
            <p className="text-sm font-medium">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Last Login</Label>
            <p className="text-sm font-medium">
              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Update the StatItem component
function StatCard({ label, value, icon: Icon }) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="absolute right-2 top-2 text-primary/10">
          <Icon className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Update the StatsOverviewCard for a more compact design
function StatsOverviewCard({ user }) {
  const stats = [
    {
      label: "Posts",
      value: user?.stats?.posts || 0,
      icon: FileText,
      color: "bg-blue-500/10 text-blue-500"
    },
    {
      label: "Following",
      value: user?.social?.followingCount || 0,
      icon: Users,
      color: "bg-green-500/10 text-green-500"
    },
    {
      label: "Followers",
      value: user?.social?.followersCount || 0,
      icon: UserPlus,
      color: "bg-purple-500/10 text-purple-500"
    },
    {
      label: "Reputation",
      value: user?.stats?.reputation || 0,
      icon: Star,
      color: "bg-amber-500/10 text-amber-500"
    }
  ]

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Statistics Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 rounded-lg p-3",
                  stat.color
                )}
              >
                <Icon className="h-5 w-5" />
                <div>
                  <p className="text-lg font-semibold leading-none">{stat.value}</p>
                  <p className="text-[10px] font-medium opacity-70">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Update the ProfileCompletionCard with a larger design and progress bar
function ProfileCompletionCard({ user }) {
  const completion = user?.profileCompletionPercentage || 0;
  const suggestions = user?.completionDetails?.suggestions || [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base font-medium">Profile Completion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{completion}% Complete</p>
            <span className="text-xs text-muted-foreground">
              {completion < 100 ? `${100 - completion}% remaining` : 'Completed'}
            </span>
          </div>
          <Progress value={completion} className="h-2" />
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Complete your profile:</p>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-2 text-sm"
                >
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <div className="space-y-1 flex-1">
                    <p className="font-medium leading-none">
                      {suggestion.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.priority === 'HIGH' ? 'Important' : 'Recommended'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Add a circular progress component
function CircularProgress({ value }) {
  const circumference = 2 * Math.PI * 18; // r = 18
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="h-12 w-12 -rotate-90">
        <circle
          className="text-muted stroke-current"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r="18"
          cx="24"
          cy="24"
        />
        <circle
          className="text-primary stroke-current"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="18"
          cx="24"
          cy="24"
        />
      </svg>
      <CheckCircle2 className="absolute h-5 w-5 text-primary" />
    </div>
  )
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { updateSettings, loading: settingsLoading } = useSettings()
  const [formData, setFormData] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  // Define handleChange using useCallback
  const handleChange = useCallback((section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }, [])

  // Memoized input field renderer
  const renderInputField = useCallback(({ 
    icon: Icon, 
    label, 
    section, 
    field, 
    type = "text",
    placeholder = ""
  }) => (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </Label>
      <Input
        type={type}
        value={formData?.[section]?.[field] || ""}
        onChange={(e) => handleChange(section, field, e.target.value)}
        placeholder={placeholder}
      />
    </div>
  ), [formData, handleChange])

  // Initialize form data from user object
  useEffect(() => {
    if (user) {
      console.log('Initializing form with user data:', user)
      const personal = user.personal?.[0] || {}
      
      // Split the full name into first and last name
      const [firstName = "", lastName = ""] = (user.name || "").split(" ").filter(Boolean);
      
      setFormData({
        basic: {
          username: user.username?.replace('@', '') || "",
          email: user.email || "",
          bio: user.bio || user.discription || "",
        },
        personal: {
          firstName: user.firstName || firstName || "", 
          lastName: user.lastName || lastName || "",    
          dateOfBirth: personal.dateOfBirth?.split('T')[0] || "",
          genderIdentity: personal.genderIdentity || "",
          contactNumber: user.phoneNumber || personal.contactNumber || "",
          presentAddress: personal.presentAddress || user.location || "",
          permanentAddress: personal.permanentAddress || "",
          nationality: personal.citizenship || "",
          religion: personal.religion || "",
          maritalStatus: personal.maritalStatus || "",
          bloodGroup: personal.bloodGroup || "",
          hobbies: personal.hobbies || "",
          occupation: personal.occupation || "",
          education: user.educationQualification?.[0]?.degree || "",
          language: user.languagePreference || ""
        }
      })
      setPageLoading(false)
    }
  }, [user])

  // Optimized save handler
  const handleSave = useCallback(async (data) => {
    if (!data) return

    try {
      const profileData = {
        firstName: data.personal.firstName,
        lastName: data.personal.lastName,
        name: `${data.personal.firstName} ${data.personal.lastName}`.trim(), // Combine for the name field
        username: data.basic.username,
        phoneNumber: data.personal.contactNumber,
        bio: data.basic.bio,
        location: data.personal.presentAddress,
        discription: data.basic.bio,
        personal: {
          dateOfBirth: data.personal.dateOfBirth,
          genderIdentity: data.personal.genderIdentity,
          contactNumber: data.personal.contactNumber,
          presentAddress: data.personal.presentAddress,
          permanentAddress: data.personal.permanentAddress,
          citizenship: data.personal.nationality,
          religion: data.personal.religion,
          maritalStatus: data.personal.maritalStatus,
          bloodGroup: data.personal.bloodGroup,
          hobbies: data.personal.hobbies,
          occupation: data.personal.occupation,
        },
        educationQualification: [{
          degree: data.personal.education
        }],
        languagePreference: data.personal.language
      }

      await updateSettings('profile', profileData)
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to save changes")
    }
  }, [updateSettings])

  // Loading state
  if (pageLoading || !formData) {
    return <ProfileSkeleton />
  }

  console.log('Rendering profile with data:', { formData, user })

  const handleAvatarUpload = async (file) => {
    setUploadingImage(true)
    try {
      const response = await SettingsService.uploadProfileImage(file)
      const { avatarUrl } = response.data.data
      
      // Update the user's avatar URL
      await updateSettings('personal', {
        ...formData.personal,
        avatarUrl
      })

      toast.success("Profile picture updated successfully")
    } catch (error) {
      console.error('Failed to upload profile image:', error)
      toast.error(error?.response?.data?.message || "Failed to upload profile picture")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCoverUpload = async (file) => {
    setUploadingCover(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await SettingsService.uploadCoverImage(file)
      const { coverImage } = response.data.data
      
      // Update the user's cover image URL
      await updateSettings('profile', {
        ...formData.personal,
        coverImage
      })

      toast.success("Cover photo updated successfully")
    } catch (error) {
      console.error('Failed to upload cover photo:', error)
      toast.error(error?.response?.data?.message || "Failed to upload cover photo")
    } finally {
      setUploadingCover(false)
    }
  }

  const personalInfo = user?.personalInformation?.[0] || {}
  const preferences = user?.preferences?.[0] || {}

  return (
    <div className="space-y-8">
      <ProfileHeader 
        user={user}
        onAvatarUpload={handleAvatarUpload}
        onCoverUpload={handleCoverUpload}
        uploadingImage={uploadingImage}
        uploadingCover={uploadingCover}
      />

      {/* Main Content */}
      <div className="grid gap-6">
        {/* Stats and Completion Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <StatsOverviewCard user={user} />
          </div>
          <div className="md:col-span-2">
            <ProfileCompletionCard user={user} />
          </div>
        </div>

        {/* Tabs Section */}
        <div className="w-full">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Your personal details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Basic Details
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <InputWithIcon
                        icon={User}
                        label="First Name"
                        value={formData.personal.firstName}
                        onChange={(e) => handleChange('personal', 'firstName', e.target.value)}
                        placeholder={user.firstName}
                      />
                      <InputWithIcon
                        icon={User}
                        label="Last Name"
                        value={formData.personal.lastName}
                        onChange={(e) => handleChange('personal', 'lastName', e.target.value)}
                        placeholder={user.lastName}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          Date of Birth
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.personal.dateOfBirth && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.personal.dateOfBirth ? (
                                format(new Date(formData.personal.dateOfBirth), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.personal.dateOfBirth ? new Date(formData.personal.dateOfBirth) : undefined}
                              onSelect={(date) => {
                                handleChange('personal', 'dateOfBirth', date ? format(date, 'yyyy-MM-dd') : '')
                              }}
                              disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <p className="text-xs text-muted-foreground">
                          Your date of birth helps us provide age-appropriate content
                        </p>
                      </div>
                      <InputWithIcon
                        icon={User}
                        label="Gender"
                        value={formData.personal.genderIdentity}
                        onChange={(e) => handleChange('personal', 'genderIdentity', e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Additional Details</h3>
                    <div className="grid gap-4">
                      <InputWithIcon
                        icon={Briefcase}
                        label="Occupation"
                        value={formData.personal.occupation}
                        onChange={(e) => handleChange('personal', 'occupation', e.target.value)}
                      />
                      <InputWithIcon
                        icon={GraduationCap}
                        label="Education"
                        value={formData.personal.education}
                        onChange={(e) => handleChange('personal', 'education', e.target.value)}
                      />
                      <InputWithIcon
                        icon={Languages}
                        label="Preferred Language"
                        value={formData.personal.language}
                        onChange={(e) => handleChange('personal', 'language', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-4">
                  <Button 
                    onClick={() => handleSave(formData)}
                    disabled={settingsLoading}
                  >
                    {settingsLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
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
            </TabsContent>

            {/* Contact Information Tab */}
            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Your contact details and addresses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <InputWithIcon
                    icon={Phone}
                    label="Phone Number"
                    type="tel"
                    value={formData.personal.contactNumber}
                    onChange={(e) => handleChange('personal', 'contactNumber', e.target.value)}
                  />

                  <InputWithIcon
                    icon={Home}
                    label="Current Address"
                    value={formData.personal.presentAddress}
                    onChange={(e) => handleChange('personal', 'presentAddress', e.target.value)}
                  />

                  <InputWithIcon
                    icon={Building}
                    label="Permanent Address"
                    value={formData.personal.permanentAddress}
                    onChange={(e) => handleChange('personal', 'permanentAddress', e.target.value)}
                  />

                  <InputWithIcon
                    icon={Globe}
                    label="Nationality"
                    value={formData.personal.nationality}
                    onChange={(e) => handleChange('personal', 'nationality', e.target.value)}
                  />
                </CardContent>
                <CardFooter className="flex justify-end space-x-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    {settingsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {settingsLoading ? "Saving changes..." : "All changes saved"}
                  </div>
                  <Button 
                    onClick={() => handleSave(formData)}
                    disabled={settingsLoading}
                  >
                    {settingsLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
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
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your recent actions and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityTimeline activities={user?.activity?.recentActivities} />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    <Loader2 className="mr-2 h-4 w-4" />
                    Refresh Activity
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
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
                        <code className="font-mono text-sm">{user?.userID || 'N/A'}</code>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm">Username</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={formData.basic.username}
                          onChange={(e) => handleChange('basic', 'username', e.target.value)}
                          placeholder="Enter username"
                          className="font-medium"
                        />
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                              <HelpCircle className="h-4 w-4" />
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-medium">Username Guidelines</h4>
                              <ul className="text-sm space-y-1 text-muted-foreground">
                                <li>• Must be unique</li>
                                <li>• 3-20 characters long</li>
                                <li>• Can contain letters, numbers, and underscores</li>
                                <li>• Cannot contain spaces or special characters</li>
                              </ul>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    </div>
                  </div>

                  {/* Email and Phone Verification */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <Label className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            Email Address
                          </Label>
                          <p className="text-sm text-muted-foreground break-all">
                            {user?.email || 'No email set'}
                          </p>
                        </div>
                        {user?.isEmailVerified ? (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toast.info("Verification email sent!")}
                            className="h-7"
                          >
                            Verify Email
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <Label className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            Phone Number
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {user?.phoneNumber || 'No phone set'}
                          </p>
                        </div>
                        {user?.isSmsVerified ? (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toast.info("Verification SMS sent!")}
                            className="h-7"
                          >
                            Verify Phone
                          </Button>
                        )}
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
                            Your account is {user?.accountStatus?.toLowerCase() || 'inactive'}
                          </p>
                        </div>
                        <Badge 
                          variant={user?.accountStatus === 'ACTIVE' ? 'success' : 'secondary'}
                          className="uppercase"
                        >
                          {user?.accountStatus || 'INACTIVE'}
                        </Badge>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm text-muted-foreground">Created</Label>
                          <p className="text-sm font-medium">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm text-muted-foreground">Last Login</Label>
                          <p className="text-sm font-medium">
                            {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'N/A'}
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
                          checked={user?.multiFactorAuth}
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
                        Two-factor authentication is {user?.multiFactorAuth ? 'enabled' : 'disabled'}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4" />
                    Changes to your account settings may require verification
                  </div>
                  <Button 
                    onClick={() => handleSave(formData)}
                    disabled={settingsLoading}
                  >
                    {settingsLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// Helper Components
function StatItem({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center space-x-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function ActivityTimeline({ activities }) {
  if (!activities?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent activity
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-4">
          <div className="mt-1">
            <Badge variant="outline" className="h-6 w-6 rounded-full p-0">
              <Activity className="h-3 w-3" />
            </Badge>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">{activity.description}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              <time dateTime={activity.createdAt}>
                {formatDistance(new Date(activity.createdAt), new Date(), { 
                  addSuffix: true 
                })}
              </time>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function VerificationBadge({ verified, onVerify }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
        <CheckCircle2 className="h-3 w-3" />
        Verified
      </span>
    )
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={onVerify}
      className="h-7 px-2 text-xs"
    >
      Verify Now
    </Button>
  )
}

function InputWithIcon({ icon: Icon, label, ...props }) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </Label>
      <Input {...props} />
    </div>
  )
}

function CompletionSuggestions({ suggestions }) {
  if (!suggestions?.length) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {suggestions.map((suggestion, index) => (
        <div 
          key={index}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          {suggestion.message}
        </div>
      ))}
    </div>
  )
} 