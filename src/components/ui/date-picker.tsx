import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate, parseIsoDate, toIsoDate } from "@/lib/date";

interface DatePickerProps {
  /** Selected date in storage format (`YYYY-MM-DD`). */
  value?: string;
  /** Called with the new value in storage format (`YYYY-MM-DD`). */
  onChange: (isoDate: string) => void;
  /** Shown when no date is selected; documents the DD/MM/YYYY display format. */
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/**
 * Calendar date picker that displays dates as DD/MM/YYYY while storing them as
 * ISO `YYYY-MM-DD`, so existing events, sorting, filtering and calendar logic
 * keep working unchanged. Replaces the native `<input type="date">`, whose
 * display format follows the browser locale and cannot be forced to DD/MM/YYYY.
 */
export const DatePicker = ({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  disabled,
  id,
  className,
}: DatePickerProps) => {
  const [open, setOpen] = React.useState(false);
  const selected = parseIsoDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label="Choose date"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? formatDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (!date) return;
            onChange(toIsoDate(date));
            setOpen(false);
          }}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};
