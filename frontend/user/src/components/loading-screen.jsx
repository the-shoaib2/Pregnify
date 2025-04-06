import { Activity } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export default function LoadingScreen({ onAnimationComplete }) {
  const [isHiding, setIsHiding] = useState(false)

  useEffect(() => {
    // Start fade out after 500ms
    const timer = setTimeout(() => {
      setIsHiding(true)
    }, 500)

    // Cleanup timer
    return () => clearTimeout(timer)
  }, [])

  // Handle animation end
  const handleTransitionEnd = () => {
    if (isHiding && onAnimationComplete) {
      onAnimationComplete()
    }
  }

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-background",
        "transition-opacity duration-500 ease-in-out",
        isHiding ? "opacity-0" : "opacity-100"
      )}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className={cn(
        "flex flex-col items-center gap-4",
        "transition-transform duration-500 ease-in-out",
        isHiding ? "scale-95" : "scale-100"
      )}>
        <Activity className="h-8 w-8 animate-spin text-primary" />
        <div className={cn(
          "text-sm font-medium text-muted-foreground",
          "animate-pulse"
        )}>
        </div>
      </div>
    </div>
  )
}