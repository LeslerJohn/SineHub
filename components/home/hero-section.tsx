"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Info, Play, Star } from "lucide-react";

import { TMDBMovie } from "@/types/tmdb";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { Button, buttonVariants } from "@/components/ui/button";

interface HeroSectionProps {
  movie: TMDBMovie;
}

export function HeroSection({ movie }: HeroSectionProps) {
  if (!movie) return null;

  const backdropUrl = getTMDBImageUrl(movie.backdrop_path, "original");
  const posterUrl = getTMDBImageUrl(movie.poster_path, "w500");
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";

  return (
    <div className="relative w-full overflow-hidden bg-background">
      {/* Background Image with Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backdropUrl}
          alt={movie.title}
          fill
          priority
          className="object-cover opacity-60 md:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent hidden md:block" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-16 sm:py-24 md:py-32 lg:py-40">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12">
          
          {/* Mobile-only Poster (Optional, often hidden on mobile hero to save space) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-1/2 max-w-[200px] shrink-0 overflow-hidden rounded-xl shadow-2xl md:hidden"
          >
            <Image
              src={posterUrl}
              alt={movie.title}
              width={500}
              height={750}
              className="h-auto w-full object-cover"
            />
          </motion.div>

          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col items-center text-center md:items-start md:text-left max-w-2xl"
          >
            {/* Badges */}
            <div className="mb-4 flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium">
              <span className="flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-primary border border-primary/30">
                <Star className="h-4 w-4 fill-primary" />
                {movie.vote_average ? movie.vote_average.toFixed(1) : "NR"}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-muted/50 px-3 py-1 backdrop-blur-md">
                <Calendar className="h-4 w-4" />
                {releaseYear}
              </span>
              <span className="rounded-full bg-destructive/80 px-3 py-1 font-bold text-white shadow-sm">
                NOW SHOWING
              </span>
            </div>

            <h1 className="mb-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-foreground drop-shadow-md">
              {movie.title}
            </h1>
            
            <p className="mb-8 text-lg text-muted-foreground md:text-xl line-clamp-3 md:line-clamp-4 drop-shadow-sm">
              {movie.overview}
            </p>

            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4">
              <Link href={`/showtimes?movie=${movie.id}`} className={buttonVariants({ size: "lg", className: "gap-2 font-semibold h-12 px-8 shadow-lg shadow-primary/20" })}>
                <Play className="h-5 w-5 fill-current" />
                Find Showtimes
              </Link>
              <Link href={`/movie/${movie.id}`} className={buttonVariants({ size: "lg", variant: "secondary", className: "gap-2 font-semibold h-12 px-8 bg-secondary/80 backdrop-blur-md hover:bg-secondary" })}>
                <Info className="h-5 w-5" />
                View Details
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
