import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Share2,
  Download,
  Copy,
  Link as LinkIcon,
  ExternalLink,
  QrCode,
} from "lucide-react"
import { QRCodeSVG } from 'qrcode.react'

export function UserCardButtons({ user, onShare, onDownload }) {
  const [showQR, setShowQR] = useState(false)
  const profileUrl = `${window.location.origin}/profile/${user?.username}`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.name}'s Profile`,
          text: `Check out ${user.name}'s profile`,
          url: profileUrl,
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error)
          toast.error('Failed to share profile')
        }
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl)
    toast.success("Profile link copied!")
  }

  const handleDownloadQR = () => {
    const svg = document.querySelector('.qr-code-svg')
    if (svg) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const data = (new XMLSerializer()).serializeToString(svg)
      const DOMURL = window.URL || window.webkitURL || window

      const img = new Image()
      const svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'})
      const url = DOMURL.createObjectURL(svgBlob)

      img.onload = function () {
        canvas.width = img.width
        canvas.height = img.height
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        DOMURL.revokeObjectURL(url)

        const imgURI = canvas
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream')

        const link = document.createElement('a')
        link.download = `${user?.username}-profile-qr.png`
        link.href = imgURI
        link.click()
      }

      img.src = url
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Share Button */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleShare}
        className="flex-1 sm:flex-none"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share Profile
      </Button>

      {/* QR Code Button */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile QR Code</DialogTitle>
            <DialogDescription>
              Scan this code to view the profile
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 p-4">
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG
                value={profileUrl}
                size={200}
                level="H"
                includeMargin
                className="qr-code-svg rounded-lg"
                imageSettings={{
                  src: user?.avatarUrl,
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleDownloadQR}
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile URL Section */}
      <div className="w-full flex items-center gap-2 rounded-lg border p-2 text-sm mt-2">
        <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="truncate flex-1 text-muted-foreground">
          {profileUrl}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleCopyLink}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => window.open(profileUrl, '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Optional: Export individual buttons if needed separately
export function ShareButton({ onClick, className }) {
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={onClick}
      className={className}
    >
      <Share2 className="h-4 w-4 mr-2" />
      Share Profile
    </Button>
  )
}

export function QRCodeButton({ user, className }) {
  const [showQR, setShowQR] = useState(false)
  
  return (
    <Dialog open={showQR} onOpenChange={setShowQR}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={className}
        >
          <QrCode className="h-4 w-4 mr-2" />
          QR Code
        </Button>
      </DialogTrigger>
      {/* ... QR Code Dialog Content ... */}
    </Dialog>
  )
} 