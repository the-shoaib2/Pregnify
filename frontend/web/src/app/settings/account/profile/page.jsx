import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { useSettings } from "@/contexts/settings-context/settings-context"
import { ProfileSkeleton } from "./components/profile-skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "react-hot-toast"
import ErrorBoundary from "@/components/error-boundary"
import { CardSkeleton } from "./tabs/personal/components/skeleton"
import { ProfileHeaderSkeleton } from "./components/profile-header-skeleton"

// Preload components with improved loading strategy
const ProfileHeader = lazy(() => import("@/app/settings/account/profile/components/profile-header/page")
  .then(module => ({ default: module.ProfileHeader }))
)

const ProfileCompletionCard = lazy(() => import("./tabs/personal/components/profile-completion/page"))

// Preload tab components with improved error handling
const PersonalTab = lazy(() => import("./tabs/personal/page"))
const AccountTab = lazy(() => import("./tabs/account/page"))
const ContactTab = lazy(() => import("./tabs/contact/page"))
const ActivityTab = lazy(() => import("./tabs/activity/page"))

// Preload all tab components when the app starts
const preloadComponents = () => {
  // Preload all components in parallel
  const preloads = [
    import("@/app/settings/account/profile/components/profile-header/page"),
    import("./tabs/personal/components/profile-completion/page"),
    import("./tabs/personal/page"),
    import("./tabs/account/page"),
    import("./tabs/contact/page"),
    import("./tabs/activity/page")
  ]
  
  // Execute all preloads
  return Promise.all(preloads).catch(error => {
    console.error("Error preloading components:", error)
    // Don't throw here, just log the error
  })
}

export default function ProfilePage() {
  const { user, refreshData } = useAuth()
  const [profile, setProfile] = useState();
  const { loading: settingsLoading, fetchProfile } = useSettings()
  
  const [state, setState] = useState({
    pageLoading: true,
    isUpdating: false,
    uploadingImage: false,
    uploadingCover: false,
    initialized: false,
    error: null,
    componentsPreloaded: false,
    dataFetched: false
  })

  const [activeTab, setActiveTab] = useState('personal')

  // Memoize profile data with better error handling
  const profileData = useMemo(() => {
    try {
      const data = profile?.data || {}
      return data
    } catch (error) {
      console.error("Error processing profile data:", error)
      return {}
    }
  }, [profile?.data])

  // Check if profile data is available with better null handling
  const hasProfileData = useMemo(() => {
    return profileData && Object.keys(profileData).length > 0
  }, [profileData])

  // Preload components when the app starts
  useEffect(() => {
    if (!state.componentsPreloaded) {
      preloadComponents().then(() => {
        setState(prev => ({
          ...prev,
          componentsPreloaded: true
        }))
      })
    }
  }, [state.componentsPreloaded])

  // Initialize profile data with better error handling and immediate data fetching
  useEffect(() => {
    const initializeProfile = async () => {
      try {
        // Always fetch profile data on component mount
        const profileResponse = await fetchProfile(true)
        setProfile(profileResponse) 
        setState(prev => ({
          ...prev,
          initialized: true,
          pageLoading: false,
          dataFetched: true
        }))
      } catch (error) {
        console.error("Error initializing profile:", error)
        setState(prev => ({
          ...prev,
          error,
          pageLoading: false
        }))
        toast.error("Failed to load profile data")
      }
    }

    // Always fetch data on component mount
    initializeProfile()
    
    // Return cleanup function
    return () => {
      // Cleanup code if needed
    }
  }, [fetchProfile]) // Remove state.initialized dependency to ensure it always runs

  // Handle image upload state
  const handleImageUploadState = useCallback((isUploading, type) => {
    setState(prev => ({
      ...prev,
      uploadingImage: type === 'avatar' ? isUploading : prev.uploadingImage,
      uploadingCover: type === 'cover' ? isUploading : prev.uploadingCover
    }))
  }, [])

  // Handle image upload completion with centralized data refresh
  const handleUploadComplete = useCallback(async (file, type) => {
    try {
      handleImageUploadState(true, type)
      // Use the refreshData function to update all necessary data
      await refreshData()
      // Fetch fresh profile data
      const profileResponse = await fetchProfile(true)
      console.log("Profile response:", profileResponse)
      setProfile(profileResponse)
      toast.success(`${type === 'avatar' ? 'Profile picture' : 'Cover photo'} updated successfully`)
    } catch (error) {
      console.error(`Error updating ${type}:`, error)
      toast.error(`Failed to update ${type === 'avatar' ? 'profile picture' : 'cover photo'}`)
    } finally {
      handleImageUploadState(false, type)
    }
  }, [refreshData, fetchProfile])

  // Handle save with better error handling
  const handleSave = useCallback(async (data) => {
    try {
      setState(prev => ({ ...prev, isUpdating: true }))
      await refreshData(data)
      // Refresh profile data after save
      const profileResponse = await fetchProfile(true)
      setProfile(profileResponse)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setState(prev => ({ ...prev, isUpdating: false }))
    }
  }, [refreshData, fetchProfile])

  // Handle tab change
  const handleTabChange = useCallback((value) => {
    setActiveTab(value)
  }, [])

  // Loading state for the entire page
  const isLoading = useMemo(() => {
    return state.pageLoading || settingsLoading || !state.initialized
  }, [state.pageLoading, settingsLoading, state.initialized])

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-6 space-y-8">
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <div className="space-y-8">
            {/* Pass profile data and handlers to ProfileHeader */}
            <ErrorBoundary>
              <Suspense fallback={<ProfileHeaderSkeleton />}>
                <ProfileHeader 
                  user={user} 
                  profile={profile} 
                  profileData={profileData}
                  loading={isLoading} 
                  uploadingImage={state.uploadingImage}
                  uploadingCover={state.uploadingCover}
                  onAvatarClick={() => handleImageUploadState(true, 'avatar')}
                  onCoverClick={() => handleImageUploadState(true, 'cover')}
                  onUploadComplete={handleUploadComplete}
                />
              </Suspense>
            </ErrorBoundary>

            <Tabs 
              defaultValue="personal" 
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="w-full bg-foreground/10 p-1">
                <TabsTrigger 
                  value="personal" 
                  className="w-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Personal
                </TabsTrigger>
                <TabsTrigger 
                  value="account"
                  className="w-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Account
                </TabsTrigger>
                <TabsTrigger 
                  value="contact"
                  className="w-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Contact
                </TabsTrigger>
                <TabsTrigger 
                  value="activity"
                  className="w-full data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-2">
                <ErrorBoundary>
                  <Suspense fallback={<CardSkeleton />}>
                    {hasProfileData ? (
                      <PersonalTab 
                        profile={profileData} 
                        handleSave={handleSave} 
                        settingsLoading={state.isUpdating || settingsLoading}
                      />
                    ) : (
                      <CardSkeleton />
                    )}
                  </Suspense>
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="account" className="mt-2">
                <ErrorBoundary>
                  <Suspense fallback={<CardSkeleton />}>
                    {hasProfileData ? (
                      <AccountTab 
                        profile={profileData} 
                        handleSave={handleSave} 
                        settingsLoading={state.isUpdating || settingsLoading}
                      />
                    ) : (
                      <CardSkeleton />
                    )}
                  </Suspense>
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="contact" className="mt-2">
                <ErrorBoundary>
                  <Suspense fallback={<CardSkeleton />}>
                    {hasProfileData ? (
                      <ContactTab 
                        profile={profileData} 
                        handleSave={handleSave} 
                        settingsLoading={state.isUpdating || settingsLoading}
                      />
                    ) : (
                      <CardSkeleton />
                    )}
                  </Suspense>
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="activity" className="mt-2">
                <ErrorBoundary>
                  <Suspense fallback={<CardSkeleton />}>
                    {hasProfileData ? (
                      <ActivityTab 
                        profile={profileData} 
                        handleSave={handleSave} 
                        settingsLoading={state.isUpdating || settingsLoading}
                      />
                    ) : (
                      <CardSkeleton />
                    )}
                  </Suspense>
                </ErrorBoundary>
              </TabsContent>
            </Tabs>

            <ErrorBoundary>
              <Suspense fallback={<CardSkeleton />}>
                {hasProfileData ? (
                  <ProfileCompletionCard 
                    profile={profileData} 
                    loading={state.isUpdating || settingsLoading} 
                  />
                ) : (
                  <CardSkeleton />
                )}
              </Suspense>
            </ErrorBoundary>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
