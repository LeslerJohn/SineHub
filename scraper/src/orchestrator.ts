import "dotenv/config";
import { scrapeSM } from "./scrapers/sm.js";
import { scrapeRobinsons } from "./scrapers/robinsons.js";
import { scrapeKCC } from "./scrapers/kcc.js";
import { scrapeAyala } from "./scrapers/ayala.js";
import { supabase } from "./lib/supabase.js";
import { createLogger } from "./lib/logger.js";
import type { ScraperResult } from "./types/index.js";

const log = createLogger("Orchestrator");

const SCRAPERS: Record<string, () => Promise<ScraperResult>> = {
  sm: scrapeSM,
  robinsons: scrapeRobinsons,
  kcc: scrapeKCC,
  ayala: scrapeAyala,
};

function parseArgs(): string | null {
  const onlyFlag = process.argv.find((arg) => arg.startsWith("--only="));
  return onlyFlag ? onlyFlag.split("=")[1] : null;
}

async function logResult(result: ScraperResult): Promise<void> {
  const { error } = await supabase.from("scraper_logs").insert({
    provider: result.provider,
    status: result.status === "skipped" ? "success" : result.status,
    showtimes_count: result.count,
    errors: result.errors,
    duration_ms: result.durationMs ?? 0,
  });

  if (error) {
    log.error(`Failed to log result for ${result.provider}: ${error.message}`);
  }
}

export async function run(): Promise<void> {
  const startTime = Date.now();
  const only = parseArgs();

  if (only && !SCRAPERS[only]) {
    log.error(`Unknown scraper: "${only}". Available: ${Object.keys(SCRAPERS).join(", ")}`);
    process.exit(1);
  }

  const scrapersToRun = only
    ? { [only]: SCRAPERS[only] }
    : SCRAPERS;

  const scraperNames = Object.keys(scrapersToRun);
  log.info(`Starting scraper run: [${scraperNames.join(", ")}]`);

  const results: ScraperResult[] = [];

  for (const [name, scraperFn] of Object.entries(scrapersToRun)) {
    log.info(`Running ${name} scraper...`);
    const scraperStart = Date.now();

    try {
      const result = await scraperFn();
      result.durationMs = Date.now() - scraperStart;
      results.push(result);
      await logResult(result);

      log.info(
        `${name}: ${result.status} — ${result.count} showtimes (${result.durationMs}ms)`
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const failResult: ScraperResult = {
        provider: name.toUpperCase(),
        status: "failed",
        count: 0,
        errors: [errorMsg],
        durationMs: Date.now() - scraperStart,
      };
      results.push(failResult);
      await logResult(failResult);

      log.error(`${name} scraper crashed: ${errorMsg}`);
    }
  }

  const totalDuration = Date.now() - startTime;
  const succeeded = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const skipped = results.filter((r) => r.status === "skipped").length;

  log.info(
    `Run complete in ${totalDuration}ms — ${succeeded} succeeded, ${failed} failed, ${skipped} skipped`
  );
}

const isDirectRun = process.argv[1]?.includes("orchestrator");
if (isDirectRun) {
  run().catch((err) => {
    log.error(`Orchestrator fatal error: ${err}`);
    process.exit(1);
  });
}
