"use client";
import { useState } from "react";
import { ChartBuilder } from "./ChartBuilder";
import type { ChartData } from "./ChartBuilder";

const SUBTYPES = ["Data Interpretation","Percentages","Fractions & Decimals","Ratios","Rates & Measurements","Speed Distance Time","Algebra","Geometry","Currency & Finance","Probability"];
const DIFFS = ["Bronze","Silver","Gold","Diamond"];
const GREEN = "#3DBE6C", TINT = "#EDFBF3";

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

type QRQ = { id: number; subtype: string; difficulty: string; questionText: string; options: string[]; correct: string; explanations: Record<string, string> };
let _qid = 0;
function mkQ(): QRQ { return { id: ++_qid, subtype: SUBTYPES[0], difficulty: "Silver", questionText: "", options: ["","","",""], correct: "A", explanations: { A: "", B: "", C: "", D: "" } }; }

export function CreateQR({ onSaved }: { onSaved: () => void }) {
  const [context, setContext] = useState("");
  const [chart, setChart] = useState<ChartData | null>(null);
  const [questions, setQuestions] = useState<QRQ[]>([mkQ()]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function updQ(id: number, patch: Partial<QRQ>) { setQuestions(qs => qs.map(q => q.id === id ? { ...q, ...patch } : q)); }
  function setOpt(id: number, i: number, v: string) {
    const q = questions.find(x => x.id === id)!;
    const options = [...q.options]; options[i] = v;
    updQ(id, { options });
  }

  async function handleSave() {
    if (!context.trim() || questions.some(q => !q.questionText.trim())) { setError("Fill in the context and all question texts."); return; }
    setSaving(true); setError("");
    const res = await fetch("/api/admin/passage", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "qr", content: context, chart, questions: questions.map((q, i) => ({ q_type: "mcq", subtype: q.subtype, difficulty: q.difficulty, question_text: q.questionText, options: q.options, correct: q.correct, explanations: q.explanations, sort_order: i })) }),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); setSaving(false); return; }
    setSaved(true); setSaving(false);
    setContext(""); setChart(null); setQuestions([mkQ()]); setTimeout(() => { setSaved(false); onSaved(); }, 1500);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={lbl(GREEN)}>CONTEXT / SCENARIO</label>
          <textarea value={context} onChange={e => setContext(e.target.value)} rows={4} placeholder="Describe the data scenario (e.g. 'A shop sells three products…')" style={ta} />
        </div>
        <ChartBuilder value={chart} onChange={setChart} />
      </div>

      {questions.map((q, qi) => (
        <div key={q.id} style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#1a2535" }}>Question {qi + 1}</span>
            {questions.length > 1 && <button onClick={() => setQuestions(qs => qs.filter(x => x.id !== q.id))} style={{ border: 0, background: "none", color: "#ff6b5c", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✕ Remove</button>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl(GREEN)}>SUBTYPE</label>
              <select value={q.subtype} onChange={e => updQ(q.id, { subtype: e.target.value })} style={{ width: "100%", border: "1.5px solid #e5e9f0", borderRadius: 9, padding: "8px 11px", fontSize: 12, background: "white", color: "#1a2535" }}>
                {SUBTYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl(GREEN)}>DIFFICULTY</label>
              <DiffPills value={q.difficulty} onChange={v => updQ(q.id, { difficulty: v })} />
            </div>
          </div>
          <div>
            <label style={lbl(GREEN)}>QUESTION</label>
            <textarea value={q.questionText} onChange={e => updQ(q.id, { questionText: e.target.value })} rows={2} placeholder="What was the percentage increase?" style={ta} />
          </div>
          <div>
            <label style={lbl(GREEN)}>ANSWERS — click letter to mark correct</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {q.options.map((opt, i) => {
                const key = String.fromCharCode(65 + i); const isCor = q.correct === key;
                return (
                  <div key={i}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <button onClick={() => updQ(q.id, { correct: key })} style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0, border: isCor ? `2px solid ${GREEN}` : "1.5px solid #dce2ea", background: isCor ? TINT : "white", color: isCor ? GREEN : "#9ba6b5", fontWeight: 850, fontSize: 11, cursor: "pointer" }}>{key}</button>
                      <input value={opt} onChange={e => setOpt(q.id, i, e.target.value)} placeholder={`Option ${key}`} style={{ flex: 1, border: isCor ? `1.5px solid ${GREEN}` : "1.5px solid #e5e9f0", background: isCor ? TINT : "white", borderRadius: 8, padding: "8px 11px", fontSize: 13, color: "#1a2535", outline: "none" }} />
                    </div>
                    <textarea value={q.explanations[key] ?? ""} onChange={e => updQ(q.id, { explanations: { ...q.explanations, [key]: e.target.value } })} rows={2} placeholder={`Why "${opt || key}" is ${isCor ? "correct" : "wrong"}…`} style={{ ...ta, fontSize: 12, marginLeft: 38, width: "calc(100% - 38px)" }} />
                  </div>
                );
              })}
            </div>
            <button onClick={() => { const k = String.fromCharCode(65 + q.options.length); setQuestions(qs => qs.map(x => x.id === q.id ? { ...x, options: [...x.options, ""], explanations: { ...x.explanations, [k]: "" } } : x)); }} style={{ marginTop: 8, border: "1.5px dashed #dce2ea", background: "none", borderRadius: 8, padding: "5px 13px", fontSize: 11, color: "#9ba6b5", cursor: "pointer" }}>+ Add option</button>
          </div>
        </div>
      ))}

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={() => setQuestions(qs => [...qs, mkQ()])} style={{ border: `1.5px dashed ${GREEN}`, background: "none", borderRadius: 10, padding: "9px 18px", fontSize: 12, fontWeight: 700, color: GREEN, cursor: "pointer" }}>+ Add question</button>
        <div style={{ flex: 1 }} />
        {error && <span style={{ fontSize: 12, color: "#ff6b5c" }}>{error}</span>}
        {saved && <span style={{ fontSize: 12, color: "#3dbe6c", fontWeight: 700 }}>✓ Saved!</span>}
        <button onClick={handleSave} disabled={saving} style={{ border: 0, background: GREEN, color: "white", borderRadius: 9, padding: "10px 24px", fontSize: 12, fontWeight: 800, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : `Save context + ${questions.length} question${questions.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}
