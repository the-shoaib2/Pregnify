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
  X,
  Copy,
  Building2,
  Briefcase,
  Clock,
  Languages as LanguagesIcon,
  Code,
  Bookmark,
  PlusCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"
import { SettingsService } from '@/services/settings/account/personal'
import { Switch } from "@/components/ui/switch"
import { TagInput } from '@/components/ui/tag-input'
import { debounce } from 'lodash'
import { FormSectionSkeleton } from "../skeleton"


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

const RELIGION_OPTIONS = [
  { value: 'HINDUISM', label: 'Hinduism' },
  { value: 'ISLAM', label: 'Islam' },
  { value: 'CHRISTIANITY', label: 'Christianity' },
  { value: 'SIKHISM', label: 'Sikhism' },
  { value: 'BUDDHISM', label: 'Buddhism' },
  { value: 'JAINISM', label: 'Jainism' },
  { value: 'JUDAISM', label: 'Judaism' },
  { value: 'OTHER', label: 'Other' },
  { value: 'NONE', label: 'None' }
]

// Helper function to initialize form values properly
const initializeFormValues = (rawFormValues) => {
  if (!rawFormValues || Object.keys(rawFormValues).length === 0) {
    return {
      firstName: '',
      middleName: '',
      lastName: '',
      nickName: '',
      genderIdentity: '',
      age: '',
      contactNumber: '',
      maritalStatus: '',
      bloodGroup: '',
      religion: '',
      hobbies: [],
      languages: [],
      skills: [],
    }
  }

  // Clone the raw form values
  const parsedValues = { ...rawFormValues }

  // Ensure object properties exist
  parsedValues.occupation = parsedValues.occupation || {}

  // Handle additional info
  try {
    if (typeof parsedValues.additionalInfo === 'string' && parsedValues.additionalInfo) {
      const additionalInfo = JSON.parse(parsedValues.additionalInfo)
      parsedValues.languages = additionalInfo.languages || []
      parsedValues.skills = additionalInfo.skills || []
    } else if (typeof parsedValues.additionalInfo === 'object' && parsedValues.additionalInfo) {
      parsedValues.languages = parsedValues.additionalInfo.languages || []
      parsedValues.skills = parsedValues.additionalInfo.skills || []
    } else {
      parsedValues.languages = []
      parsedValues.skills = []
    }
  } catch (error) {
    console.error("Error parsing additionalInfo:", error)
    parsedValues.languages = []
    parsedValues.skills = []
  }

  // Handle hobbies
  if (!Array.isArray(parsedValues.hobbies)) {
    parsedValues.hobbies = parsedValues.hobbies?.split(',').filter(Boolean) || []
  }

  return parsedValues
}

// Format data for API submission
const formatDataForAPI = (data, dateValue) => {
  return {
    firstName: data.firstName,
    middleName: data.middleName,
    lastName: data.lastName,
    nickName: data.nickName,
    genderIdentity: data.genderIdentity,
    dateOfBirth: dateValue ? format(dateValue, "yyyy-MM-dd") : null,
    age: data.age,
    description: data.description,
    contactNumber: data.contactNumber,
    maritalStatus: data.maritalStatus,
    bloodGroup: data.bloodGroup,
    occupation: {
      title: data.occupation?.title || '',
      company: data.occupation?.company || '',
      experience: data.occupation?.experience || ''
    },
    religion: data.religion,
    hobbies: Array.isArray(data.hobbies)
      ? data.hobbies
      : data.hobbies?.split(',').filter(Boolean) || [],
    additionalInfo: {
      languages: data.languages || [],
      skills: data.skills || []
    }
  }
}



export default function BasicInfoPersonalSection({
  formValues,
  handleChange,
  handleSave,
  date,
  onDateSelect,
  loading
}) {
  // Initialize states with proper values immediately
  const [saving, setSaving] = useState(false)
  const [localFormValues, setLocalFormValues] = useState(() => initializeFormValues(formValues))
  const [autoSave, setAutoSave] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Create a debounced save function - will be recreated only when autoSave changes
  const debouncedSave = useCallback(
    debounce(async (data, dateValue) => {
      try {
        if (!data) return

        setSaving(true)
        const formattedData = formatDataForAPI(data, dateValue)
        await SettingsService.updateBasicInfo(formattedData)
        toast.success("Changes auto-saved")
      } catch (error) {
        console.error("Auto-save error:", error)
        toast.error("Auto-save failed")
      } finally {
        setSaving(false)
      }
    }, 2000),
    [autoSave]
  )

  // Handle local form changes with optimized logic
  const handleLocalChange = useCallback((field, value) => {
    try {
      let updatedValues

      // Handle nested objects like address
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        updatedValues = prevValues => {
          const updatedParent = {
            ...(prevValues[parent] || {}),
            [child]: value
          }

          return {
            ...prevValues,
            [parent]: updatedParent
          }
        }
      } else {
        // Update simple fields
        updatedValues = prevValues => ({
          ...prevValues,
          [field]: value
        })
      }

      // Update local state
      setLocalFormValues(prevValues => {
        const newValues = typeof updatedValues === 'function'
          ? updatedValues(prevValues)
          : { ...prevValues, ...updatedValues }

        // Set unsaved changes to true
        setHasUnsavedChanges(true)

        // Propagate change to parent component
        handleChange(field, value)

        // Trigger auto-save if enabled
        if (autoSave && newValues) {
          debouncedSave(newValues, date)
        }

        return newValues
      })
    } catch (error) {
      console.error(`Error updating ${field}:`, error)
      toast.error(`Failed to update ${field}`)
    }
  }, [handleChange, autoSave, date, debouncedSave])

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      // Format and submit the data
      const formattedData = formatDataForAPI(localFormValues, date)
      const response = await SettingsService.updateBasicInfo(formattedData)
      if (response.success) {
        toast.success("Updated successfully")
        setHasUnsavedChanges(false)
      } else {
        toast.error("Failed to save information")
      }
    } catch (error) {
      console.error("Error saving information:", error)
      toast.error("Failed to save information")
    } finally {
      setSaving(false)
    }
  }, [localFormValues, date])

  // Memoize the basic info fields
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

      <div className="grid gap-4 md:grid-cols-2">
        <InputWithIcon
          icon={User}
          label="Contact Number"
          value={localFormValues.contactNumber || ''}
          onChange={(e) => handleLocalChange('contactNumber', e.target.value)}
          placeholder="Enter contact number"
        />
        <div className="grid w-full items-center gap-1.5">
          <label htmlFor="description" className="text-sm font-medium leading-none">
            Description
          </label>
          <input
            id="description"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={localFormValues.description || ''}
            onChange={(e) => handleLocalChange('description', e.target.value)}
            placeholder="Enter a brief description"
          />
        </div>
      </div>
    </div>
  ), [localFormValues, date, onDateSelect, handleLocalChange])

  // 
  const SkillsAndInterestsSection = ({ localFormValues, handleLocalChange }) => {
    const getArray = (key) => {
      // Ensure we're working with arrays for all tag inputs
      const value = localFormValues[key];
      if (Array.isArray(value)) return value;
      if (!value) return [];
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }

    const handleAddItem = (key, newItem) => {
      handleLocalChange(key, [...getArray(key), newItem])
    }

    const handleRemoveItem = (key, index) => {
      handleLocalChange(key, getArray(key).filter((_, i) => i !== index))
    }

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-muted-foreground" />
          Skills & Interests
        </h4>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <TagInput
            label="Skills"
            icon={Code}
            values={getArray('skills')}
            onAdd={(newSkill) => handleAddItem('skills', newSkill)}
            onRemove={(index) => handleRemoveItem('skills', index)}
            placeholder="Add a skill..."
          />

          <TagInput
            label="Languages"
            icon={LanguagesIcon}
            values={getArray('languages')}
            onAdd={(newLanguage) => handleAddItem('languages', newLanguage)}
            onRemove={(index) => handleRemoveItem('languages', index)}
            placeholder="Add a language..."
          />

          <TagInput
            label="Hobbies"
            icon={Heart}
            values={getArray('hobbies')}
            onAdd={(newHobby) => handleAddItem('hobbies', newHobby)}
            onRemove={(index) => handleRemoveItem('hobbies', index)}
            placeholder="Add a hobby..."
          />
        </div>
      </div>
    )
  }

  // Memoize the personal details fields for better performance
  const PersonalDetailsFields = useMemo(() => (
    <div className="space-y-6 mt-6">
      {/* Marital Status and Religion Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid w-full items-center gap-1.5">
          <label className="text-sm font-medium leading-none flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
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
        <div className="grid w-full items-center gap-1.5">
          <label className="text-sm font-medium leading-none flex items-center gap-2">
            <Book className="h-4 w-4 text-muted-foreground" />
            Religion
          </label>
          <Select
            value={localFormValues.religion || ''}
            onValueChange={(value) => handleLocalChange('religion', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select religion" />
            </SelectTrigger>
            <SelectContent>
              {RELIGION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Occupation Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          Occupation Details
        </h4>
        <div className="grid gap-4 md:grid-cols-3">
          <InputWithIcon
            icon={Briefcase}
            label="Title"
            value={typeof localFormValues.occupation === 'object' ? localFormValues.occupation.title || '' : ''}
            onChange={(e) => handleLocalChange('occupation.title', e.target.value)}
            placeholder="Enter job title"
          />
          <InputWithIcon
            icon={Building2}
            label="Company"
            value={typeof localFormValues.occupation === 'object' ? localFormValues.occupation.company || '' : ''}
            onChange={(e) => handleLocalChange('occupation.company', e.target.value)}
            placeholder="Enter company name"
          />
          <InputWithIcon
            icon={Clock}
            label="Experience"
            value={typeof localFormValues.occupation === 'object' ? localFormValues.occupation.experience || '' : ''}
            onChange={(e) => handleLocalChange('occupation.experience', e.target.value)}
            placeholder="Enter years of experience"
          />
        </div>
      </div>

      {/* Use the separately defined component */}
      <SkillsAndInterestsSection
        localFormValues={localFormValues}
        handleLocalChange={handleLocalChange}
      />
    </div>
  ), [localFormValues, handleLocalChange])

  // Memoize the save button for better performance
  const SaveButton = useMemo(() => (
    <div className="flex justify-between items-center mt-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-save"
            checked={autoSave}
            onCheckedChange={setAutoSave}
          />
          <label
            htmlFor="auto-save"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Auto-save
          </label>
        </div>
        {autoSave && (
          <span className="text-xs text-muted-foreground">
            Changes will auto-save after 2s
          </span>
        )}
      </div>
      <Button
        type="submit"
        disabled={saving || loading || !hasUnsavedChanges}
        className="w-fit"
      >
        {(saving || loading) && (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        )}
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  ), [saving, loading, autoSave, hasUnsavedChanges])

  // If loading, show skeletons instead of the form
  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-8">
        <FormSectionSkeleton columns={2} />
      </div>
    )
  }

  // If no form values available, show a blank space
  if (!localFormValues) {
    return <div className="py-4"></div>
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto space-y-8">
      <div className="space-y-6">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          Basic Information
        </h3>
        {BasicInfoFields}
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Heart className="h-5 w-5 text-muted-foreground" />
          Personal Details
        </h3>
        {PersonalDetailsFields}
      </div>
      {SaveButton}
    </form>
  )
}
