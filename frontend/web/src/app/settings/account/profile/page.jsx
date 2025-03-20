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
// import { ProfileTabs } from "./components/profile-tabs/page"
// import { ImageCard } from "./components/images-preview/image-preview"

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

// Lazy load components properly
const ProfileHeader = lazy(() => 
  import("./components/profile-header/page").then(module => ({
    default: module.ProfileHeader
  }))
)

const StatsOverview = lazy(() => 
  import("./components/statistics-overview/page").then(module => ({
    default: module.default
  }))
)

const ImageCard = lazy(() => 
  import("./components/images-preview/image-preview").then(module => ({
    default: module.ImageCard
  }))
)

const ProfileTabs = lazy(() => 
  import("./components/profile-tabs/page").then(module => ({
    default: module.ProfileTabs
  }))
)

const PhotoGallery = lazy(() => 
  import("./tabs/images/page").then(module => ({
    default: module.default
  }))
)

// Lazy load tab components
const TabComponents = {
  personal: lazy(() => import("./tabs/personal/page")),
  account: lazy(() => import("./tabs/account/page")),
  contact: lazy(() => import("./tabs/contact/page")),
  activity: lazy(() => import("./tabs/activity/page"))
}

export default function ProfilePage() {
  // Memoize initial states
  const initialState = useMemo(() => ({
    pageLoading: true,
    isUpdating: false,
    uploadingImage: false,
    uploadingCover: false,
    initialized: false,
    error: null
  }), [])

  const [state, setState] = useState(initialState)
  const { user } = useAuth()
  const { loading: settingsLoading, fetchProfile } = useSettings()
  const [profile, setProfile] = useState()
  const [activeTab, setActiveTab] = useState("personal")
  const [showPhotoGallery, setShowPhotoGallery] = useState(false)

  // Memoize profile data
  const profileData = useMemo(() => profile?.data || {}, [profile])
  const hasProfileData = useMemo(() => Object.keys(profileData).length > 0, [profileData])

  // Optimize data fetching
  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, pageLoading: true }))
      const data = await fetchProfile()
      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile data")
    } finally {
      setState(prev => ({ 
        ...prev, 
        pageLoading: false,
        initialized: true 
      }))
    }
  }, [fetchProfile])

  // Initialize data with proper cleanup
  useEffect(() => {
    let mounted = true

    const init = async () => {
      if (!state.initialized && mounted) {
        await fetchData()
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [state.initialized, fetchData])

  // Optimize rendering conditions
  const isLoading = useMemo(() => {
    return state.pageLoading || settingsLoading || !state.initialized
  }, [state.pageLoading, settingsLoading, state.initialized])

  // Memoize handlers
  const handleTabChange = useCallback((value) => {
    setActiveTab(value)
  }, [])

  const handleUploadComplete = useCallback((type) => {
    setState(prev => ({
      ...prev,
      [`uploading${type}`]: false
    }))
    fetchData()
  }, [fetchData])

  return (
    <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
      <div className="container mx-auto p-0 space-y-0">
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <div className="space-y-6">
            <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
              <Suspense fallback={<ProfileHeaderSkeleton />}>
                <ProfileHeader 
                  user={user} 
                  profile={profile} 
                  profileData={profileData}
                  loading={isLoading} 
                  uploadingImage={state.uploadingImage}
                  uploadingCover={state.uploadingCover}
                  onUploadComplete={handleUploadComplete}
                />
              </Suspense>
            </ErrorBoundary>

            {!showPhotoGallery && (
              <div className={cn(
                "grid gap-6",
                "grid-cols-1 md:grid-cols-[160px,1fr]",
                "items-start"
              )}>
                <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
                  <Suspense fallback={<CardSkeleton className="h-[160px] w-[160px]" />}>
                    <div className="w-full md:w-[160px]">
                      <ImageCard
                        avatarThumb={profileData?.basicInfo?.avatarThumb}
                        coverThumb={profileData?.basicInfo?.coverThumb}
                        onClick={() => setShowPhotoGallery(true)}
                      />
                    </div>
                  </Suspense>
                </ErrorBoundary>

                <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
                  <Suspense fallback={<CardSkeleton />}>
                    <StatsOverview user={user} isLoading={isLoading} />
                  </Suspense>
                </ErrorBoundary>
              </div>
            )}

            {showPhotoGallery && (
              <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
                <Suspense fallback={<GallerySkeleton />}>
                  <PhotoGallery 
                    onClose={() => setShowPhotoGallery(false)}
                    profileData={profileData}
                  />
                </Suspense>
              </ErrorBoundary>
            )}

            <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
              <Suspense fallback={<CardSkeleton />}>
                <ProfileTabs
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  showPhotoGallery={showPhotoGallery}
                  hasProfileData={hasProfileData}
                  profileData={profileData}
                  handleSave={handleUploadComplete}
                  isUpdating={state.isUpdating}
                  settingsLoading={settingsLoading}
                  PersonalTab={TabComponents.personal}
                  AccountTab={TabComponents.account}
                  ContactTab={TabComponents.contact}
                  ActivityTab={TabComponents.activity}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
