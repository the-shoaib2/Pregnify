import React, { useState } from 'react'
import { InputWithIcon } from "@/components/input-with-icon"
import { Button } from "@/components/ui/button"
import { 
  Phone, 
  Home, 
  Building2,
  Save,
  Loader,
} from "lucide-react"

export default function ContactSection({
  formValues,
  handleChange,
  handleSave,
  loading
}) {
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      // Validate required fields
      if (!formValues.contactNumber) {
        throw new Error("Contact number is required")
      }

      // Extract contact info fields
      const contactInfo = {
        contactNumber: formValues.contactNumber,
        address: formValues.address,
        presentAddress: formValues.presentAddress,
        permanentAddress: formValues.permanentAddress,
      }

      await handleSave('contact', contactInfo)
    } catch (error) {
      console.error("Error saving contact info:", error)
      throw new Error("Failed to save contact information")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <InputWithIcon
          icon={Phone}
          label="Contact Number"
          value={formValues.contactNumber}
          onChange={(e) => handleChange('contactNumber', e.target.value)}
          required
          type="tel"
          placeholder="+1 (555) 000-0000"
        />
        <InputWithIcon
          icon={Home}
          label="Current Address"
          value={formValues.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Enter your current address"
        />
        <InputWithIcon
          icon={Building2}
          label="Present Address"
          value={formValues.presentAddress}
          onChange={(e) => handleChange('presentAddress', e.target.value)}
          placeholder="Enter your present address"
        />
        <InputWithIcon
          icon={Building2}
          label="Permanent Address"
          value={formValues.permanentAddress}
          onChange={(e) => handleChange('permanentAddress', e.target.value)}
          placeholder="Enter your permanent address"
        />
      </div>

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
    </form>
  )
}
