import { useState, useEffect } from "react"
import { Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function FullscreenButton({ className }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null)
      // Reset transition state after animation
      setTimeout(() => setIsTransitioning(false), 300)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      setIsTransitioning(true)
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        // Add smooth transition class to body
        document.body.classList.add('fullscreen-transition')
      } else {
        await document.exitFullscreen()
        // Add exit transition class to body
        document.body.classList.add('fullscreen-exit')
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
      setIsTransitioning(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "transition-all duration-300 ease-in-out",
        isTransitioning && "scale-90",
        className
      )}
      onClick={toggleFullscreen}
      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      disabled={isTransitioning}
    >
      {isFullscreen ? (
        <Minimize2 className={cn(
          "h-5 w-5 transition-transform duration-300",
          isTransitioning && "scale-75"
        )} />
      ) : (
        <Maximize2 className={cn(
          "h-5 w-5 transition-transform duration-300",
          isTransitioning && "scale-125"
        )} />
      )}
    </Button>
  )
}

// Add these styles to your global CSS
const styles = `
  /* Fullscreen transitions */
  .fullscreen-transition {
    transition: all 300ms ease-in-out !important;
    transform-origin: center center;
  }

  .fullscreen-exit {
    transition: all 300ms ease-in-out !important;
    transform-origin: center center;
  }

  /* Optional: Add scale effect during transition */
  .fullscreen-transition::backdrop {
    transition: all 300ms ease-in-out;
    background: rgba(0, 0, 0, 0.1);
  }

  .fullscreen-exit::backdrop {
    transition: all 300ms ease-in-out;
    background: rgba(0, 0, 0, 0);
  }
` 