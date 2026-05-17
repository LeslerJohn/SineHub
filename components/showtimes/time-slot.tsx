import { MockShowtime } from "@/lib/mock-data/showtimes";
import { Badge } from "@/components/ui/badge";

interface TimeSlotProps {
  showtime: MockShowtime;
  onSelect: (showtime: MockShowtime) => void;
}

export function TimeSlot({ showtime, onSelect }: TimeSlotProps) {
  // Determine color based on format
  const isIMAX = showtime.format.includes("IMAX");
  const isDC = showtime.format.includes("Director's");

  return (
    <button 
      onClick={() => onSelect(showtime)}
      className="group block text-left w-full sm:w-auto"
    >
      <div className={`
        relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all
        hover:scale-105 shadow-sm hover:shadow-md
        ${isIMAX ? "border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/10" : 
          isDC ? "border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10" : 
          "bg-card border-border hover:border-primary/50"}
      `}>
        <span className="text-xl font-heading font-bold mb-1 group-hover:text-primary transition-colors">
          {showtime.time}
        </span>
        
        <div className="flex flex-col items-center gap-1">
          <Badge variant={isIMAX ? "default" : isDC ? "secondary" : "outline"} className={`text-[10px] px-1.5 py-0 ${isIMAX ? "bg-blue-600 hover:bg-blue-700" : isDC ? "bg-amber-500/20 text-amber-600 hover:bg-amber-500/30" : ""}`}>
            {showtime.format}
          </Badge>
          <span className="text-[10px] text-muted-foreground font-medium">
            ₱{showtime.price}
          </span>
        </div>
      </div>
    </button>
  );
}
