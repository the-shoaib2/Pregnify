"use client";

import React, { useState, useEffect } from "react";
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
  date,
  setDate,
  placeholder = "Pick a date",
  fromDate,
  toDate,
  id,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(date);

  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const months = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  const handleDateChange = (newDate) => {
    if (newDate) {
      setSelectedDate(newDate);
      setDate(newDate);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "MMMM d, yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-[320px] p-4 shadow-lg rounded-lg">
        <div className="flex gap-2 mb-3">
          <Select 
            onValueChange={(month) => {
              const newDate = setMonth(selectedDate || new Date(), months.indexOf(month));
              handleDateChange(newDate);
            }} 
            value={selectedDate ? months[getMonth(selectedDate)] : months[getMonth(new Date())]}
          >
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

          <Select 
            onValueChange={(year) => {
              const newDate = setYear(selectedDate || new Date(), parseInt(year));
              handleDateChange(newDate);
            }} 
            value={selectedDate ? getYear(selectedDate).toString() : getYear(new Date()).toString()}
          >
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
          selected={selectedDate}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              handleDateChange(selectedDate);
              setOpen(false);
            }
          }}
          initialFocus
          month={selectedDate || new Date()}
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
