"use client";

import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ProperDatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  disabledDates?: (date: Date) => boolean;
  fromDate?: Date;
  toDate?: Date;
  showClearButton?: boolean;
  allowManualInput?: boolean;
  dateFormat?: string;
  error?: boolean;
  label?: string;
}

export function ProperDatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  id,
  name,
  disabledDates,
  fromDate,
  toDate,
  showClearButton = true,
  allowManualInput = true,
  dateFormat = "MMM dd, yyyy",
  error = false,
  label,
}: ProperDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [inputError, setInputError] = React.useState(false);

  // Update input value when date prop changes
  React.useEffect(() => {
    if (date && isValid(date)) {
      setInputValue(format(date, dateFormat));
      setInputError(false);
    } else {
      setInputValue("");
    }
  }, [date, dateFormat]);

  const handleSelect = (selectedDate: Date | undefined) => {
    console.log('Proper DatePicker: Date selected:', selectedDate);
    onDateChange?.(selectedDate);
    setOpen(false);
    setInputError(false);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    if (!value.trim()) {
      onDateChange?.(undefined);
      setInputError(false);
      return;
    }

    // Try to parse the input as a date
    const parsedDate = parseISO(value);
    if (isValid(parsedDate)) {
      onDateChange?.(parsedDate);
      setInputError(false);
    } else {
      // Try to parse with common formats
      const commonFormats = [
        "MM/dd/yyyy",
        "dd/MM/yyyy", 
        "yyyy-MM-dd",
        "MM-dd-yyyy",
        "dd-MM-yyyy"
      ];
      
      let validDate: Date | null = null;
      for (const formatStr of commonFormats) {
        try {
          const testDate = parseISO(value);
          if (isValid(testDate)) {
            validDate = testDate;
            break;
          }
        } catch {
          continue;
        }
      }
      
      if (validDate) {
        onDateChange?.(validDate);
        setInputError(false);
      } else {
        setInputError(true);
      }
    }
  };

  const handleClear = () => {
    setInputValue("");
    onDateChange?.(undefined);
    setInputError(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                id={id}
                name={name}
                value={inputValue}
                onChange={(e) => allowManualInput && handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "pr-20",
                  error || inputError ? "border-destructive focus-visible:ring-destructive" : "",
                  className
                )}
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {showClearButton && inputValue && !disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={handleClear}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setOpen(!open)}
                  disabled={disabled}
                >
                  <CalendarIcon className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <DayPicker
              mode="single"
              selected={date}
              onSelect={handleSelect}
              disabled={disabledDates}
              fromDate={fromDate}
              toDate={toDate}
              className="rounded-md border"
              classNames={{
                root: "p-3",
                head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {inputError && (
        <p className="text-xs text-destructive">
          Invalid date format. Try MM/dd/yyyy or click the calendar icon.
        </p>
      )}
    </div>
  );
}
