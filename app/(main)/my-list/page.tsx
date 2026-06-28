import { Metadata } from "next"
import { redirect } from "next/navigation"
import { Bookmark } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { getMovieDetails } from "@/lib/tmdb"
import { Container } from "@/components/ui/container"
import { MyListGrid } from "@/components/my-list/my-list-grid"
import { TMDBMovie } from "@/types/tmdb"

export const metadata: Metadata = {
  title: "My List | SineHub",
  description: "Your personal movie watchlist on SineHub.",
}

export default async function MyListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: listItems } = await supabase
    .from("user_movie_lists")
    .select("tmdb_id")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false })

  const movies = listItems
    ? (
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
      ).filter((m): m is TMDBMovie => m !== null)
    : []

  return (
    <main className="flex min-h-screen flex-col pb-16">
      <div className="relative w-full overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <Container className="relative py-12 md:py-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10 border border-primary/20">
              <Bookmark className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading tracking-tight md:text-4xl">
                My List
              </h1>
              <p className="text-muted-foreground mt-1">
                {movies.length} {movies.length === 1 ? "movie" : "movies"} saved
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8 md:py-12">
        <MyListGrid initialMovies={movies} />
      </Container>
    </main>
  )
}
