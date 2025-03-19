import React from "react"
import { Card, CardTitle, CardDescription } from "@/components/ui/card"
import { Image } from "lucide-react"

export const EmptyState = () => (
  <Card className="w-full p-8 flex flex-col items-center justify-center">
    <div className="rounded-full bg-muted p-6 mb-4">
      <Image className="h-12 w-12 text-muted-foreground" />
    </div>
    <CardTitle className="mb-2">No photos yet</CardTitle>
    <CardDescription className="text-center mb-6">
      Your photo gallery is currently empty
    </CardDescription>
  </Card>
)

export default EmptyState