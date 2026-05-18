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
