export interface DatabaseCinema {
  id: string;
  name: string;
  brand: string;
  city: string;
  lat: number;
  lng: number;
  website_url: string;
}

export interface DatabaseShowtime {
  id: string;
  movie_id: string;
  cinema_id: string;
  date: string;
  time: string;
  format: string;
  ticket_url: string;
  scraped_at: string;
  cinemas: DatabaseCinema;
}

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  username?: string | null;
  avatar_url?: string | null;
  location?: string | null;
}

export interface UserMovieListItem {
  id: string;
  user_id: string;
  tmdb_id: number;
  added_at: string;
}
