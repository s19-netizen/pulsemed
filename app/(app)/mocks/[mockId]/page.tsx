import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import * as mock1 from "@/lib/mock1Data";
import * as mock2 from "@/lib/mock2Data";
import MockRunner from "./MockRunner";

export default async function MockPage({ params }: { params: { mockId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");

  if (params.mockId !== "mock-1" && params.mockId !== "mock-2") notFound();

  const data = (params.mockId === "mock-2" ? mock2 : mock1) as typeof mock1;

  return <MockRunner data={data} mockId={params.mockId as "mock-1" | "mock-2"} />;
}
