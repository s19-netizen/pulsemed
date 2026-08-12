import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import DiagnosticTest from "./DiagnosticTest";

export default async function DiagnosticPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const userId = (session.user as any).id;

  // If they already have a report, send them to results
  const { data: existing } = await supabase
    .from("diagnostic_reports")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (existing) redirect("/diagnostic/results");

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <p className="eyebrow">Diagnostic Test</p>
          <h1>Find your baseline</h1>
          <p style={{ color: "var(--ink-soft)", fontSize: 14, marginTop: 4 }}>
            91 questions across all four UCAT sections — 54 min 30 sec, timed per section. Generates a personalised AI report and study plan.
          </p>
        </div>
      </div>
      <DiagnosticTest />
    </div>
  );
}
