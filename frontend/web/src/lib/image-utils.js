import { toast } from "react-hot-toast"

export const handleImageDownload = async (image, title) => {
  try {
    const response = await fetch(image)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.jpg`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    toast.success('Image downloaded successfully')
  } catch (error) {
    toast.error('Failed to download image')
  }
}

export const handleImageShare = async (image, title) => {
  try {
    if (navigator.share) {
      await navigator.share({
        title,
        text: `Check out my ${title.toLowerCase()}`,
        url: image
      })
    } else {
      await navigator.clipboard.writeText(image)
      toast.success('Image URL copied to clipboard')
    }
  } catch (error) {
    toast.error('Failed to share image')
  }
} 