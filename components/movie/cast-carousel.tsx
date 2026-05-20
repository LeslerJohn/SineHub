"use client";

import Image from "next/image";
import { User } from "lucide-react";

import { TMDBCast } from "@/types/tmdb";
import { getTMDBImageUrl } from "@/lib/tmdb";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CastCarouselProps {
  cast: TMDBCast[];
}

export function CastCarousel({ cast }: CastCarouselProps) {
  if (!cast || cast.length === 0) return null;

  // Only show top 15 cast members to avoid massive lists
  const topCast = cast.slice(0, 15);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-heading font-bold tracking-tight">Top Cast</h3>
        <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-primary to-primary/0" />
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: false,
          slidesToScroll: 1,
          breakpoints: {
            "(min-width: 640px)": { slidesToScroll: 2 },
            "(min-width: 768px)": { slidesToScroll: 3 },
            "(min-width: 1024px)": { slidesToScroll: 4 },
          },
        }}
        className="w-full group/carousel"
      >
        {/* py-4 -my-4 adds vertical padding inside the scroll window so avatar hover animations are never clipped */}
        <CarouselContent className="-ml-4 py-4 -my-4">
          {topCast.map((actor) => (
            <CarouselItem
              key={actor.id}
              className="pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
            >
              <div className="flex flex-col items-center text-center group cursor-pointer p-3 rounded-2xl border border-transparent transition-all duration-300 hover:bg-card/30 hover:border-border/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <Avatar className="h-24 w-24 mb-3 border-2 border-border/80 transition-all duration-300 group-hover:border-primary group-hover:scale-105 shadow-md shadow-black/5 group-hover:shadow-primary/10">
                  <AvatarImage 
                    src={getTMDBImageUrl(actor.profile_path, "w185")} 
                    alt={actor.name} 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-muted">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1 w-full">{actor.name}</span>
                <span className="text-xs text-muted-foreground leading-tight line-clamp-1 w-full">{actor.character}</span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Glassmorphic navigation arrows positioned overlaying the sides, hidden on mobile touch */}
        <CarouselPrevious className="absolute left-4 top-[35%] -translate-y-1/2 z-30 size-11 rounded-full bg-background/80 dark:bg-black/60 backdrop-blur-md border border-border dark:border-white/10 hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground shadow-lg transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 pointer-events-none group-hover/carousel:pointer-events-auto flex items-center justify-center" />
        <CarouselNext className="absolute right-4 top-[35%] -translate-y-1/2 z-30 size-11 rounded-full bg-background/80 dark:bg-black/60 backdrop-blur-md border border-border dark:border-white/10 hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground shadow-lg transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 pointer-events-none group-hover/carousel:pointer-events-auto flex items-center justify-center" />
      </Carousel>
    </div>
  );
}
