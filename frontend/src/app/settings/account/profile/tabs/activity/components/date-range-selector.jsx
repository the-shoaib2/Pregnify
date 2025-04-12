import React, { useState } from "react";
import { format, isEqual, isBefore } from "date-fns";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export function DateRangeSelector({ dateRange, setDateRange }) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const handleSelect = (date) => {
    if (!dateRange.from) {
      setDateRange({ from: date, to: undefined });
    } else if (dateRange.from && !dateRange.to) {
      if (isBefore(date, dateRange.from)) {
        setDateRange({ from: date, to: dateRange.from });
      } else {
        setDateRange({ from: dateRange.from, to: date });
      }
      setIsCalendarOpen(false);
    } else {
      setDateRange({ from: date, to: undefined });
    }
  };
  
  const clearDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
    setIsCalendarOpen(false);
  };
  
  const formatDateRange = () => {
    if (!dateRange.from && !dateRange.to) return "All Dates";
    if (dateRange.from && !dateRange.to) return format(dateRange.from, "MMM d, yyyy");
    if (dateRange.from && dateRange.to) {
      if (isEqual(dateRange.from, dateRange.to)) return format(dateRange.from, "MMM d, yyyy");
      return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
    }
  };
  
  return (
    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          size="sm"
        >
          <Calendar className="h-4 w-4" />
          {formatDateRange()}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Select Date Range</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearDateRange}
              className="h-8 px-2 text-xs"
            >
              Clear
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {!dateRange.from && "Select start date"}
            {dateRange.from && !dateRange.to && "Select end date"}
            {dateRange.from && dateRange.to && "Date range selected"}
          </p>
        </div>
        <CalendarComponent
          mode="range"
          selected={{
            from: dateRange.from,
            to: dateRange.to,
          }}
          onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
          initialFocus
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  );
} 