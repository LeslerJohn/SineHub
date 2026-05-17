import { Metadata } from "next";
import { notFound } from "next/navigation";

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
