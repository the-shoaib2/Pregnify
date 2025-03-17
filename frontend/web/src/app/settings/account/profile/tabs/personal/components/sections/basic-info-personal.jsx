import React, { useState, useMemo, useCallback } from 'react'
import { InputWithIcon } from "@/components/input-with-icon"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { 
  User, 
  CalendarIcon, 
  Save,
  Loader,
  Heart, 
  Book,
  Activity,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Constants
const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' }
]

const MARITAL_STATUS_OPTIONS = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'DIVORCED', label: 'Divorced' },
  { value: 'WIDOWED', label: 'Widowed' }
]

const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
]

export default function BasicInfoPersonalSection({
  formValues,
  handleChange,
  handleSave,
  date,
  onDateSelect,
  loading
}) {
  const [saving, setSaving] = useState(false)

  // Memoize the submit handler for better performance
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      // Validate required fields
      if (!formValues.firstName) {
        throw new Error("First name is required")
      }

      // Extract combined fields
      const combinedData = {
        // Basic info fields
        firstName: formValues.firstName,
        middleName: formValues.middleName,
        lastName: formValues.lastName,
        nickName: formValues.nickName,
        dateOfBirth: formValues.dateOfBirth,
        genderIdentity: formValues.genderIdentity,
        description: formValues.description,
        age: formValues.age,
        isDeceased: formValues.isDeceased,
        
        // Personal details fields
        maritalStatus: formValues.maritalStatus,
        bloodGroup: formValues.bloodGroup,
        occupation: formValues.occupation,
        religion: formValues.religion,
        hobbies: formValues.hobbies,
        additionalInfo: formValues.additionalInfo,
      }

      await handleSave('basic-personal', combinedData)
    } catch (error) {
      console.error("Error saving information:", error)
      throw new Error("Failed to save information")
    } finally {
      setSaving(false)
    }
  }, [formValues, handleSave])

  // Memoize the basic info section for better performance
  const BasicInfoFields = useMemo(() => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Basic Information</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <InputWithIcon
          icon={User}
          label="First Name"
          value={formValues.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          required
        />
        <InputWithIcon
          icon={User}
          label="Middle Name"
          value={formValues.middleName}
          onChange={(e) => handleChange('middleName', e.target.value)}
        />
        <InputWithIcon
          icon={User}
          label="Last Name"
          value={formValues.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
        />
        <InputWithIcon
          icon={User}
          label="Nick Name"
          value={formValues.nickName}
          onChange={(e) => handleChange('nickName', e.target.value)}
        />
        <div className="grid w-full items-center gap-1.5">
          <label htmlFor="dob" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Date of Birth
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={onDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid w-full items-center gap-1.5">
          <label htmlFor="gender" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Gender Identity
          </label>
          <Select 
            value={formValues.genderIdentity} 
            onValueChange={(value) => handleChange('genderIdentity', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  ), [formValues, date, onDateSelect, handleChange])

  // Memoize the personal details section for better performance
  const PersonalDetailsFields = useMemo(() => (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-lg font-medium">Personal Details</h3>
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
              {MARITAL_STATUS_OPTIONS.map((option) => (
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
              {BLOOD_GROUPS.map((group) => (
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
    </div>
  ), [formValues, handleChange, MARITAL_STATUS_OPTIONS, BLOOD_GROUPS])

  // Memoize the save button for better performance
  const SaveButton = useMemo(() => (
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
  ), [saving, loading])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {BasicInfoFields}
      {PersonalDetailsFields}
      {SaveButton}
    </form>
  )
}
