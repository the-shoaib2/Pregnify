import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { InputWithIcon } from "@/components/input-with-icon"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  User,
  CalendarIcon,
  Briefcase,
  GraduationCap,
  Languages,
  Save,
  Loader,
} from "lucide-react"
import { cn } from "@/lib/utils"

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' }
]

export default function PersonalTab({ user, formData, handleChange, handleSave, settingsLoading }) {
  const [date, setDate] = useState(formData.personal.dateOfBirth ? new Date(formData.personal.dateOfBirth) : null)

  console.log(formData)

  const handleDateSelect = (newDate) => {
    setDate(newDate)
    handleChange('personal', 'dateOfBirth', format(newDate, 'yyyy-MM-dd'))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Your personal details and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Basic Details
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <InputWithIcon
              icon={User}
              label="First Name"
              value={formData.personal.firstName}
              onChange={(e) => handleChange('personal', 'firstName', e.target.value)}
              placeholder={user.firstName}
            />
            <InputWithIcon
              icon={User}
              label="Last Name"
              value={formData.personal.lastName}
              onChange={(e) => handleChange('personal', 'lastName', e.target.value)}
              placeholder={user.lastName}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Date of Birth with Calendar */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                Date of Birth
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : formData.personal.dateOfBirth ? format(new Date(formData.personal.dateOfBirth), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Gender Select */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Gender
              </Label>
              <Select
                value={formData.personal.genderIdentity}
                onValueChange={(value) => handleChange('personal', 'genderIdentity', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Additional Details</h3>
          <div className="grid gap-4">
            <InputWithIcon
              icon={Briefcase}
              label="Occupation"
              value={formData.personal.occupation}
              onChange={(e) => handleChange('personal', 'occupation', e.target.value)}
            />
            <InputWithIcon
              icon={GraduationCap}
              label="Education"
              value={formData.personal.education}
              onChange={(e) => handleChange('personal', 'education', e.target.value)}
            />
            <InputWithIcon
              icon={Languages}
              label="Preferred Language"
              value={formData.personal.language}
              onChange={(e) => handleChange('personal', 'language', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-4">
        <Button 
          onClick={() => handleSave(formData)}
          disabled={settingsLoading}
        >
          {settingsLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
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