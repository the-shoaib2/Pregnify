import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { useSettings } from "@/contexts/settings-context/settings-context"
import { ProfileSkeleton } from "./components/profile-skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "react-hot-toast"
import { Loader } from "lucide-react"
import ErrorBoundary from "@/components/error-boundary"

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

// Loading states
const LoadingState = ({ children }) => (
  <div className="flex items-center justify-center p-4 space-x-2">
    <Loader className="h-4 w-4 animate-spin" />
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
    initialized: false,
    error: null
  })

  const [activeTab, setActiveTab] = useState('personal')

  // Memoize profile data
  const profileData = useMemo(() => {
    try {
      const data = profile?.data || user || {}
      if (!Object.keys(data).length) {
        throw new Error("No profile data available")
      }
      return data
    } catch (error) {
      console.error("Error processing profile data:", error)
      throw new Error("Failed to process profile data")
    }
  }, [profile?.data, user])

  // Initialize profile data
  useEffect(() => {
    let mounted = true
    
    if (!state.initialized && !loading) {
      const initPage = async () => {
        try {
          if (!profileData) {
            await fetchProfile()
          }
          if (mounted) {
            setState(prev => ({ 
              ...prev, 
              pageLoading: false,
              initialized: true 
            }))
          }
        } catch (error) {
          console.error("Failed to load profile data:", error)
          if (mounted) {
            setState(prev => ({
              ...prev,
              pageLoading: false,
              initialized: true,
              error: new Error("Failed to load profile data")
            }))
          }
          throw error
        }
      }
      initPage()
    }

    return () => { mounted = false }
  }, [state.initialized, loading, profileData, fetchProfile])

  // Handle save with error handling
  const handleSave = useCallback(async (data) => {
    setState(prev => ({ ...prev, isUpdating: true }))
    try {
      await refreshData(data)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Failed to update profile:", error)
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
        <Suspense fallback={<LoadingState>Loading profile header...</LoadingState>}>
          <ProfileHeader 
            profile={profileData} 
            onSave={handleSave}
            loading={state.isUpdating}
          />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<LoadingState>Loading tabs...</LoadingState>}>
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
                <Suspense fallback={<LoadingState>Loading personal info...</LoadingState>}>
                  <PersonalTab 
                    profile={profileData} 
                    handleSave={handleSave} 
                    settingsLoading={state.isUpdating || loading} 
                  />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="account" className="mt-2">
              <ErrorBoundary>
                <Suspense fallback={<LoadingState>Loading account info...</LoadingState>}>
                  <AccountTab 
                    profile={profileData} 
                    handleSave={handleSave} 
                    settingsLoading={state.isUpdating || loading} 
                  />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="contact" className="mt-2">
              <ErrorBoundary>
                <Suspense fallback={<LoadingState>Loading contact info...</LoadingState>}>
                  <ContactTab 
                    profile={profileData} 
                    handleSave={handleSave} 
                    settingsLoading={state.isUpdating || loading} 
                  />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="activity" className="mt-2">
              <ErrorBoundary>
                <Suspense fallback={<LoadingState>Loading activity...</LoadingState>}>
                  <ActivityTab 
                    profile={profileData} 
                    handleSave={handleSave} 
                    settingsLoading={state.isUpdating || loading} 
                  />
                </Suspense>
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<LoadingState>Loading completion status...</LoadingState>}>
          <ProfileCompletionCard 
            profile={profileData} 
            loading={state.isUpdating || loading} 
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
