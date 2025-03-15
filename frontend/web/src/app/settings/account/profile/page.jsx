import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "react-hot-toast"
import { Card, CardContent } from "@/components/ui/card"
import { useSettings } from "@/contexts/settings-context/settings-context"
import { ProfileService } from '@/services/settings'
import { ProfileSkeleton } from "./components/profile-skeleton"

// Lazy load components
const ProfileHeader = lazy(() => import("@/components/profile-header/page").then(module => ({
  default: module.ProfileHeader
})))
const PersonalTab = lazy(() => import("./tabs/personal/page"))
const StatsOverviewCard = lazy(() => import("./tabs/statistics-overview/page"))
const ProfileCompletionCard = lazy(() => import("./tabs/profile-completion/page"))
const FileUpload = lazy(() => import("@/components/file-upload").then(module => ({
  default: module.FileUpload
})))

// Loading states
const LoadingState = ({ children }) => (
  <div className="flex items-center justify-center p-4">
    <div className="text-sm text-muted-foreground">{children}</div>
  </div>
)

export default function ProfilePage() {
  const { user, profile, refreshData } = useAuth()
  const { loading, fetchProfile } = useSettings()
  
  const [state, setState] = useState({
    pageLoading: true,
    isUpdating: false,
    uploadingImage: false,
    uploadingCover: false,
    initialized: false
  })

  const profileData = useMemo(() => {
    const data = profile?.data || user || {}
    return Object.keys(data).length ? data : null
  }, [profile?.data, user])

  useEffect(() => {
    let mounted = true
    
    if (!state.initialized && !loading) {
      const initPage = async () => {
        try {
          if (!profileData) {
            await fetchProfile()
          }
        } catch (error) {
          console.error("Failed to load profile data:", error)
          toast.error("Failed to load profile data")
        } finally {
          if (mounted) {
            setState(prev => ({ 
              ...prev, 
              pageLoading: false,
              initialized: true 
            }))
          }
        }
      }
      initPage()
    }

    return () => { mounted = false }
  }, [state.initialized, loading, profileData, fetchProfile])

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
      toast.error(`Failed to update ${type}`)
      throw error
    } finally {
      setState(prev => ({ ...prev, isUpdating: false }))
    }
  }, [refreshData])

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

  const handleAvatarSuccess = useCallback(async (data) => {
    try {
      await updateProfile('avatar', { avatar: data.file.url })
    } catch (error) {
      toast.error('Failed to update avatar')
    } finally {
      setState(prev => ({ ...prev, uploadingImage: false }))
    }
  }, [updateProfile])

  const handleCoverSuccess = useCallback(async (data) => {
    try {
      await updateProfile('cover', { cover: data.file.url })
    } catch (error) {
      toast.error('Failed to update cover')
    } finally {
      setState(prev => ({ ...prev, uploadingCover: false }))
    }
  }, [updateProfile])

  if (state.pageLoading) {
    return <ProfileSkeleton />
  }

  return (
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
          <Suspense fallback={<LoadingState></LoadingState>}>
            <Card className="border-none shadow-none">
              <CardContent className="p-0">
                <StatsOverviewCard user={profileData} />
              </CardContent>
            </Card>
          </Suspense>

          <Suspense fallback={<LoadingState></LoadingState>}>
            <Card className="border-none shadow-none">
              <CardContent className="p-0">
                <PersonalTab
                  user={profileData}
                  formData={profileData}
                  handleChange={() => {}}
                  handleSave={handleSave}
                  settingsLoading={state.isUpdating}
                />
              </CardContent>
            </Card>
          </Suspense>

          <Suspense fallback={<LoadingState></LoadingState>}>
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
  )
}
