import React from 'react';
import { InputWithIcon } from "@/components/input-with-icon";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FormFields({ 
  formValues, 
  handleChange, 
  fields,
  dateFields = [],
  checkboxFields = [],
  textareaFields = [],
  selectFields = []
}) {
  // Handle date selection
  const handleDateSelect = (field, date) => {
    handleChange(field, format(date, 'yyyy-MM-dd'));
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Regular input fields */}
      {fields.map((field) => (
        <InputWithIcon
          key={field.name}
          icon={field.icon}
          label={field.label}
          value={field.path ? 
            (field.path.split('.').reduce((obj, path) => (obj && obj[path] !== undefined) ? obj[path] : '', formValues)) : 
            (formValues[field.name] || '')}
          onChange={(e) => handleChange(field.path || field.name, e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
        />
      ))}

      {/* Date fields */}
      {dateFields.map((field) => (
        <div key={field.name} className="grid w-full items-center gap-1.5">
          <label className="text-sm font-medium leading-none">
            {field.label}
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formValues[field.name] && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formValues[field.name] ? 
                  format(new Date(formValues[field.name]), "PPP") : 
                  <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formValues[field.name] ? new Date(formValues[field.name]) : null}
                onSelect={(date) => date && handleDateSelect(field.name, date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      ))}

      {/* Checkbox fields */}
      {checkboxFields.map((field) => (
        <div key={field.name} className="flex items-center space-x-2">
          <Checkbox 
            id={field.name}
            checked={formValues[field.name] || false}
            onCheckedChange={(checked) => handleChange(field.name, checked)}
          />
          <label htmlFor={field.name} className="text-sm font-medium leading-none">
            {field.label}
          </label>
        </div>
      ))}

      {/* Select fields */}
      {selectFields.map((field) => (
        <div key={field.name} className="grid w-full items-center gap-1.5">
          <label htmlFor={field.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {field.label}
          </label>
          <Select 
            value={formValues[field.name] || ''} 
            onValueChange={(value) => handleChange(field.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}

export function TextareaFields({ formValues, handleChange, fields }) {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="grid w-full items-center gap-1.5">
          <label htmlFor={field.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {field.label}
          </label>
          <Textarea
            id={field.name}
            value={formValues[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={field.className || "min-h-[100px]"}
          />
        </div>
      ))}
    </div>
  );
}

export function ListFields({ 
  formValues, 
  handleChange, 
  fields 
}) {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <label className="text-sm font-medium leading-none">
            {field.label}
          </label>
          <div className="border rounded-md p-3">
            {(field.path ? 
              field.path.split('.').reduce((obj, path) => (obj && obj[path] !== undefined) ? obj[path] : [], formValues) : 
              formValues[field.name] || []).map((item, index) => (
              <div key={index} className="flex items-center justify-between py-1">
                <span>{item}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    let newItems;
                    if (field.path) {
                      const paths = field.path.split('.');
                      const lastPath = paths.pop();
                      const parentObj = paths.reduce((obj, path) => obj[path], {...formValues});
                      newItems = [...parentObj[lastPath]];
                      newItems.splice(index, 1);
                      handleChange(field.path, newItems);
                    } else {
                      newItems = [...(formValues[field.name] || [])];
                      newItems.splice(index, 1);
                      handleChange(field.name, newItems);
                    }
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <div className="flex mt-2">
              <input 
                className="flex-1 h-9 rounded-l-md border border-input bg-background px-3 py-1 text-sm"
                placeholder={field.placeholder}
                id={`new-${field.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.target.value.trim();
                    if (!value) return;
                    
                    let newItems;
                    if (field.path) {
                      const paths = field.path.split('.');
                      const lastPath = paths.pop();
                      const parentObj = paths.reduce((obj, path) => obj[path] || {}, {...formValues});
                      newItems = [...(parentObj[lastPath] || []), value];
                      handleChange(field.path, newItems);
                    } else {
                      newItems = [...(formValues[field.name] || []), value];
                      handleChange(field.name, newItems);
                    }
                    e.target.value = '';
                  }
                }}
              />
              <Button 
                className="rounded-l-none"
                onClick={() => {
                  const input = document.getElementById(`new-${field.name}`);
                  const value = input.value.trim();
                  if (!value) return;
                  
                  let newItems;
                  if (field.path) {
                    const paths = field.path.split('.');
                    const lastPath = paths.pop();
                    const parentObj = paths.reduce((obj, path) => obj[path] || {}, {...formValues});
                    newItems = [...(parentObj[lastPath] || []), value];
                    handleChange(field.path, newItems);
                  } else {
                    newItems = [...(formValues[field.name] || []), value];
                    handleChange(field.name, newItems);
                  }
                  input.value = '';
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
