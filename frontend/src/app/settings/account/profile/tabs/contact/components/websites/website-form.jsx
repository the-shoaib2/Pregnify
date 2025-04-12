import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Save } from "lucide-react";
import { toast } from "react-hot-toast";

function WebsiteForm({
  isOpen,
  onClose,
  onSave,
  initialData = { id: '', category: '', name: '', url: '', username: '' },
}) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  // Reset form data when dialog opens with new initial data
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setErrors({}); // Reset errors when new data is loaded
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const isValid = validateForm();
      if (isValid) {
        onSave(formData);
        onClose();
        toast.success(
          initialData.id 
            ? 'Website updated successfully!'
            : 'Website added successfully!'
        );
      }
    } catch (error) {
      toast.error('Failed to save website');
    }
  };

  const validateField = (name, value) => {
    let error = '';
    if (name === 'category' || name === 'name' || name === 'url') {
      if (!value) {
        error = 'This field is required';
      }
    }
    if (name === 'url') {
      const urlRegex = /^(http|https):\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/;
      if (!urlRegex.test(value)) {
        error = 'Invalid URL';
      }
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.category) {
      errors.category = 'This field is required';
    }
    if (!formData.name) {
      errors.name = 'This field is required';
    }
    if (!formData.url) {
      errors.url = 'This field is required';
    } else {
      const urlRegex = /^(http|https):\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/;
      if (!urlRegex.test(formData.url)) {
        errors.url = 'Invalid URL';
      }
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData.id ? 'Edit Website' : 'Add New Website'}</DialogTitle>
          <DialogDescription>
            Add or edit your website information
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., SOCIAL, PROFESSIONAL"
              className="w-full"
            />
            {errors.category && <div className="text-red-500">{errors.category}</div>}
          </div>

          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., LinkedIn Profile"
              className="w-full"
            />
            {errors.name && <div className="text-red-500">{errors.name}</div>}
          </div>

          <div>
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="e.g., https://www.linkedin.com/in/username"
              className="w-full"
            />
            {errors.url && <div className="text-red-500">{errors.url}</div>}
          </div>

          <div>
            <Label htmlFor="username">Username (Optional)</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g., username"
              className="w-full"
            />
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

export default WebsiteForm;
