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
  GraduationCap, 
  BookOpen,
  Award,
  School,
  Calendar as CalendarIcon,
  Save,
  Loader,
} from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

export default function EducationSection({
  formValues,
  handleChange,
  handleSave,
  loading
}) {
  const [saving, setSaving] = useState(false)
  const [localFormValues, setLocalFormValues] = useState(formValues || {})
  const [yearOfPassing, setYearOfPassing] = useState(() => 
    localFormValues.yearOfPassing ? new Date(localFormValues.yearOfPassing, 0) : null
  )
  const [dataInitialized, setDataInitialized] = useState(false)

  // Initialize local form values when props change
  useEffect(() => {
    try {
      if (formValues && Object.keys(formValues).length > 0) {
        setLocalFormValues(formValues)
        
        // Update year of passing if it exists
        if (formValues.yearOfPassing) {
          setYearOfPassing(new Date(formValues.yearOfPassing, 0))
        }
        
        setDataInitialized(true)
      }
    } catch (error) {
      console.error("Error initializing education form values:", error)
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
      
      // Extract education info fields
      const educationInfo = {
        degree: localFormValues.degree,
        fieldOfStudy: localFormValues.fieldOfStudy,
        qualification: localFormValues.qualification,
        institution: localFormValues.institution,
        yearOfPassing: localFormValues.yearOfPassing,
        gpa: localFormValues.gpa,
      }

      await handleSave('education', educationInfo)
      toast.success("Education information saved successfully")
    } catch (error) {
      console.error("Error saving education info:", error)
      toast.error("Failed to save education information")
    } finally {
      setSaving(false)
    }
  }, [localFormValues, handleSave])

  // Memoize the year select handler for better performance
  const handleYearSelect = useCallback((newDate) => {
    try {
      setYearOfPassing(newDate)
      const year = newDate.getFullYear()
      handleLocalChange('yearOfPassing', year)
    } catch (error) {
      console.error("Error handling year selection:", error)
      toast.error("Failed to update year of passing")
    }
  }, [handleLocalChange])

  // Memoize the education fields for better performance
  const EducationFields = useMemo(() => (
    <div className="grid gap-4 md:grid-cols-2">
      <InputWithIcon
        icon={GraduationCap}
        label="Degree"
        value={localFormValues.degree || ''}
        onChange={(e) => handleLocalChange('degree', e.target.value)}
        placeholder="Enter degree name"
      />
      <InputWithIcon
        icon={BookOpen}
        label="Field of Study"
        value={localFormValues.fieldOfStudy || ''}
        onChange={(e) => handleLocalChange('fieldOfStudy', e.target.value)}
        placeholder="Enter field of study"
      />
      <InputWithIcon
        icon={Award}
        label="Qualification"
        value={localFormValues.qualification || ''}
        onChange={(e) => handleLocalChange('qualification', e.target.value)}
        placeholder="Enter qualification"
      />
      <InputWithIcon
        icon={School}
        label="Institution"
        value={localFormValues.institution || ''}
        onChange={(e) => handleLocalChange('institution', e.target.value)}
        placeholder="Enter institution name"
      />
      <div className="grid w-full items-center gap-1.5">
        <label htmlFor="year-of-passing" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Year of Passing
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !yearOfPassing && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {yearOfPassing ? format(yearOfPassing, "yyyy") : <span>Select year</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={yearOfPassing}
              onSelect={handleYearSelect}
              initialFocus
              captionLayout="dropdown-buttons"
              fromYear={1950}
              toYear={2030}
              view="year"
            />
          </PopoverContent>
        </Popover>
      </div>
      <InputWithIcon
        icon={Award}
        label="GPA/Grade"
        value={localFormValues.gpa || ''}
        onChange={(e) => handleLocalChange('gpa', e.target.value)}
        placeholder="Enter GPA or grade"
      />
    </div>
  ), [localFormValues, yearOfPassing, handleLocalChange, handleYearSelect])

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
  if (!dataInitialized && !Object.keys(localFormValues).length) {
    return <div className="py-4">Loading education information...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">Education Information</h3>
      {EducationFields}
      {SaveButton}
    </form>
  )
}
