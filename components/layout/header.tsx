"use client"

import Link from "next/link"
import { Film, Search, User } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { user, isAuthenticated, isLoading } = useUser()
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null)
  
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
            <Link href="/genre" className="transition-colors hover:text-primary">Genre</Link>
            <Link href="/moviebud" className="transition-colors hover:text-primary">Moviebud</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <SearchInput />
          
          <LocationToggle />

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
                    <DropdownMenuItem render={<Link href="/likes" />}>
                      Likes
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
