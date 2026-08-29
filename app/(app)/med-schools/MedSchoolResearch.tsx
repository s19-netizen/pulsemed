"use client";
import { useState, useMemo } from "react";
import schoolsRaw from "@/lib/data/med-schools.json";

function makeSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Types ─────────────────────────────────────────────────────────────────────

type SubjectReq = { chemistry: "required" | "or-bio" | "none"; biology: "required" | "or-chem" | "none" };

type School = {
  name: string; location: string; course: string; eligibility: string; length: string;
  aLevelReq: string; minGrades: string; subjectReq: SubjectReq; gcseReq: string;
  ucatPolicy: string; ucatWeight: "dominant" | "composite" | "minimum" | "none";
  ucatDetail: string; selectionModel: string; contextual: boolean; contextualDetail: string;
  teachingModel: string; studentLife: string; mscUrl: string; uniUrl: string;
  strategicNote: string; tier: number;
};

type Grade = "A*" | "A" | "B" | "C" | "D" | "E" | "none";
type Category = "stretch" | "likely" | "safe";

// ── Constants ─────────────────────────────────────────────────────────────────

const schools = schoolsRaw as School[];

const GRADE_VAL: Record<Grade, number> = { "A*": 5, A: 4, B: 3, C: 2, D: 1, E: 0, none: -1 };
const GRADE_OPTS: Grade[] = ["A*", "A", "B", "C", "D", "E"];

const DECILES = [
  { pct: 90, score: 2220 }, { pct: 80, score: 2100 }, { pct: 70, score: 2010 },
  { pct: 60, score: 1950 }, { pct: 50, score: 1880 }, { pct: 40, score: 1820 },
  { pct: 30, score: 1760 }, { pct: 20, score: 1680 }, { pct: 10, score: 1580 },
];

const TIER_SAFE: Record<number, number>    = { 1: 85, 2: 70, 3: 55, 4: 40 };
const TIER_LIKELY: Record<number, number>  = { 1: 65, 2: 50, 3: 35, 4: 20 };
const TIER_STRETCH: Record<number, number> = { 1: 40, 2: 25, 3: 10, 4: 5  };
const TIER_LABELS: Record<number, string>  = { 1: "Very competitive", 2: "Competitive", 3: "Standard", 4: "Accessible" };

const CAT_CONFIG: Record<Category, { label: string; accent: string; light: string; border: string; dot: string; tag: string }> = {
  stretch: { label: "Stretch",  accent: "#DC2626", light: "#FEF2F2", border: "#FECACA", dot: "#EF4444", tag: "#FEE2E2" },
  likely:  { label: "Likely",   accent: "#D97706", light: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B", tag: "#FEF3C7" },
  safe:    { label: "Safe",     accent: "#059669", light: "#F0FDF4", border: "#A7F3D0", dot: "#10B981", tag: "#D1FAE5" },
};

// ── Utilities ─────────────────────────────────────────────────────────────────

function ucatPercentile(score: number): number {
  for (const d of DECILES) { if (score >= d.score) return d.pct; }
  return score >= 900 ? 5 : 0;
}
function gradeVal(g: Grade): number { return GRADE_VAL[g] ?? -1; }

function parseMinGrades(s: string): Grade[] {
  const map: Record<string, Grade> = { "A*": "A*", A: "A", B: "B", C: "C", D: "D", E: "E" };
  return (s.match(/A\*|[A-E]/g) ?? ["A", "A", "A"]).slice(0, 3).map(c => map[c] ?? "A") as Grade[];
}

function meetsALevels(school: School, chem: Grade, bio: Grade, third: Grade): "yes" | "comfortably" | "no" {
  const sr = school.subjectReq;
  if (sr.chemistry === "required" && gradeVal(chem) < 0) return "no";
  if (sr.biology === "required" && gradeVal(bio) < 0) return "no";
  if (sr.chemistry === "or-bio" && gradeVal(chem) < 0 && gradeVal(bio) < 0) return "no";
  const mins = parseMinGrades(school.minGrades);
  const studentGrades = [chem, bio, third].filter(g => gradeVal(g) >= 0).sort((a, b) => gradeVal(b) - gradeVal(a)) as Grade[];
  if (studentGrades.length < 3) return "no";
  const meets = mins.every((min, i) => gradeVal(studentGrades[i]) >= gradeVal(min));
  if (!meets) return "no";
  return mins.every((min, i) => gradeVal(studentGrades[i]) > gradeVal(min)) ? "comfortably" : "yes";
}

function categorize(school: School, chem: Grade, bio: Grade, third: Grade, ucatScore: number): Category | "ineligible" {
  const aLevel = meetsALevels(school, chem, bio, third);
  if (aLevel === "no") return "ineligible";
  const pct = ucatScore > 0 ? ucatPercentile(ucatScore) : 0;
  const aLevelBoost = aLevel === "comfortably" ? 10 : 0;
  const effectivePct = pct + aLevelBoost;
  if (school.ucatWeight === "none") {
    if (school.tier >= 3) return aLevel === "comfortably" ? "safe" : "likely";
    if (school.tier === 2) return "likely";
    return "stretch";
  }
  const evalPct = ucatScore > 0 ? effectivePct : 50 + aLevelBoost;
  if (evalPct >= TIER_SAFE[school.tier]) return "safe";
  if (evalPct >= TIER_LIKELY[school.tier]) return "likely";
  if (evalPct >= TIER_STRETCH[school.tier]) return "stretch";
  return "ineligible";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function GradeSelect({ label, value, onChange, allowNone }: {
  label: string; value: Grade; onChange: (g: Grade) => void; allowNone?: boolean;
}) {
  const gradeColors: Record<string, string> = {
    "A*": "#7C3AED", A: "#2563EB", B: "#059669", C: "#D97706", D: "#DC2626", E: "#6B7280", none: "#9CA3AF",
  };
  const color = gradeColors[value] ?? "#2563EB";
  return (
    <div>
      <label style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--ink-soft)", display: "block", marginBottom: 5 }}>
        {label}
      </label>
      <select value={value} onChange={e => onChange(e.target.value as Grade)} style={{
        width: "100%", padding: "9px 12px", borderRadius: 9,
        border: `2px solid ${color}40`,
        background: `${color}10`,
        fontSize: 15, fontWeight: 800, color, cursor: "pointer", appearance: "auto",
        outline: "none",
      }}>
        {allowNone && <option value="none">Not studying</option>}
        {GRADE_OPTS.map(g => <option key={g} value={g}>{g}</option>)}
      </select>
    </div>
  );
}

function SchoolCard({ school, category }: { school: School; category: Category }) {
  const [expanded, setExpanded] = useState(false);
  const c = CAT_CONFIG[category];
  const tierLabel = TIER_LABELS[school.tier] ?? "Standard";
  const slug = makeSlug(school.name);

  const ucatBadgeColor = school.ucatWeight === "dominant" ? "#7C3AED"
    : school.ucatWeight === "none" ? "#6B7280"
    : "#2563EB";

  return (
    <div style={{
      background: "#fff", borderRadius: 14, overflow: "hidden",
      border: `1.5px solid ${expanded ? c.border : "var(--line)"}`,
      boxShadow: expanded ? `0 4px 24px ${c.accent}15` : "0 1px 4px rgba(0,0,0,0.06)",
      transition: "all .2s",
    }}>
      {/* Coloured top stripe */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${c.accent}, ${c.dot})` }} />

      <div style={{ padding: "16px 18px 14px" }}>
        {/* Top row: name + category badge */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 800, margin: "0 0 3px", lineHeight: 1.3, color: "#111" }}>
              {school.name}
            </p>
            <p style={{ fontSize: 11, color: "#6B7280", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
              📍 {school.location} &nbsp;·&nbsp; {school.course} &nbsp;·&nbsp; {school.length}
            </p>
          </div>
          <span style={{
            flexShrink: 0, fontSize: 11, fontWeight: 900, textTransform: "uppercase",
            letterSpacing: ".06em", padding: "4px 10px", borderRadius: 20,
            background: c.tag, color: c.accent, border: `1.5px solid ${c.border}`,
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
            {c.label}
          </span>
        </div>

        {/* Badges row */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          <span style={{
            fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 6,
            background: "#EEF2FF", color: "#4338CA", border: "1px solid #C7D2FE",
          }}>
            {school.minGrades}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
            background: `${ucatBadgeColor}15`, color: ucatBadgeColor, border: `1px solid ${ucatBadgeColor}30`,
          }}>
            {school.ucatWeight === "none" ? "No UCAT" : school.ucatWeight === "dominant" ? "UCAT-dominant" : "UCAT composite"}
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
            background: "#F9FAFB", color: "#374151", border: "1px solid #E5E7EB",
          }}>
            {tierLabel}
          </span>
          {school.contextual && (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
              background: "#F0FDF4", color: "#065F46", border: "1px solid #A7F3D0",
            }}>
              Contextual ✓
            </span>
          )}
        </div>

        {/* Action row */}
        <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
          <a href={`/med-schools/${slug}`} style={{
            fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 8,
            background: c.accent, color: "#fff", textDecoration: "none",
            border: "none", whiteSpace: "nowrap",
          }}>
            Full profile →
          </a>
          {school.mscUrl && (
            <a href={school.mscUrl} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 8,
              background: "#EEF2FF", color: "#4338CA",
              border: "1px solid #C7D2FE", textDecoration: "none",
            }}>
              MSC ↗
            </a>
          )}
          {school.uniUrl && (
            <a href={school.uniUrl} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 8,
              background: "#F9FAFB", color: "#374151",
              border: "1px solid #E5E7EB", textDecoration: "none",
            }}>
              Apply ↗
            </a>
          )}
          <button onClick={() => setExpanded(e => !e)} style={{
            marginLeft: "auto", background: "none", border: "none",
            fontSize: 12, fontWeight: 700, color: "#9CA3AF",
            cursor: "pointer", padding: "4px 0",
          }}>
            {expanded ? "Less ▲" : "Details ▼"}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${c.border}`, background: c.light, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
          {school.strategicNote && (
            <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em", color: "#92400E", margin: "0 0 5px" }}>Strategy</p>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: "#78350F", margin: 0 }}>{school.strategicNote}</p>
            </div>
          )}
          <div>
            <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em", color: "#6B7280", margin: "0 0 4px" }}>A-level requirement</p>
            <p style={{ fontSize: 12, lineHeight: 1.55, color: "#111", margin: 0 }}>{school.aLevelReq}</p>
          </div>
          <div>
            <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em", color: "#6B7280", margin: "0 0 4px" }}>UCAT detail</p>
            <p style={{ fontSize: 12, lineHeight: 1.55, color: "#111", margin: 0 }}>{school.ucatDetail}</p>
          </div>
          {school.contextual && (
            <div>
              <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em", color: "#6B7280", margin: "0 0 4px" }}>Contextual routes</p>
              <p style={{ fontSize: 12, lineHeight: 1.55, color: "#111", margin: 0 }}>{school.contextualDetail}</p>
            </div>
          )}
          <div>
            <p style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em", color: "#6B7280", margin: "0 0 4px" }}>Student life</p>
            <p style={{ fontSize: 12, lineHeight: 1.55, color: "#111", margin: 0 }}>{school.studentLife}</p>
          </div>
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

  const ucatScore  = parseInt(ucatInput, 10) || 0;
  const percentile = ucatScore > 0 ? ucatPercentile(ucatScore) : null;

  const { stretch, likely, safe, ineligible } = useMemo(() => {
    const out: Record<string, School[]> = { stretch: [], likely: [], safe: [], ineligible: [] };
    for (const s of schools) { out[categorize(s, chem, bio, third, ucatScore)].push(s); }
    return out;
  }, [chem, bio, third, ucatScore]);

  const counts = { stretch: stretch.length, likely: likely.length, safe: safe.length };
  const shown  = filter === "stretch" ? stretch : filter === "likely" ? likely : safe;

  const pctColor = percentile === null ? "#9CA3AF"
    : percentile >= 70 ? "#059669"
    : percentile >= 50 ? "#2563EB"
    : percentile >= 30 ? "#D97706"
    : "#DC2626";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24 }}>

      {/* ── Left panel ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        <div className="page-header" style={{ paddingBottom: 0 }}>
          <p className="eyebrow">Application</p>
          <div className="title-row">
            <span className="section-badge" style={{ background: "#D1FAE5", color: "#065F46" }}>UK</span>
            <h1 style={{ fontSize: 20 }}>Schools</h1>
          </div>
        </div>

        {/* Grades card */}
        <div style={{
          background: "#fff", borderRadius: 14, border: "1.5px solid #E5E7EB",
          padding: "18px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em", color: "#6B7280", margin: "0 0 14px" }}>
            Predicted A-levels
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            <GradeSelect label="Chemistry" value={chem} onChange={setChem} allowNone />
            <GradeSelect label="Biology" value={bio} onChange={setBio} allowNone />
            <GradeSelect label="3rd A-level (best)" value={third} onChange={setThird} />
          </div>
        </div>

        {/* UCAT card */}
        <div style={{
          background: "#fff", borderRadius: 14, border: "1.5px solid #E5E7EB",
          padding: "18px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}>
          <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em", color: "#6B7280", margin: "0 0 12px" }}>
            UCAT total score
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="number" min={900} max={2700} value={ucatInput}
              onChange={e => setUcatInput(e.target.value)}
              placeholder="e.g. 2100"
              style={{
                flex: 1, padding: "10px 12px", borderRadius: 9,
                border: "2px solid #E5E7EB", background: "#F9FAFB",
                fontSize: 16, fontWeight: 800, color: "#111",
                outline: "none", width: "100%",
              }}
            />
            <span style={{ fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap", fontWeight: 600 }}>/2700</span>
          </div>
          {percentile !== null ? (
            <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: `${pctColor}15`, border: `1px solid ${pctColor}30` }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: pctColor, margin: 0 }}>
                ~{percentile}th percentile
              </p>
            </div>
          ) : (
            <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 8, lineHeight: 1.55, margin: "8px 0 0" }}>
              Enter your score. Shown at 50th percentile until you add one.
            </p>
          )}
        </div>

        {/* Hidden count */}
        {ineligible.length > 0 && (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
            <p style={{ fontSize: 11, color: "#6B7280", margin: 0 }}>
              <strong style={{ color: "#374151" }}>{ineligible.length} schools</strong> hidden — A-level requirements not met.
            </p>
          </div>
        )}

        {/* Warning */}
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "#FFFBEB", border: "1.5px solid #FDE68A" }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: "#92400E", textTransform: "uppercase", letterSpacing: ".06em", margin: "0 0 4px" }}>Note</p>
          <p style={{ fontSize: 11, color: "#92400E", margin: 0, lineHeight: 1.55 }}>
            No school is truly "safe." Always verify requirements on each school's official site.
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 10 }}>
          {(["stretch", "likely", "safe"] as Category[]).map(cat => {
            const c = CAT_CONFIG[cat];
            const isActive = filter === cat;
            return (
              <button key={cat} onClick={() => setFilter(cat)} type="button" style={{
                flex: 1, padding: "12px 16px", borderRadius: 12,
                border: isActive ? `2px solid ${c.border}` : "2px solid #E5E7EB",
                background: isActive ? c.light : "#fff",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
                transition: "all .15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                boxShadow: isActive ? `0 2px 12px ${c.accent}20` : "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: isActive ? c.accent : "#374151" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? c.dot : "#D1D5DB" }} />
                  {c.label}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? c.accent : "#9CA3AF" }}>
                  {counts[cat]} school{counts[cat] !== 1 ? "s" : ""}
                </span>
              </button>
            );
          })}
        </div>

        {/* School cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {shown.length === 0 ? (
            <div style={{
              padding: "48px 24px", borderRadius: 14, background: "#F9FAFB",
              border: "1.5px dashed #E5E7EB", textAlign: "center",
            }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#374151", margin: "0 0 6px" }}>No {filter} schools for this profile</p>
              <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>Try adjusting your grades or UCAT score.</p>
            </div>
          ) : (
            shown.map(school => (
              <SchoolCard key={school.name} school={school} category={filter} />
            ))
          )}
        </div>

        <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0, textAlign: "right" }}>
          Data: UK Medical Schools Council 2027 · 29 Aug 2026 · UCAT deciles: 2025 cohort
        </p>
      </div>

    </div>
  );
}
