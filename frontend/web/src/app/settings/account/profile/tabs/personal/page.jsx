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

import ErrorBoundary from "@/components/error-boundary"
import toast from "react-hot-toast"
import { FormSectionSkeleton, CardSkeleton } from "./components/skeleton"
import { ProfileCompletionSkeleton } from "./components/profile-completion/page"
// import { SettingsService } from "@/services/settings/account/personal"

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

const MedicalReportsSection = lazy(() => {
  // Preload the component
  return import("./components/sections/medical-reports")
})

const ProfileCompletionCard = lazy(() => {
  // Preload the component
  return import("./components/profile-completion/page")
})

// Preload all section components when the component mounts
const preloadSectionComponents = () => {
  // Preload all components in parallel
  const preloads = [
    import("./components/sections/basic-info-personal"),
    import("./components/sections/documents"),
    import("./components/sections/education"),
    import("./components/sections/medical"),
    import("./components/sections/medical-reports")
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
      // Get the personal data from the profile
      const personalData = profile?.personal || {};
      
      // Map the nested structure to a flattened structure
      return {
        id: personalData?.id || "",
        // Name fields
        firstName: personalData?.name?.firstName || "",
        middleName: personalData?.name?.middleName || "",
        lastName: personalData?.name?.lastName || "",
        nickName: personalData?.name?.nickName || "",
        
        // Identity fields
        dateOfBirth: personalData?.identity?.dateOfBirth ? personalData.identity.dateOfBirth.split('T')[0] : "",
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
        passportExpiry: personalData?.identification?.passport?.expiry ? 
          personalData.identification.passport.expiry.split('T')[0] : "",
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
      }
    } catch (error) {
      console.error("Error processing personal data:", error)
      return {}
    }
  }, [profile?.personal])

  // Memoize education data extraction with error handling
  const education = useMemo(() => {
    try {
      const educationData = profile?.education?.[0] || {};
      
      // For debugging
      console.log("Raw education data:", educationData);
      
      // Handle yearOfPassing in a more flexible way
      let formattedYearOfPassing = "";
      if (educationData?.yearOfPassing) {
        // Try to handle different possible formats
        try {
          // If it's an ISO date string with a T
          if (typeof educationData.yearOfPassing === 'string' && 
              educationData.yearOfPassing.includes('T')) {
            // Extract just the year part
            const date = new Date(educationData.yearOfPassing);
            if (!isNaN(date.getTime())) {
              formattedYearOfPassing = date.getFullYear().toString();
            }
          } 
          // If it's just a year as a number or string number
          else if (!isNaN(Number(educationData.yearOfPassing))) {
            formattedYearOfPassing = Number(educationData.yearOfPassing).toString();
          } 
          // Otherwise, use as is if it's a string
          else if (typeof educationData.yearOfPassing === 'string') {
            formattedYearOfPassing = educationData.yearOfPassing;
          }
        } catch (error) {
          console.error("Error formatting year of passing:", error);
          formattedYearOfPassing = "";
        }
      }
      
      const result = {
        id: educationData?.id || "",
        degree: educationData?.degree || "",
        fieldOfStudy: educationData?.fieldOfStudy || "",
        qualification: educationData?.qualification || "",
        institution: educationData?.institution || "",
        yearOfPassing: formattedYearOfPassing,
        gpa: educationData?.gpa?.toString() || "",
      };
      
      // For debugging
      console.log("Processed education data:", result);
      
      return result;
    } catch (error) {
      console.error("Error processing education data:", error)
      return {}
    }
  }, [profile?.education])
  
  // Add this for medical data
  const medicalData = useMemo(() => {
    try {
      const data = profile?.medical || {};
      return {
        id: data?.id || "",
        allergies: data?.currentCare?.allergies || "",
        medications: data?.currentCare?.medications || "",
        chronicConditions: Array.isArray(data?.history?.chronicConditions) ? 
          data.history.chronicConditions.join(", ") : "",
        medicalNotes: "",
        medicalReports: data?.reports || []
      };
    } catch (error) {
      console.error("Error processing medical data:", error);
      return {};
    }
  }, [profile?.medical]);
  
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
        
        // Contact information
        contactNumber: personal?.contactNumber || "",
        
        // Address information
        address: personal?.address || {},
        presentAddress: personal?.presentAddress || {},
        permanentAddress: personal?.permanentAddress || {},

        // Education Information
        degree: education?.degree || "",
        fieldOfStudy: education?.fieldOfStudy || "",
        qualification: education?.qualification || "",
        institution: education?.institution || "",
        yearOfPassing: education?.yearOfPassing || "",
        gpa: education?.gpa || "",

        // Medical Information
        allergies: medicalData?.allergies || "",
        chronicConditions: medicalData?.chronicConditions || "",
        medications: medicalData?.medications || "",
        medicalNotes: medicalData?.medicalNotes || "",

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
      if (personal || education || medicalData) {
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
          
          // Contact information
          contactNumber: personal?.contactNumber || "",
          
          // Address information
          address: personal?.address || {},
          presentAddress: personal?.presentAddress || {},
          permanentAddress: personal?.permanentAddress || {},

          // Education Information
          degree: education?.degree || "",
          fieldOfStudy: education?.fieldOfStudy || "",
          qualification: education?.qualification || "",
          institution: education?.institution || "",
          yearOfPassing: education?.yearOfPassing || "",
          gpa: education?.gpa || "",

          // Medical Information
          allergies: medicalData?.allergies || "",
          chronicConditions: medicalData?.chronicConditions || "",
          medications: medicalData?.medications || "",
          medicalNotes: medicalData?.medicalNotes || "",

          // System Fields
          createdAt: personal?.createdAt || "",
          updatedAt: personal?.updatedAt || "",
          deletedAt: personal?.deletedAt || null,
        });
        
        setDataInitialized(true);
      }
    } catch (error) {
      console.error("Error updating form values:", error);
    }
  }, [personal, education, medicalData]);
  
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

  // Add state for medical reports
  const [medicalReports, setMedicalReports] = useState([])

  // Extract medical data from the profile
  useEffect(() => {
    try {
      if (profile?.medical?.reports && profile.medical.reports.length > 0) {
        setMedicalReports(profile.medical.reports);
      }
    } catch (error) {
      console.error("Error extracting medical reports:", error);
    }
  }, [profile?.medical]);

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
          education: [{
            ...education,
            ...data
          }]
        }
      } else if (section === 'medical') {
        sectionData = {
          medical: {
            ...profile.medical,
            currentCare: {
              allergies: data.allergies || "",
              medications: data.medications || ""
            },
            history: {
              ...profile.medical?.history,
              chronicConditions: data.chronicConditions ? data.chronicConditions.split(',').map(item => item.trim()) : []
            }
          }
        }
      } else {
        // Map flattened structure back to the nested API structure
        const personalData = {
          id: personal.id,
          name: {
            firstName: data.firstName || personal.firstName,
            middleName: data.middleName || personal.middleName,
            lastName: data.lastName || personal.lastName,
            nickName: data.nickName || personal.nickName
          },
          identity: {
            gender: data.genderIdentity || personal.genderIdentity,
            dateOfBirth: data.dateOfBirth || personal.dateOfBirth,
            age: data.age || personal.age,
            isDeceased: data.isDeceased || personal.isDeceased
          },
          contact: {
            phone: data.contactNumber || personal.contactNumber
          },
          addresses: {
            current: data.address || personal.address,
            permanent: data.permanentAddress || personal.permanentAddress,
            other: personal.presentAddress
          },
          description: data.description || personal.description,
          religion: data.religion || personal.religion,
          hobbies: data.hobbies ? data.hobbies.split(',').map(item => item.trim()) : [],
          occupation: data.occupation || personal.occupation,
          identification: {
            ...personal.identification,
            bloodGroup: data.bloodGroup || personal.bloodGroup,
            maritalStatus: data.maritalStatus || personal.maritalStatus
          }
        };
        
        sectionData = {
          personal: personalData
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
  }, [formValues, personal, education, profile, handleSave])

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

  // Add handlers for medical reports
  const handleAddMedicalReport = useCallback(async (data) => {
    try {
      setSectionLoading(prev => ({ ...prev, medicalReports: true }))
      // Call your API service to add medical report
      const response = await SettingsService.addMedicalReport(data)
      // Update medical reports list
      setMedicalReports(prev => [...prev, response.data])
      return response.data
    } catch (error) {
      console.error("Error adding medical report:", error)
      throw error
    } finally {
      setSectionLoading(prev => ({ ...prev, medicalReports: false }))
    }
  }, [])

  const handleUpdateMedicalReport = useCallback(async (id, data) => {
    try {
      setSectionLoading(prev => ({ ...prev, medicalReports: true }))
      // Call your API service to update medical report
      const response = await SettingsService.updateMedicalReport(id, data)
      // Update medical reports list
      setMedicalReports(prev => prev.map(report => 
        report.id === id ? { ...report, ...response.data } : report
      ))
      return response.data
    } catch (error) {
      console.error("Error updating medical report:", error)
      throw error
    } finally {
      setSectionLoading(prev => ({ ...prev, medicalReports: false }))
    }
  }, [])

  const handleDeleteMedicalReport = useCallback(async (id) => {
    try {
      setSectionLoading(prev => ({ ...prev, medicalReports: true }))
      // Call your API service to delete medical report
      await SettingsService.deleteMedicalReport(id)
      // Update medical reports list
      setMedicalReports(prev => prev.filter(report => report.id !== id))
    } catch (error) {
      console.error("Error deleting medical report:", error)
      throw error
    } finally {
      setSectionLoading(prev => ({ ...prev, medicalReports: false }))
    }
  }, [])

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
              profile={profile}
            />
          </CardWithCollapse>
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={<CardSkeleton />}>
          <CardWithCollapse
            section="medicalReports"
            title="Medical Reports"
            description="Your medical reports and test results"
            isLoading={settingsLoading || sectionLoading.medicalReports}
            icon={FileText}
          >
            <MedicalReportsSection
              reports={medicalReports}
              onAddReport={handleAddMedicalReport}
              onUpdateReport={handleUpdateMedicalReport}
              onDeleteReport={handleDeleteMedicalReport}
              loading={settingsLoading || sectionLoading.medicalReports}
              profile={profile}
            />
          </CardWithCollapse>
        </Suspense>
      </ErrorBoundary>

      {/* Profile Completion Card */}
      <ErrorBoundary>
        <Suspense fallback={<ProfileCompletionSkeleton />}>
          <ProfileCompletionCard profile={profile} isLoading={settingsLoading} />
        </Suspense>
      </ErrorBoundary>

    </div>
  )
}