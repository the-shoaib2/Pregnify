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
  GraduationCap, 
  BookOpen,
  Award,
  School,
  Calendar as CalendarIcon,
  Save,
  Loader,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function EducationSection({
  formValues,
  handleChange,
  handleSave,
  loading
}) {
  const [saving, setSaving] = useState(false)
  const [yearOfPassing, setYearOfPassing] = useState(() => 
    formValues.yearOfPassing ? new Date(formValues.yearOfPassing, 0) : null
  )

  // Memoize the submit handler for better performance
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      // Extract education info fields
      const educationInfo = {
        degree: formValues.degree,
        fieldOfStudy: formValues.fieldOfStudy,
        qualification: formValues.qualification,
        institution: formValues.institution,
        yearOfPassing: formValues.yearOfPassing,
        gpa: formValues.gpa,
      }

      await handleSave('education', educationInfo)
    } catch (error) {
      console.error("Error saving education info:", error)
      throw new Error("Failed to save education information")
    } finally {
      setSaving(false)
    }
  }, [formValues, handleSave])

  // Memoize the year select handler for better performance
  const handleYearSelect = useCallback((newDate) => {
    try {
      setYearOfPassing(newDate)
      const year = newDate.getFullYear()
      handleChange('yearOfPassing', year)
    } catch (error) {
      console.error("Error handling year selection:", error)
      throw new Error("Failed to update year of passing")
    }
  }, [handleChange])

  // Memoize the education fields for better performance
  const EducationFields = useMemo(() => (
    <div className="grid gap-4 md:grid-cols-2">
      <InputWithIcon
        icon={GraduationCap}
        label="Degree"
        value={formValues.degree}
        onChange={(e) => handleChange('degree', e.target.value)}
        placeholder="Enter degree name"
      />
      <InputWithIcon
        icon={BookOpen}
        label="Field of Study"
        value={formValues.fieldOfStudy}
        onChange={(e) => handleChange('fieldOfStudy', e.target.value)}
        placeholder="Enter field of study"
      />
      <InputWithIcon
        icon={Award}
        label="Qualification"
        value={formValues.qualification}
        onChange={(e) => handleChange('qualification', e.target.value)}
        placeholder="Enter qualification"
      />
      <InputWithIcon
        icon={School}
        label="Institution"
        value={formValues.institution}
        onChange={(e) => handleChange('institution', e.target.value)}
        placeholder="Enter institution name"
      />
      <div className="grid w-full items-center gap-1.5">
        <label htmlFor="year" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
              {yearOfPassing ? yearOfPassing.getFullYear() : <span>Select year</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={yearOfPassing}
              onSelect={handleYearSelect}
              captionLayout="dropdown-buttons"
              fromYear={1950}
              toYear={new Date().getFullYear() + 5}
              initialFocus
              disabled={(date) => {
                // Only allow selecting January 1st of each year
                return date.getMonth() !== 0 || date.getDate() !== 1
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <InputWithIcon
        icon={Award}
        label="GPA/Grade"
        value={formValues.gpa}
        onChange={(e) => handleChange('gpa', e.target.value)}
        placeholder="Enter GPA or grade"
      />
    </div>
  ), [formValues, yearOfPassing, handleChange, handleYearSelect])

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {EducationFields}
      {SaveButton}
    </form>
  )
}
