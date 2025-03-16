import React, { useState } from 'react'
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
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function BasicInfoSection({
  formValues,
  handleChange,
  handleSave,
  date,
  onDateSelect,
  genderOptions,
  loading
}) {
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      // Validate required fields
      if (!formValues.firstName) {
        throw new Error("First name is required")
      }

      // Extract basic info fields
      const basicInfo = {
        firstName: formValues.firstName,
        middleName: formValues.middleName,
        lastName: formValues.lastName,
        nickName: formValues.nickName,
        dateOfBirth: formValues.dateOfBirth,
        genderIdentity: formValues.genderIdentity,
        description: formValues.description,
        age: formValues.age,
        isDeceased: formValues.isDeceased,
      }

      await handleSave('basic', basicInfo)
    } catch (error) {
      console.error("Error saving basic info:", error)
      throw new Error("Failed to save basic information")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <InputWithIcon
          icon={User}
          label="First Name"
          value={formValues.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          required
        />
        <InputWithIcon
          icon={User}
          label="Middle Name"
          value={formValues.middleName}
          onChange={(e) => handleChange('middleName', e.target.value)}
        />
        <InputWithIcon
          icon={User}
          label="Last Name"
          value={formValues.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
        />
        <InputWithIcon
          icon={User}
          label="Nick Name"
          value={formValues.nickName}
          onChange={(e) => handleChange('nickName', e.target.value)}
        />
        <div className="grid w-full items-center gap-1.5">
          <label htmlFor="dob" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
            Gender Identity
          </label>
          <Select 
            value={formValues.genderIdentity} 
            onValueChange={(value) => handleChange('genderIdentity', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
