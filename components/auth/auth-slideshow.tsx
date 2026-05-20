'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Film } from 'lucide-react'

// Basic interface matching TMDB movie result
interface Movie {
  id: number
  title: string
  poster_path: string | null
}

export function AuthSlideshow({ movies }: { movies: Movie[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Use TMDB image base URL
  const getImageUrl = (path: string | null) => path ? `https://image.tmdb.org/t/p/w780${path}` : ''

  useEffect(() => {
    if (!movies || movies.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [movies])

  if (!movies || movies.length === 0) {
    // Fallback static background if no movies
    return (
      <div className="dark relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Film className="mr-2 h-6 w-6" />
          SineHub
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;All movies. All malls. One app. Discover your next favorite movie and find the best showtimes near you seamlessly.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
    )
  }

  return (
    <div className="dark relative hidden h-full flex-col bg-muted p-10 text-white lg:flex overflow-hidden">
      <div className="absolute inset-0 bg-zinc-900 z-0" />
      
      {/* Slideshow background */}
      <div className="absolute inset-0 z-10 opacity-40">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            {movies[currentIndex]?.poster_path && (
              <Image
                src={getImageUrl(movies[currentIndex].poster_path)}
                alt={movies[currentIndex].title}
                fill
                sizes="50vw"
                className="object-cover"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/60 to-zinc-900/80" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-20 flex items-center text-lg font-medium">
        <Film className="mr-2 h-6 w-6" />
        SineHub
      </div>
      <div className="relative z-20 mt-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <blockquote className="space-y-2">
              <p className="text-lg font-semibold text-amber-400">
                Now Showing: {movies[currentIndex]?.title}
              </p>
            </blockquote>
          </motion.div>
        </AnimatePresence>
        <blockquote className="space-y-2 mt-4">
          <p className="text-lg">
            &ldquo;All movies. All malls. One app. Discover your next favorite movie and find the best showtimes near you seamlessly.&rdquo;
          </p>
        </blockquote>
      </div>
    </div>
  )
}
