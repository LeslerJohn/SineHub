"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Film } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { useUser } from "@/hooks/use-user"
import { logout } from "@/lib/actions/auth"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const { isAuthenticated } = useUser()

  return (
    <div className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b bg-background/95 backdrop-blur px-4 md:hidden">
      <Link href="/" className="flex items-center space-x-2">
        <Film className="h-6 w-6 text-primary" />
        <span className="font-heading text-lg font-bold">SineHub</span>
      </Link>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </SheetTrigger>
        <SheetContent side="right" className="flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-left">Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 py-4">
            <Link href="/" onClick={() => setOpen(false)} className="text-sm font-medium">Home</Link>
            <Link href="/showtimes" onClick={() => setOpen(false)} className="text-sm font-medium">Showtimes</Link>
            <Link href="/moviebud" onClick={() => setOpen(false)} className="text-sm font-medium">Moviebud</Link>
            <Link href="/search" onClick={() => setOpen(false)} className="text-sm font-medium">Search</Link>
            {isAuthenticated && (
              <Link href="/my-list" onClick={() => setOpen(false)} className="text-sm font-medium">My List</Link>
            )}
          </div>
          <div className="mt-auto flex flex-col gap-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Theme</span>
              <ThemeToggle />
            </div>
            {isAuthenticated ? (
              <form action={logout}>
                <Button className="w-full" variant="outline" type="submit" onClick={() => setOpen(false)}>
                  Log out
                </Button>
              </form>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setOpen(false)} 
                className={buttonVariants({ className: "w-full" })}
              >
                Sign In
              </Link>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
