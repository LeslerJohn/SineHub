"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { TMDBMovie } from "@/types/tmdb";
import { getTMDBImageUrl } from "@/lib/tmdb";

interface MovieCardProps {
  movie: TMDBMovie;
  index?: number;
}

export function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl bg-card shadow-sm card-glow h-full"
    >
      <Link href={`/movie/${movie.id}`} className="flex h-full flex-col">
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
          {/* Skeleton shimmer while loading */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-shimmer" />
          )}
          <Image
            src={getTMDBImageUrl(movie.poster_path, "w500")}
            alt={movie.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className={`object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {/* Rating badge with gradient */}
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-gradient-to-br from-black/80 to-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md ring-1 ring-white/10">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span>{movie.vote_average ? movie.vote_average.toFixed(1) : "NR"}</span>
          </div>
          {/* Bottom gradient for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="flex flex-col flex-1 p-4">
          <h3
            className="font-semibold leading-tight line-clamp-1 mb-1 group-hover:text-primary transition-colors"
            title={movie.title}
          >
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
