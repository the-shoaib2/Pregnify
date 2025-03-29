import { useState } from 'react'
import { SettingsService } from '@/services/settings/account/personal'
import Section from '../components/section'
import ItemFormDialog from '../components/item-form'
import MedicalFormFields from './medical-fields'
import { createServiceAdapter } from '../components/service-adapter'

export default function MedicalSection({ formValues, handleChange, handleSave, loading, profile }) {
    // Create a service adapter for the medical API
    const [medicalService] = useState(() => createServiceAdapter(SettingsService, 'Medical'));

    // Define the detail fields to display in the card
    const detailFields = [
        { key: 'bloodGroup', label: 'Blood Group' },
        { key: 'allergies', label: 'Allergies' },
        { key: 'medications', label: 'Medications' },
        { key: 'chronicConditions', label: 'Chronic Conditions' }
    ];

    return (
        <Section
            formValues={formValues}
            handleChange={handleChange}
            handleSave={handleSave}
            loading={loading}
            title="Medical Information"
            description="Your medical history and health information"
            emptyMessage="No medical information added yet."
            ItemFormDialog={(props) => (
                <ItemFormDialog
                    {...props}
                    title="Medical Information"
                    itemType="Medical"
                    apiService={medicalService}
                    FormFields={MedicalFormFields}
                />
            )}
            apiService={medicalService}
            itemType="Medical"
            titleField="bloodGroup"
            subtitleField="allergies"
            detailFields={detailFields}
            FormFields={MedicalFormFields}
            profile={profile}
        />
    )
}
