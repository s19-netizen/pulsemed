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
  figureType: "room" | "grouped-bar" | "line" | "pie-pair" | "table" | "cargo";
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
    title: "Orbital Cargo Loading",
    description: "A spacecraft carries rectangular Life-Support Modules (LSMs) to an orbital station. The diagram shows the available space inside the cargo bay and the dimensions of each module. LSMs must stay upright — they cannot be laid on their sides.",
    figureType: "cargo",
    figureData: {
      bay:      { widthM: 2.88, lengthM: 3.60, heightM: 2.40 },
      shielding: { sidewall: 12, endwall: 9, floor: 15, ceiling: 5 },
      lsm:      { footprintA: 54, footprintB: 36, height: 40 },
      massKg:   86,
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
    explanation: "Start by thinking about what the passage is fundamentally arguing as a whole. The author doesn't attribute the rise of time-consciousness to any single invention or to factories specifically — instead, the passage makes a broader institutional point: time became socially significant as more and more organisations (courts, ports, factories, railways, labour movements) began to depend on it. That is option C. Option A fails because the passage explicitly mentions pre-industrial examples of punctuality (medieval bells, ports, courts), so factories clearly did not invent precise timekeeping. Option B is undermined by the description of domestic clocks that lost several minutes a day — accuracy was not the primary driver of change. Option D is wrong because the passage describes pre-industrial rural coordination ('agricultural work could require precise coordination') and never claims rural communities relied solely on natural rhythms until railways arrived.",
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
    explanation: "The relevant passage sentence is: 'Owning a clock therefore did not necessarily mean sharing an exact minute-by-minute schedule with everyone else.' Option B restates this point accurately — clock ownership and participation in a shared precise time standard were separate things. Option A claims most clock owners were unaware of inaccuracy, but the passage doesn't say they didn't know; the clock's inaccuracy is presented as a practical fact, not a hidden secret. Option C says public clocks were more accurate — the passage says observatories and dockyards maintained 'far more reliable' standards than domestic clocks, but this is different from saying all public clocks beat all private ones. Option D, that dockyard workers were among the first required to purchase personal watches, is never mentioned anywhere in the passage.",
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
    explanation: "The key phrase is: 'The distinction is useful but too neat if treated literally.' This tells you the writer endorses the task-time/clock-time distinction as a tool — calling it 'useful' — but adds the qualification that it oversimplifies reality if applied too rigidly, since agricultural work could be precisely coordinated and early factories were themselves irregular. That is a classic approving-but-qualified stance, which is exactly option B. Option A says the writer is dismissive — but 'useful' is the opposite of dismissive. Option C claims the writer thinks rural labour was more time-disciplined than factory labour — the passage says rural work 'could require' coordination but never flips the comparison that way. Option D is incorrect because the writer explicitly evaluates the distinction (calling it 'useful' and 'too neat') rather than simply presenting it neutrally without comment.",
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
    explanation: "The final paragraph contains the crucial sentence: 'The same system that enabled employers to measure labour more closely gave workers a precise way to argue that labour should end.' This is precisely what option C says — the very clock system used to control labour could also be used to argue for limits on it. Labour movements demanding a fixed number of working hours is the passage's concrete example of workers using measured time for their own purposes. Option A claims workers benefited more than employers — the passage makes no such comparative claim. Option B says customary leisure practices disappeared — the passage mentions 'customary holidays' disrupting early factories but never claims these traditions vanished. Option D claims the effects of clocks were independent of changes in transport, wages and schooling — the passage explicitly links railways, wage systems and labour movements as part of the same social reorganisation.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // VR — Passage 2 (Q5–8)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-VR-005", qNum: 5, section: "vr", format: "tfct",
    subtype: "Direct retrieval", difficulty: "Gold", passageId: "vr-p2",
    stem: "High embankments can reduce the amount of sediment deposited across a floodplain.",
    correct: 0,
    explanation: "Read the second paragraph carefully: 'a high embankment can protect fields yet prevent sediment-rich floodwater from replenishing the floodplain.' If sediment-rich water is blocked from reaching the floodplain, less sediment is deposited there. The statement says exactly this — so it is True. This is a direct retrieval question: find the exact matching sentence in the passage and confirm the claim is made. The word 'can' in both the passage and the statement is important — neither is claiming this always happens, just that it is a possible outcome of high embankments.",
  },
  {
    id: "DIAG-VR-006", qNum: 6, section: "vr", format: "tfct",
    subtype: "Inference", difficulty: "Diamond", passageId: "vr-p2",
    stem: "If two districts lie on the same delta, they will experience approximately the same rate of relative sea-level rise.",
    correct: 1,
    explanation: "The trap here is assuming that being on the same delta means experiencing the same conditions. The passage directly contradicts this: 'two districts on the same delta may experience different rates of relative sea-level rise' because of local variation in groundwater extraction, construction and geological processes. The statement claims these two districts will experience 'approximately the same rate' — this is directly contradicted by the text, making the answer False. Do not let the fact that they share a physical delta lead you to assume uniformity; the passage makes the point that local factors can cause significant variation even within the same delta.",
  },
  {
    id: "DIAG-VR-007", qNum: 7, section: "vr", format: "tfct",
    subtype: "Scope and evidence", difficulty: "Diamond", passageId: "vr-p2",
    stem: "The author believes that densely populated urban areas should always be protected by engineered barriers rather than considered for any form of relocation.",
    correct: 1,
    explanation: "The statement contains absolute language — 'always' and 'rather than considered for any form of relocation' — which is your signal to check whether the passage is equally absolute. It is not. The passage says: 'Dense cities may justify substantial defences, but this does not mean every urban area should always be defended in the same way.' This directly undermines the 'always' in the statement. Furthermore, the passage describes a regional plan that might 'relocate one road' alongside reinforcing a port and restoring a wetland — relocation is explicitly part of the planning toolkit, not something to be always avoided. The answer is False.",
  },
  {
    id: "DIAG-VR-008", qNum: 8, section: "vr", format: "tfct",
    subtype: "Logical deduction", difficulty: "Diamond", passageId: "vr-p2",
    stem: "A regional delta plan can improve overall resilience while still imposing greater risk on some communities.",
    correct: 0,
    explanation: "This statement is very close to a direct quotation from the passage's final paragraph: 'A plan can improve regional resilience while still imposing greater costs or risks on particular communities.' The statement captures exactly this idea — overall resilience can improve even while individual communities bear greater risk. The answer is True. Spotting near-direct quotations from the passage is one of the fastest routes to a correct TFCT answer — when the statement closely matches a specific passage sentence, that is almost always a True. The author's broader point is that protection and retreat are not simple opposites; a regional plan can combine both, with trade-offs falling unevenly across communities.",
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
    explanation: "The entire archive passage is concerned with how the surviving historical record is shaped by multiple selection effects — what institutions happened to notice, what survived physical wear, what was digitised — and how historians must therefore treat their evidence carefully and describe their uncertainty honestly. Option C captures all of this: surviving evidence is shaped by selection effects, so historical claims should reflect the limits of the record. Option A overstates the argument — digitisation is discussed as adding yet another selection effect, not as making traditional research unnecessary. Option B is too narrow: it says reconstruction of reading habits is only possible when court records and private letters agree, which is not the passage's point at all. Option D is entirely unsupported — the passage never argues that prohibited texts were less influential than accounts suggest.",
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
    explanation: "The phrase 'the residue of what institutions noticed and recorded' uses 'residue' to suggest what is left over from a process — in this case, the process of institutions paying attention to certain things and not others. The surviving archive is therefore not a neutral or random sample of the past; it preserves what happened to catch official attention. That matches option B exactly. Option A adds the idea that institutions deliberately preserved records for historians — the passage doesn't say this; the preservation was a byproduct of institutional record-keeping, not an act of archival intention. Option C implies systematic destruction of permitted publications — but the passage says ordinary permitted texts 'disappear through wear or neglect', not deliberate destruction by anyone. Option D makes a reliability comparison between official correspondence and printed material — this comparison is never made in the passage.",
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
    explanation: "The passage is explicit about what makes influence claims convincing: historians need 'a plausible path of transmission — evidence that the earlier text was available, cited, translated or discussed', and 'strong claims are most convincing when several lines of evidence converge.' Option C provides exactly this kind of transmission evidence — correspondence directly showing that organisers of the later movement read and discussed a translation means the pamphlet was definitely available to them and actively engaged with. Option A shows only surface resemblance between texts, which the passage explicitly says is not sufficient on its own: 'if an early pamphlet resembles a later political slogan, historians still need a plausible path of transmission.' Option B speaks to the scarcity of surviving copies, which tells us nothing about how widely it was read or whether the later movement encountered it. Option D — inclusion in a digitisation project alongside political works from the later period — is an archival coincidence that creates no causal link and establishes no actual reading or discussion.",
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
    explanation: "The final sentence of the passage says: 'Properly described uncertainty is therefore not simply a weakness: it shows where the archive is dense, where it is distorted and where confidence should stop.' This means that an archive's limitations are themselves historically informative — they tell you something about how the knowledge was produced and what can be reliably known. Option C captures this: the limitations of an archive can provide information about how historical knowledge has been produced. Option A says uncertainty should be minimised because it weakens confidence — but the writer says uncertainty should be 'properly described', not suppressed. Option B says missing evidence is only useful when historians know exactly why it is missing — the writer says describing uncertainty is valuable regardless, showing where to trust the archive and where not to. Option D would prohibit all inquiry about illicit print because circulation 'can rarely be measured directly' — but the passage describes how historians do this work using multiple lines of imperfect evidence.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // VR — Passage 4 (Q13–16)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-VR-013", qNum: 13, section: "vr", format: "tfct",
    subtype: "Direct retrieval", difficulty: "Gold", passageId: "vr-p4",
    stem: "Reflective roofs can become less reflective over time.",
    correct: 0,
    explanation: "Look at the reflective-roofs paragraph: 'Reflective surfaces also become less effective as they weather, so maintenance affects long-term performance.' If a surface becomes less effective as it weathers, it is by definition becoming less reflective over time. The statement says exactly this — True. This is a direct retrieval question: locate the matching sentence and confirm the claim. The word 'can' in the statement also gives you leeway — the passage says weathering makes them 'less effective', which is consistent with the statement that they 'can become less reflective over time'.",
  },
  {
    id: "DIAG-VR-014", qNum: 14, section: "vr", format: "tfct",
    subtype: "Inference", difficulty: "Diamond", passageId: "vr-p4",
    stem: "A satellite map showing high surface temperature in a neighbourhood proves that pedestrians there experience equally high air temperatures.",
    correct: 1,
    explanation: "The passage is explicit about the distinction between surface temperature and air temperature: satellite observations 'can map surface temperature across a large area, yet they do not directly measure the air temperature experienced by a pedestrian.' These are different physical measurements — a dark road surface can be very hot while the air above it is cooler. The statement makes an unjustified leap from satellite-measured surface temperature to 'equally high air temperatures' for pedestrians. The passage specifically flags this as a limitation, making the statement False. Questions like this test whether you accept the passage's stated distinctions or let intuitive assumptions override them.",
  },
  {
    id: "DIAG-VR-015", qNum: 15, section: "vr", format: "tfct",
    subtype: "Comparison", difficulty: "Diamond", passageId: "vr-p4",
    stem: "The author considers tree planting to be a more reliable urban-cooling strategy than reflective roofs.",
    correct: 2,
    explanation: "The statement asks you to confirm that the author considers tree planting more reliable than reflective roofs. Read both strategy paragraphs: trees are described with caveats (planting programmes can fail when trees are treated as decoration; dense canopies may alter ventilation), and reflective roofs are also described with caveats (their value depends on insulation, shade and local climate; they become less effective as they weather). In the conclusion, both strategies are grouped together: 'Trees, reflective materials and other interventions may all be useful in the right setting.' The author never directly compares them or ranks one as more reliable than the other. You cannot say True, because no comparison is made — but you also cannot say False, because a comparison might favour trees if one were made. The correct answer is Can't Tell.",
  },
  {
    id: "DIAG-VR-016", qNum: 16, section: "vr", format: "tfct",
    subtype: "Logical deduction", difficulty: "Diamond", passageId: "vr-p4",
    stem: "An urban-cooling project may reduce local heat exposure while creating a separate disadvantage for some residents.",
    correct: 0,
    explanation: "The equity section of the passage states: 'a greening project can raise property values and contribute to displacement pressure where housing protections are weak.' A cooling project — in the form of urban greening — can therefore reduce heat exposure (the benefit) while simultaneously raising property values enough to displace lower-income residents (a separate disadvantage for some residents). The statement captures this dual outcome precisely — True. This question tests whether you can see that a single intervention reducing one problem (heat) and creating another (displacement pressure) can happen simultaneously. The author uses this point to argue that the equity implications of cooling projects must be considered alongside their environmental benefits.",
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
    explanation: "The author's position is built across the full passage: maps always involve choices, those choices make maps arguments about what matters, and the appropriate response is not to pretend neutrality is achievable but to make purpose and uncertainty transparent. Option B captures all three components — choices are inevitable, and quality should be judged by whether those choices suit purpose and are made transparent. Option A claims digital maps are less trustworthy than printed maps — the author says the choices in digital maps are 'relocated' into algorithms but are not made worse. Option C says political maps should avoid disputed borders entirely — the author actually proposes dashed lines or annotations as ways to represent disagreement more faithfully, not avoidance. Option D says equal-area projections are generally preferable — but the author says accuracy depends partly on purpose, so no single projection is universally better.",
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
    explanation: "The passage states: 'Repeated route suggestions may then alter traffic patterns, so the map can begin to influence the world it appears merely to describe.' Option B restates this directly — algorithmic route recommendations can reshape actual traffic patterns in the world, not just reflect them. Option A says digital maps remove the cartographer's choice — but the passage says the choices are 'relocated into databases and algorithms', not eliminated; someone still decides what information appears and how routes are ranked. Option C says most users understand that rankings and route suggestions reflect hidden assumptions — there is nothing in the passage about typical users' awareness. Option D claims digital maps create more political disputes over place names than printed maps do — the passage discusses the general problem of contested place names but never makes a printed-versus-digital comparison on this point.",
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
    explanation: "The final paragraph says: 'Because maps can look self-evidently factual, readers should ask who made them, for whom, from what data and to show what.' The phrase 'look self-evidently factual' means that viewers tend to accept maps as straightforwardly true without questioning how they were constructed or what choices went into them. Option A captures this — people may accept a map's message without asking about its construction. Option B says maps are easier to understand than written arguments because they contain fewer assumptions — the author's entire argument is that maps contain many hidden assumptions, which contradicts this. Option C claims visual evidence is usually more accurate than verbal evidence — again, this goes against the author's caution about how maps can mislead. Option D says public debates rely too much on maps rather than written sources — this is simply not discussed in the passage.",
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
    explanation: "The author explicitly states their proposed standard: 'make the map's purpose clear, acknowledge important uncertainty and distinguish measured information from inference where possible.' Option C matches this directly — explaining the map's purpose and indicating significant uncertainty in data or conventions is exactly what the author calls for. Option A (using the same projection for all maps) is too rigid and would prevent maps from being fit for different purposes — the author argues that the right projection depends on what a map is for. Option B (displaying every available place name) would make maps 'unusable' — the author literally says 'a map containing every available fact would be unusable.' Option D (avoiding any algorithmic ranking) is too absolute — the author doesn't say algorithms should be avoided entirely, just that their assumptions should be made transparent to readers.",
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
    explanation: "The three premises are: every marine biologist is a field researcher; no field researcher is a laboratory administrator; some ecologists are laboratory administrators. Work through each statement carefully.\n\nStatement A — 'No marine biologist is a laboratory administrator.' Apply the chain: marine biologists must be field researchers (premise 1), and field researchers cannot be laboratory administrators (premise 2). So marine biologists cannot be laboratory administrators either. This must follow — Yes.\n\nStatement B — 'Some ecologists are not field researchers.' Premise 3 tells us some ecologists are laboratory administrators. Premise 2 tells us no laboratory administrator is a field researcher. So those ecologist-laboratory-administrators are definitively not field researchers. This must follow — Yes.\n\nStatement C — 'Some laboratory administrators are not marine biologists.' From statement A, no marine biologist is a laboratory administrator. If no member of group X belongs to group Y, then every member of group Y is a non-member of group X. So all laboratory administrators are non-marine-biologists, which is even stronger than 'some'. This must follow — Yes.\n\nStatement D — 'Some ecologists are marine biologists.' Neither the premises nor the derived conclusions create any link between ecologists and marine biologists. Ecologists connect to laboratory administrators; marine biologists connect to field researchers — these chains never overlap. We simply cannot know — No.\n\nStatement E — 'No ecologist is a field researcher.' We only know that some ecologists (those who are laboratory administrators) are not field researchers. But there may be other ecologists who are not laboratory administrators and who could be field researchers. 'Some ecologists aren't field researchers' is supportable; 'no ecologist is' goes far too far — No.",
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
    explanation: "The premises: all Grade A buildings are protected structures; some protected structures are museums; no museum is a warehouse. Think carefully about what must definitely be true. Option A — 'No Grade A building is a warehouse.' To establish this, you would need all Grade A buildings to be museums — but the premises only say Grade A buildings are protected structures, not necessarily museums. Since some protected structures are museums and some are not, we cannot guarantee Grade A buildings fall into the museum group. Not necessarily true. Option B — 'Some protected structures are not warehouses.' We know some protected structures are museums, and no museum is a warehouse. So those museum-protected structures are definitely not warehouses — which means at least some protected structures (the museum ones) are not warehouses. This must be true. Option C — 'Some warehouses are protected structures.' This would require some warehouses to fall under protected structures, but the premises give us no information about what warehouses are — only that museums (a subset of protected structures) are not warehouses. This cannot be concluded. Option D — 'At least one museum is a Grade A building.' Grade A buildings are a subset of protected structures, and museums are another subset of protected structures — but these two subsets could be entirely different ones. We cannot conclude they overlap.",
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
    explanation: "The constraints are: J before M; K immediately after L; N not in slot 1 or 5; exactly one session between J and N; M not immediately after N. Test each option by checking all five rules in turn.\n\nOption A: J(1), M(2), N(3), L(4), K(5). J before M: slot 1 before slot 2 ✓. K immediately after L: L is slot 4, K is slot 5 — adjacent ✓. N not in slot 1 or 5: N is slot 3 ✓. Exactly one session between J and N: J is slot 1, N is slot 3, with only M (slot 2) in between — that is one session ✓. M not immediately after N: N is slot 3, M is slot 2 — M comes before N, so M is definitely not immediately after N ✓. All five constraints satisfied — this is the answer.\n\nOption B: L(1), K(2), J(3), M(4), N(5). N is in slot 5, violating 'N not in slot 5'. Eliminated immediately.\n\nOption C: J(1), N(2), L(3), K(4), M(5). Exactly one session between J and N: J is slot 1, N is slot 2 — there are zero sessions between them. Eliminated.\n\nOption D: L(1), J(2), K(3), N(4), M(5). K immediately after L: L is slot 1, K is slot 3 — they are not adjacent. Eliminated.\n\nThe answer is A.",
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
    explanation: "The rules: every severely eroded site is inspected monthly; a monthly-inspected site within 2 km of housing receives a community warning plan; no protected-nesting-zone site can use rock armour; some community-warning-plan sites are inside protected nesting zones.\n\nStatement A — 'Every site with severe erosion receives a community warning plan.' The chain starts correctly — severe erosion means monthly inspection. But the second step (getting a warning plan) also requires being within 2 km of housing. Severe erosion only guarantees monthly inspection, not proximity to housing. A severely eroded coastal site might be far from any homes. No.\n\nStatement B — 'At least one protected-nesting-zone site has a community warning plan.' Rule 4 states this directly — some community-warning-plan sites are inside protected nesting zones. Yes.\n\nStatement C — 'No site using rock armour is inside a protected nesting zone.' Rule 3 says no protected-nesting-zone site can use rock armour. The contrapositive of this (if a site uses rock armour, it is not in a protected nesting zone) is exactly statement C. Yes.\n\nStatement D — 'Some sites with community warning plans cannot use rock armour.' From statement B, some community-warning-plan sites are in protected nesting zones. From rule 3, those nesting-zone sites cannot use rock armour. So some community-warning-plan sites definitely cannot use rock armour. Yes.\n\nStatement E — 'A site with severe erosion may be more than 2 km from housing.' Severe erosion only guarantees monthly inspection — there is no rule requiring a severely eroded site to be near housing. So a severely eroded site could easily be far from housing. Yes.",
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
    explanation: "A 'strongest argument' question asks which option provides the most substantive, relevant, and specific case for the proposal. Option A says students enjoy libraries because of their atmosphere — this is vague and doesn't explain why extended hours are specifically needed. Option B identifies a concrete group of people (students with placements or jobs that end late), explains the specific problem they face (returning too late to access study space and reserved materials that are otherwise unavailable to them), and links the proposal directly to solving that problem. This is targeted and substantive. Option C says other universities sometimes keep libraries open later — this tells you the policy is possible, but gives no independent reason why it is good for this university. Option D mentions benefits to nearby businesses — this is a peripheral economic consequence that doesn't address the library's core educational purpose at all. Option B makes the most specific, well-reasoned case for the proposal.",
  },
  {
    id: "DIAG-DM-006", qNum: 26, section: "dm", format: "mcq",
    subtype: "Venn diagrams", difficulty: "Gold", mark_value: 1,
    preamble: "The Venn diagram shows the languages spoken by 180 delegates. Each number represents delegates in that exact region only. Nine delegates speak none of the three languages.",
    stem: "How many delegates speak exactly one of the three languages?",
    options: ["86", "90", "93", "102"],
    correct: 2,
    vennFigure: {
      labelA: "French", labelB: "Spanish", labelC: "German",
      total: 180, neither: 9,
      onlyA: 38, onlyB: 31, onlyC: 24,
      ab: 26, ac: 19, bc: 17, abc: 16,
    },
    explanation: "The question asks for delegates who speak exactly one language — meaning they appear only in a single circle, with no overlap into any other circle. From the diagram, these 'only' values are: French only = 38, Spanish only = 31, German only = 24. Add these together: 38 + 31 + 24 = 93. To verify, check the full total: 38 (only French) + 31 (only Spanish) + 24 (only German) + 26 (French and Spanish only) + 19 (French and German only) + 17 (Spanish and German only) + 16 (all three) + 9 (none) = 180 ✓. Common mistake: accidentally including the overlapping regions (those who speak two or three languages), which belong to multiple circles but are not 'exactly one language'.",
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
    explanation: "Calculate the key figures first. Pass rates among those who agreed to screening: Group A: 108 ÷ 144 = 75%; Group B: 84 ÷ 126 = 66.7%; Group C: 132 ÷ 165 = 80%. Overall pass rates among those originally invited: Group A: 108 ÷ 240 = 45%; Group B: 84 ÷ 180 = 46.7%. Total invited: 240 + 180 + 300 = 720. Total agreed: 144 + 126 + 165 = 435. Total passed: 108 + 84 + 132 = 324.\n\nStatement A — 'Among those who agreed to screening, Group C had the highest pass rate.' 80% > 75% > 66.7% — Group C is indeed highest. Yes.\n\nStatement B — 'A randomly selected invited person from Group A had a greater probability of passing than one from Group B.' This asks about overall pass rates from the whole invited pool, not just among those who agreed. Group A: 108 ÷ 240 = 45%; Group B: 84 ÷ 180 = 46.7%. Group B's rate is actually higher, not A's. No.\n\nStatement C — 'More than half of all invited people agreed to screening.' 435 ÷ 720 = 60.4%, which is greater than 50%. Yes.\n\nStatement D — 'Exactly 75% of people who agreed to screening in Group A passed.' 108 ÷ 144 = 0.75 = exactly 75%. Yes.\n\nStatement E — 'The probability that a randomly selected passer came from Group C is greater than 40%.' 132 ÷ 324 = 40.7%, which is greater than 40%. Yes.",
  },
  {
    id: "DIAG-DM-008", qNum: 28, section: "dm", format: "mcq",
    subtype: "Logical puzzle — ordering", difficulty: "Diamond", mark_value: 1,
    preamble: "Six deliveries — F, G, H, J, K and L — arrive one at a time.\n• F arrives before H.\n• G arrives after J but before L.\n• K arrives immediately before F.\n• Exactly two deliveries occur between H and L.\n• J is not first.",
    stem: "Which delivery must arrive first?",
    options: ["F", "G", "J", "K"],
    correct: 3,
    explanation: "The constraints are: F before H; G after J but before L; K immediately before F; exactly two deliveries between H and L; J not first. Begin by identifying what must be true structurally. K is immediately before F, so K and F form a fixed consecutive block: K→F. F is before H, which extends this chain: K→F→...→H. Since K must come before F, K cannot be anywhere after F, and since F must come before H, K cannot be placed in most later positions without breaking the chain.\n\nTest K in position 1: K(1), F(2). Now place H somewhere after F. With exactly two deliveries between H and L, if H=3, then L must be in position 6 (two deliveries in positions 4 and 5 between them). We also need G after J and before L, so J and G must fill positions 4 and 5 in that order: J(4), G(5). Check all constraints: F before H (2 before 3) ✓; K immediately before F (1 before 2) ✓; G after J (4 before 5) and before L (5 before 6) ✓; exactly two deliveries (J and G) between H(3) and L(6) ✓; J not first (J is 4th) ✓. All satisfied. Attempting any other starting position for another delivery quickly violates one of the constraints — for instance, F cannot start because K must precede it. K must be first.",
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
    explanation: "A 'strongest argument against' question asks which option most seriously challenges the proposal's logic or value. Option A — some residents dislike vehicles without conventional drivers — this is a preference objection that doesn't engage with whether the pilot is a good idea from a policy standpoint. Option B — the city shouldn't test technology just because it is new — this is a principle asserted without any reasoning; it provides no specific critique of this particular pilot. Option C — if the restricted route lacks the complex junctions and pedestrian conditions found elsewhere, the safety data from the pilot may not generalise to wider deployment — this is the most substantive objection because it attacks the pilot's core purpose. A pilot should generate reliable evidence for the actual decision being made (wider deployment). If the test environment is unrepresentative, the pilot cannot fulfil that purpose, no matter how well it goes. Option D — conventional buses are familiar — this appeals to tradition and comfort rather than engaging with whether the pilot is a sound way to gather safety evidence. Option C directly undermines the pilot's validity as a piece of evidence.",
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
    explanation: "The three premises: all navigators are trained climbers; no medic is a drone operator; some photographers are navigators.\n\nStatement A — 'Some trained climbers are photographers.' From premise 3, some photographers are navigators. From premise 1, all navigators are trained climbers. So those photographer-navigators are also trained climbers — meaning some trained climbers are indeed photographers. Yes.\n\nStatement B — 'No drone operator is a medic.' This is the contrapositive of premise 2. In formal logic, 'no medic is a drone operator' and 'no drone operator is a medic' are logically equivalent (the 'no X is Y' form is symmetric). Yes.\n\nStatement C — 'Some navigators are photographers.' Premise 3 says some photographers are navigators. If photographer A is a navigator, then that navigator (A) is a photographer — so some navigators are photographers. This is the same set viewed from the other direction. Yes.\n\nStatement D — 'Some trained climbers are medics.' There is no premise connecting trained climbers or navigators to medics. Navigators link to trained climbers; medics link to drone operators — these chains share no overlap. We cannot draw this conclusion. No.\n\nStatement E — 'All photographers are trained climbers.' Premise 3 says only some photographers are navigators, not all of them. The photographers who are not navigators have no established connection to trained climbers. We cannot extend 'some photographers are trained climbers' to 'all photographers are trained climbers'. No.",
  },
  {
    id: "DIAG-DM-011", qNum: 31, section: "dm", format: "mcq",
    subtype: "Probability", difficulty: "Gold", mark_value: 1,
    preamble: "A box contains 7 new water-level sensors and 5 refurbished sensors. Two sensors are chosen at random without replacement.",
    stem: "What is the probability that exactly one selected sensor is refurbished?",
    options: ["35/66", "35/72", "5/11", "7/12"],
    correct: 0,
    explanation: "We want exactly one of the two selected sensors to be refurbished. There are two mutually exclusive ways this can happen: we draw a new sensor first and then a refurbished one, or we draw a refurbished sensor first and then a new one. The box starts with 7 new and 5 refurbished — 12 total. For the first route: P(new first) = 7/12. Having drawn one new sensor, 11 remain (6 new, 5 refurbished). P(refurbished second | new first) = 5/11. So P(new then refurbished) = 7/12 × 5/11 = 35/132. For the second route: P(refurbished first) = 5/12. Having drawn one refurbished sensor, 11 remain (7 new, 4 refurbished). P(new second | refurbished first) = 7/11. So P(refurbished then new) = 5/12 × 7/11 = 35/132. Total probability of exactly one refurbished = 35/132 + 35/132 = 70/132 = 35/66.",
  },
  {
    id: "DIAG-DM-012", qNum: 32, section: "dm", format: "mcq",
    subtype: "Statistical reasoning", difficulty: "Diamond", mark_value: 1,
    preamble: "A scholarship programme reports the following annual household incomes for five recipients:\n£24,000, £27,000, £29,000, £31,000 and £89,000.\n\nA sixth recipient is added. After the addition, the median increases while the mean decreases.",
    stem: "Which of the following could be the sixth recipient's household income?",
    options: ["£26,000", "£30,000", "£48,000", "£96,000"],
    correct: 1,
    explanation: "Start by understanding the original five values: £24k, £27k, £29k, £31k, £89k. The current median (the middle value of five, i.e., the 3rd) is £29k. The current mean is (24+27+29+31+89) ÷ 5 = 200 ÷ 5 = £40k. The question requires a sixth value that simultaneously raises the median above £29k and lowers the mean below £40k. For the mean to fall: the new total of six values must be less than 6 × £40k = £240k. Since the current total is £200k, the sixth value must be less than £40k. For the median to rise: with six values, the median becomes the average of the 3rd and 4th values when sorted. The new median must exceed £29k.\n\nTest £30k: sorted order is 24, 27, 29, 30, 31, 89. Median = (29 + 30) ÷ 2 = £29.5k — this is greater than £29k ✓. New mean = 230 ÷ 6 ≈ £38.3k — this is less than £40k ✓. Both conditions satisfied.\n\nTest £26k: sorted 24, 26, 27, 29, 31, 89. Median = (27 + 29) ÷ 2 = £28k — lower than £29k. Eliminated.\n\nTest £48k: new total = 248k. Mean = 248 ÷ 6 ≈ £41.3k — higher than £40k. Eliminated.\n\nTest £96k: mean rises even further. Eliminated.\n\nThe answer is £30k.",
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
    explanation: "Work through the clues systematically to build the complete solution. Y contains 16th-century material; the 18th-century material came from York; Z is from Bath; W is from Exeter; X contains later material than W. Cities W and Z are fixed: W=Exeter, Z=Bath. That leaves Y and X for Durham and York. Since Y contains 16th-century material, and the 18th-century box is from York, Y cannot be from York (Y is 16th century, not 18th). Therefore Y=Durham and X=York. Because X is from York, X contains 18th-century material. X must contain later material than W, and X is 18th century, so W must be 16th or 17th century. But Y already has 16th century, so W must be 17th century. Z=Bath receives the remaining century: 19th. Final solution: W=Exeter/17th, X=York/18th, Y=Durham/16th, Z=Bath/19th.\n\nStatement A — 'Y is not from York.' Y=Durham. Confirmed. Yes.\nStatement B — 'X is from Durham.' X=York, not Durham. No.\nStatement C — 'Z contains 19th-century material.' Z=Bath/19th. Confirmed. Yes.\nStatement D — 'W contains 17th-century material.' W=Exeter/17th. Confirmed. Yes.\nStatement E — 'The Exeter material is from the 19th century.' W=Exeter/17th, not 19th. No.",
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
    explanation: "The argument: fewer than one third of households opted into the current text service; therefore, switching to automatic alerts sent to every registered mobile number will ensure residents receive warnings when they need them. The key word is 'therefore' — the officer assumes that sending alerts to all registered numbers will genuinely reach the people who need them. This only holds if the registered mobile numbers actually correspond to the residents living in the flood-affected area. If numbers are outdated, belong to people who have moved, or simply don't cover many households, automatic alerts won't achieve what the officer claims. Option B identifies this essential assumption. Option A is about preference (text versus social media) — even if residents prefer other channels, the conclusion is about whether automatic texts would reach people, not about what they prefer. Option C compares last winter's floods to previous ones — the severity of past events is irrelevant to whether the new system would work. Option D is about cost — even if automatic alerts were more expensive, this doesn't affect the effectiveness claim the officer makes.",
  },
  {
    id: "DIAG-DM-015", qNum: 35, section: "dm", format: "mcq",
    subtype: "Venn diagrams", difficulty: "Gold", mark_value: 1,
    preamble: "A community centre has 120 members. The Venn diagram shows class attendance. Each overlapping region shows members attending exactly those classes.",
    stem: "How many members attend none of the three types of class?",
    options: ["7", "9", "11", "13"],
    correct: 0,
    vennFigure: {
      labelA: "Exercise", labelB: "Language", labelC: "Craft",
      total: 120,
      onlyA: 30, onlyB: 19, onlyC: 20,
      ab: 17, ac: 9, bc: 6, abc: 12,
    },
    explanation: "The question asks for members who attend none of the three types of class. The diagram does not give this number directly — you must calculate it by adding all members who attend at least one class, then subtracting from the total. From the diagram: only Exercise = 30; only Language = 19; only Craft = 20; Exercise and Language only = 17; Exercise and Craft only = 9; Language and Craft only = 6; all three = 12. Total attending at least one class = 30 + 19 + 20 + 17 + 9 + 6 + 12 = 113. Members attending none = 120 − 113 = 7. Note that 'neither' or 'none' is the one value the diagram does not show — you always calculate it as total minus the sum of all the regions inside the circles.",
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
    explanation: "Set up all the key numbers first. People with condition X: 8% of 10,000 = 800. People without condition X: 9,200. True positives (have X, test positive): 90% of 800 = 720. False positives (no X, test positive): 6% of 9,200 = 552. Total who test positive: 720 + 552 = 1,272. Total who test negative: 10,000 − 1,272 = 8,728.\n\nStatement A — 'More people without condition X receive a positive result than people with condition X.' False positives = 552; true positives = 720. 552 is less than 720, so fewer people without X test positive. No.\n\nStatement B — 'Fewer than half of all positive results come from people with condition X.' 720 out of 1,272 positives are true positives. 720 ÷ 1,272 = 56.6% — more than half are from people with X. No.\n\nStatement C — 'A person with condition X is fifteen times as likely to test positive as a person without condition X.' The test's sensitivity is 90% and its false-positive rate is 6%. The ratio of these rates is 90 ÷ 6 = 15. Yes.\n\nStatement D — 'More than 9,000 people will test negative.' 8,728 people test negative — that is less than 9,000. No.\n\nStatement E — 'If prevalence increased while test characteristics stayed the same, the proportion of positive results that are true positives would increase.' At higher prevalence there are more true positives and the same false-positive rate applies to a smaller group without X, so the ratio of true to false positives improves. The proportion of positives that are genuine increases. Yes.",
  },
  {
    id: "DIAG-DM-017", qNum: 37, section: "dm", format: "mcq",
    subtype: "Logical puzzle — matching", difficulty: "Diamond", mark_value: 1,
    preamble: "Four applicants — Aisha, Ben, Cara and Dev — are interviewed in rooms 1, 2, 3 and 4, one applicant per room.\n• Aisha is not in room 1 or room 4.\n• Ben is in a lower-numbered room than Cara.\n• Dev is not next to Aisha.\n• Cara is not in room 4.\n• Room 2 is not occupied by Ben.",
    stem: "Who must be in room 1?",
    options: ["Aisha", "Ben", "Cara", "Dev"],
    correct: 1,
    explanation: "The constraints: Aisha is not in room 1 or 4; Ben is in a lower-numbered room than Cara; Dev is not next to Aisha; Cara is not in room 4; Ben is not in room 2. Work through the logic. Aisha must be in room 2 or 3 (the only rooms left after excluding 1 and 4). Ben is not in room 2 and must be lower-numbered than Cara (who is not in room 4), so Cara is in room 2 or 3, and Ben must be below her. If Cara=3, Ben could be 1 or 2 — but Ben is not in room 2, so Ben=1. If Cara=2, Ben must be lower than 2, so Ben=1. Either way, Ben must be in room 1.\n\nTest Ben=1, Cara=3: Aisha must be in 2 or 3 — Cara has 3, so Aisha=2. Dev gets room 4. Check Dev not next to Aisha: Dev is room 4, Aisha is room 2 — rooms 3 and 4 are adjacent, but 2 and 4 are not adjacent. ✓ All constraints satisfied.\n\nTest Ben=1, Cara=2: Aisha is in room 2 or 3 — Cara has 2, so Aisha=3. Dev=4. Check Dev not next to Aisha: Dev is room 4, Aisha is room 3 — rooms 3 and 4 are adjacent. ✗ Violates the constraint.\n\nThe only valid arrangement is Ben=1, Aisha=2, Cara=3, Dev=4. Ben must be in room 1.",
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
    explanation: "Option A — 'Some passengers say they would enjoy more choice at night' — this is vague and amounts to a general preference without explaining why a late train specifically is needed or what problem it solves. Option B — 'A late service may reduce the number of travellers who currently rely on expensive or unsafe alternatives after the final train, if demand is sufficient to operate the service sustainably' — this is the strongest because it identifies a concrete existing problem (people being forced onto expensive taxis or walking home unsafely after the last train), provides the late service as a direct solution, and adds the important caveat that this only works if demand is sufficient to make it financially viable. It covers both the social case and the commercial requirement. Option C — trains are more comfortable than buses — this comparative comfort point says nothing about whether a late-night service is specifically needed. Option D — the operator already runs trains all day — this is circular reasoning: the argument is that because the operator already does something similar, adding more is consistent with their business. It gives no independent reason why the addition is valuable or necessary.",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // QR — Data Set 1: Orbital Cargo Loading (Q39–42)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "DIAG-QR-001", qNum: 39, section: "qr", format: "mcq",
    subtype: "3D Geometry — integer fitting", difficulty: "Diamond", dataSetId: "qr-ds1",
    preamble: "LSMs must remain upright at all times — they cannot be rotated onto their sides.",
    stem: "What is the maximum number of LSMs that can be packed into the cargo bay?",
    options: ["180", "195", "200", "210"],
    correct: 3,
    explanation: "Step 1 — find the usable interior dimensions. The cargo bay is 288 cm wide, 360 cm long, and 240 cm high. Subtract shielding: width = 288 − (2 × 12) = 264 cm; length = 360 − (2 × 9) = 342 cm; height = 240 − 15 − 5 = 220 cm.\n\nStep 2 — find how many layers stack vertically. Each LSM is 40 cm tall and must stay upright. ⌊220 ÷ 40⌋ = 5 layers (the remaining 20 cm is unused — no room for a 6th layer).\n\nStep 3 — optimise the floor layout. Each LSM footprint is 54 cm × 36 cm (one dimension 54, the other 36). Try the orientation where 36 cm runs across the width and 54 cm runs along the length: across 264 cm → ⌊264 ÷ 36⌋ = 7 units; along 342 cm → ⌊342 ÷ 54⌋ = 6 units. Per layer = 7 × 6 = 42 LSMs. Try the other orientation (54 across, 36 along): ⌊264 ÷ 54⌋ = 4; ⌊342 ÷ 36⌋ = 9. Per layer = 36 — fewer. The first orientation is better.\n\nStep 4 — multiply: 42 per layer × 5 layers = 210 LSMs.",
  },
  {
    id: "DIAG-QR-002", qNum: 40, section: "qr", format: "mcq",
    subtype: "Percentages — rounding direction", difficulty: "Diamond", dataSetId: "qr-ds1",
    preamble: "Station rules require that 18 out of every 100 module spaces are kept empty for emergency access at all times.",
    stem: "The cargo bay holds 210 modules at full capacity. What is the greatest number of LSMs that can actually be loaded?",
    options: ["171", "172", "173", "174"],
    correct: 1,
    explanation: "The rule says 18 out of every 100 spaces must remain empty, meaning at most 82% of spaces can be filled. The bay holds 210 spaces. Calculate 82% of 210: 0.82 × 210 = 172.2 modules. Because you cannot load a fraction of a module, and because exceeding 82% filled would breach the rule, you must round down to 172. To verify: loading 172 modules gives 172 ÷ 210 = 81.9% — within the limit. Loading 173 gives 173 ÷ 210 = 82.4% — over the limit. The key skill here is recognising that when a constraint sets a maximum, any fractional answer must be rounded down, not up, to stay within the limit.",
  },
  {
    id: "DIAG-QR-003", qNum: 41, section: "qr", format: "mcq",
    subtype: "Mass — correct denominator", difficulty: "Diamond", dataSetId: "qr-ds1",
    preamble: "172 LSMs are loaded. Each module weighs 86 kg. Before loading, the spacecraft itself weighs 7.84 tonnes.",
    stem: "Once the modules are loaded, what percentage of the spacecraft's total mass comes from the LSMs? (Give your answer to the nearest whole %)",
    options: ["61%", "65%", "68%", "72%"],
    correct: 1,
    explanation: "Step 1 — calculate the total mass of the loaded modules: 172 × 86 kg = 14,792 kg. Step 2 — convert the spacecraft's pre-loading mass to kg: 7.84 tonnes × 1,000 = 7,840 kg. Step 3 — find the total mass of spacecraft plus modules: 14,792 + 7,840 = 22,632 kg. Step 4 — the percentage of total mass that comes from the modules: 14,792 ÷ 22,632 × 100 ≈ 65.4%, which rounds to 65%. The common error on this type of question is dividing by the spacecraft's original mass (7,840 kg) instead of by the total combined mass (22,632 kg). Always use the denominator the question actually asks for — here it is 'total mass', which includes both the spacecraft and the modules.",
  },
  {
    id: "DIAG-QR-004", qNum: 42, section: "qr", format: "mcq",
    subtype: "Multi-constraint optimisation", difficulty: "Diamond", dataSetId: "qr-ds1",
    preamble: "A new module design is proposed. It is the same size as before (so 210 spaces still fit) but weighs 12% more than 86 kg. The empty-space rule also changes — only 10% of spaces now need to be kept empty. However, a strict launch rule caps the total mass of all loaded modules at 15 tonnes.",
    stem: "How many new modules can be loaded without breaking either the space rule or the 15-tonne mass cap?",
    options: ["155", "156", "175", "189"],
    correct: 0,
    explanation: "Two separate constraints apply here — the space rule and the mass cap — and you must apply both before choosing the answer.\n\nNew module weight: 86 × 1.12 = 96.32 kg.\n\nConstraint 1 — space rule: only 10% of the 210 spaces need to be kept empty, so 90% can be filled. 210 × 0.90 = 189 modules allowed.\n\nConstraint 2 — mass cap: total module mass must not exceed 15,000 kg. Maximum modules = 15,000 ÷ 96.32 = 155.74. Round down to 155 because loading 156 would give 156 × 96.32 = 15,025.92 kg — over the cap.\n\nNow compare both limits: the space rule allows up to 189, but the mass cap limits you to 155. When two constraints conflict, the tighter one wins. The answer is 155.",
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
    explanation: "Route B has 122 adult passengers and 56 children. Adult fare = £27.50; child fare = £16.80. Revenue from adults: 122 × £27.50. Break this down: 100 × £27.50 = £2,750; 22 × £27.50 = £605. Total adult revenue = £3,355. Revenue from children: 56 × £16.80. Break this down: 50 × £16.80 = £840; 6 × £16.80 = £100.80. Total child revenue = £940.80. Grand total for Route B = £3,355.00 + £940.80 = £4,295.80.",
  },
  {
    id: "DIAG-QR-006", qNum: 44, section: "qr", format: "mcq",
    subtype: "Percentages", difficulty: "Gold", dataSetId: "qr-ds2",
    stem: "What percentage of passengers on Route C were children?",
    options: ["25.0%", "30.0%", "33.3%", "36.7%"],
    correct: 2,
    explanation: "Route C has 88 adults and 44 children. Total passengers = 88 + 44 = 132. The proportion of children = 44 ÷ 132. Both 44 and 132 are divisible by 44, so this simplifies cleanly to 1/3. As a percentage: 1 ÷ 3 × 100 = 33.3%. A quick check confirms this: 132 ÷ 3 = 44 exactly, so children are precisely one third of all Route C passengers.",
  },
  {
    id: "DIAG-QR-007", qNum: 45, section: "qr", format: "mcq",
    subtype: "Percentages — projection", difficulty: "Diamond", dataSetId: "qr-ds2",
    stem: "If the total number of passengers on Route A rises by 12.5% the following Saturday, with the same adult-to-child ratio, approximately how many passengers will travel on Route A?",
    options: ["151", "155", "158", "162"],
    correct: 1,
    explanation: "Start with Route A's current total from the chart: 96 adults + 42 children = 138 passengers. A 12.5% increase means the new total = 138 × 1.125. Calculate this in parts: 138 × 1 = 138; 138 × 0.1 = 13.8; 138 × 0.02 = 2.76; 138 × 0.005 = 0.69. Adding: 138 + 13.8 + 2.76 + 0.69 = 155.25, which rounds to 155. The question mentions the adult-to-child ratio stays the same, but you don't need to use that information to answer this question — it only becomes relevant if you were asked to split the new total into adults and children separately.",
  },
  {
    id: "DIAG-QR-008", qNum: 46, section: "qr", format: "mcq",
    subtype: "Rates", difficulty: "Diamond", dataSetId: "qr-ds2",
    stem: "Using the passenger numbers shown, Route A produces approximately what percentage more passenger-kilometres than Route C?",
    options: ["22.6%", "26.4%", "29.1%", "34.7%"],
    correct: 2,
    explanation: "Passenger-kilometres = total number of passengers × distance of route. Route A: total passengers = 96 + 42 = 138; distance = 42 km. Passenger-km = 138 × 42 = 5,796. Route C: total passengers = 88 + 44 = 132; distance = 34 km. Passenger-km = 132 × 34 = 4,488. Route A produces more passenger-kilometres — the question asks by what percentage, relative to Route C. Percentage more = (5,796 − 4,488) ÷ 4,488 × 100 = 1,308 ÷ 4,488 × 100 ≈ 29.1%. Always divide by the reference value (Route C here, since the question asks how much more Route A produces compared to Route C). Dividing by Route A's figure instead would give the wrong answer.",
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
    explanation: "From the graph: Southbay had 360 journeys on Monday and 690 on Friday. Percentage increase = (Friday − Monday) ÷ Monday × 100 = (690 − 360) ÷ 360 × 100 = 330 ÷ 360 × 100. To simplify: 330 ÷ 360 = 11/12 ≈ 0.9167. As a percentage: 91.7%. Always use the original value (Monday's figure) as the denominator for a percentage-change calculation. Using Friday's figure as the denominator would give a different and incorrect answer.",
  },
  {
    id: "DIAG-QR-010", qNum: 48, section: "qr", format: "mcq",
    subtype: "Percentages", difficulty: "Gold", dataSetId: "qr-ds3",
    stem: "On Wednesday, 12% of all journeys across the two cities used electric cycles. Approximately how many electric-cycle journeys were recorded?",
    options: ["112", "118", "122", "128"],
    correct: 2,
    explanation: "Read Wednesday's figures from the graph: Northport = 480 journeys, Southbay = 540 journeys. Combined Wednesday total across both cities = 480 + 540 = 1,020 journeys. Electric cycle journeys = 12% of 1,020 = 0.12 × 1,020 = 122.4 ≈ 122. The question asks for approximately how many, so rounding to 122 is appropriate. The key step is combining both cities' Wednesday figures before applying the percentage — the 12% applies to all journeys across both cities on Wednesday, not to each city separately.",
  },
  {
    id: "DIAG-QR-011", qNum: 49, section: "qr", format: "mcq",
    subtype: "Averages", difficulty: "Diamond", dataSetId: "qr-ds3",
    stem: "What was the mean combined number of journeys per day across the five days?",
    options: ["1,008", "1,028", "1,048", "1,068"],
    correct: 2,
    explanation: "First, calculate the combined total for each day by adding both cities. Monday: 420 + 360 = 780. Tuesday: 510 + 450 = 960. Wednesday: 480 + 540 = 1,020. Thursday: 620 + 600 = 1,220. Friday: 570 + 690 = 1,260. Now sum all five daily totals: 780 + 960 + 1,020 + 1,220 + 1,260. Work through this: 780 + 960 = 1,740; 1,740 + 1,020 = 2,760; 2,760 + 1,220 = 3,980; 3,980 + 1,260 = 5,240. Mean per day = 5,240 ÷ 5 = 1,048.",
  },
  {
    id: "DIAG-QR-012", qNum: 50, section: "qr", format: "mcq",
    subtype: "Data interpretation", difficulty: "Diamond", dataSetId: "qr-ds3",
    stem: "On which day was the difference between the two cities largest as a percentage of Northport's figure?",
    options: ["Monday", "Wednesday", "Thursday", "Friday"],
    correct: 3,
    explanation: "For each day, calculate the absolute difference between the two cities as a percentage of Northport's figure. Monday: |420 − 360| = 60; 60 ÷ 420 = 14.3%. Tuesday: |510 − 450| = 60; 60 ÷ 510 = 11.8%. Wednesday: |480 − 540| = 60; 60 ÷ 480 = 12.5%. Thursday: |620 − 600| = 20; 20 ÷ 620 = 3.2%. Friday: |570 − 690| = 120; 120 ÷ 570 = 21.1%. Friday is the largest. An important subtlety: Monday, Tuesday and Wednesday all have the same absolute gap (60 journeys), but the percentage differs because Northport's own figure changes. On Friday the absolute gap is actually larger (120), which combined with a lower Northport base produces the highest relative difference.",
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
    explanation: "This question requires you to calculate actual kWh values before you can find the percentage decrease — you cannot just work with the percentage shares. In 2025: heating was 45% of 18,400 kWh = 0.45 × 18,400 = 8,280 kWh. In 2026: heating was 40% of 16,800 kWh = 0.40 × 16,800 = 6,720 kWh. Percentage decrease = (8,280 − 6,720) ÷ 8,280 × 100 = 1,560 ÷ 8,280 × 100 ≈ 18.8%. The trap on this question is focusing only on the percentage shares (45% → 40%, a 5-point drop) and concluding the decrease is about 11% or treating the percentage-point change as the answer. You must convert the shares into actual kWh using the total consumption for each year.",
  },
  {
    id: "DIAG-QR-014", qNum: 52, section: "qr", format: "mcq",
    subtype: "Pie charts", difficulty: "Gold", dataSetId: "qr-ds4",
    stem: "How much energy was used for hot water and appliances combined in 2026?",
    options: ["6,720 kWh", "7,056 kWh", "7,392 kWh", "7,728 kWh"],
    correct: 1,
    explanation: "From the 2026 pie chart: hot water = 22% of total, appliances = 20% of total. The 2026 total is 16,800 kWh. Calculate each category: hot water = 0.22 × 16,800 = 3,696 kWh. Appliances = 0.20 × 16,800 = 3,360 kWh. Combined = 3,696 + 3,360 = 7,056 kWh. An alternative approach is to add the percentages first (22% + 20% = 42%) and then apply to the total: 0.42 × 16,800 = 7,056 kWh — the same answer either way.",
  },
  {
    id: "DIAG-QR-015", qNum: 53, section: "qr", format: "mcq",
    subtype: "Percentages", difficulty: "Diamond", dataSetId: "qr-ds4",
    stem: "Although \"Other\" rose from 7% to 9% of the total, by approximately what percentage did the actual amount of energy in that category increase?",
    options: ["12.4%", "15.1%", "17.4%", "21.0%"],
    correct: 2,
    explanation: "Despite 'Other' rising from 7% to 9% share, the total energy consumption fell from 18,400 to 16,800 kWh, which affects how much the actual kWh changed. Calculate the actual 'Other' values for each year. 2025: 7% of 18,400 = 0.07 × 18,400 = 1,288 kWh. 2026: 9% of 16,800 = 0.09 × 16,800 = 1,512 kWh. Percentage increase in actual energy = (1,512 − 1,288) ÷ 1,288 × 100 = 224 ÷ 1,288 × 100 ≈ 17.4%. The key insight this question is testing: when the total changes, a rising percentage share does not automatically mean the actual amount rises by the same percentage — or even that it rises at all. Here, the share increased by 2 percentage points but the actual kWh only rose by 17.4%, because the total fell significantly.",
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
    explanation: "Evening 1 attendance from the table: 90 premium seats, 252 standard seats, 111 restricted-view seats. Multiply each by its ticket price. Premium: 90 × £42 = £3,780. Standard: 252 × £28 — break this down: 250 × £28 = £7,000; 2 × £28 = £56. Total standard = £7,056. Restricted: 111 × £18 — break this down: 100 × £18 = £1,800; 11 × £18 = £198. Total restricted = £1,998. Grand total = £3,780 + £7,056 + £1,998 = £12,834.",
  },
  {
    id: "DIAG-QR-017", qNum: 55, section: "qr", format: "mcq",
    subtype: "Profit and margins", difficulty: "Diamond", dataSetId: "qr-ds5",
    stem: "For Evening 2, approximately what percentage of gross ticket revenue remains after the stated operating costs are deducted?",
    options: ["36.2%", "40.8%", "44.1%", "48.5%"],
    correct: 1,
    explanation: "Step 1 — total attendees for Evening 2: 88 premium + 268 standard + 116 restricted = 472. Step 2 — gross revenue: Premium: 88 × £42 = £3,696. Standard: 268 × £28 — calculate as (270 × 28) − (2 × 28) = £7,560 − £56 = £7,504. Restricted: 116 × £18 — calculate as (120 × 18) − (4 × 18) = £2,160 − £72 = £2,088. Total revenue = £3,696 + £7,504 + £2,088 = £13,288. Step 3 — operating costs: fixed cost £4,850, plus £6.40 per attendee. Variable cost = 472 × £6.40. Calculate: 400 × £6.40 = £2,560; 72 × £6.40 = £460.80. Variable = £3,020.80. Total costs = £4,850 + £3,020.80 = £7,870.80. Step 4 — remainder: £13,288 − £7,870.80 = £5,417.20. Step 5 — as a percentage of revenue: 5,417.20 ÷ 13,288 × 100 ≈ 40.8%.",
  },
  {
    id: "DIAG-QR-018", qNum: 56, section: "qr", format: "mcq",
    subtype: "Percentages", difficulty: "Diamond", dataSetId: "qr-ds5",
    stem: "Suppose the restricted-view ticket price had been £20 instead of £18 for all three performances, with exactly the same numbers of tickets sold. By approximately what percentage would total ticket revenue across the three performances have increased?",
    options: ["1.2%", "1.7%", "2.4%", "3.1%"],
    correct: 1,
    explanation: "If the restricted-view price had been £20 instead of £18, each restricted ticket would earn £2 more. Count all restricted tickets across the three performances: Matinee (94) + Evening 1 (111) + Evening 2 (116) = 321 tickets. Extra revenue = 321 × £2 = £642. Now calculate the original grand total across all three performances. Matinee: (82 × £42) + (236 × £28) + (94 × £18) = £3,444 + £6,608 + £1,692 = £11,744. Evening 1 = £12,834 (from Q54). Evening 2 = £13,288 (from Q55). Grand total = £11,744 + £12,834 + £13,288 = £37,866. Percentage increase = £642 ÷ £37,866 × 100 ≈ 1.7%. The answer is small because restricted-view seats are the cheapest category and the £2 increase is modest relative to total revenue.",
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
    explanation: "This is a critical patient safety situation, and the fundamental principle is that even a student at the bottom of the professional hierarchy has both the right and the responsibility to raise a potential safety concern. Maya has direct, first-hand knowledge — she was present during the history and remembers the patient mentioning a reaction to penicillin — and this information is not in the electronic record. Crucially, the fact that Maya is uncertain whether the planned antibiotic is related to penicillin actually strengthens the case for speaking up: if she doesn't know, the doctor needs to check before prescribing. Penicillin-related reactions can range from mild rash to anaphylaxis. Speaking up takes seconds and could prevent real harm. The doctor being busy and the queue being long do not change this — brief, essential safety checks must happen before a prescription is issued, not after. Very appropriate.",
  },
  {
    id: "DIAG-SJT-002", qNum: 58, section: "sjt", format: "approp",
    subtype: "Patient safety — uncertainty", difficulty: "Diamond",
    scenarioId: "sjt-s1", critical_safety: true,
    stem: "How appropriate is the following action?\n\nMaya decides not to interrupt the doctor but plans to mention the allergy comment after the prescription has been completed.",
    correct: 3,
    explanation: "The fundamental error in this action is timing. Waiting until after the prescription is completed means the patient could receive a drug they are allergic to before Maya's concern is ever raised. In a hospital setting, a prescription can rapidly translate into dispensing and administration — and a penicillin-related allergic reaction could occur quickly and seriously. The justification of 'not interrupting the doctor because they're busy' is entirely irrelevant when a time-sensitive safety issue is at stake. A clinician who is busy would still want to know about a potential allergy before prescribing, not after. This action delays a safety concern for no legitimate reason, allowing a preventable harm to occur simply to avoid a moment of social awkwardness. Very inappropriate.",
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
    explanation: "Most important — Factor A: the possibility that the patient's previous reaction could be relevant to safe prescribing. This is the direct patient-safety driver. If this allergy is real and the antibiotic is related to penicillin, the patient could be seriously harmed. This is what elevates the situation from a minor inconvenience into a clinical priority that must be acted on. Every other consideration in this scenario must be measured against this one. Least important — Factor D: whether the doctor might feel embarrassed at being questioned by a student. Patient safety must never be held hostage to concerns about professional hierarchy or interpersonal comfort. The potential mild embarrassment of a clinician being politely corrected by a student is trivially unimportant compared to the risk of an allergic reaction. Any culture where students suppress safety concerns to protect a senior clinician's feelings is an unsafe culture.",
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
    explanation: "The practice has an approved, documented clinical contact system — a telephone and online route designed specifically for patients to raise concerns and receive clinical responses safely and accountably. Imran redirecting the patient to this system is not unhelpful; it is the professionally correct response. It ensures the patient's concern about the worsening swelling gets assessed by someone qualified to act on it, through a channel with proper oversight and documentation. Declining the personal follow request simultaneously maintains the boundary between Imran's personal life and his clinical role — a boundary that protects both the patient's dignity and Imran's own professional standing. Very appropriate.",
  },
  {
    id: "DIAG-SJT-005", qNum: 61, section: "sjt", format: "approp",
    subtype: "Confidentiality and boundaries", difficulty: "Diamond",
    scenarioId: "sjt-s2", critical_safety: true,
    stem: "How appropriate is the following action?\n\nImran accepts the request temporarily so he can see the photograph, then tells the patient that the swelling does not look serious but that they should contact the practice if it worsens.",
    correct: 3,
    explanation: "The word 'temporarily' does not mitigate any of the problems here — the boundary issues exist the moment Imran accepts the request, regardless of how briefly he intends to maintain it. Accepting a patient's social-media follow request opens a personal channel between Imran's private identity and someone in his care, which blurs the line between who he is socially and who he is clinically. Offering a clinical opinion through that personal channel is doubly problematic: Imran is a medical student, not the patient's doctor, and providing clinical advice via private social media entirely bypasses the documented, supervised contact route. If the advice was wrong and the swelling turned out to be serious, there would be no accountability trail, no documentation, and no supervisor involvement. Very inappropriate.",
  },
  {
    id: "DIAG-SJT-006", qNum: 62, section: "sjt", format: "import",
    subtype: "Professional boundaries", difficulty: "Diamond",
    scenarioId: "sjt-s2", critical_safety: false,
    stem: "When deciding how to respond, how important is it for Imran to consider:\n\nThat communicating through his private account could blur the boundary between his personal life and his role as a student involved in the patient's care.",
    correct: 0,
    explanation: "Why is this consideration very important? Because the core risk in this scenario is not just about one medical question — it's about what happens when a personal channel opens between a patient and a medical student. Once Imran responds clinically through his private account, the patient has a reason to contact him that way again. Each further interaction moves him further from his professional role and deeper into an informal relationship with clinical implications. The boundary between 'Imran as a person' and 'Imran as a medical student involved in this patient's care' is fundamental: it protects the patient's right to confidentiality and professionally accountable care, and it protects Imran from operating outside proper clinical structures with no oversight. Very important.",
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
    explanation: "This is exactly the right first step. Addressing the problem directly with Leo — before going to any authority and before the deadline — gives him the chance to correct the section while there is still time. Offering to help with citations makes this a constructive, collaborative response rather than an accusatory one. The uncited text may have arisen from carelessness or poor practice rather than deliberate deception, and proportionate professional conduct means giving Leo the opportunity to address the error before escalating to formal proceedings. This approach also preserves the group's ability to submit clean work — which is the actual outcome that matters. Very appropriate.",
  },
  {
    id: "DIAG-SJT-008", qNum: 64, section: "sjt", format: "approp",
    subtype: "Academic integrity — proportional escalation", difficulty: "Diamond",
    scenarioId: "sjt-s3", critical_safety: false,
    stem: "How appropriate is the following action?\n\nNia immediately emails the head of school accusing Leo of deliberate plagiarism and asks for him to be removed from the course, without first giving him an opportunity to correct the section.",
    correct: 3,
    explanation: "Immediately emailing the head of school with an accusation of deliberate plagiarism — and asking for Leo's removal from the course — is disproportionate at every level. First, it skips the direct conversation that should happen as the obvious first step: Leo should know about the concern before it becomes a formal complaint. Second, 'deliberate plagiarism' is a serious allegation. What Nia observed is uncited text that closely matches an online article; whether Leo copied it with intent to deceive or simply failed to reference it properly is not yet established. Third, seeking the most severe possible institutional consequence before any investigation is a fundamental failure of proportionality. Professional and academic conduct processes exist for a reason — to assess situations fairly and escalate appropriately. Jumping to the maximum sanction without prior steps fails both fairness and professional maturity. Very inappropriate.",
  },
  {
    id: "DIAG-SJT-009", qNum: 65, section: "sjt", format: "import",
    subtype: "Academic integrity", difficulty: "Diamond",
    scenarioId: "sjt-s3", critical_safety: false,
    stem: "When deciding what to do, how important is it for Nia to consider:\n\nThat the final presentation will be submitted as the work of the whole group rather than as Leo's work alone.",
    correct: 0,
    explanation: "This consideration is very important because it transforms the situation from 'Leo's problem' to 'Nia's problem too'. When the presentation is submitted as a group product under all four members' names, the uncited text becomes part of something Nia has jointly authored and signed off. If it is identified as plagiarism during or after assessment, the entire group may share the academic consequences — not just Leo. This gives Nia a direct personal stake in ensuring the integrity of the work before submission. She is not simply a bystander watching Leo cut a corner; she is a co-author about to put her name to work that contains someone else's writing without attribution. That is precisely why raising the issue is essential, not optional. Very important.",
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
    explanation: "Sensitive questions about urinary symptoms and sexual history require a patient to be able to answer freely and accurately. When a family member is translating, there are well-recognised problems: the patient may not disclose accurately when a relative is present, particularly regarding sexual history or symptoms she finds embarrassing; the son may not translate precisely or may summarise or edit responses; and the patient may be visibly influenced by the awareness that her son is hearing this information (the passage notes she 'repeatedly looks towards her son before responding'). A professional telephone interpreter removes all these barriers. Asking the clinician to pause the sensitive part of the history until one is available is the patient-centred response — it costs a few minutes and prevents missing critical clinical information while protecting the patient's dignity. Very appropriate.",
  },
  {
    id: "DIAG-SJT-011", qNum: 67, section: "sjt", format: "approp",
    subtype: "Hierarchy and patient dignity", difficulty: "Diamond",
    scenarioId: "sjt-s4", critical_safety: true,
    stem: "How appropriate is the following action?\n\nSofia decides not to raise the issue during the consultation, but plans to ask the clinician about it privately once the patient has left.",
    correct: 2,
    explanation: "Raising the concern after the consultation is better than never raising it at all — it creates an opportunity for the clinician to reflect on interpreter use in future consultations, which has some value. However, the harm in this particular consultation will already have occurred: the patient has been asked intimate questions through her son, may have given incomplete or inaccurate answers, and has potentially experienced distress or loss of dignity in the process. Nothing Sofia does afterwards can undo that. Raising the concern during the consultation would have been more effective and more patient-centred. 'Inappropriate, but not awful' reflects this balance: better than silence, but too late to protect the patient in front of her right now.",
  },
  {
    id: "DIAG-SJT-012", qNum: 68, section: "sjt", format: "import",
    subtype: "Communication and autonomy", difficulty: "Gold",
    scenarioId: "sjt-s4", critical_safety: true,
    stem: "When deciding whether to raise a concern, how important is it for Sofia to consider:\n\nWhether the patient can answer sensitive questions freely and understand the consultation accurately.",
    correct: 0,
    explanation: "This is the core clinical and ethical question in the scenario. If the patient cannot answer sensitive questions accurately — because her son is present and translating, and she is clearly looking to him before responding — then the clinician may miss important clinical information. Inaccurate or incomplete history about urinary symptoms or sexual health can lead to incorrect diagnoses, missed infections, or inappropriate referrals. The patient's autonomy — her right to speak freely without a family member as an audience — is also at stake. Both the quality of the clinical information and the patient's dignity depend on this consideration, which is precisely why it must be central to any decision about whether and how to proceed with the sensitive section of the history. Very important.",
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
    explanation: "In healthcare, a culture of honesty about errors is fundamental — it is far safer than a culture where mistakes are quietly buried. Elliot's supervisor has already incorporated the potentially inaccurate data into a draft slide deck, and there may be limited time before the presentation. The sooner the supervisor knows, the more time there is to assess whether the data change is material, whether the graph changes significantly, and whether the presentation can proceed. Offering to correct and recheck is the accountable response: Elliot made the error, and he should be the one to fix it. Transparency here also models the kind of professional culture that makes research trustworthy. Very appropriate.",
  },
  {
    id: "DIAG-SJT-014", qNum: 70, section: "sjt", format: "approp",
    subtype: "Integrity — concealment", difficulty: "Diamond",
    scenarioId: "sjt-s5", critical_safety: false,
    stem: "How appropriate is the following action?\n\nElliot quietly corrects the spreadsheet but does not tell his supervisor because the graph may end up looking almost the same.",
    correct: 2,
    explanation: "Correcting the data is better than leaving the error in place — that part of this action has genuine positive value. But not telling the supervisor turns a correctable mistake into a concealment. The supervisor has already used the original data in draft slides. Even if Elliot thinks the graph will look almost the same after correction, that is a guess — not a certainty. The supervisor needs to make their own informed judgement about whether the change is material, not have that decision made for them by Elliot's quiet behind-the-scenes fix. 'The graph may look almost the same' is not a sufficient reason to withhold information about a known data error from someone who has already acted on that data. Inappropriate, but not awful: the data correction has value, the concealment does not.",
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
    explanation: "Most important — Factor B: the need for the supervisor to know that material already used in the draft slides may be inaccurate. The supervisor is the decision-maker about the presentation. If they present incorrect data without knowing it was ever wrong, the quality-improvement project loses its integrity. In a healthcare context, inaccurate quality-improvement data can influence real decisions about how services are run. The supervisor must be informed promptly so they can assess the impact and decide how to proceed. Least important — Factor C: the chance that admitting the mistake could make Elliot look careless. Professional integrity and data accuracy must always take priority over self-image. Allowing concern about personal reputation to influence whether to disclose a data error is a serious failure of professional values — exactly the kind of attitude that leads to errors being concealed in research and clinical settings. The risk of looking careless is infinitely less important than the risk of presenting inaccurate data.",
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
    explanation: "This response gets the balance right in a genuinely difficult situation. Encouraging Tom to seek support shows real care for his wellbeing and acknowledges the seriousness of what he's going through at home — this is important and kind. Being clear with him that a supervisor now needs to know enough to ensure the placement remains safe is honest, necessary, and appropriately framed — it is presented as a safety requirement, not as a betrayal. The critical point is that a near-miss with a patient record has already occurred. Tom's judgment is currently compromised, and the person qualified to make decisions about whether and how he continues working is a supervisor, not Priya. Absolute confidentiality between two students cannot be maintained when patient safety has already been affected. Very appropriate.",
  },
  {
    id: "DIAG-SJT-017", qNum: 73, section: "sjt", format: "approp",
    subtype: "Patient safety — colleague impairment", difficulty: "Diamond",
    scenarioId: "sjt-s6", critical_safety: true,
    stem: "How appropriate is the following action?\n\nPriya agrees to keep the situation completely private as long as Tom promises to double-check all patient records from now on.",
    correct: 3,
    explanation: "An informal agreement between two medical students is not a substitute for appropriate supervisory oversight when a patient safety event — even a near-miss — has already occurred. The fundamental problem with this action is that it trusts the very thing that should be checked: Tom's current reliability. He has been arriving late and appearing exhausted, and he has already nearly entered an observation under the wrong patient's record. A promise to 'double-check all records from now on' sounds reassuring, but it asks Priya to bet patient safety on Tom's self-monitoring capacity at a time when his performance has already been impaired. That is not Priya's call to make. Supervisors exist precisely to assess and manage situations like this. Very inappropriate.",
  },
  {
    id: "DIAG-SJT-018", qNum: 74, section: "sjt", format: "import",
    subtype: "Colleague wellbeing", difficulty: "Gold",
    scenarioId: "sjt-s6", critical_safety: false,
    stem: "When deciding what to do, how important is it for Priya to consider:\n\nThat Tom may genuinely need support rather than simply criticism for his recent behaviour.",
    correct: 1,
    explanation: "Tom's wellbeing and the personal difficulties he has disclosed are real and deserve genuine compassion. Understanding that he is struggling at home — rather than simply being careless or unprofessional — is important because it shapes how Priya approaches the situation: with support and concern rather than blame and criticism. This awareness should encourage Priya to recommend that Tom seeks help, and to raise the concern with a supervisor in a way that is caring rather than punitive. This factor is rated Important rather than Very Important because patient safety must remain the primary consideration. Tom's need for support influences how the concern is raised, but it cannot determine whether it is raised.",
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
    explanation: "Once a patient withdraws consent, the matter is settled. 'Actually, I would rather not have it done again' is unambiguous — this is a clear withdrawal of consent. Daniel's need for a sign-off is real but is entirely secondary to the patient's right to decide what happens to their body, even in a teaching clinic, even partway through a session they initially agreed to. Accepting the refusal without any attempt to persuade, negotiate, or invoke his training requirements is not only ethically correct — it is the legally required response. Asking his supervisor about another opportunity is exactly the right professional step: it routes the unmet training need through the appropriate channel rather than trying to resolve it by overriding the patient's decision. Very appropriate.",
  },
  {
    id: "DIAG-SJT-020", qNum: 76, section: "sjt", format: "approp",
    subtype: "Consent — pressure", difficulty: "Diamond",
    scenarioId: "sjt-s7", critical_safety: true,
    stem: "How appropriate is the following action?\n\nDaniel reassures the patient that the examination is quick, then explains that he may be unable to complete his placement requirement this week if they refuse.",
    correct: 3,
    explanation: "This action is coercive, even if the wording sounds apologetic or polite. The patient has already said she would rather not have the examination done again. Telling her — at that point — that Daniel 'may be unable to complete his placement requirement' if she refuses is not a neutral statement of fact: it is a statement designed to make her feel that her refusal causes harm to Daniel's career. A patient in a hospital, under clinical care, interacting with multiple authority figures, is in a vulnerable position. The implicit message that her refusal is costly to someone who appears to need her cooperation creates exactly the kind of pressure that invalidates consent. Consent must be free from this kind of influence. Very inappropriate.",
  },
  {
    id: "DIAG-SJT-021", qNum: 77, section: "sjt", format: "import",
    subtype: "Consent — communication", difficulty: "Diamond",
    scenarioId: "sjt-s7", critical_safety: true,
    stem: "When deciding what to do, how important is it for Daniel to consider:\n\nWhether the way the request is discussed could make the patient feel pressured to agree.",
    correct: 0,
    explanation: "Consent is only valid when it is given freely. The entire ethical and legal framework of consent rests on the patient's ability to agree — or refuse — without pressure. A patient in a clinical setting is already in a vulnerable position: they are unwell, in an unfamiliar environment, and interacting with people in positions of authority. If any aspect of how the examination is requested implies they ought to agree — because the student needs it, because the clinician encourages it, because the clinic is busy — the voluntariness of their agreement is compromised. Whether the framing actually makes the patient feel pressured is therefore not a peripheral concern; it is the central ethical question of the scenario. Attending to this is fundamental, not optional. Very important.",
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
    explanation: "Aisha acts promptly, proportionately, and discreetly. Rather than challenging Ben publicly in an embarrassing way, or waiting until after leaving the lift to say something, she addresses the risk as it is happening. The combination of details Ben has shared — age, occupation, rare diagnosis, small village — is enough to make this patient identifiable to anyone who knows them, and there are members of the public in the lift right now. Every additional detail Ben adds increases the risk. Acting immediately is important precisely because the breach is occurring in real time. This is a classic example of appropriate peer challenge: it protects the patient, it's proportionate, and it doesn't unnecessarily escalate. Very appropriate.",
  },
  {
    id: "DIAG-SJT-023", qNum: 79, section: "sjt", format: "approp",
    subtype: "Confidentiality — anonymisation", difficulty: "Diamond",
    scenarioId: "sjt-s8", critical_safety: true,
    stem: "How appropriate is the following action?\n\nAisha lets Ben continue because he has not used the patient's name or hospital number.",
    correct: 3,
    explanation: "This action reflects a fundamental misunderstanding of what patient confidentiality actually requires. Confidentiality is not protected simply by omitting a patient's name or hospital number. The 'jigsaw effect' occurs when several individually non-identifying pieces of information combine to make a person recognisable: knowing that a middle-aged patient with a rare diagnosis works in a specific occupation and lives in a small named village is enough for people in that community to identify them, without ever hearing their name. Two members of the public are standing in the lift — either of them could know this patient. Deciding the conversation is acceptable because a name was not used demonstrates a failure to understand what confidentiality protection actually means. Very inappropriate.",
  },
  {
    id: "DIAG-SJT-024", qNum: 80, section: "sjt", format: "import",
    subtype: "Confidentiality", difficulty: "Diamond",
    scenarioId: "sjt-s8", critical_safety: true,
    stem: "When deciding whether to intervene, how important is it for Aisha to consider:\n\nThat several individually non-identifying details may make a patient recognisable when combined.",
    correct: 0,
    explanation: "This is the central principle in confidentiality questions involving indirect identification, and understanding it is what drives the entire correct response in this scenario. Many students assume confidentiality only requires avoiding names or identification numbers — this is wrong. The 'jigsaw effect' means that individually innocuous pieces of information can combine to identify someone just as reliably as their name. Age + occupation + rare diagnosis + specific small village = a person who is almost certainly identifiable to anyone who knows them. Without awareness of this principle, a student might genuinely conclude Ben's conversation is acceptable because he didn't say the patient's name. With it, the risk is immediately clear. This is why it is very important — it is the foundational concept Aisha needs to recognise the problem at all.",
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
    explanation: "Jonah raises the concern in exactly the right way. He frames it as a question rather than an assertion — 'I noticed the episode wasn't included, should it be?' — which leaves the clinical decision to the doctors while ensuring the information is not silently lost. He doesn't accuse the outgoing doctor of making a mistake or assert that the confusion episode is definitely significant; he simply flags that it wasn't mentioned and asks whether it should be. This is the speaking-up behaviour that safe handovers depend on, and Jonah's student status does not remove his responsibility to raise a potential gap. If the episode turns out to be clinically unimportant, the doctor can say so and everyone moves on. If it is important, Jonah may have prevented a serious oversight. Very appropriate.",
  },
  {
    id: "DIAG-SJT-026", qNum: 82, section: "sjt", format: "approp",
    subtype: "Hierarchy and uncertainty", difficulty: "Diamond",
    scenarioId: "sjt-s9", critical_safety: true,
    stem: "How appropriate is the following action?\n\nJonah stays silent because deciding what belongs in a medical handover is the doctor's responsibility rather than a student's.",
    correct: 3,
    explanation: "Professional hierarchy determines who makes clinical decisions — it does not mean that only senior clinicians are permitted to notice and raise potential safety gaps. Jonah is not being asked to decide whether the confusion episode is clinically significant; he is simply in a position where he has observed something that may have been omitted from handover. Staying silent on the grounds that 'it's not my place' is a misapplication of the hierarchy principle, and it puts the incoming team at risk of not having complete information about a patient in their care overnight. The incoming doctor is about to move on — if Jonah says nothing, the information is gone. Silence when a patient safety concern is apparent, and when speaking would take only seconds, is always inappropriate regardless of the speaker's seniority. Very inappropriate.",
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
    explanation: "Most important — Factor A: whether the omitted event might be relevant to the patient's ongoing care. This is the direct patient-safety driver. The episode of confusion is clinical information about a specific patient that the incoming team may need to know about — it could affect overnight monitoring decisions, the interpretation of new symptoms, or a medication review. This is why Jonah should speak, regardless of all other considerations. Least important — Factor D: whether other students might think Jonah is trying to show off. Allowing fear of social judgement from peers to suppress a patient-safety concern is precisely the kind of cultural problem that leads to avoidable harm. Other students' opinions of Jonah's motivations are completely irrelevant to a clinical safety decision. Treating social perception as a legitimate factor in whether to speak up is a serious professional failure.",
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
    explanation: "Honest upward feedback is a professional responsibility, and Leah gets the manner of delivery exactly right. She is private — not embarrassing Dr Shah in front of other people. She is specific — focused on the observable outcome (the patient appeared to remain unsure about the medication) rather than making a general criticism of his communication style. She is constructive — framing it as a question ('would more explanation have helped?') rather than a verdict, which invites reflection without triggering defensiveness. This is how professional feedback should be given at every level of the medical hierarchy. The fact that Leah is a student and Dr Shah is assessing her later does not remove her professional responsibility to give an honest response when asked for feedback. Very appropriate.",
  },
  {
    id: "DIAG-SJT-029", qNum: 85, section: "sjt", format: "approp",
    subtype: "Professional courage", difficulty: "Diamond",
    scenarioId: "sjt-s10", critical_safety: false,
    stem: "How appropriate is the following action?\n\nLeah tells Dr Shah that the consultation went well because she does not want to risk influencing her assessment.",
    correct: 2,
    explanation: "Telling Dr Shah the consultation went well when Leah believes the patient left confused is dishonest. It is also counterproductive: the entire point of feedback is to support improvement, and false positive feedback tells Dr Shah nothing useful and may reinforce a communication style that leaves patients confused. However, this action does not directly harm the patient in the way a clinical error would — the patient has left, and there is no immediate safety consequence from Leah's dishonest feedback alone. The harm is indirect: it perpetuates a consultation approach that may leave patients non-adherent to their medication, and it sets a pattern of allowing self-interest to override professional honesty. 'Inappropriate, but not awful' reflects that this is a genuine failure of professional courage without being an immediate patient safety risk.",
  },
  {
    id: "DIAG-SJT-030", qNum: 86, section: "sjt", format: "import",
    subtype: "Communication", difficulty: "Gold",
    scenarioId: "sjt-s10", critical_safety: false,
    stem: "When considering her feedback, how important is it for Leah to consider:\n\nWhether the patient appeared to understand enough about the medication to follow the plan safely.",
    correct: 0,
    explanation: "The practical clinical stakes are what make this very important. A patient who doesn't understand why a new medication has been prescribed is at real risk of not taking it, taking it incorrectly, or stopping it when she shouldn't. This is not just an academic concern about communication style — it is a clinical outcome question. If the patient left the consultation genuinely confused about her medication, the practice may need to follow up: a pharmacist review, a nurse call, or an urgent re-appointment could all be appropriate responses. That possibility makes what Leah observed directly relevant to this patient's ongoing care, not merely to Dr Shah's professional development or Leah's own training. Very important.",
  },
  {
    id: "DIAG-SJT-031", qNum: 87, section: "sjt", format: "import",
    subtype: "Hierarchy", difficulty: "Diamond",
    scenarioId: "sjt-s10", critical_safety: false,
    stem: "When considering her feedback, how important is it for Leah to consider:\n\nThat Dr Shah will be completing her teaching assessment later that day.",
    correct: 2,
    explanation: "This consideration has some legitimacy — Leah is not wrong to notice that Dr Shah will be assessing her later that afternoon, and it is natural to feel that pressure. But the extent to which it should actually influence what she says is very small. Honest feedback is always more valuable and more professional than feedback shaped by self-interest. Allowing the assessment to become a dominant factor would cross the line from understandable anxiety into using dishonesty as a form of self-protection — exactly the kind of professional compromise that erodes trust in healthcare communication and learning environments. Of minor importance.",
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
    explanation: "Hana's suggestion reflects good practice in adolescent healthcare. Young people under 16 can have the right to private consultations with their clinician, and it is standard good practice to offer this, particularly when a young person explicitly requests it. The Gillick competence framework — regularly tested in UCAT SJT — establishes that age alone does not determine whether a young person's wishes should be overridden; their capacity to understand must be assessed. Hana proposes a sensitive, proportionate approach: acknowledge Sam's request, create the opportunity for some private time, and manage the parent's concerns in a way that is respectful rather than dismissive. This honours Sam's autonomy without alienating the family. Very appropriate.",
  },
  {
    id: "DIAG-SJT-033", qNum: 89, section: "sjt", format: "approp",
    subtype: "Young people — confidentiality", difficulty: "Diamond",
    scenarioId: "sjt-s11", critical_safety: false,
    stem: "How appropriate is the following action?\n\nHana assumes the parent's objection settles the matter because Sam is under 16.",
    correct: 3,
    explanation: "Assuming a parent's objection settles the matter because Sam is under 16 fundamentally misunderstands the legal and ethical framework. Being under 16 does not automatically mean a young person lacks the right to confidentiality or to a private conversation with their clinician. The Gillick competence principle establishes that a young person who is sufficiently mature and intelligent to understand the nature of what they are consenting to has the right to make decisions about their care — and this includes the right to speak privately. A parent's objection does not override the clinician's responsibility to assess Sam's capacity and consider his or her wishes. Treating age as automatically determinative ignores the central principle in adolescent healthcare. Very inappropriate.",
  },
  {
    id: "DIAG-SJT-034", qNum: 90, section: "sjt", format: "import",
    subtype: "Young people — communication", difficulty: "Diamond",
    scenarioId: "sjt-s11", critical_safety: false,
    stem: "When deciding how to respond, how important is it to consider:\n\nThat Sam may have information they do not feel comfortable discussing in front of the parent.",
    correct: 0,
    explanation: "Young people typically request private consultations because they have something to share that they cannot say in front of a parent — mental health concerns, relationship issues, substance use, sexual health questions, or sometimes concerns about their home situation. Sam is 15 and has explicitly asked for private time. If Sam cannot share what they came to say because the parent is present throughout, the consultation may be clinically incomplete. There may also be safeguarding implications: disclosures about abuse, neglect, or at-risk behaviour are exactly the kind of information a young person might feel unable to share in front of a parent. The quality of this consultation — and potentially the ability to identify a safeguarding concern — may depend entirely on whether Sam gets that private time. This is the most important consideration in the scenario. Very important.",
  },
  {
    id: "DIAG-SJT-035", qNum: 91, section: "sjt", format: "import",
    subtype: "Service pressure", difficulty: "Gold",
    scenarioId: "sjt-s11", critical_safety: false,
    stem: "When deciding how to respond, how important is it to consider:\n\nThat allowing a private conversation may make the clinic run several minutes later.",
    correct: 2,
    explanation: "A few minutes' delay to the clinic is a very minor consideration in the context of a young person's right to speak confidentially with their clinician. The clinic is 'already running late' — but that is a chronic feature of busy healthcare, not a sufficient reason to override a patient's basic right to speak privately. In any scenario where a young person has explicitly requested confidential time and where sensitive disclosures or safeguarding concerns may be involved, scheduling efficiency must give way to patient care. Allowing a time pressure to override this would be a disproportionate and ethically incorrect prioritisation. Of minor importance.",
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
