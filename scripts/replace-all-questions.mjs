/**
 * Replace all practice questions from the 4 new UCAT Excel files.
 * Run: node scripts/replace-all-questions.mjs
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

const VR_FILE  = "/Users/sawda/Downloads/UCAT VR — 35 Passages + 1120 Question Bank.xlsx";
const SJT_FILE = "/Users/sawda/Downloads/UCAT SJT Question Bank — Appropriateness, Importance & Most-Least.xlsx";
const DM_FILE  = "/Users/sawda/Downloads/UCAT Decision Making Question Bank.xlsx";
const QR_FILE  = "/Users/sawda/Downloads/UCAT QR Question Bank — 72 Questions per Topic.xlsx";

// ── REST helpers ───────────────────────────────────────────────────────────────

async function del(table, filter) {
  const url = `${BASE_URL}/${table}?${filter}`;
  const res = await fetch(url, { method: "DELETE", headers: { ...HEADERS, "Prefer": "count=exact" } });
  if (!res.ok) {
    const txt = await res.text();
    console.warn(`  ⚠ DELETE ${table}: ${res.status} ${txt.slice(0, 120)}`);
  } else {
    const count = res.headers.get("content-range")?.split("/")?.[1] ?? "?";
    console.log(`  cleared ${table}: ${count} rows`);
  }
}

async function insert(table, rows, returning = false) {
  if (rows.length === 0) return [];
  const headers = { ...HEADERS };
  if (returning) headers["Prefer"] = "return=representation";
  const res = await fetch(`${BASE_URL}/${table}`, {
    method: "POST",
    headers,
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`INSERT ${table}: ${res.status} ${txt.slice(0, 200)}`);
  }
  if (returning) return res.json();
  return [];
}

async function insertOne(table, row) {
  const res = await fetch(`${BASE_URL}/${table}`, {
    method: "POST",
    headers: { ...HEADERS, "Prefer": "return=representation" },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`INSERT ${table}: ${res.status} ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

async function batchInsert(table, rows, size = 50) {
  if (rows.length === 0) { console.log(`  ${table}: 0 rows — skipped`); return; }
  let inserted = 0;
  for (let i = 0; i < rows.length; i += size) {
    await insert(table, rows.slice(i, i + size));
    inserted += rows.slice(i, i + size).length;
    process.stdout.write(`\r  ${table}: ${inserted}/${rows.length}`);
  }
  console.log(" ✓");
}

function str(v) { return String(v ?? "").trim(); }

// ── Step 1: Clear ──────────────────────────────────────────────────────────────

async function clearAll() {
  console.log("\n=== Clearing existing questions ===");
  await del("vr_questions",  "id=not.is.null");
  await del("vr_passages",   "code=not.is.null");
  await del("sjt_questions", "id=not.is.null");
  await del("dm_questions",  "id=not.is.null");
  await del("admin_qs",      "section=eq.dm");
  await del("admin_passages","section=eq.dm");
  await del("qr_questions",  "id=not.is.null");
  await del("qr_datasets",   "id=not.is.null");
}

// ── Step 2: VR ─────────────────────────────────────────────────────────────────

async function importVR() {
  console.log("\n=== Importing VR ===");
  const wb = XLSX.readFile(VR_FILE);

  const passageRows  = XLSX.utils.sheet_to_json(wb.Sheets["Passages"],  { defval: "" });
  const questionRows = XLSX.utils.sheet_to_json(wb.Sheets["Questions"], { defval: "" });

  const DIFF_TO_SLOT   = { Bronze: "S1", Silver: "S2", Gold: "S3", Diamond: "S4" };
  const slotLetter     = n => "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[n - 1] ?? "A";

  const passages = passageRows.map(p => ({
    code:    `P${String(p["Passage ID"]).padStart(2, "0")}`,
    title:   str(p["Title"]),
    passage: str(p["Passage"]),
  }));

  const questions = questionRows.map(q => {
    const passageId   = str(q["Passage ID"]);
    const format      = str(q["Format"]) || "MCQ";
    const setDiff     = str(q["Set Difficulty"]);
    const qInSet      = Number(q["Question Within Set"]) || 1;
    const slot        = DIFF_TO_SLOT[setDiff] ?? "S1";
    const passageCode = `P${passageId.padStart(2, "0")}`;
    const id          = `${passageCode}-${format}-${slot}-${slotLetter(qInSet)}`;
    const difficulty  = setDiff === "Diamond" ? "Platinum" : setDiff;

    const highlight = str(q["Highlight 1"]) + (q["Highlight 2"] ? " | " + str(q["Highlight 2"]) : "");

    return {
      id,
      passage_code:        passageCode,
      format,
      difficulty,
      primary_subtype:     str(q["Subtype"]),
      skill_focus:         "",
      question:            str(q["Question / Statement"]),
      option_a:            str(q["Option A"]),
      option_b:            str(q["Option B"]),
      option_c:            str(q["Option C"]),
      option_d:            str(q["Option D"]),
      correct_answer:      str(q["Correct Answer"]).match(/^([A-D])/i)?.[1]?.toUpperCase() ?? "A",
      explanation:         str(q["Full Walkthrough"]),
      supporting_evidence: highlight,
    };
  });

  await batchInsert("vr_passages",  passages,  25);
  await batchInsert("vr_questions", questions, 100);
  console.log(`  VR done: ${passages.length} passages, ${questions.length} questions`);
}

// ── Step 3: SJT ────────────────────────────────────────────────────────────────

async function importSJT() {
  console.log("\n=== Importing SJT ===");
  const wb = XLSX.readFile(SJT_FILE);

  const OPTIONS_AR = [
    "A very appropriate thing to do",
    "Appropriate, but not ideal",
    "Inappropriate, but not awful",
    "A very inappropriate thing to do",
  ];
  const OPTIONS_IR = ["Very important", "Important", "Of minor importance", "Not important at all"];

  const rows = [];

  // Appropriateness
  for (const sheetName of ["Bronze", "Silver", "Gold", "Diamond"]) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    for (const r of XLSX.utils.sheet_to_json(ws, { defval: "" })) {
      const id = str(r["Question ID"]);
      if (!id) continue;
      const letterIdx = Math.max(0, "ABCD".indexOf((str(r["Correct Rating"]).match(/^([A-D])/i)?.[1] ?? "A").toUpperCase()));
      const walkthrough = [
        str(r["Core Explanation"]),
        str(r["Why A"]) && `A: ${str(r["Why A"])}`,
        str(r["Why B"]) && `B: ${str(r["Why B"])}`,
        str(r["Why C"]) && `C: ${str(r["Why C"])}`,
        str(r["Why D"]) && `D: ${str(r["Why D"])}`,
      ].filter(Boolean).join("\n\n");
      rows.push({
        id,
        format:            "appropriateness",
        scenario_num:      null,
        scenario_title:    str(r["Scenario Title"]),
        scenario:          str(r["Scenario Text"]),
        professional_theme: str(r["Sections Addressed"]),
        theme_focus:       "",
        difficulty:        str(r["Difficulty"]),
        question:          str(r["Action / Response"]),
        option_a: "", option_b: "", option_c: "",
        correct_answer:    OPTIONS_AR[letterIdx] ?? OPTIONS_AR[0],
        walkthrough,
      });
    }
  }

  // Importance
  for (const sheetName of ["Importance Bronze", "Importance Silver", "Importance Gold", "Importance Diamond"]) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    for (const r of XLSX.utils.sheet_to_json(ws, { defval: "" })) {
      const id = str(r["Question ID"]);
      if (!id) continue;
      const letterIdx = Math.max(0, "ABCD".indexOf((str(r["Correct Rating"]).match(/^([A-D])/i)?.[1] ?? "A").toUpperCase()));
      const walkthrough = [
        str(r["Core Explanation"]),
        str(r["Why A"]) && `A: ${str(r["Why A"])}`,
        str(r["Why B"]) && `B: ${str(r["Why B"])}`,
        str(r["Why C"]) && `C: ${str(r["Why C"])}`,
        str(r["Why D"]) && `D: ${str(r["Why D"])}`,
      ].filter(Boolean).join("\n\n");
      rows.push({
        id,
        format:            "importance",
        scenario_num:      null,
        scenario_title:    str(r["Scenario Title"]),
        scenario:          str(r["Scenario Text"]),
        professional_theme: str(r["Sections Addressed"]),
        theme_focus:       "",
        difficulty:        sheetName.replace("Importance ", ""),
        question:          str(r["Consideration"]),
        option_a: "", option_b: "", option_c: "",
        correct_answer:    OPTIONS_IR[letterIdx] ?? OPTIONS_IR[0],
        walkthrough,
      });
    }
  }

  // Most-Least
  for (const sheetName of ["Most-Least Bronze", "Most-Least Silver", "Most-Least Gold", "Most-Least Diamond"]) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    for (const r of XLSX.utils.sheet_to_json(ws, { defval: "" })) {
      const id = str(r["Question ID"]);
      if (!id) continue;
      const mostIdx  = Math.max(0, "ABC".indexOf(str(r["Most Appropriate"]).toUpperCase()));
      const leastIdx = Math.max(0, "ABC".indexOf(str(r["Least Appropriate"]).toUpperCase()));
      const walkthrough = [
        str(r["Rationale A"]) && `A: ${str(r["Rationale A"])}`,
        str(r["Rationale B"]) && `B: ${str(r["Rationale B"])}`,
        str(r["Rationale C"]) && `C: ${str(r["Rationale C"])}`,
      ].filter(Boolean).join("\n\n");
      rows.push({
        id,
        format:            "most-least",
        scenario_num:      null,
        scenario_title:    str(r["Scenario Title"]),
        scenario:          str(r["Scenario Text"]),
        professional_theme: str(r["Sections Addressed"]),
        theme_focus:       "",
        difficulty:        sheetName.replace("Most-Least ", ""),
        question:          "Which action is most appropriate and which is least appropriate?",
        option_a:          str(r["Action A"]),
        option_b:          str(r["Action B"]),
        option_c:          str(r["Action C"]),
        correct_answer:    `most:${mostIdx}|least:${leastIdx}`,
        walkthrough,
      });
    }
  }

  await batchInsert("sjt_questions", rows, 50);
  console.log(`  SJT done: ${rows.length} questions`);
}

// ── Step 4: DM ─────────────────────────────────────────────────────────────────

function findBlocks(rows) {
  const starts = [];
  for (let i = 0; i < rows.length; i++) {
    if (/^QUESTION\s+\d+/i.test(str(rows[i][0]))) starts.push(i);
  }
  return starts.map((start, si) => ({ start, end: starts[si + 1] ?? rows.length }));
}

function parseYN5Block(rows, start, end, family, difficulty, idPrefix, qNum) {
  const stimulusLines = [];
  const statements    = [];
  let chart           = null;

  const SECTION = new Set(["PREMISES","SHORTHAND / CONSTRUCTION","LOGIC DIAGRAM / MAP","RULES",
                            "CONCLUSIONS","SOURCE INFORMATION","SCORING","SCORING / FORMAT","METHOD",
                            "GRID KEY","KEY RULES"]);

  if (family === "Interpreting Information") {
    // State machine: preamble → source → table-data → rules → statements
    let phase        = "preamble";
    let tableHeaders = null;
    const tableData  = [];
    let entityName   = "Record";

    for (let i = start + 1; i < end; i++) {
      const row = rows[i];
      const c0  = str(row[0]);
      const c1  = str(row[1]);
      const c2  = str(row[2]);

      // Statements section header (#/No.)
      if ((c0 === "#" || c0 === "No.") &&
          (c1.toLowerCase().includes("statement") || c1.toLowerCase().includes("conclusion"))) {
        phase = "statements";
        continue;
      }

      if (phase === "statements") {
        const num = Number(c0);
        if (num >= 1 && num <= 5 && c1) {
          statements.push({
            num,
            statement:   c1,
            answer:      c2.toUpperCase() === "YES" ? "Yes" : "No",
            explanation: str(row[4]) || str(row[5]) || str(row[3]),
          });
        }
        continue;
      }

      // Section markers drive phase transitions
      if (SECTION.has(c0.toUpperCase())) {
        if (c0.toUpperCase() === "SOURCE INFORMATION") phase = "source";
        else if (c0.toUpperCase() === "RULES")         phase = "rules";
        continue;
      }

      // Waiting for table header row after SOURCE INFORMATION
      if (phase === "source") {
        const cells = row.filter(v => v !== null && v !== undefined && String(v).trim() !== "");
        if (cells.length >= 2) {
          tableHeaders = row.map(v => String(v ?? "").trim()).filter(Boolean);
          phase = "table-data";
        }
        continue;
      }

      // Collecting table data rows
      if (phase === "table-data") {
        if (c0) {
          // Derive entity label from first data row (e.g. "Candidate A" → "Candidate")
          if (tableData.length === 0) {
            entityName = c0.replace(/\s+[A-E]$/, "").trim() || "Record";
          }
          const cells = row.slice(0, tableHeaders ? tableHeaders.length : 10)
                           .map(v => String(v ?? "").trim());
          if (cells.some(v => v !== "")) tableData.push(cells);
        }
        continue;
      }

      // Collecting rules
      if (phase === "rules") {
        if (/^Rule\s+\d+$/i.test(c0) && c1) stimulusLines.push(`${c0}: ${c1}`);
        continue;
      }
    }

    // Replace generic "Record" header with the inferred entity name
    if (tableHeaders && tableHeaders[0] === "Record") tableHeaders[0] = entityName;

    if (tableHeaders && tableData.length > 0) {
      chart = { type: "table", headers: tableHeaders, rows: tableData };
    }

  } else {
    // Syllogisms (and any other YN-5 types)
    let inStatements = false;

    for (let i = start + 1; i < end; i++) {
      const row = rows[i];
      const c0  = str(row[0]);
      const c1  = str(row[1]);
      const c2  = str(row[2]);

      if ((c0 === "#" || c0 === "No.") &&
          (c1.toLowerCase().includes("statement") || c1.toLowerCase().includes("conclusion"))) {
        inStatements = true;
        continue;
      }

      if (inStatements) {
        const num = Number(c0);
        if (num >= 1 && num <= 5 && c1) {
          statements.push({
            num,
            statement:   c1,
            answer:      c2.toUpperCase() === "YES" ? "Yes" : "No",
            explanation: str(row[4]) || str(row[5]) || str(row[3]),
          });
        }
        continue;
      }

      if (SECTION.has(c0.toUpperCase())) continue;

      // Numbered premises: "1.", "2.", …
      if (/^\d+\.$/.test(c0) && c1) { stimulusLines.push(`${c0} ${c1}`); continue; }

      // Rules (defensive fallback)
      if (/^Rule\s+\d+$/i.test(c0) && c1) { stimulusLines.push(`${c0}: ${c1}`); continue; }
    }
  }

  if (statements.length === 0) return [];

  const stimulus = stimulusLines.join("\n").trim();
  const set_id   = `${idPrefix}-${String(qNum).padStart(4, "0")}`;

  return statements.map(s => ({
    id:             `${set_id}-${s.num}`,
    set_id,
    format:         "YN-5",
    family,
    subtype:        family,
    difficulty,
    stimulus,
    chart,
    question:       s.statement,
    option_a:       "Yes",
    option_b:       "No",
    correct_answer: s.answer,
    walkthrough:    s.explanation,
    time_sec:       60,
    visual_type:    "Text",
  }));
}

function parseMCQBlock(rows, start, end, family, difficulty, mcqType) {
  const headerRow = str(rows[start][0]);
  const title     = headerRow.replace(/^QUESTION\s+\d+\s*[—\-]\s*/i, "").replace(/\s*\|.*/,"").trim();

  let stimulus      = "";
  let question      = "";
  let options       = ["", "", "", ""];
  let correctLetter = "";
  let walkthrough   = "";

  if (mcqType === "logical") {
    const walkthroughLines = [];
    for (let i = start + 1; i < end; i++) {
      const row = rows[i];
      const c0  = str(row[0]);
      const c1  = str(row[1]);
      if (c0 === "Scenario")  { stimulus = c1; continue; }
      if (c0 === "Question")  { question = c1; continue; }
      if (/^Option ([A-D])/.test(c0)) {
        const letter = c0.match(/Option ([A-D])/)[1];
        const idx = "ABCD".indexOf(letter);
        options[idx] = c1;
        if (str(row[2]) === "CORRECT") correctLetter = letter;
        continue;
      }
      if (c0.startsWith("After clue")) walkthroughLines.push(`${c0}: ${c1}`);
    }
    walkthrough = walkthroughLines.join("\n");

  } else if (mcqType === "venn") {
    const walkLines = [];
    for (let i = start + 1; i < end; i++) {
      const row = rows[i];
      const c0  = str(row[0]);
      const c1  = str(row[1]);
      if (c0 === "SETUP")    { stimulus = c1; continue; }
      if (c0 === "QUESTION") { question = c1; continue; }
      if (/^Option ([A-D])/.test(c0)) {
        const letter = c0.match(/Option ([A-D])/)[1];
        const idx    = "ABCD".indexOf(letter);
        options[idx] = String(row[1] ?? "");
        if (str(row[2]) === "CORRECT") correctLetter = letter;
        continue;
      }
      if (c0.startsWith("Step")) { walkLines.push(`${c0}: ${c1}`); continue; }
      if (c0 === "KEY VENN RULE") { walkLines.push(`Key rule: ${c1}`); continue; }
      if (c0 === "ANSWER" && !correctLetter) {
        const m = str(row[1]).match(/^([A-D])/i);
        if (m) correctLetter = m[1].toUpperCase();
      }
    }
    walkthrough = walkLines.join("\n");

  } else if (mcqType === "arguments") {
    let inOptions = false;
    for (let i = start + 1; i < end; i++) {
      const row = rows[i];
      const c0  = str(row[0]);
      const c1  = str(row[1]);
      const c2  = str(row[2]);
      if (c0 === "TASK") {
        stimulus = c1;
        question = headerRow.includes("NECESSARY ASSUMPTION")
          ? "Which of the following is a necessary assumption in the reasoning?"
          : "Which of the following represents the strongest argument?";
        continue;
      }
      if (c0 === "Option" && c1.toLowerCase().includes("argument")) { inOptions = true; continue; }
      if (inOptions && /^[A-D]$/.test(c0)) {
        options["ABCD".indexOf(c0)] = c1;
        if (c2.toUpperCase() === "YES") correctLetter = c0;
        continue;
      }
      if (c0 === "ANSWER" && !correctLetter) {
        const m = str(row[1]).match(/^([A-D])/i);
        if (m) correctLetter = m[1].toUpperCase();
      }
      if (c0 === "WALKTHROUGH") walkthrough  = c1;
      if (c0 === "KEY RULE")    walkthrough += (walkthrough ? "\nKey rule: " : "Key rule: ") + c1;
    }

  } else if (mcqType === "probability") {
    let inOptions = false;
    for (let i = start + 1; i < end; i++) {
      const row = rows[i];
      const c0  = str(row[0]);
      const c1  = str(row[1]);
      const c2  = str(row[2]);
      if (c0 === "QUESTION") { stimulus = c1; question = c1; continue; }
      if (c0 === "Option" && c1.toLowerCase().includes("probability")) { inOptions = true; continue; }
      if (inOptions && /^[A-D]$/.test(c0)) {
        options["ABCD".indexOf(c0)] = c1;
        if (c2.toUpperCase() === "YES") correctLetter = c0;
        continue;
      }
      if (c0 === "WORKED SOLUTION") walkthrough  = c1;
      if (c0 === "KEY METHOD")      walkthrough += (walkthrough ? "\nKey method: " : "Key method: ") + c1;
      if (c0 === "ANSWER" && !correctLetter) {
        const m = str(row[1]).match(/^([A-D])/i);
        if (m) correctLetter = m[1].toUpperCase();
      }
    }
  }

  // Final fallback: scan for ANSWER row
  if (!correctLetter) {
    for (let i = start + 1; i < end; i++) {
      if (str(rows[i][0]) === "ANSWER") {
        const m = str(rows[i][1]).match(/^([A-D])/i);
        if (m) { correctLetter = m[1].toUpperCase(); break; }
      }
    }
  }
  if (!correctLetter) correctLetter = "A";

  return {
    stimulus:     stimulus || title,
    question:     question || "Select the correct answer.",
    options:      options.map(String),
    correct:      correctLetter.toLowerCase(),
    explanations: { [correctLetter]: walkthrough || "" },
    subtype:      family,
    difficulty,
  };
}

async function importDM() {
  console.log("\n=== Importing DM ===");
  const wb = XLSX.readFile(DM_FILE);

  const yn5Configs = [
    { sheet: "Bronze Syllogisms",    family: "Syllogisms",              difficulty: "Bronze",  prefix: "SYL-BR" },
    { sheet: "Gold Syllogisms",      family: "Syllogisms",              difficulty: "Gold",    prefix: "SYL-GO" },
    { sheet: "Diamond Syllogisms",   family: "Syllogisms",              difficulty: "Diamond", prefix: "SYL-DI" },
    { sheet: "Interpreting Bronze",  family: "Interpreting Information", difficulty: "Bronze",  prefix: "INT-BR" },
    { sheet: "Interpreting Silver",  family: "Interpreting Information", difficulty: "Silver",  prefix: "INT-SI" },
    { sheet: "Interpreting Gold",    family: "Interpreting Information", difficulty: "Gold",    prefix: "INT-GO" },
    { sheet: "Interpreting Diamond", family: "Interpreting Information", difficulty: "Diamond", prefix: "INT-DI" },
  ];

  const mcqConfigs = [
    { sheet: "Logical Bronze",      family: "Logic Puzzles",           difficulty: "Bronze",  type: "logical" },
    { sheet: "Logical Silver",      family: "Logic Puzzles",           difficulty: "Silver",  type: "logical" },
    { sheet: "Logical Gold",        family: "Logic Puzzles",           difficulty: "Gold",    type: "logical" },
    { sheet: "Logical Diamond",     family: "Logic Puzzles",           difficulty: "Diamond", type: "logical" },
    { sheet: "Venn Bronze",         family: "Venn Diagrams",           difficulty: "Bronze",  type: "venn" },
    { sheet: "Venn Silver",         family: "Venn Diagrams",           difficulty: "Silver",  type: "venn" },
    { sheet: "Venn Gold",           family: "Venn Diagrams",           difficulty: "Gold",    type: "venn" },
    { sheet: "Venn Diamond",        family: "Venn Diagrams",           difficulty: "Diamond", type: "venn" },
    { sheet: "Arguments Bronze",    family: "Arguments & Assumptions", difficulty: "Bronze",  type: "arguments" },
    { sheet: "Arguments Silver",    family: "Arguments & Assumptions", difficulty: "Silver",  type: "arguments" },
    { sheet: "Arguments Gold",      family: "Arguments & Assumptions", difficulty: "Gold",    type: "arguments" },
    { sheet: "Arguments Diamond",   family: "Arguments & Assumptions", difficulty: "Diamond", type: "arguments" },
    { sheet: "Probability Bronze",  family: "Probability & Statistics",difficulty: "Bronze",  type: "probability" },
    { sheet: "Probability Silver",  family: "Probability & Statistics",difficulty: "Silver",  type: "probability" },
    { sheet: "Probability Gold",    family: "Probability & Statistics",difficulty: "Gold",    type: "probability" },
    { sheet: "Probability Diamond", family: "Probability & Statistics",difficulty: "Diamond", type: "probability" },
  ];

  // YN-5
  const yn5Rows = [];
  for (const cfg of yn5Configs) {
    const ws = wb.Sheets[cfg.sheet];
    if (!ws) { console.log(`  ⚠ sheet not found: ${cfg.sheet}`); continue; }
    const rows   = XLSX.utils.sheet_to_json(ws, { header: 1 });
    const blocks = findBlocks(rows);
    let qNum     = 1;
    for (const { start, end } of blocks) {
      const parsed = parseYN5Block(rows, start, end, cfg.family, cfg.difficulty, cfg.prefix, qNum);
      yn5Rows.push(...parsed);
      if (parsed.length > 0) qNum++;
    }
    console.log(`  ${cfg.sheet}: ${qNum - 1} questions`);
  }
  await batchInsert("dm_questions", yn5Rows, 50);
  console.log(`  YN-5 total: ${yn5Rows.length} rows`);

  // MCQ
  let mcqCount = 0;
  for (const cfg of mcqConfigs) {
    const ws = wb.Sheets[cfg.sheet];
    if (!ws) { console.log(`  ⚠ sheet not found: ${cfg.sheet}`); continue; }
    const rows   = XLSX.utils.sheet_to_json(ws, { header: 1 });
    const blocks = findBlocks(rows);

    for (const { start, end } of blocks) {
      const parsed = parseMCQBlock(rows, start, end, cfg.family, cfg.difficulty, cfg.type);
      if (!parsed.stimulus && !parsed.question) continue;

      const pData = await insertOne("admin_passages", { section: "dm", content: parsed.stimulus, chart: null });
      if (!pData?.id) { console.error(`  ✗ no passage id for ${cfg.sheet}`); continue; }

      await insertOne("admin_qs", {
        section:       "dm",
        passage_id:    pData.id,
        question_text: parsed.question,
        options:       parsed.options.filter(Boolean),
        correct:       parsed.correct,
        explanations:  parsed.explanations,
        subtype:       parsed.subtype,
        difficulty:    parsed.difficulty,
        sort_order:    0,
      });

      mcqCount++;
      process.stdout.write(`\r  DM MCQ: ${mcqCount} inserted`);
    }
  }
  console.log(`\n  DM done: ${yn5Rows.length} YN-5 + ${mcqCount} MCQ`);
}

// ── Step 5: QR ─────────────────────────────────────────────────────────────────

function parseQROptions(qText) {
  const parts = qText.split(/\s*•\s*A\)\s*/);
  if (parts.length < 2) return { question: qText, options: {} };
  const questionText = parts[0].trim();
  const options = {};
  const optMatches = ("A) " + parts[1]).matchAll(/([A-E])\)\s*([^|]+?)(?=\s*\||\s*$)/g);
  for (const m of optMatches) options[m[1]] = m[2].trim();
  return { question: questionText, options };
}

// Convert raw "Dataset / Data" text into a renderable chart or table.
function parseQRChart(topicName, rawData, datasetTitle) {
  // rawData = preamble paragraph + "\n\n" + structured data string
  const halves = rawData.split(/\n\n/);
  const data   = (halves.length >= 2 ? halves[halves.length - 1] : halves[0] ?? "").trim();

  // ── Charts & Graphs ─────────────────────────────────────────────────────────
  // e.g. "Jan: total 127, secondary series 48; Feb: total 147, secondary 60; …"
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
      return {
        type: "multiline",
        title: datasetTitle,
        xLabels,
        series: [
          { label: "Total",     values: totals },
          { label: "Secondary", values: secondaries },
        ],
      };
    }
  }

  // ── Averages & Financial Reasoning ──────────────────────────────────────────
  // e.g. "Daily figures: Mon 28, Tue 34, Wed 30, Thu 38, Fri 34.
  //       Selling price £9.25/unit; variable cost £4.53/unit; …"
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
      const m = s.match(/^(.+?)\s+(£[\d,.][^\s]*)$/)
             || s.match(/^(.+?)\s+([\d,.]+(?:\s+\S+)*)$/);
      if (m) rows.push([m[1].trim(), m[2].trim()]);
      else   rows.push(["", s]);
    }
    return { type: "table", title: datasetTitle, headers: ["Metric", "Value"], rows };
  }

  // ── Bullet-separated topics ──────────────────────────────────────────────────
  // Covers: Tables & Data Extraction, Percentages & Change, Ratio/Proportion & Rates
  // e.g. "Hospital Ward Activity • Cardiology: 120 • Surgery: 145 • Benchmark: 575 • …"
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

  // ── Units, Time & Measurement ────────────────────────────────────────────────
  // e.g. "Main rectangle 9.05 m × 5.62 m; height 2.45 m. Item footprint 0.50 m × 0.35 m. …"
  // Split on ; OR on ". " followed by a letter — never on decimal points inside numbers
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

async function importQR() {
  console.log("\n=== Importing QR ===");
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
        scenario:     str(r["Presentation"]),        // student-facing description
        figure_brief: chart ? JSON.stringify(chart) : rawData, // chart JSON (or raw fallback)
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

  await batchInsert("qr_datasets",  datasets,  50);
  await batchInsert("qr_questions", questions, 100);
  console.log(`  QR done: ${datasets.length} datasets, ${questions.length} questions`);
}

// ── Main ────────────────────────────────────────────────────────────────────────

console.log("Starting full question replacement...");
try {
  await clearAll();
  await importVR();
  await importSJT();
  await importDM();
  await importQR();
  console.log("\n✓ All sections replaced successfully.");
} catch (e) {
  console.error("\n✗ Import failed:", e.message);
  process.exit(1);
}
