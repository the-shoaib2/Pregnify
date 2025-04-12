import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Phone, Video, Mic, MicOff, PhoneOff, Volume2, VolumeX } from "lucide-react"

const CallTimer = ({ startTime }) => {
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime) / 1000)
      setDuration(diff)
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return <span className="text-sm">{formatTime(duration)}</span>
}

export function CallControls({
  isOpen,
  onClose,
  type = "audio",
  participant,
  status = "connecting"
}) {
  if (!participant) return null;

  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const startTime = useState(() => Date.now())[0]

  const handleEndCall = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md relative">
        <div className="flex flex-col items-center justify-center py-6 md:py-8 space-y-4 md:space-y-6">
          <div className="text-center space-y-2">
            <Avatar className="h-20 w-20 md:h-24 md:w-24 mx-auto ring-2 ring-primary/10">
              <AvatarImage src={participant.avatar} />
              <AvatarFallback>{participant.name[0]}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{participant.name}</h2>
            <p className="text-sm text-muted-foreground">
              {status === "connecting" && "Connecting..."}
              {status === "ringing" && "Ringing..."}
              {status === "connected" && <CallTimer startTime={startTime} />}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 md:gap-4">
            {type === "video" && (
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full bg-background hover:bg-background/90 transition-colors"
                onClick={() => {}}
              >
                <Video className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant="destructive"
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={handleEndCall}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            >
              {isSpeakerOn ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function CallButton({ type = "audio", onClick }) {
  const Icon = type === "audio" ? Phone : Video

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={onClick}
    >
      <Icon className="h-5 w-5" />
    </Button>
  )
}