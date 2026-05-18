import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import type { ScraperResult, ScrapedShowtime } from "../types/index.js";
import { createLogger } from "../lib/logger.js";
import { supabase } from "../lib/supabase.js";
import { matchMovieTitle } from "../lib/matcher.js";

chromium.use(stealth());

const log = createLogger("Ayala");

// Test branches for now
const TARGET_BRANCHES = [
  "Ayala Center Cebu",
  "Ayala Malls Circuit"
];

async function upsertShowtimes(showtimes: ScrapedShowtime[]): Promise<number> {
  let count = 0;

  const dateSet = new Set(showtimes.map((s) => s.date));
  for (const date of dateSet) {
    const { data: aCinemas } = await supabase
      .from("cinemas")
      .select("id")
      .eq("brand", "Ayala");

    const ids = aCinemas?.map((c) => c.id) || [];
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
      .ilike("name", `%${st.cinemaName}%`)
      .eq("brand", "Ayala")
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

export async function scrapeAyala(): Promise<ScraperResult> {
  log.info("Starting Ayala Malls scraper");
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  let totalUpserted = 0;
  let errors: string[] = [];

  try {
    log.info("Navigating to Ayala All Access homepage...");
    await page.goto("https://www.ayalaallaccess.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(5000);
    
    const filmLocators = await page.locator("a.v-link.v-film-list-film__link").all();
    log.info(`Found ${filmLocators.length} films on homepage`);
    
    const filmLinks: string[] = [];
    for (const locator of filmLocators) {
      const href = await locator.getAttribute("href");
      if (href) filmLinks.push(`https://www.ayalaallaccess.com${href}`);
    }
    
    const uniqueFilmLinks = [...new Set(filmLinks)];
    
    for (const filmUrl of uniqueFilmLinks) {
      log.info(`Scraping film: ${filmUrl}`);
      try {
        await page.goto(filmUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForTimeout(3000);
        
        const titleLocator = page.locator("h1");
        let movieTitle = await titleLocator.first().innerText().catch(() => "Unknown Movie");
        log.info(`  Movie: "${movieTitle}"`);
        
        const viewShowtimesBtn = page.locator("button.v-film-details-banner__action-button");
        if (await viewShowtimesBtn.isVisible()) {
          await viewShowtimesBtn.click({ force: true });
          await page.waitForTimeout(3000);
        } else {
          log.warn(`  "View showtimes" button not found for ${movieTitle}`);
          continue;
        }
        
        const addCinemasBtn = page.getByRole("button", { name: /Add cinemas|Select cinema/i });
        if (await addCinemasBtn.first().isVisible()) {
          log.info("  Opening cinema selection modal...");
          await addCinemasBtn.first().click({ force: true });
          await page.waitForTimeout(2000);
          
          for (const branch of TARGET_BRANCHES) {
             const branchLocator = page.locator(`text="${branch}"`).first();
             if (await branchLocator.isVisible()) {
               await branchLocator.click({ force: true }).catch(() => {});
             }
          }
          
          const doneBtn = page.getByRole("button", { name: /Done|Apply|Save/i });
          if (await doneBtn.first().isVisible()) {
            await doneBtn.first().click({ force: true });
            await page.waitForTimeout(3000);
          }
        }
        
        const dateTabs = await page.locator(".v-tab").all();
        if (dateTabs.length === 0) {
          log.warn(`  No datepicker tabs found for "${movieTitle}"`);
          continue;
        }
        
        const phtNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
        const phtTodayStr = `${phtNow.getFullYear()}-${String(phtNow.getMonth() + 1).padStart(2, "0")}-${String(phtNow.getDate()).padStart(2, "0")}`;
        
        for (const tab of dateTabs) {
          const tabId = await tab.getAttribute("id");
          if (!tabId) continue;
          
          const match = tabId.match(/(\d{4}-\d{2}-\d{2})/);
          if (!match) continue;
          const dateStr = match[1];
          
          if (dateStr < phtTodayStr) continue;
          
          await tab.click({ force: true });
          await page.waitForTimeout(3000);
          
          const showtimeButtons = await page.locator("a.v-showtime-button").all();
          let countForDate = 0;
          const showtimesData: ScrapedShowtime[] = [];
          
          for (const btn of showtimeButtons) {
             const href = await btn.getAttribute("href");
             const bookingUrl = href ? `https://www.ayalaallaccess.com${href}` : null;
             
             const timeLocator = btn.locator("time");
             const timeText = await timeLocator.innerText().catch(() => "");
             
             const fullText = await btn.innerText().catch(() => "");
             const formatText = fullText.replace(timeText, "").replace(/\n/g, " ").trim();
             
             const cinemaName = await btn.evaluate((node) => {
               let current: Element | null = node;
               while (current && current.tagName !== 'SECTION' && current.tagName !== 'DIV') {
                 current = current.parentElement;
               }
               return "Ayala Malls Circuit"; 
             }).catch(() => "Ayala Malls Circuit");
             
             let dbFormat: "2D" | "3D" | "IMAX" | "Directors Club" = "2D";
             const upperFormat = formatText.toUpperCase();
             if (upperFormat.includes("IMAX")) dbFormat = "IMAX";
             else if (upperFormat.includes("3D")) dbFormat = "3D";
             else if (upperFormat.includes("DIRECTOR") || upperFormat.includes("CLUB") || upperFormat.includes("DC")) dbFormat = "Directors Club";

             if (bookingUrl && timeText) {
                showtimesData.push({
                   brand: "Ayala",
                   cinemaName: cinemaName, 
                   movieTitle: movieTitle,
                   date: dateStr,
                   time: timeText,
                   format: dbFormat,
                   ticketUrl: bookingUrl
                });
                countForDate++;
             }
          }
          
          if (showtimesData.length > 0) {
             const upserted = await upsertShowtimes(showtimesData);
             totalUpserted += upserted;
          }
          
          log.info(`  → Date ${dateStr}: ${countForDate} showtimes`);
        }
        
      } catch (err: any) {
        log.error(`Error scraping film ${filmUrl}`, err.message);
        errors.push(`Error scraping film ${filmUrl}: ${err.message}`);
      }
    }
    
  } catch (err: any) {
    log.error("Fatal error in Ayala scraper", err.message);
    errors.push(`Fatal error: ${err.message}`);
  } finally {
    await browser.close();
  }
  
  log.info(`Ayala scraper finished: success, ${totalUpserted} showtimes, ${errors.length} errors`);
  
  return {
    provider: "Ayala",
    status: errors.length > 0 && totalUpserted === 0 ? "failed" : "success",
    count: totalUpserted,
    errors: errors.length > 0 ? errors : [],
  };
}
