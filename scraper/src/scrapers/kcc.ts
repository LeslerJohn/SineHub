import type { ScraperResult } from "../types/index.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("KCC");

/**
 * KCC Mall de Zamboanga does not have a traditional cinema ticketing website.
 * Schedules are posted on their Facebook page. This scraper will need to:
 *   1. Scrape the KCC Mall Facebook page for schedule image posts, OR
 *   2. Use the Facebook Graph API to fetch page posts, OR
 *   3. Process schedule images via OCR if posted as graphics.
 *
 * Data source: https://www.facebook.com/KCCMallDeZamboanga
 */
export async function scrapeKCC(): Promise<ScraperResult> {
  log.info(
    "KCC Mall scraper not yet implemented (Phase 3.4) — data source is Facebook page"
  );

  return {
    provider: "KCC",
    status: "skipped",
    count: 0,
    errors: [],
  };
}
