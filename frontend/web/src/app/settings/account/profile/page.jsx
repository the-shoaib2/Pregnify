import { useState, useEffect, useCallback } from "react"
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
import { ProfileService } from '@/services/settings'

// Import the ImageView component
const ImageView = lazyLoad(() => import('@/components/image-view').then(mod => ({
  default: mod.ImageView
})))

// Loading skeleton component
function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Cover */}
      <div className="relative">
        <Skeleton className="h-48 sm:h-40 w-full rounded-lg" />

        {/* Avatar positioned at the bottom left, slightly higher */}
        <div className="absolute bottom-0 left-4 -mb-6 flex items-center">
          <Skeleton className="h-24 w-24 rounded-full border-4 border-background shadow-lg" />
        </div>
      </div>

      {/* Name & Bio */}
      <div className="pt-4 pl-4 space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
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
  const { user, profile, refreshData } = useAuth()
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  // Use profile data or fall back to user data
  const profileData = profile?.data || user || {}

  console.log("Profile Data : ", profileData)

  // Initialize page when component mounts
  useEffect(() => {
    const initPage = async () => {
      try {
        if (!profile) {
          await refreshData()
        }
        setPageLoading(false)
      } catch (error) {
        console.error("Failed to load profile data:", error)
        toast.error("Failed to load profile data")
        setPageLoading(false)
      }
    }
    
    initPage()
  }, [profile, refreshData])

  // Update profile settings
  const updateProfile = useCallback(async (type, data) => {
    setIsUpdating(true)
    try {
      let result
      switch (type) {
        case 'profile':
          result = await ProfileService.updateProfile(data)
          break
        case 'avatar':
          result = await ProfileService.updateAvatar(data)
          break
        case 'cover':
          result = await ProfileService.updateCover(data)
          break
        default:
          throw new Error(`Unknown update type: ${type}`)
      }
      
      // Refresh data after update
      await refreshData()
      return result
    } catch (error) {
      console.error(`Failed to update ${type}:`, error)
      throw error
    } finally {
      setIsUpdating(false)
    }
  }, [refreshData])

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

      await updateProfile('profile', profileData)
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to save changes")
    }
  }, [updateProfile])

  // Loading state
  if (pageLoading) {
    return <ProfileSkeleton />
  }


  const handleAvatarSuccess = async (data) => {
    try {
      await updateProfile('avatar', {
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
      await updateProfile('cover', {
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
        user={profileData}
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
            <StatsOverviewCard user={profileData} />
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
                    user={profileData}
                    formData={profileData}
                    handleChange={() => {}}
                    handleSave={handleSave}
                    settingsLoading={isUpdating}
                  />
                </TabsContent>


                <TabsContent value="account">
                  <AccountTab
                    user={profileData}
                    formData={profileData}
                    handleChange={() => {}}
                    handleSave={handleSave}
                    settingsLoading={isUpdating}
                    updateSettings={updateProfile}
                  />
                </TabsContent>

                <TabsContent value="contact">
                  <ContactTab
                    user={profileData}
                    formData={profileData}
                    handleChange={() => {}}
                    handleSave={handleSave}
                    settingsLoading={isUpdating}
                  />
                </TabsContent>

                <TabsContent value="activity">
                  <ActivityTab user={profileData} />
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
            user={profileData}
            isLoading={pageLoading || isUpdating}
          />
        </CardContent>
      </Card>
    </div>
  )
}
