import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import StudyPlanClient from "./StudyPlanClient";

export default async function StudyPlanPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const userId = (session.user as any).id;

  const { data: responses } = await supabase
    .from("question_responses")
    .select("question_tag, is_correct, time_taken_ms, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return <StudyPlanClient responses={responses ?? []} />;
}
