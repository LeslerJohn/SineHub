import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, ChevronLeft, ChevronRight, Film } from "lucide-react";
import { format } from "date-fns";
import { cookies } from "next/headers";

import { 
  getMovieDetails, 
  getTMDBImageUrl,
  getTrendingMovies,
  getNowPlaying,
  getUpcoming,
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
import { MovieCarousel } from "@/components/home/movie-carousel";
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
    // 1. Fetch Carousel datasets concurrently
    const [trendingRes, nowPlayingRes, upcomingRes] = await Promise.all([
      getTrendingMovies('week').catch(() => ({ results: [] as TMDBMovie[] })),
      getNowPlaying().catch(() => ({ results: [] as TMDBMovie[] })),
      getUpcoming().catch(() => ({ results: [] as TMDBMovie[] })),
    ]);

    const trendingMovies = (trendingRes.results || []).filter(m => m.poster_path !== null).slice(0, 15);
    const latestMovies = (nowPlayingRes.results || []).filter(m => m.poster_path !== null).slice(0, 15);
    const upcomingMovies = (upcomingRes.results || []).filter(m => m.poster_path !== null).slice(0, 15);

    // 2. Read explorer search & filter parameters
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
      } else {
        const discoverParams: Record<string, string> = {
          sort_by: "popularity.desc",
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
              All movies. All malls. One app. Browse currently showing and upcoming movies, filter by genre, and explore showtimes.
            </p>
          </Container>
        </div>

        {/* Carousel Rows */}
        <Container className="py-8 space-y-6">
          {trendingMovies.length > 0 && (
            <MovieCarousel 
              title="Trending This Week" 
              movies={trendingMovies} 
            />
          )}
          
          {latestMovies.length > 0 && (
            <MovieCarousel 
              title="Latest Releases (Now Showing)" 
              movies={latestMovies} 
            />
          )}
          
          {upcomingMovies.length > 0 && (
            <MovieCarousel 
              title="Coming Soon" 
              movies={upcomingMovies} 
            />
          )}
        </Container>

        {/* Explore All Movies Directory */}
        <div className="border-t py-12 bg-muted/10">
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
      {/* Mini Movie Header */}
      <div className="relative w-full overflow-hidden bg-background border-b">
        <div className="absolute inset-0 z-0">
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            priority
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
        </div>

        <Container className="relative z-10 pt-8 pb-6 flex flex-col md:flex-row items-center md:items-end gap-6">
          <Link href={`/movie/${movie.id}`} className="absolute top-4 left-4 md:static md:mb-auto p-2 rounded-full bg-background/50 backdrop-blur-md border hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          
          <div className="hidden md:block w-24 shrink-0 rounded-md overflow-hidden shadow-lg border">
            <Image
              src={posterUrl}
              alt={movie.title}
              width={185}
              height={278}
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="text-center md:text-left mt-8 md:mt-0">
            <h1 className="text-2xl md:text-4xl font-heading font-bold mb-2">{movie.title}</h1>
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="hidden md:inline">Showing in</span> {displayLocation}
              </span>
              <span>•</span>
              <span>{movie.runtime} mins</span>
            </div>
          </div>
          
          <div className="ml-auto hidden lg:block mb-1">
             <LocationToggle />
          </div>
        </Container>
      </div>

      <Container className="py-8 space-y-8">
        {/* Date Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Select Date</h2>
          <DateSelector />
        </div>

        {/* Showtimes List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Cinemas & Showtimes</h2>
          </div>
          <CinemaList showtimes={showtimes} movieTitle={movie.title} />
        </div>
      </Container>
    </main>
  );
}
