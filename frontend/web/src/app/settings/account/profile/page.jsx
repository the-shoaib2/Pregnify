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
import { MediaService, Visibility } from '@/services/media'
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
  const { settings, loading: settingsLoading, updateSettings } = useSettings()
  const [formData, setFormData] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

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


  // Initialize form data from user object
  useEffect(() => {
    if (userData) {
      // console.log('Initializing form with user data:', userData)
      
      setFormData({
        basic: {
          username: userData.username || "",
          email: userData.email || "",
          bio: userData.bio || userData.description || "",
        },
        personal: {
          firstName: userData.firstName || "", 
          lastName: userData.lastName || "",    
          dateOfBirth: userData.dateOfBirth?.split('T')[0] || "",
          genderIdentity: userData.genderIdentity || "",
          contactNumber: userData.phoneNumber || "",
          presentAddress: userData.location || "",
          permanentAddress: userData.permanentAddress || "",
          nationality: userData.citizenship || "",
          religion: userData.religion || "",
          maritalStatus: userData.maritalStatus || "",
          bloodGroup: userData.bloodGroup || "",
          hobbies: userData.hobbies || "",
          occupation: userData.occupation || "",
          education: userData.education || "",
          language: userData.languagePreference || ""
        }
      })
      setPageLoading(false)
    }
  }, [userData])

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
          // Open FileUpload dialog for avatar
          // FileUpload component will handle the rest
        }}
        onCoverClick={() => {
          setUploadingCover(true)
          // Open FileUpload dialog for cover
          // FileUpload component will handle the rest
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
        aspect={16/9}
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
