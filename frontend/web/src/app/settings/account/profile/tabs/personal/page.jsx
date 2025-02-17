import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { InputWithIcon } from "@/components/input-with-icon"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { 
  User,
  Calendar,
  Briefcase,
  GraduationCap,
  Languages,
  Save,
  Loader2,
} from "lucide-react"


export default function PersonalTab({ user, formData, handleChange, handleSave, settingsLoading }) {
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
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Date of Birth
              </Label>
              <Input 
                type="date" 
                value={formData.personal.dateOfBirth}
                onChange={(e) => handleChange('personal', 'dateOfBirth', e.target.value)}
              />
            </div>
            <InputWithIcon
              icon={User}
              label="Gender"
              value={formData.personal.genderIdentity}
              onChange={(e) => handleChange('personal', 'genderIdentity', e.target.value)}
            />
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