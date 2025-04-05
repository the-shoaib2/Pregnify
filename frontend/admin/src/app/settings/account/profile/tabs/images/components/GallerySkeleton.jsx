import React from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AspectRatio } from "@/components/ui/aspect-ratio"

export const GallerySkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="overflow-hidden transition-all duration-300 border-none shadow-sm">
            <AspectRatio ratio={1 / 1}>
              <Skeleton className="h-full w-full bg-gradient-to-br from-muted/30 via-muted/50 to-muted/30" />
            </AspectRatio>
          </Card>
        ))}
    </div>
  </div>
)

export default GallerySkeleton