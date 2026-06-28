import {
  TMDBGenre,
  TMDBMovieDetails,
  TMDBMovieResponse,
  TMDBVideosResponse,
  TMDBCreditsResponse,
  TMDBReleaseDatesResponse,
  TMDBWatchProvidersResponse,
} from '@/types/tmdb';


const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Base utility for fetching data from TMDB API
 */
async function fetchFromTMDB<T>(endpoint: string, params: Record<string, string> = {}, revalidate = 3600): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  
  // Add query parameters
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
    },
    next: {
      revalidate, // Cache for 1 hour by default
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`TMDB API Error: ${response.status} - ${errorData.status_message || response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch movies that are currently playing in theaters
 * @param region Default is 'PH' for Philippines
 */
export async function getNowPlaying(region: string = 'PH'): Promise<TMDBMovieResponse> {
  return fetchFromTMDB<TMDBMovieResponse>('/movie/now_playing', {
    region,
    language: 'en-US',
    page: '1',
  });
}

/**
 * Fetch movies that are coming soon to theaters
 * @param region Default is 'PH' for Philippines
 */
export async function getUpcoming(region: string = 'PH'): Promise<TMDBMovieResponse> {
  return fetchFromTMDB<TMDBMovieResponse>('/movie/upcoming', {
    region,
    language: 'en-US',
    page: '1',
  });
}

/**
 * Fetch detailed information about a specific movie
 * @param tmdbId The TMDB Movie ID
 */
export async function getMovieDetails(tmdbId: number): Promise<TMDBMovieDetails> {
  return fetchFromTMDB<TMDBMovieDetails>(`/movie/${tmdbId}`, {
    language: 'en-US',
  });
}

/**
 * Search for movies by title
 * @param query The search query string
 */
export async function searchMovies(query: string, page: string = '1'): Promise<TMDBMovieResponse> {
  return fetchFromTMDB<TMDBMovieResponse>('/search/movie', {
    query,
    include_adult: 'false',
    language: 'en-US',
    page,
  });
}

/**
 * Fetch videos (trailers, teasers, etc.) for a specific movie
 * @param tmdbId The TMDB Movie ID
 */
export async function getMovieVideos(tmdbId: number): Promise<TMDBVideosResponse> {
  return fetchFromTMDB<TMDBVideosResponse>(`/movie/${tmdbId}/videos`, {
    language: 'en-US',
  });
}

/**
 * Fetch cast and crew for a specific movie
 * @param tmdbId The TMDB Movie ID
 */
export async function getMovieCredits(tmdbId: number): Promise<TMDBCreditsResponse> {
  return fetchFromTMDB<TMDBCreditsResponse>(`/movie/${tmdbId}/credits`, {
    language: 'en-US',
  });
}

/**
 * Fetch release dates and age certifications for a specific movie
 * @param tmdbId The TMDB Movie ID
 */
export async function getMovieReleaseDates(tmdbId: number): Promise<TMDBReleaseDatesResponse> {
  return fetchFromTMDB<TMDBReleaseDatesResponse>(`/movie/${tmdbId}/release_dates`);
}

/**
 * Extract the PH or US certification from release dates
 * @param releaseDatesResponse The response from getMovieReleaseDates
 */
export function getMovieCertification(releaseDatesResponse: TMDBReleaseDatesResponse): string {
  if (!releaseDatesResponse || !releaseDatesResponse.results) return "NR";

  const phRelease = releaseDatesResponse.results.find((r) => r.iso_3166_1 === "PH");
  if (phRelease && phRelease.release_dates.length > 0) {
    const cert = phRelease.release_dates.find(d => d.certification)?.certification;
    if (cert) return cert;
  }

  const usRelease = releaseDatesResponse.results.find((r) => r.iso_3166_1 === "US");
  if (usRelease && usRelease.release_dates.length > 0) {
    const cert = usRelease.release_dates.find(d => d.certification)?.certification;
    if (cert) return cert;
  }

  return "NR";
}

/**
 * Fetch similar movies for a specific movie
 * @param tmdbId The TMDB Movie ID
 */
export async function getSimilarMovies(tmdbId: number): Promise<TMDBMovieResponse> {
  return fetchFromTMDB<TMDBMovieResponse>(`/movie/${tmdbId}/similar`, {
    language: 'en-US',
    page: '1',
  });
}

export async function getMovieWatchProviders(tmdbId: number): Promise<TMDBWatchProvidersResponse> {
  return fetchFromTMDB<TMDBWatchProvidersResponse>(`/movie/${tmdbId}/watch/providers`);
}

/**
 * Fetch trending movies for the day or week
 * @param timeWindow 'day' or 'week'
 */
export async function getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBMovieResponse> {
  return fetchFromTMDB<TMDBMovieResponse>(`/trending/movie/${timeWindow}`, {
    language: 'en-US',
  });
}

/**
 * Fetch movie genres from TMDB
 */
export async function getGenres(): Promise<{ genres: TMDBGenre[] }> {
  return fetchFromTMDB<{ genres: TMDBGenre[] }>('/genre/movie/list', {
    language: 'en-US',
  });
}

/**
 * Helper to construct a full TMDB image URL
 * @param path The image path from TMDB API
 * @param size The size of the image (e.g., 'w500', 'original')
 */
export function getTMDBImageUrl(path: string | null, size: string = 'w500'): string {
  if (!path) return '/placeholder-movie.jpg'; // We can add a local placeholder image later
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Discover movies with complex filters (genres, ratings, etc.)
 * @param params Query parameters for the /discover/movie endpoint
 */
export async function discoverMovies(params: Record<string, string> = {}): Promise<TMDBMovieResponse> {
  return fetchFromTMDB<TMDBMovieResponse>('/discover/movie', {
    language: 'en-US',
    include_adult: 'false',
    include_video: 'false',
    page: '1',
    ...params,
  });
}

/**
 * Fetch the official list of movie genres from TMDB
 */
export async function getMovieGenres(): Promise<{ genres: TMDBGenre[] }> {
  // Genres change rarely, so we can cache this for longer (e.g., 24 hours)
  return fetchFromTMDB<{ genres: TMDBGenre[] }>('/genre/movie/list', {
    language: 'en-US',
  }, 86400);
}

