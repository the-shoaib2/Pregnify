import { useState } from 'react'
import { SettingsService } from '@/services/settings/account/personal'
import Section from '../../../../../../../../../components/shared/section'
import ItemFormDialog from '../../../../../../../../../components/shared/item-form'
import EducationFormFields from './education-fields'
import { createServiceAdapter } from '../../../../../../../../../components/shared/service-adapter'

export default function EducationSection({ formValues, handleChange, handleSave, loading }) {
    // Create a service adapter for the education API
    const [educationService] = useState(() => createServiceAdapter(SettingsService, 'Education'));

    // Define the detail fields to display in the card
    const detailFields = [
        { key: 'fieldOfStudy', label: 'Field of Study' },
        { key: 'startYear', label: 'Start Year' },
        { key: 'endYear', label: 'End Year' },
        { key: 'isOngoing', label: 'Ongoing' },
        { key: 'gpa', label: 'GPA' }
    ];

    return (
        <Section
            formValues={formValues}
            handleChange={handleChange}
            handleSave={handleSave}
            loading={loading}
            title="Education Information"
            emptyMessage="No education information added yet."
            ItemFormDialog={(props) => (
                <ItemFormDialog
                    {...props}
                    title="Education"
                    itemType="Education"
                    apiService={educationService}
                    FormFields={EducationFormFields}
                />
            )}
            apiService={educationService}
            itemType="Education"
            titleField="degree"
            subtitleField="institution"
            detailFields={detailFields}
            FormFields={EducationFormFields}
        />
    )
}
