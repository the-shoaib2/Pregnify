import { useState } from 'react'
import { SettingsService } from '@/services/settings/account/personal'
import Section from '../../../../../../../../../components/shared/section'
import ItemFormDialog from '../../../../../../../../../components/shared/item-form'
import DocumentsFormFields from './documents-fields'
import { createServiceAdapter } from '../../../../../../../../../components/shared/service-adapter'

export default function DocumentsSection({ formValues, handleChange, handleSave, loading }) {
    // Create a service adapter for the documents API
    const [documentsService] = useState(() => createServiceAdapter(SettingsService, 'Documents'));

    // Define the detail fields to display in the card
    const detailFields = [
        { key: 'nationality', label: 'Nationality' },
        { key: 'passportExpiry', label: 'Passport Expiry Date' }
    ];

    return (
        <Section
            formValues={formValues}
            handleChange={handleChange}
            handleSave={handleSave}
            loading={loading}
            title="Documents & Identity"
            emptyMessage="No document information added yet."
            ItemFormDialog={(props) => (
                <ItemFormDialog
                    {...props}
                    title="Document"
                    itemType="Document"
                    apiService={documentsService}
                    FormFields={DocumentsFormFields}
                />
            )}
            apiService={documentsService}
            itemType="Document"
            titleField="passportNumber"
            subtitleField="nationality"
            detailFields={detailFields}
            FormFields={DocumentsFormFields}
        />
    )
}
