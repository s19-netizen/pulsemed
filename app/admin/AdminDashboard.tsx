"use client";
import { useState, useCallback, useEffect } from "react";
import type { VRPassage, QRDataset, SJTScenario, DMQuestion } from "@/lib/mock1Data";
import type { DiagQuestion } from "@/lib/diagnosticData";
import { CreateVR }  from "./CreateVR";
import { CreateDM }  from "./CreateDM";
import { CreateQR }  from "./CreateQR";
import { CreateSJT } from "./CreateSJT";

// ── Types ─────────────────────────────────────────────────────────────────────

type MockData    = { id: string; label: string; vr: VRPassage[]; dm: DMQuestion[]; qr: QRDataset[]; sjt: SJTScenario[] };
type EditTarget  = { mockId: string; section: string; questionId: string; question: any; context?: string; contextLabel?: string };
type PresentationType = "text" | "table" | "bar" | "line" | "pie";
type MainTab     = "mocks" | "diagnostic" | "practice";
type SubTab      = "edit" | "create";

// ── Constants ─────────────────────────────────────────────────────────────────

const COLORS: Record<string, string> = { vr: "#2D7FF9", dm: "#8B6BFF", qr: "#3DBE6C", sjt: "#FF6B5C" };
const TINTS:  Record<string, string> = { vr: "#EAF2FF", dm: "#F1ECFF", qr: "#EDFBF3", sjt: "#FFEDEA" };
const DIFFS = ["Bronze","Silver","Gold","Diamond"];
const PRESENTATION_OPTIONS: { key: PresentationType; label: string; icon: string }[] = [
  { key: "text", label: "Text", icon: "≡" }, { key: "table", label: "Table", icon: "⊞" },
  { key: "bar",  label: "Bar",  icon: "▐" }, { key: "line",  label: "Line",  icon: "∿" },
  { key: "pie",  label: "Pie",  icon: "◔" },
];

// ── Style helpers ─────────────────────────────────────────────────────────────

const ta: React.CSSProperties = { width: "100%", border: "1.5px solid #e5e9f0", borderRadius: 10, padding: "11px 13px", fontSize: 13, lineHeight: 1.65, color: "#334354", resize: "vertical", background: "white", boxSizing: "border-box" };
const lbl = (c: string): React.CSSProperties => ({ display: "block", fontSize: 10, fontWeight: 850, color: c, letterSpacing: ".1em", marginBottom: 7 });
const ghost: React.CSSProperties = { border: "1.5px solid #e5e9f0", background: "white", borderRadius: 9, padding: "9px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#6b7a8c" };
const primary = (c: string): React.CSSProperties => ({ border: 0, background: c, color: "white", borderRadius: 9, padding: "9px 22px", fontSize: 12, fontWeight: 800, cursor: "pointer" });

const qText    = (q: any) => q?.questionText ?? q?.question ?? q?.stem ?? q?.question_text ?? "";
const qOptions = (q: any): string[] => q?.options ?? q?.opts ?? [];
const qCorrect = (q: any): number => {
  const raw = q?.correct ?? q?.cor;
  if (typeof raw === "number") return raw;
  const opts = qOptions(q);
  if (typeof raw === "string") {
    // letter index: "A"→0, "B"→1 etc.
    const letter = raw.trim().toUpperCase();
    if (/^[A-E]$/.test(letter)) return "ABCDE".indexOf(letter);
    // TF text: "True"→0, "False"→1, "Can't Tell"→2
    if (letter === "TRUE") return 0;
    if (letter === "FALSE") return 1;
    if (letter.startsWith("CAN")) return 2;
    // fallback: find in options array
    const idx = opts.findIndex((o: string) => o.toLowerCase() === raw.toLowerCase());
    if (idx >= 0) return idx;
  }
  return 0;
};
const qExpl = (q: any): string => {
  if (q?.explanation) return q.explanation;
  // admin questions: explanations is an object keyed by option label
  if (q?.explanations && typeof q.explanations === "object") {
    const opts = qOptions(q);
    const correctIdx = qCorrect(q);
    const correctOpt = opts[correctIdx];
    // return correct answer explanation, then append others
    const entries = Object.entries(q.explanations as Record<string, string>);
    if (entries.length === 0) return "";
    const correctEntry = entries.find(([k]) => k === correctOpt || k === String(correctIdx));
    const others = entries.filter(([k]) => k !== correctOpt && k !== String(correctIdx));
    return [
      correctEntry ? `✓ ${correctEntry[0]}: ${correctEntry[1]}` : "",
      ...others.map(([k, v]) => `✗ ${k}: ${v}`),
    ].filter(Boolean).join("\n\n");
  }
  return "";
};
const qId      = (q: any): string => String(q?.id ?? "");

// ── Shared components ─────────────────────────────────────────────────────────

function SectionBadge({ section }: { section: string }) {
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 5, background: TINTS[section] ?? "#f5f7fb", color: COLORS[section] ?? "#6b7a8c", fontSize: 10, fontWeight: 850, letterSpacing: "0.06em" }}>{section.toUpperCase()}</span>;
}

function DiffPills({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const cols: Record<string, { bg: string; border: string; text: string }> = {
    Bronze: { bg: "#fff3eb", border: "#eab994", text: "#a95c2e" },
    Silver: { bg: "#f1f4f7", border: "#bac4cf", text: "#5e6b78" },
    Gold:   { bg: "#fff8df", border: "#ebcb66", text: "#9b7000" },
    Diamond:{ bg: "#f3f0ff", border: "#b8a9f5", text: "#5b3fd4" },
  };
  return (
    <div style={{ display: "flex", gap: 7 }}>
      {DIFFS.map(d => { const c = cols[d]; const on = value === d; return <button key={d} onClick={() => onChange(d)} style={{ border: `1.5px solid ${on ? c.border : "#e5e9f0"}`, background: on ? c.bg : "white", color: on ? c.text : "#9ba6b5", borderRadius: 8, padding: "6px 13px", fontSize: 11, fontWeight: 750, cursor: "pointer" }}>{d}</button>; })}
    </div>
  );
}

function Field({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return <div><label style={lbl(color)}>{label}</label>{children}</div>;
}

function QuestionCard({ q, section, onClick, saved, badge }: { q: any; section: string; onClick: () => void; saved: boolean; badge?: string }) {
  const text = qText(q);
  const opts = qOptions(q);
  const cor  = qCorrect(q);
  return (
    <button onClick={onClick} style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 12, padding: "13px 16px", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <SectionBadge section={section} />
        {badge && <span style={{ fontSize: 9, padding: "1px 6px", background: "#f5f7fb", color: "#9ba6b5", borderRadius: 4, fontWeight: 700 }}>{badge}</span>}
        <span style={{ fontSize: 10, color: "#9ba6b5" }}>{qId(q).slice(0, 24)}</span>
        {saved && <span style={{ marginLeft: "auto", fontSize: 10, color: "#3DBE6C", fontWeight: 700 }}>● saved</span>}
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "#1a2535", lineHeight: 1.45, fontWeight: 500 }}>{text.length > 110 ? text.slice(0, 110) + "…" : text}</p>
      {opts.length > 0 && (
        <div style={{ display: "flex", gap: 6 }}>
          {opts.slice(0, 4).map((opt: string, i: number) => <span key={i} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 5, background: i === cor ? "#EDFBF3" : "#f5f7fb", color: i === cor ? "#238A4B" : "#6b7a8c", fontWeight: i === cor ? 750 : 500 }}>{String.fromCharCode(65 + i)}</span>)}
        </div>
      )}
    </button>
  );
}

// ── Question editor panel ─────────────────────────────────────────────────────

function QuestionEditor({ target, onClose, onSaved }: { target: EditTarget; onClose: () => void; onSaved: (id: string) => void }) {
  const orig = target.question;
  const [questionText, setQuestionText] = useState(qText(orig));
  const [options,      setOptions]      = useState<string[]>([...qOptions(orig)]);
  const [correct,      setCorrect]      = useState(qCorrect(orig));
  const [explanation,  setExplanation]  = useState(qExpl(orig));
  const [context,      setContext]      = useState(target.context ?? "");
  const [presentation, setPresentation] = useState<PresentationType>("text");
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const color = COLORS[target.section] ?? "#2D7FF9";
  const tint  = TINTS[target.section]  ?? "#EAF2FF";

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/save", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: qId(orig), mockId: target.mockId, section: target.section, question: questionText, options, correct, explanation, context, presentation }),
    });
    setSaved(true); setSaving(false); onSaved(qId(orig));
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(10,20,40,.45)", display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "min(640px,100vw)", height: "100dvh", background: "#f8fafd", display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,.12)" }}>
        <div style={{ padding: "16px 22px", background: "white", borderBottom: "1px solid #e5e9f0", display: "flex", alignItems: "center", gap: 12 }}>
          <SectionBadge section={target.section} />
          <span style={{ fontSize: 11, color: "#9ba6b5", flex: 1 }}>{qId(orig)}</span>
          <button onClick={onClose} style={{ border: 0, background: "none", cursor: "pointer", fontSize: 18, color: "#9ba6b5" }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 20 }}>
          {target.context !== undefined && (
            <Field label={target.contextLabel ?? "CONTEXT"} color={color}>
              <textarea value={context} onChange={e => setContext(e.target.value)} rows={5} style={ta} />
            </Field>
          )}
          {target.section === "qr" && (
            <Field label="PRESENTATION" color={color}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PRESENTATION_OPTIONS.map(opt => (
                  <button key={opt.key} onClick={() => setPresentation(opt.key)} style={{ border: presentation === opt.key ? `2px solid ${color}` : "1.5px solid #e5e9f0", background: presentation === opt.key ? tint : "white", borderRadius: 10, padding: "9px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", minWidth: 70 }}>
                    <span style={{ fontSize: 18, color: presentation === opt.key ? color : "#9ba6b5" }}>{opt.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: presentation === opt.key ? color : "#6b7a8c" }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </Field>
          )}
          <Field label="QUESTION" color={color}>
            <textarea value={questionText} onChange={e => setQuestionText(e.target.value)} rows={3} style={{ ...ta, fontSize: 14, fontWeight: 500 }} />
          </Field>
          <Field label="ANSWER OPTIONS — click letter to mark correct" color={color}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {options.map((opt, idx) => {
                const isCor = correct === idx;
                const optKey = opt || String.fromCharCode(65 + idx);
                const perOptExpl: string = (orig?.explanations as any)?.[optKey] ?? (orig?.explanations as any)?.[String.fromCharCode(65 + idx)] ?? "";
                return (
                  <div key={idx} style={{ border: isCor ? `1.5px solid ${color}` : "1.5px solid #e5e9f0", borderRadius: 10, overflow: "hidden", background: isCor ? tint : "white" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px" }}>
                      <button onClick={() => setCorrect(idx)} style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, border: isCor ? `2px solid ${color}` : "1.5px solid #dce2ea", background: isCor ? color : "white", color: isCor ? "white" : "#9ba6b5", fontWeight: 850, fontSize: 11, cursor: "pointer" }}>{String.fromCharCode(65 + idx)}</button>
                      <input value={opt} onChange={e => { const n = [...options]; n[idx] = e.target.value; setOptions(n); }} style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: "#1a2535", outline: "none", fontWeight: isCor ? 700 : 400 }} />
                      {isCor && <span style={{ fontSize: 10, fontWeight: 800, color, whiteSpace: "nowrap" }}>✓ correct</span>}
                    </div>
                    {perOptExpl && (
                      <div style={{ padding: "0 10px 8px 46px", fontSize: 11, color: isCor ? "#2a6040" : "#6b7a8c", lineHeight: 1.5 }}>{perOptExpl}</div>
                    )}
                  </div>
                );
              })}
            </div>
            <button onClick={() => setOptions([...options, ""])} style={{ marginTop: 8, border: "1.5px dashed #dce2ea", background: "none", borderRadius: 8, padding: "6px 14px", fontSize: 11, color: "#9ba6b5", cursor: "pointer" }}>+ Add option</button>
          </Field>
          <Field label="EXPLANATION" color={color}>
            <textarea value={explanation} onChange={e => setExplanation(e.target.value)} rows={4} style={ta} placeholder="Overall explanation (or edit per-option above)" />
          </Field>
        </div>
        <div style={{ padding: "14px 22px", background: "white", borderTop: "1px solid #e5e9f0", display: "flex", gap: 10, alignItems: "center" }}>
          {saved && <span style={{ fontSize: 12, color: "#3DBE6C", fontWeight: 700 }}>✓ Saved</span>}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={ghost}>Close</button>
          <button onClick={handleSave} disabled={saving} style={{ ...primary(color), opacity: saving ? 0.6 : 1 }}>{saving ? "Saving…" : "Save changes"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Bulk import modal ─────────────────────────────────────────────────────────

const BULK_PARSERS: Record<string, (raw: any[]) => { count: number; errors: string[] }> = {
  vr: raw => { const errors: string[] = []; let count = 0; raw.forEach((item, i) => { if (!item.passage) errors.push(`Item ${i+1}: missing "passage"`); if (!Array.isArray(item.questions) || !item.questions.length) errors.push(`Item ${i+1}: missing "questions"`); else item.questions.forEach((q: any, j: number) => { if (!q.question) errors.push(`Item ${i+1} Q${j+1}: missing "question"`); else count++; }); }); return { count, errors }; },
  dm: raw => { const errors: string[] = []; let count = 0; raw.forEach((item, i) => { if (!item.type) { errors.push(`Item ${i+1}: missing "type"`); return; } if (item.type === "yn5") { if (!item.stimulus) errors.push(`Item ${i+1}: missing "stimulus"`); if (!Array.isArray(item.statements) || item.statements.length !== 5) errors.push(`Item ${i+1}: "statements" must be exactly 5`); count++; } else { if (!item.context) errors.push(`Item ${i+1}: missing "context"`); if (!item.question) errors.push(`Item ${i+1}: missing "question"`); count++; } }); return { count, errors }; },
  qr: raw => { const errors: string[] = []; let count = 0; raw.forEach((item, i) => { if (!item.context) errors.push(`Item ${i+1}: missing "context"`); if (!Array.isArray(item.questions) || !item.questions.length) errors.push(`Item ${i+1}: missing "questions"`); else item.questions.forEach((q: any, j: number) => { if (!q.question) errors.push(`Item ${i+1} Q${j+1}: missing "question"`); else count++; }); }); return { count, errors }; },
  sjt: raw => { const errors: string[] = []; let count = 0; raw.forEach((item, i) => { if (!item.scenario) errors.push(`Item ${i+1}: missing "scenario"`); if (!Array.isArray(item.questions) || !item.questions.length) errors.push(`Item ${i+1}: missing "questions"`); else item.questions.forEach((q: any, j: number) => { if (!q.type) errors.push(`Item ${i+1} Q${j+1}: missing "type"`); else count++; }); }); return { count, errors }; },
};

function toPayload(section: string, item: any): object {
  if (section === "vr") return {
    section: "vr",
    passage_code: item.passage_code ?? null,
    title: item.title ?? "",
    content: item.passage,
    questions: (item.questions ?? []).map((q: any, i: number) => {
      const fmt = (q.format ?? q.type ?? "tf").toUpperCase();
      const isTFCT = fmt === "TFCT" || fmt === "TF";
      return {
        vr_id: q.id ?? null,
        format: isTFCT ? "TFCT" : "MCQ",
        q_type: isTFCT ? "tf" : "mcq",
        primary_subtype: q.primary_subtype ?? q.subtype ?? "Direct Retrieval",
        subtype: q.primary_subtype ?? q.subtype ?? "Direct Retrieval",
        skill_focus: q.skill_focus ?? "",
        difficulty: q.difficulty ?? "Silver",
        question_text: q.question,
        option_a: isTFCT ? "True"       : (q.option_a ?? q.options?.[0] ?? ""),
        option_b: isTFCT ? "False"      : (q.option_b ?? q.options?.[1] ?? ""),
        option_c: isTFCT ? "Can't Tell" : (q.option_c ?? q.options?.[2] ?? null),
        option_d: isTFCT ? null         : (q.option_d ?? q.options?.[3] ?? null),
        options: isTFCT ? ["True", "False", "Can't Tell"] : (q.options ?? [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean)),
        correct: q.correct_answer ?? q.correct ?? "True",
        correct_answer: q.correct_answer ?? q.correct ?? "True",
        explanations: q.explanations ?? {},
        sort_order: i,
      };
    }),
  };
  if (section === "dm") {
    if (item.type === "yn5") return { section: "dm", content: item.stimulus, chart: item.chart ?? null, questions: [{ q_type: "yn5", subtype: item.subtype ?? "Interpreting Information", difficulty: item.difficulty ?? "Silver", question_text: "Yes/No block", options: ["Yes","No"], correct: "set", explanations: {}, venn: item.venn ?? null, statements: (item.statements ?? []).map((s: any, i: number) => ({ text: s.statement, correct: s.correct ?? "Yes", explanation: s.explanation ?? "", sort_order: i })) }] };
    return { section: "dm", content: item.context, chart: item.chart ?? null, questions: [{ q_type: "mcq", subtype: item.subtype ?? "Syllogisms", difficulty: item.difficulty ?? "Silver", question_text: item.question, options: item.options ?? [], correct: item.correct ?? "A", explanations: item.explanations ?? {}, venn: item.venn ?? null, sort_order: 0 }] };
  }
  if (section === "qr") return { section: "qr", content: item.context, chart: item.chart ?? null, questions: (item.questions ?? []).map((q: any, i: number) => ({ q_type: "mcq", subtype: q.subtype ?? "Data Interpretation", difficulty: q.difficulty ?? "Silver", question_text: q.question, options: q.options ?? [], correct: q.correct ?? "A", explanations: q.explanations ?? {}, sort_order: i })) };
  return { section: "sjt", content: item.scenario, questions: (item.questions ?? []).map((q: any, i: number) => q.type === "mostleast" ? { q_type: "mostleast", subtype: q.subtype ?? "Patient Safety", difficulty: q.difficulty ?? "Silver", question_text: "mostleast", options: q.actions ?? [], correct: JSON.stringify({ most: q.most ?? 0, least: q.least ?? 1 }), explanations: {}, sort_order: i } : { q_type: q.type, subtype: q.subtype ?? "Patient Safety", difficulty: q.difficulty ?? "Silver", question_text: q.type, options: (q.items ?? []).map((it: any) => it.action ?? it.factor ?? ""), correct: JSON.stringify(Object.fromEntries((q.items ?? []).map((it: any, j: number) => [j, it.correct ?? "A"]))), explanations: {}, sort_order: i }) };
}

function BulkModal({ section, onClose }: { section: string; onClose: () => void }) {
  const [activeSection, setActiveSection] = useState(section);
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ ok: boolean; count: number; errors: string[] } | null>(null);
  const [parsed, setParsed] = useState<any[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const color = COLORS[activeSection];

  function validate() {
    setResult(null); setParsed(null); setDone(false);
    let raw: any[];
    try { raw = JSON.parse(text); } catch { setResult({ ok: false, count: 0, errors: ["Invalid JSON — check brackets and commas."] }); return; }
    if (!Array.isArray(raw)) { setResult({ ok: false, count: 0, errors: ["Must be a JSON array [ ... ]"] }); return; }
    const { count, errors } = BULK_PARSERS[activeSection](raw);
    setResult({ ok: errors.length === 0, count, errors });
    if (errors.length === 0) setParsed(raw);
  }

  async function handleSave() {
    if (!parsed) return;
    setSaving(true);
    for (const item of parsed) {
      const res = await fetch("/api/admin/passage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(toPayload(activeSection, item)) });
      const data = await res.json();
      if (data.error) { setResult({ ok: false, count: 0, errors: [data.error] }); setSaving(false); return; }
    }
    setDone(true); setSaving(false);
  }

  function switchSection(s: string) { setActiveSection(s); setText(""); setResult(null); setParsed(null); setDone(false); }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(10,20,40,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "white", borderRadius: 16, width: "min(680px, 100%)", maxHeight: "90dvh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,.18)" }}>
        {/* Header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #e5e9f0", display: "flex", alignItems: "center", gap: 14 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1a2535", flex: 1 }}>Bulk JSON Import</p>
          <div style={{ display: "flex", gap: 3, background: "#f5f7fb", borderRadius: 9, padding: 3 }}>
            {["vr","dm","qr","sjt"].map(s => (
              <button key={s} onClick={() => switchSection(s)} style={{ border: 0, borderRadius: 6, padding: "5px 14px", cursor: "pointer", background: activeSection === s ? COLORS[s] : "transparent", color: activeSection === s ? "white" : "#6b7a8c", fontWeight: activeSection === s ? 800 : 600, fontSize: 11, transition: "all .12s" }}>{s.toUpperCase()}</button>
            ))}
          </div>
          <button onClick={onClose} style={{ border: 0, background: "none", fontSize: 18, color: "#9ba6b5", cursor: "pointer" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#6b7a8c" }}>Paste a JSON array of {activeSection.toUpperCase()} passages/questions. Validate first, then import.</p>
          <textarea value={text} onChange={e => { setText(e.target.value); setResult(null); setParsed(null); setDone(false); }} rows={14} placeholder={`[ { ... }, { ... } ]`} style={{ ...ta, fontFamily: "monospace", fontSize: 12 }} />

          {result && !result.ok && result.errors.length > 0 && (
            <div style={{ background: "#fff5f5", border: "1px solid #ffd0cc", borderRadius: 8, padding: "10px 14px" }}>
              {result.errors.slice(0, 6).map((e, i) => <p key={i} style={{ margin: "0 0 2px", fontSize: 11, color: "#c0392b" }}>• {e}</p>)}
              {result.errors.length > 6 && <p style={{ margin: 0, fontSize: 11, color: "#c0392b" }}>…and {result.errors.length - 6} more</p>}
            </div>
          )}
          {done && <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#3dbe6c" }}>✓ All imported successfully!</p>}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid #e5e9f0", display: "flex", gap: 10, alignItems: "center" }}>
          {result?.ok && <span style={{ fontSize: 12, fontWeight: 700, color: "#3dbe6c" }}>✓ {result.count} question{result.count !== 1 ? "s" : ""} ready</span>}
          {result && !result.ok && <span style={{ fontSize: 12, color: "#ff6b5c", fontWeight: 700 }}>Fix errors above</span>}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={ghost}>Close</button>
          <button onClick={validate} disabled={!text.trim()} style={{ border: `1.5px solid ${color}`, background: TINTS[activeSection], color, borderRadius: 9, padding: "9px 18px", fontSize: 12, fontWeight: 800, cursor: "pointer", opacity: !text.trim() ? 0.4 : 1 }}>Validate</button>
          <button onClick={handleSave} disabled={!result?.ok || saving || done} style={{ ...primary(color), opacity: (!result?.ok || saving || done) ? 0.4 : 1 }}>{saving ? "Saving…" : "Import"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Mocks — Edit ──────────────────────────────────────────────────────────────

function MocksEdit({ mocks, savedIds, onEdit }: { mocks: MockData[]; savedIds: Set<string>; onEdit: (t: EditTarget) => void }) {
  const [openMock, setOpenMock] = useState<string | null>(mocks[0]?.id ?? null);
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ margin: 0, fontSize: 13, color: "#6b7a8c" }}>Click a mock to expand, then a section, then a question to edit it.</p>
      {mocks.map(mock => (
        <div key={mock.id} style={{ border: "1px solid #e5e9f0", borderRadius: 14, overflow: "hidden", background: "white" }}>
          <button onClick={() => setOpenMock(prev => prev === mock.id ? null : mock.id)} style={{ width: "100%", padding: "14px 18px", border: 0, background: openMock === mock.id ? "#f8fafd" : "white", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 10, borderBottom: openMock === mock.id ? "1px solid #e5e9f0" : "none" }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#1a2535", flex: 1 }}>{mock.label}</span>
            <span style={{ fontSize: 12, color: "#9ba6b5" }}>{openMock === mock.id ? "▴" : "▾"}</span>
          </button>
          {openMock === mock.id && (
            <div>
              <div style={{ display: "flex", borderBottom: "1px solid #e5e9f0" }}>
                {[{ key: "vr", count: mock.vr.reduce((s, p) => s + p.questions.length, 0) }, { key: "dm", count: mock.dm.length }, { key: "qr", count: mock.qr.reduce((s, d) => s + d.questions.length, 0) }, { key: "sjt", count: mock.sjt.reduce((s, sc) => s + sc.questions.length, 0) }].map(s => (
                  <button key={s.key} onClick={() => setOpenSection(prev => prev === s.key ? null : s.key)} style={{ flex: 1, padding: "10px 8px", border: 0, background: "none", cursor: "pointer", borderBottom: openSection === s.key ? `2.5px solid ${COLORS[s.key]}` : "2.5px solid transparent", color: openSection === s.key ? COLORS[s.key] : "#6b7a8c", fontWeight: openSection === s.key ? 800 : 600, fontSize: 11 }}>
                    <span style={{ display: "block", fontWeight: 850, fontSize: 13 }}>{s.key.toUpperCase()}</span>
                    <span style={{ fontSize: 9, opacity: 0.7 }}>{s.count} q</span>
                  </button>
                ))}
              </div>
              {openSection && (
                <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8, maxHeight: 420, overflowY: "auto" }}>
                  {openSection === "vr"  && mock.vr.flatMap(p => p.questions.map(q => <QuestionCard key={q.id} q={q} section="vr" saved={savedIds.has(q.id)} onClick={() => onEdit({ mockId: mock.id, section: "vr", questionId: q.id, question: q, context: p.passageText, contextLabel: "PASSAGE" })} />))}
                  {openSection === "dm"  && mock.dm.map(q => <QuestionCard key={q.id} q={q} section="dm" saved={savedIds.has(q.id)} onClick={() => onEdit({ mockId: mock.id, section: "dm", questionId: q.id, question: q, context: q.context, contextLabel: (q as any).contextLabel ?? "CONTEXT" })} />)}
                  {openSection === "qr"  && mock.qr.flatMap(ds => ds.questions.map(q => <QuestionCard key={q.id} q={q} section="qr" saved={savedIds.has(q.id)} onClick={() => onEdit({ mockId: mock.id, section: "qr", questionId: q.id, question: q, context: ds.scenario, contextLabel: "DATA / SCENARIO" })} />))}
                  {openSection === "sjt" && mock.sjt.flatMap(sc => sc.questions.map(q => <QuestionCard key={q.id} q={q} section="sjt" saved={savedIds.has(q.id)} onClick={() => onEdit({ mockId: mock.id, section: "sjt", questionId: q.id, question: q, context: sc.scenarioText, contextLabel: "SCENARIO" })} />))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MocksCreate() {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  async function handleCreate() {
    if (!title.trim()) return;
    setSaving(true);
    await fetch("/api/admin/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "new_mock", title }) });
    setDone(true); setSaving(false); setTitle("");
    setTimeout(() => setDone(false), 2000);
  }
  return (
    <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 28, maxWidth: 480 }}>
      <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 800, color: "#1a2535" }}>New Mock Test</p>
      <p style={{ margin: "0 0 18px", fontSize: 12, color: "#9ba6b5" }}>Create the mock first, then add questions to it.</p>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Mock Test 3" style={{ width: "100%", border: "1.5px solid #e5e9f0", borderRadius: 9, padding: "10px 13px", fontSize: 14, color: "#1a2535", marginBottom: 14, boxSizing: "border-box" as const }} />
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {done && <span style={{ fontSize: 12, color: "#3dbe6c", fontWeight: 700 }}>✓ Created!</span>}
        <div style={{ flex: 1 }} />
        <button onClick={handleCreate} disabled={saving || !title.trim()} style={{ ...primary("#2D7FF9"), opacity: (!title.trim() || saving) ? 0.5 : 1 }}>{saving ? "Creating…" : "Create mock"}</button>
      </div>
    </div>
  );
}

// ── Diagnostic ────────────────────────────────────────────────────────────────

function DiagnosticEdit({ questions, savedIds, onEdit }: { questions: DiagQuestion[]; savedIds: Set<string>; onEdit: (t: EditTarget) => void }) {
  const [section, setSection] = useState("vr");
  const [search, setSearch] = useState("");
  const filtered = questions.filter(q => q.section === section && (!search || qText(q).toLowerCase().includes(search.toLowerCase())));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 3, background: "white", border: "1px solid #e5e9f0", borderRadius: 10, padding: 3 }}>
          {["vr","dm","qr","sjt"].map(s => <button key={s} onClick={() => setSection(s)} style={{ border: 0, borderRadius: 7, padding: "6px 16px", cursor: "pointer", background: section === s ? COLORS[s] : "transparent", color: section === s ? "white" : "#6b7a8c", fontWeight: section === s ? 800 : 600, fontSize: 12 }}>{s.toUpperCase()}</button>)}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ border: "1.5px solid #e5e9f0", borderRadius: 9, padding: "8px 13px", fontSize: 13, color: "#1a2535", outline: "none", width: 220 }} />
      </div>
      <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 18 }}>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "#6b7a8c" }}>{filtered.length} questions in {section.toUpperCase()}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 560, overflowY: "auto" }}>
          {filtered.map(q => <QuestionCard key={q.id} q={q} section={q.section} saved={savedIds.has(q.id)} onClick={() => onEdit({ mockId: "diagnostic", section: q.section, questionId: q.id, question: q })} />)}
        </div>
      </div>
    </div>
  );
}

// ── Practice — Edit (Library) ─────────────────────────────────────────────────

function groupByPassage(qs: any[], fallbackPrefix = "Passage"): { key: string; label: string; context: string; contextLabel: string; questions: any[] }[] {
  const map = new Map<string, { key: string; label: string; context: string; contextLabel: string; questions: any[] }>();
  let idx = 1;
  for (const q of qs) {
    const key = q.groupKey ?? q.passage_id ?? q.id;
    if (!map.has(key)) {
      const rawLabel = q.groupLabel ?? "";
      const label = rawLabel.length > 6 ? rawLabel : `${fallbackPrefix} ${idx++}`;
      map.set(key, { key, label, context: q.context ?? "", contextLabel: q.contextLabel ?? "CONTEXT", questions: [] });
    }
    map.get(key)!.questions.push(q);
  }
  return [...map.values()];
}

function PassageGroup({ group, section, savedIds, onEdit, source, color, index }: { group: { key: string; label: string; context: string; contextLabel: string; questions: any[] }; section: string; savedIds: Set<string>; onEdit: (t: EditTarget) => void; source: string; color: string; index: number }) {
  const [open, setOpen] = useState(false);
  const contextLabel = section === "vr" ? "PASSAGE" : section === "sjt" ? "SCENARIO" : "CONTEXT";
  const tint = TINTS[section] ?? "#f5f7fb";
  return (
    <div style={{ borderRadius: 12, border: `1.5px solid ${open ? color + "40" : "#e5e9f0"}`, overflow: "hidden", transition: "border-color .15s" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: open ? tint : "white", border: 0, cursor: "pointer", textAlign: "left" }}
      >
        <span style={{ minWidth: 26, height: 26, borderRadius: 8, background: open ? color : "#f0f2f5", color: open ? "white" : "#9ba6b5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{index + 1}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1a2535", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{group.label}</span>
        <span style={{ fontSize: 11, background: open ? color : "#f0f2f5", color: open ? "white" : "#9ba6b5", borderRadius: 6, padding: "3px 10px", fontWeight: 700, flexShrink: 0 }}>{group.questions.length} Q</span>
        <span style={{ fontSize: 12, color: open ? color : "#c5cdd8", flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ borderTop: `1.5px solid ${color}30`, padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 8, background: "#fafbfd" }}>
          {group.questions.map(q => (
            <QuestionCard key={q.id} q={q} section={section} saved={savedIds.has(q.id)} badge={q.subtype ?? q.q_type ?? undefined}
              onClick={() => onEdit({ mockId: source, section, questionId: q.id, question: q, context: group.context, contextLabel })} />
          ))}
        </div>
      )}
    </div>
  );
}

function PracticeEdit({ savedIds, onEdit }: { savedIds: Set<string>; onEdit: (t: EditTarget) => void }) {
  const [section, setSection] = useState("vr");
  const [search, setSearch] = useState("");
  const [adminQs, setAdminQs] = useState<any[]>([]);
  const [sourceQs, setSourceQs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillResult, setBackfillResult] = useState<{ updated: number; total: number } | null>(null);
  const color = COLORS[section];
  const sectionLabel = section === "vr" ? "Passage" : section === "sjt" ? "Scenario" : section === "qr" ? "Dataset" : "Stimulus";

  async function runChartBackfill() {
    setBackfilling(true); setBackfillResult(null);
    const endpoint = section === "qr" ? "/api/admin/qr-chart-backfill" : "/api/admin/dm-chart-backfill";
    const res = await fetch(endpoint, { method: "POST" });
    const data = await res.json();
    setBackfillResult({ updated: data.updated ?? 0, total: data.total ?? 0 });
    setBackfilling(false);
    load(section, search);
  }

  async function load(sec: string, q: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/library?section=${sec}&search=${encodeURIComponent(q)}&limit=500`);
    const data = await res.json();
    setAdminQs(data.adminQuestions ?? []);
    setSourceQs(data.sourceQuestions ?? []);
    setLoading(false);
  }

  useEffect(() => { load(section, ""); }, [section]);

  function handleSearch(e: React.FormEvent) { e.preventDefault(); load(section, search); }

  const adminGroups  = groupByPassage(
    adminQs.map(q => ({ ...q, groupKey: q.passage_id, groupLabel: (q.admin_passages as any)?.content?.slice(0, 60) ?? "", context: (q.admin_passages as any)?.content ?? "" })),
    `Admin ${sectionLabel}`
  );
  const sourceGroups = groupByPassage(sourceQs, sectionLabel);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 3, background: "white", border: "1px solid #e5e9f0", borderRadius: 10, padding: 3 }}>
          {["vr","dm","qr","sjt"].map(s => <button key={s} onClick={() => { setSection(s); setSearch(""); }} style={{ border: 0, borderRadius: 7, padding: "6px 16px", cursor: "pointer", background: section === s ? COLORS[s] : "transparent", color: section === s ? "white" : "#6b7a8c", fontWeight: section === s ? 800 : 600, fontSize: 12 }}>{s.toUpperCase()}</button>)}
        </div>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search question text…" style={{ border: "1.5px solid #e5e9f0", borderRadius: 9, padding: "8px 13px", fontSize: 13, color: "#1a2535", outline: "none", width: 240 }} />
          <button type="submit" style={{ ...primary(color), padding: "8px 16px", fontSize: 12 }}>Search</button>
          {search && <button type="button" onClick={() => { setSearch(""); load(section, ""); }} style={ghost}>Clear</button>}
        </form>
        {(section === "dm" || section === "qr") && (
          <button
            onClick={runChartBackfill}
            disabled={backfilling}
            style={{ border: `1.5px solid ${color}`, background: TINTS[section], color, borderRadius: 9, padding: "8px 16px", fontSize: 12, fontWeight: 800, cursor: backfilling ? "default" : "pointer", opacity: backfilling ? 0.6 : 1 }}
          >
            {backfilling ? "Generating charts…" : "⚡ Auto-generate charts"}
          </button>
        )}
        {backfillResult && (
          <span style={{ fontSize: 12, fontWeight: 700, color: backfillResult.updated > 0 ? "#3dbe6c" : "#9ba6b5" }}>
            {backfillResult.updated > 0 ? `✓ Added charts to ${backfillResult.updated} of ${backfillResult.total} questions` : "No chart data found in existing questions"}
          </span>
        )}
      </div>

      {loading && <p style={{ fontSize: 13, color: "#9ba6b5" }}>Loading…</p>}
      {!loading && adminQs.length === 0 && sourceQs.length === 0 && (
        <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 28, textAlign: "center" }}>
          <p style={{ color: "#9ba6b5", fontSize: 13, margin: 0 }}>No questions found{search ? ` for "${search}"` : ""}.</p>
        </div>
      )}

      {!loading && adminGroups.length > 0 && (
        <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 18 }}>
          <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 800, color }}> ADMIN-CREATED · {adminQs.length} questions · {adminGroups.length} {sectionLabel.toLowerCase()}s</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {adminGroups.map((g, i) => <PassageGroup key={g.key} group={g} section={section} savedIds={savedIds} onEdit={onEdit} source="admin" color={color} index={i} />)}
          </div>
        </div>
      )}

      {!loading && sourceGroups.length > 0 && (
        <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 18 }}>
          <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 800, color: "#6b7a8c" }}>SUPABASE · {sourceQs.length} questions · {sourceGroups.length} {sectionLabel.toLowerCase()}s</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sourceGroups.map((g, i) => <PassageGroup key={g.key} group={g} section={section} savedIds={savedIds} onEdit={onEdit} source="practice" color={color} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Practice — Create ─────────────────────────────────────────────────────────

function PracticeCreate() {
  const [section, setSection] = useState("vr");
  const [key, setKey] = useState(0);
  const [showBulk, setShowBulk] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 3, background: "white", border: "1px solid #e5e9f0", borderRadius: 10, padding: 3 }}>
          {["vr","dm","qr","sjt"].map(s => <button key={s} onClick={() => setSection(s)} style={{ border: 0, borderRadius: 7, padding: "7px 18px", cursor: "pointer", background: section === s ? COLORS[s] : "transparent", color: section === s ? "white" : "#6b7a8c", fontWeight: section === s ? 800 : 600, fontSize: 12, transition: "all .15s" }}>{s.toUpperCase()}</button>)}
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowBulk(true)} style={{ border: "1.5px solid #8B6BFF", background: "#F1ECFF", color: "#6747d8", borderRadius: 9, padding: "8px 18px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>⬇ Bulk Import</button>
      </div>
      <div key={`${section}-${key}`}>
        {section === "vr"  && <CreateVR  onSaved={() => setKey(k => k + 1)} />}
        {section === "dm"  && <CreateDM  onSaved={() => setKey(k => k + 1)} />}
        {section === "qr"  && <CreateQR  onSaved={() => setKey(k => k + 1)} />}
        {section === "sjt" && <CreateSJT onSaved={() => setKey(k => k + 1)} />}
      </div>
      {showBulk && <BulkModal section={section} onClose={() => setShowBulk(false)} />}
    </div>
  );
}

// ── Sub-tab bar ───────────────────────────────────────────────────────────────

function SubTabBar({ value, onChange }: { value: SubTab; onChange: (v: SubTab) => void }) {
  return (
    <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid #e5e9f0" }}>
      {(["edit","create"] as SubTab[]).map(t => (
        <button key={t} onClick={() => onChange(t)} style={{ border: 0, background: "none", padding: "10px 24px", cursor: "pointer", fontSize: 13, fontWeight: value === t ? 800 : 600, color: value === t ? "#1a2535" : "#6b7a8c", borderBottom: value === t ? "2.5px solid #1a2535" : "2.5px solid transparent", marginBottom: -2, transition: "all .15s", textTransform: "capitalize" }}>{t}</button>
      ))}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

export default function AdminDashboard({ mocks, dmBank, diagQuestions }: { mocks: MockData[]; dmBank: any[]; diagQuestions: DiagQuestion[] }) {
  const [tab,     setTab]     = useState<MainTab>("mocks");
  const [subTab,  setSubTab]  = useState<SubTab>("edit");
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const handleSaved = useCallback((id: string) => setSavedIds(prev => new Set([...prev, id])), []);

  function switchMain(t: MainTab) { setTab(t); setSubTab("edit"); }

  const MAIN_TABS: { key: MainTab; label: string }[] = [
    { key: "mocks",      label: "Mocks" },
    { key: "diagnostic", label: "Diagnostic" },
    { key: "practice",   label: "Practice" },
  ];

  const totalMockQ = mocks.reduce((s, m) =>
    s + m.vr.reduce((a, p) => a + p.questions.length, 0) + m.dm.length
      + m.qr.reduce((a, d) => a + d.questions.length, 0)
      + m.sjt.reduce((a, sc) => a + sc.questions.length, 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fb", fontFamily: "var(--font-inter, system-ui), sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e9f0", padding: "0 32px", display: "flex", alignItems: "center", gap: 18, minHeight: 60 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#2D7FF9" }}>
          <svg viewBox="0 0 48 32" style={{ width: 36, height: 24, fill: "none", stroke: "#2D7FF9", strokeWidth: 3.5, strokeLinecap: "round", strokeLinejoin: "round" }}><path d="M2 18h9l4-13 7 24 6-18 5 7h13" /></svg>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-.02em" }}>Pulsemed</span>
        </a>
        <span style={{ fontSize: 11, padding: "3px 10px", background: "#FFF8DF", color: "#9B7000", borderRadius: 6, fontWeight: 750, border: "1px solid #EBD56A" }}>Admin</span>
        <div style={{ flex: 1 }} />
        <a href="/" style={{ fontSize: 11, color: "#2D7FF9", textDecoration: "none", fontWeight: 700 }}>← Back to app</a>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Mock Tests",          value: mocks.length,         color: "#2D7FF9" },
            { label: "Mock Questions",       value: totalMockQ,           color: "#8B6BFF" },
            { label: "DM Practice Bank",     value: dmBank.length,        color: "#3DBE6C" },
            { label: "Diagnostic Questions", value: diagQuestions.length, color: "#FF6B5C" },
          ].map(card => (
            <div key={card.label} style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: "18px 22px" }}>
              <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 850, color: card.color, letterSpacing: ".08em" }}>{card.label.toUpperCase()}</p>
              <p style={{ margin: 0, fontSize: 32, fontWeight: 850, color: "#1a2535", lineHeight: 1 }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Main tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "white", border: "1px solid #e5e9f0", borderRadius: 11, padding: 4, width: "fit-content" }}>
          {MAIN_TABS.map(t => (
            <button key={t.key} onClick={() => switchMain(t.key)} style={{ border: 0, borderRadius: 8, padding: "8px 24px", cursor: "pointer", background: tab === t.key ? "#1a2535" : "transparent", color: tab === t.key ? "white" : "#6b7a8c", fontWeight: tab === t.key ? 800 : 600, fontSize: 13, transition: "all .15s" }}>{t.label}</button>
          ))}
        </div>

        {/* Sub-tab bar + content */}
        <SubTabBar value={subTab} onChange={setSubTab} />

        {tab === "mocks"      && subTab === "edit"   && <MocksEdit mocks={mocks} savedIds={savedIds} onEdit={setEditTarget} />}
        {tab === "mocks"      && subTab === "create"  && <MocksCreate />}
        {tab === "diagnostic" && subTab === "edit"   && <DiagnosticEdit questions={diagQuestions} savedIds={savedIds} onEdit={setEditTarget} />}
        {tab === "diagnostic" && subTab === "create"  && <PracticeCreate />}
        {tab === "practice"   && subTab === "edit"   && <PracticeEdit savedIds={savedIds} onEdit={setEditTarget} />}
        {tab === "practice"   && subTab === "create"  && <PracticeCreate />}
      </div>

      {editTarget && <QuestionEditor target={editTarget} onClose={() => setEditTarget(null)} onSaved={handleSaved} />}
    </div>
  );
}
