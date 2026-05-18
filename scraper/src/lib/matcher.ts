import { supabase } from "./supabase.js";
import { createLogger } from "./logger.js";

const log = createLogger("Matcher");

function normalize(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

export interface MatchResult {
  movieId: string;
  title: string;
  confidence: number;
}

const MATCH_THRESHOLD = 0.75;

export async function matchMovieTitle(
  scrapedTitle: string
): Promise<MatchResult | null> {
  const normalizedScraped = normalize(scrapedTitle);

  const { data: movies, error } = await supabase
    .from("movies")
    .select("id, title");

  if (error) {
    log.error(`Failed to fetch movies for matching: ${error.message}`);
    return null;
  }

  if (!movies || movies.length === 0) {
    log.warn("No movies in database to match against");
    return null;
  }

  let bestMatch: MatchResult | null = null;
  let bestScore = 0;

  for (const movie of movies) {
    const normalizedDb = normalize(movie.title);
    const score = similarity(normalizedScraped, normalizedDb);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = {
        movieId: movie.id,
        title: movie.title,
        confidence: score,
      };
    }
  }

  if (bestMatch && bestMatch.confidence >= MATCH_THRESHOLD) {
    log.debug(
      `Matched "${scrapedTitle}" → "${bestMatch.title}" (${(bestMatch.confidence * 100).toFixed(1)}%)`
    );
    return bestMatch;
  }

  log.warn(
    `No match for "${scrapedTitle}" above threshold (best: ${bestScore.toFixed(2)})`
  );
  return null;
}
