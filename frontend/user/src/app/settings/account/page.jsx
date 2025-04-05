import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ProfileSkeleton } from "./profile/components/profile-skeleton"

// Lazy load components
const ProfileTab = React.lazy(() => import("./profile/page"))

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          <React.Suspense fallback={<ProfileSkeleton />}>
            <ProfileTab />
          </React.Suspense>
        </CardContent>
      </Card>
    </div>
  )
}