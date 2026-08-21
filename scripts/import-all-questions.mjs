/**
 * Imports all practice questions for VR, SJT, DM, QR sections.
 * Run with: node scripts/import-all-questions.mjs
 */
import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envRaw = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const getEnv = k => { const m = envRaw.match(new RegExp(`^${k}=(.+)$`, "m")); return m ? m[1].trim() : ""; };

const sb = createClient(getEnv("NEXT_PUBLIC_SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"));

// ── Helpers ────────────────────────────────────────────────────────────────────

async function batchInsert(table, rows, size = 50) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    const { error } = await sb.from(table).insert(chunk);
    if (error) throw new Error(`${table} chunk ${i}: ${error.message}`);
    inserted += chunk.length;
    process.stdout.write(`\r  ${table}: ${inserted}/${rows.length}`);
  }
  console.log(" ✓");
}

function parseHighlight(text) {
  const m = String(text ?? "").match(/^\s*\[Highlight:\s*"([^"]+)"\]\s*/);
  return m
    ? { highlight: m[1], clean: text.slice(m[0].length).trim() }
    : { highlight: "", clean: String(text ?? "").trim() };
}

// Parse "Label: value" lines from DM chart stimuli
function parseDMChart(stimulus, visualType) {
  const chartMap = { "Bar chart": "bar", "Line graph": "line", "Pie chart": "pie" };
  const chartType = chartMap[visualType];
  if (!chartType) return { chart: null, cleanStimulus: stimulus };

  const lines = stimulus.split("\n").map(l => l.trim()).filter(Boolean);
  const data = [];
  const contextLines = [];

  for (const line of lines) {
    // Match "Label: 123" or "Label: 45.6%" or "Label: 1,234"
    const m = line.match(/^(.+?):\s*([\d,.]+)%?\s*\.?$/);
    if (m) {
      const label = m[1].trim();
      const value = parseFloat(m[2].replace(/,/g, ""));
      if (!isNaN(value)) {
        data.push({ label, value });
        continue;
      }
    }
    // Lines before data are context
    if (data.length === 0) contextLines.push(line);
  }

  if (data.length < 2) return { chart: null, cleanStimulus: stimulus };

  // Build chart title from the intro line
  const intro = contextLines.join(" ").replace(/:$/, "").trim();
  const titleMatch = intro.match(/shows?\s+(.+)/i);
  const chartTitle = titleMatch ? titleMatch[1].trim() : intro;

  const chart = { type: chartType, title: chartTitle, data };

  // No duplicate: stimulus becomes empty since chart shows all data
  return { chart, cleanStimulus: "" };
}

// ── 1. VR ──────────────────────────────────────────────────────────────────────
async function importVR() {
  console.log("\n=== Importing VR ===");
  const raw = JSON.parse(
    fs.readFileSync("/Users/sawda/Downloads/UCAT_VR_50_Passages_200_Questions_PulseMed_Schema.json", "utf8")
  );

  const passages = [];
  const questions = [];

  for (let pi = 0; pi < raw.length; pi++) {
    const { passage, questions: qs } = raw[pi];
    const code = `VRP-P${String(pi + 1).padStart(2, "0")}`;

    // Derive title from first sentence
    const firstSentence = passage.split(/[.!?]/)[0].trim().slice(0, 80);

    passages.push({ code, title: firstSentence, passage });

    const format = qs[0].type === "tf" ? "TFCT" : "MCQ";
    const diffSuffix = ["A", "B", "C", "D"];

    for (let qi = 0; qi < qs.length; qi++) {
      const q = qs[qi];
      const id = `${code}-${format}-S1-${diffSuffix[qi]}`;

      // Map difficulty: Diamond → Platinum (VR API maps Diamond query to Platinum in DB)
      const diff = q.difficulty === "Diamond" ? "Platinum" : q.difficulty;

      let optA, optB, optC, optD, correctAnswer, explanation, supportingEvidence;

      if (q.type === "tf") {
        optA = "True"; optB = "False"; optC = "Can't Tell"; optD = "";
        const corrMap = { True: "A", False: "B", "Can't Tell": "C" };
        correctAnswer = corrMap[q.correct] ?? "A";
        const expRaw = q.explanations?.[q.correct] ?? "";
        const parsed = parseHighlight(expRaw);
        explanation = parsed.clean;
        supportingEvidence = parsed.highlight;
      } else {
        // MCQ — options array + correct letter
        optA = q.options?.[0] ?? ""; optB = q.options?.[1] ?? "";
        optC = q.options?.[2] ?? ""; optD = q.options?.[3] ?? "";
        correctAnswer = String(q.correct ?? "A").trim().toUpperCase();
        const corrIdx = "ABCD".indexOf(correctAnswer);
        const corrLabel = q.options?.[corrIdx];
        const expRaw = corrLabel ? (q.explanations?.[corrLabel] ?? q.explanations?.[correctAnswer] ?? "") : "";
        const parsed = parseHighlight(expRaw);
        explanation = parsed.clean;
        supportingEvidence = parsed.highlight;
      }

      questions.push({
        id,
        passage_code: code,
        format,
        difficulty: diff,
        primary_subtype: q.subtype ?? "",
        skill_focus: "",
        question: q.question,
        option_a: optA,
        option_b: optB,
        option_c: optC,
        option_d: optD,
        correct_answer: correctAnswer,
        explanation,
        supporting_evidence: supportingEvidence,
      });
    }
  }

  await batchInsert("vr_passages", passages, 25);
  await batchInsert("vr_questions", questions, 50);
  console.log(`  VR done: ${passages.length} passages, ${questions.length} questions`);
}

// ── 2. SJT ─────────────────────────────────────────────────────────────────────
async function importSJT() {
  console.log("\n=== Importing SJT ===");

  const OPTIONS_AR = [
    "A very appropriate thing to do",
    "Appropriate, but not ideal",
    "Inappropriate, but not awful",
    "A very inappropriate thing to do",
  ];
  const OPTIONS_IR = ["Very important", "Important", "Of minor importance", "Not important at all"];

  const wb = XLSX.readFile("/Users/sawda/Downloads/SJT — Mixed Practice.xlsx");
  const rows = [];

  for (const sheetName of ["Bronze", "Silver", "Gold", "Platinum"]) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const sheetRows = XLSX.utils.sheet_to_json(ws, { defval: "" });

    for (const r of sheetRows) {
      const id = String(r["Q ID"] || "").trim();
      if (!id) continue;

      const qtype = String(r["Question type"] || "").trim();
      const difficulty = String(r["Difficulty"] || "").trim();
      const scenario = String(r["Scenario text"] || "").trim();
      const decision = String(r["Decision / consideration"] || "").trim();
      const answerRaw = String(r["Answer"] || "").trim();
      const walkthrough = String(r["Worked rationale"] || "").trim();
      const scenarioTitle = String(r["Scenario"] || "").trim();

      if (qtype === "Most and least appropriate") {
        // Options: A, B, C (D is empty for most-least)
        const optA = String(r["A"] || "").trim();
        const optB = String(r["B"] || "").trim();
        const optC = String(r["C"] || "").trim();

        // Parse "Most A; least C" → "most:0|least:2"
        const mostMatch = answerRaw.match(/Most\s+([A-C])/i);
        const leastMatch = answerRaw.match(/least\s+([A-C])/i);
        const mostIdx = mostMatch ? "ABC".indexOf(mostMatch[1].toUpperCase()) : 0;
        const leastIdx = leastMatch ? "ABC".indexOf(leastMatch[1].toUpperCase()) : 2;

        rows.push({
          id,
          format: "most-least",
          scenario_num: null,
          scenario_title: scenarioTitle,
          scenario,
          professional_theme: "",
          theme_focus: "",
          difficulty,
          question: decision,
          option_a: optA,
          option_b: optB,
          option_c: optC,
          correct_answer: `most:${mostIdx}|least:${leastIdx}`,
          walkthrough,
        });
      } else {
        // Appropriateness or Importance
        const fmt = qtype === "Importance" ? "importance" : "appropriateness";
        const opts = fmt === "importance" ? OPTIONS_IR : OPTIONS_AR;

        // Answer is a letter A/B/C/D → map to full option string
        const letterIdx = "ABCD".indexOf(answerRaw.toUpperCase().charAt(0));
        const correctAnswer = letterIdx >= 0 ? opts[letterIdx] : opts[0];

        rows.push({
          id,
          format: fmt,
          scenario_num: null,
          scenario_title: scenarioTitle,
          scenario,
          professional_theme: "",
          theme_focus: "",
          difficulty,
          question: decision,
          option_a: "",
          option_b: "",
          option_c: "",
          correct_answer: correctAnswer,
          walkthrough,
        });
      }
    }
  }

  await batchInsert("sjt_questions", rows, 50);
  console.log(`  SJT done: ${rows.length} questions`);
}

// ── 3. DM ──────────────────────────────────────────────────────────────────────
async function importDM() {
  console.log("\n=== Importing DM ===");

  const wb = XLSX.readFile(
    "/Users/sawda/Downloads/PulseMed UCAT DM — 200 Student-Ready Questions (1).xlsx"
  );
  const allRows = XLSX.utils.sheet_to_json(wb.Sheets["Question Bank"], { defval: "" });

  const yn5Rows = [];
  const mcqPassages = []; // admin_passages
  const mcqQuestions = []; // admin_qs

  for (const r of allRows) {
    const id = String(r["Item ID"] || "").trim();
    if (!id) continue;

    const format = String(r["Format"] || "").trim();
    const difficulty = String(r["Tier"] || "").trim();
    const family = String(r["Family"] || "").trim();
    const subtype = String(r["Subtype"] || "").trim();
    const stimulusRaw = String(r["Stimulus / figure brief"] || "").trim();
    const question = String(r["Question or conclusion"] || "").trim();
    const optA = String(r["Option A"] || "").trim();
    const optB = String(r["Option B"] || "").trim();
    const optC = String(r["Option C"] || "").trim();
    const optD = String(r["Option D"] || "").trim();
    const answer = String(r["Answer"] || "").trim();
    const walkthrough = String(r["Student worked explanation"] || "").trim();
    const timeSec = Number(r["Suggested seconds"]) || 55;
    const visualType = String(r["Visual type"] || "Text").trim();

    if (format === "YN-5") {
      // YN-5 → dm_questions table
      // All YN-5 are text/logic (no charts), options always Yes/No
      yn5Rows.push({
        id,
        set_id: String(r["Set ID"] || "").trim(),
        format: "YN-5",
        difficulty,
        family,
        subtype,
        stimulus: stimulusRaw,
        question,
        option_a: "Yes",
        option_b: "No",
        correct_answer: answer, // "Yes" or "No"
        walkthrough,
        time_sec: timeSec,
        visual_type: visualType,
      });
    } else {
      // MCQ → admin_passages + admin_qs
      const { chart, cleanStimulus } = parseDMChart(stimulusRaw, visualType);

      // Insert passage first (get ID back)
      const { data: passageData, error: pErr } = await sb
        .from("admin_passages")
        .insert({ section: "dm", content: cleanStimulus, chart })
        .select("id")
        .single();

      if (pErr) {
        console.error(`\n  ✗ passage for ${id}:`, pErr.message);
        continue;
      }

      const options = [optA, optB, optC, optD].filter(Boolean);
      const answerLower = answer.trim().toLowerCase();

      mcqQuestions.push({
        section: "dm",
        passage_id: passageData.id,
        question_text: question,
        options,
        correct: answerLower, // letter "a"/"b"/"c"/"d"
        explanations: { [answer.toUpperCase()]: walkthrough },
        subtype: family,
        difficulty,
        sort_order: 0,
      });
    }
  }

  // Insert YN-5 in bulk
  await batchInsert("dm_questions", yn5Rows, 50);
  // Insert MCQ admin questions in bulk
  await batchInsert("admin_qs", mcqQuestions, 50);

  console.log(`  DM done: ${yn5Rows.length} YN-5 (dm_questions), ${mcqQuestions.length} MCQ (admin_qs)`);
}

// ── 4. QR ──────────────────────────────────────────────────────────────────────
async function importQR() {
  console.log("\n=== Importing QR ===");

  const wb = XLSX.readFile(
    "/Users/sawda/Downloads/PulseMed UCAT QR — 1,000-Question Bank — Corrected Categories.xlsx"
  );
  const qRows = XLSX.utils.sheet_to_json(wb.Sheets["Question Bank"], { defval: "" });
  const setRows = XLSX.utils.sheet_to_json(wb.Sheets["Set Catalogue"], { defval: "" });

  // Build dataset map from Set Catalogue (has the Stimulus + Figure/Data for the full set)
  const setMap = new Map();
  for (const s of setRows) {
    const setId = String(s["Set ID"] || "").trim();
    if (!setId) continue;
    setMap.set(setId, {
      title: String(s["Context"] || "").trim(),
      stimulus: String(s["Stimulus"] || "").trim(),
      figureData: String(s["Figure / Data"] || "").trim(),
    });
  }

  // Build unique datasets from questions (de-duplicate)
  const datasetsSeen = new Set();
  const datasets = [];
  const questions = [];

  for (const r of qRows) {
    const id = String(r["ID"] || "").trim();
    const setId = String(r["Set ID"] || "").trim();
    if (!id || !setId) continue;

    // Dataset (insert once per set)
    if (!datasetsSeen.has(setId)) {
      datasetsSeen.add(setId);
      const sd = setMap.get(setId) ?? {};
      const stimulus = sd.stimulus || String(r["Stimulus"] || "").trim();
      const figureData = sd.figureData || String(r["Figure / Data"] || "").trim();

      // No duplicate: scenario = context description,
      // figure_brief = actual table/data. They are complementary, not duplicate.
      datasets.push({
        id: setId,
        title: sd.title || String(r["Context"] || "").trim(),
        scenario: stimulus,
        figure_brief: figureData,
      });
    }

    const difficulty = String(r["Level"] || r["Generation Tier"] || "").trim();
    const optA = String(r["Option A"] || "").trim();
    const optB = String(r["Option B"] || "").trim();
    const optC = String(r["Option C"] || "").trim();
    const optD = String(r["Option D"] || "").trim();
    const optE = String(r["Option E"] || "").trim();
    const correctRaw = String(r["Correct Answer"] || "").trim();
    // Correct answer is a letter A/B/C/D — store just the letter
    const correctLetter = correctRaw.match(/^([A-E])/i)?.[1]?.toUpperCase() ?? "A";

    questions.push({
      id,
      dataset_id: setId,
      difficulty,
      topic: String(r["Topic"] || "").trim(),
      question: String(r["Question"] || "").trim(),
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      option_e: optE,
      correct_answer: correctLetter,
      walkthrough: String(r["Worked Solution"] || "").trim(),
      skill_tested: String(r["Primary Skill"] || "").trim(),
      time_sec: Number(r["Target Time (sec)"]) || 45,
    });
  }

  await batchInsert("qr_datasets", datasets, 50);
  await batchInsert("qr_questions", questions, 100);
  console.log(`  QR done: ${datasets.length} datasets, ${questions.length} questions`);
}

// ── Main ────────────────────────────────────────────────────────────────────────
console.log("Starting full question import...\n");

try {
  await importVR();
  await importSJT();
  await importDM();
  await importQR();
  console.log("\n✓ All sections imported successfully.");
} catch (e) {
  console.error("\n✗ Import failed:", e.message);
  process.exit(1);
}
