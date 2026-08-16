import { readFileSync } from "fs";
import { randomUUID } from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`
  : "https://ljuscmpgzmgisnizlyze.supabase.co/rest/v1";
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const H = {
  "Content-Type": "application/json",
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  Prefer: "return=representation",
};

async function post(table, body) {
  const r = await fetch(`${SUPABASE_URL}/${table}`, {
    method: "POST",
    headers: H,
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`POST ${table} failed: ${JSON.stringify(j)}`);
  return Array.isArray(j) ? j[0] : j;
}

// ---------- PARSER ----------

function parseCompactOptions(line) {
  // Single-line format: "A.Cardio B.Neuro C.Resp D.Ortho" or "A720 B810 C900 D1000"
  // Find positions of B, C, D option markers (preceded by space)
  const cleaned = line.trim();
  const positions = [0]; // A always starts at 0
  let i = 0;
  while (i < cleaned.length) {
    const m = cleaned.slice(i).match(/^\s([BCD])[.:]?\s*\S/);
    if (m) {
      positions.push(i + 1); // position of the letter
    }
    i++;
  }
  if (positions.length < 4) {
    // fallback: split on " B", " C", " D"
    const parts = cleaned.split(/\s+(?=[BCD][.:]?\s*\S)/);
    if (parts.length >= 4) {
      return {
        A: parts[0].replace(/^A[.:]?\s*/, "").trim(),
        B: parts[1].replace(/^B[.:]?\s*/, "").trim(),
        C: parts[2].replace(/^C[.:]?\s*/, "").trim(),
        D: parts[3].replace(/^D[.:]?\s*/, "").trim(),
      };
    }
    // last resort: regex
    const m2 = cleaned.match(/^A[.:]?\s*(.+?)\s+B[.:]?\s*(.+?)\s+C[.:]?\s*(.+?)\s+D[.:]?\s*(.+)$/);
    if (m2) {
      return { A: m2[1].trim(), B: m2[2].trim(), C: m2[3].trim(), D: m2[4].trim() };
    }
    return null;
  }
  // Extract values between positions
  const letters = ["A", "B", "C", "D"];
  const result = {};
  for (let idx = 0; idx < positions.length && idx < 4; idx++) {
    const start = positions[idx];
    const end = idx + 1 < positions.length ? positions[idx + 1] : cleaned.length;
    const raw = cleaned.slice(start, end).trim();
    result[letters[idx]] = raw.replace(/^[A-D][.:]?\s*/, "").trim();
  }
  return result;
}

function parseBlock(header, bodyLines, set, topic) {
  // Parse header: ### Q5 — Diamond — Chart (difficulty is sometimes absent)
  const hm = header.match(/### Q(\d+)/i);
  const qNum = hm ? parseInt(hm[1]) : 0;
  const diffMatch = header.match(/\b(Diamond|Gold|Silver)\b/i);
  const difficulty = diffMatch ? diffMatch[1] : "Diamond";
  const hasChart = header.toLowerCase().includes("chart") && !header.toLowerCase().includes("no chart");

  const body = bodyLines.join("\n");

  // Find answer
  const answerMatch = body.match(/\*\*Answer:\s*([A-E])/i);
  const answer = answerMatch ? answerMatch[1].toUpperCase() : "A";

  // Find walkthrough
  const walkthroughMatch = body.match(/\*\*Walkthrough:\*\*\s*([\s\S]+?)(?:\n\n|$)/);
  const walkthrough = walkthroughMatch
    ? walkthroughMatch[1].replace(/\s+/g, " ").trim()
    : "";

  // Content before **Answer:
  const answerIdx = body.indexOf("**Answer:");
  const beforeAnswer = answerIdx >= 0 ? body.slice(0, answerIdx) : body;

  // Split into non-empty lines
  const allLines = beforeAnswer.split("\n");

  // Detect options
  // Multi-line: lines starting with "A." or "A. " (with or without space after dot)
  const multiOptLines = allLines.filter((l) => l.trim().match(/^[A-D]\.\s*\S/));

  let optA = "", optB = "", optC = "", optD = "";
  let optStartLine = -1;

  if (multiOptLines.length >= 2) {
    // Find first option line index (A. ...)
    for (let i = 0; i < allLines.length; i++) {
      if (allLines[i].trim().match(/^A\.\s*\S/)) {
        optStartLine = i;
        break;
      }
    }
    for (const opt of multiOptLines) {
      const m = opt.trim().match(/^([A-D])\.\s*(.+)/);
      if (!m) continue;
      const text = m[2].replace(/\s+$/, "").trim();
      if (m[1] === "A") optA = text;
      else if (m[1] === "B") optB = text;
      else if (m[1] === "C") optC = text;
      else if (m[1] === "D") optD = text;
    }
  } else {
    // Look for compact single-line options (or "Question? A.opt B.opt..." on one line)
    for (let i = 0; i < allLines.length; i++) {
      const l = allLines[i].trim();
      // Has A followed by value and at least B and C elsewhere in same line
      const hasCompact = l.match(/A[.:]?\s*\S/) && l.match(/\s[BCD][.:]?\s*\S/);
      if (hasCompact) {
        // Check if it's "Question? A..." - split at the options part
        const optPartIdx = l.search(/\bA[.:]?\s*\S/);
        const questionPart = optPartIdx > 0 ? l.slice(0, optPartIdx).trim() : "";
        const optsPart = optPartIdx >= 0 ? l.slice(optPartIdx) : l;

        const parsed = parseCompactOptions(optsPart);
        if (parsed && (parsed.A || parsed.B)) {
          optA = parsed.A || "";
          optB = parsed.B || "";
          optC = parsed.C || "";
          optD = parsed.D || "";
          // Replace the options portion of the line with just the question part
          if (questionPart) {
            allLines[i] = questionPart;
          } else {
            optStartLine = i;
          }
          break;
        }
      }
    }
  }

  // Everything before option start = context/question
  const contextLines = optStartLine >= 0 ? allLines.slice(0, optStartLine) : allLines;
  const contextText = contextLines.join("\n").trim();

  // Split context into paragraphs
  const paragraphs = contextText
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  let scenario = "";
  let question = "";

  if (paragraphs.length === 0) {
    scenario = "";
    question = "";
  } else if (paragraphs.length === 1) {
    const p = paragraphs[0];
    if (p.includes("|")) {
      // It's a table — put as scenario, question is implicit
      scenario = p;
      question = "";
    } else {
      scenario = "";
      question = p;
    }
  } else {
    // Last paragraph = question, rest = scenario
    question = paragraphs[paragraphs.length - 1].trim();
    scenario = paragraphs.slice(0, -1).join("\n\n").trim();
  }

  // If question is empty but scenario is a table, try to find question in scenario
  if (!question && scenario) {
    const parts = scenario.split(/\n\n+/);
    if (parts.length > 1) {
      question = parts[parts.length - 1].trim();
      scenario = parts.slice(0, -1).join("\n\n").trim();
    }
  }

  return {
    set,
    qNum,
    topic,
    difficulty,
    hasChart,
    scenario,
    question,
    optA,
    optB,
    optC,
    optD,
    answer,
    walkthrough,
  };
}

function parseMarkdown(text) {
  const lines = text.split("\n");
  const questions = [];
  let currentSet = 0;
  let currentTopic = "";
  let inQ = false;
  let qHeader = "";
  let qLines = [];

  function flushQ() {
    if (inQ && qHeader) {
      questions.push(parseBlock(qHeader, qLines, currentSet, currentTopic));
    }
    inQ = false;
    qHeader = "";
    qLines = [];
  }

  for (const line of lines) {
    const setMatch = line.match(/^# SET (\d+)/);
    if (setMatch) {
      flushQ();
      currentSet = parseInt(setMatch[1]);
      continue;
    }

    const topicMatch = line.match(/^## \d+\. (.+)/);
    if (topicMatch) {
      flushQ();
      currentTopic = topicMatch[1].trim();
      continue;
    }

    const qMatch = line.match(/^### Q\d+/);
    if (qMatch) {
      flushQ();
      qHeader = line;
      qLines = [];
      inQ = true;
      continue;
    }

    if (inQ) qLines.push(line);
  }
  flushQ();

  return questions;
}

// ---------- MAIN ----------

async function main() {
  const text = readFileSync("/Users/sawda/Downloads/ucat_qr_complete_session_bank.md", "utf-8");
  const questions = parseMarkdown(text);
  console.log(`Parsed ${questions.length} questions`);

  let inserted = 0;
  let failed = 0;

  for (const q of questions) {
    const title = `${q.topic} — Set ${q.set}, Q${q.qNum}`;
    const figure_brief = q.hasChart ? "Chart" : null;

    try {
      const dsId = randomUUID();
      // Insert dataset row
      await post("qr_datasets", {
        id: dsId,
        title,
        figure_brief,
        scenario: q.scenario || q.question || title,
      });

      const qId = randomUUID();
      // Insert question row
      await post("qr_questions", {
        id: qId,
        dataset_id: dsId,
        question: q.question || title,
        option_a: q.optA || null,
        option_b: q.optB || null,
        option_c: q.optC || null,
        option_d: q.optD || null,
        correct_answer: q.answer,
        difficulty: q.difficulty,
        topic: q.topic,
        walkthrough: q.walkthrough || null,
        time_sec: 45,
      });

      inserted++;
      if (inserted % 25 === 0) console.log(`  ${inserted}/${questions.length} inserted…`);
    } catch (err) {
      console.error(`FAILED Set ${q.set} Q${q.qNum} (${q.topic}): ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${failed} failed`);
}

main().catch((e) => { console.error(e); process.exit(1); });
