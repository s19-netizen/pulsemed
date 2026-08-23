import { supabase } from "./supabase";
import { redirect } from "next/navigation";

export async function requirePaid(userId: string) {
  const { data } = await supabase
    .from("users")
    .select("is_paid")
    .eq("id", userId)
    .single();
  if (!data?.is_paid) redirect("/upgrade");
}

export async function getIsPaid(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("users")
    .select("is_paid")
    .eq("id", userId)
    .single();
  return data?.is_paid === true;
}
