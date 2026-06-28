"use client"

import { useRouter } from "next/navigation"
import { BookmarkPlus, BookmarkCheck, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { useMyList } from "@/hooks/use-my-list"
import { useUser } from "@/hooks/use-user"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AddToListButtonProps {
  tmdbId: number
  variant?: "icon" | "default"
  className?: string
}

export function AddToListButton({ tmdbId, variant = "default", className }: AddToListButtonProps) {
  const { isAuthenticated } = useUser()
  const { isInList, toggle, isLoading, isPending } = useMyList()
  const router = useRouter()

  const inList = isInList(tmdbId)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    toggle(tmdbId)
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "group/btn relative flex items-center justify-center size-10 rounded-full border backdrop-blur-md transition-all duration-300 cursor-pointer",
          inList
            ? "bg-primary/20 border-primary/40 text-primary hover:bg-primary/30"
            : "bg-background/60 border-border/50 text-muted-foreground hover:bg-background/80 hover:text-foreground hover:border-border",
          className
        )}
        aria-label={inList ? "Remove from My List" : "Add to My List"}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
              <Loader2 className="h-4 w-4 animate-spin" />
            </motion.div>
          ) : inList ? (
            <motion.div key="check" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
              <BookmarkCheck className="h-4 w-4" />
            </motion.div>
          ) : (
            <motion.div key="plus" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
              <BookmarkPlus className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    )
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={inList ? "default" : "secondary"}
      size="lg"
      className={cn(
        "gap-2 font-semibold h-12 px-8 transition-all duration-300 cursor-pointer",
        inList
          ? "bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 shadow-lg shadow-primary/10"
          : "glass hover:bg-white/10",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Loader2 className="h-5 w-5 animate-spin" />
          </motion.span>
        ) : inList ? (
          <motion.span key="check" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
            <BookmarkCheck className="h-5 w-5" />
          </motion.span>
        ) : (
          <motion.span key="plus" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
            <BookmarkPlus className="h-5 w-5" />
          </motion.span>
        )}
      </AnimatePresence>
      {inList ? "In My List" : "Add to List"}
    </Button>
  )
}
