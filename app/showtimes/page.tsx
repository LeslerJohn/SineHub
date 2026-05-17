import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { format } from "date-fns";
import { cookies } from "next/headers";

import { getMovieDetails, getTMDBImageUrl } from "@/lib/tmdb";
import { getMockShowtimes } from "@/lib/mock-data/showtimes";
import { Container } from "@/components/ui/container";
import { DateSelector } from "@/components/showtimes/date-selector";
import { CinemaList } from "@/components/showtimes/cinema-list";
import { LocationToggle } from "@/components/shared/location-toggle";

export const metadata: Metadata = {
  title: "Showtimes",
  description: "Find available cinema showtimes and book tickets.",
};

interface ShowtimesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShowtimesPage({ searchParams }: ShowtimesPageProps) {
  const params = await searchParams;
  const movieIdStr = typeof params.movie === "string" ? params.movie : undefined;
  
  if (!movieIdStr) {
    // Ideally we would show a list of movies to select, but for now we require a movie
    return (
      <Container className="py-20 text-center space-y-4">
        <h1 className="text-3xl font-bold">Select a Movie</h1>
        <p className="text-muted-foreground">Please select a movie to view its showtimes.</p>
        <Link href="/" className="text-primary hover:underline block mt-4">
          Return to Home
        </Link>
      </Container>
    );
  }

  const movieId = parseInt(movieIdStr, 10);
  const selectedDate = typeof params.date === "string" ? params.date : format(new Date(), "yyyy-MM-dd");

  let movie;
  try {
    movie = await getMovieDetails(movieId);
  } catch (error) {
    notFound();
  }

  const showtimes = getMockShowtimes(movieIdStr, selectedDate);
  const backdropUrl = getTMDBImageUrl(movie.backdrop_path, "w1280");
  const posterUrl = getTMDBImageUrl(movie.poster_path, "w185");

  // Read location cookie for display
  const cookieStore = await cookies();
  const locationCookie = cookieStore.get("sinehub_location");
  let displayLocation = "Zamboanga City";
  
  if (locationCookie) {
    const locMap: Record<string, string> = {
      zamboanga: "Zamboanga City",
      manila: "Metro Manila",
      cebu: "Cebu City",
      davao: "Davao City"
    };
    displayLocation = locMap[locationCookie.value] || "Zamboanga City";
  }

  return (
    <main className="flex min-h-screen flex-col pb-16">
      {/* Mini Movie Header */}
      <div className="relative w-full overflow-hidden bg-background border-b">
        <div className="absolute inset-0 z-0">
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            priority
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
        </div>

        <Container className="relative z-10 pt-8 pb-6 flex flex-col md:flex-row items-center md:items-end gap-6">
          <Link href={`/movie/${movie.id}`} className="absolute top-4 left-4 md:static md:mb-auto p-2 rounded-full bg-background/50 backdrop-blur-md border hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          
          <div className="hidden md:block w-24 shrink-0 rounded-md overflow-hidden shadow-lg border">
            <Image
              src={posterUrl}
              alt={movie.title}
              width={185}
              height={278}
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="text-center md:text-left mt-8 md:mt-0">
            <h1 className="text-2xl md:text-4xl font-heading font-bold mb-2">{movie.title}</h1>
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="hidden md:inline">Showing in</span> {displayLocation}
              </span>
              <span>•</span>
              <span>{movie.runtime} mins</span>
            </div>
          </div>
          
          {/* We can re-use the LocationToggle here for local refinement if we want */}
          <div className="ml-auto hidden lg:block mb-1">
             <LocationToggle />
          </div>
        </Container>
      </div>

      <Container className="py-8 space-y-8">
        {/* Date Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Select Date</h2>
          <DateSelector />
        </div>

        {/* Showtimes List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Cinemas & Showtimes</h2>
          </div>
          <CinemaList showtimes={showtimes} movieTitle={movie.title} />
        </div>
      </Container>
    </main>
  );
}
