"use client"

import React, { Suspense } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CardSkeleton } from "../../tabs/personal/components/skeleton"
import ErrorBoundary from "@/components/error-boundary"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PhotoGallery } from "../../tabs/images/page"

function ComponentErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-6 bg-destructive/5 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try Again</Button>
    </div>
  )
}

export function ProfileTabs({
  activeTab,
  onTabChange,
  showPhotoGallery,
  hasProfileData,
  profileData,
  handleSave,
  isUpdating,
  settingsLoading,
  PersonalTab,
  AccountTab,
  ContactTab,
  ActivityTab
}) {
  return (
    <Tabs 
      defaultValue="personal" 
      value={activeTab}
      onValueChange={onTabChange}
      className={cn({
        "hidden": showPhotoGallery
      })}
    >
      <TabsList className="w-full p-1">
        <TabsTrigger 
          value="personal" 
          className="w-full"
        >
          Personal
        </TabsTrigger>
        <TabsTrigger 
          value="images"
          className="w-full"
        >
          Images
        </TabsTrigger>
        <TabsTrigger 
          value="account"
          className="w-full"
        >
          Account
        </TabsTrigger>
        <TabsTrigger 
          value="contact"
          className="w-full"
        >
          Contact
        </TabsTrigger>
        <TabsTrigger 
          value="activity"
          className="w-full"
        >
          Activity
        </TabsTrigger>

      </TabsList>

      <TabsContent value="personal" className="mt-2">
        <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
          <Suspense fallback={<CardSkeleton />}>
            {hasProfileData ? (
              <PersonalTab 
                profile={profileData} 
                handleSave={handleSave} 
                settingsLoading={isUpdating || settingsLoading}
              />
            ) : (
              <CardSkeleton />
            )}
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="account" className="mt-2">
        <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
          <Suspense fallback={<CardSkeleton />}>
            {hasProfileData ? (
              <AccountTab 
                profile={profileData} 
                handleSave={handleSave} 
                settingsLoading={isUpdating || settingsLoading}
              />
            ) : (
              <CardSkeleton />
            )}
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="contact" className="mt-2">
        <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
          <Suspense fallback={<CardSkeleton />}>
            {hasProfileData ? (
              <ContactTab 
                profile={profileData} 
                handleSave={handleSave} 
                settingsLoading={isUpdating || settingsLoading}
              />
            ) : (
              <CardSkeleton />
            )}
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="activity" className="mt-2">
        <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
          <Suspense fallback={<CardSkeleton />}>
            {hasProfileData ? (
              <ActivityTab 
                profile={profileData} 
                handleSave={handleSave} 
                settingsLoading={isUpdating || settingsLoading}
              />
            ) : (
              <CardSkeleton />
            )}
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      <TabsContent value="images" className="mt-2">
        <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
          <Suspense fallback={<CardSkeleton />}>
            <PhotoGallery />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>
    </Tabs>
  )
}