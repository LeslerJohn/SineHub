import { Metadata } from "next";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Calendar, DollarSign, Globe, Building2, Activity, Info } from "lucide-react";

import { 
  getMovieDetails, 
  getMovieCredits, 
  getMovieVideos, 
  getMovieReleaseDates, 
  getSimilarMovies,
  getMovieCertification,
  getTMDBImageUrl
} from "@/lib/tmdb";
import { MovieHero } from "@/components/movie/movie-hero";
import { MovieSynopsis } from "@/components/movie/movie-synopsis";
import { CastCarousel } from "@/components/movie/cast-carousel";
import { TrailerPlayer } from "@/components/movie/trailer-player";
import { MovieCarousel } from "@/components/home/movie-carousel";
import { Container } from "@/components/ui/container";

interface MoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

function formatCurrency(amount: number | null | undefined) {
  if (!amount) return "N/A";
  if (amount >= 1e9) {
    return `$${(amount / 1e9).toFixed(1)}B`;
  }
  if (amount >= 1e6) {
    return `$${(amount / 1e6).toFixed(1)}M`;
  }
  if (amount >= 1e3) {
    return `$${(amount / 1e3).toFixed(1)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const movie = await getMovieDetails(parseInt(id, 10));
    return {
      title: movie.title,
      description: movie.overview || `Discover showtimes and details for ${movie.title}`,
      openGraph: {
        images: [getTMDBImageUrl(movie.backdrop_path, "w1280")],
      },
    };
  } catch (error) {
    return {
      title: "Movie Not Found",
    };
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const tmdbId = parseInt(id, 10);

  if (isNaN(tmdbId)) {
    notFound();
  }

  try {
    // Fetch all movie data concurrently
    const [
      movie,
      credits,
      videos,
      releaseDates,
      similar
    ] = await Promise.all([
      getMovieDetails(tmdbId),
      getMovieCredits(tmdbId),
      getMovieVideos(tmdbId),
      getMovieReleaseDates(tmdbId),
      getSimilarMovies(tmdbId)
    ]);

    const certification = getMovieCertification(releaseDates);

    return (
      <main className="flex min-h-screen flex-col pb-16">
        <MovieHero movie={movie} certification={certification} />
        
        <Container className="py-8 md:py-12 space-y-12">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            <div className="lg:col-span-2 space-y-12">
              <MovieSynopsis overview={movie.overview} />
              
              {credits.cast && credits.cast.length > 0 && (
                <CastCarousel cast={credits.cast} />
              )}
            </div>

            <div className="space-y-8">
              {videos.results && videos.results.length > 0 && (
                <TrailerPlayer videos={videos.results} />
              )}

              {/* Extended Movie Details Card */}
              <div className="rounded-2xl border border-border/50 bg-card/30 p-6 backdrop-blur-md space-y-6 shadow-md">
                <div className="flex items-center gap-2 border-b pb-4 border-border/40">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="font-heading font-bold text-lg">Movie Facts</h3>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground/75" />
                      Status
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      movie.status === "Released"
                        ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.07)]"
                        : movie.status === "Post Production" || movie.status === "In Production"
                        ? "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.07)]"
                        : "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.07)]"
                    }`}>
                      {movie.status || "Unknown"}
                    </span>
                  </div>

                  {/* Release Date */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground/75" />
                      Release Date
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {movie.release_date 
                        ? format(new Date(movie.release_date), "MMMM d, yyyy") 
                        : "N/A"}
                    </span>
                  </div>

                  {/* Original Language */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground/75" />
                      Language
                    </span>
                    <span className="text-sm font-medium text-foreground uppercase">
                      {movie.original_language || "N/A"}
                    </span>
                  </div>

                  {/* Budget */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground/75" />
                      Budget
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(movie.budget)}
                    </span>
                  </div>

                  {/* Revenue */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground/75" />
                      Revenue
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(movie.revenue)}
                    </span>
                  </div>

                  {/* Production Studios */}
                  {movie.production_companies && movie.production_companies.length > 0 && (
                    <div className="border-t pt-4 space-y-2.5 border-border/40">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground/75" />
                        Production
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {movie.production_companies.slice(0, 3).map((company) => (
                          <span key={company.id} className="text-xs bg-muted/60 border border-border/40 px-2 py-0.5 rounded text-muted-foreground">
                            {company.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Similar Movies */}
          {similar.results && similar.results.length > 0 && (
            <div className="pt-8 border-t">
              <MovieCarousel 
                title="Similar Movies" 
                movies={similar.results.slice(0, 15)} 
              />
            </div>
          )}
        </Container>
      </main>
    );
  } catch (error) {
    // If getMovieDetails fails, it's likely a 404
    notFound();
  }
}
