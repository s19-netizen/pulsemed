import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

const ADMIN_EMAIL = "sawdaj19@gmail.com";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (email !== ADMIN_EMAIL) redirect("/");
  return <>{children}</>;
}
