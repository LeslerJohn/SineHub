import { chromium, type Browser, type Page } from "playwright";
import { supabase } from "../lib/supabase.js";
import { createLogger } from "../lib/logger.js";
import { matchMovieTitle } from "../lib/matcher.js";
import type { ScrapedShowtime, ScraperResult } from "../types/index.js";

const log = createLogger("SM");

const SM_BASE_URL = "https://www.smcinema.com";
const SCRAPER_TIMEOUT = parseInt(process.env.SCRAPER_TIMEOUT_MS || "45000", 10);
const HEADLESS = process.env.HEADLESS !== "false";

interface SMCinemaConfig {
  slug: string;
  siteId: string;
  cinemaId: string;
  cinemaName: string;
}

async function getSMCinemas(): Promise<SMCinemaConfig[]> {
  const { data: cinemas, error } = await supabase
    .from("cinemas")
    .select("id, name, website_url")
    .eq("brand", "SM");

  if (error || !cinemas) {
    log.error(`Failed to fetch SM cinemas: ${error?.message}`);
    return [];
  }

  const seen = new Set<string>();
  const configs: SMCinemaConfig[] = [];

  for (const cinema of cinemas) {
    const url = new URL(cinema.website_url || SM_BASE_URL);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const slug = pathParts[1] || "SM-City-Mindpro";
    const siteId = pathParts[2] || "2111";
    const key = `${slug}/${siteId}`;

    if (seen.has(key)) {
      log.debug(`Skipping duplicate cinema config: ${key}`);
      continue;
    }
    seen.add(key);

    configs.push({
      slug,
      siteId,
      cinemaId: cinema.id,
      cinemaName: cinema.name,
    });
  }

  return configs;
}

function parseTime(rawText: string): string | null {
  const cleaned = rawText.replace(/\s+/g, " ").trim().toUpperCase();

  const match12 = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = match12[2];
    const period = match12[3];

    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:${m}`;
  }

  const match24 = cleaned.match(/(\d{1,2}):(\d{2})/);
  if (match24) {
    return `${match24[1].padStart(2, "0")}:${match24[2]}`;
  }

  return null;
}

function parseFormat(formatText: string): ScrapedShowtime["format"] {
  const normalized = formatText.toUpperCase().trim();
  if (normalized.includes("IMAX")) return "IMAX";
  if (normalized.includes("3D")) return "3D";
  if (normalized.includes("DIRECTOR")) return "Directors Club";
  return "2D";
}

async function scrapePageShowtimes(
  page: Page,
  dateStr: string,
  cinemaName: string
): Promise<ScrapedShowtime[]> {
  const showtimes: ScrapedShowtime[] = [];

  const data = await page.evaluate(() => {
    const results: Array<{
      title: string;
      format: string;
      times: Array<{ text: string; href: string }>;
    }> = [];

    const sections = document.querySelectorAll(
      "[class*='showtime-picker-film'], [class*='film-card'], [class*='movie-card'], article"
    );

    for (const section of sections) {
      const titleEl =
        section.querySelector("h3") ||
        section.querySelector("h2") ||
        section.querySelector("[class*='title'] a") ||
        section.querySelector("[class*='film-name']");

      const title = titleEl?.textContent?.trim();
      if (!title) continue;

      let format = "2D";
      const formatImgs = section.querySelectorAll(
        "[class*='attribute'] img, [class*='format'] img"
      );
      for (const img of formatImgs) {
        const alt = img.getAttribute("alt");
        if (alt) {
          format = alt;
          break;
        }
      }

      const formatTexts = section.querySelectorAll(
        "[class*='attribute'], [class*='format']"
      );
      for (const ft of formatTexts) {
        const text = ft.textContent?.trim();
        if (text && /^(2D|3D|IMAX|Director)/i.test(text)) {
          format = text;
          break;
        }
      }

      const timeButtons = section.querySelectorAll(
        "a[class*='showtime-button'], button[class*='showtime-button'], [class*='session-time'], a[href*='booking'], a[href*='ticket']"
      );

      const times: Array<{ text: string; href: string }> = [];
      for (const btn of timeButtons) {
        const text = btn.textContent?.trim() || "";
        const href = btn.getAttribute("href") || "";
        if (text) times.push({ text, href });
      }

      if (times.length === 0) {
        const allLinks = section.querySelectorAll("a");
        for (const link of allLinks) {
          const text = link.textContent?.trim() || "";
          if (/\d{1,2}:\d{2}\s*(AM|PM)?/i.test(text)) {
            times.push({
              text,
              href: link.getAttribute("href") || "",
            });
          }
        }
      }

      results.push({ title, format, times });
    }

    return results;
  });

  for (const movie of data) {
    const format = parseFormat(movie.format);

    for (const slot of movie.times) {
      const time24 = parseTime(slot.text);
      if (!time24) continue;

      showtimes.push({
        movieTitle: movie.title,
        cinemaName,
        brand: "SM",
        date: dateStr,
        time: time24,
        format,
        ticketUrl: slot.href
          ? slot.href.startsWith("http")
            ? slot.href
            : `${SM_BASE_URL}${slot.href}`
          : undefined,
      });
    }
  }

  return showtimes;
}

async function scrapeCinema(
  browser: Browser,
  config: SMCinemaConfig
): Promise<ScrapedShowtime[]> {
  const allShowtimes: ScrapedShowtime[] = [];
  const url = `${SM_BASE_URL}/sites/${config.slug}/${config.siteId}`;
  log.info(`Navigating to ${url}`);

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
    locale: "en-PH",
    timezoneId: "Asia/Manila",
  });

  const page = await context.newPage();

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: SCRAPER_TIMEOUT,
    });

    log.info("Page loaded, waiting for content to render...");

    const contentSelectors = [
      "h3",
      "[class*='showtime']",
      "[class*='film']",
      "[class*='movie']",
    ];

    let contentFound = false;
    for (const selector of contentSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 20000 });
        log.info(`Content detected via selector: ${selector}`);
        contentFound = true;
        break;
      } catch {
        continue;
      }
    }

    if (!contentFound) {
      log.warn("No content selectors matched, waiting 10s for JS hydration...");
      await page.waitForTimeout(10000);
    } else {
      await page.waitForTimeout(3000);
    }

    const pageTitle = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    log.debug(`Page title: "${pageTitle}"`);
    log.debug(`Body preview: ${bodyText.substring(0, 200)}`);

    const dateStrings = await page.evaluate(() => {
      const tabs = document.querySelectorAll("[role='tab']");
      const dates: string[] = [];
      for (const tab of tabs) {
        const id = tab.getAttribute("id") || "";
        const match = id.match(/-tab-(\d{4}-\d{2}-\d{2})$/);
        if (match) dates.push(match[1]);
      }
      return dates;
    });

    log.info(`Found ${dateStrings.length} date tabs: ${dateStrings.slice(0, 5).join(", ")}...`);

    if (dateStrings.length === 0) {
      const today = new Date().toISOString().split("T")[0];
      log.warn(`No date tabs found, scraping current view as ${today}`);
      const showtimes = await scrapePageShowtimes(page, today, config.cinemaName);
      allShowtimes.push(...showtimes);
      log.info(`  → ${showtimes.length} showtimes from current view`);
    } else {
      const maxDays = Math.min(dateStrings.length, 7);
      log.info(`Will scrape ${maxDays} of ${dateStrings.length} available dates`);

      for (let di = 0; di < maxDays; di++) {
        const dateStr = dateStrings[di];
        log.info(`Scraping date: ${dateStr}`);

        try {
          await page.evaluate((d) => {
            const tab = document.querySelector(`[id$="-tab-${d}"]`);
            if (tab) {
              tab.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
              tab.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
              tab.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            }
          }, dateStr);

          await page.waitForTimeout(2500);

          const showtimes = await scrapePageShowtimes(page, dateStr, config.cinemaName);
          allShowtimes.push(...showtimes);
          log.info(`  → ${showtimes.length} showtimes for ${dateStr}`);
        } catch (tabErr) {
          const msg = tabErr instanceof Error ? tabErr.message : String(tabErr);
          log.warn(`Failed to scrape date ${dateStr}: ${msg}`);
        }
      }
    }
  } finally {
    await context.close();
  }

  return allShowtimes;
}

async function upsertShowtimes(showtimes: ScrapedShowtime[]): Promise<number> {
  let upsertedCount = 0;

  const dateSet = new Set(showtimes.map((s) => s.date));
  for (const date of dateSet) {
    const { data: smCinemas } = await supabase
      .from("cinemas")
      .select("id")
      .eq("brand", "SM");

    const smIds = smCinemas?.map((c) => c.id) || [];

    if (smIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("showtimes")
        .delete()
        .eq("date", date)
        .in("cinema_id", smIds);

      if (deleteError) {
        log.error(`Failed to clear old showtimes for ${date}: ${deleteError.message}`);
      }
    }
  }

  for (const showtime of showtimes) {
    const match = await matchMovieTitle(showtime.movieTitle);
    if (!match) {
      log.warn(`No DB match for "${showtime.movieTitle}" — skipping`);
      continue;
    }

    const { data: cinemas } = await supabase
      .from("cinemas")
      .select("id")
      .eq("name", showtime.cinemaName)
      .eq("brand", "SM")
      .limit(1);

    const cinemaId = cinemas?.[0]?.id;
    if (!cinemaId) {
      log.warn(`No cinema found for "${showtime.cinemaName}" — skipping`);
      continue;
    }

    const { error } = await supabase.from("showtimes").upsert(
      {
        movie_id: match.movieId,
        cinema_id: cinemaId,
        date: showtime.date,
        time: showtime.time,
        format: showtime.format,
        ticket_url: showtime.ticketUrl,
        scraped_at: new Date().toISOString(),
      },
      {
        onConflict: "movie_id,cinema_id,date,time,format",
      }
    );

    if (error) {
      log.error(`Upsert failed: ${error.message}`);
    } else {
      upsertedCount++;
    }
  }

  return upsertedCount;
}

export async function scrapeSM(): Promise<ScraperResult> {
  const errors: string[] = [];
  let totalCount = 0;

  log.info("Starting SM Cinema scraper");

  const cinemaConfigs = await getSMCinemas();
  if (cinemaConfigs.length === 0) {
    log.warn("No SM cinemas found in database — using default Mindpro");
    cinemaConfigs.push({
      slug: "SM-City-Mindpro",
      siteId: "2111",
      cinemaId: "",
      cinemaName: "SM City Mindpro",
    });
  }

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: HEADLESS,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--no-sandbox",
      ],
    });

    for (const config of cinemaConfigs) {
      try {
        log.info(`Scraping cinema: ${config.cinemaName}`);
        const showtimes = await scrapeCinema(browser, config);
        log.info(`Scraped ${showtimes.length} raw showtimes from ${config.cinemaName}`);

        if (showtimes.length > 0) {
          const upserted = await upsertShowtimes(showtimes);
          totalCount += upserted;
          log.info(`Upserted ${upserted} showtimes for ${config.cinemaName}`);
        } else {
          log.warn(`No showtimes found for ${config.cinemaName}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${config.cinemaName}: ${msg}`);
        log.error(`Failed scraping ${config.cinemaName}: ${msg}`);
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Browser launch failed: ${msg}`);
    log.error(`Browser launch failed: ${msg}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  const status: ScraperResult["status"] =
    errors.length === 0
      ? totalCount > 0
        ? "success"
        : "success"
      : totalCount > 0
        ? "partial"
        : "failed";

  log.info(`SM scraper finished: ${status}, ${totalCount} showtimes, ${errors.length} errors`);

  return {
    provider: "SM",
    status,
    count: totalCount,
    errors,
  };
}
