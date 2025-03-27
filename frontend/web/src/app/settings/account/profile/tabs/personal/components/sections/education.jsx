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
  const [yearOfPassing, setYearOfPassing] = useState(() => {
    try {
      // Check if yearOfPassing exists and is valid
      if (localFormValues.yearOfPassing) {
        // Handle different formats of yearOfPassing
        if (typeof localFormValues.yearOfPassing === 'number' || 
            !isNaN(Number(localFormValues.yearOfPassing))) {
          // If it's a year number or numeric string
          const year = Number(localFormValues.yearOfPassing);
          // Make sure it's a reasonable year value
          if (year >= 1900 && year <= 2100) {
            return new Date(year, 0, 1); // January 1st of that year
          }
        } else if (typeof localFormValues.yearOfPassing === 'string') {
          // If it's a date string
          const date = new Date(localFormValues.yearOfPassing);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }
      return null; // Default to null if invalid or missing
    } catch (error) {
      console.error("Error setting up yearOfPassing date:", error);
      return null;
    }
  })
  const [dataInitialized, setDataInitialized] = useState(false)

  // Initialize local form values when props change
  useEffect(() => {
    try {
      if (formValues && Object.keys(formValues).length > 0) {
        setLocalFormValues(formValues)
        
        // Update year of passing if it exists
        if (formValues.yearOfPassing) {
          try {
            if (typeof formValues.yearOfPassing === 'number' || 
                !isNaN(Number(formValues.yearOfPassing))) {
              // If it's a year number or numeric string
              const year = Number(formValues.yearOfPassing);
              // Make sure it's a reasonable year value
              if (year >= 1900 && year <= 2100) {
                setYearOfPassing(new Date(year, 0, 1)); // January 1st of that year
              } else {
                setYearOfPassing(null);
              }
            } else if (typeof formValues.yearOfPassing === 'string') {
              // If it's a date string
              const date = new Date(formValues.yearOfPassing);
              if (!isNaN(date.getTime())) {
                setYearOfPassing(date);
              } else {
                setYearOfPassing(null);
              }
            } else {
              setYearOfPassing(null);
            }
          } catch (error) {
            console.error("Error updating yearOfPassing date:", error);
            setYearOfPassing(null);
          }
        } else {
          setYearOfPassing(null);
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
        <InputWithIcon
          icon={CalendarIcon}
          label="Year of Passing"
          value={localFormValues.yearOfPassing || ''}
          onChange={(e) => {
            // Accept both single year and year range (YYYY-YYYY format)
            const value = e.target.value;
            
            // Allow empty input
            if (value === '') {
              handleLocalChange('yearOfPassing', value);
              return;
            }
            
            // Check if it's a year range (YYYY-YYYY format)
            if (value.includes('-')) {
              const [startYear, endYear] = value.split('-');
              
              // Validate both parts of the range
              if (
                (/^\d{0,4}$/.test(startYear) || startYear === '') && 
                (/^\d{0,4}$/.test(endYear) || endYear === '') &&
                (startYear === '' || parseInt(startYear) <= new Date().getFullYear()) &&
                (endYear === '' || parseInt(endYear) <= new Date().getFullYear()) &&
                (startYear === '' || endYear === '' || parseInt(startYear) <= parseInt(endYear))
              ) {
                handleLocalChange('yearOfPassing', value);
              }
              return;
            }
            
            // For single year input
            if (/^\d{0,4}$/.test(value) && (value === '' || parseInt(value) <= new Date().getFullYear())) {
              handleLocalChange('yearOfPassing', value);
            }
          }}
          placeholder="YYYY or YYYY-YYYY"
        />
      </div>
      <InputWithIcon
        icon={Award}
        label="GPA/Grade"
        value={localFormValues.gpa || ''}
        onChange={(e) => handleLocalChange('gpa', e.target.value)}
        placeholder="Enter GPA or grade"
      />
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
  if (!dataInitialized && !Object.keys(localFormValues).length) {
    return <div className="py-4">Loading education information...</div>
  }

  // At the beginning of your component, add this useEffect for debugging
  useEffect(() => {
    
    // Validate yearOfPassing format
    if (formValues.yearOfPassing) {
      try {
        // If it's being used in a date picker or date-related component
        // Make sure it's a valid date string format (YYYY-MM-DD)
        const yearFormatRegex = /^\d{4}(-\d{2}-\d{2})?$/;
        if (!yearFormatRegex.test(formValues.yearOfPassing)) {
          console.warn("yearOfPassing is not in a valid format:", formValues.yearOfPassing);
          // If it's just a year number, convert it to a valid date format
          if (!isNaN(formValues.yearOfPassing) && formValues.yearOfPassing.length === 4) {
            handleChange('yearOfPassing', `${formValues.yearOfPassing}-01-01`);
          }
        }
      } catch (error) {
        console.error("Error validating yearOfPassing:", error);
      }
    }
  }, [formValues.yearOfPassing]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">Education Information</h3>
      <div className="education-fields-container">
        {EducationFields}
      </div>
      {SaveButton}
    </form>
  )
}
