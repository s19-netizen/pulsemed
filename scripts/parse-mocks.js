/**
 * Parses the two mock MD files + mark schemes and writes
 * lib/mock1Data.ts and lib/mock2Data.ts
 * Usage: node scripts/parse-mocks.js
 */

const fs = require("fs");
const path = require("path");

const FILES = [
  {
    questions: "/Users/sawda/Downloads/PulseMed_UCAT_Mock_Test_1(1).md",
    answers:   "/Users/sawda/Downloads/PulseMed_UCAT_Mock_Test_1_MARK_SCHEME.md",
    out:       path.join(__dirname, "../lib/mock1Data.ts"),
    key:       "MOCK1",
    label:     "Mock Test 1",
  },
  {
    questions: "/Users/sawda/Downloads/PulseMed_UCAT_Mock_Test_2_Hard(1).md",
    answers:   "/Users/sawda/Downloads/PulseMed_UCAT_Mock_Test_2_Hard_MARK_SCHEME.md",
    out:       path.join(__dirname, "../lib/mock2Data.ts"),
    key:       "MOCK2",
    label:     "Mock Test 2 (Hard)",
  },
];

function cleanText(t) {
  return (t || "").replace(/\s+/g, " ").trim();
}

function parseOptions(block) {
  const opts = [];
  for (const line of block.split("\n")) {
    const t = line.trim();
    const m = t.match(/^([A-E])\.\s+(.+)/);
    if (m) opts.push(m[2].trim());
  }
  return opts;
}

// ── VR parser ─────────────────────────────────────────────────────────────────

function parseVR(text) {
  const vrStart = text.indexOf("# Section 1");
  const vrEnd   = text.indexOf("# Section 2");
  if (vrStart === -1) return [];
  const vrText = vrEnd > -1 ? text.slice(vrStart, vrEnd) : text.slice(vrStart);

  const passageBlocks = vrText.split(/^## VR Passage/m).slice(1);
  const passages = [];

  for (const block of passageBlocks) {
    const titleMatch = block.match(/^(.+?)\n/);
    const title = titleMatch ? titleMatch[1].replace(/^\d+\s*[—–-]\s*/, "").trim() : "Passage";

    const passageEnd = block.indexOf("\n### Q");
    const passageText = passageEnd > -1
      ? cleanText(block.slice(block.indexOf("\n") + 1, passageEnd))
      : "";

    const qBlocks = block.split(/^### Q/m).slice(1);
    const questions = [];

    for (const qb of qBlocks) {
      const numMatch = qb.match(/^(\d+)/);
      if (!numMatch) continue;
      const num = parseInt(numMatch[1]);

      const tagMatch = qb.match(/`ID:\s*([\w-]+)[^`]*`/);
      const id = tagMatch ? tagMatch[1] : `VR-Q${num}`;

      const isTFCT = qb.includes("- True") || qb.includes("- False") || qb.includes("- Can't Tell");

      const afterTag = qb.replace(/`[^`]+`/, "").trim();
      const lines = afterTag.split("\n").map(l => l.trim()).filter(Boolean);

      let qLines = [], optLines = [], inOpts = false;
      for (const l of lines) {
        if (!inOpts && (l.match(/^[A-E]\./) || l.match(/^-\s+(True|False|Can't Tell)/))) {
          inOpts = true;
        }
        if (inOpts) optLines.push(l);
        else qLines.push(l);
      }

      const questionText = qLines.join(" ").replace(/^\d+\s*/, "").trim();
      const options = isTFCT
        ? ["True", "False", "Can't Tell"]
        : parseOptions(optLines.join("\n"));

      questions.push({ id, num, questionText, options, isTFCT, correct: -1, explanation: "" });
    }

    passages.push({ title, passageText, questions });
  }

  return passages;
}

// ── DM parser ─────────────────────────────────────────────────────────────────

function parseDM(text) {
  const dmStart = text.indexOf("# Section 2");
  const dmEnd   = text.indexOf("# Section 3");
  if (dmStart === -1) return [];
  const dmText = dmEnd > -1 ? text.slice(dmStart, dmEnd) : text.slice(dmStart);

  // Split on "## DM Q<num>" headers
  const blocks = dmText.split(/^## DM Q/m).slice(1);
  const questions = [];

  for (const block of blocks) {
    // First line: "45 — Science Clubs"
    const headerMatch = block.match(/^(\d+)\s*[—–-]\s*(.+)/);
    if (!headerMatch) continue;
    const num   = parseInt(headerMatch[1]);
    const title = headerMatch[2].split("\n")[0].trim();

    const tagMatch = block.match(/`ID:\s*([\w-]+)[^`]*format=([^|`]+)/);
    const id  = tagMatch ? tagMatch[1].trim() : `DM-Q${num}`;
    const fmt = tagMatch ? tagMatch[2].trim() : "MCQ";
    const isYN = fmt.toLowerCase().includes("yes") || fmt.toLowerCase().includes("yn");

    // Text after the tag line
    const afterTag = block.replace(/`[^`]+`/, "").replace(/^[^\n]+\n/, "").trim();
    const lines = afterTag.split("\n");

    if (isYN) {
      // Stimulus: bullet points (lines starting with "- ")
      // Instruction: line with "select **Yes**"
      // Statements: numbered lines "1. ... 2. ..."
      const stimulusLines = [];
      const statements = [];

      for (const line of lines) {
        const t = line.trim();
        if (!t || t === "---") continue;
        const numStmt = t.match(/^(\d+)\.\s+(.+)/);
        if (numStmt) {
          statements.push(numStmt[2].replace(/\s+$/, "").trim());
        } else if (!t.toLowerCase().includes("select **yes**") && !t.toLowerCase().includes("for each conclusion")) {
          stimulusLines.push(t.replace(/^[-•]\s*/, ""));
        }
      }

      questions.push({
        id, num, title, format: "YN-5",
        context: stimulusLines.filter(Boolean).join("\n"),
        statements,
        correct: [], // will be filled from answer key as [true/false, ...]
        explanation: "",
      });
    } else {
      // MCQ — context before question, options A–D
      let contextLines = [], qLines = [], optLines = [];
      let stage = "context";

      for (const line of lines) {
        const t = line.trim();
        if (!t || t === "---") continue;
        if (t.match(/^[A-E]\./)) { stage = "opts"; }
        if (stage === "opts") { optLines.push(t); continue; }
        if (stage === "context" && t.endsWith("?") && contextLines.length > 0) {
          qLines.push(t); stage = "q"; continue;
        }
        // Lines that look like questions (contain "which", "what", "how", end with ?)
        if (stage === "context" && qLines.length === 0 &&
          (t.toLowerCase().startsWith("which") || t.toLowerCase().startsWith("what") ||
           t.toLowerCase().startsWith("how") || t.toLowerCase().startsWith("who")) &&
          contextLines.length > 0) {
          qLines.push(t); stage = "q"; continue;
        }
        if (stage === "q") { qLines.push(t); continue; }
        contextLines.push(t);
      }

      // If no explicit context/question split, everything before options is the question
      if (qLines.length === 0 && contextLines.length > 0) {
        qLines = [contextLines.pop() || ""];
      }

      const options = parseOptions(optLines.join("\n"));
      questions.push({
        id, num, title, format: "MCQ",
        context: contextLines.join("\n"),
        questionText: qLines.join(" "),
        options,
        correct: -1,
        explanation: "",
      });
    }
  }

  return questions;
}

// ── QR parser ─────────────────────────────────────────────────────────────────

function parseQR(text) {
  const qrStart = text.indexOf("# Section 3");
  const qrEnd   = text.indexOf("# Section 4");
  if (qrStart === -1) return [];
  const qrText = qrEnd > -1 ? text.slice(qrStart, qrEnd) : text.slice(qrStart);

  const datasetBlocks = qrText.split(/^## QR /m).slice(1);
  const datasets = [];

  for (const block of datasetBlocks) {
    const titleMatch = block.match(/^(.+?)\n/);
    const title = titleMatch ? titleMatch[1].trim() : "Dataset";
    const scenarioEnd = block.indexOf("\n### Q");
    const scenario = scenarioEnd > -1 ? cleanText(block.slice(block.indexOf("\n") + 1, scenarioEnd)) : "";

    const qBlocks = block.split(/^### Q/m).slice(1);
    const questions = [];

    for (const qb of qBlocks) {
      const numMatch = qb.match(/^(\d+)/);
      if (!numMatch) continue;
      const num = parseInt(numMatch[1]);
      const tagMatch = qb.match(/`ID:\s*([\w-]+)/);
      const id = tagMatch ? tagMatch[1] : `QR-Q${num}`;

      const afterTag = qb.replace(/`[^`]+`/, "").trim();
      const lines = afterTag.split("\n").map(l => l.trim()).filter(Boolean);

      let qLines = [], optLines = [], inOpts = false;
      for (const l of lines) {
        if (!inOpts && l.match(/^[A-E]\./)) inOpts = true;
        if (inOpts) optLines.push(l); else qLines.push(l);
      }

      const questionText = qLines.join(" ").replace(/^\d+\s*/, "").trim();
      const options = parseOptions(optLines.join("\n"));
      questions.push({ id, num, questionText, options, correct: -1, explanation: "" });
    }

    datasets.push({ title, scenario, questions });
  }

  return datasets;
}

// ── SJT parser ────────────────────────────────────────────────────────────────

function parseSJT(text) {
  const sjtStart = text.indexOf("# Section 4");
  if (sjtStart === -1) return [];
  const sjtText = text.slice(sjtStart);

  const scenarioBlocks = sjtText.split(/^## SJT Scenario/m).slice(1);
  const scenarios = [];

  for (const block of scenarioBlocks) {
    const titleMatch = block.match(/^(.+?)\n/);
    const title = titleMatch ? titleMatch[1].replace(/^\d+\s*[—–-]\s*/, "").trim() : "Scenario";
    const scenarioEnd = block.indexOf("\n### Q");
    const scenarioText = scenarioEnd > -1 ? cleanText(block.slice(block.indexOf("\n") + 1, scenarioEnd)) : "";

    const qBlocks = block.split(/^### Q/m).slice(1);
    const questions = [];

    for (const qb of qBlocks) {
      const numMatch = qb.match(/^(\d+)/);
      if (!numMatch) continue;
      const num = parseInt(numMatch[1]);
      const tagMatch = qb.match(/`ID:\s*([\w-]+)[^`]*format=([^\s|`]+)/);
      const id  = tagMatch ? tagMatch[1] : `SJT-Q${num}`;
      const fmt = tagMatch ? tagMatch[2].toLowerCase() : "ar";

      const afterTag = qb.replace(/`[^`]+`/, "").trim();
      const lines = afterTag.split("\n").map(l => l.trim()).filter(Boolean);

      let qLines = [], inOpts = false;
      for (const l of lines) {
        if (!inOpts && l.match(/^[A-D]\./)) inOpts = true;
        if (!inOpts) qLines.push(l);
      }

      let options;
      if (fmt.includes("ar") || fmt.includes("approp")) {
        options = ["A very appropriate thing to do", "Appropriate, but not ideal", "Inappropriate, but not awful", "A very inappropriate thing to do"];
      } else {
        options = ["Very important", "Important", "Of minor importance", "Not important at all"];
      }

      const questionText = qLines.join(" ").replace(/^\d+\s*/, "").trim();
      questions.push({ id, num, questionText, options, fmt, correct: -1, explanation: "" });
    }

    scenarios.push({ title, scenarioText, questions });
  }

  return scenarios;
}

// ── Answer parsers ────────────────────────────────────────────────────────────

function parseVRQRAnswers(text) {
  // Parses: ### Q1 — **A. text** and QR compact format "80:A · 81:B ..."
  const answers = {};

  // VR + SJT full format
  const qRe = /### Q(\d+)[^*]*\*\*([^*]+)\*\*/g;
  let m;
  while ((m = qRe.exec(text)) !== null) {
    const num = parseInt(m[1]);
    const ans = m[2].trim().replace(/\.$/, "");
    const afterMatch = text.slice(m.index + m[0].length);
    const nextQ = afterMatch.search(/^### Q\d+/m);
    const explanation = cleanText(nextQ > -1 ? afterMatch.slice(0, nextQ) : afterMatch.slice(0, 600));
    answers[num] = { answer: ans, explanation };
  }

  // QR compact format: "80:A · 81:B · ..."
  const compactRe = /(\d+):([A-E])/g;
  while ((m = compactRe.exec(text)) !== null) {
    const num = parseInt(m[1]);
    if (!answers[num]) {
      answers[num] = { answer: m[2], explanation: "" };
    }
  }

  return answers;
}

function parseDMAnswers(text) {
  // Parses the ## DM section: "- Q45: Y/Y/Y/N/N" or "- Q46: A"
  const dmSection = text.match(/## DM\s*([\s\S]*?)(?=\n## [A-Z]|\n# |$)/);
  if (!dmSection) return {};

  const answers = {};
  const lineRe = /- Q(\d+):\s*(.+)/g;
  let m;
  while ((m = lineRe.exec(dmSection[1])) !== null) {
    const num = parseInt(m[1]);
    const val = m[2].trim();
    // Check for explanations in ## DM section (after all the Q lines)
    answers[num] = { answer: val, explanation: "" };
  }

  // Also look for explanation blocks after ## DM Explanations or similar
  const explSection = text.match(/## DM.*?[Ee]xplan[\s\S]*?(?=\n## [A-Z]|\n# |$)/);
  if (explSection) {
    const explRe = /### Q(\d+)[^*]*\*\*([^*]+)\*\*\s*([\s\S]*?)(?=\n### Q|\n## |$)/g;
    while ((m = explRe.exec(explSection[0])) !== null) {
      const num = parseInt(m[1]);
      if (answers[num]) answers[num].explanation = cleanText(m[3]);
    }
  }

  return answers;
}

function parseSJTAnswers(text) {
  // Parses ## SJT section: "- Q116: Very appropriate"
  const sjtSection = text.match(/## SJT\s*([\s\S]*?)(?=\n## [A-Z]|\n# |$)/);
  if (!sjtSection) return {};
  const answers = {};
  const lineRe = /- Q(\d+):\s*(.+)/g;
  let m;
  while ((m = lineRe.exec(sjtSection[1])) !== null) {
    answers[parseInt(m[1])] = { answer: m[2].trim(), explanation: "" };
  }
  return answers;
}

function resolveCorrect(options, answerStr) {
  if (!answerStr) return 0;
  const ans = answerStr.trim();
  if (/^[A-E]$/.test(ans)) return ans.charCodeAt(0) - 65;
  const lm = ans.match(/^([A-E])\./);
  if (lm) return lm[1].charCodeAt(0) - 65;
  const idx = options.findIndex(o =>
    o.trim().toLowerCase() === ans.toLowerCase() ||
    o.trim().toLowerCase().startsWith(ans.toLowerCase().slice(0, 25))
  );
  if (idx >= 0) return idx;
  const tf = ans.toLowerCase();
  if (tf === "true") return 0;
  if (tf === "false") return 1;
  if (tf.includes("can't") || tf.includes("cannot") || tf.includes("cant")) return 2;
  return 0;
}

// ── Main ──────────────────────────────────────────────────────────────────────

for (const file of FILES) {
  console.log(`\nProcessing ${file.label}...`);

  const qText = fs.readFileSync(file.questions, "utf8");
  const aText = fs.readFileSync(file.answers, "utf8");

  const vrAnswers  = parseVRQRAnswers(aText);
  const dmAnswers  = parseDMAnswers(aText);
  const sjtAnswers = parseSJTAnswers(aText);

  const vrPassages   = parseVR(qText);
  const dmQuestions  = parseDM(qText);
  const qrDatasets   = parseQR(qText);
  const sjtScenarios = parseSJT(qText);

  // Assign VR answers
  for (const p of vrPassages) {
    for (const q of p.questions) {
      const a = vrAnswers[q.num];
      if (a) {
        q.correct = resolveCorrect(q.options, a.answer);
        q.explanation = a.explanation;
      }
    }
  }

  // Assign DM answers
  for (const q of dmQuestions) {
    const a = dmAnswers[q.num];
    if (!a) continue;
    if (q.format === "YN-5") {
      // Answer looks like "Y/Y/Y/N/N"
      const parts = a.answer.split("/").map(p => p.trim().toUpperCase());
      q.correct = parts.map(p => p === "Y" ? 0 : 1); // 0=Yes, 1=No
    } else {
      q.correct = resolveCorrect(q.options, a.answer);
    }
    q.explanation = a.explanation;
  }

  // Assign QR answers
  for (const d of qrDatasets) {
    for (const q of d.questions) {
      const a = vrAnswers[q.num]; // reuse vrAnswers which includes QR compact format
      if (a) {
        q.correct = resolveCorrect(q.options, a.answer);
        q.explanation = a.explanation;
      }
    }
  }

  // Assign SJT answers
  for (const s of sjtScenarios) {
    for (const q of s.questions) {
      const a = sjtAnswers[q.num];
      if (a) {
        q.correct = resolveCorrect(q.options, a.answer);
        q.explanation = a.explanation;
      }
    }
  }

  // Counts
  const vrCount  = vrPassages.reduce((a, p) => a + p.questions.length, 0);
  const qrCount  = qrDatasets.reduce((a, d) => a + d.questions.length, 0);
  const sjtCount = sjtScenarios.reduce((a, s) => a + s.questions.length, 0);
  console.log(`  VR:  ${vrCount}q across ${vrPassages.length} passages`);
  console.log(`  DM:  ${dmQuestions.length}q (${dmQuestions.filter(q => q.format === "YN-5").length} YN-5, ${dmQuestions.filter(q => q.format === "MCQ").length} MCQ)`);
  console.log(`  QR:  ${qrCount}q across ${qrDatasets.length} datasets`);
  console.log(`  SJT: ${sjtCount}q across ${sjtScenarios.length} scenarios`);

  // Scoring tables from mark scheme
  const vrTable = [];
  const vrTableRe = /\|\s*(\d+)\/44[^|]*\|\s*[\d.]+%[^|]*\|\s*\*\*(\d+)\*\*/g;
  let tm;
  while ((tm = vrTableRe.exec(aText)) !== null) vrTable.push({ raw: parseInt(tm[1]), score: parseInt(tm[2]) });

  const qrTable = [];
  const qrTableRe = /\|\s*(\d+)\/36[^|]*\|\s*[\d.]+%[^|]*\|\s*\*\*(\d+)\*\*/g;
  while ((tm = qrTableRe.exec(aText)) !== null) qrTable.push({ raw: parseInt(tm[1]), score: parseInt(tm[2]) });

  const dmTable = [];
  const dmTableRe = /\|\s*(\d+)\/35[^|]*\|\s*[\d.]+%[^|]*\|\s*\*\*(\d+)\*\*/g;
  while ((tm = dmTableRe.exec(aText)) !== null) dmTable.push({ raw: parseInt(tm[1]), score: parseInt(tm[2]) });

  const ts = `// AUTO-GENERATED by parse-mocks.js — do not edit by hand
// ${file.label}

export const MOCK_LABEL = ${JSON.stringify(file.label)};

export type MockQuestion = {
  id: string;
  num: number;
  questionText: string;
  options: string[];
  correct: number;
  explanation: string;
  fmt?: string;
};

export type VRPassage = {
  title: string;
  passageText: string;
  questions: MockQuestion[];
};

export type QRDataset = {
  title: string;
  scenario: string;
  questions: MockQuestion[];
};

export type SJTScenario = {
  title: string;
  scenarioText: string;
  questions: MockQuestion[];
};

export type DMQuestion = {
  id: string;
  num: number;
  title: string;
  format: "YN-5" | "MCQ";
  context: string;
  // MCQ only
  questionText?: string;
  options?: string[];
  correct?: number;
  // YN-5 only
  statements?: string[];
  correct5?: number[]; // 0=Yes, 1=No for each statement
  explanation: string;
};

export const VR_PASSAGES: VRPassage[] = ${JSON.stringify(vrPassages, null, 2)};

export const DM_QUESTIONS: DMQuestion[] = ${JSON.stringify(
  dmQuestions.map(q => q.format === "YN-5"
    ? { id: q.id, num: q.num, title: q.title, format: q.format, context: q.context, statements: q.statements, correct5: q.correct, explanation: q.explanation }
    : { id: q.id, num: q.num, title: q.title, format: q.format, context: q.context, questionText: q.questionText, options: q.options, correct: q.correct, explanation: q.explanation }
  ), null, 2)};

export const QR_DATASETS: QRDataset[] = ${JSON.stringify(qrDatasets, null, 2)};

export const SJT_SCENARIOS: SJTScenario[] = ${JSON.stringify(sjtScenarios, null, 2)};

// Raw → PulseMed score tables
export const VR_SCORE_TABLE: { raw: number; score: number }[] = ${JSON.stringify(vrTable, null, 2)};
export const QR_SCORE_TABLE: { raw: number; score: number }[] = ${JSON.stringify(qrTable, null, 2)};
export const DM_SCORE_TABLE: { raw: number; score: number }[] = ${JSON.stringify(dmTable, null, 2)};

export function lookupScore(table: { raw: number; score: number }[], raw: number): number {
  if (!table.length) return 300 + Math.round((raw / 35) * 300);
  const entry = table.find(e => e.raw === raw);
  if (entry) return entry.score;
  const sorted = [...table].sort((a, b) => a.raw - b.raw);
  if (raw <= sorted[0].raw) return sorted[0].score;
  if (raw >= sorted[sorted.length - 1].raw) return sorted[sorted.length - 1].score;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (raw >= sorted[i].raw && raw <= sorted[i + 1].raw) {
      const t = (raw - sorted[i].raw) / (sorted[i + 1].raw - sorted[i].raw);
      return Math.round(sorted[i].score + t * (sorted[i + 1].score - sorted[i].score));
    }
  }
  return 300;
}

export const SJT_BANDS = [
  { min: 129, max: 138, band: 1 },
  { min: 113, max: 128, band: 2 },
  { min: 93,  max: 112, band: 3 },
  { min: 0,   max: 92,  band: 4 },
];

export function sjtBand(raw: number): number {
  return SJT_BANDS.find(b => raw >= b.min && raw <= b.max)?.band ?? 4;
}
`;

  fs.writeFileSync(file.out, ts, "utf8");
  console.log(`  Written to ${path.basename(file.out)}`);
}

console.log("\nDone!");
