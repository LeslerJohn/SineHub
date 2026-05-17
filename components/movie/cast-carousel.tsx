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
      <h3 className="text-xl font-heading font-bold">Top Cast</h3>
      
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {topCast.map((actor) => (
            <CarouselItem
              key={actor.id}
              className="pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
            >
              <div className="flex flex-col items-center text-center group cursor-pointer">
                <Avatar className="h-24 w-24 mb-3 border-2 border-transparent transition-colors group-hover:border-primary">
                  <AvatarImage 
                    src={getTMDBImageUrl(actor.profile_path, "w185")} 
                    alt={actor.name} 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-muted">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm leading-tight mb-1">{actor.name}</span>
                <span className="text-xs text-muted-foreground leading-tight">{actor.character}</span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="-left-4 lg:-left-12" />
          <CarouselNext className="-right-4 lg:-right-12" />
        </div>
      </Carousel>
    </div>
  );
}
