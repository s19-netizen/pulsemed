// ─── Types ────────────────────────────────────────────────────────────────────

export type DiagFormat =
  | "mcq"        // 4-option MCQ (VR, DM, QR)
  | "tfct"       // True / False / Can't Tell (VR)
  | "multi"      // 5-statement Yes/No (DM, mark=2)
  | "approp"     // Appropriateness 4-point (SJT)
  | "import"     // Importance 4-point (SJT)
  | "mostleast"; // Most / Least important (SJT)

export type DiagSection = "vr" | "dm" | "qr" | "sjt";

export interface DiagQuestion {
  id: string;
  qNum: number;
  section: DiagSection;
  format: DiagFormat;
  subtype: string;
  difficulty: "Gold" | "Diamond";

  // Context reference
  passageId?: string;   // VR passage key
  scenarioId?: string;  // SJT scenario key
  dataSetId?: string;   // QR data set key

  // Stem / context shown above question
  preamble?: string;    // Additional text above stem (DM context, QR extra info)
  stem: string;

  // MCQ / TFCT / Appropriateness / Importance
  options?: string[];
  correct?: number; // 0-based index

  // Multi-statement Yes/No (DM)
  statements?: string[];
  correctStatements?: boolean[];

  // Most/Least (SJT)
  factors?: string[];  // ["A text", "B text", "C text", "D text"]
  correctMost?: number;   // 0-3
  correctLeast?: number;  // 0-3

  // Venn figure (DM venn questions)
  vennFigure?: {
    labelA: string; labelB: string; labelC: string;
    total?: number; neither?: number;
    onlyA?: number; onlyB?: number; onlyC?: number;
    ab?: number; ac?: number; bc?: number; abc?: number;
  };

  // Walkthrough
  explanation?: string;

  // Metadata
  mark_value?: 1 | 2;          // DM only
  critical_safety?: boolean;   // SJT only
}

export interface VRPassage {
  id: string;
  title: string;
  text: string;
}

export interface QRDataSet {
  id: string;
  title: string;
  description: string;
  figureType: "room" | "grouped-bar" | "line" | "pie-pair" | "table";
  figureData: Record<string, unknown>;
}

export interface SJTScenario {
  id: string;
  title: string;
  text: string;
}

// ─── Scoring Tables ────────────────────────────────────────────────────────────

export const VR_SCALED: Record<number, number> = {
  20: 900, 19: 850, 18: 800, 17: 760, 16: 720, 15: 690, 14: 660, 13: 630,
  12: 600, 11: 570, 10: 540,  9: 520,  8: 490,  7: 470,  6: 440,  5: 420,
   4: 400,  3: 370,  2: 350,  1: 320,  0: 300,
};

export const DM_SCALED: Record<number, number> = {
  24: 900, 23: 860, 22: 820, 21: 780, 20: 750, 19: 720, 18: 690, 17: 660,
  16: 640, 15: 620, 14: 590, 13: 560, 12: 540, 11: 520, 10: 500,  9: 480,
   8: 460,  7: 440,  6: 420,  5: 400,  4: 380,  3: 360,  2: 340,  1: 320,  0: 300,
};

export const QR_SCALED: Record<number, number> = {
  18: 900, 17: 840, 16: 790, 15: 750, 14: 710, 13: 670, 12: 640, 11: 610,
  10: 570,  9: 540,  8: 510,  7: 490,  6: 460,  5: 430,  4: 410,  3: 380,
   2: 350,  1: 330,  0: 300,
};

// SJT Band boundaries (inclusive ranges of raw points out of 70)
export const SJT_BANDS = [
  { band: 1, min: 65 },
  { band: 2, min: 57 },
  { band: 3, min: 47 },
  { band: 4, min: 0  },
] as const;

// Classification of cognitive total
export const COGNITIVE_CLASSIFICATIONS = [
  { min: 2400, label: "Exceptional" },
  { min: 2250, label: "Very strong" },
  { min: 2100, label: "Strong" },
  { min: 1950, label: "Developing well" },
  { min: 1800, label: "Needs targeted improvement" },
  { min: 900,  label: "Priority development" },
];

// ─── VR Passages ──────────────────────────────────────────────────────────────

export const VR_PASSAGES: Record<string, VRPassage> = {
  "vr-p1": {
    id: "vr-p1",
    title: "The Quiet Reorganisation of Time",
    text: `Industrialisation is often described as the moment when the mechanical clock began to govern everyday life. Factory whistles divided the day, wages were calculated by the hour and lateness became measurable. Yet punctuality was not invented by factories. Medieval bells marked fixed hours, ports coordinated work with tides, and courts expected people at appointed times. What changed between the seventeenth and nineteenth centuries was the growing number of institutions that made precise time consequential.

Early public clocks were costly civic objects, and their bells were often more useful than their faces because few people owned watches. Domestic clocks spread gradually, but accuracy varied. A household might own an impressive clock that lost several minutes a day, while an observatory or dockyard maintained a far more reliable standard. Owning a clock therefore did not necessarily mean sharing an exact minute-by-minute schedule with everyone else.

Historians sometimes contrast "task time", in which work ends when a recognised job is complete, with "clock time", in which labour is bought in measured units. The distinction is useful but too neat if treated literally. Agricultural work could require precise coordination, while early factories were themselves disrupted by machinery failures, irregular supplies and customary holidays.

The deeper change was institutional. Railways, for example, made small differences in local time increasingly inconvenient and encouraged standardisation. Workers also adapted the language of measured time to their own purposes: labour movements demanded limits on the working day in hours. The same system that enabled employers to measure labour more closely gave workers a precise way to argue that labour should end. The clock was therefore not a single cause that replaced a freer past, but one instrument within a wider social and economic reorganisation.`,
  },
  "vr-p2": {
    id: "vr-p2",
    title: "Rivers That Refuse to Stay Put",
    text: `Deltas look fixed on maps, but their apparent solidity is deceptive. Rivers deliver sediment, tides redistribute it, storms remove it and channels shift. A delta persists not because it is motionless, but because gains and losses remain sufficiently balanced over time. Human settlement complicates this because roads, farms and houses are much easier to manage when the land beneath them stays put.

For much of the twentieth century, delta management emphasised control. Embankments reduced ordinary flooding, channels were engineered for navigation and dams stored water upstream. These interventions could solve immediate problems while altering the sediment system. A dam may trap silt that would otherwise reach the coast, while a high embankment can protect fields yet prevent sediment-rich floodwater from replenishing the floodplain. Where sediments naturally compact, losing fresh deposits can leave land progressively lower relative to the sea.

Some planners therefore favour controlled diversions that carry water and sediment into selected basins. Such schemes may help build land, but their trade-offs are real. A diversion that benefits one wetland may change salinity elsewhere, disrupt fisheries or increase flooding on farmland. Decisions about sediment are also decisions about who accepts risk.

Sea-level rise intensifies the problem, but it is not the only influence on relative water level. Groundwater extraction, construction and natural geological processes can contribute to subsidence, so two districts on the same delta may experience different rates of relative sea-level rise.

Protection and retreat are not simple opposites. A regional plan might reinforce a port, relocate one road, restore a wetland and allow more frequent flooding on selected farmland. Dense cities may justify substantial defences, but this does not mean every urban area should always be defended in the same way. A plan can improve regional resilience while still imposing greater costs or risks on particular communities.`,
  },
  "vr-p3": {
    id: "vr-p3",
    title: "The Archive and the Empty Shelf",
    text: `Historians of censorship face an unusual problem: suppression can leave both too much evidence and too little. A banned pamphlet may survive because officials seized and catalogued copies, while thousands of ordinary permitted texts disappear through wear or neglect. An archive rich in official correspondence may therefore reveal the anxieties of regulators more clearly than the reading habits of the population. The surviving record is not a transparent sample of the past; it is partly the residue of what institutions noticed and recorded.

Estimating the circulation of illicit print is especially difficult. Printers rarely advertised prohibited works openly, and sales may have been disguised or omitted from accounts. Yet secrecy should not be mistaken for popularity. A forbidden book was not necessarily widely read, and one surviving copy could represent either a once-common publication or an obscure curiosity.

Researchers therefore combine different evidence. Court files may record seizures, letters may mention lending, booksellers' inventories may show stock and marginal notes may prove that at least one reader engaged with a text. Each source has limits: court cases overrepresent occasions when authorities noticed something, while inventories contain books that may never have sold.

Digitisation makes comparison across collections easier, but it adds another selection effect. Institutions choose what to scan, metadata can be inconsistent and damaged print may be difficult to search. Searchability is not completeness.

Nor does resemblance establish influence. If an early pamphlet resembles a later political slogan, historians still need a plausible path of transmission — evidence that the earlier text was available, cited, translated or discussed. Strong claims are most convincing when several lines of evidence converge. Properly described uncertainty is therefore not simply a weakness: it shows where the archive is dense, where it is distorted and where confidence should stop.`,
  },
  "vr-p4": {
    id: "vr-p4",
    title: "Cooling the City",
    text: `Cities are often warmer than nearby rural areas, particularly at night, but the familiar term "urban heat island" can conceal how uneven that warmth is. Temperature varies street by street according to shade, building materials, wind, traffic, vegetation and surface moisture. A city does not have one heat-island effect in the way a room has one thermostat setting.

Trees are a popular remedy. Their canopies provide shade and their leaves can cool surrounding air through evapotranspiration when water is available. Yet planting programmes can fail when trees are treated as decoration rather than living infrastructure. Young trees need suitable soil, water and protection, and dense canopies may alter ventilation in narrow streets.

Reflective roofs work differently. By reflecting more incoming solar radiation, they can reduce roof-surface temperature and sometimes lower cooling demand inside buildings. Their value depends on insulation, shade and local climate. Reflective surfaces also become less effective as they weather, so maintenance affects long-term performance.

Measurement creates another difficulty. A city-wide average may be a poor measure of what a person actually experiences. Satellite observations can map surface temperature across a large area, yet they do not directly measure the air temperature experienced by a pedestrian. A roadside sensor may accurately describe conditions beside traffic while saying little about a park one street away.

Equity has also become central to heat planning. Neighbourhoods with little tree cover or poorer housing may face greater risk, but a greening project can raise property values and contribute to displacement pressure where housing protections are weak. The lesson is not that cooling is hopelessly complicated. Trees, reflective materials and other interventions may all be useful in the right setting. The better question is which combination reduces harmful exposure for a particular place and population.`,
  },
  "vr-p5": {
    id: "vr-p5",
    title: "When a Map Becomes an Argument",
    text: `Maps are often treated as neutral containers of geographic fact: a road is drawn where the road exists, a border follows a line and a city receives a dot. Yet every map is also a selection. A cartographer decides what to include, what to omit, what scale to use and which differences deserve emphasis. These choices do not make maps deceptive by definition; they make maps arguments about what matters.

Projection provides an obvious example. A spherical Earth cannot be transferred to a flat surface without distortion. Some projections preserve local angles, which can aid navigation, while exaggerating the apparent area of high-latitude regions. Equal-area projections preserve relative area but distort shape. Asking which projection is simply "accurate" therefore misses the point: accuracy depends partly on purpose.

Political boundaries create a different problem. Territory may be administered by one state but claimed by another. A solid line can suggest certainty that does not exist, while dashed lines or annotations may represent disagreement more faithfully. Place names can be similarly contentious when several languages or historical traditions use different names for the same location.

Digital mapping does not remove these choices; it relocates many of them into databases and algorithms. A navigation app decides which businesses appear prominently and which route counts as fastest. Repeated route suggestions may then alter traffic patterns, so the map can begin to influence the world it appears merely to describe.

Complete neutrality is unrealistic. A map containing every available fact would be unusable, and data collection itself involves selection. A better standard is transparency: make the map's purpose clear, acknowledge important uncertainty and distinguish measured information from inference where possible. Because maps can look self-evidently factual, readers should ask who made them, for whom, from what data and to show what.`,
  },
};

// ─── QR Data Sets ─────────────────────────────────────────────────────────────

export const QR_DATASETS: Record<string, QRDataSet> = {
  "qr-ds1": {
    id: "qr-ds1",
    title: "Exhibition Room",
    description: "A rectangular exhibition room is 10 m long, 8 m wide and 3 m high.",
    figureType: "room",
    figureData: {
      room: { length: 10, width: 8, height: 3 },
      door: { width: 1, height: 2 },
      windows: { count: 2, width: 1.5, height: 1 },
      module: { length: 2, width: 1 },
      clearance: 1,
      gap: 0.5,
      paintCoverage: 10,
      coats: 2,
      tinSize: 5,
    },
  },
  "qr-ds2": {
    id: "qr-ds2",
    title: "Island Ferries",
    description: "The grouped bar chart shows the numbers of adult and child passengers travelling one way on three ferry routes on Saturday.",
    figureType: "grouped-bar",
    figureData: {
      title: "Saturday Ferry Passengers",
      groups: ["Route A", "Route B", "Route C"],
      series: [
        { label: "Adults",   color: "#2D7FF9", values: [96, 122, 88] },
        { label: "Children", color: "#FF6B5C", values: [42,  56, 44] },
      ],
      yMax: 140,
      yLabel: "Number of passengers",
      notes: [
        "Route A: distance 42 km · adult fare £21.60 · child fare £13.20",
        "Route B: distance 58 km · adult fare £27.50 · child fare £16.80",
        "Route C: distance 34 km · adult fare £18.90 · child fare £11.40",
      ],
    },
  },
  "qr-ds3": {
    id: "qr-ds3",
    title: "City Cycle Hire",
    description: "The line graph shows the number of cycle-hire journeys recorded in Northport and Southbay from Monday to Friday.",
    figureType: "line",
    figureData: {
      title: "Cycle-Hire Journeys",
      xLabels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      yMin: 0,
      yMax: 700,
      yLabel: "Number of journeys",
      series: [
        { label: "Northport", color: "#2D7FF9", values: [420, 510, 480, 620, 570] },
        { label: "Southbay",  color: "#8B6BFF", values: [360, 450, 540, 600, 690] },
      ],
    },
  },
  "qr-ds4": {
    id: "qr-ds4",
    title: "Household Energy Use",
    description: "A household used 18,400 kWh of energy in 2025 and 16,800 kWh in 2026. The pie charts show how the total was distributed.",
    figureType: "pie-pair",
    figureData: {
      categories: ["Heating", "Hot water", "Appliances", "Lighting", "Other"],
      colors: ["#2D7FF9", "#8B6BFF", "#3DBE6C", "#FF6B5C", "#f59e0b"],
      charts: [
        { label: "2025 — 18,400 kWh", values: [45, 20, 18, 10, 7] },
        { label: "2026 — 16,800 kWh", values: [40, 22, 20,  9, 9] },
      ],
    },
  },
  "qr-ds5": {
    id: "qr-ds5",
    title: "Theatre Performances",
    description: "A theatre has three ticket categories. Operating costs: £4,850 fixed cost plus £6.40 per attendee.",
    figureType: "table",
    figureData: {
      categories: [
        { type: "Premium",       seats: 90,  price: 42 },
        { type: "Standard",      seats: 270, price: 28 },
        { type: "Restricted view", seats: 120, price: 18 },
      ],
      performances: [
        { name: "Matinee",   premium: 82,  standard: 236, restricted: 94  },
        { name: "Evening 1", premium: 90,  standard: 252, restricted: 111 },
        { name: "Evening 2", premium: 88,  standard: 268, restricted: 116 },
      ],
    },
  },
};

// ─── SJT Scenarios ────────────────────────────────────────────────────────────

export const SJT_SCENARIOS: Record<string, SJTScenario> = {
  "sjt-s1": {
    id: "sjt-s1",
    title: "Allergy Record Discrepancy",
    text: "Maya is a medical student on a hospital placement. She is observing a junior doctor prepare to prescribe an antibiotic for a patient with a suspected chest infection. The electronic record shows \"no known drug allergies\", but Maya remembers that during the history the patient said, \"I had a bad reaction to penicillin years ago — my face swelled up.\" The doctor is moving quickly because several patients are waiting. Maya is not certain whether the planned antibiotic is related to penicillin.",
  },
  "sjt-s2": {
    id: "sjt-s2",
    title: "A Patient Sends a Follow Request",
    text: "Imran is a medical student who has spent several days observing in a GP practice. That evening, a patient he met during clinic sends a follow request to his private social-media account and a message saying, \"The swelling on my arm looks worse. Can I send you a photo and ask what you think?\" Imran knows the practice has an approved telephone and online contact system. He is not involved in the patient's care outside his supervised placement.",
  },
  "sjt-s3": {
    id: "sjt-s3",
    title: "The Group Presentation",
    text: "Four students are preparing a presentation that contributes to a professionalism module. Nia notices that one section written by her teammate Leo contains several paragraphs that closely match an online article but has no citation. Leo says he was rushing, insists that \"everyone paraphrases from websites\", and asks Nia not to make an issue of it because the group deadline is that evening. There is still enough time to rewrite the section, although doing so would delay the group's final rehearsal.",
  },
  "sjt-s4": {
    id: "sjt-s4",
    title: "Interpreting a Sensitive History",
    text: "Sofia is observing a consultation with an older patient who speaks limited English. The patient's adult son has been translating ordinary questions. The clinician begins asking about urinary symptoms and sexual history. The patient gives short answers and repeatedly looks towards her son before responding. A professional interpreter can be contacted by telephone, although doing so may delay the clinic by several minutes.",
  },
  "sjt-s5": {
    id: "sjt-s5",
    title: "The Audit Spreadsheet",
    text: "Elliot is a medical student helping with a supervised quality-improvement project. The day before the presentation, he discovers that he accidentally copied one column of patient waiting-time data into the wrong rows. The spreadsheet contains study codes rather than patient names. Correcting and rechecking the data will probably take two hours and may change one of the graphs. His supervisor has already used the current graph in a draft slide deck but has not yet presented it.",
  },
  "sjt-s6": {
    id: "sjt-s6",
    title: "A Teammate Who Is Struggling",
    text: "Priya and Tom are medical students on the same placement. Tom has recently been arriving late and seems exhausted. He privately tells Priya that there are serious problems at home and asks her not to tell anyone. Later that day, Priya notices that Tom almost enters an observation under the wrong patient's record, although he spots the mistake before saving it. He says he is fine to continue working and again asks Priya to keep everything between them.",
  },
  "sjt-s7": {
    id: "sjt-s7",
    title: "Consent to Student Examination",
    text: "During a teaching clinic, Daniel, a medical student, is introduced to a patient who initially agrees that he may observe and later perform a simple abdominal examination under supervision. After the clinician demonstrates the examination, the patient looks uncomfortable and says, \"Actually, I would rather not have it done again.\" The clinic is busy, and Daniel needs one more supervised examination signed off that week. The clinician says to the patient, \"It would really help his training, but it is your decision.\"",
  },
  "sjt-s8": {
    id: "sjt-s8",
    title: "Conversation in the Lift",
    text: "Aisha is travelling in a crowded hospital lift with another medical student, Ben. Ben begins talking about an unusual patient they saw that morning. He does not say the patient's name, but mentions the patient's age, occupation, rare diagnosis and the small village where the patient lives. Two members of the public are standing nearby. Aisha thinks the combination of details could make the patient recognisable to someone who knows them.",
  },
  "sjt-s9": {
    id: "sjt-s9",
    title: "The Missed Handover Detail",
    text: "Jonah is a medical student observing a busy evening handover. Earlier in the day, a patient became briefly confused after receiving pain relief, but was normal again when reviewed. Jonah hears the outgoing junior doctor hand over the patient's other problems but not mention the episode of confusion. He is unsure whether the doctor has simply forgotten it or has decided that it is not clinically important. The incoming doctor is about to move to the next patient.",
  },
  "sjt-s10": {
    id: "sjt-s10",
    title: "Feedback After a Difficult Consultation",
    text: "Leah is a medical student observing Dr Shah. During a consultation, the patient repeatedly says they do not understand why a new medication is needed. Dr Shah appears rushed and eventually says, \"We have already gone through this; just take it as prescribed.\" After the patient leaves, Dr Shah asks Leah whether she has any feedback because he is completing her teaching assessment later that afternoon. Leah felt the patient remained confused, but she is worried that criticising Dr Shah could affect how he rates her.",
  },
  "sjt-s11": {
    id: "sjt-s11",
    title: "A Young Person Asks to Speak Alone",
    text: "Hana, a medical student, is observing an appointment with a 15-year-old patient, Sam, who has attended with a parent to discuss persistent headaches. During the consultation, Sam quietly asks whether they can speak to the clinician alone for a few minutes. The parent immediately says, \"There is nothing Sam can't say in front of me — I'm responsible for them.\" The clinician looks uncertain because the clinic is running late. Sam does not appear acutely unwell or distressed.",
  },
};

// ─── Shared option lists ───────────────────────────────────────────────────────

export const APPROP_OPTIONS = [
  "Very appropriate",
  "Appropriate, but not ideal",
  "Inappropriate, but not awful",
  "Very inappropriate",
];

export const IMPORT_OPTIONS = [
  "Very important",
  "Important",
  "Of minor importance",
  "Not important at all",
];

export const TFCT_OPTIONS = ["True", "False", "Can't Tell"];

// ─── Questions ────────────────────────────────────────────────────────────────

export const DIAGNOSTIC_QUESTIONS: DiagQuestion[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // VR — Passage 1 (Q1–4)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-VR-001", qNum: 1, section: "vr", format: "mcq",
    subtype: "Main idea", difficulty: "Gold", passageId: "vr-p1",
    stem: "Which statement best captures the passage as a whole?",
    options: [
      "Industrial employers invented precise timekeeping mainly to control factory workers.",
      "Mechanical clocks transformed society primarily because they became more accurate during industrialisation.",
      "Measured time became more socially powerful as institutions increasingly organised work and coordination around it.",
      "Rural communities relied almost entirely on natural rhythms until railways introduced standard time.",
    ],
    correct: 2,
    explanation: "The passage traces how time measurement became embedded in institutional life — factories, railways, labour movements — rather than crediting any single invention. A is too narrow, B overstates accuracy as the cause, and D misrepresents rural communities.",
  },
  {
    id: "DIAG-VR-002", qNum: 2, section: "vr", format: "mcq",
    subtype: "Inference", difficulty: "Diamond", passageId: "vr-p1",
    stem: "Which conclusion is best supported by the discussion of early domestic clocks?",
    options: [
      "Most domestic clock owners were unaware that their clocks were inaccurate.",
      "Owning a timepiece did not necessarily mean living according to a shared precise standard.",
      "Public clocks were generally more accurate than privately owned clocks.",
      "Dockyard workers were among the first people required to purchase personal watches.",
    ],
    correct: 1,
    explanation: "The passage states that owning a clock 'did not necessarily mean sharing an exact minute-by-minute schedule with everyone else'. A is unsupported, C conflates 'more useful' with 'more accurate', and D is not mentioned.",
  },
  {
    id: "DIAG-VR-003", qNum: 3, section: "vr", format: "mcq",
    subtype: "Writer's view", difficulty: "Diamond", passageId: "vr-p1",
    stem: "The writer's attitude towards the distinction between \"task time\" and \"clock time\" is best described as:",
    options: [
      "dismissive, because the distinction has no historical value.",
      "approving but qualified, because it is useful if not treated too rigidly.",
      "sceptical, because rural labour was more time-disciplined than factory labour.",
      "neutral, because the writer presents the distinction without evaluating it.",
    ],
    correct: 1,
    explanation: "The writer calls the distinction 'useful but too neat if treated literally' — approving with qualification. A is wrong (not dismissed), C reverses the evidence, and D is wrong because the writer explicitly evaluates it.",
  },
  {
    id: "DIAG-VR-004", qNum: 4, section: "vr", format: "mcq",
    subtype: "Logical deduction", difficulty: "Diamond", passageId: "vr-p1",
    stem: "Which of the following is most consistent with the final two paragraphs?",
    options: [
      "The standardisation of working hours benefited workers more than employers.",
      "Once clock time became widespread, customary leisure practices largely disappeared.",
      "A system developed for tighter measurement of labour could also be used to argue for limits on labour.",
      "The social effects of clocks were largely independent of changes in transport, wages and schooling.",
    ],
    correct: 2,
    explanation: "The final paragraph states 'the same system that enabled employers to measure labour more closely gave workers a precise way to argue that labour should end'. A makes an unsupported comparison, B is not stated, and D contradicts the passage.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // VR — Passage 2 (Q5–8)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-VR-005", qNum: 5, section: "vr", format: "tfct",
    subtype: "Direct retrieval", difficulty: "Gold", passageId: "vr-p2",
    stem: "High embankments can reduce the amount of sediment deposited across a floodplain.",
    correct: 0,
    explanation: "True. The passage states a high embankment 'can protect fields yet prevent sediment-rich floodwater from replenishing the floodplain' — meaning less sediment reaches the floodplain.",
  },
  {
    id: "DIAG-VR-006", qNum: 6, section: "vr", format: "tfct",
    subtype: "Inference", difficulty: "Diamond", passageId: "vr-p2",
    stem: "If two districts lie on the same delta, they will experience approximately the same rate of relative sea-level rise.",
    correct: 1,
    explanation: "False. The passage explicitly states 'two districts on the same delta may experience different rates of relative sea-level rise' due to local groundwater extraction, construction, and geological processes.",
  },
  {
    id: "DIAG-VR-007", qNum: 7, section: "vr", format: "tfct",
    subtype: "Scope and evidence", difficulty: "Diamond", passageId: "vr-p2",
    stem: "The author believes that densely populated urban areas should always be protected by engineered barriers rather than considered for any form of relocation.",
    correct: 1,
    explanation: "False. The passage states 'Dense cities may justify substantial defences, but this does not mean every urban area should always be defended in the same way' — directly contradicting the absolute claim.",
  },
  {
    id: "DIAG-VR-008", qNum: 8, section: "vr", format: "tfct",
    subtype: "Logical deduction", difficulty: "Diamond", passageId: "vr-p2",
    stem: "A regional delta plan can improve overall resilience while still imposing greater risk on some communities.",
    correct: 0,
    explanation: "True. The passage explicitly states: 'A plan can improve regional resilience while still imposing greater costs or risks on particular communities'.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // VR — Passage 3 (Q9–12)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-VR-009", qNum: 9, section: "vr", format: "mcq",
    subtype: "Main idea", difficulty: "Diamond", passageId: "vr-p3",
    stem: "Which statement best expresses the central argument?",
    options: [
      "Digital archives have made traditional methods of historical research largely unnecessary.",
      "Historians can reconstruct reading habits accurately only when court records and private letters agree.",
      "Surviving evidence about censored texts is shaped by selection effects, so historical claims should reflect the limits of the record.",
      "Prohibited texts were generally less influential than public accounts of censorship suggest.",
    ],
    correct: 2,
    explanation: "The passage argues archives are partial — shaped by what institutions noticed, what survived, what was digitised — so claims about illicit print must reflect these limits. A overstates digitisation, B is too narrow, and D is unsupported.",
  },
  {
    id: "DIAG-VR-010", qNum: 10, section: "vr", format: "mcq",
    subtype: "Meaning in context", difficulty: "Gold", passageId: "vr-p3",
    stem: "In the first paragraph, calling the surviving record \"the residue of what institutions noticed and recorded\" most nearly means that:",
    options: [
      "archives contain mainly documents that institutions intentionally preserved for historians.",
      "the evidence that remains has been shaped in part by institutional attention and record-keeping.",
      "institutions routinely destroyed records relating to ordinary permitted publications.",
      "official correspondence is generally more reliable than surviving printed material.",
    ],
    correct: 1,
    explanation: "The phrase means archives are not a random sample — they preserve what institutions happened to notice and record. A implies deliberate preservation for historians (not stated), C implies systematic destruction (not stated), and D makes an unsupported reliability comparison.",
  },
  {
    id: "DIAG-VR-011", qNum: 11, section: "vr", format: "mcq",
    subtype: "Argument evaluation", difficulty: "Diamond", passageId: "vr-p3",
    stem: "Which finding would most strengthen a claim that an early pamphlet influenced a later political movement?",
    options: [
      "The pamphlet contains a phrase very similar to a slogan used by the later movement.",
      "Only one physical copy of the pamphlet is known to survive.",
      "Correspondence shows that organisers of the later movement read and discussed a translation of the pamphlet.",
      "The pamphlet was included in a modern digitisation project alongside political works from the later period.",
    ],
    correct: 2,
    explanation: "The passage states strong claims need 'a plausible path of transmission'. Correspondence proving the later movement actually read and discussed the pamphlet provides direct transmission evidence. A shows mere resemblance (which the passage says is insufficient), B concerns scarcity not influence, and D doesn't establish transmission.",
  },
  {
    id: "DIAG-VR-012", qNum: 12, section: "vr", format: "mcq",
    subtype: "Writer's view", difficulty: "Diamond", passageId: "vr-p3",
    stem: "Which statement would the author most likely agree with?",
    options: [
      "Uncertainty should be minimised in public history because it weakens confidence in historical research.",
      "Missing evidence is useful only when historians can determine exactly why it is missing.",
      "The limitations of an archive can themselves provide information about how historical knowledge has been produced.",
      "Historians should avoid making claims about illicit print because circulation can rarely be measured directly.",
    ],
    correct: 2,
    explanation: "The final sentence says 'properly described uncertainty... shows where the archive is dense, where it is distorted and where confidence should stop' — limitations are themselves informative. A is the opposite of the writer's view, B is not stated, and D would prohibit legitimate historical inquiry.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // VR — Passage 4 (Q13–16)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-VR-013", qNum: 13, section: "vr", format: "tfct",
    subtype: "Direct retrieval", difficulty: "Gold", passageId: "vr-p4",
    stem: "Reflective roofs can become less reflective over time.",
    correct: 0,
    explanation: "True. The passage states: 'Reflective surfaces also become less effective as they weather, so maintenance affects long-term performance'.",
  },
  {
    id: "DIAG-VR-014", qNum: 14, section: "vr", format: "tfct",
    subtype: "Inference", difficulty: "Diamond", passageId: "vr-p4",
    stem: "A satellite map showing high surface temperature in a neighbourhood proves that pedestrians there experience equally high air temperatures.",
    correct: 1,
    explanation: "False. The passage explicitly says satellite observations 'do not directly measure the air temperature experienced by a pedestrian' — surface temperature and pedestrian air temperature are different measures.",
  },
  {
    id: "DIAG-VR-015", qNum: 15, section: "vr", format: "tfct",
    subtype: "Comparison", difficulty: "Diamond", passageId: "vr-p4",
    stem: "The author considers tree planting to be a more reliable urban-cooling strategy than reflective roofs.",
    correct: 2,
    explanation: "Can't Tell. The passage discusses both strategies with caveats and states both 'may all be useful in the right setting', but never directly compares their reliability.",
  },
  {
    id: "DIAG-VR-016", qNum: 16, section: "vr", format: "tfct",
    subtype: "Logical deduction", difficulty: "Diamond", passageId: "vr-p4",
    stem: "An urban-cooling project may reduce local heat exposure while creating a separate disadvantage for some residents.",
    correct: 0,
    explanation: "True. The passage states 'a greening project can raise property values and contribute to displacement pressure' — reducing heat while causing displacement is exactly this situation.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // VR — Passage 5 (Q17–20)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-VR-017", qNum: 17, section: "vr", format: "mcq",
    subtype: "Main idea", difficulty: "Gold", passageId: "vr-p5",
    stem: "Which statement best summarises the author's position?",
    options: [
      "Digital maps are less trustworthy than printed maps because algorithms hide their assumptions.",
      "Maps inevitably involve choices, so their quality should be judged partly by whether those choices suit their purpose and are made transparent.",
      "Political maps should avoid disputed borders because no visual convention can represent them neutrally.",
      "Equal-area projections are generally preferable because they represent geographic size accurately.",
    ],
    correct: 1,
    explanation: "The author argues maps are 'arguments about what matters', different projections suit different purposes, and proposes 'transparency' as the better standard. A, C, and D each represent positions the author explicitly rejects or qualifies.",
  },
  {
    id: "DIAG-VR-018", qNum: 18, section: "vr", format: "mcq",
    subtype: "Inference", difficulty: "Diamond", passageId: "vr-p5",
    stem: "Which inference is most strongly supported by the discussion of digital mapping?",
    options: [
      "Interactive maps remove the need for cartographers to choose which information users see.",
      "Algorithmic route recommendations may affect the world they are intended merely to describe.",
      "Most users understand that business rankings and route suggestions reflect hidden assumptions.",
      "Digital maps create more political disputes over place names than printed maps do.",
    ],
    correct: 1,
    explanation: "The passage states 'Repeated route suggestions may then alter traffic patterns, so the map can begin to influence the world it appears merely to describe' — directly supporting B. A is wrong (choices are 'relocated' not removed), C is unsupported, D is not stated.",
  },
  {
    id: "DIAG-VR-019", qNum: 19, section: "vr", format: "mcq",
    subtype: "Meaning in context", difficulty: "Diamond", passageId: "vr-p5",
    stem: "In the final paragraph, the phrase \"a visual image can feel self-evident\" most nearly suggests that:",
    options: [
      "people may accept the message of a map without questioning how it was constructed.",
      "maps are easier to understand than written arguments because they contain fewer assumptions.",
      "visual evidence is usually more accurate than verbal evidence.",
      "public debates depend too heavily on maps rather than written sources.",
    ],
    correct: 0,
    explanation: "The paragraph warns 'because maps can look self-evidently factual, readers should ask who made them'. The phrase warns that visual format makes maps seem unquestionable. B and C contradict the author's caution, D is not discussed.",
  },
  {
    id: "DIAG-VR-020", qNum: 20, section: "vr", format: "mcq",
    subtype: "Argument evaluation", difficulty: "Diamond", passageId: "vr-p5",
    stem: "Which practice would best fit the author's proposed standard for responsible mapping?",
    options: [
      "Using the same projection for all maps so that users can compare them easily.",
      "Displaying every available place name whenever a location has more than one recognised name.",
      "Explaining the purpose of a map and indicating significant uncertainty in its data or conventions.",
      "Avoiding any algorithmic ranking of routes, businesses or geographic features.",
    ],
    correct: 2,
    explanation: "The author's proposed standard is: 'make the map's purpose clear, acknowledge important uncertainty and distinguish measured information from inference'. C matches this directly. A is too rigid, B would make maps unusable, and D is too absolute.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DM — Q21–38
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-DM-001", qNum: 21, section: "dm", format: "multi",
    subtype: "Syllogism", difficulty: "Diamond", mark_value: 2,
    preamble: "At a research institute:\n• Every marine biologist is a field researcher.\n• No field researcher is a laboratory administrator.\n• Some ecologists are laboratory administrators.",
    stem: "For each conclusion, select Yes if it must follow and No if it does not.",
    statements: [
      "No marine biologist is a laboratory administrator.",
      "Some ecologists are not field researchers.",
      "Some laboratory administrators are not marine biologists.",
      "Some ecologists are marine biologists.",
      "No ecologist is a field researcher.",
    ],
    correctStatements: [true, true, true, false, false],
    explanation: "A (Yes): marine biologists → field researchers → not lab admins. B (Yes): some ecologists are lab admins → lab admins are not field researchers → those ecologists are not field researchers. C (Yes): since no marine biologist is a lab admin, some lab admins must not be marine biologists. D (No): no link between ecologists and marine biologists is given. E (No): only some ecologists are known to be non-field-researchers, not all.",
  },
  {
    id: "DIAG-DM-002", qNum: 22, section: "dm", format: "mcq",
    subtype: "Syllogism", difficulty: "Gold", mark_value: 1,
    preamble: "All Grade A buildings are protected structures.\nSome protected structures are museums.\nNo museum is used as a warehouse.",
    stem: "Which conclusion must be true?",
    options: [
      "No Grade A building is a warehouse.",
      "Some protected structures are not warehouses.",
      "Some warehouses are protected structures.",
      "At least one museum is a Grade A building.",
    ],
    correct: 1,
    explanation: "No museum is a warehouse, and some protected structures are museums — so those museum-protected structures are definitely not warehouses. A cannot be concluded (Grade A buildings may not be museums). C contradicts the given. D cannot be concluded (not all protected structures are Grade A).",
  },
  {
    id: "DIAG-DM-003", qNum: 23, section: "dm", format: "mcq",
    subtype: "Logical puzzle — scheduling", difficulty: "Diamond", mark_value: 1,
    preamble: "Five observing sessions — J, K, L, M and N — are scheduled into five consecutive slots, 1 to 5, with one session in each slot.\n• J is earlier than M.\n• K is immediately after L.\n• N is not in slot 1 or slot 5.\n• Exactly one session is scheduled between J and N.\n• M is not immediately after N.",
    stem: "Which of the following could be the complete order from slot 1 to slot 5?",
    options: [
      "J, M, N, L, K",
      "L, K, J, M, N",
      "J, N, L, K, M",
      "L, J, K, N, M",
    ],
    correct: 0,
    explanation: "Testing A — J(1), M(2), N(3), L(4), K(5): J before M ✓; K immediately after L ✓; N not in slot 1 or 5 ✓; exactly one session (M) between J and N ✓; M not immediately after N (M is slot 2, N is slot 3) ✓. B fails: N is in slot 5. C fails: no session separates J and N. D fails: K (slot 3) is not immediately after L (slot 1).",
  },
  {
    id: "DIAG-DM-004", qNum: 24, section: "dm", format: "multi",
    subtype: "Interpreting information", difficulty: "Gold", mark_value: 2,
    preamble: "A coastal survey uses these rules:\n• Every site with severe erosion is inspected monthly.\n• A site that is inspected monthly and lies within 2 km of housing receives a community warning plan.\n• No site inside a protected nesting zone can use rock armour.\n• Some sites with community warning plans are inside protected nesting zones.",
    stem: "For each conclusion, select Yes if it must follow and No if it does not.",
    statements: [
      "Every site with severe erosion receives a community warning plan.",
      "At least one protected nesting-zone site has a community warning plan.",
      "No site using rock armour is inside a protected nesting zone.",
      "Some sites with community warning plans cannot use rock armour.",
      "A site with severe erosion may be more than 2 km from housing.",
    ],
    correctStatements: [false, true, true, true, true],
    explanation: "A (No): severe erosion → monthly inspection, but community warning plans also require being within 2 km of housing — not guaranteed. B (Yes): given directly. C (Yes): stated as a rule. D (Yes): some community-warning-plan sites are in protected nesting zones, which cannot use rock armour. E (Yes): severe erosion only guarantees inspection — a site may still be far from housing.",
  },
  {
    id: "DIAG-DM-005", qNum: 25, section: "dm", format: "mcq",
    subtype: "Strongest argument", difficulty: "Gold", mark_value: 1,
    preamble: "A university is considering keeping its main library open for an additional two hours every night during examination season.",
    stem: "Which is the strongest argument in favour of the proposal?",
    options: [
      "Many students enjoy studying in libraries because libraries have a serious atmosphere.",
      "Extending opening hours would allow students whose placements or jobs end late to access study space and reserved materials that are otherwise unavailable to them.",
      "Other universities sometimes keep their libraries open later during examinations.",
      "Students who study late often buy drinks and snacks, which can help nearby businesses.",
    ],
    correct: 1,
    explanation: "B identifies a specific group (students with late placements or jobs) who face a concrete disadvantage (inaccessible study space and reserved materials), making a targeted, substantive case. A is vague, C appeals to what others do without justifying the policy, and D is a peripheral benefit to businesses.",
  },
  {
    id: "DIAG-DM-006", qNum: 26, section: "dm", format: "mcq",
    subtype: "Venn diagrams", difficulty: "Gold", mark_value: 1,
    preamble: "The Venn diagram shows the languages spoken by 180 delegates. Each number represents delegates in that exact region only. Nine delegates speak none of the three languages.\n\nFrench only: 38 | Spanish only: 31 | German only: 24\nFrench & Spanish only: 26 | French & German only: 19 | Spanish & German only: 17 | All three: 16",
    stem: "How many delegates speak exactly one of the three languages?",
    options: ["86", "90", "93", "102"],
    correct: 2,
    vennFigure: {
      labelA: "French", labelB: "Spanish", labelC: "German",
      total: 180, neither: 9,
      onlyA: 38, onlyB: 31, onlyC: 24,
      ab: 26, ac: 19, bc: 17, abc: 16,
    },
    explanation: "Exactly one language = only French + only Spanish + only German = 38 + 31 + 24 = 93. Verify total: 38+31+24+26+19+17+16+9 = 180 ✓.",
  },
  {
    id: "DIAG-DM-007", qNum: 27, section: "dm", format: "multi",
    subtype: "Probability and statistics", difficulty: "Diamond", mark_value: 2,
    preamble: "A clinical-trial recruitment team records the following:\n\nGroup A: Invited 240, Agreed to screening 144, Passed screening 108\nGroup B: Invited 180, Agreed to screening 126, Passed screening 84\nGroup C: Invited 300, Agreed to screening 165, Passed screening 132",
    stem: "For each statement, select Yes if it is supported by the data and No if it is not.",
    statements: [
      "Among people who agreed to screening, Group C had the highest pass rate.",
      "A randomly selected invited person from Group A had a greater probability of passing screening than one from Group B.",
      "More than half of all invited people agreed to screening.",
      "Exactly 75% of people who agreed to screening in Group A passed screening.",
      "If one person is selected at random from all those who passed screening, the probability that they came from Group C is greater than 40%.",
    ],
    correctStatements: [true, false, true, true, true],
    explanation: "A (Yes): pass rates — A: 108/144=75%, B: 84/126=66.7%, C: 132/165=80%. Group C is highest. B (No): overall rates — A: 108/240=45%, B: 84/180=46.7%. Group B is actually higher than A. C (Yes): 435/720=60.4% > 50%. D (Yes): 108/144=75% exactly. E (Yes): 132/324=40.7% > 40%.",
  },
  {
    id: "DIAG-DM-008", qNum: 28, section: "dm", format: "mcq",
    subtype: "Logical puzzle — ordering", difficulty: "Diamond", mark_value: 1,
    preamble: "Six deliveries — F, G, H, J, K and L — arrive one at a time.\n• F arrives before H.\n• G arrives after J but before L.\n• K arrives immediately before F.\n• Exactly two deliveries occur between H and L.\n• J is not first.",
    stem: "Which delivery must arrive first?",
    options: ["F", "G", "J", "K"],
    correct: 3,
    explanation: "K immediately before F (K→F), and F before H gives K→F→...→H. Testing K first: K(1), F(2), H(3), J(4), G(5), L(6) — F before H ✓, K immediately before F ✓, J→G→L ✓, exactly two deliveries (J and G) between H and L ✓, J not first ✓. No other starting delivery satisfies all constraints — K must be first.",
  },
  {
    id: "DIAG-DM-009", qNum: 29, section: "dm", format: "mcq",
    subtype: "Strongest argument", difficulty: "Diamond", mark_value: 1,
    preamble: "A city is deciding whether to run a one-year pilot of autonomous buses on a restricted route before considering wider deployment.",
    stem: "Which is the strongest argument against the pilot?",
    options: [
      "Some residents dislike the idea of vehicles operating without a conventional driver.",
      "The city should not test technology simply because it is new.",
      "If the restricted route lacks the complex junctions and pedestrian conditions found elsewhere in the city, safety data from the pilot may provide limited evidence about wider deployment.",
      "Conventional buses have operated in the city for many years and are familiar to passengers.",
    ],
    correct: 2,
    explanation: "C raises the most substantive concern: if the pilot route doesn't reflect real-world conditions, the safety data may not generalise — directly challenging the pilot's validity as evidence. A is emotional preference, B states a principle without support, and D appeals to familiarity rather than safety.",
  },
  {
    id: "DIAG-DM-010", qNum: 30, section: "dm", format: "multi",
    subtype: "Syllogism", difficulty: "Diamond", mark_value: 2,
    preamble: "For an expedition team:\n• All navigators are trained climbers.\n• No medic is a drone operator.\n• Some photographers are navigators.",
    stem: "For each conclusion, select Yes if it must follow and No if it does not.",
    statements: [
      "Some trained climbers are photographers.",
      "No drone operator is a medic.",
      "Some navigators are photographers.",
      "Some trained climbers are medics.",
      "All photographers are trained climbers.",
    ],
    correctStatements: [true, true, true, false, false],
    explanation: "A (Yes): some photographers are navigators → all navigators are trained climbers → those photographer-navigators are trained climbers. B (Yes): contrapositive of 'no medic is a drone operator'. C (Yes): restating 'some photographers are navigators'. D (No): no link between navigators and medics is given. E (No): only some photographers are navigators — we cannot conclude all photographers are trained climbers.",
  },
  {
    id: "DIAG-DM-011", qNum: 31, section: "dm", format: "mcq",
    subtype: "Probability", difficulty: "Gold", mark_value: 1,
    preamble: "A box contains 7 new water-level sensors and 5 refurbished sensors. Two sensors are chosen at random without replacement.",
    stem: "What is the probability that exactly one selected sensor is refurbished?",
    options: ["35/66", "35/72", "5/11", "7/12"],
    correct: 0,
    explanation: "P(exactly one refurbished) = P(new then refurb) + P(refurb then new) = (7/12)(5/11) + (5/12)(7/11) = 35/132 + 35/132 = 70/132 = 35/66.",
  },
  {
    id: "DIAG-DM-012", qNum: 32, section: "dm", format: "mcq",
    subtype: "Statistical reasoning", difficulty: "Diamond", mark_value: 1,
    preamble: "A scholarship programme reports the following annual household incomes for five recipients:\n£24,000, £27,000, £29,000, £31,000 and £89,000.\n\nA sixth recipient is added. After the addition, the median increases while the mean decreases.",
    stem: "Which of the following could be the sixth recipient's household income?",
    options: ["£26,000", "£30,000", "£48,000", "£96,000"],
    correct: 1,
    explanation: "Original: mean = £40k, median = £29k. With £30k: sorted = 24k, 27k, 29k, 30k, 31k, 89k → new median = (29+30)/2 = £29.5k > £29k ✓; new mean = 230k/6 = £38.3k < £40k ✓. £26k lowers the median. £48k and £96k both raise the mean above £40k.",
  },
  {
    id: "DIAG-DM-013", qNum: 33, section: "dm", format: "multi",
    subtype: "Logical puzzle — assignment", difficulty: "Diamond", mark_value: 2,
    preamble: "Four archive boxes — W, X, Y and Z — each contain material from a different century: 16th, 17th, 18th or 19th. Each came from a different city: Bath, Durham, Exeter or York.\n• Y contains the 16th-century material.\n• The 18th-century material came from York.\n• Z is from Bath.\n• W is from Exeter.\n• X contains later material than W.",
    stem: "For each statement, select Yes if it must be true and No if it does not.",
    statements: [
      "Y is not from York.",
      "X is from Durham.",
      "Z contains 19th-century material.",
      "W contains 17th-century material.",
      "The Exeter material is from the 19th century.",
    ],
    correctStatements: [true, false, true, true, false],
    explanation: "Y has 16th-century; 18th-century is from York → Y≠York → Y=Durham, X=York (18th century). X later than W; X=18th, so W=16th or 17th. Y has 16th, so W=17th. Z=Bath gets 19th. Summary: W=Exeter/17th, X=York/18th, Y=Durham/16th, Z=Bath/19th. A (Yes) ✓, B (No: X=York, not Durham) ✓, C (Yes) ✓, D (Yes) ✓, E (No: Exeter/W=17th) ✓.",
  },
  {
    id: "DIAG-DM-014", qNum: 34, section: "dm", format: "mcq",
    subtype: "Recognising assumptions", difficulty: "Diamond", mark_value: 1,
    preamble: "A council officer argues: \"We should replace the town's optional flood-alert text service with automatic alerts to every registered mobile number in the area. During last winter's floods, fewer than one third of households had opted into the existing service. Automatic alerts will therefore ensure that residents receive warnings when they need them.\"",
    stem: "Which assumption is most necessary for the officer's conclusion?",
    options: [
      "Most residents prefer text messages to alerts delivered through social media.",
      "Registered mobile numbers can be linked sufficiently well to people who need warnings in the affected area.",
      "Last winter's floods were more severe than floods in previous years.",
      "The cost of automatic alerts would be lower than the cost of maintaining the optional service.",
    ],
    correct: 1,
    explanation: "The conclusion that automatic alerts will reach residents who need them only holds if registered mobile numbers actually correspond to those people. B identifies this essential link. A is about preference (not necessary), C compares flood severity (irrelevant), and D is about cost (not necessary for effectiveness).",
  },
  {
    id: "DIAG-DM-015", qNum: 35, section: "dm", format: "mcq",
    subtype: "Venn diagrams", difficulty: "Gold", mark_value: 1,
    preamble: "A community centre has 120 members. The Venn diagram shows class attendance. Each overlapping region shows members attending exactly those classes.\n\nExercise only: 30 | Language only: 19 | Craft only: 20\nExercise & Language only: 17 | Exercise & Craft only: 9 | Language & Craft only: 6 | All three: 12",
    stem: "How many members attend none of the three types of class?",
    options: ["7", "9", "11", "13"],
    correct: 0,
    vennFigure: {
      labelA: "Exercise", labelB: "Language", labelC: "Craft",
      total: 120,
      onlyA: 30, onlyB: 19, onlyC: 20,
      ab: 17, ac: 9, bc: 6, abc: 12,
    },
    explanation: "Members in at least one class = 30+19+20+17+9+6+12 = 113. Members attending none = 120−113 = 7.",
  },
  {
    id: "DIAG-DM-016", qNum: 36, section: "dm", format: "multi",
    subtype: "Probability and statistics", difficulty: "Diamond", mark_value: 2,
    preamble: "In a population of 10,000 people:\n• 8% have condition X.\n• A screening test is positive in 90% of people who have condition X.\n• The test is also positive in 6% of people who do not have condition X.",
    stem: "For each statement, select Yes if it follows from the information and No if it does not.",
    statements: [
      "More people without condition X receive a positive result than people with condition X receive a positive result.",
      "Fewer than half of all positive results come from people with condition X.",
      "A person with condition X is fifteen times as likely to test positive as a person without condition X.",
      "More than 9,000 people in the population will test negative.",
      "If the prevalence of condition X increased while the test characteristics stayed the same, the proportion of positive results that are true positives would increase.",
    ],
    correctStatements: [false, false, true, false, true],
    explanation: "With X: 800. True positives: 720. Without X: 9,200. False positives: 552. Total positives: 1,272. Negatives: 8,728. A (No): 552 < 720 — fewer without-X test positive. B (No): 720/1,272=56.6% — more than half are true positives. C (Yes): 0.90/0.06=15. D (No): 8,728 < 9,000. E (Yes): higher prevalence → higher proportion of true positives relative to false positives.",
  },
  {
    id: "DIAG-DM-017", qNum: 37, section: "dm", format: "mcq",
    subtype: "Logical puzzle — matching", difficulty: "Diamond", mark_value: 1,
    preamble: "Four applicants — Aisha, Ben, Cara and Dev — are interviewed in rooms 1, 2, 3 and 4, one applicant per room.\n• Aisha is not in room 1 or room 4.\n• Ben is in a lower-numbered room than Cara.\n• Dev is not next to Aisha.\n• Cara is not in room 4.\n• Room 2 is not occupied by Ben.",
    stem: "Who must be in room 1?",
    options: ["Aisha", "Ben", "Cara", "Dev"],
    correct: 1,
    explanation: "Aisha must be in room 2 or 3. Ben is not in room 2, must be lower than Cara (not 4). Testing Ben=1, Cara=3: Aisha=2, Dev=4. Dev(4) not next to Aisha(2) ✓ — all constraints satisfied. Testing Ben=1, Cara=2 forces Aisha=3, Dev=4, but Dev(4) is adjacent to Aisha(3) ✗. No other placement works — Ben must be in room 1.",
  },
  {
    id: "DIAG-DM-018", qNum: 38, section: "dm", format: "mcq",
    subtype: "Strongest argument", difficulty: "Gold", mark_value: 1,
    preamble: "A rail operator is considering adding one late-night train on Fridays and Saturdays.",
    stem: "Which is the strongest argument in favour?",
    options: [
      "Some passengers say they would enjoy having more choice at night.",
      "A late service may reduce the number of travellers who currently rely on expensive or unsafe alternatives after the final train, if demand is sufficient to operate the service sustainably.",
      "Trains are generally more comfortable than buses.",
      "The operator already runs trains throughout the day, so adding another one would be consistent with its usual business.",
    ],
    correct: 1,
    explanation: "B addresses a concrete safety and accessibility problem (expensive or unsafe alternatives) and conditions the argument on sufficient demand and sustainability — covering both the social benefit and commercial viability. A is vague, C (comfort) is irrelevant, and D is circular reasoning.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // QR — Data Set 1: Exhibition Room (Q39–42)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-QR-001", qNum: 39, section: "qr", format: "mcq",
    subtype: "Geometry — spatial packing", difficulty: "Diamond", dataSetId: "qr-ds1",
    stem: "What is the greatest number of display modules that can fit while meeting the clearance and gap requirements?",
    options: ["8", "10", "12", "16"],
    correct: 2,
    explanation: "The 1 m clearance on all sides reduces the usable floor to 8 m × 6 m. Each module is 2 m × 1 m with a 0.5 m gap between modules. Orientation 1 (2 m along 8 m axis): ⌊(8+0.5)/(2+0.5)⌋ = 3 columns × ⌊(6+0.5)/(1+0.5)⌋ = 4 rows = 12. Orientation 2 (1 m along 8 m axis): ⌊(8+0.5)/(1+0.5)⌋ = 5 × ⌊(6+0.5)/(2+0.5)⌋ = 2 = 10. Maximum = 12 modules.",
  },
  {
    id: "DIAG-QR-002", qNum: 40, section: "qr", format: "mcq",
    subtype: "Geometry — surface area", difficulty: "Gold", dataSetId: "qr-ds1",
    stem: "The door and both windows are not painted. What is the minimum number of 5 L tins required for two coats on the four walls?",
    options: ["3", "4", "5", "6"],
    correct: 2,
    explanation: "Total wall area: 2×(10×3) + 2×(8×3) = 60 + 48 = 108 m². Subtract door (1×2 = 2 m²) and 2 windows (2×1.5×1 = 3 m²) → paintable area = 103 m². Two coats: 206 m². Coverage: 10 m²/L × 5 L = 50 m²/tin. Tins needed: ⌈206/50⌉ = ⌈4.12⌉ = 5 tins.",
  },
  {
    id: "DIAG-QR-003", qNum: 41, section: "qr", format: "mcq",
    subtype: "Geometry — area percentage", difficulty: "Gold", dataSetId: "qr-ds1",
    stem: "If 12 display modules are installed, what percentage of the room's total floor area is physically covered by the modules themselves?",
    options: ["22.5%", "27.5%", "30.0%", "35.0%"],
    correct: 2,
    explanation: "Total floor area: 10×8 = 80 m². Each module footprint: 2×1 = 2 m². 12 modules cover 24 m². Percentage: (24/80)×100 = 30.0%.",
  },
  {
    id: "DIAG-QR-004", qNum: 42, section: "qr", format: "mcq",
    subtype: "Rates and measurements", difficulty: "Gold", dataSetId: "qr-ds1",
    stem: "The room's ventilation system moves 200 m³ of air per hour. How long would it take the system to move a volume of air equal to the room's volume?",
    options: ["54 minutes", "60 minutes", "72 minutes", "80 minutes"],
    correct: 2,
    explanation: "Room volume: 10×8×3 = 240 m³. Rate: 200 m³/hr. Time = 240/200 hours = 1.2 hours = 1.2×60 = 72 minutes.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // QR — Data Set 2: Island Ferries (Q43–46)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-QR-005", qNum: 43, section: "qr", format: "mcq",
    subtype: "Currency and finance", difficulty: "Gold", dataSetId: "qr-ds2",
    stem: "What is the total passenger-fare revenue from Route B shown in the chart?",
    options: ["£4,184.40", "£4,295.80", "£4,356.60", "£4,482.20"],
    correct: 1,
    explanation: "Route B: 122 adults × £27.50 = £3,355.00 and 56 children × £16.80 = £940.80. Total: £3,355.00 + £940.80 = £4,295.80.",
  },
  {
    id: "DIAG-QR-006", qNum: 44, section: "qr", format: "mcq",
    subtype: "Percentages", difficulty: "Gold", dataSetId: "qr-ds2",
    stem: "What percentage of passengers on Route C were children?",
    options: ["25.0%", "30.0%", "33.3%", "36.7%"],
    correct: 2,
    explanation: "Route C: 88 adults + 44 children = 132 total. Proportion of children: 44/132 = 1/3 = 33.3%.",
  },
  {
    id: "DIAG-QR-007", qNum: 45, section: "qr", format: "mcq",
    subtype: "Percentages — projection", difficulty: "Diamond", dataSetId: "qr-ds2",
    stem: "If the total number of passengers on Route A rises by 12.5% the following Saturday, with the same adult-to-child ratio, approximately how many passengers will travel on Route A?",
    options: ["151", "155", "158", "162"],
    correct: 1,
    explanation: "Route A current total: 96+42 = 138 passengers. After a 12.5% increase: 138×1.125 = 155.25 ≈ 155.",
  },
  {
    id: "DIAG-QR-008", qNum: 46, section: "qr", format: "mcq",
    subtype: "Rates", difficulty: "Diamond", dataSetId: "qr-ds2",
    stem: "Using the passenger numbers shown, Route A produces approximately what percentage more passenger-kilometres than Route C?",
    options: ["22.6%", "26.4%", "29.1%", "34.7%"],
    correct: 2,
    explanation: "Route A: (96+42)×42 = 138×42 = 5,796 passenger-km. Route C: (88+44)×34 = 132×34 = 4,488 passenger-km. % more: (5,796−4,488)/4,488 × 100 = 1,308/4,488 × 100 ≈ 29.1%.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // QR — Data Set 3: City Cycle Hire (Q47–50)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-QR-009", qNum: 47, section: "qr", format: "mcq",
    subtype: "Percentages", difficulty: "Gold", dataSetId: "qr-ds3",
    stem: "By approximately what percentage did Southbay's journeys increase from Monday to Friday?",
    options: ["79.2%", "86.4%", "91.7%", "97.5%"],
    correct: 2,
    explanation: "Southbay: Monday 360, Friday 690. Increase: (690−360)/360 × 100 = 330/360 × 100 ≈ 91.7%.",
  },
  {
    id: "DIAG-QR-010", qNum: 48, section: "qr", format: "mcq",
    subtype: "Percentages", difficulty: "Gold", dataSetId: "qr-ds3",
    stem: "On Wednesday, 12% of all journeys across the two cities used electric cycles. Approximately how many electric-cycle journeys were recorded?",
    options: ["112", "118", "122", "128"],
    correct: 2,
    explanation: "Wednesday total: Northport 480 + Southbay 540 = 1,020 journeys. Electric: 12% × 1,020 = 122.4 ≈ 122.",
  },
  {
    id: "DIAG-QR-011", qNum: 49, section: "qr", format: "mcq",
    subtype: "Averages", difficulty: "Diamond", dataSetId: "qr-ds3",
    stem: "What was the mean combined number of journeys per day across the five days?",
    options: ["1,008", "1,028", "1,048", "1,068"],
    correct: 2,
    explanation: "Combined daily totals: Mon 780, Tue 960, Wed 1,020, Thu 1,220, Fri 1,260. Sum: 5,240. Mean: 5,240÷5 = 1,048.",
  },
  {
    id: "DIAG-QR-012", qNum: 50, section: "qr", format: "mcq",
    subtype: "Data interpretation", difficulty: "Diamond", dataSetId: "qr-ds3",
    stem: "On which day was the difference between the two cities largest as a percentage of Northport's figure?",
    options: ["Monday", "Wednesday", "Thursday", "Friday"],
    correct: 3,
    explanation: "Differences as % of Northport: Mon |420−360|/420 = 14.3%, Tue 60/510 = 11.8%, Wed 60/480 = 12.5%, Thu 20/620 = 3.2%, Fri |570−690|/570 = 21.1%. Friday is the largest at 21.1%.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // QR — Data Set 4: Household Energy Use (Q51–53)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-QR-013", qNum: 51, section: "qr", format: "mcq",
    subtype: "Percentages", difficulty: "Diamond", dataSetId: "qr-ds4",
    stem: "By approximately what percentage did the amount of energy used for heating decrease from 2025 to 2026?",
    options: ["14.6%", "16.2%", "18.8%", "20.5%"],
    correct: 2,
    explanation: "2025 heating: 18,400×45% = 8,280 kWh. 2026 heating: 16,800×40% = 6,720 kWh. Decrease: (8,280−6,720)/8,280 × 100 = 1,560/8,280 ≈ 18.8%.",
  },
  {
    id: "DIAG-QR-014", qNum: 52, section: "qr", format: "mcq",
    subtype: "Pie charts", difficulty: "Gold", dataSetId: "qr-ds4",
    stem: "How much energy was used for hot water and appliances combined in 2026?",
    options: ["6,720 kWh", "7,056 kWh", "7,392 kWh", "7,728 kWh"],
    correct: 1,
    explanation: "2026 total: 16,800 kWh. Hot water: 22%×16,800 = 3,696 kWh. Appliances: 20%×16,800 = 3,360 kWh. Combined: 3,696+3,360 = 7,056 kWh.",
  },
  {
    id: "DIAG-QR-015", qNum: 53, section: "qr", format: "mcq",
    subtype: "Percentages", difficulty: "Diamond", dataSetId: "qr-ds4",
    stem: "Although \"Other\" rose from 7% to 9% of the total, by approximately what percentage did the actual amount of energy in that category increase?",
    options: ["12.4%", "15.1%", "17.4%", "21.0%"],
    correct: 2,
    explanation: "2025 Other: 18,400×7% = 1,288 kWh. 2026 Other: 16,800×9% = 1,512 kWh. Increase: (1,512−1,288)/1,288 × 100 = 224/1,288 ≈ 17.4%. The percentage share rose but the actual kWh increase is modest because total consumption fell.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // QR — Data Set 5: Theatre Performances (Q54–56)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-QR-016", qNum: 54, section: "qr", format: "mcq",
    subtype: "Finance", difficulty: "Gold", dataSetId: "qr-ds5",
    stem: "What is the gross ticket revenue for Evening 1?",
    options: ["£12,438", "£12,684", "£12,834", "£13,104"],
    correct: 2,
    explanation: "Evening 1: 90 premium + 252 standard + 111 restricted. Revenue: (90×£42) + (252×£28) + (111×£18) = £3,780 + £7,056 + £1,998 = £12,834.",
  },
  {
    id: "DIAG-QR-017", qNum: 55, section: "qr", format: "mcq",
    subtype: "Profit and margins", difficulty: "Diamond", dataSetId: "qr-ds5",
    stem: "For Evening 2, approximately what percentage of gross ticket revenue remains after the stated operating costs are deducted?",
    options: ["36.2%", "40.8%", "44.1%", "48.5%"],
    correct: 1,
    explanation: "Evening 2: 88+268+116 = 472 attendees. Revenue: (88×£42)+(268×£28)+(116×£18) = £3,696+£7,504+£2,088 = £13,288. Operating costs: £4,850+(472×£6.40) = £4,850+£3,020.80 = £7,870.80. Remaining: £13,288−£7,870.80 = £5,417.20. Percentage: 5,417.20/13,288×100 ≈ 40.8%.",
  },
  {
    id: "DIAG-QR-018", qNum: 56, section: "qr", format: "mcq",
    subtype: "Percentages", difficulty: "Diamond", dataSetId: "qr-ds5",
    stem: "Suppose the restricted-view ticket price had been £20 instead of £18 for all three performances, with exactly the same numbers of tickets sold. By approximately what percentage would total ticket revenue across the three performances have increased?",
    options: ["1.2%", "1.7%", "2.4%", "3.1%"],
    correct: 1,
    explanation: "Total restricted tickets: 94+111+116 = 321. Extra revenue at £2 more each: 321×£2 = £642. Original totals — Matinee: (82×42)+(236×28)+(94×18) = £3,444+£6,608+£1,692 = £11,744; Evening 1: £12,834; Evening 2: £13,288. Grand total: £37,866. % increase: 642/37,866×100 ≈ 1.7%.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SJT — Scenario 1: Allergy (Q57–59)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-SJT-001", qNum: 57, section: "sjt", format: "approp",
    subtype: "Patient safety — speaking up", difficulty: "Gold",
    scenarioId: "sjt-s1", critical_safety: true,
    stem: "How appropriate is the following action?\n\nMaya immediately tells the doctor what she remembers the patient saying and asks them to check the allergy history before prescribing.",
    correct: 0,
    explanation: "Very appropriate. Patient safety must come first. Even though Maya is a student and is uncertain, the risk of an allergic reaction to a penicillin-related antibiotic is serious. Raising the concern promptly gives the doctor the chance to verify the record before any prescription is issued — exactly the kind of speaking-up behaviour that prevents harm.",
  },
  {
    id: "DIAG-SJT-002", qNum: 58, section: "sjt", format: "approp",
    subtype: "Patient safety — uncertainty", difficulty: "Diamond",
    scenarioId: "sjt-s1", critical_safety: true,
    stem: "How appropriate is the following action?\n\nMaya decides not to interrupt the doctor but plans to mention the allergy comment after the prescription has been completed.",
    correct: 3,
    explanation: "Very inappropriate. Waiting until after the prescription is issued could mean the patient receives a drug they are allergic to before the concern is raised. A potential allergy to a prescribed drug is a time-critical safety issue — delaying action because the doctor is busy is not acceptable when patient harm is a real risk.",
  },
  {
    id: "DIAG-SJT-003", qNum: 59, section: "sjt", format: "mostleast",
    subtype: "Patient safety — prioritisation", difficulty: "Diamond",
    scenarioId: "sjt-s1", critical_safety: true,
    stem: "When Maya decides what to do, which factor should be MOST important and which should be LEAST important?",
    factors: [
      "The possibility that the patient's previous reaction could be relevant to safe prescribing.",
      "The fact that Maya is less clinically experienced than the doctor.",
      "Whether checking the allergy information will delay the doctor by a few minutes.",
      "Whether the doctor might feel embarrassed at being questioned by a student.",
    ],
    correctMost: 0,
    correctLeast: 3,
    explanation: "Most important: A — the possibility of a clinically relevant allergy is a direct patient safety concern and must drive the decision. Least important: D — the doctor's potential embarrassment at being questioned by a student is irrelevant when patient safety is at stake; professional hierarchy should never deter a safety concern.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SJT — Scenario 2: Social Media (Q60–62)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-SJT-004", qNum: 60, section: "sjt", format: "approp",
    subtype: "Professional boundaries", difficulty: "Gold",
    scenarioId: "sjt-s2", critical_safety: false,
    stem: "How appropriate is the following action?\n\nImran does not accept the follow request and replies only to direct the patient to the practice's approved clinical contact route.",
    correct: 0,
    explanation: "Very appropriate. Declining the personal follow request maintains professional boundaries and protects both the patient and Imran. Redirecting to the approved contact system ensures the patient gets a proper, documented clinical response rather than informal advice via social media — which would be unsafe and unprofessional.",
  },
  {
    id: "DIAG-SJT-005", qNum: 61, section: "sjt", format: "approp",
    subtype: "Confidentiality and boundaries", difficulty: "Diamond",
    scenarioId: "sjt-s2", critical_safety: true,
    stem: "How appropriate is the following action?\n\nImran accepts the request temporarily so he can see the photograph, then tells the patient that the swelling does not look serious but that they should contact the practice if it worsens.",
    correct: 3,
    explanation: "Very inappropriate. Accepting a patient's social-media follow request blurs the professional boundary. Offering a clinical opinion via a private account is outside Imran's scope and bypasses the proper clinical contact route — creating risks for patient safety, confidentiality, and professional accountability. 'Temporarily' accepting does not mitigate these problems.",
  },
  {
    id: "DIAG-SJT-006", qNum: 62, section: "sjt", format: "import",
    subtype: "Professional boundaries", difficulty: "Diamond",
    scenarioId: "sjt-s2", critical_safety: false,
    stem: "When deciding how to respond, how important is it for Imran to consider:\n\nThat communicating through his private account could blur the boundary between his personal life and his role as a student involved in the patient's care.",
    correct: 0,
    explanation: "Very important. Mixing personal social media with clinical relationships compromises confidentiality, professional identity, and patient trust. Clear professional boundaries protect both the patient's dignity and the student's own professional standing — this consideration should be central to Imran's decision.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SJT — Scenario 3: Group Presentation (Q63–65)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-SJT-007", qNum: 63, section: "sjt", format: "approp",
    subtype: "Academic integrity", difficulty: "Gold",
    scenarioId: "sjt-s3", critical_safety: false,
    stem: "How appropriate is the following action?\n\nNia privately tells Leo that the section needs to be rewritten or properly referenced before submission and offers to help him check the citations.",
    correct: 0,
    explanation: "Very appropriate. Addressing the issue directly and constructively with Leo before escalating is the proportionate first step. Offering to help rather than just criticising shows professionalism and gives Leo the opportunity to correct the problem — there is still enough time to do so without submitting plagiarised work.",
  },
  {
    id: "DIAG-SJT-008", qNum: 64, section: "sjt", format: "approp",
    subtype: "Academic integrity — proportional escalation", difficulty: "Diamond",
    scenarioId: "sjt-s3", critical_safety: false,
    stem: "How appropriate is the following action?\n\nNia immediately emails the head of school accusing Leo of deliberate plagiarism and asks for him to be removed from the course, without first giving him an opportunity to correct the section.",
    correct: 3,
    explanation: "Very inappropriate. Immediate escalation with accusations of deliberate misconduct, before giving Leo any chance to correct the error, is disproportionate. The situation may have arisen from carelessness rather than intent. Bypassing a direct conversation and seeking the most severe possible outcome without a proportionate first response fails professional standards for fair and constructive conduct.",
  },
  {
    id: "DIAG-SJT-009", qNum: 65, section: "sjt", format: "import",
    subtype: "Academic integrity", difficulty: "Diamond",
    scenarioId: "sjt-s3", critical_safety: false,
    stem: "When deciding what to do, how important is it for Nia to consider:\n\nThat the final presentation will be submitted as the work of the whole group rather than as Leo's work alone.",
    correct: 0,
    explanation: "Very important. Because the presentation is submitted as a group product, all members — including Nia — share responsibility for its academic integrity. Allowing uncited material to remain means Nia would be implicitly condoning plagiarism under her own name. This raises the stakes significantly and reinforces why addressing the issue is essential.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SJT — Scenario 4: Interpreter (Q66–68)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-SJT-010", qNum: 66, section: "sjt", format: "approp",
    subtype: "Communication — interpreter use", difficulty: "Diamond",
    scenarioId: "sjt-s4", critical_safety: true,
    stem: "How appropriate is the following action?\n\nSofia respectfully asks the clinician whether it would be better to pause the sensitive part of the history until appropriate interpreting support is available.",
    correct: 0,
    explanation: "Very appropriate. Sensitive questions about urinary symptoms and sexual history require that the patient can respond freely and accurately. Asking the clinician to pause until a professional interpreter is available is the right patient-centred approach — it protects both the quality of the clinical information and the patient's dignity and autonomy.",
  },
  {
    id: "DIAG-SJT-011", qNum: 67, section: "sjt", format: "approp",
    subtype: "Hierarchy and patient dignity", difficulty: "Diamond",
    scenarioId: "sjt-s4", critical_safety: true,
    stem: "How appropriate is the following action?\n\nSofia decides not to raise the issue during the consultation, but plans to ask the clinician about it privately once the patient has left.",
    correct: 2,
    explanation: "Inappropriate, but not awful. Raising the concern after the consultation is better than never raising it at all, and at least creates an opportunity for the clinician to reflect on interpreter use in future. However, the harm — the patient being asked sensitive questions through a family member, potentially restricting honest answers — will already have occurred. Raising the concern during the consultation would have been more effective.",
  },
  {
    id: "DIAG-SJT-012", qNum: 68, section: "sjt", format: "import",
    subtype: "Communication and autonomy", difficulty: "Gold",
    scenarioId: "sjt-s4", critical_safety: true,
    stem: "When deciding whether to raise a concern, how important is it for Sofia to consider:\n\nWhether the patient can answer sensitive questions freely and understand the consultation accurately.",
    correct: 0,
    explanation: "Very important. The patient's ability to communicate freely and to understand the consultation is the core ethical and clinical issue in this scenario. A patient who cannot answer sensitive questions honestly — because a family member is translating — may provide an incomplete history, receive inappropriate care, or be unable to disclose concerns they would only share confidentially.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SJT — Scenario 5: Audit Spreadsheet (Q69–71)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-SJT-013", qNum: 69, section: "sjt", format: "approp",
    subtype: "Honesty after error", difficulty: "Gold",
    scenarioId: "sjt-s5", critical_safety: false,
    stem: "How appropriate is the following action?\n\nElliot tells his supervisor promptly, explains what happened and offers to correct and recheck the affected data.",
    correct: 0,
    explanation: "Very appropriate. Prompt, honest disclosure of an error is the right professional response. The supervisor has already used the incorrect data in a draft presentation, so they need to know as soon as possible to avoid presenting inaccurate findings. Offering to correct and recheck demonstrates accountability and a commitment to the integrity of the project.",
  },
  {
    id: "DIAG-SJT-014", qNum: 70, section: "sjt", format: "approp",
    subtype: "Integrity — concealment", difficulty: "Diamond",
    scenarioId: "sjt-s5", critical_safety: false,
    stem: "How appropriate is the following action?\n\nElliot quietly corrects the spreadsheet but does not tell his supervisor because the graph may end up looking almost the same.",
    correct: 2,
    explanation: "Inappropriate, but not awful. Correcting the data is better than leaving the error in place. However, not telling the supervisor is a failure of professional honesty — the supervisor has already used the old data in a draft slide deck and needs to know it may have been inaccurate. 'The graph may look almost the same' is not a reliable justification for concealing a known error.",
  },
  {
    id: "DIAG-SJT-015", qNum: 71, section: "sjt", format: "mostleast",
    subtype: "Professional accountability — prioritisation", difficulty: "Diamond",
    scenarioId: "sjt-s5", critical_safety: false,
    stem: "When Elliot decides what to do, which factor should be MOST important and which should be LEAST important?",
    factors: [
      "The possibility that the incorrect rows could alter the graph or the project's conclusion.",
      "The need for his supervisor to know that material already used in the draft slides may be inaccurate.",
      "The chance that admitting the mistake could make Elliot look careless.",
      "The fact that the data can still be corrected before the presentation.",
    ],
    correctMost: 1,
    correctLeast: 2,
    explanation: "Most important: B — the supervisor has already incorporated the potentially inaccurate data into presentation materials; they must be informed so they can reassess those materials before the presentation. Least important: C — concern about how the admission reflects on Elliot personally should never override professional honesty; self-image is not a valid reason to withhold information about a data error.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SJT — Scenario 6: Teammate Struggling (Q72–74)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-SJT-016", qNum: 72, section: "sjt", format: "approp",
    subtype: "Colleague wellbeing and safety", difficulty: "Diamond",
    scenarioId: "sjt-s6", critical_safety: true,
    stem: "How appropriate is the following action?\n\nPriya encourages Tom to seek support and explains that, because his difficulties are now affecting patient-related work, an appropriate supervisor also needs to know enough to make sure the placement remains safe.",
    correct: 0,
    explanation: "Very appropriate. This response balances compassion for Tom with the overriding duty to patient safety. Encouraging him to seek support shows care for his wellbeing, while being clear that the near-miss means a supervisor needs to be informed is honest and necessary. Absolute confidentiality cannot be maintained when patient safety has already been affected.",
  },
  {
    id: "DIAG-SJT-017", qNum: 73, section: "sjt", format: "approp",
    subtype: "Patient safety — colleague impairment", difficulty: "Diamond",
    scenarioId: "sjt-s6", critical_safety: true,
    stem: "How appropriate is the following action?\n\nPriya agrees to keep the situation completely private as long as Tom promises to double-check all patient records from now on.",
    correct: 3,
    explanation: "Very inappropriate. A near-miss patient safety event has already occurred. Promising complete secrecy in exchange for Tom's self-monitored promise is not an adequate safeguard — Tom's judgement and reliability are precisely what are in question. A student cannot substitute their own informal agreement for appropriate supervisory oversight when patient safety is at risk.",
  },
  {
    id: "DIAG-SJT-018", qNum: 74, section: "sjt", format: "import",
    subtype: "Colleague wellbeing", difficulty: "Gold",
    scenarioId: "sjt-s6", critical_safety: false,
    stem: "When deciding what to do, how important is it for Priya to consider:\n\nThat Tom may genuinely need support rather than simply criticism for his recent behaviour.",
    correct: 1,
    explanation: "Important. Tom's wellbeing and the personal difficulties he has disclosed are real and deserve genuine consideration. However, this factor is important rather than the most important, because patient safety must take priority. Acknowledging Tom's need for support shapes how Priya raises the concern — with compassion rather than blame — but it cannot prevent the concern from being raised.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SJT — Scenario 7: Consent (Q75–77)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-SJT-019", qNum: 75, section: "sjt", format: "approp",
    subtype: "Consent and autonomy", difficulty: "Gold",
    scenarioId: "sjt-s7", critical_safety: true,
    stem: "How appropriate is the following action?\n\nDaniel accepts the patient's refusal without trying to persuade them and asks his supervisor about another opportunity to complete the sign-off.",
    correct: 0,
    explanation: "Very appropriate. Once a patient withdraws consent, that decision must be respected without pressure. Daniel's training needs are entirely secondary to the patient's right to decline. Seeking another opportunity through the proper route — asking his supervisor — is the correct professional response.",
  },
  {
    id: "DIAG-SJT-020", qNum: 76, section: "sjt", format: "approp",
    subtype: "Consent — pressure", difficulty: "Diamond",
    scenarioId: "sjt-s7", critical_safety: true,
    stem: "How appropriate is the following action?\n\nDaniel reassures the patient that the examination is quick, then explains that he may be unable to complete his placement requirement this week if they refuse.",
    correct: 3,
    explanation: "Very inappropriate. Invoking Daniel's training requirements after the patient has withdrawn consent is coercive. It places undue pressure on the patient by implying their refusal will cause harm to Daniel's career — which exploits the power imbalance in the clinical setting. Informed consent must be free from such pressure.",
  },
  {
    id: "DIAG-SJT-021", qNum: 77, section: "sjt", format: "import",
    subtype: "Consent — communication", difficulty: "Diamond",
    scenarioId: "sjt-s7", critical_safety: true,
    stem: "When deciding what to do, how important is it for Daniel to consider:\n\nWhether the way the request is discussed could make the patient feel pressured to agree.",
    correct: 0,
    explanation: "Very important. Consent is only valid when given freely. Any wording that makes the patient feel they ought to agree — because of the student's needs, the clinician's encouragement, or the pressure of a busy clinic — undermines the voluntariness of that consent. Attending to how the request is framed is fundamental to ethical practice.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SJT — Scenario 8: Lift Conversation (Q78–80)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-SJT-022", qNum: 78, section: "sjt", format: "approp",
    subtype: "Confidentiality — identifiable details", difficulty: "Gold",
    scenarioId: "sjt-s8", critical_safety: true,
    stem: "How appropriate is the following action?\n\nAisha quietly asks Ben to stop discussing the case until they are somewhere private.",
    correct: 0,
    explanation: "Very appropriate. Asking Ben to stop is timely, proportionate, and discreet — it addresses the confidentiality risk without escalating unnecessarily. The patient could potentially be identified by the combination of details being shared in front of members of the public, making it important to act immediately rather than waiting.",
  },
  {
    id: "DIAG-SJT-023", qNum: 79, section: "sjt", format: "approp",
    subtype: "Confidentiality — anonymisation", difficulty: "Diamond",
    scenarioId: "sjt-s8", critical_safety: true,
    stem: "How appropriate is the following action?\n\nAisha lets Ben continue because he has not used the patient's name or hospital number.",
    correct: 3,
    explanation: "Very inappropriate. Confidentiality is not only breached by naming a patient. The combination of age, occupation, rare diagnosis and small village is enough to make the patient identifiable to anyone who knows them — a classic example of the 'jigsaw effect'. Allowing the conversation to continue because a name was not used fails to understand what patient confidentiality requires.",
  },
  {
    id: "DIAG-SJT-024", qNum: 80, section: "sjt", format: "import",
    subtype: "Confidentiality", difficulty: "Diamond",
    scenarioId: "sjt-s8", critical_safety: true,
    stem: "When deciding whether to intervene, how important is it for Aisha to consider:\n\nThat several individually non-identifying details may make a patient recognisable when combined.",
    correct: 0,
    explanation: "Very important. This is the core principle at stake. Confidentiality does not require that a name be used — a mosaic of details (age, occupation, rare condition, specific village) can be just as identifying. Understanding the 'jigsaw effect' is central to any decision about whether this conversation poses a confidentiality risk.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SJT — Scenario 9: Missed Handover (Q81–83)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-SJT-025", qNum: 81, section: "sjt", format: "approp",
    subtype: "Patient safety — handover", difficulty: "Diamond",
    scenarioId: "sjt-s9", critical_safety: true,
    stem: "How appropriate is the following action?\n\nJonah briefly mentions that he noticed the earlier episode was not included and asks whether it should be added to the handover.",
    correct: 0,
    explanation: "Very appropriate. Jonah raises the omission in a non-confrontational way — framing it as a question rather than an accusation — which leaves the clinical decision to the doctors while ensuring the information is not lost. This is exactly the kind of speaking-up behaviour that supports safe handover, regardless of Jonah's student status.",
  },
  {
    id: "DIAG-SJT-026", qNum: 82, section: "sjt", format: "approp",
    subtype: "Hierarchy and uncertainty", difficulty: "Diamond",
    scenarioId: "sjt-s9", critical_safety: true,
    stem: "How appropriate is the following action?\n\nJonah stays silent because deciding what belongs in a medical handover is the doctor's responsibility rather than a student's.",
    correct: 3,
    explanation: "Very inappropriate. Professional hierarchy does not mean students should stay silent when they observe a possible patient safety gap. The fact that Jonah is uncertain whether the omission was intentional is not a reason to say nothing — raising it briefly and respectfully allows the doctors to make an informed decision. Silence when a patient safety concern is apparent is always inappropriate.",
  },
  {
    id: "DIAG-SJT-027", qNum: 83, section: "sjt", format: "mostleast",
    subtype: "Patient safety — prioritisation", difficulty: "Diamond",
    scenarioId: "sjt-s9", critical_safety: true,
    stem: "When Jonah decides whether to speak, which factor should be MOST important and which should be LEAST important?",
    factors: [
      "Whether the omitted event might be relevant to the patient's ongoing care.",
      "Jonah's uncertainty about why the doctor left the event out.",
      "The possibility that speaking may briefly interrupt the flow of handover.",
      "Whether other students might think Jonah is trying to show off.",
    ],
    correctMost: 0,
    correctLeast: 3,
    explanation: "Most important: A — whether the omitted information could affect the patient's ongoing care is the clinical and ethical driver of the decision. Least important: D — concern about how other students perceive Jonah's motivation is irrelevant to a patient safety decision; allowing reputational self-consciousness to override a safety concern would be a serious professional failure.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SJT — Scenario 10: Feedback (Q84–87)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-SJT-028", qNum: 84, section: "sjt", format: "approp",
    subtype: "Giving feedback upwards", difficulty: "Diamond",
    scenarioId: "sjt-s10", critical_safety: false,
    stem: "How appropriate is the following action?\n\nLeah says, in a private and respectful way, that the patient appeared to remain unsure about the medication and asks whether more explanation might have helped.",
    correct: 0,
    explanation: "Very appropriate. Honest, specific, and respectful feedback delivered privately is exactly how constructive upward feedback should work. Leah focuses on the observable outcome (the patient's apparent confusion) and phrases it as a question rather than a criticism — showing professional maturity and genuine concern for patient care.",
  },
  {
    id: "DIAG-SJT-029", qNum: 85, section: "sjt", format: "approp",
    subtype: "Professional courage", difficulty: "Diamond",
    scenarioId: "sjt-s10", critical_safety: false,
    stem: "How appropriate is the following action?\n\nLeah tells Dr Shah that the consultation went well because she does not want to risk influencing her assessment.",
    correct: 2,
    explanation: "Inappropriate, but not awful. Dishonest positive feedback is worse than silence, but it does not directly harm the patient in this instance. However, it represents a failure of professional courage and undermines the purpose of feedback. Allowing assessment pressure to drive dishonesty establishes a problematic pattern — honest feedback given tactfully is always more valuable.",
  },
  {
    id: "DIAG-SJT-030", qNum: 86, section: "sjt", format: "import",
    subtype: "Communication", difficulty: "Gold",
    scenarioId: "sjt-s10", critical_safety: false,
    stem: "When considering her feedback, how important is it for Leah to consider:\n\nWhether the patient appeared to understand enough about the medication to follow the plan safely.",
    correct: 0,
    explanation: "Very important. Patient understanding of their treatment plan is a clinical outcome — if the patient left confused about their medication, there is a real risk they will not take it correctly. This makes the patient's apparent lack of understanding the central reason why the feedback matters, not just a professional development observation.",
  },
  {
    id: "DIAG-SJT-031", qNum: 87, section: "sjt", format: "import",
    subtype: "Hierarchy", difficulty: "Diamond",
    scenarioId: "sjt-s10", critical_safety: false,
    stem: "When considering her feedback, how important is it for Leah to consider:\n\nThat Dr Shah will be completing her teaching assessment later that day.",
    correct: 2,
    explanation: "Of minor importance. The assessment context is a real pressure and Leah's awareness of it is understandable — but it should have minimal influence on whether she gives honest feedback. Allowing it to become a dominant consideration would compromise professional integrity. Honest feedback should be given regardless of potential personal consequences.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SJT — Scenario 11: Young Person (Q88–91)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-SJT-032", qNum: 88, section: "sjt", format: "approp",
    subtype: "Young people — privacy and autonomy", difficulty: "Gold",
    scenarioId: "sjt-s11", critical_safety: false,
    stem: "How appropriate is the following action?\n\nHana suggests that the clinician acknowledge Sam's request and consider giving them an opportunity to speak privately, while explaining the process appropriately to the parent.",
    correct: 0,
    explanation: "Very appropriate. Young people under 16 may have the right to a private consultation, particularly when they explicitly request it. Hana supports a process that respects Sam's autonomy while managing the parent's concerns sensitively. This approach is in line with good practice around Gillick competence and adolescent healthcare.",
  },
  {
    id: "DIAG-SJT-033", qNum: 89, section: "sjt", format: "approp",
    subtype: "Young people — confidentiality", difficulty: "Diamond",
    scenarioId: "sjt-s11", critical_safety: false,
    stem: "How appropriate is the following action?\n\nHana assumes the parent's objection settles the matter because Sam is under 16.",
    correct: 3,
    explanation: "Very inappropriate. Being under 16 does not automatically mean a young person lacks the right to confidentiality or a private consultation. A parent's objection does not override the clinician's responsibility to consider the young person's capacity and wishes. Assuming age alone determines the outcome ignores established principles of Gillick competence and adolescent autonomy.",
  },
  {
    id: "DIAG-SJT-034", qNum: 90, section: "sjt", format: "import",
    subtype: "Young people — communication", difficulty: "Diamond",
    scenarioId: "sjt-s11", critical_safety: false,
    stem: "When deciding how to respond, how important is it to consider:\n\nThat Sam may have information they do not feel comfortable discussing in front of the parent.",
    correct: 0,
    explanation: "Very important. Young people often seek private consultations precisely because they want to share sensitive information — about mental health, relationships, or concerns they cannot raise in front of family. The clinical and ethical quality of the consultation may depend entirely on whether Sam has that opportunity. This is the central consideration.",
  },
  {
    id: "DIAG-SJT-035", qNum: 91, section: "sjt", format: "import",
    subtype: "Service pressure", difficulty: "Gold",
    scenarioId: "sjt-s11", critical_safety: false,
    stem: "When deciding how to respond, how important is it to consider:\n\nThat allowing a private conversation may make the clinic run several minutes later.",
    correct: 2,
    explanation: "Of minor importance. Minor service pressure — a few minutes' delay — should not override a young person's right to a private conversation with their clinician. Efficiency matters in healthcare, but it cannot take priority over a patient's basic right to speak confidentially, particularly where safeguarding or sensitive personal issues may be involved.",
  },
];

// ─── Scoring functions ─────────────────────────────────────────────────────────

export function scoreSJTItem(
  q: DiagQuestion,
  answer: number | undefined,
  mostLeast?: { most: number | null; least: number | null }
): number {
  if (q.format === "mostleast") {
    if (!mostLeast) return 0;
    let pts = 0;
    if (mostLeast.most !== null && mostLeast.most === q.correctMost) pts++;
    if (mostLeast.least !== null && mostLeast.least === q.correctLeast) pts++;
    return pts;
  }
  if (answer === undefined) return 0;
  const dist = Math.abs(answer - (q.correct ?? 0));
  if (dist === 0) return 2;
  if (dist === 1) return 1;
  return 0;
}

export function scoreMultiStatement(
  q: DiagQuestion,
  selections: boolean[] | undefined
): number {
  if (!selections || !q.correctStatements) return 0;
  let correct = 0;
  for (let i = 0; i < q.correctStatements.length; i++) {
    if (selections[i] === q.correctStatements[i]) correct++;
  }
  if (correct === 5) return 2;
  if (correct === 4) return 1;
  return 0;
}

export function getSJTBand(rawPoints: number): 1 | 2 | 3 | 4 {
  for (const { band, min } of SJT_BANDS) {
    if (rawPoints >= min) return band as 1 | 2 | 3 | 4;
  }
  return 4;
}

export function getScaledScore(section: "vr" | "dm" | "qr", raw: number): number {
  if (section === "vr") return VR_SCALED[raw] ?? 300;
  if (section === "dm") return DM_SCALED[raw] ?? 300;
  return QR_SCALED[raw] ?? 300;
}
