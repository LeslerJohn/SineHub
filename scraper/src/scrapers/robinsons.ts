import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import type { Browser } from "playwright";
import { supabase } from "../lib/supabase.js";

chromium.use(stealth());
import { createLogger } from "../lib/logger.js";
import { matchMovieTitle } from "../lib/matcher.js";
import type { ScrapedShowtime, ScraperResult } from "../types/index.js";

const log = createLogger("Robinsons");

const RMW_BASE = "https://robinsonsmovieworld.com";
const SCRAPER_TIMEOUT = parseInt(process.env.SCRAPER_TIMEOUT_MS || "45000", 10);
const HEADLESS = process.env.HEADLESS !== "false";

interface BranchConfig {
  cinemaId: string;
  cinemaName: string;
  branchUrl: string;
}

function parseTime(raw: string): string | null {
  const cleaned = raw.replace(/\s+/g, " ").trim().toUpperCase();
  const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
  if (!match) return null;

  let h = parseInt(match[1], 10);
  const m = match[2];
  const period = match[3];

  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;

  return `${String(h).padStart(2, "0")}:${m}`;
}

function parseFormat(text: string): ScrapedShowtime["format"] {
  const upper = text.toUpperCase();
  if (upper.includes("IMAX")) return "IMAX";
  if (upper.includes("3D")) return "3D";
  if (upper.includes("DIRECTOR")) return "Directors Club";
  return "2D";
}

async function getRobinsonsBranches(): Promise<BranchConfig[]> {
  const { data: cinemas, error } = await supabase
    .from("cinemas")
    .select("id, name, website_url")
    .eq("brand", "Robinsons");

  if (error || !cinemas) {
    log.error(`Failed to fetch Robinsons cinemas: ${error?.message}`);
    return [];
  }

  const seen = new Set<string>();
  const configs: BranchConfig[] = [];

  for (const c of cinemas) {
    if (!c.website_url?.includes("data=")) continue;
    if (seen.has(c.name)) {
      log.debug(`Skipping duplicate: ${c.name}`);
      continue;
    }
    seen.add(c.name);

    configs.push({
      cinemaId: c.id,
      cinemaName: c.name,
      branchUrl: c.website_url,
    });
  }

  return configs;
}

async function scrapeBookingPage(
  page: import("playwright").Page,
  cinemaName: string,
): Promise<ScrapedShowtime[]> {
  const currentUrl = page.url();
  if (!currentUrl.includes("bookmovie")) {
    log.warn(`Not on a booking page: ${currentUrl}`);
    return [];
  }

  const movieTitle = await page.evaluate(() => {
    const all = document.querySelectorAll(
      "h1, h2, h3, h4, h5, h6, [class*='title'], .card-header, .panel-title, .panel-heading, strong, b"
    );

    const skip = [
      "ROBINSONS", "CINEMA", "NOW SHOWING", "ADVANCE", "BACK TO",
      "MOVIEWORLD", "PAGADIAN", "MOVIE WORLD", "CONTACT", "ADDRESS",
      "MTRCB", "GENRE", "DIRECTOR", "CAST", "AVAILABLE", "SEE TRAILER",
      "WATCH IN", "SCHEDULE",
    ];

    for (const el of all) {
      const text = el.textContent?.trim();
      if (!text || text.length < 2 || text.length > 80) continue;
      const upper = text.toUpperCase();
      if (skip.some((s) => upper.includes(s))) continue;
      if (/^\d/.test(text)) continue;
      if (upper === "PG" || upper === "G" || upper === "R-13" || upper === "R-16" || upper === "R-18") continue;

      const style = window.getComputedStyle(el);
      const bg = style.backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
        return text;
      }
    }

    for (const el of all) {
      const text = el.textContent?.trim();
      if (!text || text.length < 2 || text.length > 80) continue;
      const upper = text.toUpperCase();
      if (skip.some((s) => upper.includes(s))) continue;
      if (/^\d/.test(text)) continue;
      if (upper === "PG" || upper === "G" || upper === "R-13" || upper === "R-16" || upper === "R-18") continue;
      return text;
    }

    return null;
  });

  if (!movieTitle) {
    log.warn(`No title found on booking page: ${page.url()}`);
    return [];
  }

  log.info(`  Movie: "${movieTitle}"`);
  const bookingUrl = page.url();
  const showtimes: ScrapedShowtime[] = [];

  const dateSelect = await page.$("#datepicker");
  if (!dateSelect) {
    log.warn(`  No datepicker for "${movieTitle}"`);
    return [];
  }

  const currentDateVal = await dateSelect.inputValue().catch(() => "");

  await dateSelect.click().catch(() => {});
  await page.waitForTimeout(500);

  const pikaDates = await page.evaluate(() => {
    const btns = document.querySelectorAll("td:not(.is-disabled) .pika-button");
    const dates: string[] = [];
    for (const btn of btns) {
      const y = btn.getAttribute("data-pika-year");
      const m = btn.getAttribute("data-pika-month");
      const d = btn.getAttribute("data-pika-day");
      if (y && m !== null && d) {
        const mm = String(parseInt(m) + 1).padStart(2, "0");
        const dd = String(parseInt(d)).padStart(2, "0");
        dates.push(`${y}-${mm}-${dd}`);
      }
    }
    return dates;
  });

  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(300);

  let datesToScrape: string[];
  if (pikaDates.length > 0) {
    const now = new Date();
    // Offset by +8 hours for PHT roughly
    const phtDate = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const todayStr = phtDate.toISOString().split("T")[0];
    datesToScrape = pikaDates.filter(d => d >= todayStr).slice(0, 7);
  } else if (currentDateVal) {
    datesToScrape = [currentDateVal];
  } else {
    const now = new Date();
    const phtDate = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    datesToScrape = [phtDate.toISOString().split("T")[0]];
  }

  log.info(`  ${datesToScrape.length} dates: ${datesToScrape.join(", ")}`);

  for (const dateStr of datesToScrape) {
    try {
      await dateSelect.click().catch(() => {});
      await page.waitForTimeout(500);

      const dayNum = parseInt(dateStr.split("-")[2]);
      const monthNum = parseInt(dateStr.split("-")[1]) - 1;

      const selector = `td:not(.is-disabled) .pika-button[data-pika-day="${dayNum}"][data-pika-month="${monthNum}"]`;
      const btnLocator = page.locator(selector);
      
      if (await btnLocator.count() > 0) {
        await btnLocator.first().click({ force: true });
      } else {
        log.debug(`  Could not click date ${dateStr}, skipping`);
        continue;
      }

      await page.waitForTimeout(1500);

      const formats = await page.evaluate(() => {
        const sel = document.querySelector(
          "#select-type-bm"
        ) as HTMLSelectElement | null;
        if (!sel) return [];
        return Array.from(sel.options)
          .filter((o) => o.value && o.value !== "")
          .map((o) => ({
            value: o.value,
            text: o.textContent?.trim() || "",
          }));
      });

      if (formats.length === 0) {
        log.debug(`  No formats available for ${dateStr}`);
        continue;
      }

      for (const fmt of formats) {
        await page.selectOption("#select-type-bm", fmt.value);
        await page.waitForTimeout(1500);

        const times = await page.evaluate(() => {
          const sel = document.querySelector(
            "#select-schedule-bm"
          ) as HTMLSelectElement | null;
          if (!sel) return [];
          return Array.from(sel.options)
            .filter((o) => o.value && o.textContent?.trim())
            .map((o) => o.textContent?.trim() || "");
        });

        for (const timeText of times) {
          if (/SELECT|CINEMA|SCHEDULE/i.test(timeText)) continue;

          const time24 = parseTime(timeText);
          if (!time24) continue;

          showtimes.push({
            movieTitle,
            cinemaName,
            brand: "Robinsons",
            date: dateStr,
            time: time24,
            format: parseFormat(fmt.text),
            ticketUrl: bookingUrl,
          });
        }
      }
    } catch (dateErr) {
      const msg =
        dateErr instanceof Error ? dateErr.message : String(dateErr);
      log.warn(`  Date ${dateStr} error: ${msg}`);
    }
  }

  return showtimes;
}

async function scrapeBranch(
  browser: Browser,
  branch: BranchConfig
): Promise<ScrapedShowtime[]> {
  const allShowtimes: ScrapedShowtime[] = [];

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  try {
    log.info(`Navigating to branch: ${branch.cinemaName}`);

    await page.goto(RMW_BASE, { waitUntil: "load", timeout: SCRAPER_TIMEOUT });
    await page.waitForTimeout(2000);

    await page.goto(branch.branchUrl, {
      waitUntil: "load",
      timeout: SCRAPER_TIMEOUT,
      referer: RMW_BASE,
    });
    await page.waitForTimeout(5000);

    const pageHtml = await page.evaluate(() => document.documentElement?.outerHTML?.substring(0, 3000) || "");
    log.debug(`Full HTML preview: ${pageHtml.replace(/\n/g, " ").substring(0, 500)}`);

    const hasContent = await page.evaluate(() => {
      const text = document.body?.innerText || "";
      return text.includes("NOW SHOWING") || text.includes("CLICK POSTER");
    });

    if (!hasContent) {
      log.info(`Branch page didn't load content, trying alternate selector...`);
      const hamburger = await page.$(".navbar-toggle, .menu-toggle, button.navbar-toggler, .hamburger, #menu-toggle");
      if (hamburger) {
        await hamburger.click();
        await page.waitForTimeout(1000);
      }

      const pagadianLink = await page.$("a:text-is('PAGADIAN')");
      if (pagadianLink) {
        await pagadianLink.click({ force: true });
        await page.waitForTimeout(5000);
      }
    }

    await page.waitForTimeout(5000);

    const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 500) || "");
    log.debug(`Branch page text: ${bodyText.replace(/\n/g, " | ").substring(0, 300)}`);

    const allAnchors = await page.evaluate(() => {
      const results: string[] = [];
      const anchors = document.querySelectorAll("a");
      for (const a of anchors) {
        const href = a.getAttribute("href") || "";
        if (href.includes("bookmovie")) results.push(href);
      }
      return results;
    });

    log.info(`Found ${allAnchors.length} booking links on branch page`);

    const posterUrls: string[] = allAnchors.map((h) =>
      h.startsWith("http") ? h : `${RMW_BASE}${h}`
    ).filter((url, i, arr) => arr.indexOf(url) === i);

    log.info(`Found ${posterUrls.length} unique movie booking URLs`);

    if (posterUrls.length === 0) {
      log.info(`Falling back to poster click approach...`);

      const clickablePosterCount = await page.evaluate(() => {
        return document.querySelectorAll(".poster-branch-img").length;
      });

      for (let i = 0; i < Math.min(clickablePosterCount, 10); i++) {
        try {
          if (i > 0) {
            await page.goto(branch.branchUrl, {
              waitUntil: "domcontentloaded",
              timeout: SCRAPER_TIMEOUT,
            });
            await page.waitForTimeout(3000);
          }

          const posterImgs = await page.$$(".poster-branch-img");
          const clickTarget = posterImgs[i];

          if (!clickTarget) break;

          log.info(`  Clicking poster ${i + 1}...`);
          await Promise.all([
            page.waitForURL("**/bookmovie**", { timeout: 10000 }).catch(() => null),
            clickTarget.click(),
          ]);
          await page.waitForTimeout(2000);

          const showtimes = await scrapeBookingPage(page, branch.cinemaName);
          allShowtimes.push(...showtimes);
          log.info(`  → ${showtimes.length} showtimes`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          log.warn(`  Poster ${i + 1} error: ${msg}`);
        }
      }
    } else {
      for (const url of posterUrls) {
        try {
          log.info(`  Opening: ${url.substring(0, 80)}...`);
          await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: SCRAPER_TIMEOUT,
          });
          await page.waitForTimeout(2000);

          const showtimes = await scrapeBookingPage(page, branch.cinemaName);
          allShowtimes.push(...showtimes);
          log.info(`  → ${showtimes.length} showtimes`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          log.warn(`  Movie page error: ${msg}`);
        }
      }
    }
  } finally {
    await context.close();
  }

  return allShowtimes;
}

async function upsertShowtimes(
  showtimes: ScrapedShowtime[]
): Promise<number> {
  let count = 0;

  const dateSet = new Set(showtimes.map((s) => s.date));
  for (const date of dateSet) {
    const { data: rCinemas } = await supabase
      .from("cinemas")
      .select("id")
      .eq("brand", "Robinsons");

    const ids = rCinemas?.map((c) => c.id) || [];
    if (ids.length > 0) {
      await supabase
        .from("showtimes")
        .delete()
        .eq("date", date)
        .in("cinema_id", ids);
    }
  }

  for (const st of showtimes) {
    const match = await matchMovieTitle(st.movieTitle);
    if (!match) {
      log.warn(`No DB match for "${st.movieTitle}" — skipping`);
      continue;
    }

    const { data: cinemas } = await supabase
      .from("cinemas")
      .select("id")
      .eq("name", st.cinemaName)
      .eq("brand", "Robinsons")
      .limit(1);

    const cinemaId = cinemas?.[0]?.id;
    if (!cinemaId) {
      log.warn(`No cinema found for "${st.cinemaName}" — skipping`);
      continue;
    }

    const { error } = await supabase.from("showtimes").upsert(
      {
        movie_id: match.movieId,
        cinema_id: cinemaId,
        date: st.date,
        time: st.time,
        format: st.format,
        ticket_url: st.ticketUrl,
        scraped_at: new Date().toISOString(),
      },
      { onConflict: "movie_id,cinema_id,date,time,format" }
    );

    if (error) {
      log.error(`Upsert failed: ${error.message}`);
    } else {
      count++;
    }
  }

  return count;
}

export async function scrapeRobinsons(): Promise<ScraperResult> {
  const errors: string[] = [];
  let totalCount = 0;

  log.info("Starting Robinsons Movieworld scraper");

  const branches = await getRobinsonsBranches();
  if (branches.length === 0) {
    log.warn("No Robinsons cinemas with valid branch URLs in database");
    return {
      provider: "Robinsons",
      status: "skipped",
      count: 0,
      errors: ["No Robinsons cinemas configured with branch URLs"],
    };
  }

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: HEADLESS,
      args: ["--disable-blink-features=AutomationControlled", "--no-sandbox"],
    });

    for (const branch of branches) {
      try {
        log.info(`Scraping: ${branch.cinemaName}`);
        const showtimes = await scrapeBranch(browser, branch);
        log.info(
          `Scraped ${showtimes.length} showtimes from ${branch.cinemaName}`
        );

        if (showtimes.length > 0) {
          const upserted = await upsertShowtimes(showtimes);
          totalCount += upserted;
          log.info(`Upserted ${upserted} for ${branch.cinemaName}`);
        } else {
          log.warn(`No showtimes found for ${branch.cinemaName}`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${branch.cinemaName}: ${msg}`);
        log.error(`Failed: ${branch.cinemaName}: ${msg}`);
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Browser launch failed: ${msg}`);
    log.error(`Browser launch failed: ${msg}`);
  } finally {
    if (browser) await browser.close();
  }

  const status: ScraperResult["status"] =
    errors.length === 0
      ? "success"
      : totalCount > 0
        ? "partial"
        : "failed";

  log.info(
    `Robinsons scraper finished: ${status}, ${totalCount} showtimes, ${errors.length} errors`
  );

  return { provider: "Robinsons", status, count: totalCount, errors };
}
