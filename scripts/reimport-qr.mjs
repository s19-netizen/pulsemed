/**
 * Re-import just QR datasets/questions (fixes decimal-split bug in Units/Time/Measurement).
 * Run: node scripts/reimport-qr.mjs
 */
import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envRaw = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const getEnv = k => { const m = envRaw.match(new RegExp(`^${k}=(.+)$`, "m")); return m ? m[1].trim() : ""; };

const BASE_URL = `${getEnv("NEXT_PUBLIC_SUPABASE_URL")}/rest/v1`;
const KEY      = getEnv("SUPABASE_SERVICE_ROLE_KEY");
const HEADERS  = {
  "Content-Type":  "application/json",
  "apikey":        KEY,
  "Authorization": `Bearer ${KEY}`,
};

const QR_FILE = "/Users/sawda/Downloads/UCAT QR Question Bank — 72 Questions per Topic.xlsx";

async function del(table, filter) {
  const res = await fetch(`${BASE_URL}/${table}?${filter}`, {
    method: "DELETE", headers: { ...HEADERS, "Prefer": "count=exact" },
  });
  const count = res.headers.get("content-range")?.split("/")?.[1] ?? "?";
  console.log(`  cleared ${table}: ${count} rows`);
}

async function batchInsert(table, rows, size = 50) {
  if (rows.length === 0) return;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    const res = await fetch(`${BASE_URL}/${table}`, {
      method: "POST", headers: HEADERS, body: JSON.stringify(chunk),
    });
    if (!res.ok) { const t = await res.text(); throw new Error(`INSERT ${table}: ${res.status} ${t.slice(0,200)}`); }
    inserted += chunk.length;
    process.stdout.write(`\r  ${table}: ${inserted}/${rows.length}`);
  }
  console.log(" ✓");
}

const str = v => (v == null ? "" : String(v)).trim();

function parseQROptions(qText) {
  const parts = qText.split(/\s*•\s*A\)\s*/);
  if (parts.length < 2) return { question: qText, options: {} };
  const questionText = parts[0].trim();
  const options = {};
  const optMatches = ("A) " + parts[1]).matchAll(/([A-E])\)\s*([^|]+?)(?=\s*\||\s*$)/g);
  for (const m of optMatches) options[m[1]] = m[2].trim();
  return { question: questionText, options };
}

function parseQRChart(topicName, rawData, datasetTitle) {
  const halves = rawData.split(/\n\n/);
  const data   = (halves.length >= 2 ? halves[halves.length - 1] : halves[0] ?? "").trim();

  if (topicName === "Charts & Graphs") {
    const xLabels = [], totals = [], secondaries = [];
    for (const entry of data.split(/;\s*/)) {
      const m = entry.match(/^([^:]+):\s*total\s+([\d,]+),\s*secondary(?:\s+series)?\s+([\d,]+)/i);
      if (m) {
        xLabels.push(m[1].trim());
        totals.push(Number(m[2].replace(/,/g, "")));
        secondaries.push(Number(m[3].replace(/,/g, "")));
      }
    }
    if (xLabels.length > 0) {
      return { type: "multiline", title: datasetTitle, xLabels,
        series: [{ label: "Total", values: totals }, { label: "Secondary", values: secondaries }] };
    }
  }

  if (topicName === "Averages & Financial Reasoning") {
    const rows = [];
    const dailyM = data.match(/Daily figures?:\s*([^.]+)\./i);
    if (dailyM) {
      for (const day of dailyM[1].split(/,\s*/)) {
        const dm = day.trim().match(/^(\w+)\s+(.+)$/);
        if (dm) rows.push([dm[1], dm[2].trim()]);
      }
    }
    const remainder = data.replace(/Daily figures?:\s*[^.]+\.\s*/i, "").trim();
    for (const seg of remainder.split(/;\s*/)) {
      const s = seg.trim().replace(/\.$/, "");
      if (!s) continue;
      const m = s.match(/^(.+?)\s+(£[\d,.][^\s]*)$/) || s.match(/^(.+?)\s+([\d,.]+(?:\s+\S+)*)$/);
      if (m) rows.push([m[1].trim(), m[2].trim()]);
      else   rows.push(["", s]);
    }
    return { type: "table", title: datasetTitle, headers: ["Metric", "Value"], rows };
  }

  if (data.includes("•")) {
    const parts = data.split(/\s*•\s*/);
    const title  = parts[0].trim();
    const rows   = [];
    for (const part of parts.slice(1)) {
      const p = part.trim();
      if (!p) continue;
      if (p.includes(" = ")) {
        const eq = p.indexOf(" = ");
        rows.push([p.slice(0, eq).trim(), p.slice(eq + 3).trim()]);
      } else if (p.includes(": ")) {
        const ci = p.indexOf(": ");
        rows.push([p.slice(0, ci).trim(), p.slice(ci + 2).trim()]);
      } else {
        rows.push(["", p]);
      }
    }
    return { type: "table", title: title || datasetTitle, headers: ["Metric", "Value"], rows };
  }

  // Units, Time & Measurement — split on ; or ". " + letter, NOT on decimal points
  const segs = data.split(/;\s*|\.\s+(?=[A-Za-z])/u).map(s => s.trim()).filter(Boolean);
  const rows  = [];
  for (const seg of segs) {
    const m = seg.match(/^([A-Za-z][A-Za-z\s]*?)\s+([\d£×%].*)$/);
    if (m) rows.push([m[1].trim(), m[2].trim()]);
    else   rows.push(["", seg]);
  }
  return rows.length > 0
    ? { type: "table", title: datasetTitle, headers: ["Metric", "Value"], rows }
    : null;
}

async function main() {
  console.log("=== Re-importing QR ===");
  const wb = XLSX.readFile(QR_FILE);

  const TOPIC_PREFIX = {
    "Percentages & Change":           "PC",
    "Ratio, Proportion & Rates":      "RP",
    "Tables & Data Extraction":       "TD",
    "Charts & Graphs":                "CG",
    "Averages & Financial Reasoning": "AF",
    "Units, Time & Measurement":      "UT",
  };

  const datasets  = [];
  const questions = [];

  for (const [topicName, prefix] of Object.entries(TOPIC_PREFIX)) {
    const ws = wb.Sheets[topicName];
    if (!ws) { console.log(`  ⚠ sheet not found: ${topicName}`); continue; }
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

    rows.forEach((r, idx) => {
      const dsId    = `QR-${prefix}-${String(idx + 1).padStart(3, "0")}`;
      const title   = str(r["Dataset Title"]);
      const rawData = str(r["Dataset / Data"]);
      const chart   = parseQRChart(topicName, rawData, title);

      datasets.push({
        id:           dsId,
        title,
        scenario:     str(r["Presentation"]),
        figure_brief: chart ? JSON.stringify(chart) : rawData,
      });

      const difficulty = str(r["Difficulty"]);

      for (let qn = 1; qn <= 4; qn++) {
        const qRaw    = str(r[`Q${qn}`]);
        const ansRaw  = str(r[`Answer ${qn}`]);
        const working = str(r[`Working ${qn}`]);
        if (!qRaw) continue;

        const { question, options } = parseQROptions(qRaw);
        const correctLetter = (str(ansRaw).match(/^([A-E])\)?/i)?.[1] ?? "A").toUpperCase();

        questions.push({
          id:             `${dsId}-Q${qn}`,
          dataset_id:     dsId,
          difficulty,
          topic:          topicName,
          question,
          option_a:       options["A"] ?? "",
          option_b:       options["B"] ?? "",
          option_c:       options["C"] ?? "",
          option_d:       options["D"] ?? "",
          option_e:       options["E"] ?? "",
          correct_answer: correctLetter,
          walkthrough:    working,
          skill_tested:   topicName,
          time_sec:       45,
        });
      }
    });
  }

  console.log(`  Parsed: ${datasets.length} datasets, ${questions.length} questions`);

  console.log("\n=== Clearing QR ===");
  await del("qr_questions", "id=gte.QR-");
  await del("qr_datasets",  "id=gte.QR-");

  console.log("\n=== Inserting QR ===");
  await batchInsert("qr_datasets",  datasets,  50);
  await batchInsert("qr_questions", questions, 100);

  console.log(`\n✓ QR reimport complete: ${datasets.length} datasets, ${questions.length} questions`);
}

main().catch(e => { console.error("✗", e.message); process.exit(1); });
