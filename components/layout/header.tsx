"use client"

import Link from "next/link"
import { Film, MapPin, Search, User } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useUser } from "@/hooks/use-user"
import { logout } from "@/lib/actions/auth"

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
          <div className="relative hidden lg:flex items-center">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search movies..."
              className="h-9 w-64 rounded-md border border-input bg-transparent px-8 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          
          <Button variant="outline" size="sm" className="hidden lg:flex gap-2">
            <MapPin className="h-4 w-4" />
            <span>Zamboanga City</span>
          </Button>

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
