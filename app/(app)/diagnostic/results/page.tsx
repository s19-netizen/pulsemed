import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import DiagnosticResults from "./DiagnosticResults";
import Link from "next/link";

export default async function DiagnosticResultsPage() {
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
