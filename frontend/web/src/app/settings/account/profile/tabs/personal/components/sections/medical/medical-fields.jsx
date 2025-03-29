import React from 'react';
import { FormFields, TextareaFields, ListFields } from '../components/form-fields';
import { Heart, Activity, Pill, AlertCircle, FileText } from "lucide-react";

// Constants
const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'O_POSITIVE', 'O_NEGATIVE', 'A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE'
].map(group => ({ value: group, label: group }));

export default function MedicalFormFields({ formValues, handleChange }) {
  const selectFields = [
    {
      name: 'bloodGroup',
      label: 'Blood Group',
      placeholder: 'Select blood group',
      options: BLOOD_GROUPS
    }
  ];

  const fields = [
    {
      name: 'allergies',
      label: 'Allergies',
      icon: AlertCircle,
      placeholder: 'Enter allergies (if any)'
    },
    {
      name: 'medications',
      label: 'Current Medications',
      icon: Pill,
      placeholder: 'Enter current medications'
    }
  ];

  const checkboxFields = [
    {
      name: 'cancerHistory',
      label: 'Has cancer history'
    }
  ];

  const cancerFields = formValues.cancerHistory ? [
    {
      name: 'cancerType',
      label: 'Cancer Type',
      icon: FileText,
      placeholder: 'Specify cancer type'
    }
  ] : [];

  const listFields = [
    {
      name: 'conditions',
      path: 'medicalHistory.conditions',
      label: 'Medical History - Conditions',
      placeholder: 'Add new condition'
    },
    {
      name: 'surgeries',
      path: 'medicalHistory.surgeries',
      label: 'Medical History - Surgeries',
      placeholder: 'Add surgery (e.g., Appendectomy 2019)'
    },
    {
      name: 'chronicDiseases',
      label: 'Chronic Diseases',
      placeholder: 'Add chronic disease (e.g., Diabetes)'
    }
  ];

  const textareaFields = [
    {
      name: 'medicalNotes',
      label: 'Medical Notes',
      placeholder: 'Enter any additional medical information',
      className: 'min-h-[100px]'
    }
  ];

  return (
    <div className="space-y-4">
      <FormFields 
        formValues={formValues} 
        handleChange={handleChange} 
        fields={fields}
        selectFields={selectFields}
        checkboxFields={checkboxFields}
      />
      
      {formValues.cancerHistory && (
        <FormFields 
          formValues={formValues} 
          handleChange={handleChange} 
          fields={cancerFields}
        />
      )}
      
      <ListFields
        formValues={formValues}
        handleChange={handleChange}
        fields={listFields}
      />
      
      <TextareaFields
        formValues={formValues}
        handleChange={handleChange}
        fields={textareaFields}
      />
    </div>
  );
}
