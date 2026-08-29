// Run: node scripts/parse-med-schools.mjs
import XLSX from "xlsx";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXCEL = join(__dirname, "../../../../Downloads/UK Medical Schools 2027 — Admissions, Contextual, Course & Student Experience.xlsx");
const OUT   = join(__dirname, "../lib/data/med-schools.json");

const wb = XLSX.readFile(EXCEL);

// ── Master Comparison ──────────────────────────────────────────────────────────
const masterRaw = XLSX.utils.sheet_to_json(wb.Sheets["Master Comparison"], { header: 1 });
const mHdr = masterRaw.findIndex(r => r.some(c => String(c).toLowerCase() === "university"));
const masterData = masterRaw.slice(mHdr + 1).filter(r => r[0] && String(r[0]).length > 2);

// ── Admissions Deep Dive ───────────────────────────────────────────────────────
const admRaw = XLSX.utils.sheet_to_json(wb.Sheets["Admissions Deep Dive"], { header: 1 });
const aHdr = admRaw.findIndex(r => r.some(c => String(c).toLowerCase() === "university"));
const admData = admRaw.slice(aHdr + 1).filter(r => r[0] && String(r[0]).length > 2);
const admByName = {};
admData.forEach(r => { admByName[r[0]] = r; });

// ── Grade parsing ──────────────────────────────────────────────────────────────
function parseMinGrades(req) {
  const patterns = ["A\\*A\\*A", "A\\*AA", "AAA", "A\\*AB", "AAB", "ABB", "BBB"];
  for (const p of patterns) {
    const m = req.match(new RegExp(p));
    if (m) return m[0];
  }
  return "AAA";
}

// ── Selectivity tier ──────────────────────────────────────────────────────────
// 1 = very competitive, 2 = competitive, 3 = standard, 4 = accessible
const TIER_MAP = {
  "University of Oxford": 1,
  "University of Cambridge": 1,
  "Imperial College London": 1,
  "University College London (UCL)": 1,
  "University of Edinburgh": 2,
  "King's College London": 2,
  "University of Bristol": 2,
  "Newcastle University": 2,
  "University of Sheffield": 2,
  "University of Leeds": 2,
  "University of Birmingham": 2,
  "University of Southampton": 2,
  "Queen Mary University of London (Barts and The London)": 2,
  "Queen's University Belfast": 2,
  "Cardiff University": 2,
  "University of Glasgow": 2,
  "University of Aberdeen": 2,
  "University of Dundee": 2,
  "University of St Andrews": 2,
  "Brighton and Sussex Medical School": 2,
  "University of Nottingham": 2,
  "University of Manchester": 2,
  "City St George's, University of London": 2,
  "University of Exeter": 3,
  "Hull York Medical School": 3,
  "Keele University": 3,
  "University of Leicester": 3,
  "University of Liverpool": 3,
  "Lancaster University": 3,
  "University of Plymouth": 3,
  "Kent and Medway Medical School": 3,
  "University of Lincoln": 3,
};

function getTier(name) {
  return TIER_MAP[name] ?? 4;
}

// ── UCAT weight ────────────────────────────────────────────────────────────────
function getUcatWeight(policy) {
  const p = (policy || "").toLowerCase();
  if (p.includes("no ucat")) return "none";
  if (p.includes("ranking") || p.includes("dominant")) return "dominant";
  if (p.includes("minimum")) return "minimum";
  return "composite";
}

// ── Subject requirements ───────────────────────────────────────────────────────
function getSubjectReq(req) {
  const r = (req || "").toLowerCase();
  const needsChem = /chemistry/i.test(r);
  const needsBio  = /biology/i.test(r);
  // "Chemistry or Biology" = either is fine
  const chemOrBio = /chemistry or biology|biology or chemistry/i.test(req);
  return {
    chemistry: needsChem && !chemOrBio ? "required" : needsChem ? "or-bio" : "none",
    biology:   needsBio  && !chemOrBio ? "required" : needsBio  ? "or-chem" : "none",
  };
}

// ── Assemble ───────────────────────────────────────────────────────────────────
const schools = masterData.map(r => {
  const adm      = admByName[r[0]] || [];
  const aLevelReq = r[6] || "";
  const subjReq   = getSubjectReq(aLevelReq);
  return {
    name:           r[0],
    location:       r[1] || "",
    course:         r[2] || "",
    eligibility:    r[3] || "All",
    length:         r[4] || "5 years",
    aLevelReq,
    minGrades:      parseMinGrades(aLevelReq),
    subjectReq:     subjReq,
    gcseReq:        r[7] || "",
    ucatPolicy:     r[8] || "",
    ucatWeight:     getUcatWeight(r[8]),
    ucatDetail:     r[9] || "",
    selectionModel: r[11] || "",
    contextual:     /yes/i.test(r[12] || ""),
    contextualDetail: r[13] || "",
    teachingModel:  r[14] || "",
    studentLife:    r[16] || "",
    mscUrl:         r[17] || "",
    uniUrl:         r[18] || "",
    strategicNote:  adm[8] || adm[7] || "",
    tier:           getTier(r[0]),
  };
});

writeFileSync(OUT, JSON.stringify(schools, null, 2));
console.log(`✓ med-schools.json written — ${schools.length} schools`);
schools.forEach(s =>
  console.log(`  [T${s.tier}] ${s.name} | ${s.minGrades} | UCAT: ${s.ucatWeight}`)
);
