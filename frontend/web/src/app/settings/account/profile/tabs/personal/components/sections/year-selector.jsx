import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function YearSelector({ selectedYear, onYearChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const startYear = 1950;
  
  // Generate years array (from startYear to currentYear)
  const years = Array.from({ length: currentYear - startYear + 1 }, 
    (_, index) => currentYear - index);
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          size="sm"
        >
          <Calendar className="h-4 w-4" />
          {selectedYear || "Select Year"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Select Graduation Year</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                onYearChange("");
                setIsOpen(false);
              }}
              className="h-8 px-2 text-xs"
            >
              Clear
            </Button>
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          <div className="grid grid-cols-4 gap-1">
            {years.map(year => (
              <Button
                key={year}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 rounded-md",
                  selectedYear === year.toString() && "bg-primary text-primary-foreground"
                )}
                onClick={() => {
                  onYearChange(year.toString());
                  setIsOpen(false);
                }}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 