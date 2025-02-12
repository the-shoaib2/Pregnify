import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Languages, Globe, Check } from "lucide-react"

const languages = [
  { code: "en", name: "English", region: "United States" },
  { code: "es", name: "Spanish", region: "Spain" },
  { code: "fr", name: "French", region: "France" },
  { code: "de", name: "German", region: "Germany" },
  { code: "it", name: "Italian", region: "Italy" },
  { code: "pt", name: "Portuguese", region: "Portugal" },
  { code: "ru", name: "Russian", region: "Russia" },
  { code: "zh", name: "Chinese", region: "China" },
  { code: "ja", name: "Japanese", region: "Japan" },
  { code: "ko", name: "Korean", region: "South Korea" }
]

export default function LanguagePage() {
  const { user } = useAuth()
  const [selectedLanguage, setSelectedLanguage] = useState(user?.preferences?.language || "en")

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">Language Settings</h3>
        <p className="text-sm text-muted-foreground">
          Choose your preferred language and region settings
        </p>
      </div>
      <Separator />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              <CardTitle>Display Language</CardTitle>
            </div>
            <CardDescription>
              Select the language you want to use across the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Language</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center justify-between">
                        <span>{lang.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ({lang.region})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Translation</div>
                <div className="text-sm text-muted-foreground">
                  Automatically translate content when available
                </div>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <CardTitle>Regional Settings</CardTitle>
            </div>
            <CardDescription>
              Configure your regional preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select defaultValue="MM/DD/YYYY">
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY/MM/DD">YYYY/MM/DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Format</Label>
              <Select defaultValue="12">
                <SelectTrigger>
                  <SelectValue placeholder="Select time format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12-hour</SelectItem>
                  <SelectItem value="24">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>First Day of Week</Label>
              <Select defaultValue="sunday">
                <SelectTrigger>
                  <SelectValue placeholder="Select first day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunday">Sunday</SelectItem>
                  <SelectItem value="monday">Monday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 