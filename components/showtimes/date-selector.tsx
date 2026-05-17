"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, addDays } from "date-fns";

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
    <div className="w-full overflow-x-auto pb-4 pt-2 hide-scrollbar">
      <div className="flex gap-3 min-w-max px-4 md:px-0">
        {dates.map((date, i) => {
          const dateStr = format(date, "yyyy-MM-dd");
          const isSelected = dateStr === selectedDate;
          const isToday = i === 0;

          return (
            <button
              key={dateStr}
              onClick={() => handleDateSelect(dateStr)}
              className={`flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl border transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                  : "bg-card text-card-foreground border-border hover:border-primary/50 hover:bg-accent"
              }`}
            >
              <span className={`text-xs uppercase font-medium mb-1 ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {isToday ? "Today" : format(date, "MMM")}
              </span>
              <span className="text-2xl font-heading font-bold leading-none mb-1">
                {format(date, "d")}
              </span>
              <span className={`text-xs ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                {format(date, "EEE")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
