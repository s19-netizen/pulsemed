"use client";
import { useState, useMemo } from "react";
import schoolsRaw from "@/lib/data/med-schools.json";

function makeSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Types ─────────────────────────────────────────────────────────────────────

type SubjectReq = { chemistry: "required" | "or-bio" | "none"; biology: "required" | "or-chem" | "none" };

type School = {
  name: string;
  location: string;
  course: string;
  eligibility: string;
  length: string;
  aLevelReq: string;
  minGrades: string;
  subjectReq: SubjectReq;
  gcseReq: string;
  ucatPolicy: string;
  ucatWeight: "dominant" | "composite" | "minimum" | "none";
  ucatDetail: string;
  selectionModel: string;
  contextual: boolean;
  contextualDetail: string;
  teachingModel: string;
  studentLife: string;
  mscUrl: string;
  uniUrl: string;
  strategicNote: string;
  tier: number;
};

type Grade = "A*" | "A" | "B" | "C" | "D" | "E" | "none";
type Category = "stretch" | "likely" | "safe";

// ── Constants ─────────────────────────────────────────────────────────────────

const schools = schoolsRaw as School[];

const GRADE_VAL: Record<Grade, number> = { "A*": 5, A: 4, B: 3, C: 2, D: 1, E: 0, none: -1 };
const GRADE_OPTS: Grade[] = ["A*", "A", "B", "C", "D", "E"];

// 2025 UCAT deciles (900–2700 scale)
const DECILES = [
  { pct: 90, score: 2220 },
  { pct: 80, score: 2100 },
  { pct: 70, score: 2010 },
  { pct: 60, score: 1950 },
  { pct: 50, score: 1880 },
  { pct: 40, score: 1820 },
  { pct: 30, score: 1760 },
  { pct: 20, score: 1680 },
  { pct: 10, score: 1580 },
];

// How competitive your UCAT needs to be for each school tier
const TIER_SAFE: Record<number, number>    = { 1: 85, 2: 70, 3: 55, 4: 40 };
const TIER_LIKELY: Record<number, number>  = { 1: 65, 2: 50, 3: 35, 4: 20 };
const TIER_STRETCH: Record<number, number> = { 1: 40, 2: 25, 3: 10, 4: 5  };

const TIER_LABELS: Record<number, string> = {
  1: "Very competitive",
  2: "Competitive",
  3: "Standard",
  4: "Accessible",
};

const CAT_COLORS: Record<Category, { bg: string; border: string; text: string; dot: string }> = {
  stretch: { bg: "#FEE2E2", border: "#F87171", text: "#991B1B", dot: "#EF4444" },
  likely:  { bg: "#FEF3C7", border: "#FCD34D", text: "#92400E", dot: "#F59E0B" },
  safe:    { bg: "#DCFCE7", border: "#86EFAC", text: "#166534", dot: "#22C55E" },
};

// ── Utilities ─────────────────────────────────────────────────────────────────

function ucatPercentile(score: number): number {
  for (const d of DECILES) {
    if (score >= d.score) return d.pct;
  }
  return score >= 900 ? 5 : 0;
}

function gradeVal(g: Grade): number { return GRADE_VAL[g] ?? -1; }

function parseMinGrades(s: string): Grade[] {
  const map: Record<string, Grade> = { "A*": "A*", A: "A", B: "B", C: "C", D: "D", E: "E" };
  return (s.match(/A\*|[A-E]/g) ?? ["A", "A", "A"])
    .slice(0, 3)
    .map(c => map[c] ?? "A") as Grade[];
}

function meetsALevels(
  school: School,
  chem: Grade, bio: Grade, third: Grade
): "yes" | "comfortably" | "no" {
  const sr = school.subjectReq;

  // Chemistry eligibility
  if (sr.chemistry === "required" && gradeVal(chem) < 0) return "no";
  if (sr.biology === "required" && gradeVal(bio) < 0) return "no";
  // "or-bio" = needs either Chemistry or Biology
  if (sr.chemistry === "or-bio" && gradeVal(chem) < 0 && gradeVal(bio) < 0) return "no";

  const mins = parseMinGrades(school.minGrades);
  // Student's 3 best grades (exclude "none")
  const studentGrades = [chem, bio, third]
    .filter(g => gradeVal(g) >= 0)
    .sort((a, b) => gradeVal(b) - gradeVal(a)) as Grade[];

  if (studentGrades.length < 3) return "no";

  const meets = mins.every((min, i) => gradeVal(studentGrades[i]) >= gradeVal(min));
  if (!meets) return "no";

  const comfortably = mins.every((min, i) => gradeVal(studentGrades[i]) > gradeVal(min));
  return comfortably ? "comfortably" : "yes";
}

function categorize(
  school: School,
  chem: Grade, bio: Grade, third: Grade,
  ucatScore: number,
): Category | "ineligible" {
  const aLevel = meetsALevels(school, chem, bio, third);
  if (aLevel === "no") return "ineligible";

  const pct = ucatScore > 0 ? ucatPercentile(ucatScore) : 0;
  const tier = school.tier;
  const aLevelBoost = aLevel === "comfortably" ? 10 : 0;
  const effectivePct = pct + aLevelBoost;

  // No UCAT schools: base purely on tier + A-levels
  if (school.ucatWeight === "none") {
    if (tier >= 3) return aLevel === "comfortably" ? "safe" : "likely";
    if (tier === 2) return "likely";
    return "stretch";
  }

  // If UCAT not entered: assume average (50th percentile) as placeholder
  const evalPct = ucatScore > 0 ? effectivePct : 50 + aLevelBoost;

  if (evalPct >= TIER_SAFE[tier]) return "safe";
  if (evalPct >= TIER_LIKELY[tier]) return "likely";
  if (evalPct >= TIER_STRETCH[tier]) return "stretch";
  return "ineligible";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function GradeSelect({ label, value, onChange, allowNone }: {
  label: string; value: Grade; onChange: (g: Grade) => void; allowNone?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-soft)" }}>
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as Grade)}
        style={{
          padding: "7px 10px", borderRadius: 8, border: "1.5px solid var(--line)",
          background: "var(--surface)", fontSize: 13, fontWeight: 700, color: "var(--ink)",
          cursor: "pointer", appearance: "auto",
        }}
      >
        {allowNone && <option value="none">Not studying</option>}
        {GRADE_OPTS.map(g => <option key={g} value={g}>{g}</option>)}
      </select>
    </div>
  );
}

function SchoolCard({ school, category, expanded, onToggle }: {
  school: School; category: Category; expanded: boolean; onToggle: () => void;
}) {
  const c = CAT_COLORS[category];
  const tierLabel = TIER_LABELS[school.tier] ?? "Standard";

  return (
    <div style={{
      background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)",
      overflow: "hidden", transition: "box-shadow .15s",
    }}>
      {/* Card header */}
      <div style={{ padding: "14px 16px 12px", borderBottom: expanded ? "1px solid var(--line)" : "none" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 800, margin: "0 0 2px", lineHeight: 1.3, color: "var(--ink)" }}>
              {school.name}
            </p>
            <p style={{ fontSize: 11, color: "var(--ink-soft)", margin: 0 }}>
              {school.location} · {school.course} · {school.length}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
            <span style={{
              fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".06em",
              background: c.bg, color: c.text, border: `1px solid ${c.border}`,
              borderRadius: 20, padding: "2px 8px", display: "flex", alignItems: "center", gap: 4,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot }} />
              {category}
            </span>
            <span style={{ fontSize: 9, color: "var(--ink-soft)", fontWeight: 700 }}>{tierLabel}</span>
          </div>
        </div>

        {/* Key facts row */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, background: "#EAF2FF", color: "#2D7FF9", padding: "2px 7px", borderRadius: 5 }}>
            {school.minGrades}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, background: "#F1ECFF", color: "#8B6BFF", padding: "2px 7px", borderRadius: 5 }}>
            UCAT: {school.ucatWeight === "none" ? "not required" : school.ucatPolicy.slice(0, 28)}
          </span>
          {school.contextual && (
            <span style={{ fontSize: 10, fontWeight: 700, background: "#DCFCE7", color: "#166534", padding: "2px 7px", borderRadius: 5 }}>
              Contextual route
            </span>
          )}
        </div>

        {/* Links + expand */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <a href={`/med-schools/${makeSlug(school.name)}`} style={{
            fontSize: 11, fontWeight: 700, color: "var(--ink)",
            background: "var(--bg)", border: "1px solid var(--line)",
            borderRadius: 6, padding: "4px 10px", textDecoration: "none",
          }}>
            Full profile →
          </a>
          {school.mscUrl && (
            <a href={school.mscUrl} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 11, fontWeight: 700, color: "#2D7FF9",
              background: "#EAF2FF", border: "1px solid #c7dcff",
              borderRadius: 6, padding: "4px 10px", textDecoration: "none",
            }}>
              MSC ↗
            </a>
          )}
          {school.uniUrl && (
            <a href={school.uniUrl} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 11, fontWeight: 700, color: "#fff",
              background: "#2D7FF9", borderRadius: 6, padding: "4px 10px", textDecoration: "none",
            }}>
              Apply ↗
            </a>
          )}
          <button onClick={onToggle} style={{
            marginLeft: "auto", background: "none", border: "none", fontSize: 11,
            color: "var(--ink-soft)", cursor: "pointer", fontWeight: 700,
          }}>
            {expanded ? "Less ▲" : "Details ▼"}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "12px 16px", background: "var(--bg)", display: "flex", flexDirection: "column", gap: 10 }}>
          {school.strategicNote && (
            <div>
              <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-soft)", margin: "0 0 4px" }}>
                Strategy
              </p>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--ink)", margin: 0 }}>
                {school.strategicNote}
              </p>
            </div>
          )}
          {school.aLevelReq && (
            <div>
              <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-soft)", margin: "0 0 4px" }}>
                A-level requirement
              </p>
              <p style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ink)", margin: 0 }}>{school.aLevelReq}</p>
            </div>
          )}
          {school.ucatDetail && (
            <div>
              <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-soft)", margin: "0 0 4px" }}>
                UCAT detail
              </p>
              <p style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ink)", margin: 0 }}>{school.ucatDetail}</p>
            </div>
          )}
          {school.studentLife && (
            <div>
              <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-soft)", margin: "0 0 4px" }}>
                Student life
              </p>
              <p style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ink)", margin: 0 }}>{school.studentLife}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MedSchoolResearch() {
  const [chem, setChem]   = useState<Grade>("A");
  const [bio, setBio]     = useState<Grade>("A");
  const [third, setThird] = useState<Grade>("A");
  const [ucatInput, setUcatInput] = useState("");
  const [filter, setFilter] = useState<Category>("likely");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const ucatScore = parseInt(ucatInput, 10) || 0;
  const percentile = ucatScore > 0 ? ucatPercentile(ucatScore) : null;

  // Categorize all schools
  const { stretch, likely, safe, ineligible } = useMemo(() => {
    const out: Record<string, School[]> = { stretch: [], likely: [], safe: [], ineligible: [] };
    for (const s of schools) {
      const cat = categorize(s, chem, bio, third, ucatScore);
      out[cat].push(s);
    }
    return out;
  }, [chem, bio, third, ucatScore]);

  const counts = { stretch: stretch.length, likely: likely.length, safe: safe.length };
  const shown  = filter === "stretch" ? stretch : filter === "likely" ? likely : safe;

  function toggleExpand(name: string) {
    setExpanded(e => ({ ...e, [name]: !e[name] }));
  }

  const pctColor = percentile === null ? "var(--ink-soft)"
    : percentile >= 70 ? "#3DBE6C"
    : percentile >= 50 ? "#2D7FF9"
    : percentile >= 30 ? "#f59e0b"
    : "#d94b3e";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 20 }}>

      {/* ── Left: profile inputs ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        <div className="page-header" style={{ paddingBottom: 0 }}>
          <p className="eyebrow">Application</p>
          <div className="title-row">
            <span className="section-badge" style={{ background: "#DCFCE7", color: "#166534" }}>UK</span>
            <h1 style={{ fontSize: 20 }}>Schools</h1>
          </div>
          <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>
            45 UK medical schools · 2027 entry
          </p>
        </div>

        {/* Predicted grades */}
        <div className="content-card" style={{ padding: "14px 16px" }}>
          <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-soft)", margin: "0 0 12px" }}>
            Predicted A-levels
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <GradeSelect label="Chemistry" value={chem} onChange={setChem} allowNone />
            <GradeSelect label="Biology" value={bio} onChange={setBio} allowNone />
            <GradeSelect label="3rd A-level (best)" value={third} onChange={setThird} />
          </div>
        </div>

        {/* UCAT score */}
        <div className="content-card" style={{ padding: "14px 16px" }}>
          <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-soft)", margin: "0 0 10px" }}>
            UCAT total score
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="number"
              min={900} max={2700}
              value={ucatInput}
              onChange={e => setUcatInput(e.target.value)}
              placeholder="e.g. 2100"
              style={{
                flex: 1, padding: "8px 10px", borderRadius: 8,
                border: "1.5px solid var(--line)", background: "var(--surface)",
                fontSize: 15, fontWeight: 800, color: "var(--ink)", width: "100%",
              }}
            />
            <span style={{ fontSize: 12, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>/2700</span>
          </div>
          {percentile !== null ? (
            <p style={{ fontSize: 12, fontWeight: 700, color: pctColor, marginTop: 6 }}>
              ~{percentile}th percentile
            </p>
          ) : (
            <p style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 6, lineHeight: 1.5 }}>
              Enter your score or practice estimate. Schools are shown at average (50th pct) until you add one.
            </p>
          )}
        </div>

        {/* Ineligible count */}
        {ineligible.length > 0 && (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--line)" }}>
            <p style={{ fontSize: 11, color: "var(--ink-soft)", margin: 0, lineHeight: 1.5 }}>
              <strong style={{ color: "var(--ink)" }}>{ineligible.length} schools</strong> hidden — A-level requirements not met with current grades.
            </p>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "#FEF3C7", border: "1px solid #FDE047" }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: "#92400E", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 4px" }}>
            Note
          </p>
          <p style={{ fontSize: 11, color: "#92400E", margin: 0, lineHeight: 1.5 }}>
            No medical school is truly "safe." This tool gives strategic guidance based on 2027 data — always verify requirements on each school's official website.
          </p>
        </div>
      </div>

      {/* ── Right: results ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 8 }}>
          {(["stretch", "likely", "safe"] as Category[]).map(cat => {
            const c = CAT_COLORS[cat];
            const isActive = filter === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                type="button"
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 10, border: "none",
                  background: isActive ? c.dot : "var(--surface)",
                  color: isActive ? "#fff" : "var(--ink)",
                  fontWeight: 700, fontSize: 12, cursor: "pointer",
                  boxShadow: isActive ? `0 2px 8px ${c.dot}40` : "none",
                  transition: "all .15s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                }}
              >
                <span style={{ fontSize: 13, textTransform: "capitalize" }}>{cat}</span>
                <span style={{ fontSize: 11, opacity: isActive ? 0.85 : 0.5 }}>
                  {counts[cat]} school{counts[cat] !== 1 ? "s" : ""}
                </span>
              </button>
            );
          })}
        </div>

        {/* School cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {shown.length === 0 ? (
            <div style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", color: "var(--ink-soft)", gap: 6,
            }}>
              <p style={{ fontSize: 14, fontWeight: 700 }}>No {filter} schools for this profile</p>
              <p style={{ fontSize: 12 }}>Try adjusting your grades or UCAT score.</p>
            </div>
          ) : (
            shown.map(school => (
              <SchoolCard
                key={school.name}
                school={school}
                category={filter}
                expanded={!!expanded[school.name]}
                onToggle={() => toggleExpand(school.name)}
              />
            ))
          )}
        </div>

        {/* Footer note */}
        <p style={{ fontSize: 10, color: "var(--ink-soft)", margin: 0, flexShrink: 0, textAlign: "right" }}>
          Data: UK Medical Schools Council 2027 · verified 29 Aug 2026 · UCAT deciles: 2025 cohort
        </p>
      </div>

    </div>
  );
}
