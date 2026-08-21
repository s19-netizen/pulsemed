import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envRaw = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const getEnv = k => { const m = envRaw.match(new RegExp(`^${k}=(.+)$`, "m")); return m ? m[1].trim() : ""; };

const supabase = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"));

async function deleteAll(table, filter) {
  const { count: before } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (!before) {
    console.log(`${table}: already empty`);
    return;
  }

  let query = supabase.from(table).delete({ count: "exact" });
  if (filter) {
    query = query.eq(filter.col, filter.val);
  } else {
    query = query.not("id", "is", null);
  }

  const { error, count } = await query;
  if (error) console.error(`${table} error:`, error.message);
  else console.log(`${table}: deleted ${count} rows`);
}

async function deleteSection(section) {
  const { count: before } = await supabase
    .from("admin_qs")
    .select("*", { count: "exact", head: true })
    .eq("section", section);

  if (!before) {
    console.log(`admin_qs [${section}]: already empty`);
    return;
  }

  const { error, count } = await supabase
    .from("admin_qs")
    .delete({ count: "exact" })
    .eq("section", section);

  if (error) console.error(`admin_qs [${section}] error:`, error.message);
  else console.log(`admin_qs [${section}]: deleted ${count} rows`);
}

console.log("=== Deleting all practice questions ===\n");

await deleteAll("dm_questions");
await deleteAll("vr_questions");
await deleteAll("vr_passages");
await deleteAll("qr_questions");
await deleteAll("qr_datasets");
await deleteAll("sjt_questions");

await deleteSection("dm");
await deleteSection("vr");
await deleteSection("qr");
await deleteSection("sjt");

// Also clean up orphaned admin_passages
await deleteAll("admin_passages");

console.log("\nDone.");
