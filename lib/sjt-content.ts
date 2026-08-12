// Situational Judgement content — 3 format sections + 4 professional principle sections

export type Rule = { title: string; body: string };
export type Step = { label: string; body: string; highlight?: string };
export type WorkedQ = {
  question: string;
  passage?: string;
  steps: Step[];
  answer: string;
  answerNote: string;
  trap?: string;
};
export type PracticeQ = {
  passage: string;
  question: string;
  opts: string[];
  cor: number;
  explanation: string;
};

export type MLPracticeQ = {
  passage: string;
  options: [string, string, string];
  mostCor: 0 | 1 | 2;
  leastCor: 0 | 1 | 2;
  mostExplanation: string;
  leastExplanation: string;
};

export type SJTSubtype = {
  key: string;
  label: string;
  tagline: string;
  format: "ar" | "ir" | "ml" | "mixed";
  rules: Rule[];
  errors: string[];
  passage: string;
  framework?: { title: string; items: { letter: string; label: string; body: string }[] };
  workedQs: WorkedQ[];
  practice: PracticeQ[];
  mlPractice?: MLPracticeQ[];
};

const SJT_GOLDEN_RULES: Rule[] = [
  { title: "Patient safety comes first", body: "Act without delay when there is a real risk of harm. You do not need certainty — a reasonable concern is enough." },
  { title: "Be honest at all times", body: "Never lie, conceal an error or allow a false record to stand. Honesty matters even when the mistake was minor." },
  { title: "Respect patient autonomy", body: "Patients with capacity have the right to make their own decisions. Explain clearly, check understanding, and do not pressure or manipulate." },
  { title: "Protect confidentiality", body: "Do not share patient information without consent. Relatives have no automatic right to information. Disclosure is only justified for serious safety reasons." },
  { title: "Stay within your role", body: "As a student, you observe, flag concerns and support — you do not diagnose, treat or make clinical decisions. Do not act beyond your competence." },
  { title: "Escalate through the right channel", body: "Try a proportionate local route first. Escalate further only if the concern is not addressed. Skip local routes only in genuine emergencies." },
  { title: "Be proportionate", body: "Match the seriousness of your response to the seriousness of the problem. Do not ignore issues, but do not over-react either." },
  { title: "Address problems directly before escalating", body: "For personal or team conflicts, a private conversation is usually the right first step — not an immediate formal complaint." },
  { title: "Never cover up", body: "Silently completing a colleague's work, signing someone else's attendance or hiding errors protects no one and may cause harm." },
];

const AR_OPTS = [
  "A very appropriate thing to do",
  "Appropriate, but not ideal",
  "Inappropriate, but not awful",
  "A very inappropriate thing to do",
];
const IR_OPTS = ["Very important", "Important", "Of minor importance", "Not important at all"];

export const SJT_NAV = [
  {
    type: "format" as const,
    label: "Question Formats",
    subtypes: ["appropriateness", "importance", "most-least"],
  },
  {
    type: "principle" as const,
    label: "Professional Principles",
    subtypes: ["patient-safety", "honesty", "confidentiality", "teamwork"],
  },
];

export const SJT_SUBTYPES: SJTSubtype[] = [
  {
    key: "appropriateness",
    label: "Appropriateness Ratings",
    tagline: "Rate each action independently on a 4-point scale — the question is whether it helps or harms",
    format: "ar",
    rules: [
      { title: "Rate each action independently", body: "Each action stands alone. Two actions can both be 'Very appropriate' or both 'Very inappropriate'. You are not ranking them against each other." },
      { title: "Ask: does it address the actual problem?", body: "'Very appropriate' means it directly tackles the core issue. An action that looks kind but avoids the real problem rates lower." },
      { title: "Ask: is it within a student's role?", body: "Students can observe, flag concerns, support and communicate — but they cannot diagnose, prescribe or make clinical decisions. Acting outside your role drops the rating." },
      { title: "Reserve the extremes", body: "'Very inappropriate' is for actions that actively cause harm or involve dishonesty. 'Inappropriate, but not awful' is for actions that are wrong but not seriously so. Don't use the extreme negatives for mild missteps." },
      { title: "Intention does not determine rating", body: "A well-meaning action that causes direct harm still rates very inappropriate. A clumsy but harmless action may still be appropriate." },
    ],
    errors: [
      "Rating every imperfect action as 'very inappropriate' — save the strongest negative for genuine harm, dishonesty, or serious safety breaches.",
      "Rating an action highly because it sounds kind, even when it sidesteps the actual problem.",
      "Assuming escalation is always the best response — sometimes a direct conversation between colleagues is more appropriate.",
      "Treating an uncomfortable but necessary conversation as inappropriate simply because it is awkward.",
      "Ignoring whether an action is actually within a student's role before rating it.",
    ],
    framework: {
      title: "The Four Rating Questions",
      items: [
        { letter: "1", label: "Does it address the real problem?", body: "Identify the core issue first — a safety risk, a breach, a mistake. The best actions tackle it directly. An action that only addresses the surface appearance of the problem rates lower." },
        { letter: "2", label: "Is it within the student's role?", body: "Students can observe, communicate, flag and support. They cannot make clinical decisions or act as a professional. Acting outside your role makes an otherwise reasonable action inappropriate." },
        { letter: "3", label: "What are the direct consequences?", body: "Think about what actually happens as a result. Does it help the person who needs it? Does it create a new problem? Does it leave a risk unaddressed?" },
        { letter: "4", label: "Is it proportionate?", body: "The response should match the seriousness of the situation. Calling emergency services for a minor disagreement is disproportionate. Ignoring a serious safety breach is equally wrong." },
      ],
    },
    passage: `Chloe is a first-year medical student on a hospital placement. While waiting outside a consultation room, she overhears a doctor inside the room speaking loudly on a personal call, using a patient's full name and describing their diagnosis in detail. The corridor is busy with visitors and other patients.

She is about to leave the area. She has not been specifically briefed on what to do in this situation.

Possible actions:
A. Quietly knock on the door, wait for the doctor to notice, and explain what she overheard when he ends the call.
B. Stand near the door to make it clear she can hear, hoping the doctor will realise and end the call sooner.
C. Find a member of staff she knows and explain exactly what she heard, including the patient's name.
D. Do nothing, because she is only a student and it is not her place to challenge a doctor.`,
    workedQs: [
      {
        question: "How appropriate is Action A — waiting, then speaking to the doctor privately?",
        steps: [
          { label: "What is the actual problem?", body: "A patient's confidential information — their name and diagnosis — is being disclosed in a public corridor. This is an active breach.", highlight: "using a patient's full name and describing their diagnosis in detail" },
          { label: "Does Action A address it?", body: "Yes. It raises the concern directly with the person responsible, in private, as soon as the call ends.", highlight: "explain what she overheard when he ends the call" },
          { label: "Is it within her role?", body: "Yes. Speaking to a senior to flag a concern is within any student's role. She is not disciplining the doctor — she is letting him know what she observed.", highlight: "Chloe is a first-year medical student" },
          { label: "Is it proportionate?", body: "Yes. The first step for a one-off incident is usually to raise it with the person directly. She has not been told to do otherwise." },
        ],
        answer: "A very appropriate thing to do",
        answerNote: "This addresses the right person, in the right way, at the right time. It is honest, direct and within her role.",
      },
      {
        question: "How appropriate is Action D — doing nothing because she is only a student?",
        steps: [
          { label: "What is the actual problem?", body: "Confidential patient information is being overheard by members of the public. The harm is ongoing while the call continues.", highlight: "The corridor is busy with visitors and other patients" },
          { label: "Does Action D address it?", body: "No. The breach continues without any intervention.", highlight: "Do nothing" },
          { label: "Is 'I am only a student' a valid reason?", body: "No. Student status does not remove the obligation to flag a confidentiality concern. Students are expected to raise issues through appropriate channels — they simply cannot act in a professional clinical capacity.", highlight: "it is not her place to challenge a doctor" },
          { label: "Is there any positive side?", body: "Avoiding confrontation prevents Chloe from feeling awkward, but this is a personal benefit, not a professional one. Inaction allows a serious breach to continue." },
        ],
        answer: "A very inappropriate thing to do",
        answerNote: "Inaction in response to an active, serious confidentiality breach is not justified by student status. Students are expected to flag concerns — the route, not the obligation, may change.",
        trap: "Student status affects HOW you respond (e.g., raise with staff rather than confront), not WHETHER you respond at all.",
      },
    ],
    practice: [
      {
        passage: `Jayden is observing a ward round. The patient initially agreed to have a student present but, as the consultation moves to a sensitive topic about mental health, the patient's demeanour changes — they give shorter answers and avoid eye contact with Jayden.

At a natural pause, Jayden says quietly: "Would you prefer to continue without me? I can easily step outside."`,
        question: "How appropriate is Jayden's action?",
        opts: AR_OPTS,
        cor: 0,
        explanation: "Consent to student presence is not a one-off event — it can be withdrawn at any time. Jayden reads the patient's non-verbal signals and checks discreetly, using neutral language that makes it easy to say yes. This is direct, compassionate and within his role. Very appropriate.",
      },
      {
        passage: `Sofia is a dental student observing an examination. The dentist asks her to make a brief note on the patient's electronic record while the dentist's hands are occupied. Sofia has not been shown how to access or update patient records and has not received specific permission to do so.

Sofia opens the record and adds the note as asked.`,
        question: "How appropriate is Sofia's action?",
        opts: AR_OPTS,
        cor: 2,
        explanation: "Sofia means to help, and following an explicit instruction from a supervisor seems reasonable. However, she is accessing a clinical record without the training or permissions to do so correctly. The risk of an error is real, and students should not enter clinical documentation without specific authorisation. Inappropriate, but not awful — the intent is good and a senior asked her, but the action is outside her sanctioned role.",
      },
      {
        passage: `During a group clinical skills session, Rania notices her classmate Tyler has arrived visibly unwell — he is pale, slow to respond and mentions he "hasn't slept properly in days." The session involves handling a volunteer patient.

Rania decides not to say anything because Tyler will be embarrassed and has probably already considered whether he is fit to attend.`,
        question: "How appropriate is Rania's decision to stay silent?",
        opts: AR_OPTS,
        cor: 3,
        explanation: "A student who is visibly unwell and interacting with a volunteer patient is a potential safety concern. Rania's assumption that Tyler has already considered it is speculative. The professional response is to quietly check in with Tyler or, if necessary, the facilitator — not to remain silent out of anticipated embarrassment. Very inappropriate.",
      },
    ],
  },

  {
    key: "importance",
    label: "Importance Ratings",
    tagline: "Rate how much weight a consideration should carry — not what to do, but what matters and why",
    format: "ir",
    rules: [
      { title: "You are rating considerations, not actions", body: "Importance questions ask: how much should this factor influence the decision? You are not choosing what to do — you are judging how relevant a piece of information is." },
      { title: "Ask: could ignoring this cause real harm?", body: "A consideration that could lead to harm if overlooked is very important, even if it is not the decisive factor on its own." },
      { title: "Distinguish relevant from decisive", body: "A factor can be genuinely relevant (worth noting) without being decisive (outcome-changing). These map to 'Important' or 'Of minor importance' — not 'Very important'." },
      { title: "Personal feelings are almost never very important", body: "Embarrassment, inconvenience and personal relationships are understandable, but rarely decisive in a professional context. Rate them 'Of minor importance' unless they directly affect safety." },
      { title: "Seniority does not override welfare", body: "A consideration like 'the consultant is very experienced' does not outweigh a genuine patient safety concern. Role and reputation are not the same as being right." },
    ],
    errors: [
      "Rating every relevant factor as 'very important' — many factors are relevant but only a few should carry decisive weight.",
      "Giving personal feelings (embarrassment, loyalty, friendship) the same weight as safety or honesty.",
      "Rating a factor 'not important at all' simply because it is secondary — if it is genuinely relevant, 'of minor importance' is more accurate.",
      "Confusing the importance of a factor with whether you agree with acting on it.",
      "Assuming seniority or past experience makes a safety concern less important.",
    ],
    passage: `Priya is a pharmacy student on placement. She is about to dispense a prescription when she notices the dose written on the label appears much higher than the standard range she learned in her training. The prescription has already been checked and initialled by a senior pharmacist.

Considerations when deciding how to act:
A. The risk that dispensing the wrong dose could harm the patient.
B. The fact that the prescription has already been checked by a qualified senior.
C. The possibility that Priya may have misremembered the standard dosage range.
D. The inconvenience of raising the concern just before the end of Priya's shift.`,
    workedQs: [
      {
        question: "How important is Consideration A — the risk that dispensing the wrong dose could harm the patient?",
        steps: [
          { label: "What is at stake if this is ignored?", body: "A patient receives a dose significantly higher than the standard range. Even if the risk turns out to be low, the potential harm is serious and direct.", highlight: "dose written on the label appears much higher than the standard range" },
          { label: "Does it affect the outcome?", body: "Yes — this is the central concern. Whether or not to raise the issue depends primarily on the potential harm to the patient.", highlight: "risk that dispensing the wrong dose could harm the patient" },
          { label: "Rate it", body: "This is the core patient safety consideration. Any decision made here will hinge on this more than any other factor." },
        ],
        answer: "Very important",
        answerNote: "Potential patient harm is the central consideration in any clinical decision. It carries the most weight regardless of other factors.",
      },
      {
        question: "How important is Consideration D — the inconvenience of raising the concern near the end of the shift?",
        steps: [
          { label: "Is it relevant at all?", body: "Yes — it provides context for why Priya might hesitate to say something. But it is a personal inconvenience, not a clinical or professional factor.", highlight: "inconvenience of raising the concern just before the end of Priya's shift" },
          { label: "Could acting on this consideration cause harm?", body: "If Priya does not raise the concern because of the timing, a potentially harmful prescription might be dispensed. The inconvenience should have no effect on the professional decision.", highlight: "risk that dispensing the wrong dose could harm the patient" },
          { label: "Rate it", body: "It explains why speaking up might feel difficult, but it should play no role in whether to act." },
        ],
        answer: "Not important at all",
        answerNote: "Shift timing is irrelevant to a patient safety decision. If it influences the choice not to speak up, it actively leads to a worse outcome.",
        trap: "Do not rate this 'Of minor importance' — it is not merely secondary; it is irrelevant to the professional decision.",
      },
    ],
    practice: [
      {
        passage: `Isaac is a medical student observing a paediatric appointment. The mother consented to his presence. Partway through the appointment, the child — who is old enough to understand the consultation — says they would like Isaac to wait outside.

Consideration: The mother's original consent for Isaac to be present.`,
        question: "How important is this consideration?",
        opts: IR_OPTS,
        cor: 2,
        explanation: "The mother's original consent is relevant context — it explains why Isaac is there. However, when a child of sufficient understanding withdraws consent, that takes precedence over the parent's earlier agreement. The consideration is real but it does not override the child's current wishes. Of minor importance.",
      },
      {
        passage: `Hannah is a dental student who has not yet completed a specific procedure on a real patient. The supervisor asks her to carry out the procedure with only brief instruction. Hannah is uncertain she has the skill to do it safely.

Consideration: Whether Hannah has sufficient training and competence to perform this procedure safely.`,
        question: "How important is this consideration?",
        opts: IR_OPTS,
        cor: 0,
        explanation: "A student's own assessment of their competence is directly relevant to patient safety. Students must not perform procedures beyond their skill level, even under instruction. This is a decisive factor in whether to proceed. Very important.",
      },
      {
        passage: `Leon discovers that his study group has been sharing a document of recalled exam questions from previous years. A classmate tells him that everyone does it and it would be unfair to report it.

Consideration: Whether reporting the issue will make Leon unpopular with the rest of the group.`,
        question: "How important is this consideration?",
        opts: IR_OPTS,
        cor: 3,
        explanation: "Social consequences for Leon are not a professional consideration when the issue involves academic integrity. Popularity should carry no weight when deciding whether to report a potential breach of exam rules. Not important at all.",
      },
    ],
  },

  {
    key: "most-least",
    label: "Most & Least Appropriate",
    tagline: "Given three plausible actions, identify the best and the worst — you must choose both",
    format: "ml",
    rules: [
      { title: "You must select TWO answers", body: "Choose the MOST appropriate action and the LEAST appropriate action. The middle option is implicitly the second-best. You do not select it — it is what is left." },
      { title: "All three options are plausible", body: "None of the options are obviously absurd. They are all things a real person might consider doing. Your job is to compare them, not just find the one that sounds bad." },
      { title: "Compare consequences, not intentions", body: "All three actions might be well-intentioned. The most appropriate one achieves the best outcome with the least harm. The least appropriate causes direct harm, avoids the real issue, or is disproportionate." },
      { title: "The most appropriate action is direct and within role", body: "It addresses the actual problem, uses the right route, and fits a student's role. Avoid choosing an action that delegates without any engagement, or one that takes on more responsibility than the student should." },
      { title: "The least appropriate action causes harm or is seriously wrong", body: "Look for actions that: breach confidentiality, involve dishonesty, go public unnecessarily, act outside role in a dangerous way, or allow a serious harm to continue." },
    ],
    errors: [
      "Automatically choosing the most assertive option as most appropriate — compare what each actually achieves.",
      "Choosing the most passive option as least appropriate — passivity is sometimes harmful, but not always the worst choice.",
      "Picking the kindest-sounding action as most appropriate when it avoids the real problem.",
      "Escalating externally before trying an appropriate local route, unless there is immediate danger.",
      "Comparing options without thinking about what actually happens as a result of each one.",
    ],
    passage: `During a clinical placement, Olivia overhears two classmates in the hospital café joking loudly about a patient, using identifying details including the ward name and what the patient said during a consultation. Several members of the public are nearby.

Three possible actions:
A. Quietly ask her classmates to stop, explaining that others nearby may be able to identify the patient.
B. Leave without saying anything, then submit an anonymous report to the university.
C. Record the conversation on her phone so she has evidence to show the placement coordinator.`,
    workedQs: [
      {
        question: "Which action is the MOST appropriate?",
        steps: [
          { label: "What is the problem?", body: "Patient confidentiality is being breached in a public space. The harm is ongoing while the conversation continues.", highlight: "joking loudly about a patient, using identifying details" },
          { label: "Evaluate Option A", body: "Raises the concern immediately, directly and proportionately. It stops the harm quickly, does not punish the classmates publicly, and is a reasonable first step for a student.", highlight: "Quietly ask her classmates to stop" },
          { label: "Evaluate Option B", body: "Leaving allows the breach to continue. Reporting anonymously later is a reasonable step but only after trying to stop the immediate harm. This is a weaker first response.", highlight: "Leave without saying anything" },
          { label: "Evaluate Option C", body: "Recording the conversation creates a second copy of the identifying information on Olivia's personal device. This adds a new privacy concern on top of the existing one.", highlight: "Record the conversation on her phone" },
        ],
        answer: "A — quietly ask her classmates to stop",
        answerNote: "The most appropriate first response addresses the ongoing breach directly and immediately, without escalating disproportionately.",
      },
      {
        question: "Which action is the LEAST appropriate?",
        steps: [
          { label: "Compare B and C", body: "Option B is passive but at least avoids adding harm — reporting later (even anonymously) is a legitimate step. Option C creates a new copy of identifying patient information on a personal device, worsening the breach.", highlight: "Record the conversation on her phone" },
          { label: "Which causes more direct harm?", body: "Option C actively adds a new privacy violation. Even if Olivia's intention is to gather evidence, the method is inappropriate and counterproductive.", highlight: "so she has evidence to show the placement coordinator" },
        ],
        answer: "C — record the conversation on her phone",
        answerNote: "Creating a personal recording of identifying patient details is itself a confidentiality breach. Good intentions do not make the method appropriate.",
      },
    ],
    practice: [
      {
        passage: `Marcus has been late to three consecutive placement sessions. On each occasion he asked a classmate, Yasmin, to sign in for him. Yasmin realises what she has been enabling.

Actions:
A. Tell Marcus she will not sign for him again and encourage him to speak to the placement coordinator about his lateness.
B. Continue signing for him because the lateness was due to transport issues beyond his control.
C. Immediately report to the placement coordinator that she has been falsifying attendance records on his behalf.`,
        question: "Which action is MOST appropriate?",
        opts: ["A", "B", "C"],
        cor: 0,
        explanation: "Option A stops the dishonest behaviour and directs Marcus to deal with his attendance properly. It is honest, proportionate and gives Marcus the chance to address the real issue through the right channel.",
      },
      {
        passage: `Actions:
A. Tell Marcus she will not sign for him again and encourage him to speak to the placement coordinator about his lateness.
B. Continue signing for him because the lateness was due to transport issues beyond his control.
C. Immediately report to the placement coordinator that she has been falsifying attendance records on his behalf.`,
        question: "Which action is LEAST appropriate?",
        opts: ["A", "B", "C"],
        cor: 1,
        explanation: "Option B continues falsifying official records. The cause of Marcus's lateness — however understandable — does not justify ongoing dishonesty in attendance documentation. This is the least appropriate because it sustains an active integrity breach.",
      },
      {
        passage: `During a laboratory session, Kai notices that a classmate, Dana, has copied the results section of another group's report and is about to submit it as her own. Dana sees Kai and quietly asks him not to say anything.

Actions:
A. Tell Dana privately that what she is doing is plagiarism and that she should either redo the section or speak to the tutor before submitting.
B. Say nothing, because it is not Kai's place to police other students' work.
C. Send a screenshot of Dana's screen to the class group chat as a warning to others.`,
        question: "Which action is MOST appropriate?",
        opts: ["A", "B", "C"],
        cor: 0,
        explanation: "Option A directly addresses the issue in a way that is proportionate and still gives Dana the chance to correct it. It is honest, private and uses the appropriate first step before escalating.",
      },
      {
        passage: `Actions:
A. Tell Dana privately that what she is doing is plagiarism and that she should either redo the section or speak to the tutor before submitting.
B. Say nothing, because it is not Kai's place to police other students' work.
C. Send a screenshot of Dana's screen to the class group chat as a warning to others.`,
        question: "Which action is LEAST appropriate?",
        opts: ["A", "B", "C"],
        cor: 2,
        explanation: "Option C publicly exposes Dana through an informal channel before any conversation or proper process. It is disproportionate, humiliating and bypasses any legitimate route. It may also circulate the plagiarised content further.",
      },
    ],
    mlPractice: [
      {
        passage: "Marcus has been late to three consecutive placement sessions. On each occasion he asked a classmate, Yasmin, to sign in for him. Yasmin realises what she has been enabling.",
        options: [
          "Tell Marcus she will not sign for him again and encourage him to speak to the placement coordinator about his lateness.",
          "Continue signing for him because the lateness was due to transport issues beyond his control.",
          "Immediately report to the placement coordinator that she has been falsifying attendance records on his behalf.",
        ],
        mostCor: 0,
        leastCor: 1,
        mostExplanation: "Option A stops the dishonest behaviour and directs Marcus to address his attendance properly. It is honest, proportionate and uses the right local route first.",
        leastExplanation: "Option B continues falsifying official records. The reason for Marcus's lateness — however understandable — does not justify ongoing dishonesty in documentation.",
      },
      {
        passage: "Kai notices that his classmate Dana has copied the results section of another group's report and is about to submit it as her own. Dana sees Kai and quietly asks him not to say anything.",
        options: [
          "Tell Dana privately that what she is doing is plagiarism and that she should either redo the section or speak to the tutor before submitting.",
          "Say nothing, because it is not Kai's place to police other students' work.",
          "Send a screenshot of Dana's screen to the class group chat as a warning to others.",
        ],
        mostCor: 0,
        leastCor: 2,
        mostExplanation: "Option A addresses the issue proportionately and gives Dana the chance to correct it. It is honest, private and uses the appropriate first step before any escalation.",
        leastExplanation: "Option C publicly exposes Dana through an informal channel before any conversation or proper process. It is disproportionate, humiliating and bypasses any legitimate route.",
      },
      {
        passage: "Olivia overhears two classmates in the hospital café joking loudly about a patient, using identifying details including the ward name and what the patient said during a consultation. Several members of the public are nearby.",
        options: [
          "Quietly ask her classmates to stop, explaining that others nearby may be able to identify the patient.",
          "Leave without saying anything, then submit an anonymous report to the university.",
          "Record the conversation on her phone so she has evidence to show the placement coordinator.",
        ],
        mostCor: 0,
        leastCor: 2,
        mostExplanation: "Option A addresses the ongoing breach immediately and directly, without humiliating the classmates publicly. It is proportionate and within Olivia's role.",
        leastExplanation: "Option C creates a second copy of identifying patient information on a personal device — a new confidentiality breach on top of the existing one. Good intentions do not make the method appropriate.",
      },
    ],
  },

  {
    key: "patient-safety",
    label: "Patient Safety & Escalation",
    tagline: "Act promptly when safety is at risk — describe what you observed and use the right route",
    format: "mixed",
    rules: [
      { title: "A reasonable concern is enough to act", body: "You do not need certainty or proof before raising a safety concern. A specific, reasonable basis is sufficient — waiting for proof can cause harm." },
      { title: "Describe what you observed, not what you concluded", body: "Report specific facts: what the patient said, what you saw, what has changed. Avoid conclusions like 'the team is unsafe' — report observations like 'the allergy field says none, but the patient told me otherwise'." },
      { title: "Use the appropriate local route first", body: "In most cases, raise the concern with the nearest responsible person (nurse, supervisor, registrar). Skip the local route only if the risk is immediate and they are unavailable or unresponsive." },
      { title: "Escalate if the first route fails", body: "If you raise a concern and it is dismissed without resolution, and the risk remains, escalating further is not only appropriate — it is expected. You do not need permission to escalate a genuine safety concern." },
      { title: "Absence of past harm is not a reason to ignore ongoing risk", body: "A repeated safety omission that has not yet harmed anyone is still a problem. The risk is real even if nothing has gone wrong yet." },
    ],
    errors: [
      "Waiting for certainty or proof before raising a safety concern — a reasonable basis is all that is needed.",
      "Raising a vague concern ('something felt off') instead of a specific one ('the patient told me they are allergic to penicillin, but the form says no allergies').",
      "Assuming that because no harm has occurred yet, no action is needed.",
      "Being deterred from escalating because a senior said the concern had already been dealt with — if the risk is ongoing, the concern remains valid.",
      "Escalating externally (outside the placement or institution) before trying appropriate internal routes.",
    ],
    passage: `Sam, a medical student, is observing on a general ward. A patient tells him that she has been vomiting since before her last blood draw and feels faint when she stands up. She says nobody has mentioned this to the doctor on the round.

Sam tells the ward nurse, who says the patient was assessed at handover and to leave it with her. Twenty minutes later, Sam passes the patient's bay. The patient looks pale and is gripping the bed rail.`,
    workedQs: [
      {
        question: "How appropriate is it for Sam to approach a second nurse and describe specifically what the patient told him and what he can now see?",
        steps: [
          { label: "Has the situation changed?", body: "Yes — the patient is now visibly worse. The earlier handover assessment does not account for what Sam can now see.", highlight: "the patient looks pale and is gripping the bed rail" },
          { label: "Was the first escalation route adequate?", body: "The first nurse acknowledged the concern but the patient's condition has deteriorated. This is new information that warrants a second approach.", highlight: "the ward nurse says the patient was assessed at handover" },
          { label: "Is going to a second nurse appropriate?", body: "Yes. Sam is not bypassing a clear decision — he is reporting a visible change in the patient's condition. A second nurse is an appropriate route when the first has not resolved an active concern.", highlight: "Sam tells the ward nurse" },
          { label: "What does he report?", body: "Specific observations: what the patient said, what she looks like now. Not 'I think something is wrong' — but exactly what he saw and heard." },
        ],
        answer: "A very appropriate thing to do",
        answerNote: "When a concern is not resolved and the patient visibly deteriorates, escalating further is correct. Student status does not remove the obligation to act on what you observe.",
        trap: "The nurse's earlier response might feel like a 'do not disturb' signal — but a change in the patient's visible condition is new information, not a repeat of the same concern.",
      },
      {
        question: "While on placement, Tom notices a nurse consistently skips a required patient identification step before administering medication. No patient has been harmed. Tom mentions it to his placement tutor, who says the nurse is experienced and to focus on his own learning. Tom lets it drop. How appropriate is this?",
        passage: `Tom is a medical student on a hospital placement. Over three shifts, he has seen the same nurse skip the required two-point patient ID check before administering medication. No error has occurred, but the check is a mandatory safety step.

Tom raises it with his placement tutor, who says the nurse is experienced, knows what she is doing, and Tom should focus on his own learning. Tom decides to drop it.`,
        steps: [
          { label: "Is the concern valid even without past harm?", body: "Yes. The ID check exists to prevent wrong-patient medication errors. Repeated omission is an ongoing risk, not an isolated incident.", highlight: "consistently skips a required patient identification step" },
          { label: "Was the first escalation route used?", body: "Yes — Tom raised it with his tutor. The tutor's response does not resolve the concern; it dismisses it.", highlight: "Tom mentions it to his placement tutor" },
          { label: "Should Tom escalate further or drop it?", body: "The risk is ongoing. Dropping it after a single dismissal, without any resolution, allows the safety gap to continue. A student is expected to escalate appropriately, not to defer to seniority when the concern remains active.", highlight: "Tom decides to drop it" },
        ],
        answer: "A very inappropriate thing to do",
        answerNote: "Dropping a repeated safety concern because a senior dismissed it — with no resolution — is a serious failure. Escalating further (e.g., to the clinical lead or placement office) is the expected next step.",
      },
    ],
    practice: [
      {
        passage: `Leila is a student nurse on a surgical ward. While checking a pre-operative patient's wristband, she notices the listed allergy field is blank. The patient tells her she had a severe reaction to latex gloves during a previous procedure.

Leila informs the ward sister immediately.`,
        question: "How appropriate is Leila's action?",
        opts: AR_OPTS,
        cor: 0,
        explanation: "There is a specific, documented discrepancy between the patient's reported allergy history and the official record — before surgery. Leila reports it immediately to the right person. This is exactly the response expected. Very appropriate.",
      },
      {
        passage: `James is a physiotherapy student observing a session. He notices the physiotherapist has not checked the patient's identity before beginning the manual therapy. James thinks this might be standard practice in this department and says nothing.

Consideration: Whether the omission could harm the patient.`,
        question: "How important is this consideration?",
        opts: IR_OPTS,
        cor: 0,
        explanation: "Identity verification before treatment exists to prevent wrong-patient errors. Whether or not James is certain it is an omission rather than local practice, the potential for harm is real and is the primary consideration here. Very important.",
      },
      {
        passage: `During a community placement, Niamh notices a colleague has been recording home visit times as one hour when most visits are ending after thirty minutes. No patients appear to have been affected.

Niamh decides not to raise it because she is nearly at the end of the placement and does not want to cause problems.`,
        question: "How appropriate is Niamh's decision?",
        opts: AR_OPTS,
        cor: 3,
        explanation: "Falsifying time records is a documentation integrity issue. Niamh's proximity to the end of placement does not change the professional obligation to report what she has observed. Staying silent to avoid personal inconvenience is very inappropriate.",
      },
    ],
  },

  {
    key: "honesty",
    label: "Honesty, Mistakes & Integrity",
    tagline: "Own errors openly, never falsify records, and separate a good explanation from an excuse",
    format: "mixed",
    rules: [
      { title: "Disclose errors promptly", body: "When you become aware of a mistake, report it through the appropriate channel as soon as possible. Delay increases the risk that it causes harm and makes later disclosure harder." },
      { title: "A good reason is not an excuse to falsify", body: "If your train was cancelled, you can explain that honestly — but you cannot ask someone to sign your attendance, or correct a record to hide the absence. The explanation and the dishonest action are separate things." },
      { title: "Do not allow a known inaccuracy to stand", body: "If you know a record, submission or report contains incorrect information, you are obliged to flag it — even if no one has been harmed yet." },
      { title: "Covering for a colleague protects no one", body: "Absorbing or hiding a colleague's mistake prevents them from receiving proper support and may conceal an ongoing risk. Report it through the right channel." },
      { title: "Intent does not cancel impact", body: "The rating of an action is based on its consequences, not the actor's intention. A well-intentioned deception is still a deception." },
    ],
    errors: [
      "Staying silent about a mistake to avoid embarrassment — this often makes the eventual disclosure worse and may allow harm to continue.",
      "Using a genuine explanation (train delay, family emergency) as justification for a dishonest action (false signature, altered record).",
      "Allowing a false record to remain in place because 'no one was harmed yet' — known inaccuracies should be corrected.",
      "Covering for a colleague's error by absorbing their work or hiding the mistake — this protects neither them nor anyone else.",
      "Assuming that a small or correctable mistake doesn't need reporting.",
    ],
    passage: `Leo is a medical student. During a written assessment, he accidentally submits the wrong version of his case study — an earlier draft that contains some incomplete sections. He realises his mistake fifteen minutes after the submission deadline, before any marking has taken place.

Possible actions:
A. Email the course administrator immediately, explaining exactly what happened, and ask whether a corrected version can be submitted.
B. Do nothing, hoping the incomplete sections will be overlooked or given partial credit.
C. Ask a friend who has access to the submission portal to swap the file without telling the administrator.`,
    workedQs: [
      {
        question: "How appropriate is Action A — emailing the administrator immediately and explaining honestly?",
        steps: [
          { label: "What is the problem?", body: "The submitted file is incomplete. Leo knows this. Doing nothing means an assessor will evaluate an unfinished piece of work.", highlight: "an earlier draft that contains some incomplete sections" },
          { label: "Does Action A address it?", body: "Yes. It discloses the error promptly, provides the accurate information (wrong version), and asks the appropriate person to decide what can be done.", highlight: "Email the course administrator immediately" },
          { label: "Is it within his role?", body: "Yes. A student cannot unilaterally fix a submission error — but they can and should report it and let the right person decide. Leo does not determine the outcome; he reports the facts.", highlight: "ask whether a corrected version can be submitted" },
        ],
        answer: "A very appropriate thing to do",
        answerNote: "Prompt, honest disclosure is the expected professional response to an error, even when the error was accidental and the outcome is uncertain.",
      },
      {
        question: "How appropriate is Action C — asking a friend to swap the file without telling anyone?",
        steps: [
          { label: "What is actually happening?", body: "Leo would be covertly altering a submitted assessment file without the knowledge of the assessors. This is falsification of an academic submission.", highlight: "ask a friend who has access to the submission portal to swap the file without telling the administrator" },
          { label: "Does it fix the problem?", body: "The file may be corrected, but the deception creates a more serious problem: deliberate tampering with an academic record.", highlight: "before any marking has taken place" },
          { label: "Does the original mistake justify the deception?", body: "No. The original error was accidental. The covert swap is a deliberate dishonest act — these are separate and the second is more serious." },
        ],
        answer: "A very inappropriate thing to do",
        answerNote: "Covertly altering a submitted assessment, even to make it more accurate, is academic dishonesty. The intent to 'correct' an error does not make the method acceptable.",
        trap: "The result (a more complete submission) might seem like a better outcome — but the method is a deliberate deception that undermines academic integrity.",
      },
    ],
    practice: [
      {
        passage: `Amara arrives late to a compulsory induction session because her bus broke down. A friend who signed in earlier offers to write Amara's name on the attendance list alongside her own signature.

Amara accepts the offer.`,
        question: "How appropriate is Amara's action?",
        opts: AR_OPTS,
        cor: 3,
        explanation: "Even though the reason for Amara's lateness is genuine and outside her control, allowing a false signature to be added to an attendance record is a direct act of dishonesty. The appropriate action is to report the absence honestly to the organiser. Very inappropriate.",
      },
      {
        passage: `During a group research project, Kieran discovers that a dataset his group included contains a calculation error that affects three of the results tables. The report has been submitted but not yet marked.

Consideration: Whether an assessor who reads the report without knowing about the error might reach incorrect conclusions.`,
        question: "How important is this consideration?",
        opts: IR_OPTS,
        cor: 0,
        explanation: "If incorrect data could mislead the assessor or, in a clinical or research context, inform future decisions, this is a central consideration. Kieran cannot knowingly allow inaccurate results to be evaluated without disclosure. Very important.",
      },
      {
        passage: `While helping a classmate review her portfolio before submission, Rosa notices that one case study appears to have been copied almost word-for-word from a published source, with only minor changes. The classmate says she just forgot to add the citation.

Rosa writes the correct citation into the document herself so it looks like it was always there.`,
        question: "How appropriate is Rosa's action?",
        opts: AR_OPTS,
        cor: 3,
        explanation: "Rosa is attempting to fix a plagiarism concern by adding a retroactive citation — but this does not accurately represent what happened. The issue of whether the content constitutes proper paraphrasing or copying still exists, and Rosa has now made herself involved in concealing the original state of the document. Very inappropriate.",
      },
    ],
  },

  {
    key: "confidentiality",
    label: "Confidentiality & Consent",
    tagline: "Protect private information by default — consent must be explicit, specific and current",
    format: "mixed",
    rules: [
      { title: "Relatives have no automatic right to information", body: "Being a family member does not entitle someone to a patient's medical details. Information can only be shared with explicit patient consent, or in defined exceptional circumstances." },
      { title: "Consent is ongoing", body: "A patient who agreed to a student being present at the start of an appointment can withdraw that consent at any time. The same applies to information sharing — check before assuming permission still applies." },
      { title: "Be alert to incidental disclosure", body: "Confidential information can be breached through a screen left open, a conversation overheard in a corridor, a printed list left visible, or a message sent to the wrong person. Breaches are not only deliberate." },
      { title: "Use the right channel", body: "Do not share clinical information through personal devices, informal messages or verbal relay. Authorised channels exist for a reason." },
      { title: "Disclosure for safety has limits", body: "Confidentiality can be broken when there is a serious, imminent risk of harm that cannot otherwise be prevented, and where the patient's refusal to disclose has been considered. It is not a general escape clause for inconvenience." },
    ],
    errors: [
      "Assuming relatives have the right to a patient's information because they 'seem genuine' or claim a relationship.",
      "Treating consent as a one-time decision that cannot change.",
      "Failing to notice incidental breaches: visible screens, overheard conversations, named documents in public view.",
      "Sharing information through informal channels (group chats, verbal relay) rather than authorised routes.",
      "Breaking confidentiality because disclosure would be convenient or avoid an awkward conversation.",
    ],
    passage: `Zara is a medical student on a ward placement. She is studying at the nurses' station when the phone rings. The caller says she is the patient in bay three's daughter and asks whether her mother's surgery is finished and how it went.

Zara knows the surgery has completed and that the notes describe it as straightforward. She has not been given any instruction about what to share with callers. She does not know this person's identity or whether the patient consented to information being shared with relatives.`,
    workedQs: [
      {
        question: "How appropriate is it for Zara to explain she is not able to give clinical information over the phone and offer to find someone who can help?",
        steps: [
          { label: "What does the caller want?", body: "Clinical information about the patient's surgery. This is confidential medical information.", highlight: "asks whether her mother's surgery is finished and how it went" },
          { label: "Does Zara have the authority to share it?", body: "No — she has not been given any instruction to share information, has not verified the caller's identity, and does not know if the patient consented to information being shared with relatives.", highlight: "She has not been given any instruction about what to share with callers" },
          { label: "Does her action help?", body: "Yes — she protects confidentiality without dismissing the caller. Directing the caller to someone authorised to help is a constructive, appropriate response.", highlight: "offer to find someone who can help" },
        ],
        answer: "A very appropriate thing to do",
        answerNote: "Protecting confidentiality by default and directing to the right person is exactly the expected response when a student has no instruction or authorisation to disclose.",
      },
      {
        question: "How appropriate is it for Zara to look up the patient's notes and confirm the surgery went well?",
        steps: [
          { label: "Has the patient's identity been confirmed?", body: "No — the caller says she is the daughter, but Zara has no way to verify this.", highlight: "She does not know this person's identity" },
          { label: "Has the patient consented to relatives receiving updates?", body: "There is no indication of this in the scenario.", highlight: "whether the patient consented to information being shared with relatives" },
          { label: "What does Zara do?", body: "She accesses clinical notes and discloses the outcome to an unverified caller — a direct breach of confidentiality, regardless of whether the caller is who they say they are.", highlight: "look up the patient's notes and confirm the surgery went well" },
        ],
        answer: "A very inappropriate thing to do",
        answerNote: "Disclosing clinical information to an unverified caller without any indication of patient consent is a clear breach, even if the news is reassuring.",
        trap: "The information sounds harmless ('went well'), but the breach is in disclosing any clinical detail at all without authorisation.",
      },
    ],
    practice: [
      {
        passage: `During a hospital visit, a well-dressed man approaches Mia, a pharmacy student, and identifies himself as a patient's employer. He explains the patient is on long-term sick leave and he needs to confirm whether the prescription is for a serious condition in order to process the insurance claim.

Mia tells him she cannot share any patient information without the patient's consent.`,
        question: "How appropriate is Mia's action?",
        opts: AR_OPTS,
        cor: 0,
        explanation: "The caller's reason sounds legitimate, but patient information cannot be disclosed to third parties — including employers — without explicit consent. Mia's default to confidentiality, without making assumptions about legitimacy, is exactly right. Very appropriate.",
      },
      {
        passage: `A patient undergoing treatment for a substance disorder tells their GP they do not want their treatment details shared with anyone, including family. Later, the patient's adult sibling calls the GP practice and tells a receptionist the family is very worried and wants to know what treatment their sibling is receiving.

The receptionist tells the sibling the patient is being treated for a substance disorder and names the medication.`,
        question: "How appropriate is the receptionist's action?",
        opts: AR_OPTS,
        cor: 3,
        explanation: "The patient explicitly stated they did not want their treatment shared with anyone, including family. This is a direct breach of a clearly stated confidentiality instruction. The family's concern does not override the patient's right to confidentiality. Very inappropriate.",
      },
      {
        passage: `During a dental student placement, a patient gives verbal consent for Faisal to observe their examination. Later in the appointment the patient becomes distressed about a finding. Faisal notices the patient is no longer making eye contact with him and seems more guarded.

Consideration: Whether the patient's original consent to Faisal's presence still applies.`,
        question: "How important is this consideration?",
        opts: IR_OPTS,
        cor: 0,
        explanation: "Consent must be ongoing. A patient's visible change in behaviour during a consultation — especially during a distressing moment — is a signal that their comfort with the student's presence may have changed. Faisal should check. This is a decisive consideration. Very important.",
      },
    ],
  },

  {
    key: "teamwork",
    label: "Teamwork & Professional Communication",
    tagline: "Support colleagues and address problems proportionately — direct first, escalate if needed",
    format: "mixed",
    rules: [
      { title: "Try a direct conversation before escalating formally", body: "For most interpersonal concerns, a private conversation with the person is the right first step. Formal complaints, public disclosure and external escalation should come after that has failed — or been unsafe to attempt." },
      { title: "Helping is not the same as covering up", body: "Supporting a struggling colleague is appropriate. Silently completing their work or hiding their mistakes while telling no one is not — it denies them proper support and may conceal a risk." },
      { title: "Communicate early when commitments are at risk", body: "If you cannot meet a commitment, tell those affected as soon as you know — not at the deadline. Early notice lets people re-plan. Waiting until it is too late is a failure of professional communication." },
      { title: "Seniority does not remove professional standards", body: "A friend, a well-liked colleague, or a supervisor who behaves in an unsafe or disrespectful way still needs to be addressed. The route may differ (private conversation vs formal report), but the obligation does not disappear." },
      { title: "Never use informal or public channels for professional concerns", body: "Group chats, social media and corridor conversations are not appropriate routes for raising concerns about colleagues, reporting incidents or sharing clinical information." },
    ],
    errors: [
      "Raising an interpersonal concern publicly (group chat, social media) before attempting a direct private conversation.",
      "Staying silent about a colleague's repeated unsafe or disrespectful behaviour to avoid awkwardness.",
      "Silently completing all of a struggling colleague's work without informing anyone — this may hide an ongoing risk and prevent proper support.",
      "Waiting until a deadline to communicate that a commitment cannot be met, preventing others from re-planning in time.",
      "Assuming professional standards do not apply because the colleague is a friend or is well-liked.",
    ],
    passage: `During a group assignment, Anya notices her group member Dan has submitted a section containing several factual errors. Dan seems to be struggling — he has missed two of the last three group meetings and has seemed distracted when present.

Possible responses:
A. Speak to Dan privately, point out the errors and offer to help him work through the section together.
B. Correct all of Dan's errors yourself, without telling him or the tutor, so the group does not lose marks.
C. Tell the tutor during the next session that Dan is not contributing properly and the group should be reassessed.`,
    workedQs: [
      {
        question: "How appropriate is Response A — speaking to Dan privately and offering to help?",
        steps: [
          { label: "Does it address the problem?", body: "Yes — it raises the specific issue (the errors) and offers support. It gives Dan the chance to correct the work and understand what went wrong.", highlight: "point out the errors and offer to help him work through the section together" },
          { label: "Is it proportionate?", body: "Yes. This is a first step: private, direct and supportive. It does not immediately escalate or publicly call out Dan.", highlight: "Speak to Dan privately" },
          { label: "Does it support Dan?", body: "Yes. He seems to be struggling. A direct but kind conversation is appropriate — it addresses the work problem and acknowledges he may need support.", highlight: "Dan has missed two of the last three group meetings" },
        ],
        answer: "A very appropriate thing to do",
        answerNote: "Private, direct and supportive — addresses the specific issue while giving Dan the opportunity to engage before any escalation.",
      },
      {
        question: "How appropriate is Response B — correcting Dan's errors without telling him or the tutor?",
        steps: [
          { label: "Does it fix the immediate problem?", body: "The group submission becomes accurate — that part is positive.", highlight: "so the group does not lose marks" },
          { label: "Does it address the underlying issue?", body: "No. Dan does not know his work had errors. He cannot improve. If he is genuinely struggling, he gets no support.", highlight: "Dan seems to be struggling" },
          { label: "Does it create a new problem?", body: "Yes. The tutor assesses Dan's work as if he completed it correctly — false information about what Dan actually did. This could hide an ongoing problem and is a form of dishonest representation.", highlight: "without telling him or the tutor" },
        ],
        answer: "Inappropriate, but not awful",
        answerNote: "The motive is to help and the immediate harm is low. But secretly correcting a colleague's work hides a potential issue and prevents proper support being offered.",
        trap: "This might seem kind — but compare it to Response A, which achieves the same outcome (accurate work) while also helping Dan.",
      },
    ],
    practice: [
      {
        passage: `Mia and Jackson are paired for a clinical skills assessment. On the day of the assessment, Jackson messages Mia thirty minutes before saying he overslept and will be fifteen minutes late. The assessor has not been contacted.

Mia immediately emails the assessor to explain and asks whether they can start slightly late.`,
        question: "How appropriate is Mia's action?",
        opts: AR_OPTS,
        cor: 0,
        explanation: "Mia takes responsibility for communicating with the assessor as soon as she has the information. Early notice allows the assessor to make a decision. She is acting appropriately within her role — she cannot decide the outcome, but she can ensure the right person has the information. Very appropriate.",
      },
      {
        passage: `Ben makes an offensive comment about a patient's appearance during a group study session. It is the second time he has done this. Izzy, another group member, finds it disrespectful and tells Sam privately. Sam is a close friend of Ben's.

Sam posts a message in the student group chat: "Just a reminder that we should all be professional in how we speak about patients."`,
        question: "How appropriate is Sam's action?",
        opts: AR_OPTS,
        cor: 2,
        explanation: "A group message addresses the concern without confronting Ben directly, which avoids the real issue. Ben may not realise it is directed at him, and the behaviour may continue. It is well-intentioned but ineffective and a missed opportunity for a direct private conversation. Inappropriate, but not awful.",
      },
      {
        passage: `A student on a busy placement notices her colleague has been assigned significantly more patients to follow up than others — the supervisor incorrectly assumed she was the fastest in the group. The colleague has not said anything.

Consideration: Whether speaking to the supervisor about this on the colleague's behalf, without first asking the colleague, might embarrass her.`,
        question: "How important is this consideration?",
        opts: IR_OPTS,
        cor: 1,
        explanation: "The potential for embarrassment is a genuine consideration — it suggests you should speak to the colleague first before raising it with the supervisor. If the colleague does not want it raised, that should carry weight. It shapes the order of actions: check with the colleague first. Important, but it is not a reason to do nothing.",
      },
    ],
  },
];

export function getSubtype(key: string): SJTSubtype | undefined {
  return SJT_SUBTYPES.find(s => s.key === key);
}
