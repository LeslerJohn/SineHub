import "dotenv/config";
import { supabase } from "./lib/supabase.js";
import { createLogger } from "./lib/logger.js";

const log = createLogger("MovieSync");

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_TOKEN = process.env.TMDB_ACCESS_TOKEN;

if (!TMDB_TOKEN) {
  throw new Error("Missing TMDB_ACCESS_TOKEN in environment variables.");
}

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
}

interface TMDBMovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  genres: { id: number; name: string }[];
  vote_average: number;
}

interface TMDBVideosResponse {
  results: { key: string; site: string; type: string }[];
}

interface TMDBReleaseDatesResponse {
  results: {
    iso_3166_1: string;
    release_dates: { certification: string }[];
  }[];
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${TMDB_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error(`TMDB ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

async function fetchNowPlaying(): Promise<TMDBMovie[]> {
  const page1 = await tmdbFetch<{ results: TMDBMovie[] }>("/movie/now_playing", {
    region: "PH",
    language: "en-US",
    page: "1",
  });

  const page2 = await tmdbFetch<{ results: TMDBMovie[] }>("/movie/now_playing", {
    region: "PH",
    language: "en-US",
    page: "2",
  });

  return [...page1.results, ...page2.results];
}

async function fetchUpcoming(): Promise<TMDBMovie[]> {
  const page1 = await tmdbFetch<{ results: TMDBMovie[] }>("/movie/upcoming", {
    region: "PH",
    language: "en-US",
    page: "1",
  });

  return page1.results;
}

function getCertification(releaseDates: TMDBReleaseDatesResponse): string | null {
  const ph = releaseDates.results.find((r) => r.iso_3166_1 === "PH");
  if (ph?.release_dates.length) {
    const cert = ph.release_dates.find((d) => d.certification)?.certification;
    if (cert) return cert;
  }

  const us = releaseDates.results.find((r) => r.iso_3166_1 === "US");
  if (us?.release_dates.length) {
    const cert = us.release_dates.find((d) => d.certification)?.certification;
    if (cert) return cert;
  }

  return null;
}

function getTrailerId(videos: TMDBVideosResponse): string | null {
  const yt = videos.results.filter((v) => v.site === "YouTube");
  const trailer = yt.find((v) => v.type === "Trailer");
  const teaser = yt.find((v) => v.type === "Teaser");
  return trailer?.key || teaser?.key || yt[0]?.key || null;
}

async function syncMovie(movie: TMDBMovie, status: "now_showing" | "coming_soon"): Promise<boolean> {
  try {
    const { data: existing } = await supabase
      .from("movies")
      .select("id")
      .eq("tmdb_id", movie.id)
      .limit(1);

    if (existing && existing.length > 0) {
      log.debug(`Already exists: "${movie.title}" (tmdb_id=${movie.id})`);
      return false;
    }

    const [details, videos, releaseDates] = await Promise.all([
      tmdbFetch<TMDBMovieDetails>(`/movie/${movie.id}`, { language: "en-US" }),
      tmdbFetch<TMDBVideosResponse>(`/movie/${movie.id}/videos`, { language: "en-US" }),
      tmdbFetch<TMDBReleaseDatesResponse>(`/movie/${movie.id}/release_dates`),
    ]);

    const genres = details.genres.map((g) => g.name);
    const certification = getCertification(releaseDates);
    const trailerId = getTrailerId(videos);

    const { error } = await supabase.from("movies").insert({
      tmdb_id: movie.id,
      title: details.title,
      synopsis: details.overview || null,
      poster_url: details.poster_path
        ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
        : null,
      backdrop_url: details.backdrop_path
        ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
        : null,
      runtime: details.runtime || null,
      genre: genres,
      mtrcb_rating: certification,
      imdb_score: details.vote_average
        ? Math.round(details.vote_average * 10) / 10
        : null,
      release_date: details.release_date || null,
      status,
      trailer_youtube_id: trailerId,
    });

    if (error) {
      log.error(`Insert failed for "${movie.title}": ${error.message}`);
      return false;
    }

    log.info(`✓ Synced: "${details.title}" (${status}) — ${genres.join(", ")}`);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.error(`Failed to sync "${movie.title}": ${msg}`);
    return false;
  }
}

async function main(): Promise<void> {
  log.info("Starting movie sync from TMDB → Supabase");

  log.info("Fetching Now Playing movies (PH region)...");
  const nowPlaying = await fetchNowPlaying();
  log.info(`Found ${nowPlaying.length} now playing movies`);

  log.info("Fetching Upcoming movies (PH region)...");
  const upcoming = await fetchUpcoming();
  log.info(`Found ${upcoming.length} upcoming movies`);

  let synced = 0;
  let skipped = 0;

  for (const movie of nowPlaying) {
    const added = await syncMovie(movie, "now_showing");
    if (added) synced++;
    else skipped++;

    await new Promise((r) => setTimeout(r, 250));
  }

  for (const movie of upcoming) {
    const added = await syncMovie(movie, "coming_soon");
    if (added) synced++;
    else skipped++;

    await new Promise((r) => setTimeout(r, 250));
  }

  log.info(`Sync complete: ${synced} added, ${skipped} skipped/existing`);

  const { count } = await supabase
    .from("movies")
    .select("*", { count: "exact", head: true });

  log.info(`Total movies in database: ${count}`);
}

main().catch((err) => {
  log.error(`Fatal error: ${err}`);
  process.exit(1);
});
