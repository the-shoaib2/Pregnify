import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Moon,
  Sun,
  Monitor,
  Type,
  Languages,
  Eye,
  PaintBucket,
  Settings2,
  Check,
  Loader2
} from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { toast } from "react-hot-toast"

function AppearanceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {Array(2).fill(null).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array(3).fill(null).map((_, j) => (
                <div key={j} className="flex justify-between items-center">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ThemePreview({ theme }) {
  return (
    <div className={`rounded-lg border p-4 ${theme === 'DARK' ? 'bg-zinc-950' : 'bg-white'}`}>
      <div className="space-y-2">
        <div className={`h-2 w-16 rounded ${theme === 'DARK' ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
        <div className={`h-2 w-12 rounded ${theme === 'DARK' ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
        <div className={`h-2 w-14 rounded ${theme === 'DARK' ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
      </div>
    </div>
  )
}

export default function AppearancePage() {
  const { user, updatePreferences } = useAuth()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const preferences = user?.preferences?.[0] || {}

  const [settings, setSettings] = useState({
    isDarkModeEnabled: preferences.isDarkModeEnabled || false,
    fontSize: preferences.fontSize || "medium",
    highContrastMode: preferences.highContrastMode || false,
    contentLanguage: preferences.contentLanguage || "EN",
  })

  useEffect(() => {
    if (user) {
      setLoading(false)
    }
  }, [user])

  if (loading) return <AppearanceSkeleton />

  const handleChange = async (key, value) => {
    setSaving(true)
    try {
      setSettings(prev => ({ ...prev, [key]: value }))
      await updatePreferences({ ...preferences, [key]: value })
      toast.success("Appearance updated")
    } catch (error) {
      toast.error("Failed to update appearance")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleThemeChange = async (newTheme) => {
    setSaving(true)
    try {
      await setTheme(newTheme)
      toast.success("Theme updated")
    } catch (error) {
      toast.error("Failed to update theme")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize how the application looks and feels
        </p>
      </div>
      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>
              Choose your preferred color theme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => handleThemeChange("light")}
                className={`relative rounded-lg border p-2 transition-all hover:border-primary ${
                  theme === "light" ? "border-primary" : ""
                }`}
              >
                <ThemePreview theme="light" />
                <span className="mt-2 flex items-center justify-center text-sm font-medium">
                  Light
                  {theme === "light" && (
                    <Check className="ml-1 h-4 w-4 text-primary" />
                  )}
                </span>
              </button>

              <button
                onClick={() => handleThemeChange("dark")}
                className={`relative rounded-lg border p-2 transition-all hover:border-primary ${
                  theme === "dark" ? "border-primary" : ""
                }`}
              >
                <ThemePreview theme="dark" />
                <span className="mt-2 flex items-center justify-center text-sm font-medium">
                  Dark
                  {theme === "dark" && (
                    <Check className="ml-1 h-4 w-4 text-primary" />
                  )}
                </span>
              </button>

              <button
                onClick={() => handleThemeChange("system")}
                className={`relative rounded-lg border p-2 transition-all hover:border-primary ${
                  theme === "system" ? "border-primary" : ""
                }`}
              >
                <div className="flex h-16 items-center justify-center">
                  <Monitor className="h-8 w-8 text-muted-foreground" />
                </div>
                <span className="mt-2 flex items-center justify-center text-sm font-medium">
                  System
                  {theme === "system" && (
                    <Check className="ml-1 h-4 w-4 text-primary" />
                  )}
                </span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center text-sm">
                  <Monitor className="mr-2 h-4 w-4" />
                  System Theme
                </div>
                <div className="text-xs text-muted-foreground">
                  Follow system dark mode settings
                </div>
              </div>
              <Switch
                checked={settings.isDarkModeEnabled}
                onCheckedChange={(checked) => handleChange('isDarkModeEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Display</CardTitle>
            <CardDescription>
              Customize your viewing experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Font Size
              </Label>
              <Select
                value={settings.fontSize}
                onValueChange={(value) => handleChange('fontSize', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center text-sm">
                  <Eye className="mr-2 h-4 w-4" />
                  High Contrast
                </div>
                <div className="text-xs text-muted-foreground">
                  Increase contrast for better visibility
                </div>
              </div>
              <Switch
                checked={settings.highContrastMode}
                onCheckedChange={(checked) => handleChange('highContrastMode', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                Content Language
              </Label>
              <Select
                value={settings.contentLanguage}
                onValueChange={(value) => handleChange('contentLanguage', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN">English</SelectItem>
                  <SelectItem value="ES">Spanish</SelectItem>
                  <SelectItem value="FR">French</SelectItem>
                  <SelectItem value="DE">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {saving && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving changes...
        </div>
      )}
    </div>
  )
} 