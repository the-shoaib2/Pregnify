import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Activity } from "lucide-react";

// Constants for medical options
const BLOOD_GROUP_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

export function CurrentHealth({ formValues, setFormValues }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Current Health Status
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Blood Group</Label>
            <Select
              value={formValues.bloodGroup}
              onValueChange={(value) => setFormValues(prev => ({ ...prev, bloodGroup: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUP_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between border rounded-lg p-4">
            <Label htmlFor="organ-donor" className="font-medium">Organ Donor</Label>
            <Switch
              id="organ-donor"
              checked={formValues.organDonor}
              onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, organDonor: checked }))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
