import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputWithIcon } from "@/components/input-with-icon";
import { Phone, Save } from "lucide-react";
import {
  Switch,
} from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

export function PhoneNumberForm({
  isOpen,
  onClose,
  onSave,
  initialData = { number: "", isPrimary: false, isVerified: false },
}) {
  const [formData, setFormData] = useState(initialData);

  // Reset form data when dialog opens with new initial data
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (field, checked) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      onSave(formData);
      onClose();
      toast.success(
        initialData.number 
          ? 'Phone number updated successfully!'
          : 'Phone number added successfully!'
      );
    } catch (error) {
      toast.error('Failed to save phone number');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Phone Number</DialogTitle>
          <DialogDescription>
            Add or edit your phone number
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <InputWithIcon
              icon={Phone}
              name="number"
              value={formData.number}
              onChange={handleChange}
              placeholder="Enter phone number"
              type="tel"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Switch
                id="isPrimary"
                checked={formData.isPrimary}
                onCheckedChange={(checked) => handleSwitchChange('isPrimary', checked)}
              />
              <Label htmlFor="isPrimary" className="text-sm">
                Primary Number
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                id="isVerified"
                checked={formData.isVerified}
                onCheckedChange={(checked) => handleSwitchChange('isVerified', checked)}
              />
              <Label htmlFor="isVerified" className="text-sm">
                Verified
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
