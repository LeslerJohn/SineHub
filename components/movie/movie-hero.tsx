import Image from "next/image";
import Link from "next/link";
import { Clock, Play, Star } from "lucide-react";

import { TMDBMovieDetails } from "@/types/tmdb";
import { getTMDBImageUrl } from "@/lib/tmdb";
import { buttonVariants } from "@/components/ui/button";

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
    <div className="relative w-full overflow-hidden bg-background">
      {/* Background Image with Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backdropUrl}
          alt={movie.title}
          fill
          priority
          className="object-cover opacity-30 md:opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent hidden md:block" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-16 sm:py-24 md:py-32">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12">
          
          {/* Poster */}
          <div className="w-2/3 max-w-[250px] shrink-0 overflow-hidden rounded-xl shadow-2xl">
            <Image
              src={posterUrl}
              alt={movie.title}
              width={500}
              height={750}
              className="h-auto w-full object-cover"
              priority
            />
          </div>

          {/* Text Content */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left max-w-3xl">
            <h1 className="mb-2 font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-foreground drop-shadow-md">
              {movie.title}
            </h1>
            
            {movie.tagline && (
              <p className="mb-6 text-xl text-muted-foreground italic drop-shadow-sm">
                "{movie.tagline}"
              </p>
            )}

            {/* Badges & Meta */}
            <div className="mb-8 flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium">
              <span className="flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-primary border border-primary/30">
                <Star className="h-4 w-4 fill-primary" />
                {movie.vote_average ? movie.vote_average.toFixed(1) : "NR"}
              </span>
              <span className="rounded-full bg-muted/50 px-3 py-1 backdrop-blur-md">
                {releaseYear}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-muted/50 px-3 py-1 backdrop-blur-md">
                <Clock className="h-4 w-4" />
                {formatRuntime(movie.runtime)}
              </span>
              <span className="rounded-full bg-secondary/50 border border-secondary px-3 py-1 font-bold text-foreground shadow-sm">
                {certification}
              </span>
            </div>

            {/* Genres */}
            <div className="mb-8 flex flex-wrap items-center justify-center md:justify-start gap-2">
              {movie.genres.map((genre) => (
                <span key={genre.id} className="rounded-md border border-border bg-card/50 px-2 py-1 text-xs text-muted-foreground">
                  {genre.name}
                </span>
              ))}
            </div>

            <div className="flex w-full sm:w-auto">
              <Link href={`/showtimes?movie=${movie.id}`} className={buttonVariants({ size: "lg", className: "w-full sm:w-auto gap-2 font-semibold h-12 px-8 shadow-lg shadow-primary/20" })}>
                <Play className="h-5 w-5 fill-current" />
                Find Showtimes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
