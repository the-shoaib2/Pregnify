import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { useSettings } from "@/contexts/settings-context/settings-context"
import { ProfileSkeleton } from "./components/profile-skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "react-hot-toast"
import ErrorBoundary from "@/components/error-boundary"
import { CardSkeleton } from "./tabs/personal/components/skeleton"
import { ProfileHeaderSkeleton } from "./components/profile-header-skeleton"

// Lazy load components
const ProfileHeader = lazy(() => import("@/app/settings/account/profile/components/profile-header/page").then(module => ({
  default: module.ProfileHeader
})))
const ProfileCompletionCard = lazy(() => import("./tabs/personal/components/profile-completion/page"))

// Lazy load tabs
const PersonalTab = lazy(() => import("./tabs/personal/page"))
const AccountTab = lazy(() => import("./tabs/account/page"))
const ContactTab = lazy(() => import("./tabs/contact/page"))
const ActivityTab = lazy(() => import("./tabs/activity/page"))


export default function ProfilePage() {
  const { user, profile, refreshData } = useAuth()
  const { loading, fetchProfile } = useSettings()
  
  const [state, setState] = useState({
    pageLoading: true,
    isUpdating: false,
    uploadingImage: false,
    uploadingCover: false,
    initialized: false,
    error: null
  })

  const [activeTab, setActiveTab] = useState('personal')

  // Memoize profile data
  const profileData = useMemo(() => {
    try {
      const data = profile?.data || user || {}
      return data
    } catch (error) {
      console.error("Error processing profile data:", error)
      return null
    }
  }, [profile?.data, user])

  // Check if profile data is available
  const hasProfileData = useMemo(() => {
    return profileData && Object.keys(profileData).length > 0
  }, [profileData])

  // Initialize profile data
  useEffect(() => {
    const initializeProfile = async () => {
      try {
        if (!state.initialized) {
          await fetchProfile()
          setState(prev => ({
            ...prev,
            initialized: true,
            pageLoading: false
          }))
        }
      } catch (error) {
        console.error("Error initializing profile:", error)
        setState(prev => ({
          ...prev,
          error,
          pageLoading: false
        }))
      }
    }

    initializeProfile()
  }, [fetchProfile, state.initialized])

  // Handle save
  const handleSave = useCallback(async (data) => {
    try {
      setState(prev => ({ ...prev, isUpdating: true }))
      await refreshData(data)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error("Failed to update profile")
      throw new Error("Failed to update profile")
    } finally {
      setState(prev => ({ ...prev, isUpdating: false }))
    }
  }, [refreshData])

  if (state.pageLoading) {
    return <ProfileSkeleton />
  }

  if (state.error) {
    throw state.error
  }

  return (
    <div className="flex flex-col gap-6">
      <ErrorBoundary>
        <Suspense fallback={<ProfileHeaderSkeleton />}>
          {hasProfileData ? (
            <ProfileHeader 
              profile={profileData} 
              onSave={handleSave}
              loading={state.isUpdating}
            />
          ) : (
            <ProfileHeaderSkeleton />
          )}
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<CardSkeleton />}>
          <Tabs 
            defaultValue="personal" 
            value={activeTab}
            onValueChange={setActiveTab}
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
                      settingsLoading={state.isUpdating || loading}
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
                      settingsLoading={state.isUpdating || loading}
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
                      settingsLoading={state.isUpdating || loading}
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
                      settingsLoading={state.isUpdating || loading}
                    />
                  ) : (
                    <CardSkeleton />
                  )}
                </Suspense>
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<CardSkeleton />}>
          {hasProfileData ? (
            <ProfileCompletionCard 
              profile={profileData} 
              loading={state.isUpdating || loading} 
            />
          ) : (
            <CardSkeleton />
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
