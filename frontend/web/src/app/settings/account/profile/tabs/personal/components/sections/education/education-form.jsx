import React, { useState, useEffect, useCallback } from "react";
import { InputWithIcon } from "@/components/input-with-icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GraduationCap, BookOpen, Award, School, Calendar as CalendarIcon, Save, Loader } from "lucide-react";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { SettingsService } from "@/services/settings/account/personal";

export default function EducationDialog({ formValues, handleChange, loading, children, onClose }) {
  const [saving, setSaving] = useState(false);
  const [localFormValues, setLocalFormValues] = useState(formValues || {});
  const [open, setOpen] = useState(false);

  // Reset form values when dialog opens/closes or when formValues prop changes
  useEffect(() => {
    if (formValues) setLocalFormValues(formValues);
  }, [formValues, open]);

  const handleLocalChange = useCallback((field, value) => {
    setLocalFormValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Optimistic UI update - immediately update the UI before API call completes
      const isUpdate = !!localFormValues.id;
      let optimisticResponse;
      
      // Create a copy of the form values for optimistic update
      const updatedEducation = { ...localFormValues };
      
      if (isUpdate) {
        // For updates, we'll optimistically update the existing item
        optimisticResponse = {
          success: true,
          data: updatedEducation
        };
        
        // Optimistically update the UI immediately
        handleChange("optimisticUpdate", {
          type: "update",
          data: updatedEducation
        });
      } else {
        // For new items, we'll optimistically add with a temporary ID
        const tempId = `temp-${Date.now()}`;
        updatedEducation.id = tempId;
        
        optimisticResponse = {
          success: true,
          data: updatedEducation
        };
        
        // Optimistically update the UI immediately
        handleChange("optimisticUpdate", {
          type: "add",
          data: updatedEducation
        });
      }
      
      // Make the actual API call
      const response = isUpdate
        ? await SettingsService.updateEducation(localFormValues.id, localFormValues)
        : await SettingsService.addEducation(localFormValues);

      if (response.success) {
        toast.success(`Education ${isUpdate ? 'updated' : 'added'} successfully`);
        
        // Get the latest data from the server to ensure consistency
        const allEducation = await SettingsService.getEducation();
        handleChange("education", allEducation);
      } else {
        toast.error(`Failed to ${isUpdate ? 'update' : 'add'} education`);
        
        // Revert the optimistic update on failure
        handleChange("optimisticUpdate", {
          type: "revert"
        });
      }
    } catch (error) {
      console.error("Error saving education info:", error);
      toast.error("Failed to save education information");
      
      // Revert the optimistic update on error
      handleChange("optimisticUpdate", {
        type: "revert"
      });
    } finally {
      setSaving(false);
      setOpen(false); // Close the dialog after save attempt
      if (onClose) onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="outline">Edit Education</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{localFormValues.id ? "Edit" : "Add"} Education</DialogTitle>
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