// Run: node scripts/parse-ps-bank.mjs
import XLSX from "xlsx";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXCEL = join(__dirname, "../../../../Downloads/Medicine_Personal_Statement_AI_Bank_v3_Rated.xlsx");
const OUT   = join(__dirname, "../lib/data/ps-bank.json");

const wb = XLSX.readFile(EXCEL);

// ── Comment Taxonomy (all 24 labels — always injected into every prompt) ──
const taxonomy = XLSX.utils.sheet_to_json(wb.Sheets["Comment Taxonomy"]).map(r => ({
  label:      r.Label,
  definition: r.Definition,
  behaviour:  r.AI_Behaviour,
  example:    r.Example_Pattern,
}));

// ── Annotated Extracts → reconstruct weak/strong pairs ──
const rawExtracts = XLSX.utils.sheet_to_json(wb.Sheets["Annotated Extracts"]);

// Group by Pair_ID
const pairMap = {};
for (const row of rawExtracts) {
  if (!row.Pair_ID) continue;
  if (!pairMap[row.Pair_ID]) pairMap[row.Pair_ID] = { id: row.Pair_ID, question: row.UCAS_Question, topic: row.Topic };
  const isWeak = String(row.Pair_Role_Legacy ?? "").toLowerCase().includes("weak");
  if (isWeak) {
    pairMap[row.Pair_ID].weak = {
      extract:       row.Extract,
      label:         row.Primary_Label,
      ideal_comment: row.Ideal_AI_Comment,
    };
  } else {
    pairMap[row.Pair_ID].strong = {
      extract:       row.Extract,
      label:         row.Primary_Label,
      ideal_comment: row.Ideal_AI_Comment,
    };
  }
}
const pairs = Object.values(pairMap).filter(p => p.weak && p.strong);

// ── Borderline Cases ──
const borderline = XLSX.utils.sheet_to_json(wb.Sheets["Borderline Cases"]).map(r => ({
  question:      r.UCAS_Question,
  text:          r.Text,
  gold_label:    r.Gold_Label,
  should_comment: String(r.Should_Comment ?? "").toLowerCase() === "yes" || r.Should_Comment === true,
  ideal_comment: r.Ideal_AI_Comment,
  severity:      r.Severity,
})).filter(r => r.text && r.ideal_comment);

// ── Rating Ladders (sample across 1–10) ──
const ladders = XLSX.utils.sheet_to_json(wb.Sheets["Rating Ladders"]).map(r => ({
  question:    r.UCAS_Question,
  rating:      r.Rating_1_10,
  band:        r.Quality_Band,
  theme:       r.Theme,
  extract:     r.Extract,
  reflection:  r.Reflection_1_10,
  specificity: r.Specificity_1_10,
})).filter(r => r.extract);

// ── Output ──
const bank = { taxonomy, pairs, borderline, ladders };
writeFileSync(OUT, JSON.stringify(bank, null, 2));
console.log(`✓ ps-bank.json written`);
console.log(`  taxonomy: ${taxonomy.length}`);
console.log(`  pairs: ${pairs.length}`);
console.log(`  borderline: ${borderline.length}`);
console.log(`  ladders: ${ladders.length}`);
