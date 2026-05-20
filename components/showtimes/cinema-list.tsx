"use client";

import { useState, useMemo } from "react";
import { MapPin, Building2, Search, X, EyeOff, SlidersHorizontal } from "lucide-react";
import { DatabaseShowtime, DatabaseCinema } from "@/types";
import { TimeSlot } from "@/components/showtimes/time-slot";
import { HandoffModal } from "@/components/showtimes/handoff-modal";

interface CinemaListProps {
  showtimes: DatabaseShowtime[];
  movieTitle: string;
}

export function CinemaList({ showtimes, movieTitle }: CinemaListProps) {
  const [selectedShowtime, setSelectedShowtime] = useState<DatabaseShowtime | null>(null);
  const [selectedCinema, setSelectedCinema] = useState<DatabaseCinema | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormatFilter, setSelectedFormatFilter] = useState("All");

  const handleSelectShowtime = (showtime: DatabaseShowtime, cinema: DatabaseCinema) => {
    setSelectedShowtime(showtime);
    setSelectedCinema(cinema);
  };

  const handleCloseModal = () => {
    setSelectedShowtime(null);
    setSelectedCinema(null);
  };

  const formats = ["All", "2D / Standard", "IMAX", "Director's Club"];

  // Filter showtimes first based on format filter and search query
  const filteredShowtimes = useMemo(() => {
    if (!showtimes) return [];
    return showtimes.filter((slot) => {
      // 1. Format Filter
      const isIMAX = slot.format.toUpperCase().includes("IMAX");
      const isDC = slot.format.toUpperCase().includes("DIRECTOR");
      const isStandard = !isIMAX && !isDC;

      if (selectedFormatFilter === "IMAX" && !isIMAX) return false;
      if (selectedFormatFilter === "Director's Club" && !isDC) return false;
      if (selectedFormatFilter === "2D / Standard" && !isStandard) return false;

      // 2. Cinema Name / Brand Search
      const cinemaName = slot.cinemas?.name?.toLowerCase() || "";
      const cinemaBrand = slot.cinemas?.brand?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      
      return cinemaName.includes(query) || cinemaBrand.includes(query);
    });
  }, [showtimes, searchQuery, selectedFormatFilter]);

  // Group filtered showtimes by Cinema ID
  const groupedShowtimes = useMemo(() => {
    return filteredShowtimes.reduce((acc, curr) => {
      const cinemaId = curr.cinema_id;
      if (!acc[cinemaId]) {
        acc[cinemaId] = {
          cinema: curr.cinemas,
          slots: [],
        };
      }
      acc[cinemaId].slots.push(curr);
      return acc;
    }, {} as Record<string, { cinema: DatabaseCinema; slots: DatabaseShowtime[] }>);
  }, [filteredShowtimes]);

  if (!showtimes || showtimes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl bg-card/10 border-border/60 p-8 max-w-lg mx-auto">
        <div className="bg-muted/80 shadow-inner p-5 rounded-full mb-5 border">
          <span className="text-4xl">🍿</span>
        </div>
        <h3 className="text-xl font-black mb-2">No Showtimes Scheduled</h3>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
          There are currently no scheduled screenings for this movie on the selected date. Please check another date or location.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-md shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
          <input
            type="text"
            placeholder="Search cinemas (e.g. SM Cinema, Robinsons)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-border/60 bg-background/50 text-sm text-foreground placeholder-muted-foreground/80 focus:outline-none focus:border-primary/60 transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground/80 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Format tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/40 min-w-max">
          {formats.map((f) => {
            const isActive = selectedFormatFilter === f;
            return (
              <button
                key={f}
                onClick={() => setSelectedFormatFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-background text-foreground shadow-sm border border-border/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredShowtimes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/80 rounded-2xl bg-card/25 backdrop-blur-sm p-8 max-w-md mx-auto shadow-sm">
          <div className="bg-muted shadow-sm p-4 rounded-full mb-5 border">
            <EyeOff className="h-6 w-6 text-muted-foreground/80" />
          </div>
          <h3 className="text-xl font-bold tracking-tight mb-2">No Matching Showtimes</h3>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-6">
            We couldn't find any scheduled screenings matching "{searchQuery}" or format "{selectedFormatFilter}". Try adjusting your filters.
          </p>
          <button 
            onClick={() => { setSearchQuery(""); setSelectedFormatFilter("All"); }}
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 text-sm transition-all"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Cinemas List */}
      <div className="space-y-6">
        {Object.values(groupedShowtimes).map(({ cinema, slots }) => {
          if (!cinema) return null;

          // Group slots by format within the cinema
          const slotsByFormat = slots.reduce((acc, curr) => {
            if (!acc[curr.format]) {
              acc[curr.format] = [];
            }
            acc[curr.format].push(curr);
            return acc;
          }, {} as Record<string, DatabaseShowtime[]>);

          return (
            <div key={cinema.id} className="rounded-2xl border border-border/50 bg-card/25 text-card-foreground shadow-md overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-border">
              <div className="p-4 sm:p-5 border-b border-border/40 bg-muted/20 sm:flex sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-heading text-xl sm:text-2xl font-black tracking-tight">{cinema.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1 font-bold text-foreground bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
                      <Building2 className="h-3.5 w-3.5" />
                      {cinema.brand}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground/80" />
                      {cinema.city}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-5 sm:p-6 space-y-6">
                {Object.entries(slotsByFormat).map(([format, formatSlots]) => (
                  <div key={format} className="space-y-3">
                    <span className="text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase bg-muted/50 px-2.5 py-1 rounded-md border border-border/30">
                      {format}
                    </span>
                    <div className="flex flex-wrap gap-3 pt-2">
                      {/* Sort slots by time before rendering */}
                      {formatSlots
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((slot) => (
                        <TimeSlot 
                          key={slot.id} 
                          showtime={slot} 
                          onSelect={(s) => handleSelectShowtime(s, cinema)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <HandoffModal 
        isOpen={!!selectedShowtime} 
        onClose={handleCloseModal} 
        showtime={selectedShowtime} 
        cinema={selectedCinema}
        movieTitle={movieTitle}
      />
    </div>
  );
}
