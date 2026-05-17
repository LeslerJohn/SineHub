"use client";

import { TMDBVideo } from "@/types/tmdb";

interface TrailerPlayerProps {
  videos: TMDBVideo[];
}

export function TrailerPlayer({ videos }: TrailerPlayerProps) {
  if (!videos || videos.length === 0) return null;

  // Find the official trailer, fallback to any trailer, fallback to any video
  const trailer = 
    videos.find((v) => v.type === "Trailer" && v.site === "YouTube" && v.official) ||
    videos.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
    videos.find((v) => v.site === "YouTube");

  if (!trailer) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-heading font-bold">Official Trailer</h3>
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted shadow-md">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${trailer.key}?rel=0`}
          title={trailer.name}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
    </div>
  );
}
