"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { TMDBMovie } from "@/types/tmdb";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { Badge } from "@/components/ui/badge";

interface MovieCardProps {
  movie: TMDBMovie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
  
  return (
    <motion.div
      layoutId={`movie-card-${movie.id}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl bg-card shadow-sm transition-shadow hover:shadow-md h-full"
    >
      <Link href={`/movie/${movie.id}`} className="flex h-full flex-col">
        <motion.div layoutId={`movie-poster-${movie.id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
          <Image
            src={getTMDBImageUrl(movie.poster_path, "w500")}
            alt={movie.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={false}
          />
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : "NR"}</span>
          </div>
        </motion.div>
        
        <div className="flex flex-col flex-1 p-4">
          <h3 className="font-semibold leading-tight line-clamp-1 mb-1" title={movie.title}>
            {movie.title}
          </h3>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-sm text-muted-foreground">{releaseYear}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
