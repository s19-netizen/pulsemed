import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import AppShell from "./AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Guest: allow through without auth
  if (!session?.user) {
    return (
      <AppShell user={null} testDate={null}>
        {children}
      </AppShell>
    );
  }

  const userId = (session.user as any).id;
  const { data: profile } = await supabase
    .from("user_profile")
    .select("onboarding_complete, test_date")
    .eq("user_id", userId)
    .single();

  if (!profile?.onboarding_complete) redirect("/onboarding");

  return (
    <AppShell user={session.user as any} testDate={profile?.test_date ?? null}>
      {children}
    </AppShell>
  );
}
