import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Save, Loader } from "lucide-react";
import toast from "react-hot-toast";

export default function ItemFormDialog({
  formValues,
  handleChange,
  loading,
  children,
  onClose,
  title,
  FormFields,
  apiService,
  itemType
}) {
  const [saving, setSaving] = useState(false);
  const [localFormValues, setLocalFormValues] = useState(formValues || {});
  const [open, setOpen] = useState(false);

  // Reset form values when dialog opens/closes or when formValues prop changes
  useEffect(() => {
    if (formValues) setLocalFormValues(formValues);
  }, [formValues, open]);

  const handleLocalChange = useCallback((field, value) => {
    setLocalFormValues((prev) => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent] || {}),
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Optimistic UI update - immediately update the UI before API call completes
      const isUpdate = !!localFormValues.id;
      let optimisticResponse;

      // Create a copy of the form values for optimistic update
      const updatedItem = { ...localFormValues };

      if (isUpdate) {
        // For updates, we'll optimistically update the existing item
        optimisticResponse = {
          success: true,
          data: updatedItem
        };

        // Optimistically update the UI immediately
        handleChange("optimisticUpdate", {
          type: "update",
          data: updatedItem
        });
      } else {
        // For new items, we'll optimistically add with a temporary ID
        const tempId = `temp-${Date.now()}`;
        updatedItem.id = tempId;

        optimisticResponse = {
          success: true,
          data: updatedItem
        };

        // Optimistically update the UI immediately
        handleChange("optimisticUpdate", {
          type: "add",
          data: updatedItem
        });
      }

      // Make the actual API call
      const response = isUpdate
        ? await apiService.update(localFormValues.id, localFormValues)
        : await apiService.add(localFormValues);

      if (response.success) {
        toast.success(`${itemType} ${isUpdate ? 'updated' : 'added'} successfully`);

        // Get the latest data from the server to ensure consistency
        const allItems = await apiService.getAll();
        handleChange(itemType.toLowerCase(), allItems);
      } else {
        toast.error(`Failed to ${isUpdate ? 'update' : 'add'} ${itemType.toLowerCase()}`);

        // Revert the optimistic update on failure
        handleChange("optimisticUpdate", {
          type: "revert"
        });
      }
    } catch (error) {
      console.error(`Error saving ${itemType.toLowerCase()} info:`, error);
      toast.error(`Failed to save ${itemType.toLowerCase()} information`);

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
        {children || <Button variant="outline">Edit {itemType}</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{localFormValues.id ? "Edit" : "Add"} {title || itemType}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormFields
            formValues={localFormValues}
            handleChange={handleLocalChange}
          />
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
