"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerDebugProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  disabledDates?: (date: Date) => boolean
  fromDate?: Date
  toDate?: Date
}

export function DatePickerDebug({
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
}: DatePickerDebugProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (newDate: Date | undefined) => {
    console.log('DatePickerDebug: Date selected:', newDate)
    console.log('DatePickerDebug: Calling onDateChange with:', newDate)
    onDateChange?.(newDate)
    setOpen(false)
  }

  console.log('DatePickerDebug: Current date prop:', date)
  console.log('DatePickerDebug: onDateChange function:', onDateChange)

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500">
        Debug: Current date = {date ? format(date, "PPP") : "undefined"}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            name={name}
            variant="outline"
            disabled={disabled}
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
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            disabled={disabledDates}
            fromDate={fromDate}
            toDate={toDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
