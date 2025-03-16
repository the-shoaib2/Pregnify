import { useState, useEffect, useMemo, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Loader,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import ErrorBoundary from "@/components/error-boundary"
import toast from "react-hot-toast"

// Lazy load form sections with error boundaries
const BasicInfoSection = lazy(() => import("./components/sections/basic-info"))
const ContactSection = lazy(() => import("./components/sections/contact"))
const DocumentsSection = lazy(() => import("./components/sections/documents"))
const PersonalDetailsSection = lazy(() => import("./components/sections/personal-details"))

// Loading state component
const LoadingState = ({ children }) => (
  <div className="flex items-center justify-center p-4 space-x-2">
    <Loader className="h-4 w-4 animate-spin" />
    <div className="text-sm text-muted-foreground">{children}</div>
  </div>
)

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

export default function PersonalTab({
  profile,
  handleSave,
  settingsLoading
}) {
  // Memoize personal data extraction with error handling
  const personal = useMemo(() => {
    try {
      const personalData = profile?.personal?.[0] || {}
      return {
        ...personalData,
        dateOfBirth: personalData?.dateOfBirth ? personalData.dateOfBirth.split('T')[0] : "",
        passportExpiry: personalData?.passportExpiry ? personalData.passportExpiry.split('T')[0] : "",
        description: personalData?.description || personalData?.discription || "",
        emergencyContact: personalData?.emergencyContact || [],
        addresses: personalData?.addresses || {},
        identification: personalData?.identification || { passport: {} },
        emergency: personalData?.emergency || []
      }
    } catch (error) {
      console.error("Error processing personal data:", error)
      throw new Error("Failed to process personal information")
    }
  }, [profile?.personal])

  // Memoize form values with error handling
  const [formValues, setFormValues] = useState(() => {
    try {
      return {
        // Basic Information
        id: personal?.id || "",
        firstName: personal?.firstName || "",
        middleName: personal?.middleName || "",
        lastName: personal?.lastName || "",
        nickName: personal?.nickName || "",
        dateOfBirth: personal?.dateOfBirth || "",
        genderIdentity: personal?.genderIdentity || "",
        description: personal?.description || "",
        age: personal?.age || "",
        isDeceased: personal?.isDeceased || false,
        
        // Contact Information
        contactNumber: personal?.contactNumber || "",
        address: personal?.address || "",
        presentAddress: personal?.presentAddress || "",
        permanentAddress: personal?.permanentAddress || "",
        
        // Location Information
        placeOfBirth: personal?.placeOfBirth || "",
        countryOfBirth: personal?.countryOfBirth || "",
        nationality: personal?.nationality || "",
        
        // Documents & Identity
        passportNumber: personal?.passportNumber || "",
        passportExpiry: personal?.passportExpiry || "",
        citizenship: personal?.citizenship || "",
        
        // Personal Details
        maritalStatus: personal?.maritalStatus || "",
        bloodGroup: personal?.bloodGroup || "",
        occupation: personal?.occupation || "",
        religion: personal?.religion || "",
        hobbies: personal?.hobbies || "",
        additionalInfo: personal?.additionalInfo || "",

        // System Fields
        createdAt: personal?.createdAt || "",
        updatedAt: personal?.updatedAt || "",
        deletedAt: personal?.deletedAt || null,
      }
    } catch (error) {
      console.error("Error initializing form values:", error)
      throw new Error("Failed to initialize form data")
    }
  })
  
  // Memoize date state
  const [date, setDate] = useState(() => 
    formValues.dateOfBirth ? new Date(formValues.dateOfBirth) : null
  )
  
  // Memoize section states
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    contact: true,
    documents: true,
    education: true,
    additional: true
  })

  // Memoized handlers with error handling
  const handleLocalChange = useMemo(() => (field, value) => {
    try {
      setFormValues(prev => ({
        ...prev,
        [field]: value
      }))
    } catch (error) {
      console.error("Error updating form value:", error)
      throw new Error(`Failed to update ${field}`)
    }
  }, [])
  
  const handleDateSelect = useMemo(() => (newDate) => {
    try {
      setDate(newDate)
      const formattedDate = format(newDate, 'yyyy-MM-dd')
      handleLocalChange('dateOfBirth', formattedDate)
    } catch (error) {
      console.error("Error handling date selection:", error)
      throw new Error("Failed to update date of birth")
    }
  }, [handleLocalChange])
  
  const handleSectionSave = useMemo(() => async (section, data) => {
    try {
      const sectionData = {
        personal: {
          0: {
            ...formValues,
            ...data,
            emergencyContact: personal.emergencyContact,
            addresses: personal.addresses,
            identification: personal.identification,
            emergency: personal.emergency
          }
        }
      }
      await handleSave(sectionData)
      toast.success(`${section} information updated successfully`)
    } catch (error) {
      console.error("Error saving section data:", error)
      throw new Error(`Failed to save ${section} information`)
    }
  }, [formValues, personal, handleSave])

  const toggleSection = useMemo(() => (section) => {
    try {
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }))
    } catch (error) {
      console.error("Error toggling section:", error)
      throw new Error(`Failed to toggle ${section} section`)
    }
  }, [])

  // Memoized card header component
  const CardWithCollapse = useMemo(() => ({ 
    section, 
    title, 
    description, 
    children 
  }) => (
    <Card className="relative">
      <Collapsible
        open={expandedSections[section]}
        onOpenChange={() => toggleSection(section)}
      >
        <div className="absolute right-4 top-4 flex items-center gap-2 z-20">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              {expandedSections[section] ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CardHeader className="pr-24 pb-4">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  ), [expandedSections, toggleSection])

  // Render sections with Suspense and ErrorBoundary
  return (
    <div className="flex flex-col gap-6">
      <ErrorBoundary>
        <Suspense fallback={<LoadingState>Loading basic information...</LoadingState>}>
          <CardWithCollapse
            section="basic"
            title="Basic Information"
            description="Your primary personal information"
          >
            <BasicInfoSection
              formValues={formValues}
              handleChange={handleLocalChange}
              handleSave={handleSectionSave}
              date={date}
              onDateSelect={handleDateSelect}
              genderOptions={GENDER_OPTIONS}
              loading={settingsLoading}
            />
          </CardWithCollapse>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<LoadingState>Loading contact information...</LoadingState>}>
          <CardWithCollapse
            section="contact"
            title="Contact Information"
            description="Your contact and address details"
          >
            <ContactSection
              formValues={formValues}
              handleChange={handleLocalChange}
              handleSave={handleSectionSave}
              loading={settingsLoading}
            />
          </CardWithCollapse>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<LoadingState>Loading documents...</LoadingState>}>
          <CardWithCollapse
            section="documents"
            title="Documents & Identity"
            description="Your identification and document information"
          >
            <DocumentsSection
              formValues={formValues}
              handleChange={handleLocalChange}
              handleSave={handleSectionSave}
              loading={settingsLoading}
            />
          </CardWithCollapse>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<LoadingState>Loading personal details...</LoadingState>}>
          <CardWithCollapse
            section="personal"
            title="Personal Details"
            description="Additional personal information"
          >
            <PersonalDetailsSection
              formValues={formValues}
              handleChange={handleLocalChange}
              handleSave={handleSectionSave}
              maritalStatusOptions={MARITAL_STATUS_OPTIONS}
              bloodGroups={BLOOD_GROUPS}
              loading={settingsLoading}
            />
          </CardWithCollapse>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}