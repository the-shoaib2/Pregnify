"use client"

import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { useSettings } from "@/contexts/settings-context/settings-context"
import { ProfileSkeleton } from "./components/profile-skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "react-hot-toast"
import ErrorBoundary from "@/components/error-boundary"
import { CardSkeleton } from "./tabs/personal/components/skeleton"
import { ProfileHeaderSkeleton } from "./components/profile-header-skeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Camera } from "lucide-react"
import { ProfileTabs } from "./components/profile-tabs/page"

// Custom error fallback component for lazy-loaded components
function ComponentErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-6 bg-destructive/5 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try Again</Button>
    </div>
  )
}

// Loading skeleton for the photo gallery
function GallerySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <CardSkeleton className="h-8 w-32" />
        <CardSkeleton className="h-10 w-24" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => (
          <CardSkeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  )
}

// Preload components with improved loading strategy
const ProfileHeader = lazy(() => 
  import("./components/profile-header/page")
    .then(module => ({ default: module.ProfileHeader }))
    .catch(error => {
      console.error("Error loading ProfileHeader:", error)
      toast.error("Failed to load profile header")
      throw error
    })
)

const StatsOverview = lazy(() => 
  import("./components/statistics-overview/page")
    .catch(error => {
      console.error("Error loading StatsOverview:", error)
      toast.error("Failed to load stats overview")
      throw error
    })
)

const PhotoGallery = lazy(() => 
  import("./tabs/images/page")
    .then(module => {
      if (!module.default) {
        throw new Error('PhotoGallery component not found')
      }
      return { default: module.default }
    })
    .catch(error => {
      console.error("Error loading PhotoGallery:", error)
      toast.error("Failed to load photo gallery")
      throw error
    })
)

const ProfileCompletionCard = lazy(() => 
  import("./tabs/personal/components/profile-completion/page")
    .catch(error => {
      console.error("Error loading ProfileCompletionCard:", error)
      toast.error("Failed to load profile completion card")
      throw error
    })
)

const PersonalTab = lazy(() => import("./tabs/personal/page"))
const AccountTab = lazy(() => import("./tabs/account/page"))
const ContactTab = lazy(() => import("./tabs/contact/page"))
const ActivityTab = lazy(() => import("./tabs/activity/page"))

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
  const [showPhotoGallery, setShowPhotoGallery] = useState(false)

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
      const preloadComponents = async () => {
        try {
          // Preload all components in parallel with better error handling
          const preloads = [
            import("./components/profile-header/page"),
            import("./components/statistics-overview/page"),
            import("./tabs/images/page"),
            import("./tabs/personal/components/profile-completion/page"),
            import("./tabs/personal/page"),
            import("./tabs/account/page"),
            import("./tabs/contact/page"),
            import("./tabs/activity/page")
          ]

          await Promise.all(preloads.map(p => 
            p.catch(error => {
              console.error("Error preloading component:", error)
              return null // Continue loading other components
            })
          ))

          setState(prev => ({ ...prev, componentsPreloaded: true }))
        } catch (error) {
          console.error("Error preloading components:", error)
          setState(prev => ({ ...prev, error: error.message }))
          toast.error("Failed to load some components. Please refresh the page.")
        } finally {
          setState(prev => ({ ...prev, loading: false }))
        }
      }

      preloadComponents()
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
    <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
      {/* //Dont chage this */}
      <div className="container mx-auto p-0 space-y-0">   
        {/* Profile Skeleton */}
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <div className="space-y-8">
            {/* Pass profile data and handlers to ProfileHeader */}
            <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
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
            {/* Stats Overview and Profile Completion Cards */}
            <div className={cn( {
              "hidden": showPhotoGallery
            })}>
              <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
                <Suspense fallback={<CardSkeleton />}>
                  <StatsOverview user={user} isLoading={isLoading} />
                </Suspense>
              </ErrorBoundary>
            </div>

            {showPhotoGallery ? (
              <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
                <Suspense fallback={<GallerySkeleton />}>
                  <PhotoGallery onClose={() => setShowPhotoGallery(false)} />
                </Suspense>
              </ErrorBoundary>
            ) : null}

            {/* Main Tabs */}
            <ProfileTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              showPhotoGallery={showPhotoGallery}
              hasProfileData={hasProfileData}
              profileData={profileData}
              handleSave={handleSave}
              isUpdating={state.isUpdating}
              settingsLoading={settingsLoading}
              PersonalTab={PersonalTab}
              AccountTab={AccountTab}
              ContactTab={ContactTab}
              ActivityTab={ActivityTab}
            />

            <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
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
