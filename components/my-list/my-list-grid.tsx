"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Bookmark } from "lucide-react"

import { TMDBMovie } from "@/types/tmdb"
import { MovieCard } from "@/components/shared/movie-card"
import { removeFromMyList } from "@/lib/actions/my-list"

interface MyListGridProps {
  initialMovies: TMDBMovie[]
}

export function MyListGrid({ initialMovies }: MyListGridProps) {
  const [movies, setMovies] = useState(initialMovies)
  const [removingId, setRemovingId] = useState<number | null>(null)

  async function handleRemove(tmdbId: number) {
    setRemovingId(tmdbId)

    setMovies((prev) => prev.filter((m) => m.id !== tmdbId))

    const result = await removeFromMyList(tmdbId)

    if ("error" in result) {
      const removed = initialMovies.find((m) => m.id === tmdbId)
      if (removed) {
        setMovies((prev) => [...prev, removed])
      }
    }

    setRemovingId(null)
  }

  if (movies.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="mb-6 flex items-center justify-center size-20 rounded-full bg-muted/50 border border-border/50">
          <Bookmark className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold font-heading mb-2">Your list is empty</h2>
        <p className="text-muted-foreground max-w-sm">
          Start adding movies to your list by clicking the bookmark icon on any movie page.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      <AnimatePresence mode="popLayout">
        {movies.map((movie, i) => (
          <motion.div
            key={movie.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            className="relative group/item"
          >
            <MovieCard movie={movie} index={0} />
            <button
              onClick={() => handleRemove(movie.id)}
              disabled={removingId === movie.id}
              className="absolute top-2 left-2 z-20 flex items-center justify-center size-8 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white/80 hover:text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-200 opacity-0 group-hover/item:opacity-100 cursor-pointer"
              aria-label={`Remove ${movie.title} from list`}
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
