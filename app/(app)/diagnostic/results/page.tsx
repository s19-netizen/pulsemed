import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import DiagnosticResults from "./DiagnosticResults";
import Link from "next/link";
import type { SearchParams } from "next/dist/server/request/search-params";

const DEMO_REPORT = {
  vr_score: 620, dm_score: 570, qr_score: 680, total_score: 1870, sjt_band: 2,
  created_at: new Date().toISOString(),
  subtype_scores: {
    "vr-direct-retrieval":   { label: "Direct Retrieval",    section: "vr", correct: 3, total: 3, rawPts: 3, maxPts: 3 },
    "vr-inference":          { label: "Inference",           section: "vr", correct: 1, total: 3, rawPts: 1, maxPts: 3 },
    "vr-main-idea":          { label: "Main Idea",           section: "vr", correct: 2, total: 3, rawPts: 2, maxPts: 3 },
    "vr-author-viewpoint":   { label: "Author Viewpoint",    section: "vr", correct: 2, total: 3, rawPts: 2, maxPts: 3 },
    "vr-meaning-in-context": { label: "Meaning in Context",  section: "vr", correct: 3, total: 3, rawPts: 3, maxPts: 3 },
    "vr-comparisons":        { label: "Comparisons",         section: "vr", correct: 2, total: 3, rawPts: 2, maxPts: 3 },
    "vr-scope":              { label: "Scope & Evidence",     section: "vr", correct: 1, total: 2, rawPts: 1, maxPts: 2 },
    "dm-syllogism":          { label: "Syllogisms",          section: "dm", correct: 2, total: 4, rawPts: 2, maxPts: 4 },
    "dm-logical-puzzle":     { label: "Logic Puzzles",       section: "dm", correct: 3, total: 4, rawPts: 3, maxPts: 4 },
    "dm-strongest-arg":      { label: "Strongest Argument",  section: "dm", correct: 2, total: 4, rawPts: 2, maxPts: 4 },
    "dm-inference":          { label: "DM Inference",        section: "dm", correct: 2, total: 4, rawPts: 2, maxPts: 4 },
    "dm-venn":               { label: "Venn Diagrams",       section: "dm", correct: 3, total: 4, rawPts: 3, maxPts: 4 },
    "dm-probability":        { label: "Probability",         section: "dm", correct: 1, total: 4, rawPts: 1, maxPts: 4 },
    "qr-arithmetic":         { label: "Core Arithmetic",     section: "qr", correct: 5, total: 6, rawPts: 5, maxPts: 6 },
    "qr-data":               { label: "Data Interpretation", section: "qr", correct: 4, total: 6, rawPts: 4, maxPts: 6 },
    "qr-geometry":           { label: "Geometry",            section: "qr", correct: 3, total: 6, rawPts: 3, maxPts: 6 },
    "sjt-appropriateness":   { label: "Appropriateness",     section: "sjt", correct: 8, total: 10, rawPts: 8, maxPts: 10 },
    "sjt-importance":        { label: "Importance",          section: "sjt", correct: 7, total: 10, rawPts: 7, maxPts: 10 },
    "sjt-most-least":        { label: "Most & Least",        section: "sjt", correct: 5, total: 10, rawPts: 5, maxPts: 10 },
  },
  groq_analysis: `Your cognitive total of 1870 out of 2700 places you in the 'Needs targeted improvement' band — a solid foundation to build from with focused practice. VR is your brightest spot at 620/900, with Direct Retrieval and Meaning in Context both perfect, but VR Inference and Scope are costing you marks — you picked up just 1 out of 3 on Inference, meaning you're missing questions that hinge on reading between the lines rather than finding explicit facts. DM is your weakest cognitive section at 570/900, and Probability is a clear drag — just 1 out of 4 marks — which is pulling down an otherwise decent showing in Logic Puzzles and Venn Diagrams. QR is encouraging at 680/900, with Core Arithmetic strong, though Geometry has room to grow. The most important next step is targeted DM Probability practice paired with VR Inference drills — those two subtypes alone account for most of your missed marks.`,
  groq_study_plan: `**Week 1: DM Probability & VR Inference** — Practice 15 DM Probability questions daily focusing on expected value and tree diagrams. Drill 10 VR Inference questions each evening, underlining implicit conclusions before answering. Review every incorrect answer with the walkthrough.\n\n**Week 2: QR Geometry & VR Scope** — Complete one full QR data-set per day targeting geometric questions. Work through VR Scope passages with a 35-second timer. Aim for 70%+ accuracy before moving on.\n\n**Week 3: Full-section timed practice** — Do one 29-question DM session and one 44-question VR session this week. Track your time per question. Identify which subtypes still slow you down.\n\n**Week 4: Mock conditions & review** — Complete a full mock under exam conditions. Spend the final two days reviewing your weakest subtype from each section. You've got this — targeted effort now will move your score significantly.`,
};

export default async function DiagnosticResultsPage({ searchParams }: { searchParams: SearchParams }) {
  const isDemo = (await searchParams)?.demo === "1";

  if (isDemo) {
    return (
      <div>
        <div className="page-header" style={{ marginBottom: 20 }}>
          <div>
            <p className="eyebrow">Diagnostic — Preview</p>
            <h1>Your results</h1>
          </div>
        </div>
        <DiagnosticResults report={DEMO_REPORT as any} />
      </div>
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const userId = (session.user as any).id;

  const { data: report } = await supabase
    .from("diagnostic_reports")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!report) {
    return (
      <div>
        <div className="page-header">
          <div>
            <p className="eyebrow">Diagnostic</p>
            <h1>No results yet</h1>
          </div>
        </div>
        <div className="content-card" style={{ padding: "24px 28px", maxWidth: 480 }}>
          <p style={{ margin: "0 0 16px", color: "var(--ink-soft)" }}>
            You haven't completed a diagnostic test yet. Take one to get your personalised report.
          </p>
          <Link href="/diagnostic">
            <button style={{ minHeight: 40, padding: "0 20px", background: "#2D7FF9", color: "white", border: 0, borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
              Take diagnostic →
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <p className="eyebrow">Diagnostic</p>
          <h1>Your results</h1>
        </div>
      </div>
      <DiagnosticResults report={report} />
    </div>
  );
}
