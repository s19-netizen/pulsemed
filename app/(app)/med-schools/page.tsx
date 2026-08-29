import type { Metadata } from "next";
import MedSchoolResearch from "./MedSchoolResearch";

export const metadata: Metadata = {
  title: "Medical School Research",
  robots: { index: false, follow: false },
};

export default function MedSchoolsPage() {
  return <MedSchoolResearch />;
}
