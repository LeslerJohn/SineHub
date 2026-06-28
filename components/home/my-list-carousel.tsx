import { createClient } from "@/lib/supabase/server"
import { getMovieDetails } from "@/lib/tmdb"
import { MovieCarousel } from "@/components/home/movie-carousel"
import { TMDBMovie } from "@/types/tmdb"

export async function MyListCarousel() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: listItems } = await supabase
    .from("user_movie_lists")
    .select("tmdb_id")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false })
    .limit(15)

  if (!listItems || listItems.length === 0) return null

  const movies = (
    await Promise.all(
      listItems.map(async (item) => {
        try {
          const details = await getMovieDetails(item.tmdb_id)
          return {
            id: details.id,
            title: details.title,
            original_title: details.original_title,
            overview: details.overview,
            poster_path: details.poster_path,
            backdrop_path: details.backdrop_path,
            release_date: details.release_date,
            genre_ids: details.genres.map((g) => g.id),
            vote_average: details.vote_average,
            vote_count: details.vote_count,
            popularity: details.popularity,
            adult: details.adult,
            video: details.video,
            original_language: details.original_language,
          } satisfies TMDBMovie
        } catch {
          return null
        }
      })
    )
  ).filter((m): m is TMDBMovie => m !== null && m.poster_path !== null)

  if (movies.length === 0) return null

  return (
    <MovieCarousel
      title="My List"
      movies={movies}
      viewAllLink="/my-list"
    />
  )
}
