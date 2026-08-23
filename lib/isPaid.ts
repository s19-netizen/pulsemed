import { supabase } from "./supabase";
import { redirect } from "next/navigation";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);

function isFreeAccess(role: string, email: string): boolean {
  if (role === "student") return true;  // tutor-added students get full free access
  if (ADMIN_EMAILS.includes(email.toLowerCase())) return true;
  return false;
}

export async function requirePaid(userId: string, role = "user", email = "") {
  if (isFreeAccess(role, email)) return;

  const { data } = await supabase
    .from("users")
    .select("is_paid")
    .eq("id", userId)
    .single();

  if (!data?.is_paid) redirect("/upgrade");
}

export async function getIsPaid(userId: string, role = "user", email = ""): Promise<boolean> {
  if (isFreeAccess(role, email)) return true;

  const { data } = await supabase
    .from("users")
    .select("is_paid")
    .eq("id", userId)
    .single();

  return data?.is_paid === true;
}
