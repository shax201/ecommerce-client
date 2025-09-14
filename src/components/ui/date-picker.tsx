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

interface DatePickerProps {
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

export function DatePicker({
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
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (newDate: Date | undefined) => {
    console.log('DatePicker: Date selected:', newDate)
    onDateChange?.(newDate)
    setOpen(false)
  }

  return (
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
  )
}
