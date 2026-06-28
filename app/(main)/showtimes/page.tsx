import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, ChevronLeft, ChevronRight, Film, Clock } from "lucide-react";
import { format } from "date-fns";
import { cookies } from "next/headers";

import { 
  getMovieDetails, 
  getTMDBImageUrl,
  discoverMovies,
  searchMovies
} from "@/lib/tmdb";
import { createClient } from "@/lib/supabase/server";
import { DatabaseShowtime } from "@/types";
import { TMDBMovie } from "@/types/tmdb";
import { Container } from "@/components/ui/container";
import { DateSelector } from "@/components/showtimes/date-selector";
import { CinemaList } from "@/components/showtimes/cinema-list";
import { LocationToggle } from "@/components/shared/location-toggle";
import { FilterSidebar } from "@/components/search/filter-sidebar";
import { MovieCard } from "@/components/shared/movie-card";

export const metadata: Metadata = {
  title: "Showtimes & Movies",
  description: "Find available cinema showtimes, explore popular movies and book tickets.",
};

interface ShowtimesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getPageRange(current: number, total: number): number[] {
  const maxPages = Math.min(total, 500); // TMDB API Cap
  const pages: number[] = [];
  
  if (maxPages <= 7) {
    for (let i = 1; i <= maxPages; i++) pages.push(i);
  } else {
    pages.push(1);
    
    if (current > 3) {
      pages.push(-1);
    }
    
    const start = Math.max(2, current - 1);
    const end = Math.min(maxPages - 1, current + 1);
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    
    if (current < maxPages - 2) {
      pages.push(-1);
    }
    
    if (!pages.includes(maxPages)) {
      pages.push(maxPages);
    }
  }
  
  return pages;
}

export default async function ShowtimesPage({ searchParams }: ShowtimesPageProps) {
  const params = await searchParams;
  const movieIdStr = typeof params.movie === "string" ? params.movie : undefined;
  
  if (!movieIdStr) {
    // 1. Read explorer search & filter parameters
    const q = typeof params.q === "string" ? params.q : undefined;
    const with_genres = typeof params.with_genres === "string" ? params.with_genres : undefined;
    const vote_average_gte = typeof params["vote_average.gte"] === "string" ? params["vote_average.gte"] : undefined;
    
    // Read page parameter (default to '1')
    const pageStr = typeof params.page === "string" ? params.page : "1";
    const currentPage = parseInt(pageStr, 10) || 1;
    const todayStr = format(new Date(), "yyyy-MM-dd");

    let movies: TMDBMovie[] = [];
    let totalResults = 0;
    let totalPages = 1;

    try {
      if (q) {
        const res = await searchMovies(q, pageStr).catch(() => ({ results: [] as TMDBMovie[], total_results: 0, total_pages: 0 }));
        movies = res.results || [];
        totalResults = res.total_results || 0;
        totalPages = res.total_pages || 1;
        
        // Post-filter to exclude any coming soon movies (release date is in the future)
        const today = new Date();
        movies = movies.filter(m => {
          if (!m.release_date) return true;
          return new Date(m.release_date) <= today;
        });

        // Apply other filters locally since TMDB search endpoint doesn't support them natively
        if (with_genres) {
          const genreIds = with_genres.split(",").map(Number);
          movies = movies.filter(m => genreIds.every(id => m.genre_ids?.includes(id)));
        }
        if (vote_average_gte) {
          movies = movies.filter(m => m.vote_average >= parseFloat(vote_average_gte));
        }

        // Sort searched movies locally by release date descending
        movies.sort((a, b) => {
          const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
          const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
          return dateB - dateA;
        });
      } else {
        const discoverParams: Record<string, string> = {
          sort_by: "release_date.desc",
          "release_date.lte": todayStr, // Native exclude coming soon
          page: pageStr,
        };
        if (with_genres) discoverParams.with_genres = with_genres;
        if (vote_average_gte) discoverParams["vote_average.gte"] = vote_average_gte;

        const res = await discoverMovies(discoverParams).catch(() => ({ results: [] as TMDBMovie[], total_results: 0, total_pages: 0 }));
        movies = res.results || [];
        totalResults = res.total_results || 0;
        totalPages = res.total_pages || 1;
      }
    } catch (error) {
      console.error("Error fetching Showtimes Hub movies:", error);
    }

    const createPageUrl = (pageNumber: number) => {
      const newParams = new URLSearchParams();
      if (q) newParams.set("q", q);
      if (with_genres) newParams.set("with_genres", with_genres);
      if (vote_average_gte) newParams.set("vote_average.gte", vote_average_gte);
      newParams.set("page", pageNumber.toString());
      return `/showtimes?${newParams.toString()}`;
    };

    return (
      <main className="flex min-h-screen flex-col pb-16">
        {/* Cinema Hub Header */}
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-card to-background border-b py-12 md:py-16">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
          <Container className="relative z-10 text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-amber-500">
              Cinema Hub
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg">
              All movies. All malls. One app. Browse currently showing movies, filter by genre, and explore showtimes.
            </p>
          </Container>
        </div>

        {/* Explore All Movies Directory */}
        <div className="py-12 bg-muted/5">
          <Container>
            <div className="mb-8">
              <h2 className="text-3xl font-heading font-bold tracking-tight">Explore All Movies</h2>
              <p className="text-muted-foreground mt-1">
                Filter currently showing titles by genre and score, or search by title.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <FilterSidebar />
              
              <div className="flex-1 w-full">
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {movies.length > 0 
                      ? `Showing ${movies.length} movies (Page ${currentPage} of ${Math.min(totalPages, 500)})` 
                      : "No movies found matching your criteria."}
                  </p>
                </div>

                {movies.length > 0 ? (
                  <div className="space-y-12">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                      {movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-6 border-t">
                        <Link
                          href={currentPage > 1 ? createPageUrl(currentPage - 1) : "#"}
                          className={`inline-flex items-center gap-1.5 px-4 h-9 rounded-lg border text-sm font-medium transition-all ${
                            currentPage > 1
                              ? "bg-background border-border hover:bg-muted text-foreground"
                              : "bg-muted text-muted-foreground border-transparent pointer-events-none opacity-50"
                          }`}
                          aria-disabled={currentPage <= 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Link>

                        <div className="hidden sm:flex items-center gap-1.5">
                          {getPageRange(currentPage, totalPages).map((p, idx) => {
                            if (p === -1) {
                              return (
                                <span key={`dots-${idx}`} className="px-2 text-muted-foreground">
                                  ...
                                </span>
                              );
                            }
                            const isActive = p === currentPage;
                            return (
                              <Link
                                key={`page-${p}`}
                                href={createPageUrl(p)}
                                className={`inline-flex items-center justify-center size-9 rounded-lg text-sm font-medium transition-all ${
                                  isActive
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {p}
                              </Link>
                            );
                          })}
                        </div>

                        <span className="sm:hidden text-sm font-medium text-muted-foreground px-4">
                          Page {currentPage} of {Math.min(totalPages, 500)}
                        </span>

                        <Link
                          href={currentPage < totalPages ? createPageUrl(currentPage + 1) : "#"}
                          className={`inline-flex items-center gap-1.5 px-4 h-9 rounded-lg border text-sm font-medium transition-all ${
                            currentPage < totalPages && currentPage < 500
                              ? "bg-background border-border hover:bg-muted text-foreground"
                              : "bg-muted text-muted-foreground border-transparent pointer-events-none opacity-50"
                          }`}
                          aria-disabled={currentPage >= totalPages || currentPage >= 500}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed rounded-2xl bg-muted/30">
                    <div className="bg-background shadow-sm p-5 rounded-full mb-6 border">
                      <Film className="h-8 w-8 text-muted-foreground/70" />
                    </div>
                    <h3 className="text-2xl font-heading font-bold mb-3 tracking-tight">No Movies Found</h3>
                    <p className="text-muted-foreground max-w-md text-sm">
                      We couldn't find any movies matching your current search or filters. Try adjusting your criteria or exploring different genres.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </div>
      </main>
    );
  }

  const movieId = parseInt(movieIdStr, 10);
  const selectedDate = typeof params.date === "string" ? params.date : format(new Date(), "yyyy-MM-dd");

  let movie;
  try {
    movie = await getMovieDetails(movieId);
  } catch (error) {
    notFound();
  }

  const backdropUrl = getTMDBImageUrl(movie.backdrop_path, "w1280");
  const posterUrl = getTMDBImageUrl(movie.poster_path, "w185");

  // Read location cookie for display
  const cookieStore = await cookies();
  const locationCookie = cookieStore.get("sinehub_location");
  const displayLocation = locationCookie?.value || "Zamboanga City";

  // Fetch from Supabase
  const supabase = await createClient();
  
  // 1. Get our internal movie ID from TMDB ID
  const { data: dbMovie } = await supabase
    .from("movies")
    .select("id")
    .eq("tmdb_id", movieId)
    .single();

  let showtimes: DatabaseShowtime[] = [];

  if (dbMovie) {
    // 2. Fetch showtimes for this movie, on this date, joining the cinema
    const { data: rawShowtimes } = await supabase
      .from("showtimes")
      .select("*, cinemas!inner(*)")
      .eq("movie_id", dbMovie.id)
      .eq("date", selectedDate)
      .eq("cinemas.city", displayLocation)
      .order("time", { ascending: true });

    if (rawShowtimes) {
      showtimes = rawShowtimes as DatabaseShowtime[];
    }
  }

  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Immersive Glassmorphic Mini Header */}
      <div className="relative w-full overflow-hidden bg-background border-b border-border/40">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            priority
            className="object-cover scale-105 filter blur-[3px] opacity-25 dark:opacity-40"
          />
          {/* Cinematic Radial theater dark mask */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.85)_80%)] dark:bg-[radial-gradient(circle_at_center,transparent_25%,rgba(9,9,11,0.92)_90%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent hidden md:block" />
        </div>

        <Container className="relative z-10 pt-16 pb-6 md:pt-12 flex flex-col md:flex-row items-center md:items-end gap-6">
          <Link 
            href={`/movie/${movie.id}`} 
            className="absolute top-4 left-4 md:static md:mb-auto p-2.5 rounded-full bg-background/60 dark:bg-black/40 backdrop-blur-md border border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 group shadow-lg"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
          </Link>
          
          <div className="hidden md:block w-24 shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/10 dark:border-white/5 transition-transform duration-300 hover:scale-102">
            <Image
              src={posterUrl}
              alt={movie.title}
              width={185}
              height={278}
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="text-center md:text-left mt-4 md:mt-0 space-y-3">
            <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight drop-shadow-md bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs font-semibold">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 px-3.5 py-1.5 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
                <MapPin className="h-3.5 w-3.5" />
                <span>Showing in {displayLocation}</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-card/60 backdrop-blur-md border px-3 py-1 text-muted-foreground shadow-sm">
                <Clock className="h-3.5 w-3.5" />
                <span>{movie.runtime} mins</span>
              </span>
              <span className="rounded-full bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 text-rose-500 px-3.5 py-1 text-[10px] font-extrabold uppercase shadow-sm">
                Active Booking
              </span>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-3 mb-1">
             <LocationToggle />
          </div>
        </Container>
      </div>

      <Container className="py-8 space-y-10">
        {/* Date Selection */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-heading font-bold tracking-tight">Select Screening Date</h2>
            <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-primary to-primary/0" />
          </div>
          <DateSelector />
        </div>

        {/* Showtimes List */}
        <div className="space-y-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-heading font-bold tracking-tight">Cinemas & Showtimes</h2>
            <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-primary to-primary/0" />
          </div>
          <CinemaList showtimes={showtimes} movieTitle={movie.title} />
        </div>
      </Container>
    </main>
  );
}
