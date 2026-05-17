"use client"

import Link from "next/link"
import { Film, MapPin, Search, User } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useUser } from "@/hooks/use-user"
import { logout } from "@/lib/actions/auth"
import { LocationToggle } from "@/components/shared/location-toggle"
import { SearchInput } from "@/components/search/search-input"

export function Header() {
  const { isAuthenticated, isLoading } = useUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Film className="h-6 w-6 text-primary" />
            <span className="font-heading text-xl font-bold">SineHub</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/showtimes" className="transition-colors hover:text-primary">Showtimes</Link>
            <Link href="/moviebud" className="transition-colors hover:text-primary">Moviebud</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <SearchInput />
          
          <LocationToggle />

          <ThemeToggle />

          {!isLoading && (
            isAuthenticated ? (
              <form action={logout}>
                <Button variant="ghost" size="sm" type="submit">
                  Log out
                </Button>
              </form>
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
