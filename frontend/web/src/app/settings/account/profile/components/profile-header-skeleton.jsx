import { memo } from 'react'

// Skeleton components for profile header parts
const CoverPhotoSkeleton = () => (
  <div className="relative animate-in fade-in duration-500">
    <div className="h-40 w-full rounded-lg bg-muted sm:h-48" />
    <div className="absolute right-4 top-4">
      <div className="h-7 w-7 rounded-full border-2 border-background bg-muted" />
    </div>
  </div>
)

const ProfilePictureSkeleton = () => (
  <div className="relative">
    <div className="group relative h-24 w-24 animate-in fade-in duration-500">
      <div className="relative rounded-full border-4 border-background">
        <div className="h-[88px] w-[88px] rounded-full bg-muted" />
        <div className="absolute -bottom-0.5 -right-0.5">
          <div className="h-7 w-7 rounded-full border-2 border-background bg-muted" />
        </div>
      </div>
    </div>
  </div>
)

// Main profile header skeleton component
const ProfileHeaderSkeleton = memo(() => (
  <div className="space-y-4 animate-in fade-in duration-300">

    {/* Remove mt-20 */}
    <div className="relative mt-20 ">
      {/* <CoverPhotoSkeleton /> */}
      <div className="absolute -bottom-2 left-4 z-10">
        <ProfilePictureSkeleton />
      </div>
    </div>
    <div className="pt-4 px-0 sm:px-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-40 rounded-md bg-muted animate-pulse" />
          </div>
          <div className="h-4 w-60 rounded-md bg-muted animate-pulse" />
        </div>
      </div>
    </div>
  </div>
))
ProfileHeaderSkeleton.displayName = 'ProfileHeaderSkeleton'

export { ProfileHeaderSkeleton, CoverPhotoSkeleton, ProfilePictureSkeleton }
