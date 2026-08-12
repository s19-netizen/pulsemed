/**
 * import-vr-excel.js
 *
 * Reads a VR question Excel file from ~/Downloads and converts it to
 * lib/vr-passages.json + lib/vr-questions.json, then triggers the seed API.
 *
 * Usage:
 *   node scripts/import-vr-excel.js [filename.xlsx]
 *
 * If no filename is given it picks the most recently modified .xlsx in ~/Downloads.
 *
 * Expected Excel columns (case-insensitive, flexible matching):
 *   Passage Code / Passage ID    → passage_code
 *   Passage Title / Title        → title
 *   Passage Text / Passage       → passage text
 *   Question ID / ID             → question id (auto-generated if missing)
 *   Format / Type                → TFCT or MCQ
 *   Difficulty                   → Bronze / Silver / Gold / Platinum (Diamond → Platinum)
 *   Subtype / Primary Subtype    → primary_subtype
 *   Skill Focus                  → skill_focus
 *   Question                     → question text
 *   Option A / A                 → option_a
 *   Option B / B                 → option_b
 *   Option C / C                 → option_c
 *   Option D / D                 → option_d (MCQ only)
 *   Correct Answer / Correct     → correct_answer (A / B / C / D)
 *   Highlight / Supporting Evidence / Evidence  → supporting_evidence
 *   Explanation / Why            → explanation (ideally per-option: "A is correct because…")
 */

const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// ─── Config ──────────────────────────────────────────────────────────────────

const PROJECT_ROOT = path.join(__dirname, "..");
const PASSAGES_OUT = path.join(PROJECT_ROOT, "lib", "vr-passages.json");
const QUESTIONS_OUT = path.join(PROJECT_ROOT, "lib", "vr-questions.json");
const DOWNLOADS_DIR = path.join(process.env.HOME || "~", "Downloads");
const SEED_URL = "http://localhost:3000/api/admin/seed-vr";
const SEED_SECRET = process.env.SEED_SECRET || "";

// ─── Find file ────────────────────────────────────────────────────────────────

function findLatestExcel(dir) {
  const files = fs.readdirSync(dir)
    .filter(f => /\.(xlsx|xls)$/i.test(f))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(dir, f)).mtime }))
    .sort((a, b) => b.mtime - a.mtime);
  return files[0] ? path.join(dir, files[0].name) : null;
}

const filePath = process.argv[2]
  ? (path.isAbsolute(process.argv[2]) ? process.argv[2] : path.join(DOWNLOADS_DIR, process.argv[2]))
  : findLatestExcel(DOWNLOADS_DIR);

if (!filePath || !fs.existsSync(filePath)) {
  console.error("No .xlsx file found in ~/Downloads. Pass a filename as the first argument.");
  process.exit(1);
}

console.log(`Reading: ${filePath}`);

// ─── Column name normaliser ──────────────────────────────────────────────────

function col(row, ...aliases) {
  for (const alias of aliases) {
    const lower = alias.toLowerCase();
    const key = Object.keys(row).find(k => k.trim().toLowerCase() === lower);
    if (key && row[key] !== undefined && row[key] !== null && row[key] !== "") {
      return String(row[key]).trim();
    }
  }
  return "";
}

function mapDifficulty(d) {
  const m = { diamond: "Platinum", platinum: "Platinum", gold: "Gold", silver: "Silver", bronze: "Bronze" };
  return m[d.toLowerCase()] || d;
}

// ─── Parse workbook ──────────────────────────────────────────────────────────

const wb = XLSX.readFile(filePath);

// Use first sheet, or a sheet named "Questions" / "VR" if present
const sheetName = wb.SheetNames.find(n => /question|vr|passage/i.test(n)) ?? wb.SheetNames[0];
console.log(`Using sheet: "${sheetName}"`);
const ws = wb.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

console.log(`Rows found: ${rows.length}`);
if (rows.length === 0) {
  console.error("Sheet is empty.");
  process.exit(1);
}

// Print detected column names for debugging
console.log("Columns:", Object.keys(rows[0]).join(" | "));

// ─── Build passages + questions ───────────────────────────────────────────────

const passageMap = new Map(); // code → { code, title, text, word_count }
const questionRows = [];
let autoId = 1;

for (const row of rows) {
  const passageCode = col(row, "passage code", "passage_code", "passage id", "passage_id", "code").toUpperCase() || null;
  const passageTitle = col(row, "passage title", "title", "passage_title");
  const passageText = col(row, "passage text", "passage", "text", "passage_body");

  if (!passageCode) {
    console.warn("  Skipping row with no passage code:", row);
    continue;
  }

  // Register passage
  if (!passageMap.has(passageCode)) {
    passageMap.set(passageCode, {
      code: passageCode,
      title: passageTitle || passageCode,
      text: passageText,
      word_count: passageText ? passageText.split(/\s+/).length : 0,
    });
  } else if (passageText && !passageMap.get(passageCode).text) {
    // Fill in passage text if it appeared on a later row
    passageMap.get(passageCode).text = passageText;
    passageMap.get(passageCode).word_count = passageText.split(/\s+/).length;
  }

  const qText = col(row, "question", "question text", "q");
  if (!qText) continue; // passage-only row (header row for the passage, no question)

  const format = col(row, "format", "type", "question type").toUpperCase().includes("MCQ") ? "MCQ" : "TFCT";
  const difficulty = mapDifficulty(col(row, "difficulty", "level") || "Gold");
  const primarySubtype = col(row, "subtype", "primary subtype", "primary_subtype", "question subtype", "topic");
  const skillFocus = col(row, "skill focus", "skill_focus", "skill");
  const optA = col(row, "option a", "a", "option_a", "opt a");
  const optB = col(row, "option b", "b", "option_b", "opt b");
  const optC = col(row, "option c", "c", "option_c", "opt c") || (format === "TFCT" ? "Can't Tell" : "");
  const optD = col(row, "option d", "d", "option_d", "opt d");
  const correctRaw = col(row, "correct answer", "correct", "correct_answer", "answer");
  const supporting = col(row, "highlight", "supporting evidence", "supporting_evidence", "evidence", "key text", "key passage");
  const explanation = col(row, "explanation", "why", "reasoning", "rationale");

  const qId = col(row, "question id", "id", "question_id", "q id") ||
    `${passageCode}-${format}-${String(autoId++).padStart(3, "0")}`;

  questionRows.push({
    id: qId,
    passage_code: passageCode,
    format,
    difficulty,
    primary_subtype: primarySubtype,
    skill_focus: skillFocus,
    question: qText,
    option_a: optA || (format === "TFCT" ? "True" : ""),
    option_b: optB || (format === "TFCT" ? "False" : ""),
    option_c: optC,
    option_d: optD,
    correct_answer: correctRaw,
    supporting_evidence: supporting,
    explanation,
  });
}

console.log(`Passages: ${passageMap.size} | Questions: ${questionRows.length}`);

// ─── Write JSON files ─────────────────────────────────────────────────────────

const passagesArray = [...passageMap.values()];
fs.writeFileSync(PASSAGES_OUT, JSON.stringify(passagesArray, null, 2));
fs.writeFileSync(QUESTIONS_OUT, JSON.stringify(questionRows, null, 2));

console.log(`Written: ${PASSAGES_OUT}`);
console.log(`Written: ${QUESTIONS_OUT}`);

// ─── Seed the database ────────────────────────────────────────────────────────

if (!SEED_SECRET) {
  console.log("\nNo SEED_SECRET env var — skipping database seed.");
  console.log("To seed: SEED_SECRET=your_secret node scripts/import-vr-excel.js");
  console.log("Or: curl -X POST http://localhost:3000/api/admin/seed-vr -d '{\"secret\":\"your_secret\"}'");
  process.exit(0);
}

console.log("\nSeeding database…");

const body = JSON.stringify({ secret: SEED_SECRET });
const req = http.request(SEED_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
}, res => {
  let data = "";
  res.on("data", chunk => { data += chunk; });
  res.on("end", () => {
    try {
      const json = JSON.parse(data);
      if (json.ok) {
        console.log(`Seeded: ${json.passages} passages, ${json.questions} questions.`);
      } else {
        console.error("Seed error:", json.error || data);
      }
    } catch {
      console.error("Seed response:", data);
    }
  });
});

req.on("error", e => { console.error("Seed request failed:", e.message); });
req.write(body);
req.end();
