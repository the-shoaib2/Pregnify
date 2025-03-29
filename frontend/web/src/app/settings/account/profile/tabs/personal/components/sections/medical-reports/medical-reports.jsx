import React, { useState } from 'react'
import { SettingsService } from '@/services/settings/account/personal'
import Section from '../components/section'
import ItemFormDialog from '../components/item-form'
import MedicalReportsFormFields from './medical-reports-fields'
import { createServiceAdapter } from '../components/service-adapter'

export default function MedicalReportsSection({
  reports: initialReports = [],
  onAddReport,
  onUpdateReport,
  onDeleteReport,
  loading,
  profile
}) {
  // Create a service adapter for the medical reports API
  const [reportsService] = useState(() => createServiceAdapter(SettingsService, 'MedicalReports'));

  // Define the detail fields to display in the card
  const detailFields = [
    { key: 'reportDate', label: 'Report Date' },
    { key: 'doctorId', label: 'Doctor ID' },
    { key: 'reportDetails.hemoglobin', label: 'Hemoglobin' },
    { key: 'reportDetails.bloodSugar', label: 'Blood Sugar' }
  ];

  // Custom handlers to connect with the existing API functions
  const handleAdd = async (data) => {
    return await onAddReport(data);
  };

  const handleUpdate = async (id, data) => {
    return await onUpdateReport(id, data);
  };

  const handleDelete = async (id) => {
    return await onDeleteReport(id);
  };

  return (
    <Section
      formValues={initialReports}
      loading={loading}
      title="Medical Reports"
      description="Your medical reports and test results"
      emptyMessage="No medical reports added yet."
      ItemFormDialog={(props) => (
        <ItemFormDialog
          {...props}
          title="Medical Report"
          itemType="MedicalReport"
          apiService={{
            add: handleAdd,
            update: handleUpdate,
            delete: handleDelete,
            getAll: () => Promise.resolve(initialReports)
          }}
          FormFields={MedicalReportsFormFields}
        />
      )}
      apiService={{
        add: handleAdd,
        update: handleUpdate,
        delete: handleDelete,
        getAll: () => Promise.resolve(initialReports)
      }}
      itemType="MedicalReport"
      titleField="reportType"
      subtitleField="reportDate"
      detailFields={detailFields}
      FormFields={MedicalReportsFormFields}
      profile={profile}
    />
  )
}