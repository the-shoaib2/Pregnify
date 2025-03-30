import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputWithIcon } from "@/components/input-with-icon";
import { User, Phone, AlertCircle } from "lucide-react";

export function AdditionalInfo({ formValues, setFormValues }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Additional Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
          <InputWithIcon
            icon={AlertCircle}
            label="Genetic Disorders"
            value={formValues.geneticDisorders.condition}
            onChange={(e) => setFormValues(prev => ({
              ...prev,
              geneticDisorders: { ...prev.geneticDisorders, condition: e.target.value }
            }))}
          />
          <div className="grid grid-cols-1 gap-4">
            <InputWithIcon
              icon={AlertCircle}
              label="Physical Disabilities"
              value={formValues.disabilities.physical}
              onChange={(e) => setFormValues(prev => ({
                ...prev,
                disabilities: { ...prev.disabilities, physical: e.target.value }
              }))}
            />
            <InputWithIcon
              icon={AlertCircle}
              label="Mental Disabilities"
              value={formValues.disabilities.mental}
              onChange={(e) => setFormValues(prev => ({
                ...prev,
                disabilities: { ...prev.disabilities, mental: e.target.value }
              }))}
            />
          </div>

          <InputWithIcon
            icon={Phone}
            label="Emergency Contact"
            value={formValues.emergencyContact}
            onChange={(e) => setFormValues(prev => ({ ...prev, emergencyContact: e.target.value }))}
          />
          <InputWithIcon
            icon={User}
            label="Primary Physician"
            value={formValues.primaryPhysician}
            onChange={(e) => setFormValues(prev => ({ ...prev, primaryPhysician: e.target.value }))}
          />
      </CardContent>
    </Card>
  );
}
