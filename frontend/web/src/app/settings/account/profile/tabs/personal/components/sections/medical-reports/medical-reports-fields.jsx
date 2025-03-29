import React from 'react';
import { FormFields } from '../components/form-fields';
import { FileText, CalendarIcon } from "lucide-react";

export default function MedicalReportsFormFields({ formValues, handleChange }) {
  const fields = [
    {
      name: 'reportType',
      label: 'Report Type',
      icon: FileText,
      placeholder: 'Enter report type (e.g., Blood Test)',
      required: true
    },
    {
      name: 'doctorId',
      label: 'Doctor ID',
      icon: FileText,
      placeholder: 'Enter doctor ID'
    }
  ];

  const dateFields = [
    {
      name: 'reportDate',
      label: 'Report Date',
      placeholder: 'Select report date',
      required: true
    }
  ];

  const detailFields = [
    {
      name: 'hemoglobin',
      path: 'reportDetails.hemoglobin',
      label: 'Hemoglobin',
      icon: FileText,
      placeholder: 'Enter hemoglobin value'
    },
    {
      name: 'bloodSugar',
      path: 'reportDetails.bloodSugar',
      label: 'Blood Sugar',
      icon: FileText,
      placeholder: 'Enter blood sugar value'
    }
  ];

  return (
    <div className="space-y-4">
      <FormFields 
        formValues={formValues} 
        handleChange={handleChange} 
        fields={fields}
        dateFields={dateFields}
      />
      
      <FormFields 
        formValues={formValues} 
        handleChange={handleChange} 
        fields={detailFields}
      />
    </div>
  );
}
