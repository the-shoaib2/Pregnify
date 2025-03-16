import React, { useState, useMemo, useCallback } from 'react'
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

export default function DocumentsSection({
  formValues,
  handleChange,
  handleSave,
  loading
}) {
  const [saving, setSaving] = useState(false)
  const [expiryDate, setExpiryDate] = useState(() => 
    formValues.passportExpiry ? new Date(formValues.passportExpiry) : null
  )

  // Memoize the submit handler for better performance
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      // Validate required fields
      if (!formValues.passportNumber) {
        throw new Error("Passport number is required")
      }

      // Extract documents info fields
      const documentsInfo = {
        passportNumber: formValues.passportNumber,
        passportExpiry: formValues.passportExpiry,
        citizenship: formValues.citizenship,
        nationality: formValues.nationality,
        placeOfBirth: formValues.placeOfBirth,
        countryOfBirth: formValues.countryOfBirth,
      }

      await handleSave('documents', documentsInfo)
    } catch (error) {
      console.error("Error saving documents info:", error)
      throw new Error("Failed to save documents information")
    } finally {
      setSaving(false)
    }
  }, [formValues, handleSave])

  // Memoize the date select handler for better performance
  const handleExpiryDateSelect = useCallback((newDate) => {
    try {
      setExpiryDate(newDate)
      const formattedDate = format(newDate, 'yyyy-MM-dd')
      handleChange('passportExpiry', formattedDate)
    } catch (error) {
      console.error("Error handling expiry date selection:", error)
      throw new Error("Failed to update passport expiry date")
    }
  }, [handleChange])

  // Memoize the document fields for better performance
  const DocumentFields = useMemo(() => (
    <div className="grid gap-4 md:grid-cols-2">
      <InputWithIcon
        icon={IdCard}
        label="Passport Number"
        value={formValues.passportNumber}
        onChange={(e) => handleChange('passportNumber', e.target.value)}
        required
        placeholder="Enter passport number"
      />
      <div className="grid w-full items-center gap-1.5">
        <label htmlFor="expiry" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Passport Expiry
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
              onSelect={handleExpiryDateSelect}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <InputWithIcon
        icon={Flag}
        label="Citizenship"
        value={formValues.citizenship}
        onChange={(e) => handleChange('citizenship', e.target.value)}
        placeholder="Enter citizenship"
      />
      <InputWithIcon
        icon={Flag}
        label="Nationality"
        value={formValues.nationality}
        onChange={(e) => handleChange('nationality', e.target.value)}
        placeholder="Enter nationality"
      />
      <InputWithIcon
        icon={Flag}
        label="Place of Birth"
        value={formValues.placeOfBirth}
        onChange={(e) => handleChange('placeOfBirth', e.target.value)}
        placeholder="Enter place of birth"
      />
      <InputWithIcon
        icon={Flag}
        label="Country of Birth"
        value={formValues.countryOfBirth}
        onChange={(e) => handleChange('countryOfBirth', e.target.value)}
        placeholder="Enter country of birth"
      />
    </div>
  ), [formValues, expiryDate, handleChange, handleExpiryDateSelect])

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
      {DocumentFields}
      {SaveButton}
    </form>
  )
}
