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

// Create a reusable TagInput component
const TagInput = ({ 
  label, 
  icon: Icon, 
  tags, 
  onAdd, 
  onRemove, 
  placeholder 
}) => (
  <div className="space-y-1.5 w-full">
    <label className="text-sm font-medium leading-none flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </label>
    <div className="flex flex-wrap gap-1.5 p-2 border rounded-md min-h-[42px] bg-background hover:border-primary/50 transition-colors">
      {tags.map((tag, index) => (
        <div 
          key={index}
          className="flex items-center gap-1 bg-primary/5 hover:bg-primary/10 text-primary text-xs px-2 py-1 rounded-md transition-colors group"
        >
          <span>{tag}</span>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <div className="relative flex-1 min-w-[120px]">
        <input
          type="text"
          className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground/60"
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              e.preventDefault();
              onAdd(e.target.value.trim());
              e.target.value = '';
            }
          }}
        />
        <PlusCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
      </div>
    </div>
  </div>
)

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
        // Parse additionalInfo if it's a string
        let parsedFormValues = { ...formValues };
        
        // Handle languages and skills
        if (typeof formValues.additionalInfo === 'string') {
          try {
            const additionalInfo = JSON.parse(formValues.additionalInfo);
            parsedFormValues = {
              ...parsedFormValues,
              languages: additionalInfo.languages || [],
              skills: additionalInfo.skills || []
            };
          } catch (e) {
            console.error("Error parsing additionalInfo:", e);
            parsedFormValues.languages = [];
            parsedFormValues.skills = [];
          }
        } else if (typeof formValues.additionalInfo === 'object') {
          parsedFormValues = {
            ...parsedFormValues,
            languages: formValues.additionalInfo?.languages || [],
            skills: formValues.additionalInfo?.skills || []
          };
        }

        setLocalFormValues(parsedFormValues);
        setDataInitialized(true);
      }
    } catch (error) {
      console.error("Error initializing form values:", error);
    }
  }, [formValues]);

  // Handle local form changes
  const handleLocalChange = useCallback((field, value) => {
    try {
      // Handle nested objects like address
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        setLocalFormValues(prev => ({
          ...prev,
          [parent]: {
            ...(prev[parent] || {}),
            [child]: value
          }
        }))
        
        // Propagate change to parent component
        handleChange(field, value)
        return
      }
      
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

  // Handle form submission
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
        description: localFormValues.description || localFormValues.discription,
        age: localFormValues.age,
        isDeceased: localFormValues.isDeceased,
        
        // Personal details fields
        maritalStatus: localFormValues.maritalStatus,
        bloodGroup: localFormValues.bloodGroup,
        occupation: localFormValues.occupation,
        religion: localFormValues.religion,
        hobbies: localFormValues.hobbies,
        additionalInfo: localFormValues.additionalInfo,
        
        // Contact information
        contactNumber: localFormValues.contactNumber,
        
        // Address information
        address: localFormValues.address || {},
        presentAddress: localFormValues.presentAddress || {},
        permanentAddress: localFormValues.permanentAddress || {},
        
        // Additional Info fields
        languages: localFormValues.languages || [],
        skills: localFormValues.skills || [],
      }

      await handleSave('basic-personal', combinedData)
    } catch (error) {
      console.error("Error saving information:", error)
      toast.error("Failed to save information")
    } finally {
      setSaving(false)
    }
  }, [localFormValues, handleSave])

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
            value={localFormValues.description || localFormValues.discription || ''}
            onChange={(e) => handleLocalChange('description', e.target.value)}
            placeholder="Enter a brief description"
          />
        </div>
      </div>
    </div>
  ), [localFormValues, date, onDateSelect, handleLocalChange])

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
        <InputWithIcon
          icon={Book}
          label="Religion"
          value={localFormValues.religion || ''}
          onChange={(e) => handleLocalChange('religion', e.target.value)}
          placeholder="Enter religion"
        />
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

      {/* Skills, Languages, and Hobbies Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-muted-foreground" />
          Skills & Interests
        </h4>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Skills */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none flex items-center gap-2">
              <Code className="h-4 w-4 text-muted-foreground" />
              Skills
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 border rounded-md min-h-[42px] bg-background">
              {(localFormValues.skills || []).map((skill, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-1 bg-primary/5 hover:bg-primary/10 text-primary text-xs px-2 py-1 rounded-md transition-colors group"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newSkills = localFormValues.skills.filter((_, i) => i !== index);
                      handleLocalChange('skills', newSkills);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div className="relative flex-1 min-w-[120px]">
                <input
                  type="text"
                  className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground/60"
                  placeholder="Add a skill..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      e.preventDefault();
                      const newSkill = e.target.value.trim();
                      const currentSkills = localFormValues.skills || [];
                      if (!currentSkills.includes(newSkill)) {
                        handleLocalChange('skills', [...currentSkills, newSkill]);
                      }
                      e.target.value = '';
                    }
                  }}
                />
                <PlusCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none flex items-center gap-2">
              <LanguagesIcon className="h-4 w-4 text-muted-foreground" />
              Languages
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 border rounded-md min-h-[42px] bg-background">
              {(localFormValues.languages || []).map((language, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-1 bg-primary/5 hover:bg-primary/10 text-primary text-xs px-2 py-1 rounded-md transition-colors group"
                >
                  <span>{language}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newLanguages = localFormValues.languages.filter((_, i) => i !== index);
                      handleLocalChange('languages', newLanguages);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div className="relative flex-1 min-w-[120px]">
                <input
                  type="text"
                  className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground/60"
                  placeholder="Add a language..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      e.preventDefault();
                      const newLanguage = e.target.value.trim();
                      const currentLanguages = localFormValues.languages || [];
                      if (!currentLanguages.includes(newLanguage)) {
                        handleLocalChange('languages', [...currentLanguages, newLanguage]);
                      }
                      e.target.value = '';
                    }
                  }}
                />
                <PlusCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
              </div>
            </div>
          </div>

          {/* Hobbies */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              Hobbies
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 border rounded-md min-h-[42px] bg-background">
              {(Array.isArray(localFormValues.hobbies) ? 
                localFormValues.hobbies : 
                localFormValues.hobbies?.split(',').filter(Boolean) || []
              ).map((hobby, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-1 bg-primary/5 hover:bg-primary/10 text-primary text-xs px-2 py-1 rounded-md transition-colors group"
                >
                  <span>{hobby}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newHobbies = (Array.isArray(localFormValues.hobbies) ? 
                        localFormValues.hobbies : 
                        localFormValues.hobbies?.split(',').filter(Boolean) || []
                      ).filter((_, i) => i !== index);
                      handleLocalChange('hobbies', newHobbies);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div className="relative flex-1 min-w-[120px]">
                <input
                  type="text"
                  className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground/60"
                  placeholder="Add a hobby..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      e.preventDefault();
                      const newHobby = e.target.value.trim();
                      const currentHobbies = Array.isArray(localFormValues.hobbies) ? 
                        localFormValues.hobbies : 
                        localFormValues.hobbies?.split(',').filter(Boolean) || [];
                      if (!currentHobbies.includes(newHobby)) {
                        handleLocalChange('hobbies', [...currentHobbies, newHobby]);
                      }
                      e.target.value = '';
                    }
                  }}
                />
                <PlusCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ), [localFormValues, handleLocalChange])

  // Memoize the address fields
  const AddressFields = useMemo(() => (
    <div className="space-y-4 mt-6">
      <h3 className="text-md font-medium">Current Address</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <InputWithIcon
          icon={FileText}
          label="Street"
          value={localFormValues.address?.street || ''}
          onChange={(e) => handleLocalChange('address.street', e.target.value)}
          placeholder="Enter street"
        />
        <InputWithIcon
          icon={FileText}
          label="City"
          value={localFormValues.address?.city || ''}
          onChange={(e) => handleLocalChange('address.city', e.target.value)}
          placeholder="Enter city"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <InputWithIcon
          icon={FileText}
          label="State"
          value={localFormValues.address?.state || ''}
          onChange={(e) => handleLocalChange('address.state', e.target.value)}
          placeholder="Enter state"
        />
        <InputWithIcon
          icon={FileText}
          label="Country"
          value={localFormValues.address?.country || ''}
          onChange={(e) => handleLocalChange('address.country', e.target.value)}
          placeholder="Enter country"
        />
        <InputWithIcon
          icon={FileText}
          label="ZIP Code"
          value={localFormValues.address?.zipCode || ''}
          onChange={(e) => handleLocalChange('address.zipCode', e.target.value)}
          placeholder="Enter ZIP code"
        />
      </div>
      
      <h3 className="text-md font-medium mt-4">Present Address</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <InputWithIcon
          icon={FileText}
          label="Street"
          value={localFormValues.presentAddress?.street || ''}
          onChange={(e) => handleLocalChange('presentAddress.street', e.target.value)}
          placeholder="Enter street"
        />
        <InputWithIcon
          icon={FileText}
          label="City"
          value={localFormValues.presentAddress?.city || ''}
          onChange={(e) => handleLocalChange('presentAddress.city', e.target.value)}
          placeholder="Enter city"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <InputWithIcon
          icon={FileText}
          label="State"
          value={localFormValues.presentAddress?.state || ''}
          onChange={(e) => handleLocalChange('presentAddress.state', e.target.value)}
          placeholder="Enter state"
        />
        <InputWithIcon
          icon={FileText}
          label="Country"
          value={localFormValues.presentAddress?.country || ''}
          onChange={(e) => handleLocalChange('presentAddress.country', e.target.value)}
          placeholder="Enter country"
        />
        <InputWithIcon
          icon={FileText}
          label="ZIP Code"
          value={localFormValues.presentAddress?.zipCode || ''}
          onChange={(e) => handleLocalChange('presentAddress.zipCode', e.target.value)}
          placeholder="Enter ZIP code"
        />
      </div>
      
      <div className="flex items-center justify-between mt-6">
        <h3 className="text-md font-medium">Permanent Address</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => {
            handleLocalChange('permanentAddress', {
              ...localFormValues.presentAddress
            })
          }}
        >
          <Copy className="mr-2 h-3 w-3" />
          Same as Present Address
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <InputWithIcon
          icon={FileText}
          label="Street"
          value={localFormValues.permanentAddress?.street || ''}
          onChange={(e) => handleLocalChange('permanentAddress.street', e.target.value)}
          placeholder="Enter street"
        />
        <InputWithIcon
          icon={FileText}
          label="City"
          value={localFormValues.permanentAddress?.city || ''}
          onChange={(e) => handleLocalChange('permanentAddress.city', e.target.value)}
          placeholder="Enter city"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <InputWithIcon
          icon={FileText}
          label="State"
          value={localFormValues.permanentAddress?.state || ''}
          onChange={(e) => handleLocalChange('permanentAddress.state', e.target.value)}
          placeholder="Enter state"
        />
        <InputWithIcon
          icon={FileText}
          label="Country"
          value={localFormValues.permanentAddress?.country || ''}
          onChange={(e) => handleLocalChange('permanentAddress.country', e.target.value)}
          placeholder="Enter country"
        />
        <InputWithIcon
          icon={FileText}
          label="ZIP Code"
          value={localFormValues.permanentAddress?.zipCode || ''}
          onChange={(e) => handleLocalChange('permanentAddress.zipCode', e.target.value)}
          placeholder="Enter ZIP code"
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
    return <div className="py-4"></div>
  }

  // Add this at the beginning of the component
  useEffect(() => {
    console.log("Basic Info Form Values:", formValues);
  }, [formValues]);

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
      
      {AddressFields}
      
      {SaveButton}
    </form>
  )
}
