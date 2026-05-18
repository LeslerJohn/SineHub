import "dotenv/config";
import { supabase } from "./lib/supabase.js";

async function clearLogs() {
  console.log("Clearing scraper_logs table...");
  const { error } = await supabase.from("scraper_logs").delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (error) {
    console.error("Error clearing logs:", error);
  } else {
    console.log("Successfully wiped scraper_logs!");
  }
}

async function dedupCinemas() {
  console.log("Deduplicating cinemas...");
  
  const { data: cinemas, error: fetchError } = await supabase.from("cinemas").select("*");
  if (fetchError) {
    console.error("Error fetching cinemas:", fetchError);
    return;
  }
  
  if (!cinemas) return;
  
  // Group by name
  const grouped = cinemas.reduce((acc, curr) => {
    if (!acc[curr.name]) acc[curr.name] = [];
    acc[curr.name].push(curr);
    return acc;
  }, {} as Record<string, any[]>);
  
  let deletedCount = 0;
  for (const name in grouped) {
    const list = grouped[name];
    if (list.length > 1) {
      // Keep the first one, delete the rest
      const toDelete = list.slice(1).map((c: any) => c.id);
      const { error: deleteError } = await supabase.from("cinemas").delete().in("id", toDelete);
      if (deleteError) {
         console.error(`Error deleting duplicates for ${name}:`, deleteError);
      } else {
         deletedCount += toDelete.length;
         console.log(`Deleted ${toDelete.length} duplicates for ${name}`);
      }
    }
  }
  console.log(`Deduplication complete. Deleted ${deletedCount} duplicate cinemas.`);
}

async function run() {
  await clearLogs();
  await dedupCinemas();
}

run();
