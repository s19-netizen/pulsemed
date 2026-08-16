"use client";
import { useState, useCallback, useEffect } from "react";
import type { VRPassage, QRDataset, SJTScenario, DMQuestion } from "@/lib/mock1Data";
import type { DiagQuestion } from "@/lib/diagnosticData";
import { CreateVR }  from "./CreateVR";
import { CreateDM }  from "./CreateDM";
import { CreateQR }  from "./CreateQR";
import { CreateSJT } from "./CreateSJT";
import { BulkImport } from "./BulkImport";

// ── Types ─────────────────────────────────────────────────────────────────────

type MockData = { id: string; label: string; vr: VRPassage[]; dm: DMQuestion[]; qr: QRDataset[]; sjt: SJTScenario[] };
type EditTarget = { mockId: string; section: string; questionId: string; question: any; context?: string; contextLabel?: string };
type PresentationType = "text" | "table" | "bar" | "line" | "pie";
type MainTab = "mocks" | "create" | "library" | "bulk" | "diagnostic";

// ── Constants ─────────────────────────────────────────────────────────────────

const COLORS: Record<string, string> = { vr: "#2D7FF9", dm: "#8B6BFF", qr: "#3DBE6C", sjt: "#FF6B5C" };
const TINTS:  Record<string, string> = { vr: "#EAF2FF", dm: "#F1ECFF", qr: "#EDFBF3", sjt: "#FFEDEA" };
const DIFFS   = ["Bronze","Silver","Gold","Diamond"];
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

// ── Shared helpers ─────────────────────────────────────────────────────────────

const qText    = (q: any) => q?.questionText ?? q?.question ?? q?.stem ?? q?.question_text ?? "";
const qOptions = (q: any): string[] => q?.options ?? q?.opts ?? [];
const qCorrect = (q: any): number => q?.correct ?? q?.cor ?? 0;
const qExpl    = (q: any): string => q?.explanation ?? "";
const qId      = (q: any): string => String(q?.id ?? "");

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

// ── Question card ─────────────────────────────────────────────────────────────

function QuestionCard({ q, section, onClick, saved, badge }: { q: any; section: string; onClick: () => void; saved: boolean; badge?: string }) {
  const text = qText(q);
  const opts = qOptions(q);
  const cor  = typeof qCorrect(q) === "number" ? qCorrect(q) : 0;
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

// ── Question editor (slide-in) ────────────────────────────────────────────────

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
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {options.map((opt, idx) => {
                const isCor = correct === idx;
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={() => setCorrect(idx)} style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, border: isCor ? `2px solid ${color}` : "1.5px solid #dce2ea", background: isCor ? tint : "white", color: isCor ? color : "#9ba6b5", fontWeight: 850, fontSize: 11, cursor: "pointer" }}>{String.fromCharCode(65 + idx)}</button>
                    <input value={opt} onChange={e => { const n = [...options]; n[idx] = e.target.value; setOptions(n); }} style={{ flex: 1, border: isCor ? `1.5px solid ${color}` : "1.5px solid #e5e9f0", background: isCor ? tint : "white", borderRadius: 9, padding: "9px 12px", fontSize: 13, color: "#1a2535", outline: "none" }} />
                    {isCor && <span style={{ fontSize: 10, fontWeight: 800, color, whiteSpace: "nowrap" }}>✓ correct</span>}
                  </div>
                );
              })}
            </div>
            <button onClick={() => setOptions([...options, ""])} style={{ marginTop: 8, border: "1.5px dashed #dce2ea", background: "none", borderRadius: 8, padding: "6px 14px", fontSize: 11, color: "#9ba6b5", cursor: "pointer" }}>+ Add option</button>
          </Field>
          <Field label="EXPLANATION" color={color}>
            <textarea value={explanation} onChange={e => setExplanation(e.target.value)} rows={6} style={ta} />
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
          <button key={s.key} onClick={() => setOpenSection(prev => prev === s.key ? null : s.key)} style={{ flex: 1, padding: "12px 8px", border: 0, background: "none", cursor: "pointer", borderBottom: openSection === s.key ? `2.5px solid ${COLORS[s.key]}` : "2.5px solid transparent", color: openSection === s.key ? COLORS[s.key] : "#6b7a8c", fontWeight: openSection === s.key ? 800 : 600, fontSize: 11 }}>
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
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(10,20,40,.45)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "white", borderRadius: 16, padding: "28px 30px", width: 400, boxShadow: "0 16px 48px rgba(0,0,0,.15)" }}>
        {done ? (
          <><p style={{ fontSize: 16, fontWeight: 800, color: "#1a2535", margin: "0 0 8px" }}>Mock created ✓</p><p style={{ fontSize: 13, color: "#6b7a8c", margin: "0 0 20px" }}>"{title}" has been saved.</p><button onClick={onClose} style={primary("#2D7FF9")}>Done</button></>
        ) : (
          <>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#1a2535", margin: "0 0 4px" }}>New Mock Test</p>
            <p style={{ fontSize: 12, color: "#9ba6b5", margin: "0 0 18px" }}>Give it a name — you'll add sections and questions after.</p>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Mock Test 3" style={{ width: "100%", border: "1.5px solid #e5e9f0", borderRadius: 9, padding: "10px 13px", fontSize: 14, color: "#1a2535", marginBottom: 16, boxSizing: "border-box" as const }} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={ghost}>Cancel</button>
              <button onClick={handleCreate} disabled={saving || !title.trim()} style={{ ...primary("#2D7FF9"), opacity: (!title.trim() || saving) ? 0.5 : 1 }}>{saving ? "Creating…" : "Create mock"}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Create tab ────────────────────────────────────────────────────────────────

function CreateTab() {
  const [section, setSection] = useState<string>("vr");
  const [key, setKey] = useState(0);
  const sections = ["vr","dm","qr","sjt"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 4, background: "white", border: "1px solid #e5e9f0", borderRadius: 11, padding: 4, width: "fit-content" }}>
        {sections.map(s => (
          <button key={s} onClick={() => setSection(s)} style={{ border: 0, borderRadius: 8, padding: "7px 18px", cursor: "pointer", background: section === s ? COLORS[s] : "transparent", color: section === s ? "white" : "#6b7a8c", fontWeight: section === s ? 800 : 600, fontSize: 12, transition: "all .15s" }}>{s.toUpperCase()}</button>
        ))}
      </div>
      <div key={`${section}-${key}`}>
        {section === "vr"  && <CreateVR  onSaved={() => setKey(k => k + 1)} />}
        {section === "dm"  && <CreateDM  onSaved={() => setKey(k => k + 1)} />}
        {section === "qr"  && <CreateQR  onSaved={() => setKey(k => k + 1)} />}
        {section === "sjt" && <CreateSJT onSaved={() => setKey(k => k + 1)} />}
      </div>
    </div>
  );
}

// ── Library tab ───────────────────────────────────────────────────────────────

function LibraryTab({ savedIds, onEdit }: { savedIds: Set<string>; onEdit: (t: EditTarget) => void }) {
  const [section, setSection] = useState<string>("vr");
  const [search, setSearch] = useState("");
  const [adminQs, setAdminQs] = useState<any[]>([]);
  const [sourceQs, setSourceQs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function load(sec: string, q: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/library?section=${sec}&search=${encodeURIComponent(q)}&limit=60`);
    const data = await res.json();
    setAdminQs(data.adminQuestions ?? []);
    setSourceQs(data.sourceQuestions ?? []);
    setLoading(false);
  }

  useEffect(() => { load(section, ""); }, [section]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load(section, search);
  }

  const color = COLORS[section];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, background: "white", border: "1px solid #e5e9f0", borderRadius: 11, padding: 4 }}>
          {["vr","dm","qr","sjt"].map(s => (
            <button key={s} onClick={() => { setSection(s); setSearch(""); }} style={{ border: 0, borderRadius: 8, padding: "7px 18px", cursor: "pointer", background: section === s ? COLORS[s] : "transparent", color: section === s ? "white" : "#6b7a8c", fontWeight: section === s ? 800 : 600, fontSize: 12, transition: "all .15s" }}>{s.toUpperCase()}</button>
          ))}
        </div>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, flex: 1, maxWidth: 380 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search question text…" style={{ flex: 1, border: "1.5px solid #e5e9f0", borderRadius: 9, padding: "8px 13px", fontSize: 13, color: "#1a2535", outline: "none" }} />
          <button type="submit" style={{ ...primary(color), padding: "8px 16px", fontSize: 12 }}>Search</button>
          {search && <button type="button" onClick={() => { setSearch(""); load(section, ""); }} style={ghost}>Clear</button>}
        </form>
      </div>

      {loading && <p style={{ fontSize: 13, color: "#9ba6b5", padding: "12px 0" }}>Loading…</p>}

      {!loading && adminQs.length === 0 && sourceQs.length === 0 && (
        <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: "28px", textAlign: "center" }}>
          <p style={{ color: "#9ba6b5", fontSize: 13, margin: 0 }}>No questions found{search ? ` for "${search}"` : ""}. Create some in the Create tab or import via Bulk Import.</p>
        </div>
      )}

      {!loading && adminQs.length > 0 && (
        <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 20 }}>
          <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 800, color: color }}>ADMIN-CREATED ({adminQs.length})</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 500, overflowY: "auto" }}>
            {adminQs.map(q => (
              <QuestionCard key={q.id} q={q} section={section} saved={savedIds.has(q.id)} badge={q.q_type ?? undefined}
                onClick={() => onEdit({ mockId: "admin", section, questionId: q.id, question: q, context: (q.admin_passages as any)?.content, contextLabel: section === "vr" ? "PASSAGE" : section === "sjt" ? "SCENARIO" : "CONTEXT" })} />
            ))}
          </div>
        </div>
      )}

      {!loading && sourceQs.length > 0 && (
        <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 20 }}>
          <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 800, color: "#6b7a8c" }}>EXISTING IN SUPABASE ({sourceQs.length})</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 500, overflowY: "auto" }}>
            {sourceQs.map(q => (
              <QuestionCard key={q.id} q={q} section={section} saved={savedIds.has(q.id)} badge={q.subtype ?? undefined}
                onClick={() => onEdit({ mockId: "practice", section, questionId: q.id, question: q, context: q.context, contextLabel: section === "vr" ? "PASSAGE" : "CONTEXT" })} />
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
  const [search, setSearch] = useState("");
  const filtered = questions.filter(q => q.section === section && (!search || qText(q).toLowerCase().includes(search.toLowerCase())));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, background: "white", border: "1px solid #e5e9f0", borderRadius: 11, padding: 4 }}>
          {["vr","dm","qr","sjt"].map(s => (
            <button key={s} onClick={() => setSection(s)} style={{ border: 0, borderRadius: 8, padding: "7px 16px", cursor: "pointer", background: section === s ? COLORS[s] : "transparent", color: section === s ? "white" : "#6b7a8c", fontWeight: section === s ? 800 : 600, fontSize: 12 }}>{s.toUpperCase()}</button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ border: "1.5px solid #e5e9f0", borderRadius: 9, padding: "8px 13px", fontSize: 13, color: "#1a2535", outline: "none", width: 220 }} />
      </div>
      <div style={{ background: "white", border: "1px solid #e5e9f0", borderRadius: 14, padding: 20 }}>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#6b7a8c" }}>{filtered.length} diagnostic questions in {section.toUpperCase()}. Click any to edit.</p>
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

// ── Main dashboard ────────────────────────────────────────────────────────────

export default function AdminDashboard({ mocks, dmBank, diagQuestions }: { mocks: MockData[]; dmBank: any[]; diagQuestions: DiagQuestion[] }) {
  const [tab, setTab] = useState<MainTab>("mocks");
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showAddMock, setShowAddMock] = useState(false);
  const handleSaved = useCallback((id: string) => setSavedIds(prev => new Set([...prev, id])), []);

  const totalMockQ = mocks.reduce((s, m) =>
    s + m.vr.reduce((a, p) => a + p.questions.length, 0) + m.dm.length
      + m.qr.reduce((a, d) => a + d.questions.length, 0)
      + m.sjt.reduce((a, sc) => a + sc.questions.length, 0), 0);

  const TABS: { key: MainTab; label: string }[] = [
    { key: "mocks",      label: "Mocks" },
    { key: "create",     label: "Create" },
    { key: "library",    label: "Library" },
    { key: "bulk",       label: "Bulk Import" },
    { key: "diagnostic", label: "Diagnostic" },
  ];

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
        <span style={{ fontSize: 11, color: "#9ba6b5" }}>sawdaj19@gmail.com</span>
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

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "white", border: "1px solid #e5e9f0", borderRadius: 11, padding: 4, width: "fit-content" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ border: 0, borderRadius: 8, padding: "8px 18px", cursor: "pointer", background: tab === t.key ? "#1a2535" : "transparent", color: tab === t.key ? "white" : "#6b7a8c", fontWeight: tab === t.key ? 800 : 600, fontSize: 12, transition: "all .15s" }}>{t.label}</button>
          ))}
        </div>

        {/* Mocks */}
        {tab === "mocks" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7a8c" }}>Click a section to expand, then a question to edit it.</p>
              <button onClick={() => setShowAddMock(true)} style={primary("#2D7FF9")}>+ New mock</button>
            </div>
            {mocks.map(mock => (
              <div key={mock.id}>
                <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 800, color: "#1a2535" }}>{mock.label}</p>
                <MockSection mock={mock} savedIds={savedIds} onEdit={setEditTarget} />
              </div>
            ))}
          </div>
        )}

        {tab === "create"     && <CreateTab />}
        {tab === "library"    && <LibraryTab savedIds={savedIds} onEdit={setEditTarget} />}
        {tab === "bulk"       && <BulkImport />}
        {tab === "diagnostic" && <DiagnosticSection questions={diagQuestions} savedIds={savedIds} onEdit={setEditTarget} />}
      </div>

      {editTarget  && <QuestionEditor target={editTarget} onClose={() => setEditTarget(null)} onSaved={handleSaved} />}
      {showAddMock && <AddMockModal onClose={() => setShowAddMock(false)} />}
    </div>
  );
}
