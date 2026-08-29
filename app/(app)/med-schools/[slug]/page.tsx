import { notFound } from "next/navigation";
import type { Metadata } from "next";
import schoolsData from "@/lib/data/med-schools.json";

type SubjectReq = { chemistry: string; biology: string };
type School = {
  name: string; location: string; course: string; eligibility: string; length: string;
  aLevelReq: string; minGrades: string; subjectReq: SubjectReq; gcseReq: string;
  ucatPolicy: string; ucatWeight: string; ucatDetail: string; selectionModel: string;
  contextual: boolean; contextualDetail: string; teachingModel: string; studentLife: string;
  mscUrl: string; uniUrl: string; strategicNote: string; tier: number;
};

const schools = schoolsData as School[];

function makeSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Coordinates (lat, lon) for OpenStreetMap embed ─────────────────────────
const COORDS: Record<string, [number, number]> = {
  "Anglia Ruskin University":                               [51.7343,  0.4690],
  "Aston University":                                       [52.4862, -1.8904],
  "Bangor University – North Wales Medical School":    [53.2274, -4.1289],
  "Brighton and Sussex Medical School":                     [50.8629, -0.0870],
  "Brunel University of London":                            [51.5328, -0.4733],
  "Cardiff University":                                     [51.4837, -3.1681],
  "City St George's, University of London":            [51.4275, -0.1725],
  "Edge Hill University":                                   [53.5727, -2.8779],
  "Hull York Medical School":                               [53.7631, -0.3276],
  "Imperial College London":                                [51.4988, -0.1749],
  "Keele University":                                       [53.0024, -2.2727],
  "Kent and Medway Medical School":                         [51.2785,  1.0736],
  "King's College London":                                  [51.5117, -0.1168],
  "Lancaster University":                                   [54.0048, -2.7888],
  "Newcastle University":                                   [54.9786, -1.6139],
  "Queen Mary University of London (Barts and The London)": [51.5199, -0.0584],
  "Queen's University Belfast":                             [54.5849, -5.9345],
  "St Mary's University Twickenham":                        [51.4516, -0.3347],
  "University College London (UCL)":                        [51.5246, -0.1340],
  "University of Aberdeen":                                 [57.1645, -2.1004],
  "University of Birmingham":                               [52.4514, -1.9304],
  "University of Bristol":                                  [51.4545, -2.5879],
  "University of Buckingham":                               [51.9951, -0.9772],
  "University of Cambridge":                                [52.2053,  0.1218],
  "University of Dundee":                                   [56.4620, -2.9707],
  "University of East Anglia (Norwich Medical School)":     [52.6209,  1.2404],
  "University of Edinburgh":                                [55.9445, -3.1892],
  "University of Exeter":                                   [50.7359, -3.5339],
  "University of Glasgow":                                  [55.8714, -4.2883],
  "University of Greater Manchester":                       [53.5781, -2.4290],
  "University of Hertfordshire":                            [51.7626, -0.2422],
  "University of Lancashire":                               [53.7632, -2.7044],
  "University of Leeds":                                    [53.8088, -1.5550],
  "University of Leicester":                                [52.6220, -1.1254],
  "University of Lincoln":                                  [53.2349, -0.5386],
  "University of Liverpool":                                [53.4047, -2.9637],
  "University of Manchester":                               [53.4648, -2.2330],
  "University of Nottingham":                               [52.9393, -1.2000],
  "University of Oxford":                                   [51.7604, -1.2246],
  "University of Plymouth":                                 [50.3761, -4.1447],
  "University of Sheffield":                                [53.3808, -1.4703],
  "University of Southampton":                              [50.9350, -1.3960],
  "University of St Andrews":                               [56.3398, -2.7967],
  "University of St Andrews – ScotCOM":               [56.3398, -2.7967],
  "University of Sunderland":                               [54.9079, -1.3886],
};

// ── Tier config ─────────────────────────────────────────────────────────────
const TIER_CONFIG: Record<number, { label: string; bg: string; text: string; border: string; accent: string }> = {
  1: { label: "Very competitive", bg: "#FEF2F2", text: "#991B1B", border: "#FECACA", accent: "#DC2626" },
  2: { label: "Competitive",      bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", accent: "#D97706" },
  3: { label: "Standard",         bg: "#F0FDF4", text: "#065F46", border: "#A7F3D0", accent: "#059669" },
  4: { label: "Accessible",       bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE", accent: "#2563EB" },
};

const WEIGHT_LABELS: Record<string, { label: string; desc: string; bg: string; text: string; border: string }> = {
  dominant:  { label: "UCAT-dominant",         desc: "Your UCAT score is the biggest factor in whether you get an interview.", bg: "#EDE9FE", text: "#5B21B6", border: "#C4B5FD" },
  composite: { label: "UCAT + grades combined", desc: "UCAT and academic scores are combined into a single ranking — both count.",         bg: "#EEF2FF", text: "#3730A3", border: "#A5B4FC" },
  minimum:   { label: "UCAT minimum cutoff",    desc: "You need to clear a minimum UCAT threshold to proceed — it's a pass/fail gate.", bg: "#F0FDF4", text: "#065F46", border: "#A7F3D0" },
  none:      { label: "No UCAT required",       desc: "This school does not use UCAT in its selection process.",                          bg: "#F3F4F6", text: "#374151", border: "#D1D5DB" },
};

const GRADE_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  "A*": { bg: "#F5F3FF", text: "#5B21B6", border: "#C4B5FD", glow: "#7C3AED25" },
  "A":  { bg: "#EEF2FF", text: "#3730A3", border: "#A5B4FC", glow: "#4338CA25" },
  "B":  { bg: "#F0FDF4", text: "#065F46", border: "#6EE7B7", glow: "#05966925" },
  "C":  { bg: "#FFFBEB", text: "#92400E", border: "#FCD34D", glow: "#D9770625" },
  "D":  { bg: "#FEF2F2", text: "#991B1B", border: "#FCA5A5", glow: "#DC262625" },
  "E":  { bg: "#F9FAFB", text: "#6B7280", border: "#D1D5DB", glow: "#6B728025" },
};

function subjectSummary(sr: SubjectReq): string {
  if (sr.chemistry === "required" && sr.biology === "required") return "Both Chemistry and Biology required";
  if (sr.chemistry === "required") return "Chemistry required";
  if (sr.biology === "required") return "Biology required";
  if (sr.chemistry === "or-bio") return "Chemistry or Biology (at least one)";
  return "See A-level requirement below";
}

// ── Shared components ────────────────────────────────────────────────────────

function InfoCard({ title, accent, children }: { title: string; accent?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, overflow: "hidden",
      border: "1.5px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      {accent && <div style={{ height: 3, background: accent }} />}
      <div style={{ padding: "20px 24px" }}>
        <p style={{
          fontSize: 10, fontWeight: 900, textTransform: "uppercase",
          letterSpacing: ".08em", color: "#9CA3AF", margin: "0 0 16px",
        }}>{title}</p>
        {children}
      </div>
    </div>
  );
}

function GradeBadges({ grades }: { grades: string }) {
  const letters = grades.match(/A\*|[A-E]/g) ?? [];
  const slotLabels = ["1st A-level", "2nd A-level", "3rd A-level"];
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
      {letters.map((g, i) => {
        const col = GRADE_COLORS[g] ?? { bg: "#F9FAFB", text: "#374151", border: "#E5E7EB", glow: "transparent" };
        return (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{
              width: 76, height: 76, borderRadius: 16,
              background: col.bg, border: `2.5px solid ${col.border}`,
              boxShadow: `0 6px 24px ${col.glow}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30, fontWeight: 900, color: col.text,
              letterSpacing: "-1px",
            }}>
              {g}
            </div>
            <p style={{ fontSize: 9, color: "#9CA3AF", margin: "6px 0 0", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>
              {slotLabels[i] ?? `A-level ${i + 1}`}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function BulletList({ text, accent = "#6366F1", emptyMessage }: { text: string; accent?: string; emptyMessage?: string }) {
  if (!text?.trim()) return emptyMessage ? <p style={{ fontSize: 13, color: "#9CA3AF", margin: 0 }}>{emptyMessage}</p> : null;

  const points = text
    .split(/(?<=[.;])\s+(?=[A-Z])/)
    .map(s => s.trim().replace(/[.;]$/, "").trim())
    .filter(s => s.length > 8);

  if (points.length <= 1) {
    return <p style={{ fontSize: 13, lineHeight: 1.75, color: "#374151", margin: 0 }}>{text}</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {points.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%", background: accent,
            flexShrink: 0, marginTop: 8,
          }} />
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "#374151", margin: 0 }}>{p}.</p>
        </div>
      ))}
    </div>
  );
}

export function generateStaticParams() {
  return schools.map(s => ({ slug: makeSlug(s.name) }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const school = schools.find(s => makeSlug(s.name) === params.slug);
  if (!school) return { title: "Not found" };
  return { title: `${school.name} | Pulsemed`, robots: { index: false, follow: false } };
}

export default function SchoolPage({ params }: { params: { slug: string } }) {
  const school = schools.find(s => makeSlug(s.name) === params.slug);
  if (!school) notFound();

  const coords = COORDS[school.name];
  const mapSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${(coords[1] - 0.02).toFixed(4)},${(coords[0] - 0.01).toFixed(4)},${(coords[1] + 0.02).toFixed(4)},${(coords[0] + 0.01).toFixed(4)}&layer=mapnik&marker=${coords[0]},${coords[1]}`
    : null;

  const tier = TIER_CONFIG[school.tier] ?? TIER_CONFIG[4];
  const weightInfo = WEIGHT_LABELS[school.ucatWeight] ?? WEIGHT_LABELS.none;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <a href="/med-schools" style={{
          fontSize: 12, fontWeight: 700, color: "#6B7280", textDecoration: "none",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          ← All schools
        </a>
        <span style={{ fontSize: 12, color: "#D1D5DB" }}>/</span>
        <span style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>{school.name}</span>
      </div>

      {/* Hero header */}
      <div style={{
        background: "#fff", borderRadius: 16, overflow: "hidden",
        border: "1.5px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}>
        <div style={{ height: 6, background: `linear-gradient(90deg, ${tier.accent}, ${tier.accent}80)` }} />
        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: ".06em" }}>
                Medical School Profile
              </p>
              <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px", lineHeight: 1.2, color: "#111" }}>
                {school.name}
              </h1>
              <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 18px" }}>
                📍 {school.location}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 8, background: tier.bg, color: tier.text, border: `1.5px solid ${tier.border}` }}>
                  {tier.label}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 8, background: "#EEF2FF", color: "#4338CA", border: "1.5px solid #C7D2FE" }}>
                  {school.course} · {school.length}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 8, background: "#F9FAFB", color: "#374151", border: "1.5px solid #E5E7EB" }}>
                  {school.eligibility}
                </span>
                {school.contextual && (
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 8, background: "#F0FDF4", color: "#065F46", border: "1.5px solid #A7F3D0" }}>
                    Contextual route ✓
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {school.mscUrl && (
                <a href={school.mscUrl} target="_blank" rel="noopener noreferrer" style={{
                  fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 10,
                  background: "#EEF2FF", color: "#4338CA",
                  border: "1.5px solid #C7D2FE", textDecoration: "none",
                  textAlign: "center", whiteSpace: "nowrap",
                }}>
                  MSC Profile ↗
                </a>
              )}
              {school.uniUrl && (
                <a href={school.uniUrl} target="_blank" rel="noopener noreferrer" style={{
                  fontSize: 13, fontWeight: 700, padding: "10px 20px", borderRadius: 10,
                  background: tier.accent, color: "#fff",
                  border: "none", textDecoration: "none",
                  textAlign: "center", whiteSpace: "nowrap",
                }}>
                  Course page ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map + quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: mapSrc ? "1fr 280px" : "1fr", gap: 18 }}>
        {mapSrc && (
          <div style={{ borderRadius: 14, overflow: "hidden", border: "1.5px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <iframe src={mapSrc} style={{ width: "100%", height: 280, border: "none", display: "block" }} title={`Map of ${school.name}`} />
            <p style={{ fontSize: 10, color: "#9CA3AF", textAlign: "center", padding: "6px 0 8px", margin: 0, background: "#F9FAFB" }}>
              © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style={{ color: "#9CA3AF" }}>OpenStreetMap</a> contributors
            </p>
          </div>
        )}

        <InfoCard title="At a glance" accent={tier.accent}>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { label: "Min. grades",  value: school.minGrades,                              mono: true  },
              { label: "Subjects",     value: subjectSummary(school.subjectReq),              mono: false },
              { label: "UCAT",         value: weightInfo.label,                              mono: false },
              { label: "Selection",    value: school.selectionModel,                          mono: false },
              { label: "Length",       value: school.length,                                  mono: false },
              { label: "Eligibility",  value: school.eligibility,                             mono: false },
            ].map(({ label, value, mono }) => (
              <div key={label} style={{ display: "flex", gap: 12, paddingBottom: 10, borderBottom: "1px solid #F3F4F6" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", width: 110, flexShrink: 0, paddingTop: 1 }}>{label}</span>
                <span style={{ fontSize: 13, color: "#111", lineHeight: 1.55, fontFamily: mono ? "monospace" : "inherit", fontWeight: mono ? 800 : 400 }}>{value}</span>
              </div>
            ))}
          </div>
        </InfoCard>
      </div>

      {/* ── Entry requirements ─────────────────────────────────────────────── */}
      <InfoCard title="Entry requirements" accent="#6366F1">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Big grade tiles */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: "#374151", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: ".05em" }}>
              Minimum grades
            </p>
            <GradeBadges grades={school.minGrades} />
            <div style={{ background: "#F5F3FF", border: "1.5px solid #DDD6FE", borderRadius: 10, padding: "12px 16px" }}>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "#3730A3", margin: 0, fontWeight: 500 }}>{school.aLevelReq}</p>
            </div>
          </div>

          {/* GCSE */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: "#374151", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: ".05em" }}>
              GCSE requirements
            </p>
            <div style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "12px 16px" }}>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "#374151", margin: 0 }}>{school.gcseReq}</p>
            </div>
          </div>
        </div>
      </InfoCard>

      {/* ── UCAT & selection ───────────────────────────────────────────────── */}
      <InfoCard title="UCAT & selection process" accent="#8B5CF6">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Weight badge + plain-English explanation */}
          <div style={{
            display: "flex", gap: 14, alignItems: "flex-start",
            background: `${weightInfo.bg}`, border: `1.5px solid ${weightInfo.border}`,
            borderRadius: 12, padding: "14px 16px",
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 900, color: weightInfo.text, margin: "0 0 4px" }}>{weightInfo.label}</p>
              <p style={{ fontSize: 13, color: "#4B5563", margin: 0, lineHeight: 1.6 }}>{weightInfo.desc}</p>
            </div>
          </div>

          {/* Policy tag */}
          {school.ucatPolicy && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20,
                background: "#EDE9FE", color: "#5B21B6", border: "1px solid #C4B5FD",
              }}>
                {school.ucatPolicy}
              </span>
            </div>
          )}

          {/* ucatDetail as clean bullets */}
          <div style={{ background: "#FAF5FF", border: "1px solid #E9D5FF", borderRadius: 10, padding: "16px 18px" }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".07em", color: "#7C3AED", margin: "0 0 12px" }}>
              How this school uses UCAT
            </p>
            <BulletList text={school.ucatDetail} accent="#8B5CF6" emptyMessage="No UCAT used in selection." />
          </div>
        </div>
      </InfoCard>

      {/* ── Contextual admissions ──────────────────────────────────────────── */}
      {school.contextual && (
        <InfoCard title="Contextual admissions" accent="#059669">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Callout banner */}
            <div style={{
              background: "#ECFDF5", border: "2px solid #6EE7B7", borderRadius: 12,
              padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>🎯</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 900, color: "#065F46", margin: "0 0 4px" }}>
                  This school gives lower offer holders a fair shot
                </p>
                <p style={{ fontSize: 12, color: "#047857", margin: 0, lineHeight: 1.6 }}>
                  Contextual admissions consider your background, not just your grades. If you qualify, you may receive a reduced offer or extra consideration.
                </p>
              </div>
            </div>

            {/* Detail bullets */}
            <div style={{ background: "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: 10, padding: "16px 18px" }}>
              <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".07em", color: "#059669", margin: "0 0 12px" }}>
                What this means for you
              </p>
              <BulletList text={school.contextualDetail} accent="#059669" />
            </div>
          </div>
        </InfoCard>
      )}

      {/* ── Teaching & curriculum ──────────────────────────────────────────── */}
      <InfoCard title="Teaching & curriculum" accent="#0EA5E9">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Course type pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 8, background: "#E0F2FE", color: "#0369A1", border: "1px solid #BAE6FD" }}>
              {school.course}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 8, background: "#F0F9FF", color: "#0C4A6E", border: "1px solid #BAE6FD" }}>
              {school.length}
            </span>
          </div>

          {/* Teaching model as bullets */}
          <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 10, padding: "16px 18px" }}>
            <p style={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".07em", color: "#0369A1", margin: "0 0 12px" }}>
              Course structure
            </p>
            <BulletList text={school.teachingModel} accent="#0EA5E9" />
          </div>

          {/* Selection model callout */}
          {school.selectionModel && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#F8FAFF", border: "1px solid #DBEAFE", borderRadius: 10, padding: "12px 16px" }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>📋</span>
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#1E40AF", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: ".04em" }}>Interview format</p>
                <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6 }}>{school.selectionModel}</p>
              </div>
            </div>
          )}
        </div>
      </InfoCard>

      {/* ── Student life ───────────────────────────────────────────────────── */}
      <InfoCard title="Student life & location" accent="#F59E0B">
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "16px 18px" }}>
          <BulletList text={school.studentLife} accent="#F59E0B" />
        </div>
      </InfoCard>

      {/* ── Strategic note ─────────────────────────────────────────────────── */}
      {school.strategicNote && (
        <div style={{
          background: "#FFFBEB", borderRadius: 14, border: "2px solid #FDE68A",
          padding: "20px 24px", boxShadow: "0 2px 8px rgba(217,119,6,0.12)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>💡</span>
            <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em", color: "#92400E", margin: 0 }}>
              Strategic note
            </p>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.75, color: "#78350F", margin: 0, fontWeight: 500 }}>
            {school.strategicNote}
          </p>
        </div>
      )}

      {/* Footer links */}
      <div style={{ display: "flex", gap: 12, paddingBottom: 40 }}>
        {school.mscUrl && (
          <a href={school.mscUrl} target="_blank" rel="noopener noreferrer" style={{
            fontSize: 13, fontWeight: 700, padding: "11px 22px", borderRadius: 10,
            background: "#EEF2FF", color: "#4338CA", border: "1.5px solid #C7D2FE", textDecoration: "none",
          }}>
            View MSC profile ↗
          </a>
        )}
        {school.uniUrl && (
          <a href={school.uniUrl} target="_blank" rel="noopener noreferrer" style={{
            fontSize: 13, fontWeight: 700, padding: "11px 22px", borderRadius: 10,
            background: tier.accent, color: "#fff", border: "none", textDecoration: "none",
          }}>
            University course page ↗
          </a>
        )}
        <a href="/med-schools" style={{
          fontSize: 13, fontWeight: 700, padding: "11px 22px", borderRadius: 10,
          background: "#F9FAFB", color: "#374151", border: "1.5px solid #E5E7EB", textDecoration: "none",
          marginLeft: "auto",
        }}>
          ← Back to all schools
        </a>
      </div>

    </div>
  );
}
