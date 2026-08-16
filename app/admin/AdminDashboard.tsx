"use client";
import { useState, useCallback } from "react";
import type { VRPassage, QRDataset, SJTScenario, DMQuestion, MockQuestion } from "@/lib/mock1Data";
import type { DiagQuestion } from "@/lib/diagnosticData";

// ── Types ────────────────────────────────────────────────────────────────────

type MockData = {
  id: string; label: string;
  vr: VRPassage[]; dm: DMQuestion[]; qr: QRDataset[]; sjt: SJTScenario[];
};

type EditTarget = {
  mockId: string; section: string;
  questionId: string; question: any;
  context?: string; contextLabel?: string;
};

type PresentationType = "text" | "table" | "bar" | "line" | "pie";

// ── Constants ─────────────────────────────────────────────────────────────────

const SECTION_COLORS: Record<string, string> = {
  vr: "#2D7FF9", dm: "#8B6BFF", qr: "#3DBE6C", sjt: "#FF6B5C",
};
const SECTION_TINTS: Record<string, string> = {
  vr: "#EAF2FF", dm: "#F1ECFF", qr: "#EDFBF3", sjt: "#FFEDEA",
};

const DIFFICULTIES = ["Bronze", "Silver", "Gold", "Diamond"];

const SECTION_SUBTYPES: Record<string, string[]> = {
  vr:  ["True / False / Can't Tell", "Multiple Choice (MCQ)"],
  dm:  ["Syllogisms", "Interpreting Information", "Arguments & Assumptions", "Logic Puzzles", "Venn Diagrams", "Probability & Statistics"],
  qr:  ["Fractions & Decimals", "Percentages", "Ratios", "Rates & Measurements", "Data Interpretation", "Geometry", "Algebra", "Currency & Finance"],
  sjt: ["Appropriateness", "Importance", "Most / Least"],
};

const PRESENTATION_OPTIONS: { key: PresentationType; label: string; icon: string }[] = [
  { key: "text",  label: "Text",       icon: "≡" },
  { key: "table", label: "Table",      icon: "⊞" },
  { key: "bar",   label: "Bar Chart",  icon: "▐" },
  { key: "line",  label: "Line Chart", icon: "∿" },
  { key: "pie",   label: "Pie Chart",  icon: "◔" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const qText    = (q: any) => q?.questionText ?? q?.question ?? q?.stem ?? "";
const qOptions = (q: any): string[] => q?.options ?? q?.opts ?? [];
const qCorrect = (q: any): number => q?.correct ?? q?.cor ?? 0;
const qExpl    = (q: any): string => q?.explanation ?? "";
const qId      = (q: any): string => q?.id ?? "";

// ── Shared UI bits ────────────────────────────────────────────────────────────

function SectionBadge({ section }: { section: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 5,
      background: SECTION_TINTS[section] ?? "#f5f7fb",
      color: SECTION_COLORS[section] ?? "#6b7a8c",
      fontSize: 10, fontWeight: 850, letterSpacing: "0.06em",
    }}>
      {section.toUpperCase()}
    </span>
  );
}

function DifficultyPills({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    Bronze:  { bg: "#fff3eb", border: "#eab994", text: "#a95c2e" },
    Silver:  { bg: "#f1f4f7", border: "#bac4cf", text: "#5e6b78" },
    Gold:    { bg: "#fff8df", border: "#ebcb66", text: "#9b7000" },
    Diamond: { bg: "#f3f0ff", border: "#b8a9f5", text: "#5b3fd4" },
  };
  return (
    <div style={{ display: "flex", gap: 7 }}>
      {DIFFICULTIES.map(d => {
        const c = colors[d];
        const active = value === d;
        return (
          <button key={d} onClick={() => onChange(d)} style={{
            border: `1.5px solid ${active ? c.border : "#e5e9f0"}`,
            background: active ? c.bg : "white",
            color: active ? c.text : "#9ba6b5",
            borderRadius: 8, padding: "6px 13px", fontSize: 11, fontWeight: 750, cursor: "pointer",
          }}>{d}</button>
        );
      })}
    </div>
  );
}

// ── Question card (list item) ─────────────────────────────────────────────────

function QuestionCard({ q, section, onClick, saved }: { q: any; section: string; onClick: () => void; saved: boolean }) {
  const text = qText(q);
  const opts = qOptions(q);
  const cor  = qCorrect(q);
  return (
    <button onClick={onClick} style={{
      background: "white", border: "1px solid #e5e9f0", borderRadius: 12,
      padding: "13px 16px", textAlign: "left", cursor: "pointer",
      display: "flex", flexDirection: "column", gap: 6, width: "100%",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <SectionBadge section={section} />
        <span style={{ fontSize: 10, color: "#9ba6b5" }}>{qId(q)}</span>
        {saved && <span style={{ marginLeft: "auto", fontSize: 10, color: "#3DBE6C", fontWeight: 700 }}>● saved</span>}
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "#1a2535", lineHeight: 1.45, fontWeight: 500 }}>
        {text.length > 110 ? text.slice(0, 110) + "…" : text}
      </p>
      <div style={{ display: "flex", gap: 6 }}>
        {opts.slice(0, 4).map((opt: string, i: number) => (
          <span key={i} style={{
            fontSize: 10, padding: "2px 7px", borderRadius: 5,
            background: i === cor ? "#EDFBF3" : "#f5f7fb",
            color: i === cor ? "#238A4B" : "#6b7a8c",
            fontWeight: i === cor ? 750 : 500,
          }}>{String.fromCharCode(65 + i)}</span>
        ))}
      </div>
    </button>
  );
}

// ── Question editor (slide-in panel) ─────────────────────────────────────────

function QuestionEditor({ target, onClose, onSaved }: { target: EditTarget; onClose: () => void; onSaved: (id: string) => void }) {
  const orig = target.question;
  const [questionText, setQuestionText] = useState(qText(orig));
  const [options, setOptions] = useState<string[]>([...qOptions(orig)]);
  const [correct, setCorrect] = useState(qCorrect(orig));
  const [explanation, setExplanation] = useState(qExpl(orig));
  const [context, setContext] = useState(target.context ?? "");
  const [presentation, setPresentation] = useState<PresentationType>("text");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const color = SECTION_COLORS[target.section] ?? "#2D7FF9";
  const tint  = SECTION_TINTS[target.section]  ?? "#EAF2FF";

  async function handleSave() {
    setSaving(true);
    await fetch("/api/admin/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: qId(orig), mockId: target.mockId, section: target.section,
        question: questionText, options, correct, explanation, context, presentation,
      }),
    });
    setSaved(true);
    setSaving(false);
    onSaved(qId(orig));
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(10,20,40,.45)", display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "min(640px,100vw)", height: "100dvh", background: "#f8fafd", display: "flex", flexDirection: "column", boxShadow: "-8px 0 40px rgba(0,0,0,.12)" }}>
        {/* Header */}
        <div style={{ padding: "16px 22px", background: "white", borderBottom: "1px solid #e5e9f0", display: "flex", alignItems: "center", gap: 12 }}>
          <SectionBadge section={target.section} />
          <span style={{ fontSize: 11, color: "#9ba6b5", flex: 1 }}>{qId(orig)}</span>
          <button onClick={onClose} style={{ border: 0, background: "none", cursor: "pointer", fontSize: 18, color: "#9ba6b5" }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 20 }}>
          {target.context !== undefined && (
            <Field label={target.contextLabel ?? "CONTEXT"} color={color}>
              <textarea value={context} onChange={e => setContext(e.target.value)} rows={5} style={taStyle} />
            </Field>
          )}
          {target.section === "qr" && (
            <Field label="HOW TO PRESENT THE DATA" color={color}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PRESENTATION_OPTIONS.map(opt => (
                  <button key={opt.key} onClick={() => setPresentation(opt.key)} style={{
                    border: presentation === opt.key ? `2px solid ${color}` : "1.5px solid #e5e9f0",
                    background: presentation === opt.key ? tint : "white",
                    borderRadius: 10, padding: "9px 14px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", minWidth: 70,
                  }}>
                    <span style={{ fontSize: 18, color: presentation === opt.key ? color : "#9ba6b5" }}>{opt.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: presentation === opt.key ? color : "#6b7a8c" }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </Field>
          )}
          <Field label="QUESTION" color={color}>
            <textarea value={questionText} onChange={e => setQuestionText(e.target.value)} rows={3} style={{ ...taStyle, fontSize: 14, fontWeight: 500 }} />
          </Field>
          <Field label="ANSWER OPTIONS — click the letter to mark correct" color={color}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {options.map((opt, idx) => {
                const isCor = correct === idx;
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => setCorrect(idx)} style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      border: isCor ? `2px solid ${color}` : "1.5px solid #dce2ea",
                      background: isCor ? tint : "white", color: isCor ? color : "#9ba6b5",
                      fontWeight: 850, fontSize: 11, cursor: "pointer",
                    }}>{String.fromCharCode(65 + idx)}</button>
                    <input value={opt} onChange={e => { const n = [...options]; n[idx] = e.target.value; setOptions(n); }} style={{
                      flex: 1, border: isCor ? `1.5px solid ${color}` : "1.5px solid #e5e9f0",
                      background: isCor ? tint : "white", borderRadius: 9, padding: "9px 12px", fontSize: 13, color: "#1a2535", outline: "none",
                    }} />
                    {isCor && <span style={{ fontSize: 10, fontWeight: 800, color, whiteSpace: "nowrap" }}>✓ correct</span>}
                  </div>
                );
              })}
            </div>
            <button onClick={() => setOptions([...options, ""])} style={{ marginTop: 8, border: "1.5px dashed #dce2ea", background: "none", borderRadius: 8, padding: "6px 14px", fontSize: 11, color: "#9ba6b5", cursor: "pointer" }}>+ Add option</button>
          </Field>
          <Field label="EXPLANATION" color={color}>
            <textarea value={explanation} onChange={e => setExplanation(e.target.value)} rows={6} style={taStyle} />
          </Field>
        </div>
        {/* Footer */}
        <div style={{ padding: "14px 22px", background: "white", borderTop: "1px solid #e5e9f0", display: "flex", gap: 10, alignItems: "center" }}>
          {saved && <span style={{ fontSize: 12, color: "#3DBE6C", fontWeight: 700 }}>✓ Saved</span>}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={ghostBtn}>Close</button>
          <button onClick={handleSave} disabled={saving} style={{ ...primaryBtn(color), opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add question form ─────────────────────────────────────────────────────────

function AddQuestionForm({ section, onSaved }: { section: string; onSaved: () => void }) {
  const color = SECTION_COLORS[section];
  const tint  = SECTION_TINTS[section];
  const subtypes = SECTION_SUBTYPES[section] ?? [];

  const [subtype,      setSubtype]      = useState(subtypes[0] ?? "");
  const [difficulty,   setDifficulty]   = useState("Silver");
  const [context,      setContext]      = useState("");
  const [questionText, setQuestionText] = useState("");
  const [options,      setOptions]      = useState(["", "", "", ""]);
  const [correct,      setCorrect]      = useState(0);
  const [explanation,  setExplanation]  = useState("");
  const [presentation, setPresentation] = useState<PresentationType>("text");
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);

  async function handleSave() {
    if (!questionText.trim()) return;
    setSaving(true);
    await fetch("/api/admin/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "new_question", section, subtype, difficulty,
        context, question: questionText,
        options: options.filter(Boolean), correct, explanation, presentation,
      }),
    });
    setSaved(true);
    setSaving(false);
    // Reset
    setQuestionText(""); setContext(""); setOptions(["", "", "", ""]); setCorrect(0); setExplanation(""); setSaved(false);
    onSaved();
  }

  return (
    <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: "22px" }}>
      <p style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 800, color: "#1a2535" }}>Add a new {section.toUpperCase()} question</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
        <div>
          <label style={labelStyle(color)}>SUBTYPE</label>
          <select value={subtype} onChange={e => setSubtype(e.target.value)} style={selectStyle}>
            {subtypes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle(color)}>DIFFICULTY</label>
          <DifficultyPills value={difficulty} onChange={setDifficulty} />
        </div>
      </div>

      {section === "qr" && (
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle(color)}>HOW TO PRESENT THE DATA</label>
          <div style={{ display: "flex", gap: 8 }}>
            {PRESENTATION_OPTIONS.map(opt => (
              <button key={opt.key} onClick={() => setPresentation(opt.key)} style={{
                border: presentation === opt.key ? `2px solid ${color}` : "1.5px solid #e5e9f0",
                background: presentation === opt.key ? tint : "white",
                borderRadius: 10, padding: "8px 12px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer",
              }}>
                <span style={{ fontSize: 16, color: presentation === opt.key ? color : "#9ba6b5" }}>{opt.icon}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: presentation === opt.key ? color : "#9ba6b5" }}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle(color)}>{section === "vr" ? "PASSAGE" : section === "sjt" ? "SCENARIO" : "CONTEXT / DATA"}</label>
        <textarea value={context} onChange={e => setContext(e.target.value)} rows={4} placeholder="Paste the passage, scenario or data here…" style={taStyle} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle(color)}>QUESTION</label>
        <textarea value={questionText} onChange={e => setQuestionText(e.target.value)} rows={2} placeholder="Type the question…" style={{ ...taStyle, fontWeight: 500 }} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle(color)}>ANSWER OPTIONS — click the letter to mark correct</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {options.map((opt, idx) => {
            const isCor = correct === idx;
            return (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => setCorrect(idx)} style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  border: isCor ? `2px solid ${color}` : "1.5px solid #dce2ea",
                  background: isCor ? tint : "white", color: isCor ? color : "#9ba6b5",
                  fontWeight: 850, fontSize: 11, cursor: "pointer",
                }}>{String.fromCharCode(65 + idx)}</button>
                <input value={opt} onChange={e => { const n = [...options]; n[idx] = e.target.value; setOptions(n); }}
                  placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                  style={{ flex: 1, border: isCor ? `1.5px solid ${color}` : "1.5px solid #e5e9f0", background: isCor ? tint : "white", borderRadius: 9, padding: "9px 12px", fontSize: 13, color: "#1a2535", outline: "none" }} />
                {isCor && <span style={{ fontSize: 10, fontWeight: 800, color, whiteSpace: "nowrap" }}>✓ correct</span>}
              </div>
            );
          })}
        </div>
        <button onClick={() => setOptions([...options, ""])} style={{ marginTop: 8, border: "1.5px dashed #dce2ea", background: "none", borderRadius: 8, padding: "6px 14px", fontSize: 11, color: "#9ba6b5", cursor: "pointer" }}>+ Add option</button>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle(color)}>EXPLANATION</label>
        <textarea value={explanation} onChange={e => setExplanation(e.target.value)} rows={4} placeholder="Explain why the correct answer is right…" style={taStyle} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {saved && <span style={{ fontSize: 12, color: "#3DBE6C", fontWeight: 700 }}>✓ Question saved</span>}
        <div style={{ flex: 1 }} />
        <button onClick={handleSave} disabled={saving || !questionText.trim()} style={{ ...primaryBtn(color), opacity: (saving || !questionText.trim()) ? 0.5 : 1 }}>
          {saving ? "Saving…" : "Save question"}
        </button>
      </div>
    </div>
  );
}

// ── Mock section ──────────────────────────────────────────────────────────────

function MockSection({ mock, savedIds, onEdit }: { mock: MockData; savedIds: Set<string>; onEdit: (t: EditTarget) => void }) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const sections = [
    { key: "vr",  label: "VR",  count: mock.vr.reduce((s, p) => s + p.questions.length, 0) },
    { key: "dm",  label: "DM",  count: mock.dm.length },
    { key: "qr",  label: "QR",  count: mock.qr.reduce((s, d) => s + d.questions.length, 0) },
    { key: "sjt", label: "SJT", count: mock.sjt.reduce((s, sc) => s + sc.questions.length, 0) },
  ];
  return (
    <div style={{ border: "1px solid #e5e9f0", borderRadius: 14, overflow: "hidden", background: "white" }}>
      <div style={{ display: "flex", borderBottom: "1px solid #e5e9f0" }}>
        {sections.map(s => (
          <button key={s.key} onClick={() => setOpenSection(prev => prev === s.key ? null : s.key)} style={{
            flex: 1, padding: "12px 8px", border: 0, background: "none", cursor: "pointer",
            borderBottom: openSection === s.key ? `2.5px solid ${SECTION_COLORS[s.key]}` : "2.5px solid transparent",
            color: openSection === s.key ? SECTION_COLORS[s.key] : "#6b7a8c",
            fontWeight: openSection === s.key ? 800 : 600, fontSize: 11,
          }}>
            <span style={{ display: "block", fontWeight: 850, fontSize: 13 }}>{s.label}</span>
            <span style={{ fontSize: 9, opacity: 0.75 }}>{s.count} questions</span>
          </button>
        ))}
      </div>
      {openSection && (
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8, maxHeight: 480, overflowY: "auto" }}>
          {openSection === "vr"  && mock.vr.flatMap(p => p.questions.map(q => <QuestionCard key={q.id} q={q} section="vr" saved={savedIds.has(q.id)} onClick={() => onEdit({ mockId: mock.id, section: "vr", questionId: q.id, question: q, context: p.passageText, contextLabel: "PASSAGE" })} />))}
          {openSection === "dm"  && mock.dm.map(q => <QuestionCard key={q.id} q={q} section="dm" saved={savedIds.has(q.id)} onClick={() => onEdit({ mockId: mock.id, section: "dm", questionId: q.id, question: q, context: q.context, contextLabel: (q as any).contextLabel ?? "CONTEXT" })} />)}
          {openSection === "qr"  && mock.qr.flatMap(ds => ds.questions.map(q => <QuestionCard key={q.id} q={q} section="qr" saved={savedIds.has(q.id)} onClick={() => onEdit({ mockId: mock.id, section: "qr", questionId: q.id, question: q, context: ds.scenario, contextLabel: "DATA / SCENARIO" })} />))}
          {openSection === "sjt" && mock.sjt.flatMap(sc => sc.questions.map(q => <QuestionCard key={q.id} q={q} section="sjt" saved={savedIds.has(q.id)} onClick={() => onEdit({ mockId: mock.id, section: "sjt", questionId: q.id, question: q, context: sc.scenarioText, contextLabel: "SCENARIO" })} />))}
        </div>
      )}
    </div>
  );
}

// ── Practice section (VR / DM / QR / SJT tabs) ───────────────────────────────

function PracticeSection({ dmBank, savedIds, onEdit }: { dmBank: any[]; savedIds: Set<string>; onEdit: (t: EditTarget) => void }) {
  const [section, setSection] = useState<string>("vr");
  const [addedCount, setAddedCount] = useState(0);

  const sectionTabs = ["vr", "dm", "qr", "sjt"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Section tabs */}
      <div style={{ display: "flex", gap: 4, background: "white", border: "1px solid #e5e9f0", borderRadius: 11, padding: 4, width: "fit-content" }}>
        {sectionTabs.map(s => (
          <button key={s} onClick={() => setSection(s)} style={{
            border: 0, borderRadius: 8, padding: "7px 16px", cursor: "pointer",
            background: section === s ? SECTION_COLORS[s] : "transparent",
            color: section === s ? "white" : "#6b7a8c",
            fontWeight: section === s ? 800 : 600, fontSize: 12, transition: "all .15s",
          }}>{s.toUpperCase()}</button>
        ))}
      </div>

      {/* Add question form for selected section */}
      <AddQuestionForm key={section} section={section} onSaved={() => setAddedCount(c => c + 1)} />

      {/* Existing DM questions (only for DM tab) */}
      {section === "dm" && (
        <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 22 }}>
          <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "#1a2535" }}>Existing DM practice questions</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 500, overflowY: "auto" }}>
            {dmBank.slice(0, 50).map((q: any) => (
              <QuestionCard key={q.id} q={q} section="dm" saved={savedIds.has(q.id)}
                onClick={() => onEdit({ mockId: "practice", section: "dm", questionId: q.id, question: q, context: q.context, contextLabel: q.contextLabel ?? "CONTEXT" })} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Diagnostic section ────────────────────────────────────────────────────────

function DiagnosticSection({ questions, savedIds, onEdit }: { questions: DiagQuestion[]; savedIds: Set<string>; onEdit: (t: EditTarget) => void }) {
  const [section, setSection] = useState<string>("vr");
  const filtered = questions.filter(q => q.section === section);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 4, background: "white", border: "1px solid #e5e9f0", borderRadius: 11, padding: 4, width: "fit-content" }}>
        {["vr", "dm", "qr", "sjt"].map(s => (
          <button key={s} onClick={() => setSection(s)} style={{
            border: 0, borderRadius: 8, padding: "7px 16px", cursor: "pointer",
            background: section === s ? SECTION_COLORS[s] : "transparent",
            color: section === s ? "white" : "#6b7a8c",
            fontWeight: section === s ? 800 : 600, fontSize: 12,
          }}>{s.toUpperCase()}</button>
        ))}
      </div>
      <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 22 }}>
        <p style={{ margin: "0 0 14px", fontSize: 13, color: "#6b7a8c" }}>
          {filtered.length} diagnostic questions in {section.toUpperCase()}. Click any to edit.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 600, overflowY: "auto" }}>
          {filtered.map(q => (
            <QuestionCard key={q.id} q={q} section={q.section} saved={savedIds.has(q.id)}
              onClick={() => onEdit({ mockId: "diagnostic", section: q.section, questionId: q.id, question: q })} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Add mock modal ────────────────────────────────────────────────────────────

function AddMockModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  async function handleCreate() {
    if (!title.trim()) return;
    setSaving(true);
    await fetch("/api/admin/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "new_mock", title }) });
    setDone(true); setSaving(false);
  }
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(10,20,40,.45)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "white", borderRadius: 16, padding: "28px 30px", width: 400, boxShadow: "0 16px 48px rgba(0,0,0,.15)" }}>
        {done ? (
          <>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#1a2535", margin: "0 0 8px" }}>Mock created ✓</p>
            <p style={{ fontSize: 13, color: "#6b7a8c", margin: "0 0 20px" }}>"{title}" has been saved.</p>
            <button onClick={onClose} style={primaryBtn("#2D7FF9")}>Done</button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#1a2535", margin: "0 0 4px" }}>New Mock Test</p>
            <p style={{ fontSize: 12, color: "#9ba6b5", margin: "0 0 18px" }}>Give it a name — you'll add sections and questions after.</p>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Mock Test 3"
              style={{ width: "100%", border: "1.5px solid #e5e9f0", borderRadius: 9, padding: "10px 13px", fontSize: 14, color: "#1a2535", marginBottom: 16, boxSizing: "border-box" as const }} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={ghostBtn}>Cancel</button>
              <button onClick={handleCreate} disabled={saving || !title.trim()} style={{ ...primaryBtn("#2D7FF9"), opacity: (!title.trim() || saving) ? 0.5 : 1 }}>
                {saving ? "Creating…" : "Create mock"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────

const taStyle: React.CSSProperties = {
  width: "100%", border: "1.5px solid #e5e9f0", borderRadius: 10,
  padding: "11px 13px", fontSize: 13, lineHeight: 1.65, color: "#334354",
  resize: "vertical", background: "white", boxSizing: "border-box",
};
const labelStyle = (color: string): React.CSSProperties => ({
  display: "block", fontSize: 10, fontWeight: 850, color, letterSpacing: ".1em", marginBottom: 7,
});
const selectStyle: React.CSSProperties = {
  width: "100%", border: "1.5px solid #e5e9f0", borderRadius: 9,
  padding: "9px 12px", fontSize: 13, background: "white", color: "#1a2535", cursor: "pointer",
};
const ghostBtn: React.CSSProperties = {
  border: "1.5px solid #e5e9f0", background: "white", borderRadius: 9,
  padding: "9px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#6b7a8c",
};
const primaryBtn = (color: string): React.CSSProperties => ({
  border: 0, background: color, color: "white", borderRadius: 9,
  padding: "9px 22px", fontSize: 12, fontWeight: 800, cursor: "pointer",
});

function Field({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle(color)}>{label}</label>
      {children}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

export default function AdminDashboard({ mocks, dmBank, diagQuestions }: { mocks: MockData[]; dmBank: any[]; diagQuestions: DiagQuestion[] }) {
  const [tab, setTab] = useState<"mocks" | "practice" | "diagnostic">("mocks");
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showAddMock, setShowAddMock] = useState(false);

  const handleSaved = useCallback((id: string) => setSavedIds(prev => new Set([...prev, id])), []);

  const totalMockQ = mocks.reduce((s, m) =>
    s + m.vr.reduce((a, p) => a + p.questions.length, 0) + m.dm.length
      + m.qr.reduce((a, d) => a + d.questions.length, 0)
      + m.sjt.reduce((a, sc) => a + sc.questions.length, 0), 0);

  const tabs = [
    { key: "mocks"      as const, label: "Mocks" },
    { key: "practice"   as const, label: "Practice Questions" },
    { key: "diagnostic" as const, label: "Diagnostic" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fb", fontFamily: "var(--font-inter, system-ui), sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e9f0", padding: "0 32px", display: "flex", alignItems: "center", gap: 18, minHeight: 60 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#2D7FF9" }}>
          <svg viewBox="0 0 48 32" style={{ width: 36, height: 24, fill: "none", stroke: "#2D7FF9", strokeWidth: 3.5, strokeLinecap: "round", strokeLinejoin: "round" }}>
            <path d="M2 18h9l4-13 7 24 6-18 5 7h13" />
          </svg>
          <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-.02em" }}>Pulsemed</span>
        </a>
        <span style={{ fontSize: 11, padding: "3px 10px", background: "#FFF8DF", color: "#9B7000", borderRadius: 6, fontWeight: 750, border: "1px solid #EBD56A" }}>Admin</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: "#9ba6b5" }}>sawdaj19@gmail.com</span>
        <a href="/" style={{ fontSize: 11, color: "#2D7FF9", textDecoration: "none", fontWeight: 700 }}>← Back to app</a>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Mock Tests",            value: mocks.length,      color: "#2D7FF9" },
            { label: "Mock Questions",         value: totalMockQ,        color: "#8B6BFF" },
            { label: "Practice Questions",     value: dmBank.length,     color: "#3DBE6C" },
            { label: "Diagnostic Questions",   value: diagQuestions.length, color: "#FF6B5C" },
          ].map(card => (
            <div key={card.label} style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: "18px 22px" }}>
              <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 850, color: card.color, letterSpacing: ".08em" }}>{card.label.toUpperCase()}</p>
              <p style={{ margin: 0, fontSize: 32, fontWeight: 850, color: "#1a2535", lineHeight: 1 }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "white", border: "1px solid #e5e9f0", borderRadius: 11, padding: 4, width: "fit-content" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              border: 0, borderRadius: 8, padding: "8px 18px", cursor: "pointer",
              background: tab === t.key ? "#1a2535" : "transparent",
              color: tab === t.key ? "white" : "#6b7a8c",
              fontWeight: tab === t.key ? 800 : 600, fontSize: 12, transition: "all .15s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Mocks */}
        {tab === "mocks" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7a8c" }}>Click a section to expand, then click a question to edit it.</p>
              <button onClick={() => setShowAddMock(true)} style={primaryBtn("#2D7FF9")}>+ New mock</button>
            </div>
            {mocks.map(mock => (
              <div key={mock.id}>
                <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 800, color: "#1a2535" }}>{mock.label}</p>
                <MockSection mock={mock} savedIds={savedIds} onEdit={setEditTarget} />
              </div>
            ))}
          </div>
        )}

        {/* Practice */}
        {tab === "practice" && (
          <PracticeSection dmBank={dmBank} savedIds={savedIds} onEdit={setEditTarget} />
        )}

        {/* Diagnostic */}
        {tab === "diagnostic" && (
          <DiagnosticSection questions={diagQuestions} savedIds={savedIds} onEdit={setEditTarget} />
        )}
      </div>

      {editTarget && <QuestionEditor target={editTarget} onClose={() => setEditTarget(null)} onSaved={handleSaved} />}
      {showAddMock && <AddMockModal onClose={() => setShowAddMock(false)} />}
    </div>
  );
}
