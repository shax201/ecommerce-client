"use client";

import * as React from "react";
import { CalendarIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { format, isValid, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CustomDatePickerProps {
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

export function CustomDatePicker({
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
}: CustomDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [inputError, setInputError] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(date || new Date());

  // Update input value when date prop changes
  React.useEffect(() => {
    if (date && isValid(date)) {
      setInputValue(format(date, dateFormat));
      setInputError(false);
    } else {
      setInputValue("");
    }
  }, [date, dateFormat]);

  const handleSelect = (selectedDate: Date) => {
    console.log('Custom DatePicker: Date selected:', selectedDate);
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const isDateDisabled = (date: Date) => {
    if (disabledDates) return disabledDates(date);
    if (fromDate && date < fromDate) return true;
    if (toDate && date > toDate) return true;
    return false;
  };

  const isDateSelected = (date: Date) => {
    return date && isSameDay(date, date);
  };

  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-4">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-semibold text-sm">
                  {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = date && isSameDay(day, date);
                  const isDisabled = isDateDisabled(day);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0 text-xs",
                        !isCurrentMonth && "text-muted-foreground/50",
                        isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                        isToday && !isSelected && "bg-accent text-accent-foreground",
                        isDisabled && "opacity-50 cursor-not-allowed",
                        !isDisabled && !isSelected && "hover:bg-accent hover:text-accent-foreground"
                      )}
                      disabled={isDisabled}
                      onClick={() => !isDisabled && handleSelect(day)}
                    >
                      {format(day, 'd')}
                    </Button>
                  );
                })}
              </div>

              {/* Today Button */}
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleSelect(new Date())}
                >
                  Today
                </Button>
              </div>
            </div>
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
