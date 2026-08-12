import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  const userId = (session.user as any).id;
  const { data: profile } = await supabase
    .from("user_profile")
    .select("onboarding_complete")
    .eq("user_id", userId)
    .single();

  if (profile?.onboarding_complete) redirect("/dashboard");

  return <OnboardingForm />;
}
