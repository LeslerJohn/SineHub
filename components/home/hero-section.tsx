"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Info, Play, Star } from "lucide-react";

import { TMDBMovie } from "@/types/tmdb";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { buttonVariants } from "@/components/ui/button";

interface HeroSectionProps {
  movies: TMDBMovie[];
}

export function HeroSection({ movies }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % movies.length);
  }, [movies.length]);

  useEffect(() => {
    if (isPaused || movies.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [isPaused, next, movies.length]);

  if (!movies || movies.length === 0) return null;

  const movie = movies[current];
  const backdropUrl = getTMDBImageUrl(movie.backdrop_path, "original");
  const posterUrl = getTMDBImageUrl(movie.poster_path, "w500");
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";

  return (
    <div
      className="relative w-full overflow-hidden bg-background"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient glow behind content */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="animate-hero-glow h-[60%] w-[60%] rounded-full bg-primary/20 blur-[120px]" />
      </div>

      {/* Background Image with crossfade */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 z-[1]"
        >
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70 md:opacity-90"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-background via-background/20 to-transparent" />
      <div className="absolute inset-0 z-[2] bg-gradient-to-r from-background/60 via-transparent to-transparent hidden md:block" />
      {/* Bottom edge fade for seamless section transition */}
      <div className="absolute bottom-0 left-0 right-0 h-24 z-[2] bg-gradient-to-t from-background to-transparent" />

      <div className="container relative z-10 mx-auto px-4 py-16 sm:py-24 md:py-32 lg:py-40">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12">

          {/* Mobile poster */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-1/2 max-w-[200px] shrink-0 overflow-hidden rounded-xl shadow-2xl md:hidden ring-1 ring-white/10"
            >
              <Image
                src={posterUrl}
                alt={movie.title}
                width={500}
                height={750}
                className="h-auto w-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Text content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center md:items-start md:text-left max-w-2xl"
            >
              {/* Badges */}
              <div className="mb-4 flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium">
                <span className="glass flex items-center gap-1 rounded-full px-3 py-1 text-primary">
                  <Star className="h-4 w-4 fill-primary" />
                  {movie.vote_average ? movie.vote_average.toFixed(1) : "NR"}
                </span>
                <span className="glass flex items-center gap-1 rounded-full px-3 py-1">
                  <Calendar className="h-4 w-4" />
                  {releaseYear}
                </span>
                <span className="rounded-full bg-gradient-to-r from-red-600 to-rose-500 px-3 py-1 font-bold text-white shadow-lg shadow-red-500/20">
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
                <Link
                  href={`/showtimes?movie=${movie.id}`}
                  className={buttonVariants({
                    size: "lg",
                    className:
                      "gap-2 font-semibold h-12 px-8 shadow-lg shadow-primary/20",
                  })}
                >
                  <Play className="h-5 w-5 fill-current" />
                  Find Showtimes
                </Link>
                <Link
                  href={`/movie/${movie.id}`}
                  className={buttonVariants({
                    size: "lg",
                    variant: "secondary",
                    className:
                      "gap-2 font-semibold h-12 px-8 glass hover:bg-white/10",
                  })}
                >
                  <Info className="h-5 w-5" />
                  View Details
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pill indicators */}
        {movies.length > 1 && (
          <div className="mt-10 flex items-center justify-center md:justify-start gap-2">
            {movies.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  i === current
                    ? "w-8 bg-primary"
                    : "w-4 bg-muted-foreground/40 hover:bg-muted-foreground/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
