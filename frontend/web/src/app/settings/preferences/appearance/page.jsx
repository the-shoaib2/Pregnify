import { useState, useEffect } from "react"
import { useSettings } from "@/contexts/settings-context"
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
  Layout,
  Eye,
  PaintBucket,
  Settings2,
  Check,
  Loader2,
  Palette,
  Maximize,
  Layers,
  Grid
} from "lucide-react"

function AppearanceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {Array(3).fill(null).map((_, i) => (
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

export default function AppearancePage() {
  const { getSectionSettings, updateSettings, isSectionLoading, saving } = useSettings()
  const appearanceSettings = getSectionSettings('appearance')
  const isLoading = isSectionLoading('appearance')

  const [settings, setSettings] = useState({
    theme: 'system',
    colorScheme: 'default',
    fontSize: 'medium',
    fontFamily: 'inter',
    reducedMotion: false,
    animationSpeed: 'normal',
    borderRadius: 'medium',
    density: 'comfortable',
    contrastLevel: 'normal',
    customAccentColor: '#0091ff',
    layoutDensity: 'comfortable',
    sidebarBehavior: 'sticky',
    menuAnimation: true,
    showScrollbar: true,
    useSystemAccentColor: false,
    enableBackgroundBlur: true,
    enableSmoothScrolling: true,
    preferReducedData: false,
    enableParallaxEffects: true,
  })

  useEffect(() => {
    if (appearanceSettings) {
      setSettings(appearanceSettings)
    }
  }, [appearanceSettings])

  const handleChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    try {
      await updateSettings('appearance', newSettings)
    } catch (error) {
      // Revert on error
      setSettings(settings)
    }
  }

  if (isLoading) {
    return <AppearanceSkeleton />
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
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Theme & Colors</CardTitle>
            </div>
            <CardDescription>
              Customize the visual theme of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Color Scheme</Label>
              <Select 
                value={settings.colorScheme}
                onValueChange={(value) => handleChange('colorScheme', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color scheme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="contrast">High Contrast</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={settings.customAccentColor}
                  onChange={(e) => handleChange('customAccentColor', e.target.value)}
                  className="h-10 w-20 rounded border bg-transparent"
                />
                <Switch
                  checked={settings.useSystemAccentColor}
                  onCheckedChange={(checked) => handleChange('useSystemAccentColor', checked)}
                />
                <span className="text-sm text-muted-foreground">Use system accent color</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Select 
                value={settings.theme}
                onValueChange={(value) => handleChange('theme', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Choose theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Typography Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              <CardTitle>Typography</CardTitle>
            </div>
            <CardDescription>
              Customize text appearance and readability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select 
                value={settings.fontFamily}
                onValueChange={(value) => handleChange('fontFamily', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="roboto">Roboto</SelectItem>
                  <SelectItem value="system">System Default</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select 
                value={settings.fontSize}
                onValueChange={(value) => handleChange('fontSize', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
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
                <Label>Font Contrast</Label>
                <p className="text-sm text-muted-foreground">
                  Adjust text contrast for better readability
                </p>
              </div>
              <Select 
                value={settings.contrastLevel}
                onValueChange={(value) => handleChange('contrastLevel', value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select contrast" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Layout Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              <CardTitle>Layout & Density</CardTitle>
            </div>
            <CardDescription>
              Customize the layout and spacing of elements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Layout Density</Label>
              <Select 
                value={settings.layoutDensity}
                onValueChange={(value) => handleChange('layoutDensity', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select density" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Border Radius</Label>
              <Select 
                value={settings.borderRadius}
                onValueChange={(value) => handleChange('borderRadius', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sidebar Behavior</Label>
                <p className="text-sm text-muted-foreground">
                  Choose how the sidebar behaves
                </p>
              </div>
              <Select 
                value={settings.sidebarBehavior}
                onValueChange={(value) => handleChange('sidebarBehavior', value)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Select behavior" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="floating">Floating</SelectItem>
                  <SelectItem value="sticky">Sticky</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Animation & Effects */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              <CardTitle>Animation & Effects</CardTitle>
            </div>
            <CardDescription>
              Configure motion and visual effects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reduced Motion</Label>
                <p className="text-sm text-muted-foreground">
                  Minimize non-essential animations
                </p>
              </div>
              <Switch
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => handleChange('reducedMotion', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Menu Animations</Label>
                <p className="text-sm text-muted-foreground">
                  Enable smooth menu transitions
                </p>
              </div>
              <Switch
                checked={settings.menuAnimation}
                onCheckedChange={(checked) => handleChange('menuAnimation', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Background Blur</Label>
                <p className="text-sm text-muted-foreground">
                  Enable backdrop blur effects
                </p>
              </div>
              <Switch
                checked={settings.enableBackgroundBlur}
                onCheckedChange={(checked) => handleChange('enableBackgroundBlur', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Parallax Effects</Label>
                <p className="text-sm text-muted-foreground">
                  Enable subtle parallax scrolling
                </p>
              </div>
              <Switch
                checked={settings.enableParallaxEffects}
                onCheckedChange={(checked) => handleChange('enableParallaxEffects', checked)}
              />
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