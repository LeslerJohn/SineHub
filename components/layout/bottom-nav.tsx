"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Clapperboard, Home, Search, User } from "lucide-react"

import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/search", label: "Search", icon: Search },
    { href: "/moviebud", label: "Moviebud", icon: Clapperboard },
    { href: "/profile", label: "Profile", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 z-50 flex h-16 w-full items-center justify-around border-t bg-background pb-safe md:hidden">
      {links.map((link) => {
        const Icon = link.icon
        const isActive = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full text-muted-foreground transition-colors hover:text-foreground",
              isActive && "text-primary"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
