import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { SettingsService } from '@/services/settings/account/personal';
import { toast } from "react-hot-toast";
import { FormSectionSkeleton } from "../../skeleton";
import { Save } from "lucide-react";
import MedicalDocuments from './medical-documents-fields';
import { CurrentHealth } from './components/current-health';
import { MedicalHistory } from './components/medical-history';
import { CurrentCare } from './components/current-care';
import { AdditionalInfo } from './components/additional-info';
import MedicalReports from './components/medical-reports';

const initialFormValues = {
  medicalHistory: {
    condition: '',
    details: ''
  },
  chronicDiseases: {
    condition: '',
    details: ''
  },
  cancerHistory: false,
  cancerType: '',
  allergies: '',
  medications: '',
  bloodGroup: '',
  organDonor: false,
  vaccinationRecords: {
    'COVID-19': ''
  },
  geneticDisorders: {
    condition: ''
  },
  disabilities: {
    physical: '',
    mental: ''
  },
  emergencyContact: '',
  primaryPhysician: '',
  documents: [],
  reports: []
};

export default function MedicalSection({ profile, loading }) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form values from profile data
  useEffect(() => {
    if (!profile) {
      console.warn('Profile data is undefined');
      return;
    }

    const medicalData = profile?.medical || {};
    setFormValues({
      medicalHistory: {
        condition: medicalData.medicalHistory?.condition || '',
        details: medicalData.medicalHistory?.details || ''
      },
      chronicDiseases: {
        condition: medicalData.chronicDiseases?.condition || '',
        details: medicalData.chronicDiseases?.details || ''
      },
      cancerHistory: medicalData.cancerHistory || false,
      cancerType: medicalData.cancerType || '',
      allergies: medicalData.allergies || '',
      medications: medicalData.medications || '',
      bloodGroup: medicalData.bloodGroup || '',
      organDonor: medicalData.organDonor || false,
      vaccinationRecords: {
        'COVID-19': medicalData.vaccinationRecords?.['COVID-19'] || ''
      },
      geneticDisorders: {
        condition: medicalData.geneticDisorders?.condition || ''
      },
      disabilities: {
        physical: medicalData.disabilities?.physical || '',
        mental: medicalData.disabilities?.mental || ''
      },
      emergencyContact: medicalData.emergencyContact || '',
      primaryPhysician: medicalData.primaryPhysician || '',
      documents: medicalData.documents || [],
      reports: medicalData.reports || []
    });
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

    if (!profile) {
      toast.error('Profile data is not available');
      return;
    }

    setIsSaving(true);
    try {
      console.log('Submitting form values:', formValues);
      const response = await SettingsService.updateMedicalInfo(formValues);
      console.log('API response:', response);
      if (response.success) {
        toast.success('Medical information updated successfully');
        setHasChanges(false);
      } else {
        throw new Error(response.error || 'Failed to update medical information');
      }
    } catch (error) {
      console.error('Error saving medical information:', error);
      toast.error('Failed to save changes: ' + error.message);
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

      <div className="flex justify-end pt-8">
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

      <div className="space-y-6">
        <MedicalReports reports={formValues.reports} />
        <MedicalDocuments documents={formValues.documents} onUpload={handleFileUpload} />
      </div>
    </form>
  );
}
