"use client";

import React, { useState } from "react";
import { format, getMonth, getYear, setMonth, setYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DatePicker = ({
  startYear = getYear(new Date()) - 100,
  endYear = getYear(new Date()) + 100,
  showOutsideDays = true,
  className = "",
  classNames = {},
  value,
  onValueChange,
  placeholder = "Pick a date",
  fromDate,
  toDate,
  id,
}) => {
  const [date, setDate] = useState(value || null);

  const months = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (onValueChange) {
      onValueChange(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[320px] p-4 shadow-lg rounded-lg">
        <div className="flex gap-2 mb-3">
          <Select onValueChange={(month) => handleDateChange(setMonth(date || new Date(), months.indexOf(month)))} value={date ? months[getMonth(date)] : months[getMonth(new Date())]}>
            <SelectTrigger className="w-1/2">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(year) => handleDateChange(setYear(date || new Date(), parseInt(year)))} value={date ? getYear(date).toString() : getYear(new Date()).toString()}>
            <SelectTrigger className="w-1/2">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              handleDateChange(selectedDate);
            }
          }}
          initialFocus
          month={date || new Date()}
          onMonthChange={handleDateChange}
          showOutsideDays={showOutsideDays}
          className={cn("rounded-md border p-2", classNames?.calendar)}
          fromDate={fromDate}
          toDate={toDate}
        />
      </PopoverContent>
    </Popover>
  );
};

export { DatePicker };
