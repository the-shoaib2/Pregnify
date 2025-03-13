import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { InputWithIcon } from "@/components/input-with-icon"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  User,
  CalendarIcon,
  Briefcase,
  GraduationCap,
  Languages,
  Save,
  Loader,
  Heart,
  Home,
  IdCard,
  Flag,
  Globe,
  Phone,
  Book,
  Activity,
  FileText,
  Building2,
  School,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

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
  user,
  formData,
  handleChange,
  handleSave,
  settingsLoading
}) {
  const personalData = formData?.personal?.[0] || formData?.personal || {}
  
  const [formValues, setFormValues] = useState({
    // Basic Information
    id: personalData.id || "",
    firstName: personalData.firstName || "",
    middleName: personalData.middleName || "",
    lastName: personalData.lastName || "",
    nickName: personalData.nickName || "",
    dateOfBirth: personalData.dateOfBirth ? personalData.dateOfBirth.split('T')[0] : "",
    genderIdentity: personalData.genderIdentity || "",
    description: personalData.description || personalData.discription || "",
    age: personalData.age || "",
    isDeceased: personalData.isDeceased || false,
    
    // Contact Information
    contactNumber: personalData.contactNumber || "",
    address: personalData.address || "",
    presentAddress: personalData.presentAddress || "",
    permanentAddress: personalData.permanentAddress || "",
    
    // Location Information
    placeOfBirth: personalData.placeOfBirth || "",
    countryOfBirth: personalData.countryOfBirth || "",
    nationality: personalData.nationality || "",
    
    // Documents & Identity
    passportNumber: personalData.passportNumber || "",
    passportExpiry: personalData.passportExpiry ? personalData.passportExpiry.split('T')[0] : "",
    citizenship: personalData.citizenship || "",
    
    // Personal Details
    maritalStatus: personalData.maritalStatus || "",
    bloodGroup: personalData.bloodGroup || "",
    occupation: personalData.occupation || "",
    religion: personalData.religion || "",
    hobbies: personalData.hobbies || "",
    additionalInfo: personalData.additionalInfo || "",

    // System Fields
    createdAt: personalData.createdAt || "",
    updatedAt: personalData.updatedAt || "",
    deletedAt: personalData.deletedAt || null,
  })
  
  // Date handling
  const [date, setDate] = useState(formValues.dateOfBirth ? new Date(formValues.dateOfBirth) : null)
  
  // Local change handler
  const handleLocalChange = (field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Handle date selection
  const handleDateSelect = (newDate) => {
    setDate(newDate)
    const formattedDate = format(newDate, 'yyyy-MM-dd')
    handleLocalChange('dateOfBirth', formattedDate)
  }
  
  // Handle section-specific saves
  const handleSectionSave = (section, data) => {
    const sectionData = {
      personal: {
        0: {
          ...formValues,
          ...data,
          emergencyContact: personalData.emergencyContact || [],
          addresses: personalData.addresses || {},
          identification: personalData.identification || { passport: {} },
          emergency: personalData.emergency || []
        }
      }
    }
    handleSave(sectionData)
  }

  // Add state for collapse/expand
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    contact: true,
    documents: true,
    education: true,
    additional: true
  })

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Helper component for card headers
  const CardWithCollapse = ({ 
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
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>

        <CollapsibleContent className="transition-all duration-300 ease-in-out">
          {children}
        </CollapsibleContent>

        {!expandedSections[section] && (
          <div className="px-6 pb-4 text-sm text-muted-foreground">
            Click to expand {title.toLowerCase()} details
          </div>
        )}
      </Collapsible>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Basic & Personal Information Card */}
      <CardWithCollapse
        section="basic"
        title="Personal Information"
        description="Your primary personal details and information"
      >
        <CardContent className="space-y-8">
          {/* Basic Details Group */}
          <div className="space-y-4">
            <div className="flex items-center">
              <h3 className="text-sm font-medium text-muted-foreground">Basic Details</h3>
              <Separator className="flex-1 ml-4" />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <InputWithIcon
                icon={User}
                label="First Name"
                value={formValues.firstName}
                onChange={(e) => handleLocalChange('firstName', e.target.value)}
                required
              />
              <InputWithIcon
                icon={User}
                label="Middle Name"
                value={formValues.middleName}
                onChange={(e) => handleLocalChange('middleName', e.target.value)}
              />
              <InputWithIcon
                icon={User}
                label="Last Name"
                value={formValues.lastName}
                onChange={(e) => handleLocalChange('lastName', e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <InputWithIcon
                icon={User}
                label="Nickname"
                value={formValues.nickName}
                onChange={(e) => handleLocalChange('nickName', e.target.value)}
              />
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Gender
                </Label>
                <Select
                  value={formValues.genderIdentity}
                  onValueChange={(value) => handleLocalChange('genderIdentity', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Personal Details Group */}
          <div className="space-y-4">
            <div className="flex items-center">
              <h3 className="text-sm font-medium text-muted-foreground">Personal Details</h3>
              <Separator className="flex-1 ml-4" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Date of Birth */}
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  Date of Birth
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateSelect}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Marital Status */}
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  Marital Status
                </Label>
                <Select
                  value={formValues.maritalStatus}
                  onValueChange={(value) => handleLocalChange('maritalStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARITAL_STATUS_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Blood Group
                </Label>
                <Select
                  value={formValues.bloodGroup}
                  onValueChange={(value) => handleLocalChange('bloodGroup', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
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
                icon={Briefcase}
                label="Occupation"
                value={formValues.occupation}
                onChange={(e) => handleLocalChange('occupation', e.target.value)}
              />
              <InputWithIcon
                icon={Book}
                label="Religion"
                value={formValues.religion}
                onChange={(e) => handleLocalChange('religion', e.target.value)}
              />
            </div>
          </div>

          {/* Additional Details Group */}
          <div className="space-y-4">
            <div className="flex items-center">
              <h3 className="text-sm font-medium text-muted-foreground">Additional Details</h3>
              <Separator className="flex-1 ml-4" />
            </div>

            <InputWithIcon
              icon={Heart}
              label="Hobbies"
              value={formValues.hobbies}
              onChange={(e) => handleLocalChange('hobbies', e.target.value)}
            />

            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                About You
              </Label>
              <textarea
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Tell us about yourself..."
                value={formValues.description}
                onChange={(e) => handleLocalChange('description', e.target.value)}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end pt-4">
          <Button 
            onClick={() => handleSectionSave('basic', {
              firstName: formValues.firstName,
              middleName: formValues.middleName,
              lastName: formValues.lastName,
              nickName: formValues.nickName,
              dateOfBirth: formValues.dateOfBirth,
              genderIdentity: formValues.genderIdentity,
              description: formValues.description,
              maritalStatus: formValues.maritalStatus,
              bloodGroup: formValues.bloodGroup,
              occupation: formValues.occupation,
              religion: formValues.religion,
              hobbies: formValues.hobbies
            })}
            disabled={settingsLoading}
          >
            {settingsLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </CardFooter>
      </CardWithCollapse>

      {/* Contact & Location Card */}
      <CardWithCollapse
        section="contact"
        title="Contact & Location"
        description="Your contact and address information"
      >
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <InputWithIcon
              icon={Phone}
              label="Contact Number"
              value={formValues.contactNumber}
              onChange={(e) => handleLocalChange('contactNumber', e.target.value)}
            />
            <InputWithIcon
              icon={Globe}
              label="Nationality"
              value={formValues.nationality}
              onChange={(e) => handleLocalChange('nationality', e.target.value)}
            />
          </div>
          
          <div className="grid gap-4">
            <InputWithIcon
              icon={Home}
              label="Present Address"
              value={formValues.presentAddress}
              onChange={(e) => handleLocalChange('presentAddress', e.target.value)}
            />
            <InputWithIcon
              icon={Building2}
              label="Permanent Address"
              value={formValues.permanentAddress}
              onChange={(e) => handleLocalChange('permanentAddress', e.target.value)}
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <InputWithIcon
              icon={Flag}
              label="Place of Birth"
              value={formValues.placeOfBirth}
              onChange={(e) => handleLocalChange('placeOfBirth', e.target.value)}
            />
            <InputWithIcon
              icon={Globe}
              label="Country of Birth"
              value={formValues.countryOfBirth}
              onChange={(e) => handleLocalChange('countryOfBirth', e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={() => handleSectionSave('contact', {
              contactNumber: formValues.contactNumber,
              nationality: formValues.nationality,
              presentAddress: formValues.presentAddress,
              permanentAddress: formValues.permanentAddress,
              placeOfBirth: formValues.placeOfBirth,
              countryOfBirth: formValues.countryOfBirth
            })}
            disabled={settingsLoading}
          >
            {settingsLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Saving Contact Info...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Contact Info
              </>
            )}
          </Button>
        </CardFooter>
      </CardWithCollapse>

      {/* Documents & Identity Card */}
      <CardWithCollapse
        section="documents"
        title="Documents & Identity"
        description="Your identification documents"
      >
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <InputWithIcon
              icon={IdCard}
              label="Passport Number"
              value={formValues.passportNumber}
              onChange={(e) => handleLocalChange('passportNumber', e.target.value)}
            />
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                Passport Expiry
              </Label>
              <Input
                type="date"
                value={formValues.passportExpiry}
                onChange={(e) => handleLocalChange('passportExpiry', e.target.value)}
              />
            </div>
          </div>
          <InputWithIcon
            icon={Flag}
            label="Citizenship"
            value={formValues.citizenship}
            onChange={(e) => handleLocalChange('citizenship', e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={() => handleSectionSave('documents', {
              passportNumber: formValues.passportNumber,
              passportExpiry: formValues.passportExpiry,
              citizenship: formValues.citizenship
            })}
            disabled={settingsLoading}
          >
            {settingsLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Saving Documents...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Documents
              </>
            )}
          </Button>
        </CardFooter>
      </CardWithCollapse>

      {/* Education Card */}
      <CardWithCollapse
        section="education"
        title="Education"
        description="Your educational background"
      >
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <InputWithIcon
              icon={GraduationCap}
              label="Degree"
              value={formValues.education}
              onChange={(e) => handleLocalChange('education', e.target.value)}
            />
            <InputWithIcon
              icon={Book}
              label="Field of Study"
              value={formValues.fieldOfStudy}
              onChange={(e) => handleLocalChange('fieldOfStudy', e.target.value)}
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <InputWithIcon
              icon={School}
              label="Institution"
              value={formValues.institution}
              onChange={(e) => handleLocalChange('institution', e.target.value)}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <InputWithIcon
                icon={CalendarIcon}
                label="Year of Passing"
                type="number"
                value={formValues.yearOfPassing}
                onChange={(e) => handleLocalChange('yearOfPassing', e.target.value)}
              />
              <InputWithIcon
                icon={GraduationCap}
                label="GPA"
                type="number"
                step="0.01"
                value={formValues.gpa}
                onChange={(e) => handleLocalChange('gpa', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={() => handleSectionSave('education', {
              education: formValues.education,
              fieldOfStudy: formValues.fieldOfStudy,
              institution: formValues.institution,
              yearOfPassing: formValues.yearOfPassing,
              gpa: formValues.gpa
            })}
            disabled={settingsLoading}
          >
            {settingsLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Saving Education...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Education
              </>
            )}
          </Button>
        </CardFooter>
      </CardWithCollapse>

      {/* Additional Information Card */}
      <CardWithCollapse
        section="additional"
        title="Additional Information"
        description="Other relevant details"
      >
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Additional Information
              </Label>
              <textarea
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Any additional information you'd like to share..."
                value={formValues.additionalInfo}
                onChange={(e) => handleLocalChange('additionalInfo', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={() => handleSectionSave('additional', {
              additionalInfo: formValues.additionalInfo
            })}
            disabled={settingsLoading}
          >
            {settingsLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Saving Additional Info...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Additional Info
              </>
            )}
          </Button>
        </CardFooter>
      </CardWithCollapse>
    </div>
  )
} 