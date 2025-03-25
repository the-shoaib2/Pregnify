import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { ImageCardSkeleton } from "./images-preview/page"
import {  StatsOverviewSkeleton } from "./statistics-overview/page"
import { TabListSkeleton , CardSkeleton } from "../tabs/personal/components/skeleton"
import { ProfileHeaderSkeleton } from "./profile-header-skeleton"

// ProfileSkeleton component
export const ProfileSkeleton = () => (
  <Card className="border-none shadow-none">
    <CardContent className="p-0">
      <div className="space-y-6 ">
        
        <div className="relative">
          <ProfileHeaderSkeleton />
        </div>

        {/* Image Preview and Statistics Overview Skeleton */}
        <div className="flex gap-6 items-start">
          <ImageCardSkeleton />
          <StatsOverviewSkeleton />
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-4 ">
          {/* TabsList Skeleton */}
          <TabListSkeleton count={4} />
          {/* TabsContent Skeleton */}
          <CardSkeleton count={4} />
        </div>
      </div>

     
 
    </CardContent>
  </Card>
)
