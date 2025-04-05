import { useState, useEffect, useMemo } from "react"
import React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { InputWithIcon } from "@/components/input-with-icon"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import WebsiteList from "./components/websites/website-list";
import { FormFields } from "@/components/shared/form-fields";
import { PhoneNumberForm } from "./components/phone-number-form";
import WebsiteForm from "./components/websites/website-form";
import { CheckCircle2, AlertCircle, Info, ChevronUp, ChevronDown, FileText, Copy, Plus, Pencil, Trash2, Globe, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { SettingsService } from "@/services/settings/account/personal";
import { AddressForm } from "./components/address-form";


export default function ContactTab({ profile, formData, handleChange, handleSave, settingsLoading, updateSettings }) {
  // Local form state - updated to include address fields
  const [localForm, setLocalForm] = useState({
    phoneNumbers: [],
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: ""
    },
    presentAddress: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: ""
    },
    permanentAddress: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: ""
    },
    nationality: "",
    websites: []
  });

  // Track form changes
  const [isDirty, setIsDirty] = useState(false);

  // Function to mask phone numbers
  const maskPhoneNumber = (number) => {
    if (!number) return '';
    console.log('Masking phone number:', number);
    // Keep only the last 4 digits visible
    const visibleDigits = number.slice(-4);
    const maskedPart = '•'.repeat(number.length - 4);
    const masked = maskedPart + visibleDigits;
    console.log('Masked phone number:', masked);
    return masked;
  };

  // Initialize form with data
  useEffect(() => {
    console.log('Profile data received:', profile);

    if (profile?.personal?.[0]) {
      const personal = profile.personal[0];
      const contact = personal.contact || {};
      const addresses = personal.addresses || [];
      const websites = personal.websites || [];

      // Process addresses
      const currentAddress = addresses.find(addr => addr.type === 'CURRENT')?.details || {};
      const presentAddress = addresses.find(addr => addr.type === 'PRESENT')?.details || {};
      const permanentAddress = addresses.find(addr => addr.type === 'PERMANENT')?.details || {};

      // Process phone numbers
      const phoneNumbers = Array.isArray(contact.phone)
        ? contact.phone.map(phone => ({
          id: phone.id || Date.now().toString(),
          number: phone.number || '',
          isPrimary: phone.isPrimary || false,
          isVerified: phone.isVerified || false
        }))
        : [];

      // Process websites
      const processedWebsites = Array.isArray(websites)
        ? websites.map(website => ({
          id: website.id || Date.now().toString(),
          category: website.category || '',
          name: website.name || '',
          url: website.url || '',
          username: website.username || ''
        }))
        : [];

      console.log('Raw phone numbers:', phoneNumbers);
      console.log('Raw websites:', processedWebsites);

      setLocalForm({
        phoneNumbers,
        address: {
          street: currentAddress.street || "",
          city: currentAddress.city || "",
          state: currentAddress.state || "",
          country: currentAddress.country || "",
          zipCode: currentAddress.postalCode || ""
        },
        presentAddress: {
          street: presentAddress.street || "",
          city: presentAddress.city || "",
          state: presentAddress.state || "",
          country: presentAddress.country || "",
          zipCode: presentAddress.postalCode || ""
        },
        permanentAddress: {
          street: permanentAddress.street || "",
          city: permanentAddress.city || "",
          state: permanentAddress.state || "",
          country: permanentAddress.country || "",
          zipCode: permanentAddress.postalCode || ""
        },
        nationality: personal.origin?.nationality || "",
        websites: processedWebsites
      });
      setIsDirty(false);
    } else if (profile?.personal) {
      // Handle case where personal is not an array
      const contact = profile.personal.contact || {};
      const addresses = profile.personal.addresses || [];
      const websites = profile.personal.websites || [];

      const currentAddress = addresses.find(addr => addr.type === 'CURRENT')?.details || {};
      const presentAddress = addresses.find(addr => addr.type === 'PRESENT')?.details || {};
      const permanentAddress = addresses.find(addr => addr.type === 'PERMANENT')?.details || {};

      const phoneNumbers = Array.isArray(contact.phone)
        ? contact.phone.map(phone => ({
          id: phone.id || Date.now().toString(),
          number: phone.number || '',
          isPrimary: phone.isPrimary || false,
          isVerified: phone.isVerified || false
        }))
        : [];

      const processedWebsites = Array.isArray(websites)
        ? websites.map(website => ({
          id: website.id || Date.now().toString(),
          category: website.category || '',
          name: website.name || '',
          url: website.url || '',
          username: website.username || ''
        }))
        : [];

      setLocalForm({
        phoneNumbers,
        address: {
          street: currentAddress.street || "",
          city: currentAddress.city || "",
          state: currentAddress.state || "",
          country: currentAddress.country || "",
          zipCode: currentAddress.postalCode || ""
        },
        presentAddress: {
          street: presentAddress.street || "",
          city: presentAddress.city || "",
          state: presentAddress.state || "",
          country: presentAddress.country || "",
          zipCode: presentAddress.postalCode || ""
        },
        permanentAddress: {
          street: permanentAddress.street || "",
          city: permanentAddress.city || "",
          state: permanentAddress.state || "",
          country: permanentAddress.country || "",
          zipCode: permanentAddress.postalCode || ""
        },
        nationality: profile.personal.origin?.nationality || "",
        websites: processedWebsites
      });
      setIsDirty(false);
    }
  }, [profile]);

  // Function to mask email
  const maskEmail = (email) => {
    if (!email) return '';
    console.log('Masking email:', email);
    const atIndex = email.indexOf('@');
    if (atIndex === -1) return email;
    const firstPart = email.substring(0, atIndex);
    const lastPart = email.substring(atIndex);
    const maskedFirst = firstPart[0] + '•'.repeat(firstPart.length - 2) + firstPart[firstPart.length - 1];
    const masked = maskedFirst + lastPart;
    console.log('Masked email:', masked);
    return masked;
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setLocalForm(prev => ({
      ...prev,
      [name]: value
    }));
    setIsDirty(true);
  };

  // Handle address changes
  const handleAddressChange = (addressKey, name, value) => {
    setLocalForm(prev => ({
      ...prev,
      [addressKey]: {
        ...prev[addressKey],
        [name]: value
      }
    }));
    setIsDirty(true);
  };

  // Handle address save
  const handleAddressSave = async (address, addressKey) => {
    try {
      const response = await SettingsService.updateAddress(addressKey, address);
      if (response.success) {
        toast.success(`${addressKey.replace('Address', '')} address saved successfully`);
        setLocalForm(prev => ({
          ...prev,
          [addressKey]: address
        }));
        setIsDirty(true);
      }
    } catch (error) {
      toast.error('Failed to save address');
      console.error('Error saving address:', error);
    }
  };

  // State for phone number dialog
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState(null);

  // Handle phone number edit
  const handleEditPhone = (phone) => {
    console.log('Editing phone:', phone);
    setSelectedPhone(phone);
    setIsPhoneDialogOpen(true);
  };

  // Handle phone number form submission
  const handlePhoneSave = async (data) => {
    try {
      if (selectedPhone) {
        // Update existing phone number
        const response = await SettingsService.updateContactNumber(selectedPhone.id, {
          number: data.number,
          isPrimary: data.isPrimary,
          isVerified: data.isVerified
        });
        if (response.success) {
          setLocalForm(prev => ({
            ...prev,
            phoneNumbers: prev.phoneNumbers.map(phone =>
              phone.id === selectedPhone.id ? {
                ...phone,
                number: data.number,
                isPrimary: data.isPrimary,
                isVerified: data.isVerified
              } : phone
            )
          }));
          toast.success('Phone number updated successfully');
        }
      } else {
        // Create new phone number
        const response = await SettingsService.createContactNumber({
          number: data.number,
          isPrimary: data.isPrimary,
          isVerified: data.isVerified
        });
        if (response.success) {
          setLocalForm(prev => ({
            ...prev,
            phoneNumbers: [...prev.phoneNumbers, {
              id: response.data.id,
              number: data.number,
              isPrimary: data.isPrimary,
              isVerified: data.isVerified
            }]
          }));
          toast.success('Phone number added successfully');
        }
      }
      setIsDirty(true);
    } catch (error) {
      toast.error('Failed to save phone number');
      console.error('Error saving phone number:', error);
    } finally {
      setSelectedPhone(null);
      setIsPhoneDialogOpen(false);
    }
  };

  // Handle phone number delete
  const [deleteItemId, setDeleteItemId] = React.useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deleteType, setDeleteType] = React.useState(null);

  const handleDeleteConfirmation = (id, type) => {
    setDeleteItemId(id);
    setDeleteType(type);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (deleteType === 'phone') {
        await SettingsService.deleteContactNumber(deleteItemId);
        setLocalForm(prev => ({
          ...prev,
          phoneNumbers: prev.phoneNumbers.filter(phone => phone.id !== deleteItemId)
        }));
        toast.success('Phone number deleted successfully');
      } else if (deleteType === 'website') {
        await SettingsService.deleteWebsite(deleteItemId);
        setLocalForm(prev => ({
          ...prev,
          websites: prev.websites.filter(website => website.id !== deleteItemId)
        }));
        toast.success('Website deleted successfully');
      }
      setIsDirty(true);
    } catch (error) {
      toast.error('Failed to delete item');
      console.error('Error deleting item:', error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  // State for website dialog
  const [isWebsiteDialogOpen, setIsWebsiteDialogOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);

  // Handle website form submission
  const handleWebsiteSave = async (data) => {
    try {
      if (selectedWebsite) {
        // Update existing website
        const response = await SettingsService.updateWebsite(selectedWebsite.id, {
          category: data.category,
          name: data.name,
          url: data.url,
          username: data.username
        });
        if (response.success) {
          setLocalForm(prev => ({
            ...prev,
            websites: prev.websites.map(website =>
              website.id === selectedWebsite.id ? {
                ...website,
                category: data.category,
                name: data.name,
                url: data.url,
                username: data.username
              } : website
            )
          }));
          toast.success('Website updated successfully');
        }
      } else {
        // Create new website
        const response = await SettingsService.createWebsite({
          category: data.category,
          name: data.name,
          url: data.url,
          username: data.username
        });
        if (response.success) {
          setLocalForm(prev => ({
            ...prev,
            websites: [...prev.websites, {
              id: response.data.id,
              category: data.category,
              name: data.name,
              url: data.url,
              username: data.username
            }]
          }));
          toast.success('Website added successfully');
        }
      }
      setIsDirty(true);
    } catch (error) {
      toast.error('Failed to save website');
      console.error('Error saving website:', error);
    } finally {
      setSelectedWebsite(null);
      setIsWebsiteDialogOpen(false);
    }
  };

  // Handle website edit
  const handleEditWebsite = (website) => {
    console.log('Editing website:', website);
    setSelectedWebsite(website);
    setIsWebsiteDialogOpen(true);
  };

  // Handle website delete
  const handleDeleteWebsite = (websiteId) => {
    handleDeleteConfirmation(websiteId, 'website');
  };

  // Handle save operation
  const handleLocalSave = async () => {
    console.log('Saving form:', localForm);
    try {
      // Prepare addresses data
      const addresses = [
        {
          type: 'CURRENT',
          details: localForm.address
        },
        {
          type: 'PRESENT',
          details: localForm.presentAddress
        },
        {
          type: 'PERMANENT',
          details: localForm.permanentAddress
        }
      ];

      // Prepare contact data
      const contactData = {
        phone: localForm.phoneNumbers.map(phone => ({
          id: phone.id,
          number: phone.number,
          isPrimary: phone.isPrimary,
          isVerified: phone.isVerified
        })),
        addresses,
        origin: {
          nationality: localForm.nationality
        },
        websites: localForm.websites.map(website => ({
          id: website.id,
          category: website.category,
          name: website.name,
          url: website.url,
          username: website.username
        }))
      };

      // Update contact information
      const response = await SettingsService.updateContact(contactData);
      if (response.success) {
        setIsDirty(false);
        toast.success('Contact information updated successfully');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to update contact information');
    }
  };

  // Render the form
  return (
    <div className="space-y-6">
      {/* Phone Numbers */}
      <Card className="hover:shadow-sm transition-shadow">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Phone Numbers</CardTitle>
              <CardDescription className="mt-1">Add or edit your phone numbers</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPhoneDialogOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Number
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {localForm.phoneNumbers.length > 0 ? (
            localForm.phoneNumbers.map((phone) => (
              <div key={phone.id || phone.number} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-background rounded-lg">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-base">{phone.number}</p>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <Badge variant={phone.isPrimary ? "warning" : "secondary"} size="sm" className="font-medium">
                        {phone.isPrimary ? "Primary" : "Secondary"}
                      </Badge>
                      <Badge variant={phone.isVerified ? "success" : "default"} size="sm" className="font-medium">
                        {phone.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditPhone(phone)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteConfirmation(phone.id, 'phone')}
                    className="h-8 w-8 p-0 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-6 space-y-3 text-center">
              <Phone className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No phone numbers added yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone Number Dialog */}
      <PhoneNumberForm
        isOpen={isPhoneDialogOpen}
        onClose={() => {
          setIsPhoneDialogOpen(false);
          setSelectedPhone(null);
        }}
        onSave={handlePhoneSave}
        initialData={selectedPhone || { number: "", isPrimary: false, isVerified: false }}
      />

      {/* Websites */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Websites</CardTitle>
              <CardDescription className="mt-1">Add or edit your websites</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWebsiteDialogOpen(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Website
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {localForm.websites.length > 0 ? (
            localForm.websites.map((website) => (
              <div key={website.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-background rounded-lg">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-base">{website.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{website.url}</p>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <Badge variant="secondary" size="sm" className="font-medium">
                        {website.category}
                      </Badge>
                      {website.username && (
                        <Badge variant="outline" size="sm" className="font-medium">
                          @{website.username}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditWebsite(website)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteConfirmation(website.id, 'website')}
                    className="h-8 w-8 p-0 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-6 space-y-3 text-center">
              <Globe className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No websites added yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card>
        <CardHeader>
          <CardTitle>Addresses</CardTitle>
          <CardDescription>Manage your residential and contact addresses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Address */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-md font-medium">Current Address</h3>
                  <p className="text-sm text-muted-foreground">Your current residential address</p>
                </div>
              </div>
              <AddressForm
                initialData={{
                  ...localForm.address,
                  nationality: localForm.nationality
                }}
                onSubmit={(address) => {
                  handleAddressSave(address, 'address');
                  handleFormChange({ target: { name: 'nationality', value: address.nationality } });
                }}
                copyFromPresent={false}
              />
            </div>

            {/* Present Address */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-md font-medium">Present Address</h3>
                  <p className="text-sm text-muted-foreground">Your current work or living address</p>
                </div>
              </div>
              <AddressForm
                initialData={{
                  ...localForm.presentAddress,
                  nationality: localForm.nationality
                }}
                onSubmit={(address) => {
                  handleAddressSave(address, 'presentAddress');
                  handleFormChange({ target: { name: 'nationality', value: address.nationality } });
                }}
                copyFromPresent={false}
              />
            </div>

            {/* Permanent Address */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-md font-medium">Permanent Address</h3>
                  <p className="text-sm text-muted-foreground">Your permanent home address</p>
                </div>
              </div>
              <AddressForm
                initialData={{
                  ...localForm.permanentAddress,
                  nationality: localForm.nationality
                }}
                onSubmit={(address) => {
                  handleAddressSave(address, 'permanentAddress');
                  handleFormChange({ target: { name: 'nationality', value: address.nationality } });
                }}
                copyFromPresent={true}
                presentAddress={localForm.presentAddress}
              />
            </div>
            {/* Nationality */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-md font-medium">Nationality</h3>
                  <p className="text-sm text-muted-foreground">Your country of origin</p>
                </div>
              </div>
              <InputWithIcon
                icon={Info}
                label="Nationality"
                value={localForm.nationality}
                onChange={(e) => handleFormChange(e)}
                placeholder="Enter your nationality"
                name="nationality"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <Button
                type="button"
                onClick={handleLocalSave}
                disabled={!isDirty || settingsLoading}
                className="w-auto"
              >
                {settingsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Website Dialog */}
      <WebsiteForm
        isOpen={isWebsiteDialogOpen}
        onClose={() => {
          setIsWebsiteDialogOpen(false);
          setSelectedWebsite(null);
        }}
        onSave={handleWebsiteSave}
        initialData={selectedWebsite || { id: '', category: '', name: '', url: '', username: '' }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deleteType}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}