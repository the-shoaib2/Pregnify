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
  ContextMenuCheckboxItem
} from "@/components/ui/context-menu"

import ErrorBoundary from "@/components/error-boundary"
import toast from "react-hot-toast"
import { FormSectionSkeleton, CardSkeleton } from "./components/skeleton"
import { ProfileCompletionSkeleton } from "./components/profile-completion/page"

// Preload section components to avoid initial render issues
const BasicInfoPersonalSection = lazy(() => {
  // Preload the component
  return import("./components/sections/personal-info/page")
})

const DocumentsSection = lazy(() => {
  // Preload the component
  return import("./components/sections/documents/documents")
})

const EducationSection = lazy(() => {
  // Preload the component
  return import("./components/sections/education/education")
})

const MedicalSection = lazy(() => {
  // Preload the component
  return import("./components/sections/medical/medical")
})


const ProfileCompletionCard = lazy(() => {
  // Preload the component
  return import("./components/profile-completion/page")
})

// Preload all section components when the component mounts
const preloadSectionComponents = () => {
  // Preload all components in parallel
  const preloads = [
    import("./components/sections/personal-info/page"),
    import("./components/sections/documents/documents"),
    import("./components/sections/education/education"),
    import("./components/sections/medical/medical"),
  ]
  
  // Execute all preloads
  return Promise.all(preloads).catch(error => {
    console.error("Error preloading section components:", error)
    // Don't throw here, just log the error
  })
}

export default function PersonalTab({
  profile,
  settingsLoading
}) {
  // Track component preloading state
  const [componentsPreloaded, setComponentsPreloaded] = useState(false)
  const [isDataReady, setIsDataReady] = useState(false)
  
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
  }, [])

  // Set data ready when profile is available
  useEffect(() => {
    if (profile && profile.personal) {
      setIsDataReady(true)
    }
  }, [profile])
  
  // Memoize personal data extraction with error handling
  const personal = useMemo(() => {
    try {
      // Get the personal data from the profile
      const personalData = profile?.personal || {};
      
      // Map the nested structure to a flattened structure
      const mappedData = {
        id: personalData?.id || "",
        // Name fields
        firstName: personalData?.name?.firstName || "",
        middleName: personalData?.name?.middleName || "",
        lastName: personalData?.name?.lastName || "",
        nickName: personalData?.name?.nickName || "",
        
        // Identity fields
        dateOfBirth: personalData?.identity?.dateOfBirth || "",
        genderIdentity: personalData?.identity?.gender || "",
        age: personalData?.identity?.age || "",
        isDeceased: personalData?.identity?.isDeceased || false,
        
        // Origin fields
        placeOfBirth: personalData?.origin?.placeOfBirth || "",
        countryOfBirth: personalData?.origin?.countryOfBirth || "",
        nationality: personalData?.origin?.nationality || "",
        
        // Contact fields
        contactNumber: personalData?.contact?.phone || "",
        
        // Address information - preserve structure but ensure it exists
        address: personalData?.addresses?.current || {},
        presentAddress: personalData?.addresses?.current || {},
        permanentAddress: personalData?.addresses?.permanent || {},
        
        // Identification fields
        passportNumber: personalData?.identification?.passport?.number || "",
        passportExpiry: personalData?.identification?.passport?.expiry || "",
        citizenship: personalData?.identification?.citizenship || "",
        bloodGroup: personalData?.identification?.bloodGroup || "",
        maritalStatus: personalData?.identification?.maritalStatus || "",
        
        // Occupation
        occupation: personalData?.occupation || {},
        
        // Other fields
        religion: personalData?.religion || "",
        hobbies: Array.isArray(personalData?.hobbies) ? personalData.hobbies.join(", ") : "",
        additionalInfo: typeof personalData?.additionalInfo === 'object' ? 
          JSON.stringify(personalData.additionalInfo) : (personalData?.additionalInfo || ""),
        
        // Description
        description: personalData?.description || "",
        
        // Emergency contacts
        emergencyContact: personalData?.emergencyContacts || [],
        
        // System timestamps
        createdAt: personalData?.timestamps?.created || "",
        updatedAt: personalData?.timestamps?.updated || "",
        deletedAt: null,
      };
      
      return mappedData;
    } catch (error) {
      console.error("Error processing personal data:", error)
      return {}
    }
  }, [profile?.personal])

  // Memoize education data extraction with error handling
  const education = useMemo(() => {
    try {
      const educationData = profile?.education || []; // Ensure we get an array
      
      return educationData.map(edu => ({
        id: edu?.id || "",
        degree: edu?.degree || "",
        fieldOfStudy: edu?.fieldOfStudy || "",
        qualification: edu?.qualification || "",
        institution: edu?.institution || "",
        startYear: edu?.startYear || "",
        endYear: edu?.endYear || "",
        isOngoing: edu?.isOngoing || false,
        gpa: edu?.gpa || "",
      }));
    } catch (error) {
      console.error("Error processing education data:", error)
      return []
    }
  }, [profile?.education])
  
  // Add this for medical data
  const medical = useMemo(() => {
    try {
      const data = profile?.medical || {};
      return {
        id: data?.id || "",
        allergies: data?.allergies || "",
        medications: data?.medications || "",
        chronicConditions: Array.isArray(data?.chronicDiseases?.condition) ? 
          data.chronicDiseases.condition.join(", ") : "",
        medicalNotes: "",
        medicalReports: data?.reports || [],
        bloodGroup: data?.bloodGroup || "",
        cancerHistory: data?.cancerHistory || false,
        cancerType: data?.cancerType || "",
        vaccinationRecords: data?.vaccinationRecords || { 'COVID-19': "" },
        geneticDisorders: data?.geneticDisorders?.condition || "",
        disabilities: {
          physical: data?.disabilities?.physical || "",
          mental: data?.disabilities?.mental || ""
        },
        emergencyContact: data?.emergencyContact || "",
        primaryPhysician: data?.primaryPhysician || ""
      };
    } catch (error) {
      console.error("Error processing medical data:", error);
      return {};
    }
  }, [profile?.medical]);
  
  // Memoize form values with error handling
  const [formValues, setFormValues] = useState({});
  
  // Update form values when personal data changes
  useEffect(() => {
    try {
      if (personal) {
        // Change from array to object
        const updatedFormValues = {
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
          occupation: personal?.occupation || {},
          religion: personal?.religion || "",
          hobbies: personal?.hobbies || "",
          additionalInfo: personal?.additionalInfo || "",
          
          // Contact information
          contactNumber: personal?.contactNumber || "",
          
          // Address information
          address: personal?.address || {},
          presentAddress: personal?.presentAddress || {},
          permanentAddress: personal?.permanentAddress || {},

          // Education Information
          education: education || [], // Ensure this is an array

          // Medical Information
medical: medical || [],
        

          // System Fields
          createdAt: personal?.createdAt || "",
          updatedAt: personal?.updatedAt || "",
          deletedAt: personal?.deletedAt || null,
        };

        setFormValues(updatedFormValues); // Set the updated form values
      }
    } catch (error) {
      console.error("Error updating form values:", error);
    }
  }, [personal, education, medical]);
  
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
  
  // Set up date state
  const [date, setDate] = useState(null)
  
  // Initialize date from profile data when it's available
  useEffect(() => {
    try {
      if (profile?.personal?.identity?.dateOfBirth) {
        const dateString = profile.personal.identity.dateOfBirth;
        // Parse the date string to a Date object
        const dateObj = new Date(dateString);
        if (!isNaN(dateObj.getTime())) {
          setDate(dateObj);
        } else {
          console.error('Invalid date format:', dateString);
        }
      }
    } catch (error) {
      console.error('Error setting date from profile:', error);
    }
  }, [profile]);

  
  // Track loading states for each section
  const [sectionLoading, setSectionLoading] = useState({
    basicPersonal: false,
    documents: false,
    education: false,
    medical: false,
    medicalReports: false
  })
  
  // Memoize section states
  const [expandedSections, setExpandedSections] = useState({
    basicPersonal: true,
    documents: true,
    education: true,
    medical: true,
    medicalReports: true
  })


  // Memoized handlers with error handling
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
      medical: true,
      medicalReports: true
    });
  };

  // Function to handle collapse all action
  const handleCollapseAll = () => {
    setExpandedSections({
      basicPersonal: false,
      documents: false,
      education: false,
      medical: false,
      medicalReports: false
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
      {componentsPreloaded && isDataReady && (
        <>
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
                  formValues={education}
                  setFormValues={setFormValues}
                  handleChange={handleLocalChange}
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
                  loading={settingsLoading || sectionLoading.documents}
                />
              </CardWithCollapse>
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary>
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
                loading={settingsLoading || sectionLoading.medical}
                profile={profile}
              />
            </CardWithCollapse>
          </ErrorBoundary>

          {/* Profile Completion Card */}
          <ErrorBoundary>
            <Suspense fallback={<ProfileCompletionSkeleton />}>
              <ProfileCompletionCard profile={profile} isLoading={settingsLoading} />
            </Suspense>
          </ErrorBoundary>
        </>
      )}
    </div>
  )
}