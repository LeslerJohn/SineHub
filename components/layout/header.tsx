"use client"

import Link from "next/link"
import { Film, Search, User, Bookmark, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

import { Button, buttonVariants } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useUser } from "@/hooks/use-user"
import { logout } from "@/lib/actions/auth"
import { LocationToggle } from "@/components/shared/location-toggle"
import { SearchInput } from "@/components/search/search-input"
import { Container } from "@/components/ui/container"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { TMDBGenre } from "@/types/tmdb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const DEFAULT_GENRES: TMDBGenre[] = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
]

export function Header() {
  const { user, isAuthenticated, isLoading } = useUser()
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null)
  const [isGenreOpen, setIsGenreOpen] = useState(false)
  const [genres, setGenres] = useState<TMDBGenre[]>(DEFAULT_GENRES)

  useEffect(() => {
    fetch('/api/genres')
      .then((res) => res.json())
      .then((data) => {
        if (data.genres && data.genres.length > 0) {
          setGenres(data.genres)
        }
      })
      .catch(console.error)
  }, [])
  
  useEffect(() => {
    if (user?.id) {
      const supabase = createClient()
      const fetchProfile = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single()
        
        if (data?.avatar_url) {
          setProfileAvatar(data.avatar_url)
        }
      }
      fetchProfile()
    }
  }, [user?.id])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Film className="h-6 w-6 text-primary" />
            <span className="font-heading text-xl font-bold">SineHub</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/showtimes" className="transition-colors hover:text-primary">Showtimes</Link>
            <div 
              className="relative"
              onMouseEnter={() => setIsGenreOpen(true)}
              onMouseLeave={() => setIsGenreOpen(false)}
            >
              <button className="flex items-center gap-1 transition-colors hover:text-primary cursor-pointer text-sm font-medium py-2">
                <span>Genre</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isGenreOpen && "rotate-180")} />
              </button>
              {isGenreOpen && (
                <div className="absolute left-0 top-full z-50 w-[580px] rounded-xl border bg-background/95 p-5 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 animate-in fade-in-50 slide-in-from-top-1 duration-200">
                  <div className="grid grid-rows-5 grid-flow-col gap-x-6 gap-y-1">
                    {genres.map((genre) => (
                      <Link
                        key={genre.id}
                        href={`/search?with_genres=${genre.id}`}
                        onClick={() => setIsGenreOpen(false)}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary py-1.5 px-3 rounded-md hover:bg-muted/50 block truncate"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/moviebud" className="transition-colors hover:text-primary">Moviebud</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <SearchInput />
          
          <LocationToggle className="w-[180px] h-9 hidden lg:flex gap-2" />

          <ThemeToggle />

          {!isLoading && (
            isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "relative h-8 w-8 rounded-full border border-border/50 p-0 cursor-pointer" })}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profileAvatar || user.user_metadata?.avatar_url || ""} alt="@user" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.email?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.user_metadata?.full_name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem render={<Link href="/profile" />}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/my-list" />}>
                      <Bookmark className="h-4 w-4 mr-2" />
                      My List
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <form action={logout} className="w-full">
                      <button type="submit" className="w-full text-left outline-none bg-transparent cursor-pointer">
                        Log out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className={buttonVariants({ size: "sm" })}>
                Sign In
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  )
}
