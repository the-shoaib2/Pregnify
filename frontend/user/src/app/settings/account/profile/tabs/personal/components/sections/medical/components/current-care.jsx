import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputWithIcon } from "@/components/input-with-icon";
import { Stethoscope, AlertCircle, Droplets } from "lucide-react";

export function CurrentCare({ formValues, setFormValues }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5" />
          Current Care
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <InputWithIcon
          icon={AlertCircle}
          label="Allergies"
          value={formValues.allergies}
          onChange={(e) => setFormValues(prev => ({ ...prev, allergies: e.target.value }))}
        />
        <InputWithIcon
          icon={Droplets}
          label="Current Medications"
          value={formValues.medications}
          onChange={(e) => setFormValues(prev => ({ ...prev, medications: e.target.value }))}
        />
      </CardContent>
    </Card>
  );
}
