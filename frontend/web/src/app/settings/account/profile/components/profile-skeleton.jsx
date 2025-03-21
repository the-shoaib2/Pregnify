import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { ImageCardSkeleton } from "./images-preview/page"
import {  StatsOverviewSkeleton } from "./statistics-overview/page"


// ProfileSkeleton component
export const ProfileSkeleton = () => (
  <Card className="border-none shadow-none">
    <CardContent className="p-0">
      <div className="space-y-6">
        <div className="relative">
          <Skeleton className="h-48 sm:h-40 w-full rounded-lg" />
          <div className="absolute bottom-0 left-4 -mb-6 flex items-center">
            <Skeleton className="h-24 w-24 rounded-full border-4 border-background shadow-lg" />
          </div>
        </div>
        <div className="pt-4 pl-4 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Image Preview and Statistics Overview Skeleton */}
        <div className="flex gap-6 items-start">
          <ImageCardSkeleton />
          <StatsOverviewSkeleton />
        </div>
      </div>

     
 
    </CardContent>
  </Card>
)
