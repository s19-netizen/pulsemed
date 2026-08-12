// Guest question bank
import { DM_BANK } from "./dm-questions";

export type VennFigure2 = {
  kind: "venn2";
  labelA: string; labelB: string;
  // Only include values explicitly stated in the problem — never derived answers
  totalA?: number; totalB?: number; total?: number;
  onlyA?: number; both?: number; onlyB?: number; neither?: number;
};

export type VennFigure3 = {
  kind: "venn3";
  labelA: string; labelB: string; labelC: string;
  totalA?: number; totalB?: number; totalC?: number; total?: number;
  onlyA?: number; onlyB?: number; onlyC?: number;
  ab?: number; ac?: number; bc?: number; abc?: number;
  neither?: number;
};

export type VennFigure = VennFigure2 | VennFigure3;

export interface GuestQuestion {
  id: string;
  tag: string;
  contextLabel: string;
  context: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  supportingEvidence?: string;   // passage text to highlight after reveal
  optionNotes?: string[];        // per-option explanations [A, B, C, D]
  vennFigure?: VennFigure;       // renders a Venn diagram in the context panel
  difficulty?: string;
  questionType?: string;
  suggestedTimeSec?: number;
}

const VR_P1 = `The National Health Service has significantly expanded its use of telemedicine since 2020, when the COVID-19 pandemic forced general practices to adopt remote consultations at scale. By 2022, around one in five GP appointments in England took place via video call or telephone. Supporters of telemedicine argue it improves access for patients in rural or underserved areas and reduces waiting times. Critics, however, highlight the difficulty of conducting thorough clinical assessments without physical examination and warn of the potential for missed diagnoses. A review by the King's Fund found that patient satisfaction with remote appointments was broadly high, though older adults and those with complex conditions more commonly preferred in-person care.`;

const VR_P2 = `Carbon capture and storage (CCS) is a process by which carbon dioxide is captured from industrial sources — such as power stations — and stored deep underground in geological formations rather than released into the atmosphere. Several governments, including the United Kingdom, have pledged substantial funding to CCS as part of their commitments to achieving net-zero emissions. The technology is controversial: some scientists argue that investment in CCS delays the transition away from fossil fuels, while others regard it as an indispensable tool for sectors that cannot easily reduce their emissions by other means. As of 2024, no CCS project in Europe had achieved profitability on a commercial scale.`;

const VR_P3 = `The Meiji Restoration of 1868 marked a decisive turning point in Japanese history. Following centuries of feudal rule under the Tokugawa shogunate, during which Japan maintained limited contact with the outside world, the newly restored imperial government launched an ambitious programme of modernisation. Government officials were dispatched to Western nations to study their legal systems, military structures, and industrial methods. Japan's economy grew rapidly and by the early twentieth century the country had become a recognised great power. Historians have noted that this transformation, while extraordinary in its speed, came at the expense of significant social disruption and the erosion of traditional regional power structures.`;

export const GUEST_QUESTIONS: Record<string, GuestQuestion[]> = {
  vr: [
    { id: "vr-p1q1", tag: "vr-tf-direct", contextLabel: "PASSAGE", context: VR_P1,
      question: "Remote appointments accounted for the majority of GP consultations in England by 2022.",
      options: ["True", "False", "Can't Tell"], correct: 1,
      explanation: "The passage states 'around one in five' — approximately 20%, not a majority." },
    { id: "vr-p1q2", tag: "vr-tf-direct", contextLabel: "PASSAGE", context: VR_P1,
      question: "Critics of telemedicine have raised concerns about the risk of missed diagnoses.",
      options: ["True", "False", "Can't Tell"], correct: 0,
      explanation: "The passage directly states critics 'warn of the potential for missed diagnoses'." },
    { id: "vr-p1q3", tag: "vr-tf-inference", contextLabel: "PASSAGE", context: VR_P1,
      question: "The King's Fund concluded that telemedicine should be discontinued.",
      options: ["True", "False", "Can't Tell"], correct: 1,
      explanation: "The King's Fund found satisfaction was 'broadly high' — no recommendation to discontinue is made." },
    { id: "vr-p1q4", tag: "vr-tf-scope", contextLabel: "PASSAGE", context: VR_P1,
      question: "All older patients prefer face-to-face appointments to remote consultations.",
      options: ["True", "False", "Can't Tell"], correct: 1,
      explanation: "The passage says older adults 'more commonly preferred' in-person care — not that all of them did." },

    { id: "vr-p2q1", tag: "vr-tf-direct", contextLabel: "PASSAGE", context: VR_P2,
      question: "CCS technology stores carbon dioxide in underground geological formations.",
      options: ["True", "False", "Can't Tell"], correct: 0,
      explanation: "The passage explicitly states CO₂ is 'stored deep underground in geological formations'." },
    { id: "vr-p2q2", tag: "vr-tf-scope", contextLabel: "PASSAGE", context: VR_P2,
      question: "All scientists regard CCS as harmful to efforts to reduce fossil fuel use.",
      options: ["True", "False", "Can't Tell"], correct: 1,
      explanation: "Some scientists oppose CCS but others 'regard it as an indispensable tool' — not all scientists are opposed." },
    { id: "vr-p2q3", tag: "vr-tf-direct", contextLabel: "PASSAGE", context: VR_P2,
      question: "The UK government has pledged funding to support CCS technology.",
      options: ["True", "False", "Can't Tell"], correct: 0,
      explanation: "The passage states the UK is among governments that 'have pledged substantial funding to CCS'." },
    { id: "vr-p2q4", tag: "vr-tf-direct", contextLabel: "PASSAGE", context: VR_P2,
      question: "At least one CCS project in Europe was commercially profitable by 2024.",
      options: ["True", "False", "Can't Tell"], correct: 1,
      explanation: "The passage states 'no CCS project in Europe had achieved profitability on a commercial scale' as of 2024." },

    { id: "vr-p3q1", tag: "vr-tf-direct", contextLabel: "PASSAGE", context: VR_P3,
      question: "The Meiji government sent officials to Western countries to study their institutions.",
      options: ["True", "False", "Can't Tell"], correct: 0,
      explanation: "The passage directly states officials were 'dispatched to Western nations to study their legal systems, military structures, and industrial methods'." },
    { id: "vr-p3q2", tag: "vr-tf-direct", contextLabel: "PASSAGE", context: VR_P3,
      question: "Japan had extensive contact with the outside world during the Tokugawa period.",
      options: ["True", "False", "Can't Tell"], correct: 1,
      explanation: "The passage states Japan 'maintained limited contact with the outside world' during this period." },
    { id: "vr-p3q3", tag: "vr-tf-direct", contextLabel: "PASSAGE", context: VR_P3,
      question: "Japan had become a recognised great power by the early twentieth century.",
      options: ["True", "False", "Can't Tell"], correct: 0,
      explanation: "The passage explicitly states 'by the early twentieth century the country had become a recognised great power'." },
    { id: "vr-p3q4", tag: "vr-tf-scope", contextLabel: "PASSAGE", context: VR_P3,
      question: "The Meiji transformation was achieved without any negative social consequences.",
      options: ["True", "False", "Can't Tell"], correct: 1,
      explanation: "The passage notes it 'came at the expense of significant social disruption' — directly contradicting this statement." },
  ],

  dm: [...DM_BANK],
  qr: [],
  sjt: [],
};
