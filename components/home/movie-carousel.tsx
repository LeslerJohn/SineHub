"use client";

import { useState, useEffect } from "react";
import { TMDBMovie } from "@/types/tmdb";
import { MovieCard } from "@/components/shared/movie-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface MovieCarouselProps {
  title: string;
  movies: TMDBMovie[];
  viewAllLink?: string;
}

export function MovieCarousel({ title, movies, viewAllLink }: MovieCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });

    api.on("reInit", () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (!movies || movies.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="py-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold font-heading tracking-tight md:text-3xl">
            {title}
          </h2>
          <div className="h-0.5 w-12 rounded-full bg-gradient-to-r from-primary to-primary/0" />
        </div>
        
        <div className="flex items-center gap-4">
          {/* Netflix-style Pagination Dashes */}
          {count > 1 && (
            <div className="hidden sm:flex items-center gap-1.5 mr-2">
              {Array.from({ length: count }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => api?.scrollTo(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === current
                      ? "w-6 bg-primary"
                      : "w-2 bg-muted hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to page ${idx + 1}`}
                />
              ))}
            </div>
          )}
          
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
      </div>

      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: false,
          slidesToScroll: 1,
          breakpoints: {
            "(min-width: 640px)": { slidesToScroll: 2 },
            "(min-width: 768px)": { slidesToScroll: 3 },
            "(min-width: 1024px)": { slidesToScroll: 4 },
            "(min-width: 1280px)": { slidesToScroll: 5 },
          },
        }}
        className="w-full group/carousel"
      >
        {/* py-4 -my-4 adds vertical padding inside the scroll window so card hover zoom effect is never clipped */}
        <CarouselContent className="-ml-4 py-4 -my-4">
          {movies.map((movie, i) => (
            <CarouselItem
              key={movie.id}
              className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
            >
              <MovieCard movie={movie} index={i} />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Glassmorphic navigation arrows positioned overlaying the sides, hidden on mobile touch */}
        <CarouselPrevious className="absolute left-4 top-[40%] -translate-y-1/2 z-30 size-11 rounded-full bg-background/80 dark:bg-black/60 backdrop-blur-md border border-border dark:border-white/10 hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground shadow-lg transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 pointer-events-auto flex items-center justify-center" />
        <CarouselNext className="absolute right-4 top-[40%] -translate-y-1/2 z-30 size-11 rounded-full bg-background/80 dark:bg-black/60 backdrop-blur-md border border-border dark:border-white/10 hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground shadow-lg transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 pointer-events-auto flex items-center justify-center" />
      </Carousel>
    </motion.section>
  );
}
