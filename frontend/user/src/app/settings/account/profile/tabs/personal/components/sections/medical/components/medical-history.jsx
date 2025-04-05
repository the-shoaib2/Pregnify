import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputWithIcon } from "@/components/input-with-icon";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { History, HeartPulse, AlertCircle } from "lucide-react";

export function MedicalHistory({ formValues, setFormValues }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Medical History
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
          <InputWithIcon
            icon={HeartPulse}
            label="Medical Condition"
            value={formValues.medicalHistory.condition}
            onChange={(e) => setFormValues(prev => ({
              ...prev,
              medicalHistory: { ...prev.medicalHistory, condition: e.target.value }
            }))}
          />
          <InputWithIcon
            icon={AlertCircle}
            label="Details"
            value={formValues.medicalHistory.details}
            onChange={(e) => setFormValues(prev => ({
              ...prev,
              medicalHistory: { ...prev.medicalHistory, details: e.target.value }
            }))}
          />

          <InputWithIcon
            icon={HeartPulse}
            label="Chronic Disease"
            value={formValues.chronicDiseases.condition}
            onChange={(e) => setFormValues(prev => ({
              ...prev,
              chronicDiseases: { ...prev.chronicDiseases, condition: e.target.value }
            }))}
          />
          <InputWithIcon
            icon={AlertCircle}
            label="Details"
            value={formValues.chronicDiseases.details}
            onChange={(e) => setFormValues(prev => ({
              ...prev,
              chronicDiseases: { ...prev.chronicDiseases, details: e.target.value }
            }))}
          />

          <div className="flex items-center space-x-2">
            <Switch
              id="cancer-history"
              checked={formValues.cancerHistory}
              onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, cancerHistory: checked }))}
            />
            <Label htmlFor="cancer-history">Cancer History</Label>
          </div>
          {formValues.cancerHistory && (
            <InputWithIcon
              icon={AlertCircle}
              label="Cancer Type"
              value={formValues.cancerType}
              onChange={(e) => setFormValues(prev => ({ ...prev, cancerType: e.target.value }))}
            />
          )}
      </CardContent>
    </Card>
  );
}
