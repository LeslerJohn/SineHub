"use client";

import { useState } from "react";
import { Play, Film } from "lucide-react";
import { motion } from "framer-motion";
import { TMDBVideo } from "@/types/tmdb";

interface TrailerPlayerProps {
  videos: TMDBVideo[];
}

export function TrailerPlayer({ videos }: TrailerPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videos || videos.length === 0) return null;

  // Find the official trailer, fallback to any trailer, fallback to any video
  const trailer = 
    videos.find((v) => v.type === "Trailer" && v.site === "YouTube" && v.official) ||
    videos.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
    videos.find((v) => v.site === "YouTube");

  if (!trailer) return null;

  const thumbnailUrL = `https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`;

  return (
    <div className="rounded-2xl border border-border/50 bg-card/30 p-5 backdrop-blur-md space-y-4 shadow-md">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-heading font-bold tracking-tight flex items-center gap-2">
          <Film className="h-5 w-5 text-primary" />
          Official Trailer
        </h3>
        <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-primary to-primary/0" />
      </div>

      <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted shadow-inner relative group border border-border/40">
        {!isPlaying ? (
          <div 
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 w-full h-full cursor-pointer overflow-hidden flex items-center justify-center"
          >
            {/* YouTube High-Res Thumbnail with zoom on hover */}
            <img
              src={thumbnailUrL}
              alt={trailer.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => {
                // Fallback to standard definition if maxres doesn't exist
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`;
              }}
            />
            {/* Dark glass cover */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />

            {/* Glowing Glass Play Button */}
            <motion.div 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 size-16 rounded-full bg-background/80 dark:bg-black/60 backdrop-blur-md border border-white/20 dark:border-white/10 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary shadow-primary/20"
            >
              <Play className="h-7 w-7 fill-current ml-1 transition-transform group-hover:scale-110" />
              {/* Pulse waves */}
              <div className="absolute inset-0 rounded-full border border-primary/40 animate-ping opacity-75 pointer-events-none group-hover:border-primary/80" />
            </motion.div>

            {/* Trailer Label */}
            <div className="absolute bottom-3 left-3 z-10 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-white/90">
              Click to Play
            </div>
          </div>
        ) : (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
            title={trailer.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        )}
      </div>
    </div>
  );
}
