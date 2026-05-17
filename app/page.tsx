import { Container } from "@/components/ui/container";
import { HeroSection } from "@/components/home/hero-section";
import { MovieCarousel } from "@/components/home/movie-carousel";
import { getNowPlaying, getTrendingMovies, getUpcoming } from "@/lib/tmdb";

export default async function Home() {
  // Fetch data concurrently
  const [nowPlayingRes, upcomingRes, trendingRes] = await Promise.all([
    getNowPlaying(),
    getUpcoming(),
    getTrendingMovies('week')
  ]);

  const nowPlayingMovies = nowPlayingRes.results || [];
  const upcomingMovies = upcomingRes.results || [];
  const trendingMovies = trendingRes.results || [];

  // Use the first popular 'Now Playing' movie for the hero section
  const heroMovie = nowPlayingMovies.length > 0 ? nowPlayingMovies[0] : null;

  return (
    <main className="flex min-h-screen flex-col">
      {heroMovie && <HeroSection movie={heroMovie} />}
      
      <Container className="py-8 space-y-4">
        {nowPlayingMovies.length > 0 && (
          <MovieCarousel 
            title="Now Showing" 
            movies={nowPlayingMovies.slice(1, 15)} 
            viewAllLink="/showtimes" 
          />
        )}
        
        {upcomingMovies.length > 0 && (
          <MovieCarousel 
            title="Coming Soon" 
            movies={upcomingMovies.slice(0, 15)} 
            viewAllLink="/search?filter=upcoming" 
          />
        )}
        
        {trendingMovies.length > 0 && (
          <MovieCarousel 
            title="Trending This Week" 
            movies={trendingMovies.slice(0, 15)} 
          />
        )}
      </Container>
    </main>
  );
}
