import { useState, useMemo, lazy, Suspense, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ChevronUp,
  ChevronDown,
  User,
  Book,
  FileText,
  Activity
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
} from "@/components/ui/context-menu"
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"

import { Separator } from "@/components/ui/separator"

import ErrorBoundary from "@/components/error-boundary"
import toast from "react-hot-toast"
import { FormSectionSkeleton, CardSkeleton } from "./components/skeleton"

// Preload section components to avoid initial render issues
const BasicInfoPersonalSection = lazy(() => {
  // Preload the component
  return import("./components/sections/basic-info-personal")
})

const DocumentsSection = lazy(() => {
  // Preload the component
  return import("./components/sections/documents")
})

const EducationSection = lazy(() => {
  // Preload the component
  return import("./components/sections/education")
})

const MedicalSection = lazy(() => {
  // Preload the component
  return import("./components/sections/medical")
})

// Preload all section components when the component mounts
const preloadSectionComponents = () => {
  // Preload all components in parallel
  const preloads = [
    import("./components/sections/basic-info-personal"),
    import("./components/sections/documents"),
    import("./components/sections/education"),
    import("./components/sections/medical")
  ]
  
  // Execute all preloads
  return Promise.all(preloads).catch(error => {
    console.error("Error preloading section components:", error)
    // Don't throw here, just log the error
  })
}

export default function PersonalTab({
  profile,
  handleSave,
  settingsLoading
}) {
  // Track component preloading state
  const [componentsPreloaded, setComponentsPreloaded] = useState(false)
  const [dataInitialized, setDataInitialized] = useState(false)
  const [dataFetched, setDataFetched] = useState(false)
  
  // Preload all section components when the component mounts
  useEffect(() => {
    const preloadComponents = async () => {
      try {
        await preloadSectionComponents()
        setComponentsPreloaded(true)
      } catch (error) {
        console.error("Error during component preloading:", error)
      }
    }
    
    preloadComponents()
    
    // Cleanup function
    return () => {
      // Any cleanup needed when component unmounts
    }
  }, [])
  
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
      return {}
    }
  }, [profile?.personal])

  // Memoize education data extraction with error handling
  const education = useMemo(() => {
    try {
      return profile?.education || {}
    } catch (error) {
      console.error("Error processing education data:", error)
      return {}
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
      return {}
    }
  })
  
  // Update form values when personal data changes
  useEffect(() => {
    try {
      setFormValues({
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
      })
    } catch (error) {
      console.error("Error updating form values:", error)
    }
  }, [personal, education])
  
  // Memoize date state
  const [date, setDate] = useState(() => 
    formValues.dateOfBirth ? new Date(formValues.dateOfBirth) : null
  )
  
  // Update date when dateOfBirth changes
  useEffect(() => {
    if (formValues.dateOfBirth) {
      setDate(new Date(formValues.dateOfBirth))
    }
  }, [formValues.dateOfBirth])
  
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
      toast.error(`Failed to update ${field}`)
    }
  }, [])
  
  const handleDateSelect = useMemo(() => (newDate) => {
    try {
      setDate(newDate)
      const formattedDate = format(newDate, 'yyyy-MM-dd')
      handleLocalChange('dateOfBirth', formattedDate)
    } catch (error) {
      console.error("Error handling date selection:", error)
      toast.error("Failed to update date of birth")
    }
  }, [handleLocalChange])
  
  const handleSectionSave = useCallback(async (section, data) => {
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
      toast.error(`Failed to save ${section} information`)
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
    }
  }, [])

  // Function to handle reload action
  const handleReload = () => {
    console.log("Reloading personal data...");
    // Implement your reload logic here
  };

  // Function to handle back action
  const handleBack = () => {
    console.log("Going back...");
    // Implement your back navigation logic here
  };

  // Function to handle forward action
  const handleForward = () => {
    console.log("Going forward...");
    // Implement your forward navigation logic here
  };

  // Function to handle expand all action
  const handleExpandAll = () => {
    setExpandedSections({
      basicPersonal: true,
      documents: true,
      education: true,
      medical: true
    });
  };

  // Function to handle collapse all action
  const handleCollapseAll = () => {
    setExpandedSections({
      basicPersonal: false,
      documents: false,
      education: false,
      medical: false
    });
  };

  // Memoized card header component with command menu
  const CardWithCollapse = useMemo(() => ({ 
    section, 
    title, 
    description, 
    children,
    isLoading,
    icon: Icon = User
  }) => (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card className="relative">
          <Collapsible
            open={expandedSections[section]}
            onOpenChange={() => toggleSection(section)}
          >
            <div className="absolute right-4 top-4 flex items-center gap-2 ">
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

            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Icon className="h-5 w-5 text-primary" />
                {title}
              </CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>

            <CollapsibleContent>
              <CardContent className="pt-0">
                {isLoading ? <FormSectionSkeleton /> : children}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">

      <ContextMenuItem inset onClick={handleReload}>
          Reload
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset onClick={handleBack}>
          Backward
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset onClick={handleForward}>
          Forward
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem inset onClick={() => toggleSection(section)}>
          {expandedSections[section] ? "Collapse" : "Expand"} {title}
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset onClick={handleExpandAll}>
          Expand All
          <ContextMenuShortcut>⌘E</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset onClick={handleCollapseAll}>
          Collapse All
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>
              Save Page As...
              <ContextMenuShortcut>⇧⌘S</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Developer Tools
               <ContextMenuShortcut>⌘I</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked={true} onCheckedChange={() => {}}>
          Show Bookmarks Bar
          <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
        </ContextMenuCheckboxItem>
      </ContextMenuContent>
    </ContextMenu>
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
            icon={User}
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
            section="education"
            title="Education"
            description="Your educational background and qualifications"
            isLoading={settingsLoading || sectionLoading.education}
            icon={Book}
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
            section="documents"
            title="Documents & Identity"
            description="Your identification and important documents"
            isLoading={settingsLoading || sectionLoading.documents}
            icon={FileText}
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
            section="medical"
            title="Medical Information"
            description="Your medical history and health information"
            isLoading={settingsLoading || sectionLoading.medical}
            icon={Activity}
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