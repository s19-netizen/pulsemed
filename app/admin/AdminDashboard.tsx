"use client";
import { useState, useCallback } from "react";
import type { VRPassage, QRDataset, SJTScenario, DMQuestion, MockQuestion } from "@/lib/mock1Data";

// ── Types ────────────────────────────────────────────────────────────────────

type MockData = {
  id: string; label: string;
  vr: VRPassage[]; dm: DMQuestion[]; qr: QRDataset[]; sjt: SJTScenario[];
};

type EditTarget = {
  mockId: string; section: "vr" | "dm" | "qr" | "sjt";
  questionId: string; question: MockQuestion | DMQuestion;
  context?: string; contextLabel?: string;
};

type PresentationType = "text" | "table" | "bar" | "line" | "pie";

const PRESENTATION_OPTIONS: { key: PresentationType; label: string; icon: string }[] = [
  { key: "text",  label: "Text",      icon: "≡" },
  { key: "table", label: "Table",     icon: "⊞" },
  { key: "bar",   label: "Bar Chart", icon: "▐" },
  { key: "line",  label: "Line Chart",icon: "∿" },
  { key: "pie",   label: "Pie Chart", icon: "◔" },
];

const SECTION_COLORS: Record<string, string> = {
  vr: "#2D7FF9", dm: "#8B6BFF", qr: "#3DBE6C", sjt: "#FF6B5C",
};
const SECTION_TINTS: Record<string, string> = {
  vr: "#EAF2FF", dm: "#F1ECFF", qr: "#EDFBF3", sjt: "#FFEDEA",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isMockQuestion(q: MockQuestion | DMQuestion): q is MockQuestion {
  return "questionText" in q;
}

function questionText(q: MockQuestion | DMQuestion): string {
  return isMockQuestion(q) ? q.questionText : (q as any).question ?? "";
}

function questionOptions(q: MockQuestion | DMQuestion): string[] {
  if (isMockQuestion(q)) return q.options ?? [];
  return (q as any).options ?? [];
}

function questionCorrect(q: MockQuestion | DMQuestion): number {
  return isMockQuestion(q) ? q.correct : (q as any).correct ?? 0;
}

function questionExplanation(q: MockQuestion | DMQuestion): string {
  return (q as any).explanation ?? "";
}

function questionId(q: MockQuestion | DMQuestion): string {
  return (q as any).id ?? "";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionBadge({ section }: { section: string }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 5,
      background: SECTION_TINTS[section], color: SECTION_COLORS[section],
      fontSize: 10, fontWeight: 850, letterSpacing: "0.06em",
    }}>
      {section.toUpperCase()}
    </span>
  );
}

function QuestionCard({
  q, section, onClick, saved,
}: {
  q: MockQuestion | DMQuestion; section: string; onClick: () => void; saved: boolean;
}) {
  const text = questionText(q);
  return (
    <button
      onClick={onClick}
      style={{
        background: "white", border: "1px solid #e5e9f0", borderRadius: 12,
        padding: "13px 16px", textAlign: "left", cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 6, width: "100%",
        transition: "box-shadow .15s, border-color .15s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = SECTION_COLORS[section]; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,.07)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#e5e9f0"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <SectionBadge section={section} />
        <span style={{ fontSize: 10, color: "#9ba6b5" }}>{questionId(q)}</span>
        {saved && <span style={{ marginLeft: "auto", fontSize: 10, color: "#3DBE6C", fontWeight: 700 }}>● saved</span>}
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "#1a2535", lineHeight: 1.45, fontWeight: 500 }}>
        {text.length > 110 ? text.slice(0, 110) + "…" : text}
      </p>
      <div style={{ display: "flex", gap: 6 }}>
        {questionOptions(q).slice(0, 4).map((opt, i) => (
          <span key={i} style={{
            fontSize: 10, padding: "2px 7px", borderRadius: 5,
            background: i === questionCorrect(q) ? "#EDFBF3" : "#f5f7fb",
            color: i === questionCorrect(q) ? "#238A4B" : "#6b7a8c",
            fontWeight: i === questionCorrect(q) ? 750 : 500,
          }}>
            {String.fromCharCode(65 + i)}
          </span>
        ))}
      </div>
    </button>
  );
}

// ── Question Editor ───────────────────────────────────────────────────────────

function QuestionEditor({
  target, onClose, onSaved,
}: {
  target: EditTarget; onClose: () => void; onSaved: (id: string) => void;
}) {
  const orig = target.question;
  const [qText, setQText] = useState(questionText(orig));
  const [options, setOptions] = useState<string[]>([...questionOptions(orig)]);
  const [correct, setCorrect] = useState(questionCorrect(orig));
  const [explanation, setExplanation] = useState(questionExplanation(orig));
  const [context, setContext] = useState(target.context ?? "");
  const [presentation, setPresentation] = useState<PresentationType>("text");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const color = SECTION_COLORS[target.section];
  const tint = SECTION_TINTS[target.section];

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: questionId(orig),
          mockId: target.mockId,
          section: target.section,
          question: qText,
          options,
          correct,
          explanation,
          context,
          presentation,
        }),
      });
      setSaved(true);
      onSaved(questionId(orig));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(10,20,40,.45)", display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "min(640px, 100vw)", height: "100dvh",
        background: "#f8fafd", display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(0,0,0,.12)",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 22px", background: "white",
          borderBottom: "1px solid #e5e9f0",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <SectionBadge section={target.section} />
          <span style={{ fontSize: 11, color: "#9ba6b5", flex: 1 }}>{questionId(orig)}</span>
          <button onClick={onClose} style={{ border: 0, background: "none", cursor: "pointer", fontSize: 18, color: "#9ba6b5", padding: "2px 6px" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Context / Passage */}
          {(target.context !== undefined) && (
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 850, color: color, letterSpacing: ".1em", marginBottom: 7 }}>
                {target.contextLabel ?? "CONTEXT / PASSAGE"}
              </label>
              <textarea
                value={context}
                onChange={e => setContext(e.target.value)}
                rows={5}
                style={{
                  width: "100%", border: "1.5px solid #e5e9f0", borderRadius: 10,
                  padding: "11px 13px", fontSize: 13, lineHeight: 1.65, color: "#334354",
                  fontFamily: "Georgia, serif", resize: "vertical", background: "white",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          {/* Presentation */}
          {target.section === "qr" && (
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 850, color: color, letterSpacing: ".1em", marginBottom: 8 }}>
                HOW TO PRESENT THE DATA
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PRESENTATION_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setPresentation(opt.key)}
                    style={{
                      border: presentation === opt.key ? `2px solid ${color}` : "1.5px solid #e5e9f0",
                      background: presentation === opt.key ? tint : "white",
                      borderRadius: 10, padding: "9px 14px",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      cursor: "pointer", minWidth: 70,
                    }}
                  >
                    <span style={{ fontSize: 18, color: presentation === opt.key ? color : "#9ba6b5" }}>{opt.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: presentation === opt.key ? color : "#6b7a8c" }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question text */}
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 850, color: color, letterSpacing: ".1em", marginBottom: 7 }}>
              QUESTION
            </label>
            <textarea
              value={qText}
              onChange={e => setQText(e.target.value)}
              rows={3}
              style={{
                width: "100%", border: "1.5px solid #e5e9f0", borderRadius: 10,
                padding: "11px 13px", fontSize: 14, lineHeight: 1.55, color: "#1a2535",
                fontWeight: 500, resize: "vertical", background: "white",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Answer options */}
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 850, color: color, letterSpacing: ".1em", marginBottom: 7 }}>
              ANSWER OPTIONS — click the correct one
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {options.map((opt, idx) => {
                const isCorrect = correct === idx;
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                      onClick={() => setCorrect(idx)}
                      style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                        border: isCorrect ? `2px solid ${color}` : "1.5px solid #dce2ea",
                        background: isCorrect ? tint : "white",
                        color: isCorrect ? color : "#9ba6b5",
                        fontWeight: 850, fontSize: 11, cursor: "pointer",
                      }}
                    >
                      {String.fromCharCode(65 + idx)}
                    </button>
                    <input
                      value={opt}
                      onChange={e => {
                        const next = [...options];
                        next[idx] = e.target.value;
                        setOptions(next);
                      }}
                      style={{
                        flex: 1, border: isCorrect ? `1.5px solid ${color}` : "1.5px solid #e5e9f0",
                        background: isCorrect ? tint : "white",
                        borderRadius: 9, padding: "9px 12px", fontSize: 13,
                        color: "#1a2535", outline: "none",
                      }}
                    />
                    {isCorrect && (
                      <span style={{ fontSize: 10, fontWeight: 800, color: color, whiteSpace: "nowrap" }}>✓ correct</span>
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setOptions([...options, ""])}
              style={{ marginTop: 8, border: "1.5px dashed #dce2ea", background: "none", borderRadius: 8, padding: "6px 14px", fontSize: 11, color: "#9ba6b5", cursor: "pointer" }}
            >
              + Add option
            </button>
          </div>

          {/* Explanation */}
          <div>
            <label style={{ display: "block", fontSize: 10, fontWeight: 850, color: color, letterSpacing: ".1em", marginBottom: 7 }}>
              EXPLANATION
            </label>
            <textarea
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              rows={6}
              style={{
                width: "100%", border: "1.5px solid #e5e9f0", borderRadius: 10,
                padding: "11px 13px", fontSize: 13, lineHeight: 1.7, color: "#334354",
                resize: "vertical", background: "white", boxSizing: "border-box",
              }}
            />
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 22px", background: "white", borderTop: "1px solid #e5e9f0",
          display: "flex", gap: 10, alignItems: "center",
        }}>
          {saved && <span style={{ fontSize: 12, color: "#3DBE6C", fontWeight: 700 }}>✓ Saved</span>}
          <div style={{ flex: 1 }} />
          <button
            onClick={onClose}
            style={{ border: "1.5px solid #e5e9f0", background: "white", borderRadius: 9, padding: "9px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#6b7a8c" }}
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              border: 0, background: color, color: "white", borderRadius: 9,
              padding: "9px 22px", fontSize: 12, fontWeight: 800, cursor: "pointer",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mock Section ──────────────────────────────────────────────────────────────

function MockSection({
  mock, savedIds, onEdit,
}: {
  mock: MockData;
  savedIds: Set<string>;
  onEdit: (t: EditTarget) => void;
}) {
  const [openSection, setOpenSection] = useState<"vr" | "dm" | "qr" | "sjt" | null>(null);
  const sections: { key: "vr" | "dm" | "qr" | "sjt"; label: string; count: number }[] = [
    { key: "vr",  label: "Verbal Reasoning",      count: mock.vr.reduce((s, p) => s + p.questions.length, 0) },
    { key: "dm",  label: "Decision Making",        count: mock.dm.length },
    { key: "qr",  label: "Quantitative Reasoning", count: mock.qr.reduce((s, d) => s + d.questions.length, 0) },
    { key: "sjt", label: "Situational Judgement",  count: mock.sjt.reduce((s, sc) => s + sc.questions.length, 0) },
  ];

  return (
    <div style={{ border: "1px solid #e5e9f0", borderRadius: 14, overflow: "hidden", background: "white" }}>
      {/* Section tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e5e9f0" }}>
        {sections.map(s => (
          <button
            key={s.key}
            onClick={() => setOpenSection(prev => prev === s.key ? null : s.key)}
            style={{
              flex: 1, padding: "12px 8px", border: 0, background: "none", cursor: "pointer",
              borderBottom: openSection === s.key ? `2.5px solid ${SECTION_COLORS[s.key]}` : "2.5px solid transparent",
              color: openSection === s.key ? SECTION_COLORS[s.key] : "#6b7a8c",
              fontWeight: openSection === s.key ? 800 : 600, fontSize: 11,
              transition: "color .15s",
            }}
          >
            <span style={{ display: "block", fontWeight: 850, fontSize: 13 }}>{s.key.toUpperCase()}</span>
            <span style={{ fontSize: 9, opacity: 0.75 }}>{s.count} questions</span>
          </button>
        ))}
      </div>

      {/* Question list for open section */}
      {openSection && (
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 8, maxHeight: 480, overflowY: "auto" }}>
          {openSection === "vr" && mock.vr.map(passage =>
            passage.questions.map(q => (
              <QuestionCard
                key={q.id} q={q} section="vr" saved={savedIds.has(q.id)}
                onClick={() => onEdit({ mockId: mock.id, section: "vr", questionId: q.id, question: q, context: passage.passageText, contextLabel: "PASSAGE" })}
              />
            ))
          )}
          {openSection === "dm" && mock.dm.map(q => (
            <QuestionCard
              key={q.id} q={q} section="dm" saved={savedIds.has(q.id)}
              onClick={() => onEdit({ mockId: mock.id, section: "dm", questionId: q.id, question: q, context: q.context, contextLabel: (q as any).contextLabel ?? "CONTEXT" })}
            />
          ))}
          {openSection === "qr" && mock.qr.map(ds =>
            ds.questions.map(q => (
              <QuestionCard
                key={q.id} q={q} section="qr" saved={savedIds.has(q.id)}
                onClick={() => onEdit({ mockId: mock.id, section: "qr", questionId: q.id, question: q, context: ds.scenario, contextLabel: "DATA / SCENARIO" })}
              />
            ))
          )}
          {openSection === "sjt" && mock.sjt.map(sc =>
            sc.questions.map(q => (
              <QuestionCard
                key={q.id} q={q} section="sjt" saved={savedIds.has(q.id)}
                onClick={() => onEdit({ mockId: mock.id, section: "sjt", questionId: q.id, question: q, context: sc.scenarioText, contextLabel: "SCENARIO" })}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Practice (DM bank) ────────────────────────────────────────────────────────

function PracticeSection({
  dmBank, savedIds, onEdit,
}: {
  dmBank: any[]; savedIds: Set<string>; onEdit: (t: EditTarget) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const types = Array.from(new Set(dmBank.map(q => q.questionType))).sort();
  const filtered = dmBank.filter(q => {
    const matchType = filterType === "all" || q.questionType === filterType;
    const matchSearch = !search || q.question?.toLowerCase().includes(search.toLowerCase()) || q.context?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search questions…"
          style={{
            flex: 1, minWidth: 200, border: "1.5px solid #e5e9f0", borderRadius: 9,
            padding: "9px 13px", fontSize: 13, color: "#1a2535", background: "white",
          }}
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          style={{ border: "1.5px solid #e5e9f0", borderRadius: 9, padding: "9px 12px", fontSize: 12, background: "white", color: "#1a2535", cursor: "pointer" }}
        >
          <option value="all">All types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Count */}
      <p style={{ margin: 0, fontSize: 11, color: "#9ba6b5" }}>Showing {filtered.length} of {dmBank.length} practice questions</p>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 600, overflowY: "auto" }}>
        {filtered.slice(0, 60).map(q => (
          <QuestionCard
            key={q.id} q={q} section="dm" saved={savedIds.has(q.id)}
            onClick={() => onEdit({ mockId: "practice", section: "dm", questionId: q.id, question: q, context: q.context, contextLabel: q.contextLabel ?? "CONTEXT" })}
          />
        ))}
        {filtered.length > 60 && (
          <p style={{ textAlign: "center", fontSize: 11, color: "#9ba6b5", padding: "10px 0" }}>+ {filtered.length - 60} more — use search to narrow down</p>
        )}
      </div>
    </div>
  );
}

// ── Add Mock modal ────────────────────────────────────────────────────────────

function AddMockModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleCreate() {
    if (!title.trim()) return;
    setSaving(true);
    await fetch("/api/admin/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "new_mock", title }),
    });
    setDone(true);
    setSaving(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(10,20,40,.45)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "white", borderRadius: 16, padding: "28px 30px", width: 400, boxShadow: "0 16px 48px rgba(0,0,0,.15)" }}>
        {done ? (
          <>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#1a2535", margin: "0 0 8px" }}>Mock created ✓</p>
            <p style={{ fontSize: 13, color: "#6b7a8c", margin: "0 0 20px" }}>"{title}" has been saved. You can now add questions to it.</p>
            <button onClick={onClose} style={{ border: 0, background: "#2D7FF9", color: "white", borderRadius: 9, padding: "10px 22px", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>Done</button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#1a2535", margin: "0 0 4px" }}>New Mock Test</p>
            <p style={{ fontSize: 12, color: "#9ba6b5", margin: "0 0 18px" }}>Give it a name — you'll add sections and questions after.</p>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Mock Test 3"
              style={{ width: "100%", border: "1.5px solid #e5e9f0", borderRadius: 9, padding: "10px 13px", fontSize: 14, color: "#1a2535", marginBottom: 16, boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ border: "1.5px solid #e5e9f0", background: "white", borderRadius: 9, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#6b7a8c" }}>Cancel</button>
              <button onClick={handleCreate} disabled={saving || !title.trim()} style={{ border: 0, background: "#2D7FF9", color: "white", borderRadius: 9, padding: "9px 20px", fontSize: 12, fontWeight: 800, cursor: "pointer", opacity: (!title.trim() || saving) ? 0.5 : 1 }}>
                {saving ? "Creating…" : "Create mock"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────

export default function AdminDashboard({ mocks, dmBank }: { mocks: MockData[]; dmBank: any[] }) {
  const [tab, setTab] = useState<"mocks" | "practice">("mocks");
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showAddMock, setShowAddMock] = useState(false);

  const handleSaved = useCallback((id: string) => {
    setSavedIds(prev => new Set([...prev, id]));
  }, []);

  const tabs = [
    { key: "mocks" as const,    label: "Mocks",              count: mocks.length },
    { key: "practice" as const, label: "Practice Questions", count: dmBank.length },
  ];

  const totalQ = mocks.reduce((s, m) => s + m.vr.reduce((a, p) => a + p.questions.length, 0) + m.dm.length + m.qr.reduce((a, d) => a + d.questions.length, 0) + m.sjt.reduce((a, sc) => a + sc.questions.length, 0), 0);

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

        {/* Overview cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Mock Tests", value: mocks.length, color: "#2D7FF9", tint: "#EAF2FF" },
            { label: "Mock Questions", value: totalQ, color: "#8B6BFF", tint: "#F1ECFF" },
            { label: "Practice Questions", value: dmBank.length, color: "#3DBE6C", tint: "#EDFBF3" },
          ].map(card => (
            <div key={card.label} style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: "18px 22px" }}>
              <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 850, color: card.color, letterSpacing: ".08em" }}>{card.label.toUpperCase()}</p>
              <p style={{ margin: 0, fontSize: 32, fontWeight: 850, color: "#1a2535", lineHeight: 1 }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "white", border: "1px solid #e5e9f0", borderRadius: 11, padding: 4, alignSelf: "start", width: "fit-content" }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                border: 0, borderRadius: 8, padding: "8px 18px", cursor: "pointer",
                background: tab === t.key ? "#1a2535" : "transparent",
                color: tab === t.key ? "white" : "#6b7a8c",
                fontWeight: tab === t.key ? 800 : 600, fontSize: 12,
                transition: "all .15s",
              }}
            >
              {t.label}
              <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>({t.count})</span>
            </button>
          ))}
        </div>

        {/* Mocks tab */}
        {tab === "mocks" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7a8c" }}>Click a section to expand questions. Click any question to edit it.</p>
              <button
                onClick={() => setShowAddMock(true)}
                style={{ border: 0, background: "#2D7FF9", color: "white", borderRadius: 10, padding: "9px 18px", fontWeight: 800, fontSize: 12, cursor: "pointer" }}
              >
                + New mock
              </button>
            </div>
            {mocks.map(mock => (
              <div key={mock.id}>
                <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 800, color: "#1a2535" }}>{mock.label}</p>
                <MockSection mock={mock} savedIds={savedIds} onEdit={setEditTarget} />
              </div>
            ))}
          </div>
        )}

        {/* Practice tab */}
        {tab === "practice" && (
          <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: "22px" }}>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6b7a8c" }}>Browse and edit individual practice questions. Click any card to open the editor.</p>
            <PracticeSection dmBank={dmBank} savedIds={savedIds} onEdit={setEditTarget} />
          </div>
        )}

      </div>

      {/* Question editor panel */}
      {editTarget && (
        <QuestionEditor
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Add mock modal */}
      {showAddMock && <AddMockModal onClose={() => setShowAddMock(false)} />}
    </div>
  );
}
