export interface ScrapedShowtime {
  movieTitle: string;
  cinemaName: string;
  brand: "SM" | "Robinsons" | "KCC" | "Ayala";
  date: string;
  time: string;
  format: "2D" | "3D" | "IMAX" | "Directors Club";
  ticketUrl?: string;
}

export interface ScraperResult {
  provider: string;
  status: "success" | "partial" | "failed" | "skipped";
  count: number;
  errors: string[];
  durationMs?: number;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

export type CinemaBrand = "SM" | "Robinsons" | "KCC" | "Ayala";
