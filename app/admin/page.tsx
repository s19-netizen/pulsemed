import AdminDashboard from "./AdminDashboard";
import * as m1 from "@/lib/mock1Data";
import * as m2 from "@/lib/mock2Data";
import { DM_BANK } from "@/lib/dm-questions";
import { DIAGNOSTIC_QUESTIONS } from "@/lib/diagnosticData";

export default function AdminPage() {
  const mocks = [
    { id: "mock1", label: m1.MOCK_LABEL, vr: m1.VR_PASSAGES, dm: m1.DM_QUESTIONS, qr: m1.QR_DATASETS, sjt: m1.SJT_SCENARIOS },
    { id: "mock2", label: m2.MOCK_LABEL, vr: m2.VR_PASSAGES, dm: m2.DM_QUESTIONS, qr: m2.QR_DATASETS, sjt: m2.SJT_SCENARIOS },
  ];
  return <AdminDashboard mocks={mocks} dmBank={DM_BANK} diagQuestions={DIAGNOSTIC_QUESTIONS} />;
}
