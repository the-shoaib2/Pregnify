import React from 'react';
import { FormFields } from '../components/form-fields';
import { IdCard, Flag, CalendarIcon } from "lucide-react";

export default function DocumentsFormFields({ formValues, handleChange }) {
  const fields = [
    {
      name: 'passportNumber',
      label: 'Passport Number',
      icon: IdCard,
      placeholder: 'Enter passport number'
    },
    {
      name: 'nationality',
      label: 'Nationality',
      icon: Flag,
      placeholder: 'Enter nationality'
    }
  ];

  const dateFields = [
    {
      name: 'passportExpiry',
      label: 'Passport Expiry Date',
      placeholder: 'Select expiry date'
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
    </div>
  );
}
