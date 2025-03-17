import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { InputWithIcon } from "@/components/input-with-icon"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { 
  IdCard, 
  Flag,
  CalendarIcon,
  Save,
  Loader,
} from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

export default function DocumentsSection({
  formValues,
  handleChange,
  handleSave,
  loading
}) {
  const [saving, setSaving] = useState(false)
  const [localFormValues, setLocalFormValues] = useState(formValues || {})
  const [expiryDate, setExpiryDate] = useState(() => 
    localFormValues.passportExpiry ? new Date(localFormValues.passportExpiry) : null
  )
  const [dataInitialized, setDataInitialized] = useState(false)

  // Initialize local form values when props change
  useEffect(() => {
    try {
      if (formValues && Object.keys(formValues).length > 0) {
        setLocalFormValues(formValues)
        
        // Update expiry date if it exists
        if (formValues.passportExpiry) {
          setExpiryDate(new Date(formValues.passportExpiry))
        }
        
        setDataInitialized(true)
      }
    } catch (error) {
      console.error("Error initializing documents form values:", error)
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
      if (!localFormValues.passportNumber) {
        toast.error("Passport number is required")
        return
      }

      // Extract documents info fields
      const documentsInfo = {
        passportNumber: localFormValues.passportNumber,
        passportExpiry: localFormValues.passportExpiry,
        citizenship: localFormValues.citizenship,
        nationality: localFormValues.nationality,
        placeOfBirth: localFormValues.placeOfBirth,
        countryOfBirth: localFormValues.countryOfBirth,
      }

      await handleSave('documents', documentsInfo)
      toast.success("Document information saved successfully")
    } catch (error) {
      console.error("Error saving document info:", error)
      toast.error("Failed to save document information")
    } finally {
      setSaving(false)
    }
  }, [localFormValues, handleSave])

  // Memoize the date select handler for better performance
  const handleDateSelect = useCallback((newDate) => {
    try {
      setExpiryDate(newDate)
      const formattedDate = newDate ? format(newDate, "yyyy-MM-dd") : null
      handleLocalChange('passportExpiry', formattedDate)
    } catch (error) {
      console.error("Error handling date selection:", error)
      toast.error("Failed to update expiry date")
    }
  }, [handleLocalChange])

  // Memoize the documents fields for better performance
  const DocumentsFields = useMemo(() => (
    <div className="grid gap-4 md:grid-cols-2">
      <InputWithIcon
        icon={IdCard}
        label="Passport Number"
        value={localFormValues.passportNumber || ''}
        onChange={(e) => handleLocalChange('passportNumber', e.target.value)}
        placeholder="Enter passport number"
        required
      />
      <div className="grid w-full items-center gap-1.5">
        <label htmlFor="passport-expiry" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Passport Expiry Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !expiryDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {expiryDate ? format(expiryDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={expiryDate}
              onSelect={handleDateSelect}
              initialFocus
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>
      <InputWithIcon
        icon={Flag}
        label="Citizenship"
        value={localFormValues.citizenship || ''}
        onChange={(e) => handleLocalChange('citizenship', e.target.value)}
        placeholder="Enter citizenship"
      />
      <InputWithIcon
        icon={Flag}
        label="Nationality"
        value={localFormValues.nationality || ''}
        onChange={(e) => handleLocalChange('nationality', e.target.value)}
        placeholder="Enter nationality"
      />
      <InputWithIcon
        icon={Flag}
        label="Place of Birth"
        value={localFormValues.placeOfBirth || ''}
        onChange={(e) => handleLocalChange('placeOfBirth', e.target.value)}
        placeholder="Enter place of birth"
      />
      <InputWithIcon
        icon={Flag}
        label="Country of Birth"
        value={localFormValues.countryOfBirth || ''}
        onChange={(e) => handleLocalChange('countryOfBirth', e.target.value)}
        placeholder="Enter country of birth"
      />
    </div>
  ), [localFormValues, expiryDate, handleLocalChange, handleDateSelect])

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
    return <div className="py-4">Loading document information...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">Document Information</h3>
      {DocumentsFields}
      {SaveButton}
    </form>
  )
}
