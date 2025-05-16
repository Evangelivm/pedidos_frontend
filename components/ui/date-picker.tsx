"use client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";

interface DatePickerProps {
  id?: String;
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  className?: string;
}

export function DatePicker({ date, onDateChange, className }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [localDate, setLocalDate] = useState<Date>(date || new Date());

  // Actualizar la fecha local cuando cambia la prop date
  useEffect(() => {
    if (date) {
      setLocalDate(date);
    }
  }, [date]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !localDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {localDate ? (
              format(localDate, "PPP", { locale: es })
            ) : (
              <span>Seleccionar fecha</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {/* <Calendar
            mode="single"
            selected={localDate}
            onSelect={(newDate) => {
              if (newDate) {
                // Asegurarse de que la hora se mantenga igual para evitar problemas de filtrado
                const updatedDate = new Date(newDate);
                if (localDate) {
                  updatedDate.setHours(
                    localDate.getHours(),
                    localDate.getMinutes(),
                    localDate.getSeconds()
                  );
                }
                setLocalDate(updatedDate);
                onDateChange(updatedDate);
                setOpen(false); // Cerrar el popover después de seleccionar
              }
            }}
            initialFocus
          /> */}
        </PopoverContent>
      </Popover>
    </div>
  );
}
