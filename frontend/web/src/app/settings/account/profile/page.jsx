import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense, memo } from "react"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "react-hot-toast"
import { Card, CardContent } from "@/components/ui/card"
import { useSettings } from "@/contexts/settings-context/settings-context"
import { ProfileService } from '@/services/settings'
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

// Lazy load components correctly
const ProfileHeader = lazy(() => import("@/components/profile-header/page").then(module => ({
  default: module.ProfileHeader
})))

const PersonalTab = lazy(() => import("./tabs/personal/page"))
const AccountTab = lazy(() => import("./tabs/account/page"))
const ContactTab = lazy(() => import("./tabs/contact/page"))
const ActivityTab = lazy(() => import("./tabs/activity/page"))
const ProfileCompletionCard = lazy(() => import("./tabs/profile-completion/page"))
const StatsOverviewCard = lazy(() => import("./tabs/statistics-overview/page"))
const FileUpload = lazy(() => import("@/components/file-upload").then(module => ({
  default: module.FileUpload
})))

// Memoized loading states
const LoadingStats = memo(() => <div>Loading stats...</div>)
const LoadingTabs = memo(() => <div>Loading tabs...</div>)
const LoadingCompletion = memo(() => <div>Loading completion...</div>)

// Memoized ProfileSkeleton component
const ProfileSkeleton = memo(() => {
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
})

ProfileSkeleton.displayName = 'ProfileSkeleton'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try refreshing the page.</div>
    }
    return this.props.children
  }
}

export default function ProfilePage() {
  const { user, profile, refreshData } = useAuth()
  const { loading, fetchProfile } = useSettings()
  
  // Memoized state
  const [state, setState] = useState({
    pageLoading: true,
    isUpdating: false,
    uploadingImage: false,
    uploadingCover: false
  })

  // Memoize profile data to prevent unnecessary re-renders
  const profileData = useMemo(() => {
    return profile?.data || user || {}
  }, [profile?.data, user])

  // Memoized update handlers
  const updateProfile = useCallback(async (type, data) => {
    setState(prev => ({ ...prev, isUpdating: true }))
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
      
      await refreshData()
      return result
    } catch (error) {
      console.error(`Failed to update ${type}:`, error)
      throw error
    } finally {
      setState(prev => ({ ...prev, isUpdating: false }))
    }
  }, [refreshData])

  // Memoized save handler
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

  // Memoized upload handlers
  const handleAvatarSuccess = useCallback(async (data) => {
    try {
      await updateProfile('avatar', { avatar: data.file.url })
    } catch (error) {
      console.error('Failed to update avatar:', error)
    } finally {
      setState(prev => ({ ...prev, uploadingImage: false }))
    }
  }, [updateProfile])

  const handleCoverSuccess = useCallback(async (data) => {
    try {
      await updateProfile('cover', { cover: data.file.url })
    } catch (error) {
      console.error('Failed to update cover:', error)
    } finally {
      setState(prev => ({ ...prev, uploadingCover: false }))
    }
  }, [updateProfile])

  // Remove the console.log effect and add a debug function
  const debugProfile = useCallback((data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Profile Data:', data)
    }
  }, [])

  useEffect(() => {
    debugProfile(profileData)
  }, [profileData, debugProfile])

  // Optimized page initialization
  useEffect(() => {
    let mounted = true

    const initPage = async () => {
      try {
        if (!profile && !loading) {
          await fetchProfile()
        }
        if (mounted) {
          setState(prev => ({ ...prev, pageLoading: false }))
        }
      } catch (error) {
        console.error("Failed to load profile data:", error)
        toast.error("Failed to load profile data")
        if (mounted) {
          setState(prev => ({ ...prev, pageLoading: false }))
        }
      }
    }
    
    initPage()

    return () => {
      mounted = false
    }
  }, [profile, loading, fetchProfile])

  if (state.pageLoading) {
    return <ProfileSkeleton />
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileHeader
            user={profileData}
            uploadingImage={state.uploadingImage}
            uploadingCover={state.uploadingCover}
            onAvatarClick={() => setState(prev => ({ ...prev, uploadingImage: true }))}
            onCoverClick={() => setState(prev => ({ ...prev, uploadingCover: true }))}
          />

          <FileUpload
            fileType="image/jpeg"
            fileCategory="PROFILE"
            onUpload={handleAvatarSuccess}
            isOpen={state.uploadingImage}
            onClose={() => setState(prev => ({ ...prev, uploadingImage: false }))}
            description="Upload your profile picture"
            aspect={1}
            circular={true}
            allowComments={true}
            allowSharing={true}
            allowDownload={true}
          />

          <FileUpload
            fileType="image/jpeg"
            fileCategory="COVER"
            onUpload={handleCoverSuccess}
            isOpen={state.uploadingCover}
            onClose={() => setState(prev => ({ ...prev, uploadingCover: false }))}
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

          <div className="grid gap-4">
            <Suspense fallback={<LoadingStats />}>
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <StatsOverviewCard user={profileData} />
                </CardContent>
              </Card>
            </Suspense>

            <Suspense fallback={<LoadingTabs />}>
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
                          settingsLoading={state.isUpdating}
                        />
                      </TabsContent>

                      <TabsContent value="account">
                        <AccountTab
                          user={profileData}
                          formData={profileData}
                          handleChange={() => {}}
                          handleSave={handleSave}
                          settingsLoading={state.isUpdating}
                          updateSettings={updateProfile}
                        />
                      </TabsContent>

                      <TabsContent value="contact">
                        <ContactTab
                          user={profileData}
                          formData={profileData}
                          handleChange={() => {}}
                          handleSave={handleSave}
                          settingsLoading={state.isUpdating}
                        />
                      </TabsContent>

                      <TabsContent value="activity">
                        <ActivityTab user={profileData} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </Suspense>

            <Suspense fallback={<LoadingCompletion />}>
              <Card className="border-none shadow-none">
                <CardContent className="p-0">
                  <ProfileCompletionCard
                    user={profileData}
                    isLoading={state.pageLoading || state.isUpdating}
                  />
                </CardContent>
              </Card>
            </Suspense>
          </div>
        </Suspense>
      </div>
    </ErrorBoundary>
  )
}
