"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, addDays } from "date-fns";
import { CalendarDays } from "lucide-react";

export function DateSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Generate next 7 days
  const dates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, i) => addDays(today, i));
  }, []);

  const selectedDate = searchParams?.get("date") || format(dates[0], "yyyy-MM-dd");

  const handleDateSelect = (dateStr: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("date", dateStr);
    
    // Maintain movie param if it exists
    const query = params.toString();
    router.push(`/showtimes?${query}`);
  };

  return (
    <div className="w-full pb-2 pt-1">
      <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-muted-foreground">
        <CalendarDays className="h-4 w-4 text-muted-foreground/80" />
        <span>AVAILABLE DATES (7-DAY OUTLOOK)</span>
      </div>

      <div className="w-full overflow-x-auto pb-3 hide-scrollbar">
        <div className="flex gap-3 min-w-max px-1">
          {dates.map((date, i) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const isSelected = dateStr === selectedDate;
            const isToday = i === 0;

            return (
              <button
                key={dateStr}
                onClick={() => handleDateSelect(dateStr)}
                className={`flex flex-col items-center justify-center min-w-[85px] p-3 rounded-2xl border transition-all duration-300 ${
                  isSelected
                    ? "bg-gradient-to-br from-primary to-amber-500 text-primary-foreground border-transparent shadow-[0_8px_20px_rgba(235,94,40,0.3)] scale-105"
                    : "bg-card/40 border-border/50 backdrop-blur-sm text-card-foreground hover:border-primary/40 hover:bg-muted/40 hover:-translate-y-0.5"
                }`}
              >
                <span className={`text-[10px] uppercase font-bold tracking-wider mb-1.5 ${
                  isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}>
                  {isToday ? "Today" : format(date, "MMM")}
                </span>
                <span className="text-2xl font-heading font-black leading-none mb-1.5">
                  {format(date, "d")}
                </span>
                <span className={`text-[10px] font-semibold tracking-wide ${
                  isSelected ? "text-primary-foreground/90" : "text-muted-foreground"
                }`}>
                  {format(date, "EEE")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
