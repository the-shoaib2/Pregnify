import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
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
  Save
} from "lucide-react"
import { useSettings } from '@/contexts/settings-context'
import { SettingsService } from "@/services/settings/index.js"

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

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const { settings, updateSettings, loading, saving } = useSettings()
  const [formData, setFormData] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [manualSave, setManualSave] = useState(false)

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        basic: {
          username: user.username || "",
          email: user.email || "",
          bio: user.bio || user.discription || "",
        },
        personal: {
          firstName: user?.personalInformation?.[0]?.firstName || "",
          middleName: user?.personalInformation?.[0]?.middleName || "",
          lastName: user?.personalInformation?.[0]?.lastName || "",
          nickName: user?.personalInformation?.[0]?.nickName || "",
          dateOfBirth: user?.personalInformation?.[0]?.dateOfBirth?.split('T')[0] || "",
          genderIdentity: user?.personalInformation?.[0]?.genderIdentity || "",
        },
        contact: {
          phoneNumber: user.phoneNumber || user?.personalInformation?.[0]?.contactNumber || "",
          presentAddress: user?.personalInformation?.[0]?.presentAddress || "",
          permanentAddress: user?.personalInformation?.[0]?.permanentAddress || "",
          nationality: user?.personalInformation?.[0]?.nationality || "",
        },
        additional: {
          occupation: user?.personalInformation?.[0]?.occupation || "",
          religion: user?.personalInformation?.[0]?.religion || "",
          hobbies: user?.personalInformation?.[0]?.hobbies || "",
          language: user?.preferences?.[0]?.language || user.languagePreference || "",
        }
      })
    }
  }, [user])

  // Debounce form changes
  const debouncedFormData = useDebounce(formData, 1000)

  // Auto-save when form data changes
  useEffect(() => {
    if (!loading && JSON.stringify(formData) !== JSON.stringify(debouncedFormData)) {
      handleSave(debouncedFormData)
    }
  }, [debouncedFormData])

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSave = async (data) => {
    try {
      await updateSettings('personal', {
        firstName: data.firstName,
        lastName: data.lastName,
        // ... other fields
      })
    } catch (error) {
      // Error is handled by the context
      console.error(error)
    }
  }

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

  const handleManualSave = async () => {
    setManualSave(true)
    try {
      await updateSettings('personal', {
        firstName: formData.personal.firstName,
        middleName: formData.personal.middleName,
        lastName: formData.personal.lastName,
        nickName: formData.personal.nickName,
        dateOfBirth: formData.personal.dateOfBirth,
        genderIdentity: formData.personal.genderIdentity,
        contactNumber: formData.contact.phoneNumber,
        presentAddress: formData.contact.presentAddress,
        permanentAddress: formData.contact.permanentAddress,
        nationality: formData.contact.nationality,
        occupation: formData.additional.occupation,
        religion: formData.additional.religion,
        hobbies: formData.additional.hobbies,
        language: formData.additional.language
      })
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast.error("Failed to save profile changes")
    } finally {
      setManualSave(false)
    }
  }

  // Show loading skeleton if data is not ready
  if (loading || !formData) {
    return <ProfileSkeleton />
  }

  const personalInfo = user?.personalInformation?.[0] || {}
  const preferences = user?.preferences?.[0] || {}

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile information and account settings
          </p>
        </div>
        <div className="flex items-center gap-4">
          {(saving || manualSave) ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving changes...
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              All changes saved
            </div>
          )}
          <Button 
            onClick={handleManualSave}
            disabled={saving || manualSave || loading}
            className="h-9"
          >
            {manualSave ? (
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
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Your primary account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AvatarUpload 
                user={user} 
                onUpload={handleAvatarUpload}
                loading={uploadingImage}
              />
              
              <div className="space-y-4">
                <InputWithIcon
                  icon={User}
                  label="Username"
                  value={formData.basic.username}
                  onChange={(e) => handleChange('basic', 'username', e.target.value)}
                />

                <div className="relative">
                  <InputWithIcon
                    icon={Mail}
                    label="Email Address"
                    type="email"
                    value={formData.basic.email}
                    onChange={(e) => handleChange('basic', 'email', e.target.value)}
                  />
                  <div className="absolute right-2 top-8">
                    <VerificationBadge 
                      verified={user?.isEmailVerified} 
                      onVerify={() => toast.success("Verification email sent!")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    Bio
                  </Label>
                  <Textarea
                    value={formData.basic.bio}
                    onChange={(e) => handleChange('basic', 'bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How others can reach you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <InputWithIcon
                  icon={Phone}
                  label="Phone Number"
                  type="tel"
                  value={formData.contact.phoneNumber}
                  onChange={(e) => handleChange('contact', 'phoneNumber', e.target.value)}
                />
                <div className="absolute right-2 top-8">
                  <VerificationBadge 
                    verified={user?.isSmsVerified}
                    onVerify={() => toast.success("Verification SMS sent!")}
                  />
                </div>
              </div>

              <InputWithIcon
                icon={Home}
                label="Current Address"
                value={formData.contact.presentAddress}
                onChange={(e) => handleChange('contact', 'presentAddress', e.target.value)}
              />

              <InputWithIcon
                icon={Building}
                label="Permanent Address"
                value={formData.contact.permanentAddress}
                onChange={(e) => handleChange('contact', 'permanentAddress', e.target.value)}
              />

              <InputWithIcon
                icon={Globe}
                label="Nationality"
                value={formData.contact.nationality}
                onChange={(e) => handleChange('contact', 'nationality', e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue={personalInfo?.firstName} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue={personalInfo?.lastName} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="nickName">Nickname</Label>
                <Input id="nickName" defaultValue={personalInfo?.nickName} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input 
                  id="dob" 
                  type="date" 
                  defaultValue={personalInfo?.dateOfBirth?.split('T')[0]} 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Input 
                  id="gender" 
                  defaultValue={personalInfo?.genderIdentity} 
                />
              </div>

              <Button variant="outline" className="w-full">
                Update Personal Info
              </Button>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Other relevant details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputWithIcon
                icon={Briefcase}
                label="Occupation"
                value={formData.additional.occupation}
                onChange={(e) => handleChange('additional', 'occupation', e.target.value)}
              />

              <InputWithIcon
                icon={GraduationCap}
                label="Education"
                value={formData.additional.education}
                onChange={(e) => handleChange('additional', 'education', e.target.value)}
              />

              <InputWithIcon
                icon={Languages}
                label="Preferred Language"
                value={formData.additional.language}
                onChange={(e) => handleChange('additional', 'language', e.target.value)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Completion Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Completion</CardTitle>
          <CardDescription>
            Complete your profile to get the most out of your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Profile Completion
              </span>
              <span className="text-sm font-medium">
                {user?.profileCompletionPercentage || 0}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500 ease-in-out"
                style={{ width: `${user?.profileCompletionPercentage || 0}%` }}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Completion checklist items */}
            </div>
          </div>
        </CardContent>
      </Card>
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