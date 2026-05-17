import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function MovieLoading() {
  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Hero Skeleton */}
      <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] bg-muted overflow-hidden">
        <div className="container relative z-10 mx-auto px-4 h-full flex flex-col md:flex-row items-center md:items-end pb-16 md:pb-32 gap-8 md:gap-12">
          
          {/* Poster Skeleton */}
          <Skeleton className="w-2/3 max-w-[250px] aspect-[2/3] shrink-0 rounded-xl shadow-2xl" />

          {/* Text Skeleton */}
          <div className="flex flex-col items-center md:items-start w-full max-w-3xl space-y-4">
            <Skeleton className="h-12 md:h-16 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-3">
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex gap-4 pt-4 w-full sm:w-auto">
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </div>
      </div>
      
      <Container className="py-8 md:py-12 space-y-12">
        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          <div className="lg:col-span-2 space-y-12">
            {/* Synopsis Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            
            {/* Cast Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <div className="flex gap-4 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Trailer Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="aspect-video w-full rounded-xl" />
            </div>
          </div>

        </div>

        {/* Similar Movies Skeleton */}
        <div className="pt-8 border-t space-y-4">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] w-[180px] rounded-xl shrink-0" />
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
