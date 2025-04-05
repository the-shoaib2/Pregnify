import React from "react"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Image } from "lucide-react"

export const EmptyState = () => (
  <Card className="w-full p-6 sm:p-8 flex flex-col items-center justify-center border-none bg-muted/20 backdrop-blur-sm">
    <div className="rounded-full bg-background p-5 sm:p-6 mb-3 sm:mb-4 shadow-sm">
      <Image className="h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground opacity-70" />
    </div>
    <CardTitle className="mb-2 text-base sm:text-lg font-medium">No photos yet</CardTitle>
    <CardDescription className="text-center mb-4 sm:mb-6 max-w-xs text-xs sm:text-sm">
      Your photo gallery is currently empty. Upload images to see them here.
    </CardDescription>
  </Card>
)

export default EmptyState