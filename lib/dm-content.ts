// Decision Making content — 6 question families

export type Rule = { title: string; body: string };
export type Step = { label: string; body: string; highlight?: string };
export type VennData2 = {
  kind: "venn2";
  labelA: string; labelB: string;
  onlyA: number; both: number; onlyB: number; neither: number; total: number;
};
export type VennData3 = {
  kind: "venn3";
  labelA: string; labelB: string; labelC: string;
  onlyA: number; onlyB: number; onlyC: number;
  ab: number; ac: number; bc: number; abc: number;
  neither: number; total: number;
};
export type VennData = VennData2 | VennData3;

export type WorkedQ = {
  question: string;
  passage?: string;
  vennData?: VennData;
  steps: Step[];
  answer: string;
  answerNote: string;
  trap?: string;
};
export type PracticeQ = {
  passage: string;
  vennData?: VennData;
  question: string;
  opts: string[];
  cor: number;
  explanation: string;
};

export type DMSubtype = {
  key: string;
  label: string;
  tagline: string;
  format: "yn" | "mcq";
  rules: Rule[];
  errors: string[];
  passage: string;
  workedQs: WorkedQ[];
  practice: PracticeQ[];
};

export const DM_NAV = [
  {
    type: "yn" as const,
    label: "Yes / No Five Statements",
    subtypes: ["syllogisms", "interpreting-info"],
  },
  {
    type: "mcq" as const,
    label: "Single Answer MCQ",
    subtypes: ["logic-puzzles", "arguments", "venn", "probability"],
  },
];

const REEF_PASSAGE = `Rules:
• All reef guides are divers.
• No divers are inexperienced swimmers.
• Some marine researchers are reef guides.
• All reef guides carry radios.
• Some people who carry radios are volunteers.`;

const APPOINTMENTS_PASSAGE = `Health centre appointments (one week):

Department  | Booked | Attended | Missed
------------|--------|----------|-------
Cardiology  |  240   |   216    |  10%
Dermatology |  180   |   153    |  27
Neurology   |  150   |   132    |  35 min avg wait
Ophthalmology| 210   |   189    |  19 min avg wait

Note: Attendance percentage = Attended ÷ Booked × 100.`;

const TALKS_PASSAGE = `Five talks — J, K, L, M and N — are scheduled Monday to Friday.

Rules:
• L is on Wednesday.
• N is later than K.
• J is immediately before M.
• K is not on Monday.

Build a slot diagram: Mon | Tue | Wed | Thu | Fri`;

const CYCLE_PASSAGE = `Question: Should the council create protected cycle lanes on the main road?

A. Yes, because bicycles are available in many colours.
B. Yes, because collision records show that cyclists are frequently injured where they must share narrow lanes with heavy traffic.
C. No, because some people dislike cycling.
D. No, because roads were invented before modern bicycles.`;

const COFFEE_PASSAGE = `Survey of 120 people:
• 68 drink tea.
• 54 drink coffee.
• 22 drink both tea and coffee.

Total surveyed: 120`;

const COUNTERS_PASSAGE = `A bag contains 5 red counters and 3 blue counters (8 total).

Two counters are selected without replacement.

Key formulas:
P(event) = favourable outcomes ÷ total outcomes
P(A and B) = P(A) × P(B after A removed)
P(at least one) = 1 − P(none)`;

export const DM_SUBTYPES: DMSubtype[] = [
  {
    key: "syllogisms",
    label: "Syllogisms",
    tagline: "Decide what must follow from categorical or conditional rules",
    format: "yn",
    rules: [
      { title: "Accept every rule as given", body: "Treat all rules as completely true, even if the subject is imaginary (animals, planets, colours). Do not test them against real-world knowledge." },
      { title: "Yes = must follow", body: "Mark Yes only when the conclusion is true in every arrangement permitted by the rules — not just possible or likely." },
      { title: "No = not guaranteed", body: "Mark No when the conclusion might be false, even if it could be true. No does not mean impossible." },
      { title: "Never reverse 'All A are B'", body: "All A are B places A inside B. It tells you nothing about B items outside A. Reversing it is the most common trap." },
      { title: "Chain existence carefully", body: "To use 'Some A are B' and 'All B are C' together, the known A-B members carry through: some A must also be C. But you cannot assume further overlaps beyond what is given." },
      { title: "Follow conditional arrows forward", body: "If A → B, you can conclude: A occurs → B must occur, and B does not occur → A cannot occur. You cannot go from B back to A (converse error)." },
    ],
    errors: [
      "Reversing 'All A are B' into 'All B are A' — the arrow goes one way only.",
      "Assuming two groups overlap because they both belong to a larger group.",
      "Treating 'Some A are B' as if it means 'All A are B'.",
      "Confusing necessary and sufficient conditions (the code opens the door does not mean the door only opens for the code).",
      "Assuming that having the result proves the original condition was met (affirming the consequent).",
    ],
    passage: REEF_PASSAGE,
    workedQs: [
      {
        question: "Statement: All divers are reef guides. Does this follow?",
        steps: [
          { label: "Read the rule direction", body: "The rule says 'All reef guides are divers.' The arrow goes FROM reef guides → TO divers.", highlight: "All reef guides are divers" },
          { label: "Ask: can we reverse it?", body: "This tells us every reef guide is a diver. It says nothing about divers who are not reef guides — there may be many.", highlight: "No divers are inexperienced swimmers" },
          { label: "Test the conclusion", body: "'All divers are reef guides' requires the arrow to run the other way. That is a reversal, which is not permitted.", highlight: "All reef guides are divers" },
          { label: "Decide", body: "The conclusion does not follow. There could be divers who are not reef guides." },
        ],
        answer: "No",
        answerNote: "This is the converse error — reversing 'All A are B' into 'All B are A'. Never do this.",
        trap: "It feels true that divers would be reef guides, but the rule only runs from reef guide → diver, not the other way.",
      },
      {
        question: "Rules: If an employee handles cash, they complete basic training. Only employees with a security code may enter the vault. Anyone who completes advanced training receives a security code. Mira handles cash. Statement: Mira has a security code. Does this follow?",
        passage: `Rules:
• If an employee handles cash → they complete basic training.
• Only employees with a security code may enter the vault.
• Advanced training → security code.
• Mira handles cash.
• Jon has a security code.`,
        steps: [
          { label: "Apply the first rule to Mira", body: "Mira handles cash → Mira completes basic training. This is certain.", highlight: "Mira handles cash" },
          { label: "Check the route to a security code", body: "A security code is awarded for advanced training, not basic training. The rules give two separate paths.", highlight: "Advanced training → security code" },
          { label: "Can basic training lead to a code?", body: "There is no rule linking basic training to a security code. So Mira's basic training does not produce a code.", highlight: "If an employee handles cash → they complete basic training" },
          { label: "Decide", body: "We cannot conclude that Mira has a security code.", highlight: "Advanced training → security code" },
        ],
        answer: "No",
        answerNote: "Mira reaches basic training, but the code requires advanced training. The paths are separate.",
        trap: "It is easy to assume that completing any training leads to the code. Read each conditional precisely.",
      },
    ],
    practice: [
      {
        passage: REEF_PASSAGE,
        question: "Which conclusion MUST follow from the reef guide rules?",
        opts: [
          "Some volunteers are reef guides",
          "Some marine researchers are divers",
          "All divers carry radios",
          "All marine researchers are volunteers",
        ],
        cor: 1,
        explanation: "Some marine researchers are reef guides (given), and all reef guides are divers (rule 1). Those particular researcher-reef-guides must therefore also be divers. Option A is wrong because the volunteer radio carriers could be entirely different from reef guides. Option C reverses 'all reef guides carry radios'. Option D has no support.",
      },
      {
        passage: `Rules:
• All tutors are qualified.
• Some staff are tutors.
• No qualified person is unregistered.`,
        question: "Which conclusion must follow?",
        opts: [
          "All staff are qualified",
          "Some staff are qualified",
          "All qualified people are tutors",
          "Some qualified people are unregistered",
        ],
        cor: 1,
        explanation: "Some staff are tutors, and all tutors are qualified — so those staff-tutors are qualified. 'Some staff are qualified' must follow. Option A over-generalises: only the tutor subset of staff is confirmed as qualified. Option C reverses 'all tutors are qualified'. Option D contradicts rule 3.",
      },
      {
        passage: `Rules:
• If a patient is admitted, they receive a wristband.
• A wristband is issued only if identity is verified.
• Patient A has a wristband.`,
        question: "Which conclusion must follow?",
        opts: [
          "Patient A was admitted",
          "Patient A's identity was verified",
          "Only admitted patients receive wristbands",
          "All patients with verified identity were admitted",
        ],
        cor: 1,
        explanation: "A wristband requires identity verification (rule 2). Patient A has a wristband, so by contrapositive reasoning, their identity must have been verified. Option A reverses rule 1 (admitted → wristband does not mean wristband → admitted). Options C and D go beyond the stated rules.",
      },
    ],
  },

  {
    key: "interpreting-info",
    label: "Interpreting Information",
    tagline: "Judge conclusions from text passages and numerical data",
    format: "yn",
    rules: [
      { title: "Use only the supplied information", body: "Treat only the passage, table or chart as your evidence. Do not add outside knowledge or assumptions." },
      { title: "Judge each conclusion independently", body: "A conclusion can be Yes even if previous conclusions are No. Evaluate each one against the evidence without letting earlier decisions influence you." },
      { title: "Check calculations before deciding", body: "Work out percentages, differences and totals rather than estimating. A small calculation error changes Yes to No." },
      { title: "Distinguish stated from suggested", body: "Yes means definitely supported by the evidence. A conclusion that the data merely makes likely but does not confirm receives No." },
      { title: "Separate correlation from causation", body: "If two things changed together, that does not prove one caused the other. Look for evidence of causation specifically." },
    ],
    errors: [
      "Applying a percentage to the wrong total — check which group forms the denominator.",
      "Treating correlation as causation: other factors may explain an association.",
      "Confusing averages with individual values — a mean does not describe every person.",
      "Claims extending beyond what was actually studied or measured.",
      "Calculations requiring information that is not given — if you need data that is absent, the answer is No.",
    ],
    passage: APPOINTMENTS_PASSAGE,
    workedQs: [
      {
        question: "Statement: Cardiology and Ophthalmology had the same attendance percentage. True or False?",
        steps: [
          { label: "Find Cardiology attendance rate", body: "Look up the Cardiology row: 216 attended out of 240 booked. Apply the formula: 216 ÷ 240 = 0.90 = 90% attendance rate." },
          { label: "Find Ophthalmology attendance rate", body: "Same method for Ophthalmology: 189 out of 210. 189 ÷ 210 = 0.90 = 90%. Same rate — despite having different raw numbers." },
          { label: "Compare", body: "Both are exactly 90%. Cardiology had more patients in total, but that's a larger raw number — not a higher rate. Rate and count are different things.", highlight: "Attendance percentage = Attended ÷ Booked × 100" },
          { label: "Decide", body: "The statement says 'same attendance percentage' — and both are exactly 90%. The data confirms it. Answer: Yes." },
        ],
        answer: "Yes",
        answerNote: "Both departments had exactly 90% attendance. This requires you to calculate, not estimate from raw numbers.",
        trap: "Cardiology had more total patients — do not assume a larger number means a higher rate.",
      },
      {
        question: "A university offered an optional study-skills workshop. Attendees scored a mean of 68% vs 62% among non-attendees. Attendees also had higher entry grades. Statement: The workshop caused the six-percentage-point difference. True or False?",
        passage: `A university offered an optional study-skills workshop to first-year students. Of 600 students, 180 attended.

At the end of term, attendees had a mean examination score of 68%, compared with 62% among non-attendees. Workshop attendees had also achieved higher entry grades before university. Students chose for themselves whether to attend.

The university surveyed 120 workshop attendees. Ninety replied, and 72 respondents said the workshop had been useful.`,
        steps: [
          { label: "Identify the evidence", body: "Attendees scored 68% on average vs 62% for non-attendees. That is a 6-point difference.", highlight: "mean examination score of 68%, compared with 62%" },
          { label: "Look for confounding factors", body: "Attendees already had higher entry grades. Students self-selected — those who attended may be more motivated.", highlight: "higher entry grades before university" },
          { label: "Ask: was causation established?", body: "Self-selection means the groups were different before the workshop. Causation requires ruling out alternative explanations.", highlight: "Students chose for themselves whether to attend" },
          { label: "Decide", body: "The difference is stated, but causation is not established." },
        ],
        answer: "No",
        answerNote: "Higher entry grades and self-selection are alternative explanations. The passage does not establish that the workshop caused the difference.",
        trap: "The 6-point gap is real, but 'caused by' is a much stronger claim than 'associated with'.",
      },
    ],
    practice: [
      {
        passage: APPOINTMENTS_PASSAGE,
        question: "Which statement is supported by the data?",
        opts: [
          "Neurology had the highest attendance percentage",
          "Dermatology had 27 missed appointments",
          "Ophthalmology had the longest average wait",
          "More than 700 patients attended across all four departments",
        ],
        cor: 1,
        explanation: "Dermatology: 180 booked − 153 attended = 27 missed. Option A is wrong — Cardiology and Ophthalmology had 90% vs Neurology's 132/150 = 88%. Option C is wrong — Neurology had the longest wait (35 min). Option D: 216+153+132+189 = 690, which is not more than 700.",
      },
      {
        passage: `A company allowed 120 employees to work from home two days each week for six months. Average completed cases rose from 18 to 20 per week. Absence fell from 3.2 to 2.7 days per employee. Managers reported some collaborative tasks took longer. Eighty-four participants completed a voluntary survey; 63 said they preferred the new arrangement.`,
        question: "Which conclusion is supported?",
        opts: [
          "Every employee completed more cases during the trial",
          "The trial proves homeworking caused the reduction in absence",
          "Seventy-five per cent of survey respondents preferred the arrangement",
          "Collaborative tasks always take longer when working from home",
        ],
        cor: 2,
        explanation: "63 ÷ 84 = 75% — this is directly calculable from the data. Option A is wrong because only the average is stated. Option B is wrong because other factors may explain the absence change. Option D over-generalises: managers reported 'some' tasks took longer, not 'always'.",
      },
      {
        passage: `Recycling scheme:
District | Households | Participating | Tonnes collected
North    |   8,000    |    5,600     |       420
East     |   6,500    |    4,875     |       390
South    |   9,000    |    5,850     |       468
West     |   7,500    |    5,250     |       350`,
        question: "Which statement must be true?",
        opts: [
          "East had the highest participation percentage",
          "North and West had the same participation percentage",
          "South collected fewer tonnes than North and East combined",
          "More than 22,000 households participated overall",
        ],
        cor: 1,
        explanation: "North: 5,600/8,000 = 70%. West: 5,250/7,500 = 70%. Equal percentages. Option A is wrong — East: 4,875/6,500 = 75%, which is highest. Option C is wrong — South collected 468 vs North+East = 420+390 = 810. Option D: total participation = 5,600+4,875+5,850+5,250 = 21,575, not more than 22,000.",
      },
    ],
  },

  {
    key: "logic-puzzles",
    label: "Logic Puzzles",
    tagline: "Satisfy multiple ordering, matching and grouping constraints simultaneously",
    format: "mcq",
    rules: [
      { title: "Convert rules into slots or a grid", body: "Draw positions (1–5, Mon–Fri) or a matching table before working any options. Never try to hold the puzzle mentally." },
      { title: "Place fixed information first", body: "Any rule that fixes an item to one specific position is certainty — enter it immediately before testing anything else." },
      { title: "Build blocks for linked items", body: "Rules saying 'A is immediately before B' create a fixed block AB. The block moves as a unit and reduces available positions." },
      { title: "For 'must', try to break options", body: "Test whether each option can be false in at least one valid arrangement. If it always holds, it must be true." },
      { title: "For 'could', find one valid arrangement", body: "Construct one complete arrangement that satisfies every rule and includes the option. One working example is enough." },
    ],
    errors: [
      "Placing items without checking every rule — use the full rule set, not just the most visible one.",
      "Forgetting that 'immediately before/after' restricts which positions a block can occupy.",
      "Testing options mentally rather than writing them out — errors accumulate quickly.",
      "Selecting 'could be true' options when the question asks what 'must be true'.",
      "Ignoring unused positions: if four items are placed, the fifth has only one slot left.",
    ],
    passage: TALKS_PASSAGE,
    workedQs: [
      {
        question: "Which talk must be on Monday?",
        steps: [
          { label: "Enter fixed rules", body: "L = Wednesday. Draw: Mon | Tue | Wed(L) | Thu | Fri", highlight: "L is on Wednesday" },
          { label: "Build the JM block", body: "J is immediately before M, so they form the block JM and must occupy consecutive positions.", highlight: "J is immediately before M" },
          { label: "Exclude JM positions", body: "JM cannot be Tue–Wed or Wed–Thu (L blocks Wednesday). JM cannot be Thu–Fri because K must still precede N and needs room. Therefore JM must occupy Mon–Tue.", highlight: "K is not on Monday" },
          { label: "Place remaining items", body: "K and N must fill Thu and Fri with K before N: K=Thu, N=Fri. Board: Mon(J) Tue(M) Wed(L) Thu(K) Fri(N).", highlight: "N is later than K" },
        ],
        answer: "J",
        answerNote: "The JM block is forced to Monday–Tuesday once every other position is eliminated.",
        trap: "It may look like J or M could go elsewhere, but the L-fixed Wednesday and the K-before-N requirement leave only one valid slot for the block.",
      },
      {
        question: "Four researchers — Amina, Ben, Cara and Dev — each study one subject: birds, fish, insects or plants. Amina: not birds or fish. Ben: plants. Cara: not insects. Dev: birds. What does Amina study?",
        passage: `Four researchers — Amina, Ben, Cara and Dev — each study one subject: birds, fish, insects or plants.
Rules:
• Amina does not study birds or fish.
• Ben studies plants.
• Cara does not study insects.
• Dev studies birds.`,
        steps: [
          { label: "Assign certainties first", body: "Ben = plants. Dev = birds. These are fixed.", highlight: "Ben studies plants" },
          { label: "Determine what remains", body: "Fish and insects are the only subjects left for Amina and Cara.", highlight: "Dev studies birds" },
          { label: "Apply Amina's restriction", body: "Amina cannot study birds (taken) or fish (excluded by rule). That leaves insects.", highlight: "Amina does not study birds or fish" },
          { label: "Confirm Cara", body: "Cara cannot study insects, so she must study fish. Every rule is satisfied.", highlight: "Cara does not study insects" },
        ],
        answer: "Insects",
        answerNote: "Once plants and birds are assigned, fish is excluded for Amina, leaving only insects.",
        trap: "Reading the rules in the order given rather than placing fixed items first wastes time.",
      },
    ],
    practice: [
      {
        passage: TALKS_PASSAGE,
        question: "Which arrangement could be correct?",
        opts: [
          "J, M, L, K, N",
          "K, J, L, M, N",
          "N, K, L, J, M",
          "J, K, L, N, M",
        ],
        cor: 0,
        explanation: "Option A: J(Mon), M(Tue), L(Wed), K(Thu), N(Fri). Check: L=Wed ✓, N after K ✓, J immediately before M ✓, K not Monday ✓. Valid. Option B: K is Monday but rule says K is not Monday. Option C: N is before K which violates N later than K. Option D: N is before M but J must be immediately before M, and N must come after K — this would separate JM.",
      },
      {
        passage: `A committee of three is selected from A, B, C, D and E.
Rules:
• If A is selected, B must be selected.
• C and D cannot both be selected.
• E must be selected.`,
        question: "Which committee could be selected?",
        opts: [
          "A, C, E",
          "A, B, E",
          "B, C, D",
          "C, D, E",
        ],
        cor: 1,
        explanation: "Option B: A requires B (both present ✓), E is included ✓, C and D are not both selected ✓. Valid. Option A: A requires B but B is missing. Option C: Contains B without A — B can only be selected when A is selected (the rule works both ways here). Option D: Both C and D are selected, which violates rule 2.",
      },
      {
        passage: `Four classes — Art, Biology, Chemistry and Drama — take place at 9, 10, 11 and 12.
Rules:
• Biology is earlier than Chemistry.
• Drama is at 10.
• Art is not at 9.
• Chemistry is at 12.`,
        question: "When is Biology scheduled?",
        opts: ["9 only", "10 only", "11 only", "Either 9 or 11"],
        cor: 0,
        explanation: "Drama occupies slot 10. Chemistry occupies slot 12. Art cannot be at 9. That leaves Biology and Art for slots 9 and 11. Since Art is not at 9, Art must be at 11 and Biology must be at 9. Schedule: Biology(9), Drama(10), Art(11), Chemistry(12).",
      },
    ],
  },

  {
    key: "arguments",
    label: "Arguments & Assumptions",
    tagline: "Identify the strongest argument and the hidden assumption behind it",
    format: "mcq",
    rules: [
      { title: "Judge relevance first", body: "A strong argument must answer the exact question posed. An argument about a different issue — however true — is weak." },
      { title: "Look for a significant consequence", body: "A strong argument describes an important impact: safety, access, cost, effectiveness. Trivial or cosmetic reasons are weak." },
      { title: "Require a direct logical link", body: "There must be a clear causal connection between the proposal and the stated reason. Without it, the argument is unsupported." },
      { title: "Reject extreme or absolute claims", body: "Arguments using words like 'every', 'always', 'never', 'all' are usually unsupported absolutes. Qualify carefully." },
      { title: "For assumptions, find what must be true", body: "An assumption is an unstated belief required for the argument to work. If it is false, the argument collapses. Choose the assumption that is necessary, not merely helpful." },
    ],
    errors: [
      "Choosing an argument because it sounds reasonable or agreeable — judge logic, not personal preference.",
      "Selecting an argument that addresses a related but different issue.",
      "Accepting a statistic as strong without checking whether it directly supports the proposal.",
      "Confusing a helpful assumption with a necessary one — the argument must fall apart without it.",
      "Choosing extreme options ('every patient', 'all students') that over-claim.",
      "Selecting circular reasoning where the reason merely restates the proposal.",
    ],
    passage: CYCLE_PASSAGE,
    workedQs: [
      {
        question: "Which option is the strongest argument for protected cycle lanes?",
        steps: [
          { label: "Test option A", body: "Bicycles being available in many colours has no connection to the safety or viability of cycle lanes. Irrelevant — eliminate.", highlight: "bicycles are available in many colours" },
          { label: "Test option B", body: "Collision records directly link the current road design to a significant harm (injuries). The proposal (protected lanes) would address this specific problem. Relevant, significant, causally linked.", highlight: "collision records show that cyclists are frequently injured" },
          { label: "Test option C", body: "Some people disliking cycling does not address whether lanes should exist for those who do cycle. Wrong group — eliminate.", highlight: "some people dislike cycling" },
          { label: "Test option D", body: "'Roads were invented before modern bicycles' — historical trivia with no bearing on current safety or design.", highlight: "roads were invented before modern bicycles" },
        ],
        answer: "B",
        answerNote: "Option B provides direct evidence of significant harm connected to the proposal. Every other option is irrelevant or trivial.",
        trap: "Option C sounds like a counterargument but it addresses a different population (non-cyclists) rather than the safety of those who use the road.",
      },
      {
        question: "Argument: The school should offer a later bus because this would allow more pupils to attend after-school clubs. Which assumption is required for this argument to work?",
        passage: `Argument: The school should offer a later bus because this would allow more pupils to attend after-school clubs.

Options:
A. Every pupil enjoys clubs.
B. Some pupils currently cannot attend clubs because they lack transport home.
C. The school bus is more comfortable than all other transport.
D. Teachers should be required to run clubs daily.`,
        steps: [
          { label: "Identify the argument's logic", body: "Later bus → more pupils attend clubs. The argument assumes there is a current barrier preventing pupils from attending.", highlight: "allow more pupils to attend after-school clubs" },
          { label: "Test option B", body: "If no pupils are prevented from attending by transport, a later bus would not increase attendance. The argument collapses without B.", highlight: "Some pupils currently cannot attend clubs because they lack transport home" },
          { label: "Test option A", body: "'Every pupil enjoys clubs' — unnecessary. Even if only some pupils enjoy clubs, a later bus could still help those who do but currently can't attend.", highlight: "Every pupil enjoys clubs" },
          { label: "Test options C and D", body: "Bus comfort and teacher requirements are entirely separate from the argument's logic. Neither is needed.", highlight: "Teachers should be required to run clubs daily" },
        ],
        answer: "B",
        answerNote: "If transport is not the barrier, a later bus has no effect on attendance. Option B is the necessary assumption.",
        trap: "Option A sounds logical but goes further than required — the argument only needs some pupils to be blocked by transport.",
      },
    ],
    practice: [
      {
        passage: `Question: Should supermarkets donate safe unsold food to charities?

A. Yes, because food packaging is often colourful.
B. Yes, because donation could reduce waste while supplying food to people who need it.
C. No, because some supermarkets sell clothes.
D. No, because charities existed before supermarkets.`,
        question: "Which is the strongest argument?",
        opts: [
          "A — food packaging is colourful",
          "B — reduces waste and supplies food to those who need it",
          "C — some supermarkets sell clothes",
          "D — charities existed before supermarkets",
        ],
        cor: 1,
        explanation: "Option B directly addresses the proposal with two significant consequences: waste reduction and food access. Options A, C and D are all irrelevant to the question of food donation.",
      },
      {
        passage: `Question: Should a council require new large offices to provide secure cycle storage?

A. Yes, because secure storage removes one practical barrier to cycling to work.
B. Yes, because bicycles have two wheels.
C. No, because some people live outside the council area.
D. No, because every office worker prefers driving.`,
        question: "Which is the strongest argument?",
        opts: [
          "A — removes a practical barrier to cycling",
          "B — bicycles have two wheels",
          "C — some people live outside the area",
          "D — every office worker prefers driving",
        ],
        cor: 0,
        explanation: "Option A identifies a specific mechanism (removing a practical barrier) that directly connects the proposal to a beneficial outcome. Option B is irrelevant. Option C addresses a different population. Option D is an unsupported absolute claim.",
      },
      {
        passage: `Argument: Installing brighter lighting will increase use of the park after sunset because visitors currently avoid it when it is dark.

Which assumption is required for this argument to work?`,
        question: "Which is the necessary assumption?",
        opts: [
          "Visitors who avoid the park because of darkness would use it if the lighting improved",
          "Everyone prefers visiting parks at midnight",
          "Brighter lighting has no cost",
          "The park contains no trees",
        ],
        cor: 0,
        explanation: "The argument relies on darkness being the reason for avoidance and improved lighting solving it. Option A is the exact bridge the argument needs. Option B is an over-claim. Options C and D are irrelevant to the argument's core logic.",
      },
    ],
  },

  {
    key: "venn",
    label: "Venn Diagrams",
    tagline: "Track set membership, overlaps and complements using labelled regions",
    format: "mcq",
    rules: [
      { title: "Translate set language before drawing", body: "'All A are B' means the A circle sits entirely inside B. 'No A are B' means separate circles. 'Some A are B' means an occupied overlap — draw it." },
      { title: "Fill intersections first", body: "In multi-set questions, fill the innermost (most specific) region before working outward. This prevents double-counting." },
      { title: "Subtract the overlap when combining totals", body: "A union B = A + B − (A and B). The overlap is counted in both totals, so subtract it once." },
      { title: "Find 'neither' from the outside", body: "Neither = total − union. Calculate the union first, then subtract from the grand total." },
      { title: "Check whether overlaps exist", body: "A visually overlapping diagram does not prove members exist in the overlap. Look for explicit numbers, dots or existential statements." },
    ],
    errors: [
      "Counting the intersection twice when calculating the union.",
      "Reversing a subset relationship — 'all doctors are surgeons' places doctors inside surgeons, not surgeons inside doctors.",
      "Forgetting those outside every set when finding 'neither'.",
      "Assuming all diagrammatic regions contain members just because they overlap on paper.",
      "Using pairwise overlaps that include the triple overlap without subtracting it first in three-set questions.",
    ],
    passage: COFFEE_PASSAGE,
    workedQs: [
      {
        question: "How many people drink neither tea nor coffee?",
        vennData: { kind: "venn2" as const, labelA: "Tea", labelB: "Coffee", onlyA: 46, both: 22, onlyB: 32, neither: 20, total: 120 },
        steps: [
          { label: "Calculate the union", body: "To count everyone who drinks tea OR coffee: add both groups, then subtract the overlap once. Those 22 get counted in both totals, so subtract them: 68 + 54 − 22 = 100.", highlight: "22 drink both tea and coffee" },
          { label: "Find neither", body: "If 100 people drink tea or coffee, the remaining people drink neither. Work from the total: 120 − 100 = 20 people drink neither.", highlight: "Total surveyed: 120" },
          { label: "Check", body: "Verify all four regions sum to 120: tea only (46) + coffee only (32) + both (22) + neither (20) = 120. Matches the total — all regions accounted for.", highlight: "68 drink tea" },
        ],
        answer: "20",
        answerNote: "Always subtract the overlap exactly once when building the union, then subtract from the total.",
        trap: "Adding 68+54 without subtracting 22 gives 122, which exceeds the total of 120.",
      },
      {
        question: "Of 120 patients: 50 take medicine A, 44 take B, 38 take C. Pairwise overlaps: A and B = 18, A and C = 14, B and C = 12. All three = 6. How many take A only?",
        vennData: { kind: "venn3" as const, labelA: "Med A", labelB: "Med B", labelC: "Med C", onlyA: 24, onlyB: 20, onlyC: 18, ab: 12, ac: 8, bc: 6, abc: 6, neither: 26, total: 120 },
        passage: `Of 120 patients:
• 50 take medicine A
• 44 take medicine B
• 38 take medicine C
• 18 take A and B (including those taking all three)
• 14 take A and C (including those taking all three)
• 12 take B and C (including those taking all three)
• 6 take all three

Formula for 'only A': A − (A∩B only) − (A∩C only) − (A∩B∩C)`,
        steps: [
          { label: "Find pairwise-only overlaps", body: "The 18 who take A and B include some who also take C. Subtract the triple-overlap to get A∩B only: 18 − 6 = 12. Same for A∩C only: 14 − 6 = 8.", highlight: "18 take A and B" },
          { label: "Calculate A only", body: "Start with all 50 taking A. Remove those who also take B (12), those who also take C (8), and those in all three (6): 50 − 12 − 8 − 6 = 24 take A alone.", highlight: "50 take medicine A" },
          { label: "Verify logic", body: "Always fill the innermost region (all three = 6) before working outward to pairwise, then solo. This stops you counting the same patient twice.", highlight: "6 take all three" },
        ],
        answer: "24",
        answerNote: "Fill the most specific region (all three) first, then work outward to pairwise-only, then single-set-only.",
        trap: "Using 18 and 14 directly without subtracting the all-three value of 6 would double-count the triple overlap.",
      },
    ],
    practice: [
      {
        passage: `A survey of 200 commuters:
• 110 use buses
• 90 use trains
• 55 use both buses and trains`,
        vennData: { kind: "venn2" as const, labelA: "Buses", labelB: "Trains", onlyA: 55, both: 55, onlyB: 35, neither: 55, total: 200 },
        question: "How many commuters use buses only?",
        opts: ["35", "55", "65", "110"],
        cor: 1,
        explanation: "Buses only = Total bus users − Those using both = 110 − 55 = 55. Options 35 is trains only (90−55). Option 65 would be incorrect arithmetic. Option 110 includes those using both.",
      },
      {
        passage: `In a group of 90 students:
• 52 study Biology
• 41 study Chemistry
• 18 study both Biology and Chemistry`,
        vennData: { kind: "venn2" as const, labelA: "Biology", labelB: "Chemistry", onlyA: 34, both: 18, onlyB: 23, neither: 15, total: 90 },
        question: "How many students study Biology only?",
        opts: ["18", "23", "34", "70"],
        cor: 2,
        explanation: "Biology only = 52 − 18 = 34. The 18 studying both are subtracted because they appear in the Biology total but study more than Biology alone.",
      },
      {
        passage: `Which Venn diagram description matches these rules?
• No poets are accountants.
• Some teachers are poets.
• Some teachers are accountants.`,
        question: "Which description is correct?",
        opts: [
          "Poets and accountants overlap completely",
          "Poets and accountants are separate; teachers overlap both",
          "Teachers are completely inside poets",
          "All three sets are entirely separate",
        ],
        cor: 1,
        explanation: "Rule 1 requires poets and accountants to have no overlap. Rules 2 and 3 require teachers to overlap each of the other two circles. Option A contradicts rule 1. Option C is too strong (only some teachers are poets). Option D contradicts rules 2 and 3.",
      },
    ],
  },

  {
    key: "probability",
    label: "Probability",
    tagline: "Calculate single-event, combined and conditional probabilities",
    format: "mcq",
    rules: [
      { title: "P(event) = favourable ÷ total", body: "Count the outcomes you want and divide by all possible outcomes. Ensure all outcomes are equally likely." },
      { title: "'And' usually means multiply", body: "For two independent events both occurring, multiply their individual probabilities. For dependent events (without replacement), adjust the denominator after each selection." },
      { title: "'Or' usually means add, then subtract overlap", body: "P(A or B) = P(A) + P(B) − P(A and B). If the events are mutually exclusive, the overlap is zero." },
      { title: "Use complement for 'at least one'", body: "P(at least one) = 1 − P(none). It is usually easier to calculate the probability of the complementary event." },
      { title: "Expected frequency = probability × trials", body: "Multiply the probability by the number of trials to find how many times an event is expected to occur. This is an expectation, not a guarantee." },
    ],
    errors: [
      "Treating dependent events (without replacement) as independent.",
      "Adding probabilities for 'and' events — multiply instead.",
      "Forgetting that the denominator shrinks in without-replacement scenarios.",
      "Using the complement incorrectly — the complement is 1 minus the probability of the event NOT occurring.",
      "Assuming a small sample must match the expected frequency exactly.",
      "Confusing probability (a proportion) with expected frequency (a count).",
    ],
    passage: COUNTERS_PASSAGE,
    workedQs: [
      {
        question: "Two counters are selected without replacement. What is the probability that both are blue?",
        steps: [
          { label: "First selection", body: "3 blue counters in a bag of 8. P(first pick is blue) = 3 ÷ 8 = 3/8. Simple: favourable outcomes ÷ total possible outcomes.", highlight: "3 blue counters (8 total)" },
          { label: "Adjust for without replacement", body: "The first counter isn't put back. Now the bag has 7 counters left and only 2 are blue. P(second is blue) = 2/7 — the numbers change with each pick.", highlight: "Two counters are selected without replacement" },
          { label: "Multiply", body: "For BOTH events to happen, multiply the probabilities: 3/8 × 2/7 = 6/56 = 3/28. 'And' in probability means multiply — not add.", highlight: "P(A and B) = P(A) × P(B after A removed)" },
        ],
        answer: "3/28",
        answerNote: "The denominator changes after the first selection because the total pool decreases.",
        trap: "Using 3/8 × 3/8 = 9/64 treats the events as independent (with replacement). Always check whether items are replaced.",
      },
      {
        question: "A treatment is effective for 70% of patients. If 240 patients receive it, how many are expected to benefit?",
        steps: [
          { label: "Convert percentage to decimal", body: "70% = 0.70" },
          { label: "Multiply by number of trials", body: "Expected frequency = 0.70 × 240 = 168." },
          { label: "Interpret carefully", body: "168 is the expected number, not a guarantee. Some variation around this figure is normal." },
        ],
        answer: "168 patients",
        answerNote: "Expected frequency = probability × total trials.",
        trap: "Expected frequency is an average over many trials, not a precise prediction for this specific group of 240.",
      },
    ],
    practice: [
      {
        passage: COUNTERS_PASSAGE,
        question: "One counter is selected at random. What is the probability it is NOT red?",
        opts: ["3/8", "5/8", "3/5", "5/3"],
        cor: 0,
        explanation: "There are 3 blue counters and 8 total. P(not red) = P(blue) = 3/8. Alternatively: P(not red) = 1 − P(red) = 1 − 5/8 = 3/8.",
      },
      {
        passage: `A fair coin is tossed twice.
P(tail on one flip) = 1/2.`,
        question: "What is the probability of getting at least one head?",
        opts: ["1/4", "1/2", "3/4", "1"],
        cor: 2,
        explanation: "Use the complement: P(at least one head) = 1 − P(no heads) = 1 − P(tail and tail) = 1 − (1/2 × 1/2) = 1 − 1/4 = 3/4.",
      },
      {
        passage: `A disease affects 2% of a population. A diagnostic test correctly identifies 95% of people who have the disease but also gives a positive result to 5% of people who do not have it.`,
        question: "Which statement about this test is correct?",
        opts: [
          "Everyone who tests positive has the disease",
          "A positive result guarantees a 95% chance of disease",
          "Some positive results will occur in people without the disease",
          "The test never misses a person with the disease",
        ],
        cor: 2,
        explanation: "The 5% false-positive rate means that some disease-free people will receive positive results. Option A is wrong because of false positives. Option B confuses the sensitivity (95%) with positive predictive value. Option D is wrong because the 95% sensitivity means 5% of true cases are missed.",
      },
    ],
  },
];

export function getSubtype(key: string): DMSubtype | undefined {
  return DM_SUBTYPES.find(s => s.key === key);
}
