import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import MockRunner from "./MockRunner";

export default async function MockPage({ params }: { params: { mockId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  if (params.mockId !== "mock-1" && params.mockId !== "mock-2") notFound();

  return <MockRunner mockId={params.mockId as "mock-1" | "mock-2"} />;
}
