import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { SettingsService } from '@/services/settings/account/personal';
import { toast } from "react-hot-toast";
import { FormSectionSkeleton } from "../../skeleton";
import { Save } from "lucide-react";
import MedicalDocuments from './medical-documents';
import { CurrentHealth } from './components/current-health';
import { MedicalHistory } from './components/medical-history';
import { CurrentCare } from './components/current-care';
import { AdditionalInfo } from './components/additional-info';
import MedicalReports from './medical-reports';

export default function MedicalSection({ profile, handleSave, loading }) {
  const [formValues, setFormValues] = useState({
    medicalHistory: { condition: '', details: '' },
    chronicDiseases: { condition: '', details: '' },
    cancerHistory: false,
    cancerType: '',
    allergies: '',
    medications: '',
    bloodGroup: '',
    organDonor: false,
    vaccinationRecords: { 'COVID-19': '' },
    geneticDisorders: { condition: '' },
    disabilities: { physical: '', mental: '' },
    emergencyContact: '',
    primaryPhysician: '',
    documents: [],
    reports: []
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form values from profile data
  useEffect(() => {
    if (profile?.medical) {
      setFormValues({
        medicalHistory: profile.medical.medicalHistory || { condition: '', details: '' },
        chronicDiseases: profile.medical.chronicDiseases || { condition: '', details: '' },
        cancerHistory: profile.medical.cancerHistory || false,
        cancerType: profile.medical.cancerType || '',
        allergies: profile.medical.allergies || '',
        medications: profile.medical.medications || '',
        bloodGroup: profile.medical.bloodGroup || '',
        organDonor: profile.medical.organDonor || false,
        vaccinationRecords: profile.medical.vaccinationRecords || { 'COVID-19': '' },
        geneticDisorders: profile.medical.geneticDisorders || { condition: '' },
        disabilities: profile.medical.disabilities || { physical: '', mental: '' },
        emergencyContact: profile.medical.emergencyContact || '',
        primaryPhysician: profile.medical.primaryPhysician || '',
        documents: profile.medical.documents || [],
        reports: profile.medical.reports || []
      });
    }
  }, [profile]);

  // Track form changes
  const handleFormChange = useCallback((newValues) => {
    setFormValues(newValues);
    setHasChanges(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasChanges) {
      toast.info('No changes to save');
      return;
    }

    setIsSaving(true);
    try {
      const success = await handleSave(formValues);
      if (success) {
        toast.success('Medical information updated successfully');
        setHasChanges(false);
      }
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = useCallback(async (file) => {
    const newItem = {
      id: crypto.randomUUID(),
      type: 'DOCUMENT',
      date: new Date().toISOString(),
      details: {
        name: file.name,
        type: file.type,
        url: file.url,
        ...file.metadata
      },
      doctorId: file.metadata?.doctorId,
      notes: file.metadata?.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setHasChanges(true);
    // Update local state
    handleFormChange({
      ...formValues,
      documents: [newItem, ...formValues.documents]
    });
  }, [formValues, handleFormChange]);

  if (loading) {
    return <FormSectionSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <CurrentHealth
            formValues={formValues}
            setFormValues={handleFormChange}
          />
          <MedicalHistory
            formValues={formValues}
            setFormValues={handleFormChange}
          />
        </div>
        <div className="space-y-6">
          <CurrentCare
            formValues={formValues}
            setFormValues={handleFormChange}
          />
          <AdditionalInfo
            formValues={formValues}
            setFormValues={handleFormChange}
          />
        </div>
      </div>

      
      <div className="space-y-6">

        
        <MedicalReports reports={formValues.reports} />


        <MedicalDocuments documents={formValues.documents} onUpload={handleFileUpload} />
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSaving || !hasChanges}
          className="w-full sm:w-auto"
        >
          {isSaving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
