/**
 * Reads DM and SJT Excel files and seeds Supabase directly.
 * Usage: node scripts/seed-dm-sjt-xlsx.js
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const XLSX = require("xlsx");

const envPath = path.join(__dirname, "../.env.local");
const env = fs.readFileSync(envPath, "utf8");
const getEnv = (k) => { const m = env.match(new RegExp(`^${k}=(.+)$`, "m")); return m ? m[1].trim() : null; };

const SUPABASE_URL = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const SERVICE_KEY  = getEnv("SUPABASE_SERVICE_ROLE_KEY");

function supabaseUpsert(table, rows) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(rows);
    const url  = new URL(`/rest/v1/${table}`, SUPABASE_URL);
    const opts = {
      hostname: url.hostname, path: url.pathname, method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: "resolution=merge-duplicates",
      },
    };
    const req = https.request(opts, (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => res.statusCode < 300 ? resolve() : reject(new Error(`${table}: ${res.statusCode} ${d.slice(0,300)}`)));
    });
    req.on("error", reject); req.write(body); req.end();
  });
}

async function batch(table, rows, size = 50) {
  for (let i = 0; i < rows.length; i += size) {
    await supabaseUpsert(table, rows.slice(i, i + size));
    process.stdout.write(`\r  ${table}: ${Math.min(i + size, rows.length)}/${rows.length}`);
  }
  console.log(" ✓");
}

function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const url  = new URL("/rest/v1/rpc/exec_sql", SUPABASE_URL);
    const opts = {
      hostname: url.hostname, path: url.pathname, method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`,
      },
    };
    const req = https.request(opts, (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => resolve(d));
    });
    req.on("error", reject); req.write(body); req.end();
  });
}

// ── SJT ─────────────────────────────────────────────────────────────────────

function parseSJT() {
  const wb = XLSX.readFile("/Users/sawda/Downloads/UCAT_SJT_Complete_Question_Bank_Expanded.xlsx");
  const rows = [];

  // Appropriateness + Importance sheets
  for (const sheetName of ["Appropriateness", "Importance"]) {
    const ws   = wb.Sheets[sheetName];
    const raw  = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    const fmt  = sheetName === "Appropriateness" ? "appropriateness" : "importance";
    // header row is row index 3
    for (let i = 4; i < raw.length; i++) {
      const r = raw[i];
      if (!r[0]) continue; // skip blank rows
      rows.push({
        id:                 String(r[0]).trim(),
        format:             fmt,
        scenario_num:       Number(r[1]) || null,
        scenario_title:     String(r[2] || "").trim(),
        scenario:           String(r[3] || "").trim(),
        professional_theme: String(r[4] || "").trim(),
        theme_focus:        String(r[5] || "").trim(),
        difficulty:         String(r[6] || "").trim(),
        question:           String(r[8] || "").trim(),
        option_a:           "",
        option_b:           "",
        option_c:           "",
        correct_answer:     String(r[10] || "").trim().replace(/\.$/, ""),
        walkthrough:        String(r[11] || "").trim(),
      });
    }
  }

  // Most & Least sheet
  const mlWs  = wb.Sheets["Most & Least"];
  const mlRaw = XLSX.utils.sheet_to_json(mlWs, { header: 1, defval: "" });
  // find header row
  let headerIdx = mlRaw.findIndex(r => String(r[0]).toLowerCase().includes("question id") || String(r[0]).toLowerCase().includes("id"));
  if (headerIdx < 0) headerIdx = 3;
  for (let i = headerIdx + 1; i < mlRaw.length; i++) {
    const r = mlRaw[i];
    if (!r[0]) continue;
    // columns: ID, scenario#, title, scenario, theme, theme_focus, difficulty, ?, question, optA, optB, optC, correct_most, correct_least, walkthrough
    const optA = String(r[9]  || "").trim();
    const optB = String(r[10] || "").trim();
    const optC = String(r[11] || "").trim();
    const most = String(r[12] || "").trim();
    const least= String(r[13] || "").trim();
    // correct_answer stored as "most:0|least:2" using 0-based index
    const opts = [optA, optB, optC];
    const mostIdx  = opts.findIndex(o => o.toLowerCase() === most.toLowerCase());
    const leastIdx = opts.findIndex(o => o.toLowerCase() === least.toLowerCase());
    rows.push({
      id:                 String(r[0]).trim(),
      format:             "most-least",
      scenario_num:       Number(r[1]) || null,
      scenario_title:     String(r[2] || "").trim(),
      scenario:           String(r[3] || "").trim(),
      professional_theme: String(r[4] || "").trim(),
      theme_focus:        String(r[5] || "").trim(),
      difficulty:         String(r[6] || "").trim(),
      question:           String(r[8] || "").trim(),
      option_a:           optA,
      option_b:           optB,
      option_c:           optC,
      correct_answer:     `most:${mostIdx >= 0 ? mostIdx : 0}|least:${leastIdx >= 0 ? leastIdx : 2}`,
      walkthrough:        String(r[14] || "").trim(),
    });
  }

  return rows;
}

// ── DM ──────────────────────────────────────────────────────────────────────

function parseDM() {
  const wb   = XLSX.readFile("/Users/sawda/Downloads/PulseMed UCAT DM — 200 Student-Ready Questions.xlsx");
  const ws   = wb.Sheets["Question Bank"];
  const raw  = XLSX.utils.sheet_to_json(ws, { defval: "" });
  return raw.map(r => ({
    id:          String(r["Item ID"] || "").trim(),
    set_id:      String(r["Set ID"]  || "").trim(),
    format:      String(r["Format"]  || "").trim(),   // YN-5 or MCQ
    difficulty:  String(r["Tier"]    || "").trim(),
    family:      String(r["Family"]  || "").trim(),
    subtype:     String(r["Subtype"] || "").trim(),
    stimulus:    String(r["Stimulus / figure brief"] || "").trim(),
    question:    String(r["Question or conclusion"]  || "").trim(),
    option_a:    String(r["Option A"] || "").trim(),
    option_b:    String(r["Option B"] || "").trim(),
    correct_answer: String(r["Answer"] || "").trim(),
    walkthrough: String(r["Student worked explanation"] || "").trim(),
    time_sec:    Number(r["Suggested seconds"]) || 55,
    visual_type: String(r["Visual type"] || "").trim(),
  })).filter(r => r.id);
}

async function createDMTable() {
  // Use Supabase SQL editor via management API isn't available directly,
  // so we'll try inserting and handle errors — or check if table exists first
  const checkUrl = new URL("/rest/v1/dm_questions?select=id&limit=1", SUPABASE_URL);
  return new Promise((resolve) => {
    const opts = {
      hostname: checkUrl.hostname, path: checkUrl.pathname + checkUrl.search, method: "GET",
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    };
    const req = https.request(opts, (res) => {
      res.on("data", () => {});
      res.on("end", () => resolve(res.statusCode !== 404 && res.statusCode < 500));
    });
    req.on("error", () => resolve(false)); req.end();
  });
}

async function main() {
  console.log("Parsing SJT questions...");
  const sjtRows = parseSJT();
  console.log(`  Found ${sjtRows.length} SJT questions`);

  console.log("Parsing DM questions...");
  const dmRows = parseDM();
  console.log(`  Found ${dmRows.length} DM questions`);

  console.log("\nSeeding SJT...");
  await batch("sjt_questions", sjtRows);

  console.log("Checking DM table...");
  const dmExists = await createDMTable();
  if (!dmExists) {
    console.log("  dm_questions table not found — please run the DM migration SQL first (printed below)");
    console.log(`
-- Run this in Supabase SQL Editor first:
CREATE TABLE IF NOT EXISTS dm_questions (
  id           TEXT PRIMARY KEY,
  set_id       TEXT NOT NULL,
  format       TEXT NOT NULL,
  difficulty   TEXT NOT NULL,
  family       TEXT NOT NULL DEFAULT '',
  subtype      TEXT NOT NULL DEFAULT '',
  stimulus     TEXT NOT NULL,
  question     TEXT NOT NULL,
  option_a     TEXT DEFAULT '',
  option_b     TEXT DEFAULT '',
  correct_answer TEXT NOT NULL,
  walkthrough  TEXT DEFAULT '',
  time_sec     INTEGER DEFAULT 55,
  visual_type  TEXT DEFAULT ''
);
ALTER TABLE dm_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read dm_questions" ON dm_questions FOR SELECT USING (true);
    `);
    process.exit(1);
  }

  console.log("Seeding DM...");
  await batch("dm_questions", dmRows);

  console.log("\nDone!");
}

main().catch(e => { console.error(e.message); process.exit(1); });
