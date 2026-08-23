import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envRaw = fs.readFileSync(path.join(__dirname,"../.env.local"),"utf8");
const getEnv = k => { const m = envRaw.match(new RegExp(`^${k}=(.+)$`,"m")); return m?m[1].trim():""; };
const URL = getEnv("NEXT_PUBLIC_SUPABASE_URL") + "/rest/v1";
const KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");
const H = { "Content-Type": "application/json", apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: "return=representation" };

async function post(table, body) {
  const r = await fetch(`${URL}/${table}`, { method: "POST", headers: H, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(j));
  return Array.isArray(j) ? j[0] : j;
}

const questions = [
  // ── YN-5 blocks ──────────────────────────────────────────────────────────
  {
    type: "yn5",
    stimulus: "All researchers are graduates.\nSome graduates are musicians.\nNo musician is a surgeon.\nSome surgeons are researchers.",
    statements: ["Some researchers are not musicians.","No researcher is a musician.","Some graduates are surgeons.","Some musicians are not researchers.","Some surgeons are graduates."],
    correct_answer: "Y,N,Y,N,Y",
    difficulty: "Gold", topic: "Syllogistic Reasoning",
    walkthrough: "Start with the strongest chain: Researchers → Graduates. We are also told that no Musician is a Surgeon, and that some Surgeons are Researchers. Those Surgeon–Researchers must therefore also be Graduates and cannot be Musicians. → Statement 1 YES. → Statement 2 NO. → Statement 3 YES: some Surgeons are Researchers and all Researchers are Graduates. → Statement 4 NO. → Statement 5 YES."
  },
  {
    type: "yn5",
    stimulus: "No ceramic objects are flexible.\nAll items in Box A are ceramic objects.\nSome museum exhibits are in Box A.\nAll flexible objects are modern.",
    statements: ["No item in Box A is flexible.","Some museum exhibits are not flexible.","No modern object is ceramic.","Some modern objects are not in Box A.","Some ceramic objects are museum exhibits."],
    correct_answer: "Y,Y,N,N,Y",
    difficulty: "Gold", topic: "Syllogistic Reasoning",
    walkthrough: "Box A → Ceramic. Ceramic and Flexible cannot overlap. Flexible → Modern. Some Museum Exhibits are in Box A. → S1 YES: Box A items are Ceramic so cannot be Flexible. → S2 YES: those exhibits are in Box A and therefore not Flexible. → S3 NO: Flexible → Modern doesn't mean Modern → Flexible. → S4 NO: no guarantee any Flexible objects exist. → S5 YES: some exhibits are in Box A and everything in Box A is Ceramic."
  },
  {
    type: "yn5",
    stimulus: "All planets in System X have atmospheres.\nNo object with an atmosphere is smaller than Object Q.\nSome moons are smaller than Object Q.\nNo moons are planets.",
    statements: ["No moon smaller than Object Q is a planet.","All planets are larger than Object Q.","Some objects without atmospheres are moons.","No planet is smaller than Object Q.","Some moons do not have atmospheres."],
    correct_answer: "Y,N,Y,Y,Y",
    difficulty: "Diamond", topic: "Syllogistic Reasoning",
    walkthrough: "Planet → Atmosphere → not smaller than Q. → S1 YES: no Moon is a Planet (stated). → S2 NO: 'not smaller' ≠ 'larger than'. → S3 YES: moons smaller than Q cannot have atmospheres. → S4 YES: every Planet has atmosphere so cannot be smaller than Q. → S5 YES: smaller Moons have no atmospheres."
  },
  {
    type: "yn5",
    stimulus: "Some architects are historians.\nEvery historian reads Latin.\nNo person who reads Latin is monolingual.\nSome monolingual people are architects.",
    statements: ["Some architects are not monolingual.","No historian is monolingual.","Some architects read Latin.","All architects speak more than one language.","Some people who are not historians are architects."],
    correct_answer: "Y,Y,Y,N,Y",
    difficulty: "Gold", topic: "Syllogistic Reasoning",
    walkthrough: "Historian → Latin Reader → not Monolingual. → S1 YES: Architect–Historians read Latin and cannot be Monolingual. → S2 YES: every Historian reads Latin and no Latin Reader is Monolingual. → S3 YES: some Architects are Historians and all Historians read Latin. → S4 NO: some Monolingual people are Architects so not all speak multiple languages. → S5 YES: Monolingual Architects cannot be Historians."
  },
  {
    type: "yn5",
    stimulus: "All amber objects in the collection are valuable.\nSome valuable objects are insured.\nAll publicly displayed objects are insured.\nSome amber objects are publicly displayed.",
    statements: ["Some amber objects are insured.","All publicly displayed objects are insured.","Some valuable objects are publicly displayed.","Every insured object is valuable.","No amber object is uninsured."],
    correct_answer: "Y,Y,Y,N,N",
    difficulty: "Gold", topic: "Syllogistic Reasoning",
    walkthrough: "Amber → Valuable. Publicly Displayed → Insured. Some Amber are Publicly Displayed. → S1 YES. → S2 YES (stated). → S3 YES: displayed Amber are Valuable. → S4 NO: Insured objects need not be Valuable. → S5 NO: only some Amber are known insured."
  },

  // ── MCQ ──────────────────────────────────────────────────────────────────
  {
    type: "mcq", topic: "Interpreting Information", difficulty: "Gold",
    stimulus: "A hospital uses the following rules:\n- All patients admitted before 08:00 are assessed by Team A.\n- Patients assessed by Team A who require imaging are transferred to Unit 3.\n- No patient in Unit 3 is discharged before imaging is completed.\n\nMaya was admitted at 07:45 and discharged at 11:30.",
    question: "Which statement must be true?",
    options: ["Maya required imaging.","Maya was assessed by Team A.","Maya was transferred to Unit 3.","Maya's imaging was completed before 11:30."],
    correct: "B",
    walkthrough: "07:45 is before 08:00, so Team A rule applies directly. B is correct. A is unproven (no mention of imaging). C requires imaging which is unknown. D requires Unit 3 transfer which is also unknown."
  },
  {
    type: "mcq", topic: "Interpreting Information", difficulty: "Gold",
    stimulus: "A university scholarship uses these rules:\n- Applicants must have either an academic score above 80 or a research score above 70.\n- Anyone with a disciplinary warning is ineligible.\n- Applicants exceeding both score thresholds receive priority.\n- Priority does not guarantee selection.\n\nLena has an academic score of 84, a research score of 68 and no disciplinary warning.",
    question: "Which statement is correct?",
    options: ["Lena is guaranteed a scholarship.","Lena is eligible but does not receive priority.","Lena is ineligible because her research score is below 70.","Lena receives priority because one score exceeds its threshold."],
    correct: "B",
    walkthrough: "Eligibility = Academic >80 OR Research >70. Lena's 84 satisfies eligibility. Priority = BOTH thresholds; Research 68 fails. → B. A wrong because priority ≠ guarantee. C treats OR as AND. D misreads priority rule."
  },
  {
    type: "mcq", topic: "Interpreting Information", difficulty: "Diamond",
    stimulus: "A train company states:\n- Express trains stop only at stations K, M and P.\n- Every non-express train stopping at P also stops at R.\n- Train 14 stops at P but does not stop at R.",
    question: "Which conclusion follows?",
    options: ["Train 14 must be an express train.","Train 14 must stop at K.","Train 14 must stop at M.","Train 14 stops only at P."],
    correct: "A",
    walkthrough: "Contrapositive: non-express + P → must stop at R. Train 14 stops at P but not R → cannot be non-express → must be express. B and C confuse 'stops only at' with 'stops at all of'. D is unsupported."
  },
  {
    type: "mcq", topic: "Interpreting Information", difficulty: "Gold",
    stimulus: "Four employees — Aria, Ben, Chloe and Dev — each work either remotely or in the office.\n- If Aria works remotely, Ben works in the office.\n- Chloe works remotely only if Dev works remotely.\n- Ben and Dev cannot both work remotely.\n- Ben works remotely.",
    question: "Which statement must be true?",
    options: ["Aria works remotely.","Dev works in the office.","Chloe works remotely.","Dev works remotely."],
    correct: "B",
    walkthrough: "Ben is remote. Ben and Dev cannot both be remote → Dev must be in office. B forced. A would force Ben into office (contradiction). C requires Dev to be remote (contradiction). D contradicts the Ben–Dev rule."
  },
  {
    type: "mcq", topic: "Interpreting Information", difficulty: "Gold",
    stimulus: "A clinical trial uses these rules:\n- Anyone under 18 is excluded.\n- Anyone aged 18–25 is included only if they have no prior treatment.\n- Anyone over 25 may be included regardless of prior treatment.\n\nNoor was included and had prior treatment.",
    question: "Which conclusion is justified?",
    options: ["Noor is over 25.","Noor is exactly 26.","Noor is at least 18 but may be 25.","Noor must have received treatment during the trial."],
    correct: "A",
    walkthrough: "Included → not under 18. Had prior treatment → cannot be 18–25. Only remaining category = over 25. A correct. B invents precision. C leaves open ages that prior-treatment rule rules out. D confuses prior with trial treatment."
  },
  {
    type: "mcq", topic: "Recognising Assumptions", difficulty: "Gold",
    stimulus: "A city is considering introducing a congestion charge in its centre. Supporters argue that the charge should be introduced because doing so will reduce traffic.",
    question: "Which assumption is required by the argument?",
    options: ["Everyone driving into the city can afford the charge.","At least some drivers would alter their behaviour because of the charge.","Public transport is cheaper than driving.","Congestion is caused exclusively by private cars."],
    correct: "B",
    walkthrough: "Mechanism: charge → behaviour change → fewer vehicles → less traffic. Without B the charge has no way to reduce traffic. A requires everyone to afford it (too strong). C is one possible reason to change behaviour but not the only one. D is far stronger than required."
  },
  {
    type: "mcq", topic: "Recognising Assumptions", difficulty: "Gold",
    stimulus: "A museum argues that it should remain open until 22:00 because visitor numbers increased after another museum extended its opening hours.",
    question: "Which fact would most weaken the argument?",
    options: ["The other museum also introduced heavily discounted evening admission when it extended its hours.","Museums contain objects requiring careful preservation.","Some visitors prefer visiting museums in the morning.","The museum has been open for more than fifty years."],
    correct: "A",
    walkthrough: "The argument assumes longer hours caused attendance gains. A gives an alternative cause (discounts). If discounts attracted visitors, the comparison is weak evidence for hours alone. B is irrelevant to attendance. C is compatible with additional evening visitors. D is irrelevant."
  },
  {
    type: "mcq", topic: "Recognising Assumptions", difficulty: "Gold",
    stimulus: "A university proposes recording all lectures. It argues that students who miss a lecture could watch it later, so academic performance would improve.",
    question: "Which assumption does the argument rely upon most strongly?",
    options: ["Students prefer videos to live teaching.","Missing teaching contributes to poorer academic performance for at least some students.","Every student occasionally misses lectures.","Recorded lectures are inexpensive to produce."],
    correct: "B",
    walkthrough: "Chain: missed lecture → lost learning → recordings allow recovery → performance improves. B is the essential link. Without it recordings cannot help performance. A unnecessary (any mode of catching up works). C too broad. D irrelevant to performance."
  },
  {
    type: "mcq", topic: "Recognising Assumptions", difficulty: "Diamond",
    stimulus: "A company argues that it should adopt a four-day working week because productivity per employee increased during a pilot programme.",
    question: "Which piece of evidence would most strengthen the proposal?",
    options: ["Employees reported liking the pilot.","Productivity remained higher for six months without an increase in overtime or staff turnover.","Competitors still use five-day working weeks.","The company reduced meetings during the pilot."],
    correct: "B",
    walkthrough: "B establishes durability (6 months) and rules out two confounds (overtime, turnover). A shows preference, not productivity. C irrelevant. D introduces a competing explanation that actually weakens the four-day-week claim."
  },
  {
    type: "mcq", topic: "Recognising Assumptions", difficulty: "Diamond",
    stimulus: "A library argues that it should purchase more electronic books because borrowing of printed books has fallen by 15%.",
    question: "Which fact would most weaken the argument?",
    options: ["Electronic books can be accessed remotely.","The library reduced its printed-book collection by 25% during the same period.","Some electronic books are more expensive than printed versions.","Younger users frequently own smartphones."],
    correct: "B",
    walkthrough: "The argument infers falling demand from falling borrowing. B provides an alternative: supply fell 25%, so a 15% drop in borrowing is expected — it doesn't imply preference shift. A and D support e-books. C raises cost but doesn't challenge the borrowing data interpretation."
  },
  {
    type: "mcq", topic: "Logic Puzzles", difficulty: "Gold",
    stimulus: "Five presentations — J, K, L, M and N — occur Monday to Friday, one per day.\n- J occurs before L.\n- K occurs immediately after L.\n- N occurs on Thursday.\n- M occurs on Friday.",
    question: "Which presentation must occur on Monday?",
    options: ["J","K","L","N"],
    correct: "A",
    walkthrough: "Thursday=N, Friday=M. Remaining: J, L, K for Mon–Wed. K must immediately follow L → L–K block is consecutive. J must precede L, so L cannot be Monday. Therefore L=Tuesday, K=Wednesday, J=Monday."
  },
  {
    type: "mcq", topic: "Logic Puzzles", difficulty: "Diamond",
    stimulus: "Five people — Priya, Quinn, Rosa, Sam and Tariq — sit in a row.\n- Quinn sits immediately to the left of Rosa.\n- Priya sits somewhere to the left of Quinn.\n- Tariq sits at one end.\n- Tariq sits immediately to the right of Rosa.\n- Sam does not sit next to Tariq.",
    question: "Which arrangement is possible?",
    options: ["Tariq – Priya – Quinn – Rosa – Sam","Priya – Quinn – Rosa – Sam – Tariq","Sam – Priya – Quinn – Rosa – Tariq","Tariq – Quinn – Rosa – Priya – Sam"],
    correct: "C",
    walkthrough: "Quinn–Rosa–Tariq is a fixed block. Tariq at an end → positions 3-4-5. Priya must precede Quinn → pos 1 or 2. Sam takes the other. Option C: Sam–Priya–Quinn–Rosa–Tariq satisfies all rules. A breaks R–T adjacency. B puts Sam next to Tariq. D breaks ordering."
  },
  {
    type: "mcq", topic: "Logic Puzzles", difficulty: "Diamond",
    stimulus: "Six tasks, A–F, must be completed.\n- A must occur before D.\n- B must occur before C.\n- D must occur before C.\n- C must occur before F.\n- E must occur after D.\n- F must occur before E.",
    question: "Which sequence is possible?",
    options: ["B, C, A, F, D, E","A, D, E, B, C, F","A, B, D, C, F, E","B, A, C, F, E, D"],
    correct: "C",
    walkthrough: "Required chain: A→D→C→F→E, with B before C. Option C: A,B,D,C,F,E satisfies all constraints. A puts C before D. B puts E before F. D puts C before D."
  },
  {
    type: "mcq", topic: "Logic Puzzles", difficulty: "Gold",
    stimulus: "Four rooms — W, X, Y and Z — each contain exactly one exhibit: Art, Biology, Computing or Design.\n- Art is in Z.\n- Design is in Y.\n- Biology is not in W or Z.\n- Computing is in a room alphabetically before Design.\n- X does not contain Computing.",
    question: "Which exhibit must be in X?",
    options: ["Art","Biology","Computing","Design"],
    correct: "B",
    walkthrough: "Z=Art, Y=Design. Computing must be alphabetically before Y → W or X. X cannot have Computing → W=Computing. Only exhibit left for X = Biology."
  },
  {
    type: "mcq", topic: "Logic Puzzles", difficulty: "Diamond",
    stimulus: "A courier visits exactly four of five locations: P, Q, R, S and T.\n- If P is visited, Q is visited.\n- If Q is visited, S is visited.\n- If R is visited, S is not visited.\n- T is always visited.",
    question: "Which location must be omitted?",
    options: ["P","Q","R","S"],
    correct: "C",
    walkthrough: "If R visited → S omitted. Need 4 locations + T compulsory → must include P,Q,R,T. But Q forces S → contradiction. So R cannot be visited. P,Q,S,T works: P→Q→S, T present. R must be omitted."
  },
  {
    type: "mcq", topic: "Venn Diagrams", difficulty: "Gold",
    stimulus: "A three-set Venn diagram shows club membership.\nA only: 18  |  B only: 12  |  C only: 16\nA∩B only: 7  |  A∩C only: 5  |  B∩C only: 9\nA∩B∩C: 4  |  None: 9",
    question: "How many people belong to A or B, but not both, regardless of whether they belong to C?",
    options: ["37","40","44","48"],
    correct: "C",
    walkthrough: "A or B but not both = exactly one of A,B. Include A-only(18) + A∩C-only(5) + B-only(12) + B∩C-only(9). Exclude A∩B-only(7) and A∩B∩C(4). Total = 18+5+12+9 = 44."
  },
  {
    type: "mcq", topic: "Venn Diagrams", difficulty: "Gold",
    stimulus: "A Venn diagram represents four sets.\n- Set R lies completely inside Set P.\n- Set R does not overlap Set Q.\n- Set P and Set Q overlap.\n- Set S lies entirely inside the overlap of P and Q.",
    question: "Which statement must be true?",
    options: ["Some members of R are members of Q.","Every member of S is a member of P.","No member of P is a member of Q.","Every member of Q belongs to S."],
    correct: "B",
    walkthrough: "S lies inside P∩Q, so every member of S belongs to P and Q. B must be true. A contradicts R being disjoint from Q. C contradicts P and Q overlapping. D reverses S⊂Q into Q⊂S."
  },
  {
    type: "mcq", topic: "Venn Diagrams", difficulty: "Gold",
    stimulus: "In a group of 80 students:\n- 46 study Biology, 38 study Chemistry, 27 study Physics.\n- 20 study both Biology and Chemistry.\n- 14 study both Biology and Physics.\n- 12 study both Chemistry and Physics.\n- 7 study all three.\n(Pairwise figures include those who study all three.)",
    question: "How many students study Biology only?",
    options: ["12","19","26","33"],
    correct: "B",
    walkthrough: "All three = 7. Bio∩Chem only = 20−7 = 13. Bio∩Phys only = 14−7 = 7. Bio only = 46−13−7−7 = 19."
  },
  {
    type: "mcq", topic: "Venn Diagrams", difficulty: "Gold",
    stimulus: "In a company:\n- 72 employees use software A.\n- 65 employees use software B.\n- 30 employees use both A and B.",
    question: "How many employees use A or B, but not both?",
    options: ["69","77","85","99"],
    correct: "B",
    walkthrough: "A only = 72−30 = 42. B only = 65−30 = 35. Exactly one = 42+35 = 77."
  },
  {
    type: "mcq", topic: "Venn Diagrams", difficulty: "Gold",
    stimulus: "Of 100 patients:\n- 62 have symptom X.\n- 51 have symptom Y.\n- 23 have neither symptom.",
    question: "How many patients have both X and Y?",
    options: ["13","28","36","49"],
    correct: "C",
    walkthrough: "At least one symptom = 100−23 = 77. Inclusion–exclusion: 77 = 62+51−both → both = 113−77 = 36."
  },
  {
    type: "mcq", topic: "Statistical Reasoning", difficulty: "Gold",
    stimulus: "A disease affects 4% of a population. A diagnostic test has 90% sensitivity and 95% specificity. Consider a population of 10,000 people.",
    question: "Approximately how many people who test positive actually have the disease?",
    options: ["360","480","840","1,000"],
    correct: "A",
    walkthrough: "400 have disease. 90% sensitivity → 360 true positives. 9,600 disease-free; 5% false positive → 480 false positives. 840 total positives. Question asks for true positives = 360."
  },
  {
    type: "mcq", topic: "Statistical Reasoning", difficulty: "Gold",
    stimulus: "A bag contains 5 red counters, 4 blue counters and 3 green counters. Two counters are selected without replacement.",
    question: "What is the probability that both counters are the same colour?",
    options: ["19/66","23/66","29/66","1/3"],
    correct: "A",
    walkthrough: "Total pairs = C(12,2) = 66. Red: C(5,2)=10. Blue: C(4,2)=6. Green: C(3,2)=3. Favourable = 19. P = 19/66."
  },
  {
    type: "mcq", topic: "Statistical Reasoning", difficulty: "Gold",
    stimulus: "A treatment succeeds in 70% of patients. Four independent patients receive the treatment.",
    question: "What is the probability that exactly three patients respond successfully?",
    options: ["0.2401","0.3430","0.4116","0.6517"],
    correct: "C",
    walkthrough: "P(exactly 3) = C(4,3) × 0.7³ × 0.3 = 4 × 0.343 × 0.3 = 0.4116."
  },
  {
    type: "mcq", topic: "Statistical Reasoning", difficulty: "Gold",
    stimulus: "The mean score of 20 students is recorded as 64. One student's score was incorrectly entered as 42 instead of 72.",
    question: "What is the corrected mean?",
    options: ["64.5","65.0","65.5","66.0"],
    correct: "C",
    walkthrough: "Recorded total = 20×64 = 1,280. Error = +30. Corrected total = 1,310. Corrected mean = 1,310÷20 = 65.5."
  },
  {
    type: "mcq", topic: "Statistical Reasoning", difficulty: "Diamond",
    stimulus: "Two machines manufacture components.\n- Machine A produces 60% of all components and 2% of its components are defective.\n- Machine B produces 40% of all components and 5% of its components are defective.\n\nA randomly selected component is known to be defective.",
    question: "What is the probability that the defective component came from Machine B?",
    options: ["40%","50%","62.5%","71.4%"],
    correct: "C",
    walkthrough: "Per 10,000: A defective = 6,000×0.02 = 120. B defective = 4,000×0.05 = 200. Total defective = 320. P(B|defective) = 200/320 = 62.5%."
  }
];

let inserted = 0, failed = 0;

for (const q of questions) {
  try {
    if (q.type === "yn5") {
      // One passage row for the stimulus
      const passage = await post("admin_passages", { section: "dm", content: q.stimulus, chart: null });
      const pid = passage.id;
      // One admin_qs row per statement
      const answers = q.correct_answer.split(",").map(s => s.trim());
      for (let i = 0; i < q.statements.length; i++) {
        await post("admin_qs", {
          section: "dm", passage_id: pid, q_type: "yn5",
          question_text: q.statements[i],
          options: ["Yes", "No"],
          correct: answers[i] === "Y" ? "Yes" : "No",
          explanations: { note: q.walkthrough },
          subtype: q.topic, difficulty: q.difficulty, sort_order: i
        });
      }
      inserted++;
      console.log(`✓ yn5 [${q.topic}]`);
    } else {
      const passage = await post("admin_passages", { section: "dm", content: q.stimulus, chart: null });
      await post("admin_qs", {
        section: "dm", passage_id: passage.id, q_type: "mcq",
        question_text: q.question,
        options: q.options,
        correct: q.correct,
        explanations: { [q.correct]: q.walkthrough },
        subtype: q.topic, difficulty: q.difficulty, sort_order: 0
      });
      inserted++;
      console.log(`✓ mcq [${q.topic}] ${q.question.slice(0, 50)}`);
    }
  } catch (e) {
    failed++;
    console.error(`✗ [${q.type}/${q.topic}]`, e.message.slice(0, 120));
  }
}

console.log(`\nDone: ${inserted} inserted, ${failed} failed`);
