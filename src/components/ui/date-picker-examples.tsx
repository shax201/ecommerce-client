"use client";

import * as React from "react";
import { CustomDatePicker } from "./custom-date-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

export function DatePickerExamples() {
  const [basicDate, setBasicDate] = React.useState<Date | undefined>();
  const [rangeStart, setRangeStart] = React.useState<Date | undefined>();
  const [rangeEnd, setRangeEnd] = React.useState<Date | undefined>();
  const [restrictedDate, setRestrictedDate] = React.useState<Date | undefined>();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom Date Picker Examples</CardTitle>
          <CardDescription>
            Various configurations and use cases for the CustomDatePicker component
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Example */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Basic Usage</h4>
            <CustomDatePicker
              id="basic-example"
              label="Select a date"
              date={basicDate}
              onDateChange={setBasicDate}
              placeholder="Choose any date"
              showClearButton={true}
              allowManualInput={true}
            />
            <p className="text-xs text-muted-foreground">
              Selected: {basicDate ? basicDate.toLocaleDateString() : "None"}
            </p>
          </div>

          {/* Date Range Example */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Date Range Selection</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomDatePicker
                id="range-start"
                label="Start Date"
                date={rangeStart}
                onDateChange={setRangeStart}
                placeholder="Select start date"
                fromDate={new Date()}
                showClearButton={true}
                allowManualInput={true}
              />
              <CustomDatePicker
                id="range-end"
                label="End Date"
                date={rangeEnd}
                onDateChange={setRangeEnd}
                placeholder="Select end date"
                fromDate={rangeStart ? new Date(rangeStart.getTime() + 24 * 60 * 60 * 1000) : undefined}
                disabledDates={(date) => {
                  if (!rangeStart) return false;
                  const checkDate = new Date(date);
                  checkDate.setHours(0, 0, 0, 0);
                  const start = new Date(rangeStart);
                  start.setHours(0, 0, 0, 0);
                  return checkDate <= start;
                }}
                showClearButton={true}
                allowManualInput={true}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Range: {rangeStart?.toLocaleDateString()} - {rangeEnd?.toLocaleDateString() || "Not selected"}
            </p>
          </div>

          {/* Restricted Date Example */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Restricted Date Selection</h4>
            <CustomDatePicker
              id="restricted-example"
              label="Select a weekday"
              date={restrictedDate}
              onDateChange={setRestrictedDate}
              placeholder="Only weekdays allowed"
              disabledDates={(date) => {
                const day = date.getDay();
                return day === 0 || day === 6; // Disable weekends
              }}
              showClearButton={true}
              allowManualInput={true}
            />
            <p className="text-xs text-muted-foreground">
              Selected: {restrictedDate ? restrictedDate.toLocaleDateString() : "None"} 
              {restrictedDate && (restrictedDate.getDay() === 0 || restrictedDate.getDay() === 6) && 
                " (Weekend selected - this shouldn't happen!)"}
            </p>
          </div>

          {/* Code Example */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Usage Example</h4>
            <div className="p-4 bg-muted rounded-md">
              <pre className="text-xs overflow-x-auto">
{`import { CustomDatePicker } from "@/components/ui/custom-date-picker";

function MyComponent() {
  const [date, setDate] = useState<Date | undefined>();
  
  return (
    <CustomDatePicker
      id="my-date-picker"
      label="Select Date"
      date={date}
      onDateChange={setDate}
      placeholder="Choose a date"
      showClearButton={true}
      allowManualInput={true}
      disabledDates={(date) => date < new Date()}
      fromDate={new Date()}
    />
  );
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
