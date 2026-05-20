export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  video: boolean;
  original_language: string;
}

export interface TMDBMovieResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TMDBMovieDetails extends Omit<TMDBMovie, 'genre_ids'> {
  genres: TMDBGenre[];
  runtime: number | null;
  tagline: string | null;
  status: string;
  budget: number;
  revenue: number;
  production_companies?: TMDBProductionCompany[];
}

export interface TMDBCast {
  id: number;
  name: string;
  original_name: string;
  character: string;
  profile_path: string | null;
  credit_id: string;
  order: number;
}

export interface TMDBReleaseDate {
  certification: string;
  iso_3166_1: string;
  release_dates: {
    certification: string;
    type: number;
    release_date: string;
  }[];
}

export interface TMDBReleaseDatesResponse {
  id: number;
  results: TMDBReleaseDate[];
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TMDBVideosResponse {
  id: number;
  results: TMDBVideo[];
}

export interface TMDBCreditsResponse {
  id: number;
  cast: TMDBCast[];
}
