"use client";

import { TMDBMovie } from "@/types/tmdb";
import { MovieCard } from "@/components/shared/movie-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface MovieCarouselProps {
  title: string;
  movies: TMDBMovie[];
  viewAllLink?: string;
}

export function MovieCarousel({ title, movies, viewAllLink }: MovieCarouselProps) {
  if (!movies || movies.length === 0) return null;

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold font-heading tracking-tight md:text-3xl">
          {title}
        </h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="group flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            View All
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {movies.map((movie) => (
            <CarouselItem
              key={movie.id}
              className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
            >
              <MovieCard movie={movie} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="-left-4 lg:-left-12" />
          <CarouselNext className="-right-4 lg:-right-12" />
        </div>
      </Carousel>
    </section>
  );
}
