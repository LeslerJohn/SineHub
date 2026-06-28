import { Container } from "@/components/ui/container";
import { HeroSection } from "@/components/home/hero-section";
import { MovieCarousel } from "@/components/home/movie-carousel";
import { MyListCarousel } from "@/components/home/my-list-carousel";
import { getNowPlaying, getTrendingMovies, getUpcoming } from "@/lib/tmdb";
import { TMDBMovie } from "@/types/tmdb";

function withPosters(movies: TMDBMovie[]): TMDBMovie[] {
  return movies.filter((m) => m.poster_path !== null);
}

export default async function Home() {
  const [nowPlayingRes, upcomingRes, trendingRes] = await Promise.all([
    getNowPlaying().catch(() => ({ results: [] as TMDBMovie[], page: 1, total_pages: 0, total_results: 0 })),
    getUpcoming().catch(() => ({ results: [] as TMDBMovie[], page: 1, total_pages: 0, total_results: 0 })),
    getTrendingMovies('week').catch(() => ({ results: [] as TMDBMovie[], page: 1, total_pages: 0, total_results: 0 })),
  ]);

  const nowPlayingMovies = withPosters(nowPlayingRes.results || []);
  const upcomingMovies = withPosters(upcomingRes.results || []);
  const trendingMovies = withPosters(trendingRes.results || []);

  const heroMovies = nowPlayingMovies
    .filter((m) => m.backdrop_path !== null)
    .slice(0, 5);

  return (
    <main className="flex min-h-screen flex-col">
      {heroMovies.length > 0 && <HeroSection movies={heroMovies} />}
      
      <Container className="py-8 space-y-2">
        {nowPlayingMovies.length > 0 && (
          <MovieCarousel 
            title="Now Showing" 
            movies={nowPlayingMovies.slice(0, 15)} 
            viewAllLink="/showtimes" 
          />
        )}
        
        {trendingMovies.length > 0 && (
          <MovieCarousel 
            title="Trending This Week" 
            movies={trendingMovies.slice(0, 15)} 
          />
        )}

        <MyListCarousel />
        
        {upcomingMovies.length > 0 && (
          <MovieCarousel 
            title="Coming Soon" 
            movies={upcomingMovies.slice(0, 15)} 
            viewAllLink="/search?filter=upcoming" 
          />
        )}
      </Container>
    </main>
  );
}
