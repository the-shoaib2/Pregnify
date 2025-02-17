import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { 
  Phone,
  Home,
  Building,
  Globe,
  Save,
  Loader2
} from "lucide-react"
import { InputWithIcon } from "@/components/input-with-icon"

export default function ContactTab({ user, formData, handleChange, handleSave, settingsLoading }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>
          Your contact details and addresses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <InputWithIcon
          icon={Phone}
          label="Phone Number"
          type="tel"
          value={formData.personal.contactNumber}
          onChange={(e) => handleChange('personal', 'contactNumber', e.target.value)}
        />

        <InputWithIcon
          icon={Home}
          label="Current Address"
          value={formData.personal.presentAddress}
          onChange={(e) => handleChange('personal', 'presentAddress', e.target.value)}
        />

        <InputWithIcon
          icon={Building}
          label="Permanent Address"
          value={formData.personal.permanentAddress}
          onChange={(e) => handleChange('personal', 'permanentAddress', e.target.value)}
        />

        <InputWithIcon
          icon={Globe}
          label="Nationality"
          value={formData.personal.nationality}
          onChange={(e) => handleChange('personal', 'nationality', e.target.value)}
        />
      </CardContent>
      <CardFooter className="flex justify-end space-x-4">
        <div className="flex items-center text-sm text-muted-foreground">
          {settingsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {settingsLoading ? "Saving changes..." : "All changes saved"}
        </div>
        <Button 
          onClick={() => handleSave(formData)}
          disabled={settingsLoading}
        >
          {settingsLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 