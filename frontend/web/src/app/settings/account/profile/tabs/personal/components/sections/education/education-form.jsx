import React, { useState, useEffect, useCallback } from "react";
import { InputWithIcon } from "@/components/input-with-icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, BookOpen, Award, School, Calendar as CalendarIcon, Save, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { SettingsService } from "@/services/settings/account/personal";

export default function EducationDialog({ formValues, handleChange, loading }) {
  const [saving, setSaving] = useState(false);
  const [localFormValues, setLocalFormValues] = useState(formValues || {});

  useEffect(() => {
    if (formValues) setLocalFormValues(formValues);
  }, [formValues]);

  const handleLocalChange = useCallback((field, value) => {
    setLocalFormValues((prev) => ({ ...prev, [field]: value }));
    handleChange(field, value);
  }, [handleChange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = localFormValues.id
        ? await SettingsService.updateEducation(localFormValues.id, localFormValues)
        : await SettingsService.addEducation(localFormValues);
      
      response.success ? toast.success("Education saved successfully") : toast.error("Failed to save education");
      handleChange("education", await SettingsService.getEducation());
    } catch (error) {
      console.error("Error saving education info:", error);
      toast.error("Failed to save education information");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Education</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Education Information</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <InputWithIcon icon={GraduationCap} label="Degree" value={localFormValues.degree || ''} onChange={(e) => handleLocalChange("degree", e.target.value)} placeholder="Enter degree name" />
            <InputWithIcon icon={BookOpen} label="Field of Study" value={localFormValues.fieldOfStudy || ''} onChange={(e) => handleLocalChange("fieldOfStudy", e.target.value)} placeholder="Enter field of study" />
            <InputWithIcon icon={Award} label="Qualification" value={localFormValues.qualification || ''} onChange={(e) => handleLocalChange("qualification", e.target.value)} placeholder="Enter qualification" />
            <InputWithIcon icon={School} label="Institution" value={localFormValues.institution || ''} onChange={(e) => handleLocalChange("institution", e.target.value)} placeholder="Enter institution name" />
            <InputWithIcon icon={CalendarIcon} label="Start Year" value={localFormValues.startYear || ''} onChange={(e) => handleLocalChange("startYear", e.target.value)} placeholder="YYYY" />
            <InputWithIcon icon={CalendarIcon} label="End Year" value={localFormValues.endYear || ''} onChange={(e) => handleLocalChange("endYear", e.target.value)} placeholder="YYYY" />
            <div className="flex items-center">
              <Checkbox checked={localFormValues.isOngoing || false} onCheckedChange={(value) => handleLocalChange("isOngoing", value)} />
              <label className="ml-2">Currently Ongoing</label>
            </div>
            <InputWithIcon icon={Award} label="GPA/Grade" value={localFormValues.gpa || ''} onChange={(e) => handleLocalChange("gpa", e.target.value)} placeholder="Enter GPA or grade" />
          </div>
          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={saving || loading}>
              {saving && <Loader className="mr-2 h-4 w-4 animate-spin" />} <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}