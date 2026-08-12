/**
 * Parses qr_sjt_data.sql and seeds QR + SJT tables directly via Supabase.
 * Usage: node scripts/seed-qr-sjt.js
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

// Load env
const envPath = path.join(__dirname, "../.env.local");
const env = fs.readFileSync(envPath, "utf8");
const getEnv = (key) => {
  const match = env.match(new RegExp(`^${key}=(.+)$`, "m"));
  return match ? match[1].trim() : null;
};

const SUPABASE_URL = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const SERVICE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

function supabaseUpsert(table, rows) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(rows);
    const url = new URL(`/rest/v1/${table}`, SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: "resolution=merge-duplicates",
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`${table}: HTTP ${res.statusCode} — ${data.slice(0, 200)}`));
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function parseInserts(sql, tableName) {
  const rows = [];
  const tableRegex = new RegExp(
    `INSERT INTO ${tableName} \\(([^)]+)\\) VALUES \\((.+?)\\) ON CONFLICT`,
    "g"
  );
  let match;
  while ((match = tableRegex.exec(sql)) !== null) {
    const cols = match[1].split(",").map((c) => c.trim());
    const rawVals = match[2];
    const vals = parseValues(rawVals);
    if (vals.length !== cols.length) continue;
    const row = {};
    cols.forEach((col, i) => {
      const v = vals[i];
      row[col] = v === "NULL" ? null : v;
    });
    rows.push(row);
  }
  return rows;
}

function parseValues(raw) {
  const vals = [];
  let i = 0;
  while (i < raw.length) {
    if (raw[i] === " " || raw[i] === ",") { i++; continue; }
    if (raw[i] === "'") {
      let str = "";
      i++;
      while (i < raw.length) {
        if (raw[i] === "'" && raw[i + 1] === "'") { str += "'"; i += 2; }
        else if (raw[i] === "'") { i++; break; }
        else { str += raw[i++]; }
      }
      vals.push(str);
    } else {
      let token = "";
      while (i < raw.length && raw[i] !== ",") token += raw[i++];
      const t = token.trim();
      vals.push(t === "NULL" ? null : isNaN(t) ? t : Number(t));
    }
  }
  return vals;
}

async function batchUpsert(table, rows, batchSize = 50) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    await supabaseUpsert(table, batch);
    process.stdout.write(`\r${table}: ${Math.min(i + batchSize, rows.length)}/${rows.length}`);
  }
  console.log(` ✓`);
}

async function main() {
  const sqlPath = path.join(__dirname, "../supabase/qr_sjt_data.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  console.log("Parsing SQL...");

  const qrDatasets = parseInserts(sql, "qr_datasets");
  const qrQuestions = parseInserts(sql, "qr_questions");
  const sjtQuestions = parseInserts(sql, "sjt_questions");

  console.log(`Found: ${qrDatasets.length} QR datasets, ${qrQuestions.length} QR questions, ${sjtQuestions.length} SJT questions`);

  if (qrDatasets.length) await batchUpsert("qr_datasets", qrDatasets);
  if (qrQuestions.length) await batchUpsert("qr_questions", qrQuestions);
  if (sjtQuestions.length) await batchUpsert("sjt_questions", sjtQuestions);

  console.log("Done! All data seeded.");
}

main().catch((err) => { console.error(err.message); process.exit(1); });
