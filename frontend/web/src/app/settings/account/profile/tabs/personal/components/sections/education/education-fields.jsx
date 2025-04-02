import React from 'react';
import { FormFields, TextareaFields } from '../../../../../../../../../components/shared/form-fields';
import { GraduationCap, BookOpen, Award, School, Calendar } from "lucide-react";

export default function EducationFormFields({ formValues, handleChange }) {
  const fields = [
    {
      name: 'degree',
      label: 'Degree',
      icon: GraduationCap,
      placeholder: 'Enter degree name',
      required: true
    },
    {
      name: 'fieldOfStudy',
      label: 'Field of Study',
      icon: BookOpen,
      placeholder: 'Enter field of study',
      required: true
    },
    {
      name: 'qualification',
      label: 'Qualification',
      icon: Award,
      placeholder: 'Enter qualification'
    },
    {
      name: 'institution',
      label: 'Institution',
      icon: School,
      placeholder: 'Enter institution name',
      required: true
    },
    {
      name: 'startYear',
      label: 'Start Year',
      icon: Calendar,
      placeholder: 'YYYY',
      required: true
    },
    {
      name: 'endYear',
      label: 'End Year',
      icon: Calendar,
      placeholder: 'YYYY'
    }
  ];

  const checkboxFields = [
    {
      name: 'isOngoing',
      label: 'Currently Ongoing'
    }
  ];

  const additionalFields = [
    {
      name: 'gpa',
      label: 'GPA/Grade',
      icon: Award,
      placeholder: 'Enter GPA or grade'
    }
  ];

  return (
    <>
      <FormFields 
        formValues={formValues} 
        handleChange={handleChange} 
        fields={fields}
        checkboxFields={checkboxFields}
      />
      <FormFields 
        formValues={formValues} 
        handleChange={handleChange} 
        fields={additionalFields}
      />
    </>
  );
}
