import React from 'react'
import { Home } from 'lucide-react'

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* <Home className="size-16 text-primary animate-pulse" /> */}
        <span className="text-muted-foreground animate-pulse">Loading..</span>
      </div>
    </div>
  )
}

export default LoadingScreen
