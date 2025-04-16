"use client"

import { useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from "@/components/ui/form"
import { DatePicker } from "@/components/ui/date-picker"
import { useForm } from "react-hook-form"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "react-hot-toast"
import { UserManagementService } from "@/services/admin"
import { useAuth } from "@/contexts/auth-context/auth-context"
import { Loader, Eye, EyeOff, UserPlus, Check, X, AlertCircle } from "lucide-react"
import React from "react"

// Constants
const GENDERS = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  PREFER_NOT_TO_SAY: "PREFER_NOT_TO_SAY",
  OTHER: "OTHER"
}

// Password requirements
const PASSWORD_REQUIREMENTS = [
  { id: 'length', text: 'At least 8 characters', regex: /.{8,}/ },
  { id: 'uppercase', text: 'One uppercase letter', regex: /[A-Z]/ },
  { id: 'lowercase', text: 'One lowercase letter', regex: /[a-z]/ },
  { id: 'number', text: 'One number', regex: /[0-9]/ },
  { id: 'special', text: 'One special character', regex: /[!@#$%^&*(),.?":{}|<>]/ }
]

// Form field components
const CustomFormField = ({ label, id, children, className = "" }) => {
  // Clone children and add id if it's a DatePicker
  const childrenWithId = React.Children.map(children, child => {
    if (React.isValidElement(child) && child.type === DatePicker) {
      return React.cloneElement(child, { id });
    }
    return child;
  });

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      {childrenWithId}
    </div>
  );
}


// Password field with toggle visibility
const PasswordField = React.forwardRef(({ label, id, placeholder, value, onChange, required = false }, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  
  return (
    <CustomFormField label={label} id={id}>
      <div className="relative">
        <Input
          ref={ref}
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="sr-only">
            {showPassword ? "Hide password" : "Show password"}
          </span>
        </Button>
      </div>
    </CustomFormField>
  )
})

PasswordField.displayName = "PasswordField"

export function UserAddForm({ initialData = null, isEditMode = false, onSuccess = null }) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register } = useAuth()

  const form = useForm({
    defaultValues: {
      role: "DOCTOR",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: null,
      password: "",
      confirmPassword: "",
      gender: "",
      accountStatus: "ACTIVE",
      termsAccepted: false,
      description: "",
      ...initialData
    }
  })

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true)
      const formattedData = {
        ...data,
        dateOfBirth: data.dateOfBirth ? {
          day: data.dateOfBirth.getDate(),
          month: data.dateOfBirth.getMonth() + 1,
          year: data.dateOfBirth.getFullYear()
        } : null
      }

      const response = await UserManagementService.createUser(formattedData)

      if (response.success) {
        toast.success("User created successfully", {
          description: `${response.data.firstName} ${response.data.lastName}`,
        })
        
        if (onSuccess) {
          onSuccess(response.data)
        }
        
        // Navigate to user list or detail page
        navigate(`/users/${response.data.id}`)
      }
    } catch (error) {
      toast.error("Failed to create user", {
        description: error.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {isEditMode ? "Edit User" : "Add New User"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid gap-4 grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          onDateChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(GENDERS).map(([key, value]) => (
                            <SelectItem key={value} value={value}>
                              {key.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Account Information */}
            {!isEditMode && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Information</h3>
                <div className="grid gap-4 grid-cols-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <PasswordField {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <PasswordField {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I accept the terms and conditions
                      </FormLabel>
                      <FormDescription>
                        By accepting, you agree to our terms of service and privacy policy.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/users")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Update User" : "Create User"}
          </Button>
        </div>
      </form>
    </Form>
  )
}