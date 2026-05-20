"use client";

import { useEffect, useState, useTransition } from "react";
import { useQueryState, parseAsArrayOf, parseAsString, parseAsFloat } from "nuqs";
import { SlidersHorizontal, Search } from "lucide-react";

import { TMDBGenre } from "@/types/tmdb";
import { useDebounce } from "@/hooks/use-debounce";
import { Slider } from "@/components/ui/slider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function FilterSidebar() {
  const [isPending, startTransition] = useTransition();

  // nuqs URL state
  const [q, setQ] = useQueryState("q", { shallow: false });
  const [selectedGenres, setSelectedGenres] = useQueryState(
    "with_genres",
    parseAsArrayOf(parseAsString, ",").withDefault([]).withOptions({ shallow: false })
  );
  const [voteAverage, setVoteAverage] = useQueryState(
    "vote_average.gte",
    parseAsFloat.withOptions({ shallow: false })
  );

  // Local state for fetching TMDB genres
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  
  // Local state for inputs to allow smooth UI before committing to URL
  const [localSearch, setLocalSearch] = useState(q || "");
  const [localRating, setLocalRating] = useState<number[]>([voteAverage || 0]);

  const debouncedSearch = useDebounce(localSearch, 500);
  const debouncedRating = useDebounce(localRating, 500);

  useEffect(() => {
    fetch('/api/genres')
      .then((res) => res.json())
      .then((data) => setGenres(data.genres || []))
      .catch(console.error);
  }, []);

  // Sync local changes to URL
  useEffect(() => {
    startTransition(() => {
      setQ(debouncedSearch.trim() || null);
    });
  }, [debouncedSearch, setQ]);

  useEffect(() => {
    startTransition(() => {
      setVoteAverage(debouncedRating[0] > 0 ? debouncedRating[0] : null);
    });
  }, [debouncedRating, setVoteAverage]);

  const toggleGenre = (genreId: string) => {
    startTransition(() => {
      setSelectedGenres((prev) =>
        prev.includes(genreId)
          ? prev.filter((id) => id !== genreId)
          : [...prev, genreId]
      );
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      setSelectedGenres(null);
      setVoteAverage(null);
      setLocalRating([0]);
    });
  };

  const activeFilterCount = selectedGenres.length + (localRating[0] > 0 ? 1 : 0);

  const FilterContent = () => (
    <div className={`space-y-8 py-4 ${isPending ? "opacity-70 transition-opacity" : ""}`}>
      {/* Search Input for Mobile/Desktop */}
      <div className="space-y-2 lg:hidden">
        <h3 className="font-semibold text-sm">Search</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search movies..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg hidden md:block">Filters</h3>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground h-auto p-0">
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium leading-none">Minimum Rating</h4>
          <span className="text-sm text-muted-foreground">{localRating[0]}+</span>
        </div>
        <Slider
          defaultValue={[0]}
          max={10}
          step={0.5}
          value={localRating}
          onValueChange={(val) => setLocalRating(val as number[])}
          className="w-full"
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium leading-none">Genres</h4>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => {
            const isSelected = selectedGenres.includes(genre.id.toString());
            return (
              <button
                key={genre.id}
                onClick={() => toggleGenre(genre.id.toString())}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {genre.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sheet */}
      <div className="md:hidden mb-4">
        <Sheet>
          <SheetTrigger className={buttonVariants({ variant: "outline", className: "w-full gap-2" })}>
            <SlidersHorizontal className="h-4 w-4" />
            Filters & Search
            {activeFilterCount > 0 && (
              <span className="ml-auto bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
                {activeFilterCount}
              </span>
            )}
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filters & Search</SheetTitle>
            </SheetHeader>
            <FilterContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0 pr-6 border-r">
        <FilterContent />
      </div>
    </>
  );
}
