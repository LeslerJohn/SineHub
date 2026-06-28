"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Play, Star, Calendar, ShieldCheck, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

import { TMDBMovieDetails } from "@/types/tmdb";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { buttonVariants } from "@/components/ui/button";
import { AddToListButton } from "@/components/shared/add-to-list-button";

interface MovieHeroProps {
  movie: TMDBMovieDetails;
  certification: string;
}

export function MovieHero({ movie, certification }: MovieHeroProps) {
  const backdropUrl = getTMDBImageUrl(movie.backdrop_path, "original");
  const posterUrl = getTMDBImageUrl(movie.poster_path, "w500");
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";

  const formatRuntime = (minutes: number | null) => {
    if (!minutes) return "N/A";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="relative w-full overflow-hidden bg-background border-b border-border/40">
      {/* Background Image with Gradient Overlays */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={backdropUrl}
          alt={movie.title}
          fill
          priority
          className="object-cover scale-105 filter blur-[3px] opacity-60 dark:opacity-45 transition-all duration-700"
        />
        {/* Cinematic Radial theater dark mask */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5)_85%)] dark:bg-[radial-gradient(circle_at_center,transparent_35%,rgba(9,9,11,0.7)_90%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent hidden md:block" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-16 sm:py-24 md:py-28">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12">
          
          {/* Poster with 3D Hover Float */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group/poster relative w-2/3 max-w-[250px] shrink-0 overflow-hidden rounded-2xl border border-white/10 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300"
          >
            <Image
              src={posterUrl}
              alt={movie.title}
              width={500}
              height={750}
              className="h-auto w-full object-cover transition-transform duration-700 group-hover/poster:scale-105"
              priority
            />
            {/* Hover reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
              <span className="text-[11px] font-semibold tracking-wider text-white/90 uppercase bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                Zoom Poster
              </span>
            </div>
          </motion.div>

          {/* Text Content */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left max-w-3xl">
            <h1 className="mb-2 font-heading text-4xl font-black tracking-tight sm:text-5xl md:text-6xl text-foreground drop-shadow-md bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
              {movie.title}
            </h1>
            
            {movie.tagline && (
              <p className="mb-6 text-lg sm:text-xl text-muted-foreground italic font-medium opacity-90 drop-shadow-sm tracking-wide">
                "{movie.tagline}"
              </p>
            )}

            {/* Badges & Meta */}
            <div className="mb-6 flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium">
              {/* Gold Star Circular Badge */}
              <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 px-3.5 py-1.5 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="font-bold">{movie.vote_average ? movie.vote_average.toFixed(1) : "NR"}</span>
                <span className="text-xs text-amber-500/60 font-normal">({movie.vote_count?.toLocaleString() || "0"} votes)</span>
              </div>
              
              <div className="flex items-center gap-1.5 rounded-full bg-card/60 backdrop-blur-md border px-3.5 py-1.5 shadow-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{releaseYear}</span>
              </div>
              
              <div className="flex items-center gap-1.5 rounded-full bg-card/60 backdrop-blur-md border px-3.5 py-1.5 shadow-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{formatRuntime(movie.runtime)}</span>
              </div>
              
              {certification && (
                <div className="flex items-center gap-1.5 rounded-full bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 text-rose-500 px-3.5 py-1.5 font-bold shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{certification}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            <div className="mb-8 flex flex-wrap items-center justify-center md:justify-start gap-2">
              {movie.genres.map((genre) => (
                <span 
                  key={genre.id} 
                  className="rounded-full border border-border/60 bg-muted/40 hover:bg-muted/80 hover:border-border px-3 py-0.5 text-xs text-muted-foreground transition-colors cursor-default"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full sm:w-auto"
              >
                <Link 
                  href={`/showtimes?movie=${movie.id}`} 
                  className={buttonVariants({ 
                    size: "lg", 
                    className: "group w-full sm:w-auto gap-2 font-semibold h-12 px-8 shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/95 hover:to-amber-500/95 text-primary-foreground border-0" 
                  })}
                >
                  <Play className="h-4 w-4 fill-current text-primary-foreground" />
                  Find Showtimes
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full sm:w-auto"
              >
                <AddToListButton tmdbId={movie.id} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
