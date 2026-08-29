import type { Metadata } from "next";
import StatementStudio from "./StatementStudio";

export const metadata: Metadata = {
  title: "Personal Statement Studio",
  robots: { index: false, follow: false },
};

export default function PersonalStatementPage() {
  return <StatementStudio />;
}
