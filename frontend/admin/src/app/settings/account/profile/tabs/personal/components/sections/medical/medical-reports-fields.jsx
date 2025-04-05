import React from 'react';
import { InputWithIcon } from "@/components/input-with-icon";
import { FileText, Calendar, User } from "lucide-react";
import { format } from 'date-fns';

function MedicalReportsFormFields({ formValues, handleChange }) {
  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    handleChange('date', date.toISOString());
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <InputWithIcon
        icon={FileText}
        label="Report Type"
        value={formValues.type}
        onChange={(e) => handleChange('type', e.target.value)}
        required
      />
      
      <div className="relative">
        <InputWithIcon
          icon={Calendar}
          label="Date"
          type="datetime-local"
          value={formValues.date ? new Date(formValues.date).toISOString().slice(0, 16) : ''}
          onChange={handleDateChange}
          required
          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-border"
        />
        <button
          type="button"
          onClick={(e) => {
            const input = e.currentTarget.previousElementSibling.querySelector('input');
            if (input) {
              input.click();
            }
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>

      <InputWithIcon
        icon={User}
        label="Doctor"
        value={formValues.doctor}
        onChange={(e) => handleChange('doctor', e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <InputWithIcon
          icon={FileText}
          label="Hemoglobin"
          value={formValues.details?.hemoglobin}
          onChange={(e) => handleChange('details.hemoglobin', e.target.value)}
        />
        
        <InputWithIcon
          icon={FileText}
          label="Blood Sugar"
          value={formValues.details?.bloodSugar}
          onChange={(e) => handleChange('details.bloodSugar', e.target.value)}
        />
      </div>
    </div>
  );
}

export default MedicalReportsFormFields;
