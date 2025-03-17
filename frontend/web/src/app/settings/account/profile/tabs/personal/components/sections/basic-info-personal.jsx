import React, { useState, useMemo, useCallback, useEffect } from 'react'
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
import toast from "react-hot-toast"

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
  const [localFormValues, setLocalFormValues] = useState(formValues)
  const [dataInitialized, setDataInitialized] = useState(false)

  // Initialize local form values when props change
  useEffect(() => {
    try {
      if (formValues && Object.keys(formValues).length > 0) {
        setLocalFormValues(formValues)
        setDataInitialized(true)
      }
    } catch (error) {
      console.error("Error initializing form values:", error)
    }
  }, [formValues])

  // Handle local form changes
  const handleLocalChange = useCallback((field, value) => {
    try {
      // Update local state
      setLocalFormValues(prev => ({
        ...prev,
        [field]: value
      }))
      
      // Propagate change to parent component
      handleChange(field, value)
    } catch (error) {
      console.error(`Error updating ${field}:`, error)
      toast.error(`Failed to update ${field}`)
    }
  }, [handleChange])

  // Memoize the submit handler for better performance
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      // Validate required fields
      if (!localFormValues.firstName) {
        toast.error("First name is required")
        return
      }

      // Extract combined fields
      const combinedData = {
        // Basic info fields
        firstName: localFormValues.firstName,
        middleName: localFormValues.middleName,
        lastName: localFormValues.lastName,
        nickName: localFormValues.nickName,
        dateOfBirth: localFormValues.dateOfBirth,
        genderIdentity: localFormValues.genderIdentity,
        description: localFormValues.description,
        age: localFormValues.age,
        isDeceased: localFormValues.isDeceased,
        
        // Personal details fields
        maritalStatus: localFormValues.maritalStatus,
        bloodGroup: localFormValues.bloodGroup,
        occupation: localFormValues.occupation,
        religion: localFormValues.religion,
        hobbies: localFormValues.hobbies,
        additionalInfo: localFormValues.additionalInfo,
      }

      await handleSave('basic-personal', combinedData)
    } catch (error) {
      console.error("Error saving information:", error)
      toast.error("Failed to save information")
    } finally {
      setSaving(false)
    }
  }, [localFormValues, handleSave])

  // Memoize the basic info fields for better performance
  const BasicInfoFields = useMemo(() => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <InputWithIcon
          icon={User}
          label="First Name"
          value={localFormValues.firstName || ''}
          onChange={(e) => handleLocalChange('firstName', e.target.value)}
          placeholder="Enter first name"
          required
        />
        <InputWithIcon
          icon={User}
          label="Middle Name"
          value={localFormValues.middleName || ''}
          onChange={(e) => handleLocalChange('middleName', e.target.value)}
          placeholder="Enter middle name"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <InputWithIcon
          icon={User}
          label="Last Name"
          value={localFormValues.lastName || ''}
          onChange={(e) => handleLocalChange('lastName', e.target.value)}
          placeholder="Enter last name"
        />
        <InputWithIcon
          icon={User}
          label="Nickname"
          value={localFormValues.nickName || ''}
          onChange={(e) => handleLocalChange('nickName', e.target.value)}
          placeholder="Enter nickname"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid w-full items-center gap-1.5">
          <label htmlFor="date-of-birth" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
            Gender
          </label>
          <Select 
            value={localFormValues.genderIdentity || ''} 
            onValueChange={(value) => handleLocalChange('genderIdentity', value)}
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
  ), [localFormValues, date, onDateSelect, handleLocalChange])

  // Memoize the personal details fields for better performance
  const PersonalDetailsFields = useMemo(() => (
    <div className="space-y-4 mt-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid w-full items-center gap-1.5">
          <label htmlFor="marital-status" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Marital Status
          </label>
          <Select 
            value={localFormValues.maritalStatus || ''} 
            onValueChange={(value) => handleLocalChange('maritalStatus', value)}
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
        <InputWithIcon
          icon={Activity}
          label="Occupation"
          value={localFormValues.occupation || ''}
          onChange={(e) => handleLocalChange('occupation', e.target.value)}
          placeholder="Enter occupation"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <InputWithIcon
          icon={Book}
          label="Religion"
          value={localFormValues.religion || ''}
          onChange={(e) => handleLocalChange('religion', e.target.value)}
          placeholder="Enter religion"
        />
        <InputWithIcon
          icon={Heart}
          label="Hobbies"
          value={localFormValues.hobbies || ''}
          onChange={(e) => handleLocalChange('hobbies', e.target.value)}
          placeholder="Enter hobbies"
        />
      </div>
      
      <div className="grid w-full items-center gap-1.5">
        <label htmlFor="additional-info" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Additional Information
        </label>
        <textarea
          id="additional-info"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={localFormValues.additionalInfo || ''}
          onChange={(e) => handleLocalChange('additionalInfo', e.target.value)}
          placeholder="Enter any additional information"
        />
      </div>
    </div>
  ), [localFormValues, handleLocalChange])

  // Memoize the save button for better performance
  const SaveButton = useMemo(() => (
    <div className="flex justify-end mt-6">
      <Button 
        type="submit" 
        disabled={saving || loading || !dataInitialized}
        className="w-fit"
      >
        {(saving || loading) && (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        )}
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  ), [saving, loading, dataInitialized])

  // If data is not yet initialized, show a loading message
  if (!dataInitialized && !localFormValues.firstName) {
    return <div className="py-4">Loading personal information...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">Basic Information</h3>
      {BasicInfoFields}
      
      <h3 className="text-lg font-medium mt-6">Personal Details</h3>
      {PersonalDetailsFields}
      
      {SaveButton}
    </form>
  )
}
