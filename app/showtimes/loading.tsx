import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShowtimesLoading() {
  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Mini Movie Header Skeleton */}
      <div className="relative w-full bg-muted border-b">
        <Container className="relative z-10 pt-8 pb-6 flex flex-col md:flex-row items-center md:items-end gap-6">
          <Skeleton className="absolute top-4 left-4 md:static md:mb-auto p-2 rounded-full h-10 w-10" />
          
          <Skeleton className="hidden md:block w-24 shrink-0 rounded-md shadow-lg border aspect-[2/3]" />

          <div className="text-center md:text-left mt-8 md:mt-0 space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          
          <Skeleton className="ml-auto hidden lg:block h-9 w-40" />
        </Container>
      </div>

      <Container className="py-8 space-y-8">
        {/* Date Selection Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-3 overflow-hidden py-2">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="min-w-[80px] h-24 rounded-xl shrink-0" />
            ))}
          </div>
        </div>

        {/* Showtimes List Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
          </div>
          
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border bg-card overflow-hidden">
                <div className="p-4 sm:p-6 border-b bg-muted/20">
                  <Skeleton className="h-8 w-64 mb-3" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-6">
                  <div>
                    <Skeleton className="h-4 w-16 mb-3" />
                    <div className="flex flex-wrap gap-3">
                      {[...Array(4)].map((_, j) => (
                        <Skeleton key={j} className="h-20 w-24 rounded-xl" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
