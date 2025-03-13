import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "react-hot-toast"
import { Card, CardContent } from "@/components/ui/card"

import {
  Phone,
  User,
  Activity,
  Shield,
} from "lucide-react"
import { useSettings } from '@/contexts/settings-context/settings-context'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { ProfileHeader } from "@/components/profile-header/page"
import PersonalTab from "./tabs/personal/page"
import AccountTab from "./tabs/account/page"
import ContactTab from "./tabs/contact/page"
import ActivityTab from "./tabs/activity/page"
import ProfileCompletionCard from "./tabs/profile-completion/page"
import StatsOverviewCard from "./tabs/statistics-overview/page"
import { FileUpload } from "@/components/file-upload"
import { lazyLoad } from '@/utils/lazy-load.jsx'

// Import the ImageView component
const ImageView = lazyLoad(() => import('@/components/image-view').then(mod => ({
  default: mod.ImageView
})))

// Loading skeleton component
function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-lg sm:h-64" /> {/* Cover */}
        <div className="flex items-end gap-4">
          <Skeleton className="h-24 w-24 rounded-full" /> {/* Avatar */}
          <div className="flex-1 space-y-2 pb-4">
            <Skeleton className="h-6 w-48" /> {/* Name */}
            <Skeleton className="h-4 w-72" /> {/* Bio */}
          </div>
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-lg" />
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


export default function ProfilePage() {
  const { user } = useAuth()
  const { settings, loading: settingsLoading, updateSettings, fetchProfile } = useSettings()
  const [formData, setFormData] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  
  // Add a ref to track if profile has been fetched
  const profileFetchedRef = useRef(false)

  // Use settings data instead of user data where appropriate
  const userData = settings?.data || user // Prefer settings data if available

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

  // Fetch profile data only once when component mounts
  useEffect(() => {
    // Only fetch if we haven't already and we have a user
    if (!profileFetchedRef.current && user) {
      const loadProfileData = async () => {
        try {
          await fetchProfile(false);
          profileFetchedRef.current = true;
        } catch (error) {
          console.error("Failed to load profile:", error);
          toast.error("Failed to load profile data");
        }
      };
      
      loadProfileData();
    }
  }, [fetchProfile, user]);

  // Initialize form data from user object - only when userData changes
  useEffect(() => {
    if (userData) {
      setFormData({
        basic: {
          username: userData.basicInfo?.username || "",
          email: userData.basicInfo?.email || "",
          bio: userData.basicInfo?.bio || userData.basicInfo?.description || "",
        },
        personal: {
          firstName: userData.personalInfo?.name?.firstName || "",
          lastName: userData.personalInfo?.name?.lastName || "",
          dateOfBirth: userData.personalInfo?.dateOfBirth?.split('T')[0] || "",
          contactNumber: userData?.personalInfo?.phoneNumber || "",
          presentAddress: userData?.personalInfo?.location || "",
          genderIdentity: userData?.personalInfo?.genderIdentity || "",
          permanentAddress: userData?.personalInfo?.permanentAddress || "",
          nationality: userData?.personalInfo?.nationality || "",
          religion: userData?.personalInfo?.religion || "",
          maritalStatus: userData?.personalInfo?.maritalStatus || "",
          bloodGroup: userData?.personalInfo?.bloodGroup || "",
          hobbies: userData?.personalInfo?.hobbies || "",
          occupation: userData?.personalInfo?.occupation || "",
          education: userData?.personalInfo?.education || "",
          language: userData?.personalInfo?.languagePreference || ""
        }
      });
      setPageLoading(false);
    }
  }, [userData]);

  // Optimized save handler
  const handleSave = useCallback(async (data) => {
    if (!data) return

    try {
      const profileData = {
        firstName: data.personal.firstName,
        lastName: data.personal.lastName,
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

  const handleAvatarSuccess = async (data) => {
    try {
      await updateSettings('avatar', {
        avatar: data.file.url
      })
    } catch (error) {
      console.error('Failed to update avatar:', error)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCoverSuccess = async (data) => {
    try {
      await updateSettings('cover', {
        cover: data.file.url
      })
    } catch (error) {
      console.error('Failed to update cover:', error)
    } finally {
      setUploadingCover(false)
    }
  }

  return (
    <div className="space-y-6">
      <ProfileHeader
        user={userData}
        uploadingImage={uploadingImage}
        uploadingCover={uploadingCover}
        onAvatarClick={() => {
          setUploadingImage(true)
        }}
        onCoverClick={() => {
          setUploadingCover(true)
        }}
      />

      {/* Avatar Upload Dialog */}
      <FileUpload
        fileType="image/jpeg"
        fileCategory="PROFILE"
        onUpload={handleAvatarSuccess}
        isOpen={uploadingImage}
        onClose={() => setUploadingImage(false)}
        description="Upload your profile picture"
        aspect={1}
        circular={true}
        allowComments={true}
        allowSharing={true}
        allowDownload={true}
      />

      {/* Cover Upload Dialog */}
      <FileUpload
        fileType="image/jpeg"
        fileCategory="COVER"
        onUpload={handleCoverSuccess}
        isOpen={uploadingCover}
        onClose={() => setUploadingCover(false)}
        description="Upload your cover photo"
        aspect={16 / 9}
        circular={false}
        cropSizes={{
          width: 100,
          height: 40
        }}
        allowComments={true}
        allowSharing={true}
        allowDownload={true}
      />

      {/* Main Content - More Compact Layout */}
      <div className="grid gap-4">
        {/* Stats Card */}
        <Card className="border-none shadow-none">
          <CardContent className="p-0">
            <StatsOverviewCard user={userData} />
          </CardContent>
        </Card>

        {/* Tabs Section - More Compact */}
        <Card className="border-none shadow-none">
          <CardContent className="p-0">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="w-full grid grid-cols-4 h-12 items-center bg-muted/50 p-1 rounded-lg">
                <TabsTrigger value="personal" className="data-[state=active]:bg-background">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Personal</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="data-[state=active]:bg-background">
                  <Shield className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Account</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="data-[state=active]:bg-background">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Contact</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:bg-background">
                  <Activity className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Activity</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-4">
                <TabsContent value="personal">
                  <PersonalTab
                    user={userData}
                    formData={formData}
                    handleChange={handleChange}
                    handleSave={handleSave}
                    settingsLoading={settingsLoading}
                  />
                </TabsContent>

                <TabsContent value="contact">
                  <ContactTab
                    user={userData}
                    formData={formData}
                    handleChange={handleChange}
                    handleSave={handleSave}
                    settingsLoading={settingsLoading}
                  />
                </TabsContent>

                <TabsContent value="activity">
                  <ActivityTab user={userData} />
                </TabsContent>

                <TabsContent value="account">
                  <AccountTab
                    user={userData}
                    formData={formData}
                    handleChange={handleChange}
                    handleSave={handleSave}
                    settingsLoading={settingsLoading}
                    updateSettings={updateSettings}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion Card */}
      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          <ProfileCompletionCard
            user={userData}
            isLoading={pageLoading || settingsLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
