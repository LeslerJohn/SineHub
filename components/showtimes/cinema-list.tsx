"use client";

import { useState } from "react";
import { MapPin, Building2 } from "lucide-react";
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

  const handleSelectShowtime = (showtime: DatabaseShowtime, cinema: DatabaseCinema) => {
    setSelectedShowtime(showtime);
    setSelectedCinema(cinema);
  };

  const handleCloseModal = () => {
    setSelectedShowtime(null);
    setSelectedCinema(null);
  };

  if (!showtimes || showtimes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl">
        <div className="bg-muted p-4 rounded-full mb-4">
          <span className="text-4xl">🍿</span>
        </div>
        <h3 className="text-xl font-bold mb-2">No Showtimes Available</h3>
        <p className="text-muted-foreground max-w-md">
          There are currently no scheduled screenings for this movie on the selected date. Please try another date or location.
        </p>
      </div>
    );
  }

  // Group showtimes by Cinema ID
  const groupedShowtimes = showtimes.reduce((acc, curr) => {
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

  return (
    <div className="space-y-8">
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
          <div key={cinema.id} className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b bg-muted/20">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold">{cinema.name}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <Building2 className="h-4 w-4" />
                      {cinema.brand}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {cinema.city}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-6">
              {Object.entries(slotsByFormat).map(([format, formatSlots]) => (
                <div key={format}>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3">{format}</h4>
                  <div className="flex flex-wrap gap-3">
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
