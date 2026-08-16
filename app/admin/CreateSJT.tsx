"use client";
import { useState } from "react";

const SUBTYPES = ["Patient Safety","Professionalism","Communication","Teamwork","Ethics & Consent","Prioritisation","Leadership","Wellbeing","Difficult Situations"];
const DIFFS = ["Bronze","Silver","Gold","Diamond"];
const CORAL = "#FF6B5C", TINT = "#FFEDEA";

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

const AR_SCALE = ["A — Very appropriate","B — Appropriate, not ideal","C — Inappropriate, not awful","D — Very inappropriate"];
const IR_SCALE = ["A — Very important","B — Important","C — Minor importance","D — Not important at all"];

type ARItem = { id: number; text: string; correct: string };
type IRItem = { id: number; text: string; correct: string };
type MLAction = { id: number; text: string };

type SJTQuestion =
  | { id: number; type: "appropriateness"; subtype: string; difficulty: string; items: ARItem[] }
  | { id: number; type: "importance"; subtype: string; difficulty: string; items: IRItem[] }
  | { id: number; type: "mostleast"; subtype: string; difficulty: string; actions: MLAction[]; most: number; least: number };

let _qid = 0; let _iid = 0;
function mkAR(): Extract<SJTQuestion, { type: "appropriateness" }> {
  return { id: ++_qid, type: "appropriateness", subtype: SUBTYPES[0], difficulty: "Silver", items: [{ id: ++_iid, text: "", correct: "A" }, { id: ++_iid, text: "", correct: "D" }] };
}
function mkIR(): Extract<SJTQuestion, { type: "importance" }> {
  return { id: ++_qid, type: "importance", subtype: SUBTYPES[0], difficulty: "Silver", items: [{ id: ++_iid, text: "", correct: "A" }, { id: ++_iid, text: "", correct: "D" }] };
}
function mkML(): Extract<SJTQuestion, { type: "mostleast" }> {
  return { id: ++_qid, type: "mostleast", subtype: SUBTYPES[0], difficulty: "Silver", actions: [{ id: ++_iid, text: "" }, { id: ++_iid, text: "" }, { id: ++_iid, text: "" }, { id: ++_iid, text: "" }, { id: ++_iid, text: "" }], most: 0, least: 4 };
}

function ARBlock({ q, onChange }: { q: Extract<SJTQuestion, { type: "appropriateness" }>; onChange: (q: SJTQuestion) => void }) {
  function updItem(id: number, patch: Partial<ARItem>) { onChange({ ...q, items: q.items.map(it => it.id === id ? { ...it, ...patch } : it) }); }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
        {AR_SCALE.map(s => <span key={s} style={{ fontSize: 10, padding: "2px 8px", background: "#fff3eb", color: "#a95c2e", borderRadius: 5, fontWeight: 700 }}>{s}</span>)}
      </div>
      {q.items.map((item, i) => (
        <div key={item.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ width: 20, fontSize: 12, color: "#6b7a8c", fontWeight: 700, paddingTop: 10, flexShrink: 0 }}>{i + 1}</span>
          <input value={item.text} onChange={e => updItem(item.id, { text: e.target.value })} placeholder="Action item…" style={{ flex: 1, border: "1.5px solid #e5e9f0", borderRadius: 8, padding: "8px 11px", fontSize: 13, color: "#1a2535", outline: "none" }} />
          <select value={item.correct} onChange={e => updItem(item.id, { correct: e.target.value })} style={{ border: "1.5px solid #e5e9f0", borderRadius: 8, padding: "8px 11px", fontSize: 11, background: "white", color: "#1a2535", flexShrink: 0 }}>
            {["A","B","C","D"].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <button onClick={() => onChange({ ...q, items: q.items.filter(it => it.id !== item.id) })} style={{ border: 0, background: "none", color: "#ff6b5c", cursor: "pointer", fontSize: 13, padding: "8px 4px", flexShrink: 0 }}>✕</button>
        </div>
      ))}
      <button onClick={() => onChange({ ...q, items: [...q.items, { id: ++_iid, text: "", correct: "B" }] })} style={{ border: "1.5px dashed #dce2ea", background: "none", borderRadius: 8, padding: "5px 13px", fontSize: 11, color: "#9ba6b5", cursor: "pointer", alignSelf: "flex-start" }}>+ Add action</button>
    </div>
  );
}

function IRBlock({ q, onChange }: { q: Extract<SJTQuestion, { type: "importance" }>; onChange: (q: SJTQuestion) => void }) {
  function updItem(id: number, patch: Partial<IRItem>) { onChange({ ...q, items: q.items.map(it => it.id === id ? { ...it, ...patch } : it) }); }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
        {IR_SCALE.map(s => <span key={s} style={{ fontSize: 10, padding: "2px 8px", background: "#edfbf3", color: "#238a4b", borderRadius: 5, fontWeight: 700 }}>{s}</span>)}
      </div>
      {q.items.map((item, i) => (
        <div key={item.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ width: 20, fontSize: 12, color: "#6b7a8c", fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
          <input value={item.text} onChange={e => updItem(item.id, { text: e.target.value })} placeholder="Factor to rate…" style={{ flex: 1, border: "1.5px solid #e5e9f0", borderRadius: 8, padding: "8px 11px", fontSize: 13, color: "#1a2535", outline: "none" }} />
          <select value={item.correct} onChange={e => updItem(item.id, { correct: e.target.value })} style={{ border: "1.5px solid #e5e9f0", borderRadius: 8, padding: "8px 11px", fontSize: 11, background: "white", color: "#1a2535", flexShrink: 0 }}>
            {["A","B","C","D"].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <button onClick={() => onChange({ ...q, items: q.items.filter(it => it.id !== item.id) })} style={{ border: 0, background: "none", color: "#ff6b5c", cursor: "pointer", fontSize: 13, padding: "0 4px", flexShrink: 0 }}>✕</button>
        </div>
      ))}
      <button onClick={() => onChange({ ...q, items: [...q.items, { id: ++_iid, text: "", correct: "B" }] })} style={{ border: "1.5px dashed #dce2ea", background: "none", borderRadius: 8, padding: "5px 13px", fontSize: 11, color: "#9ba6b5", cursor: "pointer", alignSelf: "flex-start" }}>+ Add factor</button>
    </div>
  );
}

function MLBlock({ q, onChange }: { q: Extract<SJTQuestion, { type: "mostleast" }>; onChange: (q: SJTQuestion) => void }) {
  function updAction(id: number, text: string) { onChange({ ...q, actions: q.actions.map(a => a.id === id ? { ...a, text } : a) }); }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={{ margin: "0 0 6px", fontSize: 11, color: "#6b7a8c" }}>List the actions below, then mark which is <strong>most</strong> and which is <strong>least</strong> appropriate.</p>
      {q.actions.map((action, i) => {
        const isMost = q.most === i, isLeast = q.least === i;
        return (
          <div key={action.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input value={action.text} onChange={e => updAction(action.id, e.target.value)} placeholder={`Action ${i + 1}…`} style={{ flex: 1, border: `1.5px solid ${isMost ? "#3dbe6c" : isLeast ? "#ff6b5c" : "#e5e9f0"}`, background: isMost ? "#edfbf3" : isLeast ? "#ffedea" : "white", borderRadius: 8, padding: "8px 11px", fontSize: 13, color: "#1a2535", outline: "none" }} />
            <button onClick={() => onChange({ ...q, most: i })} style={{ border: "1.5px solid", borderColor: isMost ? "#3dbe6c" : "#e5e9f0", background: isMost ? "#edfbf3" : "white", color: isMost ? "#238a4b" : "#9ba6b5", borderRadius: 7, padding: "5px 10px", fontSize: 10, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>MOST</button>
            <button onClick={() => onChange({ ...q, least: i })} style={{ border: "1.5px solid", borderColor: isLeast ? "#ff6b5c" : "#e5e9f0", background: isLeast ? "#ffedea" : "white", color: isLeast ? "#d94b3e" : "#9ba6b5", borderRadius: 7, padding: "5px 10px", fontSize: 10, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>LEAST</button>
            <button onClick={() => onChange({ ...q, actions: q.actions.filter(a => a.id !== action.id), most: 0, least: Math.max(0, q.actions.length - 2) })} style={{ border: 0, background: "none", color: "#ff6b5c", cursor: "pointer", fontSize: 13, padding: "0 4px", flexShrink: 0 }}>✕</button>
          </div>
        );
      })}
      <button onClick={() => onChange({ ...q, actions: [...q.actions, { id: ++_iid, text: "" }] })} style={{ border: "1.5px dashed #dce2ea", background: "none", borderRadius: 8, padding: "5px 13px", fontSize: 11, color: "#9ba6b5", cursor: "pointer", alignSelf: "flex-start" }}>+ Add action</button>
    </div>
  );
}

function QuestionBlock({ q, qi, onChange, onRemove }: { q: SJTQuestion; qi: number; onChange: (q: SJTQuestion) => void; onRemove: () => void }) {
  function setType(t: "appropriateness" | "importance" | "mostleast") {
    if (t === "appropriateness") onChange({ id: q.id, type: "appropriateness", subtype: q.subtype, difficulty: q.difficulty, items: [] });
    else if (t === "importance") onChange({ id: q.id, type: "importance", subtype: q.subtype, difficulty: q.difficulty, items: [] });
    else onChange({ id: q.id, type: "mostleast", subtype: q.subtype, difficulty: q.difficulty, actions: [{ id: ++_iid, text: "" }, { id: ++_iid, text: "" }, { id: ++_iid, text: "" }, { id: ++_iid, text: "" }, { id: ++_iid, text: "" }], most: 0, least: 4 });
  }

  return (
    <div style={{ border: "1.5px solid #e5e9f0", borderRadius: 12, padding: 18, background: "#fcfdff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["appropriateness","importance","mostleast"] as const).map(t => (
            <button key={t} onClick={() => setType(t)} style={{ border: "1.5px solid", borderColor: q.type === t ? CORAL : "#e5e9f0", background: q.type === t ? TINT : "white", color: q.type === t ? CORAL : "#6b7a8c", borderRadius: 8, padding: "5px 13px", fontSize: 11, fontWeight: 750, cursor: "pointer" }}>
              {t === "appropriateness" ? "Appropriateness" : t === "importance" ? "Importance" : "Most / Least"}
            </button>
          ))}
        </div>
        <button onClick={onRemove} style={{ border: 0, background: "none", color: "#ff6b5c", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✕ Remove</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label style={lbl(CORAL)}>PROFESSIONAL THEME</label>
          <select value={q.subtype} onChange={e => onChange({ ...q, subtype: e.target.value })} style={{ width: "100%", border: "1.5px solid #e5e9f0", borderRadius: 9, padding: "8px 11px", fontSize: 12, background: "white", color: "#1a2535" }}>
            {SUBTYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl(CORAL)}>DIFFICULTY</label>
          <DiffPills value={q.difficulty} onChange={v => onChange({ ...q, difficulty: v })} />
        </div>
      </div>

      {q.type === "appropriateness" && <ARBlock q={q} onChange={onChange} />}
      {q.type === "importance" && <IRBlock q={q} onChange={onChange} />}
      {q.type === "mostleast" && <MLBlock q={q} onChange={onChange} />}
    </div>
  );
}

export function CreateSJT({ onSaved }: { onSaved: () => void }) {
  const [scenario, setScenario] = useState("");
  const [questions, setQuestions] = useState<SJTQuestion[]>([mkAR()]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function updQ(id: number, q: SJTQuestion) { setQuestions(qs => qs.map(x => x.id === id ? q : x)); }
  function rmQ(id: number) { setQuestions(qs => qs.filter(x => x.id !== id)); }

  async function handleSave() {
    if (!scenario.trim()) { setError("Fill in the scenario."); return; }
    setSaving(true); setError("");

    const qs = questions.map((q, i) => {
      if (q.type === "appropriateness" || q.type === "importance") {
        return { q_type: q.type, subtype: q.subtype, difficulty: q.difficulty, question_text: q.type, options: q.items.map(it => it.text), correct: JSON.stringify(Object.fromEntries(q.items.map((it, j) => [j, it.correct]))), explanations: {}, sort_order: i };
      } else {
        return { q_type: "mostleast", subtype: q.subtype, difficulty: q.difficulty, question_text: "mostleast", options: q.actions.map(a => a.text), correct: JSON.stringify({ most: q.most, least: q.least }), explanations: {}, sort_order: i };
      }
    });

    const res = await fetch("/api/admin/passage", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "sjt", content: scenario, questions: qs }),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); setSaving(false); return; }
    setSaved(true); setSaving(false);
    setScenario(""); setQuestions([mkAR()]); setTimeout(() => { setSaved(false); onSaved(); }, 1500);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 22 }}>
        <label style={lbl(CORAL)}>SCENARIO</label>
        <textarea value={scenario} onChange={e => setScenario(e.target.value)} rows={5} placeholder="Describe the situational scenario…" style={ta} />
      </div>

      {questions.map((q, qi) => (
        <QuestionBlock key={q.id} q={q} qi={qi} onChange={uq => updQ(q.id, uq)} onRemove={() => rmQ(q.id)} />
      ))}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setQuestions(qs => [...qs, mkAR()])} style={{ border: `1.5px dashed ${CORAL}`, background: "none", borderRadius: 10, padding: "8px 16px", fontSize: 11, fontWeight: 700, color: CORAL, cursor: "pointer" }}>+ Appropriateness question</button>
        <button onClick={() => setQuestions(qs => [...qs, mkIR()])} style={{ border: `1.5px dashed ${CORAL}`, background: "none", borderRadius: 10, padding: "8px 16px", fontSize: 11, fontWeight: 700, color: CORAL, cursor: "pointer" }}>+ Importance question</button>
        <button onClick={() => setQuestions(qs => [...qs, mkML()])} style={{ border: `1.5px dashed ${CORAL}`, background: "none", borderRadius: 10, padding: "8px 16px", fontSize: 11, fontWeight: 700, color: CORAL, cursor: "pointer" }}>+ Most / Least question</button>
        <div style={{ flex: 1 }} />
        {error && <span style={{ fontSize: 12, color: "#ff6b5c" }}>{error}</span>}
        {saved && <span style={{ fontSize: 12, color: "#3dbe6c", fontWeight: 700 }}>✓ Saved!</span>}
        <button onClick={handleSave} disabled={saving} style={{ border: 0, background: CORAL, color: "white", borderRadius: 9, padding: "10px 24px", fontSize: 12, fontWeight: 800, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : `Save scenario + ${questions.length} question${questions.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}
