export type DiagnosticQuestion = {
  id: string;
  section: "vr" | "dm" | "qr" | "sjt";
  subtype: string;
  subtypeLabel: string;
  passage?: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

const VR_PASSAGE_1 =
  "A study published in the British Medical Journal examined the relationship between sleep duration and cognitive performance in medical students. Tracking 847 students over three academic years, researchers found that those averaging fewer than 6 hours of sleep per night scored 23% lower on cognitive assessments than peers sleeping 7–9 hours. Students sleeping more than 9 hours showed no significant cognitive advantage over those in the recommended range. The lead researcher noted that a \"chronic sleep debt\" accumulated over weeks was harder to recover from than occasional poor nights, and that weekend catch-up sleep was insufficient to reverse cognitive deficits developed during the week.";

const VR_PASSAGE_2 =
  "Urban tree cover has declined by approximately 12% in British cities over the past two decades, primarily due to development pressures and disease. Studies show that trees reduce urban temperatures by up to 8°C through shade and evapotranspiration, lower air pollution by absorbing particulates, and improve mental health outcomes for nearby residents. Despite this evidence, tree preservation orders (TPOs) have been declining, with local councils citing budget constraints. The charity Trees for Cities estimates that £1 invested in urban trees generates £2.80 in economic benefits through reduced energy costs, improved air quality, and increased property values.";

const SJT_SCENARIO_1 =
  "You are a medical student on placement. A senior doctor dismisses a distressed patient's concerns about their medication without explanation, in front of you and two other students.";

const SJT_SCENARIO_2 =
  "You are a medical student. You discover that a colleague has been sharing anonymised patient photos in a private group chat, claiming it is 'just a learning exercise'.";

const SJT_SCENARIO_3 =
  "You are the last medical student to see a patient in a busy ward. The patient mentions they have not eaten since yesterday because no one brought their lunch tray. Visiting time ends in 10 minutes.";

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // ── VR ──────────────────────────────────────────────────────────────────
  {
    id: "vr-1",
    section: "vr",
    subtype: "vr-direct",
    subtypeLabel: "Direct Retrieval",
    passage: VR_PASSAGE_1,
    question: "By what percentage did students sleeping fewer than 6 hours score lower on cognitive assessments?",
    options: ["19%", "23%", "27%", "33%"],
    correct: 1,
    explanation: "The passage states those sleeping fewer than 6 hours scored '23% lower on cognitive assessments'.",
  },
  {
    id: "vr-2",
    section: "vr",
    subtype: "vr-inference",
    subtypeLabel: "Inference",
    passage: VR_PASSAGE_1,
    question: "What does the study imply about weekend catch-up sleep?",
    options: [
      "It effectively reverses cognitive deficits",
      "It is more beneficial than previously thought",
      "It cannot compensate for chronic sleep debt",
      "It improves performance for students sleeping over 9 hours",
    ],
    correct: 2,
    explanation: "The passage states weekend catch-up sleep was 'insufficient to reverse cognitive deficits' — implying it cannot compensate for chronic sleep debt.",
  },
  {
    id: "vr-3",
    section: "vr",
    subtype: "vr-writers-view",
    subtypeLabel: "Writer's View",
    passage: VR_PASSAGE_1,
    question: "What sleep duration does the passage imply is optimal for cognitive performance?",
    options: [
      "More than 9 hours",
      "Exactly 7 hours",
      "7–9 hours consistently",
      "Duration does not matter if catch-up sleep is used",
    ],
    correct: 2,
    explanation: "The passage contrasts those sleeping 7–9 hours (performing well) with shorter sleepers (worse) and longer sleepers (no extra benefit), implying 7–9 hours is optimal.",
  },
  {
    id: "vr-4",
    section: "vr",
    subtype: "vr-deduction",
    subtypeLabel: "Deduction",
    passage: VR_PASSAGE_2,
    question: "Which conclusion is best supported by the passage?",
    options: [
      "Urban tree cover should be increased",
      "Tree preservation orders are legally unenforceable",
      "Trees are primarily valued for aesthetic appeal",
      "Urban trees generate a net financial loss for councils",
    ],
    correct: 0,
    explanation: "The passage presents multiple benefits of trees while noting declining coverage — supporting the conclusion that urban tree cover should be increased.",
  },
  {
    id: "vr-5",
    section: "vr",
    subtype: "vr-direct",
    subtypeLabel: "Direct Retrieval",
    passage: VR_PASSAGE_2,
    question: "Tree preservation orders (TPOs) have increased in recent years.",
    options: ["True", "False", "Can't Tell", "Not given"],
    correct: 1,
    explanation: "The passage explicitly states that 'tree preservation orders (TPOs) have been declining' — making this statement False.",
  },
  {
    id: "vr-6",
    section: "vr",
    subtype: "vr-inference",
    subtypeLabel: "Inference",
    passage: VR_PASSAGE_2,
    question: "The £2.80 economic benefit per £1 invested includes carbon sequestration.",
    options: ["True", "False", "Can't Tell", "Not given"],
    correct: 2,
    explanation: "The passage lists 'reduced energy costs, improved air quality, and increased property values'. Carbon sequestration is not mentioned, so we cannot determine whether it is included.",
  },

  // ── DM ──────────────────────────────────────────────────────────────────
  {
    id: "dm-1",
    section: "dm",
    subtype: "dm-syllogism",
    subtypeLabel: "Syllogisms",
    question: "All doctors are trained in first aid. Some nurses are trained in first aid. Which conclusion follows logically?",
    options: [
      "All nurses are doctors",
      "Some nurses are doctors",
      "Some doctors are nurses",
      "None of the above necessarily follows",
    ],
    correct: 3,
    explanation: "The premises establish that doctors and some nurses share first aid training, but no relationship between the groups is established.",
  },
  {
    id: "dm-2",
    section: "dm",
    subtype: "dm-venn",
    subtypeLabel: "Venn Diagrams",
    question: "In a group of 60 students, 35 study Biology, 28 study Chemistry, and 15 study both. How many study neither?",
    options: ["7", "10", "12", "15"],
    correct: 2,
    explanation: "Students studying at least one subject = 35 + 28 − 15 = 48. Neither = 60 − 48 = 12.",
  },
  {
    id: "dm-3",
    section: "dm",
    subtype: "dm-probability",
    subtypeLabel: "Probability",
    question: "A bag contains 4 red, 3 blue, and 5 green balls. What is the probability of drawing a red or blue ball?",
    options: ["7/12", "1/2", "5/12", "3/4"],
    correct: 0,
    explanation: "Red + blue = 7 balls out of 12 total. Probability = 7/12.",
  },
  {
    id: "dm-4",
    section: "dm",
    subtype: "dm-arguments",
    subtypeLabel: "Argument Evaluation",
    question: "'Smartphones should be banned in schools because students who use them get lower grades.' Which statement most weakens this argument?",
    options: [
      "Some students use smartphones productively for research",
      "Correlation between smartphone use and lower grades does not prove causation",
      "Many countries have already banned smartphones in schools",
      "Students should learn to manage distractions themselves",
    ],
    correct: 1,
    explanation: "The argument assumes causation from correlation. Option B directly challenges this — the most effective attack on the argument's logic.",
  },
  {
    id: "dm-5",
    section: "dm",
    subtype: "dm-syllogism",
    subtypeLabel: "Syllogisms",
    question: "If it rains, the match is cancelled. The match was not cancelled. Which must be true?",
    options: [
      "It did not rain",
      "It rained",
      "The match was postponed instead",
      "The weather forecast was wrong",
    ],
    correct: 0,
    explanation: "Modus tollens: 'If P then Q. Not Q. Therefore not P.' The match not being cancelled means it did not rain.",
  },
  {
    id: "dm-6",
    section: "dm",
    subtype: "dm-interpretation",
    subtypeLabel: "Interpreting Information",
    question: "A clinic's monthly profits (£k): Jan 120, Feb 95, Mar 140, Apr 160. Which statement is accurate?",
    options: [
      "Profits increased every month",
      "Profits fell then rose above the January level by April",
      "April had the lowest profits",
      "Profits more than doubled from January to April",
    ],
    correct: 1,
    explanation: "Profits fell in February (95 < 120), then rose to 140 and 160 — both above the January level of 120.",
  },

  // ── QR ──────────────────────────────────────────────────────────────────
  {
    id: "qr-1",
    section: "qr",
    subtype: "qr-data-tables",
    subtypeLabel: "Data Tables",
    question: "Test scores: Ali 72, Bex 85, Cal 68, Dee 91. What is the mean score?",
    options: ["78", "79", "79.5", "80"],
    correct: 1,
    explanation: "(72 + 85 + 68 + 91) ÷ 4 = 316 ÷ 4 = 79.",
  },
  {
    id: "qr-2",
    section: "qr",
    subtype: "qr-percentages",
    subtypeLabel: "Percentages",
    question: "A hospital reduces waiting times from 45 minutes to 27 minutes. By what percentage have waiting times decreased?",
    options: ["18%", "37.5%", "40%", "60%"],
    correct: 2,
    explanation: "Decrease = 18 min. (18 ÷ 45) × 100 = 40%.",
  },
  {
    id: "qr-3",
    section: "qr",
    subtype: "qr-ratios",
    subtypeLabel: "Ratios",
    question: "A solution contains saline and water in a ratio of 3:17. How many mL of saline are in a 500 mL solution?",
    options: ["60 mL", "75 mL", "85 mL", "90 mL"],
    correct: 1,
    explanation: "Total parts = 20. Saline = (3 ÷ 20) × 500 = 75 mL.",
  },
  {
    id: "qr-4",
    section: "qr",
    subtype: "qr-units",
    subtypeLabel: "Units & Currency",
    question: "A medication costs £2.40 per tablet. A patient needs 3 tablets per day for 2 weeks. What is the total cost?",
    options: ["£84.00", "£92.40", "£96.00", "£100.80"],
    correct: 3,
    explanation: "3 × 14 = 42 tablets. 42 × £2.40 = £100.80.",
  },
  {
    id: "qr-5",
    section: "qr",
    subtype: "qr-ratios",
    subtypeLabel: "Speed & Distance",
    question: "A doctor travels 24 miles to a clinic at an average speed of 40 mph. How long does the journey take?",
    options: ["30 minutes", "36 minutes", "40 minutes", "45 minutes"],
    correct: 1,
    explanation: "Time = 24 ÷ 40 = 0.6 hours = 36 minutes.",
  },
  {
    id: "qr-6",
    section: "qr",
    subtype: "qr-algebra",
    subtypeLabel: "Algebra",
    question: "A clinic sees 3x patients on Monday and x + 12 on Tuesday, totalling 60. How many patients on Monday?",
    options: ["12", "24", "36", "48"],
    correct: 2,
    explanation: "3x + x + 12 = 60 → 4x = 48 → x = 12. Monday = 3 × 12 = 36.",
  },

  // ── SJT ─────────────────────────────────────────────────────────────────
  {
    id: "sjt-1",
    section: "sjt",
    subtype: "sjt-appropriateness",
    subtypeLabel: "Appropriateness",
    passage: SJT_SCENARIO_1,
    question: "How appropriate is it to immediately challenge the doctor's behaviour in front of the patient?",
    options: ["Very appropriate", "Appropriate", "Inappropriate", "Very inappropriate"],
    correct: 3,
    explanation: "Confronting a senior colleague publicly undermines trust and the patient relationship. Raise concerns privately after the consultation.",
  },
  {
    id: "sjt-2",
    section: "sjt",
    subtype: "sjt-importance",
    subtypeLabel: "Importance",
    passage: SJT_SCENARIO_1,
    question: "How important is it to speak privately to the doctor after the consultation to raise your concerns?",
    options: ["Very important", "Important", "Of minor importance", "Not important"],
    correct: 0,
    explanation: "Raising patient safety and welfare concerns with a colleague privately is a core professional duty — very important.",
  },
  {
    id: "sjt-3",
    section: "sjt",
    subtype: "sjt-appropriateness",
    subtypeLabel: "Appropriateness",
    passage: SJT_SCENARIO_2,
    question: "How appropriate is it to report your colleague's actions directly to your clinical supervisor?",
    options: ["Very appropriate", "Appropriate", "Inappropriate", "Very inappropriate"],
    correct: 0,
    explanation: "Even anonymised photos require consent. This is a confidentiality breach that must be escalated regardless of intent.",
  },
  {
    id: "sjt-4",
    section: "sjt",
    subtype: "sjt-importance",
    subtypeLabel: "Importance",
    passage: SJT_SCENARIO_2,
    question: "How important is it to speak to your colleague directly about the issue before escalating?",
    options: ["Very important", "Important", "Of minor importance", "Not important"],
    correct: 1,
    explanation: "Speaking to the colleague first is important as professional courtesy and to ensure they understand the breach — but escalation is still required.",
  },
  {
    id: "sjt-5",
    section: "sjt",
    subtype: "sjt-appropriateness",
    subtypeLabel: "Appropriateness",
    passage: SJT_SCENARIO_3,
    question: "How appropriate is it to immediately inform the ward nurse before you leave?",
    options: ["Very appropriate", "Appropriate", "Inappropriate", "Very inappropriate"],
    correct: 0,
    explanation: "Patient nutrition is a basic care need. Informing nursing staff promptly is the correct action within your scope.",
  },
  {
    id: "sjt-6",
    section: "sjt",
    subtype: "sjt-importance",
    subtypeLabel: "Importance",
    passage: SJT_SCENARIO_3,
    question: "How important is it for you personally to fetch food for the patient from the cafeteria?",
    options: ["Very important", "Important", "Of minor importance", "Not important"],
    correct: 2,
    explanation: "While a kind gesture, this falls outside your role. Informing nursing staff is more appropriate and important — they can arrange proper care.",
  },
];

export function scoreSection(correct: number, total: number): number {
  if (total === 0) return 300;
  return Math.round(300 + (correct / total) * 600);
}

export function sjtBand(correct: number, total: number): 1 | 2 | 3 | 4 {
  const pct = total > 0 ? correct / total : 0;
  if (pct >= 5 / 6) return 1;
  if (pct >= 3 / 6) return 2;
  if (pct >= 1 / 6) return 3;
  return 4;
}

export type SubtypeScore = { correct: number; total: number; label: string };

export function calcSubtypeScores(
  questions: DiagnosticQuestion[],
  answers: Record<string, number>
): Record<string, SubtypeScore> {
  const result: Record<string, SubtypeScore> = {};
  for (const q of questions) {
    if (!result[q.subtype]) result[q.subtype] = { correct: 0, total: 0, label: q.subtypeLabel };
    result[q.subtype].total++;
    if (answers[q.id] === q.correct) result[q.subtype].correct++;
  }
  return result;
}
