"use client";
import { useState } from "react";
import { VennBuilder } from "./VennBuilder";
import type { VennData } from "./VennBuilder";

const SUBTYPES = ["Syllogisms","Interpreting Information","Arguments & Assumptions","Logic Puzzles","Venn Diagrams","Probability & Statistics"];
const DIFFS = ["Bronze","Silver","Gold","Diamond"];
const PURPLE = "#8B6BFF", TINT = "#F1ECFF";

const ta: React.CSSProperties = { width: "100%", border: "1.5px solid #e5e9f0", borderRadius: 10, padding: "10px 13px", fontSize: 13, lineHeight: 1.6, color: "#334354", resize: "vertical", background: "white", boxSizing: "border-box" };
const lbl = (c: string): React.CSSProperties => ({ display: "block", fontSize: 10, fontWeight: 850, color: c, letterSpacing: ".1em", marginBottom: 6 });

function DiffPills({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const cols: Record<string, { bg: string; border: string; text: string }> = {
    Bronze: { bg: "#fff3eb", border: "#eab994", text: "#a95c2e" },
    Silver: { bg: "#f1f4f7", border: "#bac4cf", text: "#5e6b78" },
    Gold:   { bg: "#fff8df", border: "#ebcb66", text: "#9b7000" },
    Diamond:{ bg: "#f3f0ff", border: "#b8a9f5", text: "#5b3fd4" },
  };
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {DIFFS.map(d => { const c = cols[d]; const on = value === d; return <button key={d} onClick={() => onChange(d)} style={{ border: `1.5px solid ${on ? c.border : "#e5e9f0"}`, background: on ? c.bg : "white", color: on ? c.text : "#9ba6b5", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 750, cursor: "pointer" }}>{d}</button>; })}
    </div>
  );
}

type Statement = { id: number; text: string; correct: "Yes" | "No"; explanation: string };
let _sid = 0;
function mkS(): Statement { return { id: ++_sid, text: "", correct: "Yes", explanation: "" }; }

function YN5Form({ onSaved }: { onSaved: () => void }) {
  const [subtype, setSubtype] = useState(SUBTYPES[0]);
  const [difficulty, setDifficulty] = useState("Silver");
  const [stimulus, setStimulus] = useState("");
  const [statements, setStatements] = useState<Statement[]>([mkS(), mkS(), mkS(), mkS(), mkS()]);
  const [venn, setVenn] = useState<VennData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function updS(id: number, patch: Partial<Statement>) { setStatements(ss => ss.map(s => s.id === id ? { ...s, ...patch } : s)); }

  async function handleSave() {
    if (!stimulus.trim() || statements.some(s => !s.text.trim())) { setError("Fill in the stimulus and all 5 statements."); return; }
    setSaving(true); setError("");
    const res = await fetch("/api/admin/passage", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: "dm", content: stimulus,
        questions: [{ q_type: "yn5", subtype, difficulty, question_text: "Yes/No block", options: ["Yes","No"], correct: "set", explanations: Object.fromEntries(statements.map((s, i) => [String(i), s.explanation])), venn, statements: statements.map((s, i) => ({ text: s.text, correct: s.correct, explanation: s.explanation, sort_order: i })) }],
      }),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); setSaving(false); return; }
    setSaved(true); setSaving(false);
    setStimulus(""); setStatements([mkS(), mkS(), mkS(), mkS(), mkS()]); setVenn(null);
    setTimeout(() => { setSaved(false); onSaved(); }, 1500);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 22 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <label style={lbl(PURPLE)}>SUBTYPE</label>
            <select value={subtype} onChange={e => setSubtype(e.target.value)} style={{ width: "100%", border: "1.5px solid #e5e9f0", borderRadius: 9, padding: "8px 11px", fontSize: 12, background: "white", color: "#1a2535" }}>
              {SUBTYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl(PURPLE)}>DIFFICULTY (whole block)</label>
            <DiffPills value={difficulty} onChange={setDifficulty} />
          </div>
        </div>
        <label style={lbl(PURPLE)}>STIMULUS / RULES</label>
        <textarea value={stimulus} onChange={e => setStimulus(e.target.value)} rows={5} placeholder="Paste the rules or scenario text here…" style={ta} />
      </div>

      <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 22 }}>
        <label style={lbl(PURPLE)}>5 YES / NO STATEMENTS</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {statements.map((s, i) => (
            <div key={s.id} style={{ border: "1.5px solid #e5e9f0", borderRadius: 10, padding: 14 }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 800, color: "#6b7a8c" }}>Statement {i + 1}</p>
              <textarea value={s.text} onChange={e => updS(s.id, { text: e.target.value })} rows={2} placeholder={`Statement ${i + 1} text…`} style={{ ...ta, marginBottom: 8 }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7a8c", alignSelf: "center" }}>Correct answer:</span>
                {(["Yes","No"] as const).map(opt => (
                  <button key={opt} onClick={() => updS(s.id, { correct: opt })} style={{ border: "1.5px solid", borderColor: s.correct === opt ? PURPLE : "#e5e9f0", background: s.correct === opt ? TINT : "white", color: s.correct === opt ? PURPLE : "#6b7a8c", borderRadius: 8, padding: "5px 16px", fontSize: 12, fontWeight: 750, cursor: "pointer" }}>{opt}</button>
                ))}
              </div>
              <textarea value={s.explanation} onChange={e => updS(s.id, { explanation: e.target.value })} rows={2} placeholder={`Why the answer is ${s.correct}…`} style={{ ...ta, fontSize: 12 }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 22 }}>
        <label style={lbl(PURPLE)}>VENN DIAGRAM (shown in explanation after answering)</label>
        <VennBuilder value={venn} onChange={setVenn} />
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ flex: 1 }} />
        {error && <span style={{ fontSize: 12, color: "#ff6b5c" }}>{error}</span>}
        {saved && <span style={{ fontSize: 12, color: "#3dbe6c", fontWeight: 700 }}>✓ Saved!</span>}
        <button onClick={handleSave} disabled={saving} style={{ border: 0, background: PURPLE, color: "white", borderRadius: 9, padding: "10px 24px", fontSize: 12, fontWeight: 800, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : "Save YN-5 block"}
        </button>
      </div>
    </div>
  );
}

type MCQData = { id: number; subtype: string; difficulty: string; context: string; questionText: string; options: string[]; correct: string; explanations: Record<string, string>; venn: VennData | null };
let _mid = 0;
function mkMCQ(): MCQData { return { id: ++_mid, subtype: SUBTYPES[0], difficulty: "Silver", context: "", questionText: "", options: ["","","",""], correct: "A", explanations: { A: "", B: "", C: "", D: "" }, venn: null }; }

function MCQForm({ onSaved }: { onSaved: () => void }) {
  const [questions, setQuestions] = useState<MCQData[]>([mkMCQ()]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function updQ(id: number, patch: Partial<MCQData>) { setQuestions(qs => qs.map(q => q.id === id ? { ...q, ...patch } : q)); }
  function setOpt(id: number, i: number, v: string) {
    const q = questions.find(x => x.id === id)!;
    const options = [...q.options]; options[i] = v;
    updQ(id, { options });
  }

  async function handleSave() {
    if (questions.some(q => !q.context.trim() || !q.questionText.trim())) { setError("Fill in the context and question text for every question."); return; }
    setSaving(true); setError("");
    for (const q of questions) {
      await fetch("/api/admin/passage", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "dm", content: q.context, questions: [{ q_type: "mcq", subtype: q.subtype, difficulty: q.difficulty, question_text: q.questionText, options: q.options, correct: q.correct, explanations: q.explanations, venn: q.venn, sort_order: 0 }] }),
      });
    }
    setSaved(true); setSaving(false);
    setQuestions([mkMCQ()]); setTimeout(() => { setSaved(false); onSaved(); }, 1500);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {questions.map((q, qi) => (
        <div key={q.id} style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#1a2535" }}>Question {qi + 1}</span>
            {questions.length > 1 && <button onClick={() => setQuestions(qs => qs.filter(x => x.id !== q.id))} style={{ border: 0, background: "none", color: "#ff6b5c", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✕ Remove</button>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl(PURPLE)}>SUBTYPE</label>
              <select value={q.subtype} onChange={e => updQ(q.id, { subtype: e.target.value })} style={{ width: "100%", border: "1.5px solid #e5e9f0", borderRadius: 9, padding: "8px 11px", fontSize: 12, background: "white", color: "#1a2535" }}>
                {SUBTYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl(PURPLE)}>DIFFICULTY</label>
              <DiffPills value={q.difficulty} onChange={v => updQ(q.id, { difficulty: v })} />
            </div>
          </div>
          <div>
            <label style={lbl(PURPLE)}>CONTEXT / SCENARIO</label>
            <textarea value={q.context} onChange={e => updQ(q.id, { context: e.target.value })} rows={4} placeholder="Scenario or data for this question…" style={ta} />
          </div>
          <div>
            <label style={lbl(PURPLE)}>QUESTION</label>
            <textarea value={q.questionText} onChange={e => updQ(q.id, { questionText: e.target.value })} rows={2} placeholder="Which conclusion follows?" style={ta} />
          </div>
          <div>
            <label style={lbl(PURPLE)}>ANSWERS — click letter to mark correct</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {q.options.map((opt, i) => {
                const key = String.fromCharCode(65 + i); const isCor = q.correct === key;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <button onClick={() => updQ(q.id, { correct: key })} style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0, border: isCor ? `2px solid ${PURPLE}` : "1.5px solid #dce2ea", background: isCor ? TINT : "white", color: isCor ? PURPLE : "#9ba6b5", fontWeight: 850, fontSize: 11, cursor: "pointer" }}>{key}</button>
                      <input value={opt} onChange={e => setOpt(q.id, i, e.target.value)} placeholder={`Option ${key}`} style={{ flex: 1, border: isCor ? `1.5px solid ${PURPLE}` : "1.5px solid #e5e9f0", background: isCor ? TINT : "white", borderRadius: 8, padding: "8px 11px", fontSize: 13, color: "#1a2535", outline: "none" }} />
                    </div>
                    <textarea value={q.explanations[key] ?? ""} onChange={e => updQ(q.id, { explanations: { ...q.explanations, [key]: e.target.value } })} rows={2} placeholder={`Why "${opt || key}" is ${isCor ? "correct" : "wrong"}…`} style={{ ...ta, fontSize: 12, marginLeft: 38, width: "calc(100% - 38px)" }} />
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <label style={lbl(PURPLE)}>VENN DIAGRAM (shown in explanation after answering)</label>
            <VennBuilder value={q.venn} onChange={v => updQ(q.id, { venn: v })} />
          </div>
        </div>
      ))}

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={() => setQuestions(qs => [...qs, mkMCQ()])} style={{ border: "1.5px dashed #8B6BFF", background: "none", borderRadius: 10, padding: "9px 18px", fontSize: 12, fontWeight: 700, color: PURPLE, cursor: "pointer" }}>+ Add question</button>
        <div style={{ flex: 1 }} />
        {error && <span style={{ fontSize: 12, color: "#ff6b5c" }}>{error}</span>}
        {saved && <span style={{ fontSize: 12, color: "#3dbe6c", fontWeight: 700 }}>✓ Saved!</span>}
        <button onClick={handleSave} disabled={saving} style={{ border: 0, background: PURPLE, color: "white", borderRadius: 9, padding: "10px 24px", fontSize: 12, fontWeight: 800, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : `Save ${questions.length} MCQ question${questions.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}

export function CreateDM({ onSaved }: { onSaved: () => void }) {
  const [format, setFormat] = useState<"yn5" | "mcq">("yn5");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {(["yn5","mcq"] as const).map(f => (
          <button key={f} onClick={() => setFormat(f)} style={{ border: "1.5px solid", borderColor: format === f ? PURPLE : "#e5e9f0", background: format === f ? TINT : "white", color: format === f ? PURPLE : "#6b7a8c", borderRadius: 9, padding: "8px 20px", fontSize: 12, fontWeight: 750, cursor: "pointer" }}>
            {f === "yn5" ? "Yes / No Block (5 statements)" : "MCQ (single question)"}
          </button>
        ))}
      </div>
      {format === "yn5" ? <YN5Form onSaved={onSaved} /> : <MCQForm onSaved={onSaved} />}
    </div>
  );
}
