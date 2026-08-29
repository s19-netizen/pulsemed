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

// lat, lon
const COORDS: Record<string, [number, number]> = {
  "Anglia Ruskin University":                          [51.7343,  0.4690],
  "Aston University":                                  [52.4862, -1.8904],
  "Bangor University – North Wales Medical School": [53.2274, -4.1289],
  "Brighton and Sussex Medical School":                [50.8629, -0.0870],
  "Brunel University of London":                       [51.5328, -0.4733],
  "Cardiff University":                                [51.4837, -3.1681],
  "City St George's, University of London":            [51.4275, -0.1725],
  "Edge Hill University":                              [53.5727, -2.8779],
  "Hull York Medical School":                          [53.7631, -0.3276],
  "Imperial College London":                           [51.4988, -0.1749],
  "Keele University":                                  [53.0024, -2.2727],
  "Kent and Medway Medical School":                    [51.2785,  1.0736],
  "King's College London":                             [51.5117, -0.1168],
  "Lancaster University":                              [54.0048, -2.7888],
  "Newcastle University":                              [54.9786, -1.6139],
  "Queen Mary University of London (Barts and The London)": [51.5199, -0.0584],
  "Queen's University Belfast":                        [54.5849, -5.9345],
  "St Mary's University Twickenham":                   [51.4516, -0.3347],
  "University College London (UCL)":                   [51.5246, -0.1340],
  "University of Aberdeen":                            [57.1645, -2.1004],
  "University of Birmingham":                          [52.4514, -1.9304],
  "University of Bristol":                             [51.4545, -2.5879],
  "University of Buckingham":                          [51.9951, -0.9772],
  "University of Cambridge":                           [52.2053,  0.1218],
  "University of Dundee":                              [56.4620, -2.9707],
  "University of East Anglia (Norwich Medical School)":[52.6209,  1.2404],
  "University of Edinburgh":                           [55.9445, -3.1892],
  "University of Exeter":                              [50.7359, -3.5339],
  "University of Glasgow":                             [55.8714, -4.2883],
  "University of Greater Manchester":                  [53.5781, -2.4290],
  "University of Hertfordshire":                       [51.7626, -0.2422],
  "University of Lancashire":                          [53.7632, -2.7044],
  "University of Leeds":                               [53.8088, -1.5550],
  "University of Leicester":                           [52.6220, -1.1254],
  "University of Lincoln":                             [53.2349, -0.5386],
  "University of Liverpool":                           [53.4047, -2.9637],
  "University of Manchester":                          [53.4648, -2.2330],
  "University of Nottingham":                          [52.9393, -1.2000],
  "University of Oxford":                              [51.7604, -1.2246],
  "University of Plymouth":                            [50.3761, -4.1447],
  "University of Sheffield":                           [53.3808, -1.4703],
  "University of Southampton":                         [50.9350, -1.3960],
  "University of St Andrews":                          [56.3398, -2.7967],
  "University of St Andrews – ScotCOM":           [56.3398, -2.7967],
  "University of Sunderland":                          [54.9079, -1.3886],
};

const TIER_LABELS: Record<number, string> = { 1: "Very competitive", 2: "Competitive", 3: "Standard", 4: "Accessible" };
const TIER_BADGE: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: "#FEE2E2", text: "#991B1B", border: "#F87171" },
  2: { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
  3: { bg: "#DCFCE7", text: "#166534", border: "#86EFAC" },
  4: { bg: "#EAF2FF", text: "#1E40AF", border: "#93C5FD" },
};
const WEIGHT_LABELS: Record<string, string> = {
  dominant:  "UCAT-dominant",
  composite: "UCAT + academics composite",
  minimum:   "UCAT minimum threshold",
  none:      "No UCAT required",
};

function subjectSummary(sr: SubjectReq): string {
  const { chemistry, biology } = sr;
  if (chemistry === "required" && biology === "required") return "Both Chemistry and Biology required at A-level";
  if (chemistry === "required") return "Chemistry required at A-level";
  if (biology === "required") return "Biology required at A-level";
  if (chemistry === "or-bio") return "At least one of Chemistry or Biology required at A-level";
  return "See full A-level requirement below";
}

export function generateStaticParams() {
  return schools.map(s => ({ slug: makeSlug(s.name) }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const school = schools.find(s => makeSlug(s.name) === params.slug);
  if (!school) return { title: "Not found" };
  return {
    title: `${school.name} | Pulsemed`,
    robots: { index: false, follow: false },
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)",
      padding: "18px 22px", display: "flex", flexDirection: "column", gap: 10,
    }}>
      <p style={{
        fontSize: 10, fontWeight: 900, textTransform: "uppercase",
        letterSpacing: ".08em", color: "var(--ink-soft)", margin: 0,
      }}>{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, alignItems: "baseline" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)" }}>{label}</span>
      <span style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.55 }}>{value}</span>
    </div>
  );
}

export default function SchoolPage({ params }: { params: { slug: string } }) {
  const school = schools.find(s => makeSlug(s.name) === params.slug);
  if (!school) notFound();

  const coords = COORDS[school.name];
  const mapSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${(coords[1] - 0.018).toFixed(4)},${(coords[0] - 0.009).toFixed(4)},${(coords[1] + 0.018).toFixed(4)},${(coords[0] + 0.009).toFixed(4)}&layer=mapnik&marker=${coords[0]},${coords[1]}`
    : null;

  const tierBadge = TIER_BADGE[school.tier] ?? TIER_BADGE[4];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 860, margin: "0 auto" }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <a href="/med-schools" style={{
          fontSize: 12, fontWeight: 700, color: "var(--ink-soft)",
          textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
        }}>
          ← Schools
        </a>
        <span style={{ fontSize: 12, color: "var(--ink-soft)", opacity: 0.4 }}>/</span>
        <span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 600 }}>{school.name}</span>
      </div>

      {/* Header */}
      <div style={{
        background: "var(--surface)", borderRadius: 14, border: "1px solid var(--line)",
        padding: "22px 26px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px", lineHeight: 1.25 }}>{school.name}</h1>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 14px" }}>{school.location}</p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
                background: "#EAF2FF", color: "#2D7FF9", border: "1px solid #c7dcff",
              }}>
                {school.course}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
                background: "var(--bg)", color: "var(--ink-soft)", border: "1px solid var(--line)",
              }}>
                {school.length}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
                background: "var(--bg)", color: "var(--ink-soft)", border: "1px solid var(--line)",
              }}>
                {school.eligibility}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
                background: tierBadge.bg, color: tierBadge.text, border: `1px solid ${tierBadge.border}`,
              }}>
                {TIER_LABELS[school.tier] ?? "Standard"}
              </span>
              {school.contextual && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
                  background: "#DCFCE7", color: "#166534", border: "1px solid #86EFAC",
                }}>
                  Contextual route
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            {school.mscUrl && (
              <a href={school.mscUrl} target="_blank" rel="noopener noreferrer" style={{
                fontSize: 13, fontWeight: 700, color: "#2D7FF9",
                background: "#EAF2FF", border: "1px solid #c7dcff",
                borderRadius: 8, padding: "8px 16px", textDecoration: "none",
                whiteSpace: "nowrap",
              }}>
                MSC Profile ↗
              </a>
            )}
            {school.uniUrl && (
              <a href={school.uniUrl} target="_blank" rel="noopener noreferrer" style={{
                fontSize: 13, fontWeight: 700, color: "#fff",
                background: "#2D7FF9", border: "none",
                borderRadius: 8, padding: "8px 16px", textDecoration: "none",
                whiteSpace: "nowrap",
              }}>
                Apply / Course page ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Map + quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: mapSrc ? "1fr 260px" : "1fr", gap: 16 }}>

        {mapSrc && (
          <div style={{
            borderRadius: 12, overflow: "hidden",
            border: "1px solid var(--line)", minHeight: 260,
          }}>
            <iframe
              src={mapSrc}
              style={{ width: "100%", height: 280, border: "none", display: "block" }}
              title={`Map of ${school.name}`}
            />
            <p style={{
              fontSize: 10, color: "var(--ink-soft)", textAlign: "center",
              padding: "6px 0 8px", margin: 0, background: "var(--surface)",
            }}>
              © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink-soft)" }}>OpenStreetMap</a> contributors
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Section title="At a glance">
            <Row label="Minimum grades" value={school.minGrades} />
            <Row label="Subject requirement" value={subjectSummary(school.subjectReq)} />
            <Row label="UCAT" value={WEIGHT_LABELS[school.ucatWeight] ?? school.ucatWeight} />
            <Row label="Selection model" value={school.selectionModel} />
            <Row label="Course length" value={school.length} />
            <Row label="Eligibility" value={school.eligibility} />
            <Row label="Course code" value={school.course} />
          </Section>
        </div>
      </div>

      {/* Entry requirements */}
      <Section title="Entry requirements">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", margin: "0 0 4px" }}>A-level requirement</p>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--ink)", margin: 0 }}>{school.aLevelReq}</p>
          </div>
          <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: 0 }} />
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", margin: "0 0 4px" }}>GCSE requirements</p>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--ink)", margin: 0 }}>{school.gcseReq}</p>
          </div>
        </div>
      </Section>

      {/* UCAT & selection */}
      <Section title="UCAT & selection process">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
              background: "#F1ECFF", color: "#8B6BFF", border: "1px solid #d4c5ff",
            }}>
              {school.ucatPolicy}
            </span>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink)", margin: 0 }}>{school.ucatDetail}</p>
        </div>
      </Section>

      {/* Contextual routes */}
      {school.contextual && (
        <Section title="Contextual admissions">
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink)", margin: 0 }}>{school.contextualDetail}</p>
        </Section>
      )}

      {/* Teaching model */}
      <Section title="Teaching &amp; curriculum">
        <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink)", margin: 0 }}>{school.teachingModel}</p>
      </Section>

      {/* Student life */}
      <Section title="Student life &amp; location">
        <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink)", margin: 0 }}>{school.studentLife}</p>
      </Section>

      {/* Strategic note */}
      {school.strategicNote && (
        <div style={{
          background: "#FFFBEB", borderRadius: 12, border: "1.5px solid #FDE047",
          padding: "18px 22px",
        }}>
          <p style={{
            fontSize: 10, fontWeight: 900, textTransform: "uppercase",
            letterSpacing: ".08em", color: "#92400E", margin: "0 0 8px",
          }}>
            Strategic note
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "#78350F", margin: 0, fontWeight: 500 }}>
            {school.strategicNote}
          </p>
        </div>
      )}

      {/* Footer links */}
      <div style={{ display: "flex", gap: 10, paddingBottom: 32 }}>
        {school.mscUrl && (
          <a href={school.mscUrl} target="_blank" rel="noopener noreferrer" style={{
            fontSize: 13, fontWeight: 700, color: "#2D7FF9",
            background: "#EAF2FF", border: "1px solid #c7dcff",
            borderRadius: 8, padding: "10px 18px", textDecoration: "none",
          }}>
            View MSC profile ↗
          </a>
        )}
        {school.uniUrl && (
          <a href={school.uniUrl} target="_blank" rel="noopener noreferrer" style={{
            fontSize: 13, fontWeight: 700, color: "#fff",
            background: "#2D7FF9", borderRadius: 8, padding: "10px 18px", textDecoration: "none",
          }}>
            University course page ↗
          </a>
        )}
      </div>

    </div>
  );
}
