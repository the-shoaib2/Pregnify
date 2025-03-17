import React, { useState, useMemo, useCallback } from 'react'
import { InputWithIcon } from "@/components/input-with-icon"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Heart, 
  Activity,
  Pill,
  AlertCircle,
  FileText,
  Save,
  Loader,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Constants
const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
]

export default function MedicalSection({
  formValues,
  handleChange,
  handleSave,
  loading
}) {
  const [saving, setSaving] = useState(false)

  // Memoize the submit handler for better performance
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      // Extract medical info fields
      const medicalInfo = {
        bloodGroup: formValues.bloodGroup,
        allergies: formValues.allergies,
        chronicConditions: formValues.chronicConditions,
        medications: formValues.medications,
        medicalNotes: formValues.medicalNotes,
      }

      await handleSave('medical', medicalInfo)
    } catch (error) {
      console.error("Error saving medical info:", error)
      throw new Error("Failed to save medical information")
    } finally {
      setSaving(false)
    }
  }, [formValues, handleSave])

  // Memoize the medical fields for better performance
  const MedicalFields = useMemo(() => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
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
          icon={AlertCircle}
          label="Allergies"
          value={formValues.allergies}
          onChange={(e) => handleChange('allergies', e.target.value)}
          placeholder="Enter allergies (if any)"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <InputWithIcon
          icon={Activity}
          label="Chronic Conditions"
          value={formValues.chronicConditions}
          onChange={(e) => handleChange('chronicConditions', e.target.value)}
          placeholder="Enter chronic conditions (if any)"
        />
        <InputWithIcon
          icon={Pill}
          label="Current Medications"
          value={formValues.medications}
          onChange={(e) => handleChange('medications', e.target.value)}
          placeholder="Enter current medications"
        />
      </div>
      
      <div className="grid w-full items-center gap-1.5">
        <label htmlFor="medical-notes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Medical Notes
        </label>
        <Textarea
          id="medical-notes"
          value={formValues.medicalNotes}
          onChange={(e) => handleChange('medicalNotes', e.target.value)}
          placeholder="Enter any additional medical information"
          className="min-h-[100px]"
        />
      </div>
    </div>
  ), [formValues, handleChange])

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
      {MedicalFields}
      {SaveButton}
    </form>
  )
}
