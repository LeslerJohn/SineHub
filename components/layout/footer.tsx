import Link from "next/link"
import { Film } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 hidden md:block">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Film className="h-6 w-6" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for moviegoers. All rights reserved &copy; {new Date().getFullYear()} SineHub.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/terms" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  )
}
