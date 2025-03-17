import { useState, useMemo, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
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
import { FormSectionSkeleton, CardSkeleton } from "./components/skeleton"

// Lazy load form sections with error boundaries
const BasicInfoPersonalSection = lazy(() => import("./components/sections/basic-info-personal"))
const DocumentsSection = lazy(() => import("./components/sections/documents"))
const EducationSection = lazy(() => import("./components/sections/education"))
const MedicalSection = lazy(() => import("./components/sections/medical"))

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

  // Memoize education data extraction with error handling
  const education = useMemo(() => {
    try {
      return profile?.education || {}
    } catch (error) {
      console.error("Error processing education data:", error)
      throw new Error("Failed to process education information")
    }
  }, [profile?.education])

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

        // Education Information
        degree: education?.degree || "",
        fieldOfStudy: education?.fieldOfStudy || "",
        qualification: education?.qualification || "",
        institution: education?.institution || "",
        yearOfPassing: education?.yearOfPassing || "",
        gpa: education?.gpa || "",

        // Medical Information
        allergies: personal?.allergies || "",
        chronicConditions: personal?.chronicConditions || "",
        medications: personal?.medications || "",
        medicalNotes: personal?.medicalNotes || "",

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
  
  // Track loading states for each section
  const [sectionLoading, setSectionLoading] = useState({
    basicPersonal: false,
    documents: false,
    education: false,
    medical: false
  })
  
  // Memoize section states
  const [expandedSections, setExpandedSections] = useState({
    basicPersonal: true,
    documents: true,
    education: true,
    medical: true
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
      // Set section loading state
      setSectionLoading(prev => ({
        ...prev,
        [section === 'basic-personal' ? 'basicPersonal' : section]: true
      }))
      
      let sectionData = {}
      
      if (section === 'education') {
        sectionData = {
          education: {
            ...data
          }
        }
      } else {
        sectionData = {
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
      }
      
      await handleSave(sectionData)
      toast.success(`${section} information updated successfully`)
    } catch (error) {
      console.error("Error saving section data:", error)
      throw new Error(`Failed to save ${section} information`)
    } finally {
      // Reset section loading state
      setSectionLoading(prev => ({
        ...prev,
        [section === 'basic-personal' ? 'basicPersonal' : section]: false
      }))
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
    children,
    isLoading
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
            {isLoading ? <FormSectionSkeleton /> : children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  ), [expandedSections, toggleSection])

  // Render sections with Suspense and ErrorBoundary
  return (
    <div className="flex flex-col gap-6">
      <ErrorBoundary>
        <Suspense fallback={<CardSkeleton />}>
          <CardWithCollapse
            section="basicPersonal"
            title="Personal Information"
            description="Your personal details and information"
            isLoading={settingsLoading || sectionLoading.basicPersonal}
          >
            <BasicInfoPersonalSection
              formValues={formValues}
              handleChange={handleLocalChange}
              handleSave={handleSectionSave}
              date={date}
              onDateSelect={handleDateSelect}
              loading={settingsLoading || sectionLoading.basicPersonal}
            />
          </CardWithCollapse>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<CardSkeleton />}>
          <CardWithCollapse
            section="documents"
            title="Documents & Identity"
            description="Your identification and document information"
            isLoading={settingsLoading || sectionLoading.documents}
          >
            <DocumentsSection
              formValues={formValues}
              handleChange={handleLocalChange}
              handleSave={handleSectionSave}
              loading={settingsLoading || sectionLoading.documents}
            />
          </CardWithCollapse>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<CardSkeleton />}>
          <CardWithCollapse
            section="education"
            title="Education"
            description="Your educational background and qualifications"
            isLoading={settingsLoading || sectionLoading.education}
          >
            <EducationSection
              formValues={formValues}
              handleChange={handleLocalChange}
              handleSave={handleSectionSave}
              loading={settingsLoading || sectionLoading.education}
            />
          </CardWithCollapse>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<CardSkeleton />}>
          <CardWithCollapse
            section="medical"
            title="Medical Information"
            description="Your health and medical information"
            isLoading={settingsLoading || sectionLoading.medical}
          >
            <MedicalSection
              formValues={formValues}
              handleChange={handleLocalChange}
              handleSave={handleSectionSave}
              loading={settingsLoading || sectionLoading.medical}
            />
          </CardWithCollapse>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}