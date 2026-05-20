import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <Container className="py-8 md:py-12 flex-1 flex flex-col md:flex-row gap-8">
      {/* Sidebar Skeleton */}
      <div className="hidden md:block w-64 shrink-0 pr-6 border-r space-y-8 py-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-full" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-4 w-16" />
          <div className="flex flex-wrap gap-2">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[2/3] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
