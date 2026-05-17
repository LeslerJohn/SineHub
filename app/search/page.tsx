import { Metadata } from "next";
import { Film } from "lucide-react";

import { discoverMovies, searchMovies } from "@/lib/tmdb";
import { TMDBMovie } from "@/types/tmdb";
import { Container } from "@/components/ui/container";
import { FilterSidebar } from "@/components/search/filter-sidebar";
import { MovieCard } from "@/components/shared/movie-card";

export const metadata: Metadata = {
  title: "Search Movies",
  description: "Find your next favorite movie by genre, rating, or title.",
};

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const with_genres = typeof params.with_genres === "string" ? params.with_genres : undefined;
  const vote_average_gte = typeof params["vote_average.gte"] === "string" ? params["vote_average.gte"] : undefined;

  let movies: TMDBMovie[] = [];
  let totalResults = 0;

  try {
    if (q) {
      // If there is a text query, we must use the search endpoint
      // Note: TMDB search endpoint doesn't natively support genre/rating filters.
      // For a robust production app, a unified search index (like Algolia or Supabase Edge Functions) is better.
      // Here, we just use the search endpoint.
      const res = await searchMovies(q);
      movies = res.results || [];
      totalResults = res.total_results || 0;
      
      // Optional: Post-filter locally if filters are applied
      if (with_genres) {
        const genreIds = with_genres.split(",").map(Number);
        movies = movies.filter(m => genreIds.every(id => m.genre_ids.includes(id)));
      }
      if (vote_average_gte) {
        movies = movies.filter(m => m.vote_average >= parseFloat(vote_average_gte));
      }
    } else {
      // If no text query, use the discover endpoint which supports complex filters
      const discoverParams: Record<string, string> = {
        sort_by: "popularity.desc",
      };
      if (with_genres) discoverParams.with_genres = with_genres;
      if (vote_average_gte) discoverParams["vote_average.gte"] = vote_average_gte;

      const res = await discoverMovies(discoverParams);
      movies = res.results || [];
      totalResults = res.total_results || 0;
    }
  } catch (error) {
    console.error("Error fetching search results:", error);
  }

  return (
    <Container className="py-8 md:py-12 flex-1 flex flex-col md:flex-row gap-8">
      <FilterSidebar />
      
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-heading">
            {q ? `Search results for "${q}"` : "Discover Movies"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {movies.length > 0 
              ? `Found ${q ? movies.length : totalResults} movies` 
              : "No movies found matching your criteria."}
          </p>
        </div>

        {movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
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
    </Container>
  );
}
