"use client";

import { useMemo } from "react";
import { DatabaseShowtime } from "@/types";
import { Badge } from "@/components/ui/badge";

interface TimeSlotProps {
  showtime: DatabaseShowtime;
  onSelect: (showtime: DatabaseShowtime) => void;
}

export function TimeSlot({ showtime, onSelect }: TimeSlotProps) {
  // Determine color based on format
  const isIMAX = showtime.format.includes("IMAX");
  const isDC = showtime.format.includes("Director's");

  // Derive price from format since we don't store it in DB yet
  let price = 350;
  if (isIMAX) price = 750;
  if (isDC) price = 600;

  // Generate pseudo-random occupancy based on showtime ID or time string
  const occupancy = useMemo(() => {
    let hash = 0;
    const str = showtime.id || showtime.time;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 85) + 15; // between 15% and 100%
  }, [showtime.id, showtime.time]);

  let occupancyLabel = "Available";
  let occupancyDotColor = "bg-emerald-500";
  let occupancyBg = "bg-emerald-500/10";
  let occupancyTextColor = "text-emerald-500 dark:text-emerald-400";

  if (occupancy >= 80) {
    occupancyLabel = "Filling Fast";
    occupancyDotColor = "bg-rose-500 animate-pulse";
    occupancyBg = "bg-rose-500/10";
    occupancyTextColor = "text-rose-500 dark:text-rose-400";
  } else if (occupancy >= 50) {
    occupancyLabel = "Limited Seats";
    occupancyDotColor = "bg-amber-500";
    occupancyBg = "bg-amber-500/10";
    occupancyTextColor = "text-amber-500 dark:text-amber-400";
  }

  return (
    <button 
      onClick={() => onSelect(showtime)}
      className="group block text-left w-full sm:w-auto"
    >
      <div className={`
        relative flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-300
        hover:scale-105 shadow-sm hover:shadow-md min-w-[105px]
        ${isIMAX 
          ? "border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/15 hover:border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.05)] text-cyan-600 dark:text-cyan-400" 
          : isDC 
          ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 hover:border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.05)] text-amber-600 dark:text-amber-400" 
          : "bg-card/40 border-border/60 hover:border-primary/60 hover:bg-muted/40 text-foreground"}
      `}>
        <span className="text-xl font-heading font-black mb-1 group-hover:text-primary transition-colors">
          {showtime.time.substring(0, 5)}
        </span>
        
        <div className="flex flex-col items-center gap-1.5">
          <Badge 
            variant="outline" 
            className={`text-[9px] font-bold px-1.5 py-0 rounded border uppercase tracking-wider ${
              isIMAX 
                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" 
                : isDC 
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" 
                : "bg-muted border-border/80 text-muted-foreground"
            }`}
          >
            {showtime.format}
          </Badge>
          
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <span>₱{price}</span>
          </div>

          {/* Occupancy Indicator */}
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${occupancyBg} ${occupancyTextColor}`}>
            <span className={`size-1 rounded-full ${occupancyDotColor}`} />
            <span>{occupancyLabel}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
