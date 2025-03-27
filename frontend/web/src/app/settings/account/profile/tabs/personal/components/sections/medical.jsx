import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { InputWithIcon } from "@/components/input-with-icon"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Heart, 
  Activity,
  Pill,
  AlertCircle,
  FileText,
  Save,
  Loader,
} from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

// Constants
const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'O_POSITIVE', 'O_NEGATIVE', 'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE'
]

export default function MedicalSection({
  formValues,
  handleChange,
  handleSave,
  loading,
  profile
}) {
  const [saving, setSaving] = useState(false)
  const [localFormValues, setLocalFormValues] = useState({
    bloodGroup: '',
    allergies: '',
    chronicConditions: '',
    medications: '',
    medicalNotes: '',
    cancerHistory: false,
    cancerType: '',
    medicalHistory: { conditions: [], surgeries: [] },
    chronicDiseases: []
  })
  const [dataInitialized, setDataInitialized] = useState(false)
  
  // Initialize local form values when props change
  useEffect(() => {
    try {
      if (formValues && Object.keys(formValues).length > 0) {
        // Check if medical data exists in formValues or profile
        const medical = formValues.medical?.[0] || profile?.basicInfo?.medical?.[0] || null;
        
        setLocalFormValues({
          bloodGroup: formValues.bloodGroup || (medical?.bloodGroup || profile?.personal?.[0]?.bloodGroup || ''),
          allergies: medical?.allergies || formValues.allergies || '',
          medications: medical?.medications || formValues.medications || '',
          medicalNotes: formValues.medicalNotes || '',
          cancerHistory: medical?.cancerHistory || formValues.cancerHistory || false,
          cancerType: medical?.cancerType || formValues.cancerType || '',
          medicalHistory: medical?.medicalHistory || { conditions: [], surgeries: [] },
          chronicDiseases: medical?.chronicDiseases || [],
          chronicConditions: formValues.chronicConditions || ''
        });
        
        setDataInitialized(true);
      }
    } catch (error) {
      console.error("Error initializing medical form values:", error);
    }
  }, [formValues, profile]);

  // Handle local form changes
  const handleLocalChange = useCallback((field, value) => {
    try {
      // Handle nested objects
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        setLocalFormValues(prev => ({
          ...prev,
          [parent]: {
            ...(prev[parent] || {}),
            [child]: value
          }
        }));
        return;
      }
      
      // Update local state
      setLocalFormValues(prev => ({
        ...prev,
        [field]: value
      }));
      
      // Propagate change to parent component
      handleChange(field, value);
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.error(`Failed to update ${field}`);
    }
  }, [handleChange]);

  // Add or remove a condition
  const handleAddCondition = useCallback((condition) => {
    setLocalFormValues(prev => {
      const currentConditions = prev.medicalHistory?.conditions || [];
      return {
        ...prev,
        medicalHistory: {
          ...prev.medicalHistory,
          conditions: [...currentConditions, condition]
        }
      };
    });
  }, []);

  // Memoize the submit handler for better performance
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      // Extract medical info fields
      const medicalInfo = {
        bloodGroup: localFormValues.bloodGroup,
        allergies: localFormValues.allergies,
        medications: localFormValues.medications,
        medicalNotes: localFormValues.medicalNotes,
        cancerHistory: localFormValues.cancerHistory,
        cancerType: localFormValues.cancerType,
        medicalHistory: localFormValues.medicalHistory,
        chronicDiseases: localFormValues.chronicDiseases,
        chronicConditions: localFormValues.chronicConditions
      }

      await handleSave('medical', medicalInfo)
      toast.success("Medical information saved successfully")
    } catch (error) {
      console.error("Error saving medical info:", error)
      toast.error("Failed to save medical information")
    } finally {
      setSaving(false)
    }
  }, [localFormValues, handleSave])

  // Memoize the medical fields for better performance
  const MedicalFields = useMemo(() => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid w-full items-center gap-1.5">
          <label htmlFor="blood-group" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Blood Group
          </label>
          <Select 
            value={localFormValues.bloodGroup} 
            onValueChange={(value) => handleLocalChange('bloodGroup', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select blood group" />
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
          icon={AlertCircle}
          label="Allergies"
          value={localFormValues.allergies}
          onChange={(e) => handleLocalChange('allergies', e.target.value)}
          placeholder="Enter allergies (if any)"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">
          Medical History - Conditions
        </label>
        <div className="border rounded-md p-3">
          {localFormValues.medicalHistory?.conditions?.map((condition, index) => (
            <div key={index} className="flex items-center justify-between py-1">
              <span>{condition}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  const newConditions = [...localFormValues.medicalHistory.conditions];
                  newConditions.splice(index, 1);
                  handleLocalChange('medicalHistory.conditions', newConditions);
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <div className="flex mt-2">
            <input 
              className="flex-1 h-9 rounded-l-md border border-input bg-background px-3 py-1 text-sm"
              placeholder="Add new condition"
              id="new-condition"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = e.target.value.trim();
                  if (!value) return;
                  
                  const newConditions = [...(localFormValues.medicalHistory?.conditions || []), value];
                  handleLocalChange('medicalHistory.conditions', newConditions);
                  e.target.value = '';
                }
              }}
            />
            <Button 
              className="rounded-l-none"
              onClick={() => {
                const input = document.getElementById('new-condition');
                const value = input.value.trim();
                if (!value) return;
                
                const newConditions = [...(localFormValues.medicalHistory?.conditions || []), value];
                handleLocalChange('medicalHistory.conditions', newConditions);
                input.value = '';
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">
          Medical History - Surgeries
        </label>
        <div className="border rounded-md p-3">
          {localFormValues.medicalHistory?.surgeries?.map((surgery, index) => (
            <div key={index} className="flex items-center justify-between py-1">
              <span>{surgery}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  const newSurgeries = [...localFormValues.medicalHistory.surgeries];
                  newSurgeries.splice(index, 1);
                  handleLocalChange('medicalHistory.surgeries', newSurgeries);
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <div className="flex mt-2">
            <input 
              className="flex-1 h-9 rounded-l-md border border-input bg-background px-3 py-1 text-sm"
              placeholder="Add surgery (e.g., Appendectomy 2019)"
              id="new-surgery"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = e.target.value.trim();
                  if (!value) return;
                  
                  const newSurgeries = [...(localFormValues.medicalHistory?.surgeries || []), value];
                  handleLocalChange('medicalHistory.surgeries', newSurgeries);
                  e.target.value = '';
                }
              }}
            />
            <Button 
              className="rounded-l-none"
              onClick={() => {
                const input = document.getElementById('new-surgery');
                const value = input.value.trim();
                if (!value) return;
                
                const newSurgeries = [...(localFormValues.medicalHistory?.surgeries || []), value];
                handleLocalChange('medicalHistory.surgeries', newSurgeries);
                input.value = '';
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">
          Chronic Diseases
        </label>
        <div className="border rounded-md p-3">
          {localFormValues.chronicDiseases?.map((disease, index) => (
            <div key={index} className="flex items-center justify-between py-1">
              <span>{disease}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  const newDiseases = [...localFormValues.chronicDiseases];
                  newDiseases.splice(index, 1);
                  handleLocalChange('chronicDiseases', newDiseases);
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <div className="flex mt-2">
            <input 
              className="flex-1 h-9 rounded-l-md border border-input bg-background px-3 py-1 text-sm"
              placeholder="Add chronic disease (e.g., Diabetes)"
              id="new-disease"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = e.target.value.trim();
                  if (!value) return;
                  
                  const newDiseases = [...(localFormValues.chronicDiseases || []), value];
                  handleLocalChange('chronicDiseases', newDiseases);
                  e.target.value = '';
                }
              }}
            />
            <Button 
              className="rounded-l-none"
              onClick={() => {
                const input = document.getElementById('new-disease');
                const value = input.value.trim();
                if (!value) return;
                
                const newDiseases = [...(localFormValues.chronicDiseases || []), value];
                handleLocalChange('chronicDiseases', newDiseases);
                input.value = '';
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
      
      <InputWithIcon
        icon={Pill}
        label="Current Medications"
        value={localFormValues.medications}
        onChange={(e) => handleLocalChange('medications', e.target.value)}
        placeholder="Enter current medications"
      />
      
      <div className="grid w-full items-center gap-1.5">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="cancer-history"
            checked={localFormValues.cancerHistory}
            onCheckedChange={(checked) => handleLocalChange('cancerHistory', checked)}
          />
          <label htmlFor="cancer-history" className="text-sm font-medium leading-none">
            Has cancer history
          </label>
        </div>
      </div>
      
      {localFormValues.cancerHistory && (
        <InputWithIcon
          icon={FileText}
          label="Cancer Type"
          value={localFormValues.cancerType || ''}
          onChange={(e) => handleLocalChange('cancerType', e.target.value)}
          placeholder="Specify cancer type"
        />
      )}
      
      <div className="grid w-full items-center gap-1.5">
        <label htmlFor="medical-notes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Medical Notes
        </label>
        <Textarea
          id="medical-notes"
          value={localFormValues.medicalNotes}
          onChange={(e) => handleLocalChange('medicalNotes', e.target.value)}
          placeholder="Enter any additional medical information"
          className="min-h-[100px]"
        />
      </div>
    </div>
  ), [localFormValues, handleLocalChange])

  // Memoize the save button for better performance
  const SaveButton = useMemo(() => (
    <div className="flex justify-end mt-6">
      <Button 
        type="submit" 
        disabled={saving || loading || !dataInitialized}
        className="w-fit"
      >
        {(saving || loading) && (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        )}
        <Save className="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>
  ), [saving, loading, dataInitialized])

  // If data is not yet initialized, show a loading message
  if (!dataInitialized) {
    return <div className="py-4">Loading medical information...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {MedicalFields}
      {SaveButton}
    </form>
  )
}
