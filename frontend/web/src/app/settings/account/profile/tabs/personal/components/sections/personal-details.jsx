import React, { useState } from 'react'
import { InputWithIcon } from "@/components/input-with-icon"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Heart, 
  Book,
  Activity,
  FileText,
  Save,
  Loader,
} from "lucide-react"

export default function PersonalDetailsSection({
  formValues,
  handleChange,
  handleSave,
  maritalStatusOptions,
  bloodGroups,
  loading
}) {
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      // Extract personal details fields
      const personalDetails = {
        maritalStatus: formValues.maritalStatus,
        bloodGroup: formValues.bloodGroup,
        occupation: formValues.occupation,
        religion: formValues.religion,
        hobbies: formValues.hobbies,
        additionalInfo: formValues.additionalInfo,
      }

      await handleSave('personal-details', personalDetails)
    } catch (error) {
      console.error("Error saving personal details:", error)
      throw new Error("Failed to save personal details")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid w-full items-center gap-1.5">
          <label htmlFor="marital-status" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Marital Status
          </label>
          <Select 
            value={formValues.maritalStatus} 
            onValueChange={(value) => handleChange('maritalStatus', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select marital status" />
            </SelectTrigger>
            <SelectContent>
              {maritalStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid w-full items-center gap-1.5">
          <label htmlFor="blood-group" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Blood Group
          </label>
          <Select 
            value={formValues.bloodGroup} 
            onValueChange={(value) => handleChange('bloodGroup', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent>
              {bloodGroups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <InputWithIcon
          icon={Activity}
          label="Occupation"
          value={formValues.occupation}
          onChange={(e) => handleChange('occupation', e.target.value)}
          placeholder="Enter occupation"
        />
        <InputWithIcon
          icon={Heart}
          label="Religion"
          value={formValues.religion}
          onChange={(e) => handleChange('religion', e.target.value)}
          placeholder="Enter religion"
        />
        <InputWithIcon
          icon={Book}
          label="Hobbies"
          value={formValues.hobbies}
          onChange={(e) => handleChange('hobbies', e.target.value)}
          placeholder="Enter hobbies (comma separated)"
        />
        <InputWithIcon
          icon={FileText}
          label="Additional Information"
          value={formValues.additionalInfo}
          onChange={(e) => handleChange('additionalInfo', e.target.value)}
          placeholder="Any additional information"
        />
      </div>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={saving || loading}
          className="w-fit"
        >
          {(saving || loading) && (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </form>
  )
}
