"use client";
import { useState } from "react";

const COLORS: Record<string, string> = { vr: "#2D7FF9", dm: "#8B6BFF", qr: "#3DBE6C", sjt: "#FF6B5C" };
const TINTS:  Record<string, string> = { vr: "#EAF2FF", dm: "#F1ECFF", qr: "#EDFBF3", sjt: "#FFEDEA" };

type ParseResult = { ok: boolean; count: number; errors: string[] };

function parseVR(raw: any[]): ParseResult {
  const errors: string[] = [];
  let count = 0;
  raw.forEach((item, i) => {
    if (!item.passage) errors.push(`Item ${i + 1}: missing "passage"`);
    if (!Array.isArray(item.questions) || !item.questions.length) errors.push(`Item ${i + 1}: missing "questions" array`);
    else { item.questions.forEach((q: any, j: number) => { if (!q.question) errors.push(`Item ${i + 1}, Q${j + 1}: missing "question"`); else count++; }); }
  });
  return { ok: errors.length === 0, count, errors };
}

function parseDM(raw: any[]): ParseResult {
  const errors: string[] = [];
  let count = 0;
  raw.forEach((item, i) => {
    if (!item.type) { errors.push(`Item ${i + 1}: missing "type" (yn5 or mcq)`); return; }
    if (item.type === "yn5") {
      if (!item.stimulus) errors.push(`Item ${i + 1}: missing "stimulus"`);
      if (!Array.isArray(item.statements) || item.statements.length !== 5) errors.push(`Item ${i + 1}: "statements" must be an array of exactly 5 strings`);
      if (!item.correct_answer || !/^[YN](,[YN]){4}$/.test(String(item.correct_answer).trim())) errors.push(`Item ${i + 1}: "correct_answer" must be comma-separated Y/N e.g. "Y,N,Y,N,Y"`);
      count++;
    } else {
      if (!item.stimulus && !item.context) errors.push(`Item ${i + 1}: missing "stimulus"`);
      if (!item.question) errors.push(`Item ${i + 1}: missing "question"`);
      count++;
    }
  });
  return { ok: errors.length === 0, count, errors };
}

function parseQR(raw: any[]): ParseResult {
  const errors: string[] = [];
  let count = 0;
  raw.forEach((item, i) => {
    if (!item.context) errors.push(`Item ${i + 1}: missing "context"`);
    if (!Array.isArray(item.questions) || !item.questions.length) errors.push(`Item ${i + 1}: missing "questions" array`);
    else { item.questions.forEach((q: any, j: number) => { if (!q.question) errors.push(`Item ${i + 1}, Q${j + 1}: missing "question"`); else count++; }); }
  });
  return { ok: errors.length === 0, count, errors };
}

function parseSJT(raw: any[]): ParseResult {
  const errors: string[] = [];
  let count = 0;
  raw.forEach((item, i) => {
    if (!item.scenario) errors.push(`Item ${i + 1}: missing "scenario"`);
    if (!Array.isArray(item.questions) || !item.questions.length) errors.push(`Item ${i + 1}: missing "questions" array`);
    else { item.questions.forEach((q: any, j: number) => { if (!q.type) errors.push(`Item ${i + 1}, Q${j + 1}: missing "type"`); else count++; }); }
  });
  return { ok: errors.length === 0, count, errors };
}

function toPassagePayload(section: string, item: any): object {
  if (section === "vr") {
    return {
      section: "vr", content: item.passage,
      questions: (item.questions ?? []).map((q: any, i: number) => ({
        q_type: q.type ?? "tf", subtype: q.subtype ?? "Direct Retrieval", difficulty: q.difficulty ?? "Silver",
        question_text: q.question, options: q.type === "mcq" ? (q.options ?? []) : ["True","False","Can't Tell"],
        correct: q.correct ?? "True", explanations: q.explanations ?? {}, sort_order: i,
      })),
    };
  }
  if (section === "dm") {
    if (item.type === "yn5") {
      return {
        section: "dm", content: item.stimulus,
        questions: [{ q_type: "yn5", subtype: item.subtype ?? "Interpreting Information", difficulty: item.difficulty ?? "Silver", question_text: "Yes/No block", options: ["Yes","No"], correct: "set", explanations: {}, venn: item.venn ?? null, statements: (item.statements ?? []).map((s: any, i: number) => ({ text: s.statement, correct: s.correct ?? "Yes", explanation: s.explanation ?? "", sort_order: i })) }],
      };
    }
    return {
      section: "dm", content: item.context,
      questions: [{ q_type: "mcq", subtype: item.subtype ?? "Syllogisms", difficulty: item.difficulty ?? "Silver", question_text: item.question, options: item.options ?? [], correct: item.correct ?? "A", explanations: item.explanations ?? {}, venn: item.venn ?? null, sort_order: 0 }],
    };
  }
  if (section === "qr") {
    return {
      section: "qr", content: item.context, chart: item.chart ?? null,
      questions: (item.questions ?? []).map((q: any, i: number) => ({
        q_type: "mcq", subtype: q.subtype ?? "Data Interpretation", difficulty: q.difficulty ?? "Silver",
        question_text: q.question, options: q.options ?? [], correct: q.correct ?? "A", explanations: q.explanations ?? {}, sort_order: i,
      })),
    };
  }
  // sjt
  return {
    section: "sjt", content: item.scenario,
    questions: (item.questions ?? []).map((q: any, i: number) => {
      const type = q.type;
      if (type === "mostleast") {
        return { q_type: "mostleast", subtype: q.subtype ?? "Patient Safety", difficulty: q.difficulty ?? "Silver", question_text: "mostleast", options: q.actions ?? [], correct: JSON.stringify({ most: q.most ?? 0, least: q.least ?? 1 }), explanations: {}, sort_order: i };
      }
      return { q_type: type, subtype: q.subtype ?? "Patient Safety", difficulty: q.difficulty ?? "Silver", question_text: type, options: (q.items ?? []).map((it: any) => it.action ?? it.factor ?? ""), correct: JSON.stringify(Object.fromEntries((q.items ?? []).map((it: any, j: number) => [j, it.correct ?? "A"]))), explanations: {}, sort_order: i };
    }),
  };
}

function SectionImport({ section }: { section: string }) {
  const color = COLORS[section];
  const tint  = TINTS[section];
  const [text, setText] = useState("");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [parsed, setParsed] = useState<any[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [saveError, setSaveError] = useState("");

  function validate() {
    setDone(false); setSaveError(""); setResult(null); setParsed(null);
    let raw: any[];
    try { raw = JSON.parse(text); } catch { setResult({ ok: false, count: 0, errors: ["Invalid JSON — check brackets and commas."] }); return; }
    if (!Array.isArray(raw)) { setResult({ ok: false, count: 0, errors: ["Must be a JSON array [ ... ]"] }); return; }
    const parsers: Record<string, (r: any[]) => ParseResult> = { vr: parseVR, dm: parseDM, qr: parseQR, sjt: parseSJT };
    const r = parsers[section](raw);
    setResult(r);
    if (r.ok) setParsed(raw);
  }

  async function handleSave() {
    if (!parsed) return;
    setSaving(true); setSaveError("");

    if (section === "dm") {
      const res = await fetch("/api/admin/dm-import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed) });
      const data = await res.json();
      if (!data.ok || data.errors?.length) { setSaveError(data.errors?.[0] ?? data.error ?? "Import failed"); setSaving(false); return; }
    } else {
      for (const item of parsed) {
        const payload = toPassagePayload(section, item);
        const res = await fetch("/api/admin/passage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (data.error) { setSaveError(data.error); setSaving(false); return; }
      }
    }

    setDone(true); setSaving(false);
    setText(""); setResult(null); setParsed(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <textarea value={text} onChange={e => { setText(e.target.value); setResult(null); setParsed(null); setDone(false); }} rows={16} placeholder={`Paste your ${section.toUpperCase()} JSON array here…\n\nFormat: [ { ... }, { ... }, ... ]`} style={{ width: "100%", border: "1.5px solid #e5e9f0", borderRadius: 10, padding: "12px 14px", fontSize: 12, lineHeight: 1.6, color: "#334354", resize: "vertical", background: "white", boxSizing: "border-box", fontFamily: "monospace" }} />

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={validate} disabled={!text.trim()} style={{ border: `1.5px solid ${color}`, background: tint, color, borderRadius: 9, padding: "9px 20px", fontSize: 12, fontWeight: 800, cursor: "pointer", opacity: !text.trim() ? 0.4 : 1 }}>Validate JSON</button>

        {result && (
          <span style={{ fontSize: 12, fontWeight: 700, color: result.ok ? "#3dbe6c" : "#ff6b5c" }}>
            {result.ok ? `✓ Valid — ${result.count} question${result.count !== 1 ? "s" : ""} found` : `✗ ${result.errors[0]}${result.errors.length > 1 ? ` (+${result.errors.length - 1} more)` : ""}`}
          </span>
        )}

        <div style={{ flex: 1 }} />
        {saveError && <span style={{ fontSize: 11, color: "#ff6b5c" }}>{saveError}</span>}
        {done && <span style={{ fontSize: 12, color: "#3dbe6c", fontWeight: 700 }}>✓ All saved!</span>}
        <button onClick={handleSave} disabled={!result?.ok || saving || done} style={{ border: 0, background: color, color: "white", borderRadius: 9, padding: "9px 22px", fontSize: 12, fontWeight: 800, cursor: "pointer", opacity: (!result?.ok || saving || done) ? 0.4 : 1 }}>
          {saving ? "Saving…" : `Import ${result?.ok ? result.count : ""} question${result?.count !== 1 ? "s" : ""}`}
        </button>
      </div>

      {result && !result.ok && result.errors.length > 1 && (
        <div style={{ background: "#fff5f5", border: "1px solid #ffd0cc", borderRadius: 8, padding: "10px 14px" }}>
          {result.errors.slice(0, 8).map((e, i) => <p key={i} style={{ margin: "0 0 3px", fontSize: 11, color: "#c0392b" }}>• {e}</p>)}
          {result.errors.length > 8 && <p style={{ margin: 0, fontSize: 11, color: "#c0392b" }}>…and {result.errors.length - 8} more</p>}
        </div>
      )}
    </div>
  );
}

export function BulkImport() {
  const [section, setSection] = useState<string>("vr");
  const sections = ["vr","dm","qr","sjt"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 22 }}>
        <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 800, color: "#1a2535" }}>Bulk JSON Import</p>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "#6b7a8c" }}>Paste a JSON array of passages/questions. Validate first, then import. See the schema in the conversation for the correct format.</p>
        <div style={{ display: "flex", gap: 4, background: "#f5f7fb", borderRadius: 10, padding: 4, width: "fit-content", marginBottom: 20 }}>
          {sections.map(s => (
            <button key={s} onClick={() => setSection(s)} style={{ border: 0, borderRadius: 7, padding: "7px 18px", cursor: "pointer", background: section === s ? COLORS[s] : "transparent", color: section === s ? "white" : "#6b7a8c", fontWeight: section === s ? 800 : 600, fontSize: 12, transition: "all .15s" }}>{s.toUpperCase()}</button>
          ))}
        </div>
        <SectionImport key={section} section={section} />
      </div>
    </div>
  );
}
