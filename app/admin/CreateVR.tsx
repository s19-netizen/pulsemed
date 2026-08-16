"use client";
import { useState } from "react";

const SUBTYPES = ["Direct Retrieval","Inference","Scope Check","Main Point","Vocabulary in Context","Tone & Purpose"];
const DIFFS = ["Bronze","Silver","Gold","Diamond"];
const TF_OPTS = ["True","False","Can't Tell"];

type VRQ = {
  id: number;
  type: "tf" | "mcq";
  subtype: string;
  difficulty: string;
  questionText: string;
  options: string[];
  correct: string;
  explanations: Record<string, string>;
};

let _id = 0;
function mkQ(): VRQ {
  return { id: ++_id, type: "tf", subtype: "Direct Retrieval", difficulty: "Silver", questionText: "", options: [...TF_OPTS], correct: "True", explanations: { True: "", False: "", "Can't Tell": "" } };
}

const ta: React.CSSProperties = { width: "100%", border: "1.5px solid #e5e9f0", borderRadius: 10, padding: "10px 13px", fontSize: 13, lineHeight: 1.6, color: "#334354", resize: "vertical", background: "white", boxSizing: "border-box" };
const lbl = (c: string): React.CSSProperties => ({ display: "block", fontSize: 10, fontWeight: 850, color: c, letterSpacing: ".1em", marginBottom: 6 });
const BLUE = "#2D7FF9", TINT = "#EAF2FF";

function DiffPills({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const cols: Record<string, { bg: string; border: string; text: string }> = {
    Bronze: { bg: "#fff3eb", border: "#eab994", text: "#a95c2e" },
    Silver: { bg: "#f1f4f7", border: "#bac4cf", text: "#5e6b78" },
    Gold:   { bg: "#fff8df", border: "#ebcb66", text: "#9b7000" },
    Diamond:{ bg: "#f3f0ff", border: "#b8a9f5", text: "#5b3fd4" },
  };
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {DIFFS.map(d => {
        const c = cols[d]; const on = value === d;
        return <button key={d} onClick={() => onChange(d)} style={{ border: `1.5px solid ${on ? c.border : "#e5e9f0"}`, background: on ? c.bg : "white", color: on ? c.text : "#9ba6b5", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 750, cursor: "pointer" }}>{d}</button>;
      })}
    </div>
  );
}

function QBlock({ q, onChange, onRemove, color }: { q: VRQ; onChange: (q: VRQ) => void; onRemove: () => void; color: string }) {
  const opts = q.type === "tf" ? TF_OPTS : q.options;

  function setType(t: "tf" | "mcq") {
    if (t === "tf") onChange({ ...q, type: "tf", options: [...TF_OPTS], correct: "True", explanations: { True: "", False: "", "Can't Tell": "" } });
    else onChange({ ...q, type: "mcq", options: ["","","",""], correct: "A", explanations: { A: "", B: "", C: "", D: "" } });
  }

  function setOpt(i: number, v: string) {
    const options = [...q.options]; options[i] = v;
    onChange({ ...q, options });
  }

  function setCorrect(v: string) { onChange({ ...q, correct: v }); }

  function setExpl(k: string, v: string) { onChange({ ...q, explanations: { ...q.explanations, [k]: v } }); }

  return (
    <div style={{ border: "1.5px solid #e5e9f0", borderRadius: 12, padding: 18, background: "#fcfdff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {(["tf","mcq"] as const).map(t => (
            <button key={t} onClick={() => setType(t)} style={{ border: "1.5px solid", borderColor: q.type === t ? BLUE : "#e5e9f0", background: q.type === t ? TINT : "white", color: q.type === t ? BLUE : "#6b7a8c", borderRadius: 8, padding: "5px 13px", fontSize: 11, fontWeight: 750, cursor: "pointer" }}>
              {t === "tf" ? "True / False / Can't Tell" : "MCQ (4 options)"}
            </button>
          ))}
        </div>
        <button onClick={onRemove} style={{ border: 0, background: "none", color: "#ff6b5c", cursor: "pointer", fontSize: 13, fontWeight: 700, padding: "2px 6px" }}>✕ Remove</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={lbl(BLUE)}>SUBTYPE</label>
          <select value={q.subtype} onChange={e => onChange({ ...q, subtype: e.target.value })} style={{ width: "100%", border: "1.5px solid #e5e9f0", borderRadius: 9, padding: "8px 11px", fontSize: 12, background: "white", color: "#1a2535" }}>
            {SUBTYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl(BLUE)}>DIFFICULTY</label>
          <DiffPills value={q.difficulty} onChange={v => onChange({ ...q, difficulty: v })} />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={lbl(BLUE)}>QUESTION</label>
        <textarea value={q.questionText} onChange={e => onChange({ ...q, questionText: e.target.value })} rows={2} placeholder="Type the question statement…" style={ta} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={lbl(BLUE)}>ANSWERS — click letter to mark correct</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {opts.map((opt, i) => {
            const key = q.type === "tf" ? opt : String.fromCharCode(65 + i);
            const isCor = q.correct === key;
            return (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <button onClick={() => setCorrect(key)} style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0, border: isCor ? `2px solid ${BLUE}` : "1.5px solid #dce2ea", background: isCor ? TINT : "white", color: isCor ? BLUE : "#9ba6b5", fontWeight: 850, fontSize: 11, cursor: "pointer" }}>
                    {q.type === "tf" ? opt[0] : key}
                  </button>
                  {q.type === "mcq"
                    ? <input value={opt} onChange={e => setOpt(i, e.target.value)} placeholder={`Option ${key}`} style={{ flex: 1, border: isCor ? `1.5px solid ${BLUE}` : "1.5px solid #e5e9f0", background: isCor ? TINT : "white", borderRadius: 8, padding: "8px 11px", fontSize: 13, color: "#1a2535", outline: "none" }} />
                    : <span style={{ fontSize: 13, color: "#334354", fontWeight: isCor ? 700 : 400 }}>{opt}{isCor && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 800, color: BLUE }}>✓ correct</span>}</span>
                  }
                </div>
                <textarea value={q.explanations[key] ?? ""} onChange={e => setExpl(key, e.target.value)} rows={2} placeholder={`Why "${opt}" is ${isCor ? "correct" : "wrong"}…`} style={{ ...ta, fontSize: 12, marginLeft: 38, width: "calc(100% - 38px)" }} />
              </div>
            );
          })}
        </div>
        {q.type === "mcq" && (
          <button onClick={() => { const n = [...q.options, ""]; const k = String.fromCharCode(65 + q.options.length); onChange({ ...q, options: n, explanations: { ...q.explanations, [k]: "" } }); }} style={{ marginTop: 8, border: "1.5px dashed #dce2ea", background: "none", borderRadius: 8, padding: "5px 13px", fontSize: 11, color: "#9ba6b5", cursor: "pointer" }}>+ Add option</button>
        )}
      </div>
    </div>
  );
}

export function CreateVR({ onSaved }: { onSaved: () => void }) {
  const [passage, setPassage] = useState("");
  const [questions, setQuestions] = useState<VRQ[]>([mkQ()]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function updateQ(id: number, q: VRQ) { setQuestions(qs => qs.map(x => x.id === id ? q : x)); }
  function removeQ(id: number) { setQuestions(qs => qs.filter(x => x.id !== id)); }

  async function handleSave() {
    if (!passage.trim() || questions.some(q => !q.questionText.trim())) { setError("Fill in the passage and all question texts."); return; }
    setSaving(true); setError("");
    const res = await fetch("/api/admin/passage", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "vr", content: passage, questions: questions.map((q, i) => ({ q_type: q.type, subtype: q.subtype, difficulty: q.difficulty, question_text: q.questionText, options: q.type === "tf" ? TF_OPTS : q.options, correct: q.correct, explanations: q.explanations, sort_order: i })) }),
    });
    const data = await res.json();
    if (data.error) { setError(data.error); setSaving(false); return; }
    setSaved(true); setSaving(false);
    setPassage(""); setQuestions([mkQ()]); setTimeout(() => { setSaved(false); onSaved(); }, 1500);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 22 }}>
        <label style={lbl(BLUE)}>PASSAGE</label>
        <textarea value={passage} onChange={e => setPassage(e.target.value)} rows={7} placeholder="Paste the full passage text here…" style={ta} />
      </div>

      {questions.map(q => (
        <QBlock key={q.id} q={q} onChange={uq => updateQ(q.id, uq)} onRemove={() => removeQ(q.id)} color={BLUE} />
      ))}

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={() => setQuestions(qs => [...qs, mkQ()])} style={{ border: "1.5px dashed #2D7FF9", background: "none", borderRadius: 10, padding: "9px 18px", fontSize: 12, fontWeight: 700, color: BLUE, cursor: "pointer" }}>+ Add question</button>
        <div style={{ flex: 1 }} />
        {error && <span style={{ fontSize: 12, color: "#ff6b5c" }}>{error}</span>}
        {saved && <span style={{ fontSize: 12, color: "#3dbe6c", fontWeight: 700 }}>✓ Saved!</span>}
        <button onClick={handleSave} disabled={saving} style={{ border: 0, background: BLUE, color: "white", borderRadius: 9, padding: "10px 24px", fontSize: 12, fontWeight: 800, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : `Save passage + ${questions.length} question${questions.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}
