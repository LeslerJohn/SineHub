import "dotenv/config";
import cron from "node-cron";
import { createLogger } from "./lib/logger.js";
import { run } from "./orchestrator.js";

const log = createLogger("Cron");

log.info("Scraper cron daemon starting...");
log.info("Scheduled: daily at 06:00 AM PHT (Asia/Manila)");

cron.schedule(
  "0 6 * * *",
  async () => {
    log.info("Cron triggered — starting scraper run");

    try {
      await run();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      log.error(`Cron run failed: ${errorMsg}`);
    }
  },
  {
    timezone: "Asia/Manila",
  }
);

log.info("Cron daemon is running. Press Ctrl+C to stop.");
