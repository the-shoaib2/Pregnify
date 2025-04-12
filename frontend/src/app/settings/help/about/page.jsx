import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Info, Shield, Heart, Award } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">About Pregnify</h3>
        <p className="text-sm text-muted-foreground">
          Learn more about our mission and values.
        </p>
      </div>
      <Separator />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
            <CardDescription>
              Supporting mothers through their pregnancy journey.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-start gap-4">
              <Heart className="mt-1 h-5 w-5 text-primary" />
              <div className="grid gap-1">
                <div className="font-medium">Empowering Mothers</div>
                <div className="text-sm text-muted-foreground">
                  We provide tools and resources to help mothers make informed decisions about their pregnancy journey.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Version Information</CardTitle>
            <CardDescription>
              Current version and release details.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Updated</span>
              <span className="text-sm font-medium">March 15, 2024</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Legal Information</CardTitle>
            <CardDescription>
              Important legal documents and policies.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <a href="/legal/terms" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline">
              <Shield className="h-4 w-4" />
              Terms of Service
            </a>
            <a href="/legal/privacy" className="flex items-center gap-2 text-sm text-muted-foreground hover:underline">
              <Shield className="h-4 w-4" />
              Privacy Policy
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 