"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { studyGuideSections, getGuidePages, findFoundation, findTopic, getGuidePageTitle, type GuideSection } from "@/lib/studyGuideData";

const TONES = ["tint", "sun", "mint", "coral", "lilac"];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function GuideGroup({ id, label, icon, pages, activePage, onNavigate, collapsed, onToggle }: {
  id: string; label: string; icon: string;
  pages: [string, string][]; activePage: string;
  onNavigate: (id: string) => void;
  collapsed: boolean; onToggle: (id: string) => void;
}) {
  return (
    <div className={`vrg-group ${collapsed ? "collapsed" : ""}`}>
      <button className="vrg-group-toggle" onClick={() => onToggle(id)} type="button">
        <span className="vrg-group-icon">{icon}</span><b>{label}</b><span className="vrg-chevron">›</span>
      </button>
      <div className="vrg-items">
        {pages.map(([pid, plabel]) => (
          <button
            key={pid}
            className={`vrg-nav-item ${activePage === pid ? "active" : ""}`}
            onClick={() => onNavigate(pid)}
            type="button"
          >
            {plabel}
          </button>
        ))}
      </div>
    </div>
  );
}

function GuideSidebar({ section, sectionKey, pageId, onNavigate, onBack, collapsed, onToggle }: {
  section: GuideSection; sectionKey: string; pageId: string;
  onNavigate: (id: string) => void; onBack: () => void;
  collapsed: Record<string, boolean>; onToggle: (id: string) => void;
}) {
  const foundationPages: [string, string][] = [
    ["overview", "Overview"],
  ];
  const totalPages = getGuidePages(section).length - 1;

  return (
    <aside className="vrg-sidebar">
      <div className="vrg-brand">
        <Link href="/" className="vrg-wordmark">
          <svg viewBox="0 0 48 32" aria-hidden="true"><path d="M2 18h9l4-13 7 24 6-18 5 7h13" /></svg>
          Pulsemed
        </Link>
        <span className="vrg-badge">{section.short}</span>
      </div>
      <button className="vrg-back" onClick={onBack} type="button">
        <span>←</span> Back to {section.short} dashboard
      </button>
      <div className="vrg-nav-title">Study guide</div>
      <nav className="vrg-scroll" aria-label={`${section.label} study guide pages`}>
        <GuideGroup
          id={`${sectionKey}-foundations`}
          label="Start here"
          icon={section.short}
          pages={foundationPages}
          activePage={pageId}
          onNavigate={onNavigate}
          collapsed={!!collapsed[`${sectionKey}-foundations`]}
          onToggle={onToggle}
        />
        {section.groups.map(group => (
          <GuideGroup
            key={group.id}
            id={`${sectionKey}-${group.id}`}
            label={group.label}
            icon={group.icon}
            pages={group.topics.map(t => [t.id, t.title] as [string, string])}
            activePage={pageId}
            onNavigate={onNavigate}
            collapsed={!!collapsed[`${sectionKey}-${group.id}`]}
            onToggle={onToggle}
          />
        ))}
      </nav>
      <div className="vrg-sidebar-foot">
        <div className="vrg-progress-copy">
          <strong>{section.short} guide</strong>
          <span>{totalPages} pages</span>
        </div>
        <div className="vrg-progress-bar"><span style={{ width: "42%" }} /></div>
      </div>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function GuideTopbar({ section, sectionKey, pageId, onSwitchSection, userName, testDate }: {
  section: GuideSection; sectionKey: string; pageId: string;
  onSwitchSection: (key: string) => void;
  userName: string | null; testDate: string | null;
}) {
  const initials = userName
    ? userName.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2)
    : null;
  const examLabel = testDate
    ? new Date(testDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <header className="vrg-topbar">
      <div className="vrg-crumbs">Learn &nbsp;/&nbsp; {section.label} &nbsp;/&nbsp; <b>{getGuidePageTitle(section, pageId)}</b></div>
      <div className="vrg-section-switcher" aria-label="Switch study guide">
        {Object.entries(studyGuideSections).map(([key, s]) => (
          <button
            key={key}
            className={`vrg-section-chip ${key === sectionKey ? "active" : ""}`}
            onClick={() => onSwitchSection(key)}
            title={s.label}
            type="button"
          >
            {s.short}
          </button>
        ))}
      </div>
      {userName && (
        <div className="vrg-profile">
          <span className="vrg-avatar">{initials}</span>
          <div>
            <strong>{userName}</strong>
            <small>{examLabel ? `UCAT · ${examLabel}` : "UCAT student"}</small>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Page header ──────────────────────────────────────────────────────────────

function GuidePageHeader({ section, pageId, title, eyebrow, subtitle }: {
  section: GuideSection; pageId: string; title: string; eyebrow: string; subtitle: string;
}) {
  const pages = getGuidePages(section);
  return (
    <div className="vrg-page-head">
      <div>
        <p className="vrg-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="vrg-page-number">
        <small>Guide page</small>
        <strong>{pages.indexOf(pageId) + 1} of {pages.length}</strong>
      </div>
    </div>
  );
}

// ─── Page actions ─────────────────────────────────────────────────────────────

function GuidePageActions({ section, pageId, onNavigate }: {
  section: GuideSection; pageId: string; onNavigate: (id: string) => void;
}) {
  const pages = getGuidePages(section);
  const index = pages.indexOf(pageId);
  const previous = pages[index - 1];
  const next = pages[index + 1];
  return (
    <div className="vrg-page-actions">
      {previous
        ? <button onClick={() => onNavigate(previous)} type="button">← {getGuidePageTitle(section, previous)}</button>
        : <span />}
      {next
        ? <button onClick={() => onNavigate(next)} type="button">{getGuidePageTitle(section, next)} →</button>
        : <button onClick={() => onNavigate("overview")} type="button">Return to overview →</button>}
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

const OVERVIEW: Record<string, {
  what: string;
  numbers: [string, string][];
  rule: { heading: string; body: string; decisions: [string, string][] };
  timing: string[];
  traps: [string, string][];
}> = {
  vr: {
    what: "VR tests one skill: can you find evidence in a passage and judge it honestly? Every question is decided by the text alone — what you already know about the topic is irrelevant.",
    numbers: [["44", "questions"], ["22 min", "total time"], ["~2 min", "per passage"], ["11", "passages"]],
    rule: {
      heading: "The one rule — passage only",
      body: "Every answer is decided by what the passage says, not what is true in real life. Three outcomes are possible:",
      decisions: [
        ["True", "The passage states or clearly implies it."],
        ["False", "The passage gives evidence against it. Silence alone is not enough."],
        ["Can't Tell", "The passage neither proves nor contradicts it. When in doubt, this is usually right."],
      ],
    },
    timing: [
      "Read the question first — it tells you what to scan for.",
      "Spend roughly 2 minutes per passage, not per question.",
      "Choose, flag and move. Never leave a blank.",
      "Return only to questions where you know exactly what to recheck.",
    ],
    traps: [
      ["Keyword match", "The same word appears in the passage but the meaning is different."],
      ["Scope drift", "The passage says some or one study — the option says all or always."],
      ["Extreme wording", "All, never, proves, only — these need very strong evidence."],
      ["False vs Can't Tell", "No evidence for a claim ≠ evidence against it. That gap is Can't Tell."],
      ["Half-right", "The first clause is supported. The second quietly adds something new."],
    ],
  },
  dm: {
    what: "DM tests whether a conclusion follows from the rules and data you are given. Real-world likelihood is irrelevant — only the stated information counts.",
    numbers: [["35", "questions"], ["37 min", "total time"], ["MCQ", "single best answer"], ["Yes/No", "5-statement sets (partial credit)"]],
    rule: {
      heading: "The one rule — translate before you judge",
      body: "Turn every premise into a clear structure (arrow, set, grid or table) before testing a conclusion. Two question types, one habit:",
      decisions: [
        ["Must be true", "True in every valid arrangement — one counterexample defeats it."],
        ["Could be true", "True in at least one valid arrangement."],
        ["Yes / No sets", "Judge each statement independently. A correct set earns two marks; four of five earns one."],
      ],
    },
    timing: [
      "Identify the question type before drawing anything.",
      "Fixed rules first — add constraints one at a time.",
      "Use counterexamples to defeat 'must' claims quickly.",
      "Flag with your diagram visible so you can return efficiently.",
    ],
    traps: [
      ["Converse error", "A → B does not mean B → A."],
      ["Existence assumption", "'All A are B' does not prove any A exist."],
      ["Possibility as certainty", "One valid arrangement proves could, not must."],
      ["Irrelevant argument", "A true or emotional statement can still fail to support the proposal."],
      ["Hidden denominator", "A percentage can flip in meaning when the group size changes."],
    ],
  },
  qr: {
    what: "QR tests whether you can pick the right numbers, run a clean calculation and keep units under control — at speed. The maths is accessible; the challenge is setup, not arithmetic.",
    numbers: [["36", "questions"], ["26 min", "total time"], ["~43 sec", "per question"], ["Calculator", "provided"]],
    rule: {
      heading: "The one habit — set up before you calculate",
      body: "Decide what the question is actually asking and estimate the size of the answer before touching the calculator. Three setups cover most questions:",
      decisions: [
        ["Percentage / change", "Use change ÷ original × 100. Multipliers for repeated changes."],
        ["Ratio / rate", "Write units beside every step. Add ratio parts before sharing."],
        ["Data read", "Trace the exact row, column, series and time period — then calculate."],
      ],
    },
    timing: [
      "Read the question before scanning the table or chart.",
      "Estimate first — a rough answer exposes calculator errors immediately.",
      "Use one clean expression with brackets rather than retyping steps.",
      "Flag with a readable setup so you can finish arithmetic on return.",
    ],
    traps: [
      ["Wrong base", "Percentage change divides by the original value, not the new one."],
      ["Percentage vs percentage points", "40% → 50% is 10 points but a 25% relative increase."],
      ["Early rounding", "Small errors compound across multi-step questions."],
      ["Unit mismatch", "Minutes, hours, cm and m must be reconciled before combining."],
      ["Cumulative vs period", "A running total for June includes all earlier months — subtract May."],
    ],
  },
  sjt: {
    what: "SJT tests professional judgement — not personality. Judge the action described, not the intention behind it, and apply a small set of principles consistently across unfamiliar scenarios.",
    numbers: [["69", "questions"], ["26 min", "total time"], ["~23 sec", "per question"], ["Partial credit", "available"]],
    rule: {
      heading: "The principles — in priority order",
      body: "Most scenarios involve a conflict between these. Work down the list:",
      decisions: [
        ["Safety first", "Immediate serious risk to a patient or the public overrides everything else."],
        ["Honesty", "Correct errors, preserve accurate records, do not conceal or mislead."],
        ["Autonomy & confidentiality", "Respect informed choices; share only what is necessary and to whom."],
      ],
    },
    timing: [
      "Choose the half first — appropriate or inappropriate, important or not — then pick strength.",
      "Judge the action described, not a better version you imagine.",
      "Do not invent motives, diagnoses or consequences.",
      "Escalation is not always best — match the response to the level of risk.",
    ],
    traps: [
      ["Added facts", "Do not invent motives or assume consequences the scenario does not state."],
      ["Friendship and loyalty", "Personal loyalty never overrides a patient safety or honesty duty."],
      ["Perfect-answer trap", "A brief, acceptable action is still appropriate even if it is not the complete plan."],
      ["Escalation extremes", "Do not ignore serious concerns or formally report every minor lapse."],
      ["Outcome bias", "A risky action is not appropriate just because no harm happened this time."],
    ],
  },
};

function GuideOverview({ section, pageId, onNavigate }: {
  section: GuideSection; pageId: string; onNavigate: (id: string) => void;
}) {
  const key = section.short.toLowerCase() as keyof typeof OVERVIEW;
  const ov = OVERVIEW[key] ?? OVERVIEW.vr;

  return (
    <>
      <GuidePageHeader section={section} pageId={pageId} title={`${section.short} overview`} eyebrow="Start here" subtitle={section.tagline} />

      {/* What it tests */}
      <p style={{
        fontSize: 15, lineHeight: 1.8, color: "var(--ink)",
        borderLeft: "3px solid var(--section)", background: "var(--section-tint)",
        padding: "14px 18px", borderRadius: "0 12px 12px 0", margin: "0 0 22px",
      }}>
        {ov.what}
      </p>

      {/* Numbers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 26 }}>
        {ov.numbers.map(([val, label]) => (
          <div key={label} style={{
            padding: "14px 16px", borderRadius: 12, border: "1px solid var(--line)",
            background: "white", textAlign: "center",
          }}>
            <strong style={{ display: "block", fontSize: 22, fontWeight: 850, color: "var(--section)", lineHeight: 1.1 }}>{val}</strong>
            <small style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600 }}>{label}</small>
          </div>
        ))}
      </div>

      {/* The one rule */}
      <section style={{ marginBottom: 26 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 17 }}>{ov.rule.heading}</h2>
        <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6 }}>{ov.rule.body}</p>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${ov.rule.decisions.length}, 1fr)`, gap: 10 }}>
          {ov.rule.decisions.map(([label, desc]) => (
            <div key={label} style={{
              padding: "14px 16px", borderRadius: 12,
              background: "var(--section-tint)", border: "1px solid var(--section)",
            }}>
              <strong style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--section)", marginBottom: 5 }}>{label}</strong>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timing */}
      <section style={{ marginBottom: 26 }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 17 }}>Timing</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ov.timing.map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{
                width: 20, height: 20, borderRadius: 6, background: "var(--section-tint)",
                color: "var(--section)", fontSize: 10, fontWeight: 800,
                display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1,
              }}>{i + 1}</span>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--ink)" }}>{tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Traps */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 17 }}>Traps to know</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}>
          {ov.traps.map(([name, desc], i) => (
            <div key={name} style={{
              display: "grid", gridTemplateColumns: "140px 1fr",
              borderTop: i > 0 ? "1px solid var(--line)" : undefined,
              background: "white",
            }}>
              <div style={{
                padding: "12px 14px", background: "var(--section-tint)",
                borderRight: "1px solid var(--line)",
              }}>
                <strong style={{ fontSize: 12, fontWeight: 750, color: "var(--section)" }}>{name}</strong>
              </div>
              <p style={{ margin: 0, padding: "12px 14px", fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Question type links */}
      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 24 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 17 }}>Question types</h2>
        <p style={{ margin: "0 0 18px", color: "var(--ink-soft)", fontSize: 13 }}>Go deeper into each format.</p>
        {section.groups.map((group, gi) => (
          <div key={group.id} style={{ marginBottom: 20 }}>
            <p className="section-kicker" style={{ marginBottom: 10 }}>{group.label}</p>
            <div className="vrg-card-grid">
              {group.topics.map((topic, i) => (
                <article
                  key={topic.id}
                  className={`vrg-link-card tone-${(i + gi) % 5}`}
                  onClick={() => onNavigate(topic.id)}
                  onKeyDown={e => e.key === "Enter" && onNavigate(topic.id)}
                  tabIndex={0}
                >
                  <span className="vrg-card-icon">{group.icon}</span>
                  <h3>{topic.title}</h3>
                  <p>{topic.description}</p>
                  <div className="vrg-card-action"><span>Open guide →</span></div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>

      {section.official && (
        <section className="vrg-panel coral" style={{ marginTop: 8 }}>
          <span className="vrg-panel-label">Official guidance</span>
          <h2>GMC guidance for medical students</h2>
          <p>Keep the official professional guidance nearby while you study SJT themes such as safety, honesty, confidentiality and raising concerns.</p>
          <a className="vrg-official-link" href={section.official} target="_blank" rel="noreferrer">Open the GMC guidance ↗</a>
        </section>
      )}
    </>
  );
}

// ─── Foundation page ──────────────────────────────────────────────────────────

function FoundationPage({ section, page, pageId, onNavigate }: {
  section: GuideSection;
  page: NonNullable<ReturnType<typeof findFoundation>>;
  pageId: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <>
      <GuidePageHeader section={section} pageId={pageId} title={page.title} eyebrow={`${section.short} essentials`} subtitle={page.subtitle} />
      <section className="vrg-panel tint" style={{ marginBottom: 14 }}>
        <span className="vrg-panel-label">The big idea</span>
        <h2>{page.title}</h2>
        <p>{page.intro}</p>
      </section>
      <div className={`vrg-rich-grid ${page.blocks.length >= 5 ? "three" : ""}`}>
        {page.blocks.map((block, i) => (
          <article key={block[0]} className={`vrg-panel ${TONES[i % TONES.length]}`}>
            <span className="vrg-panel-label">{block[0]}</span>
            <h3>{block[0]}</h3>
            <p>{block[1]}</p>
          </article>
        ))}
      </div>
      <div className="vrg-callout" style={{ marginTop: 14 }}>
        <span className="vrg-callout-icon">✓</span>
        <div><h3>{page.tip[0]}</h3><p>{page.tip[1]}</p></div>
      </div>
      {section.official && page.id === "professional-principles" && (
        <section className="vrg-panel coral" style={{ marginTop: 14 }}>
          <h3>Want the official version too?</h3>
          <p>The GMC's guidance explains how professional expectations apply to medical students.</p>
          <a className="vrg-official-link" href={section.official} target="_blank" rel="noreferrer">Read the GMC guidance ↗</a>
        </section>
      )}
      <GuidePageActions section={section} pageId={pageId} onNavigate={onNavigate} />
    </>
  );
}

// ─── PROVE method (VR only) ───────────────────────────────────────────────────

const PROVE: Record<string, [string, string, string, string, string]> = {
  "tfct-direct": [
    "The answer is stated directly — find the sentence, bring nothing from outside.",
    "Read the full statement and name the exact claim you need to test.",
    "One anchor — the most distinctive name, number or term — to locate the evidence.",
    "Verify every part — a joined statement needs every clause supported, not just the first.",
    "Evidence gap = Can't Tell. Only False if the passage actively contradicts the claim.",
  ],
  "tfct-inference": [
    "The inference must be unavoidable from the passage — plausible is not enough.",
    "Read the conclusion and map what chain of evidence it requires.",
    "One starting fact to anchor the chain in the passage.",
    "Verify necessity — if another situation is still possible, it's Can't Tell.",
    "Evidence gap = Can't Tell. False needs the passage to rule it out, not just stay silent.",
  ],
  "tfct-comparisons": [
    "Use only the figures and relationships the passage gives — no assumed baselines.",
    "Read to identify what two things are compared and which direction matters.",
    "One number or comparison word to anchor your scan of the relevant data.",
    "Verify direction, base and time period — reversals are the most common trap here.",
    "Evidence gap = Can't Tell if the passage doesn't give enough data to resolve the comparison.",
  ],
  "tfct-scope": [
    "The passage's evidence has limits — never stretch it to cover a broader claim.",
    "Read the scope words in the statement: all, always, every, causes, proves.",
    "One scope word to locate where the evidence boundary sits in the passage.",
    "Verify the claim stays inside that boundary — some ≠ all, one study ≠ universal.",
    "Evidence gap = Can't Tell. Only False if the passage directly contradicts the scope.",
  ],
  "mcq-direct": [
    "Test every clause of each option against the text — familiar wording ≠ correct.",
    "Read the stem to name the exact detail (who, what, when, where) you're hunting.",
    "One most distinctive clue to anchor your scan to the right part of the passage.",
    "Verify time period, person and quantity — near-match options are the main trap.",
    "Eliminate by evidence — rule each wrong option out explicitly, don't just pick the familiar one.",
  ],
  "mcq-inference": [
    "The right inference uses the fewest assumptions and stays closest to the text.",
    "Read to identify which region of the passage the question draws from.",
    "One evidence anchor to locate the facts that support or defeat each option.",
    "Verify each option — does it add any assumption the passage doesn't support?",
    "Eliminate the option that travels furthest beyond what the evidence allows.",
  ],
  "mcq-main-idea": [
    "The main idea must cover the whole passage — not one example, not beyond the text.",
    "Read the opening and closing sentences — they carry the purpose and direction.",
    "One major turn or contrast in the argument that shapes the overall point.",
    "Verify breadth — too narrow (one example) and too broad are both wrong.",
    "Eliminate options that describe a supporting detail rather than the overall purpose.",
  ],
  "mcq-viewpoint": [
    "Quoted material belongs to the speaker quoted, not the author of the passage.",
    "Read to identify whose view is being tested before looking at the options.",
    "One reporting verb — claims, warns, argues, concedes — to locate the stance.",
    "Verify strength — cautious and certain language are both wrong if mismatched.",
    "Eliminate speaker-author swaps and options that add certainty the text withholds.",
  ],
  "mcq-meaning": [
    "The most common dictionary meaning may be wrong — the passage context decides.",
    "Read the sentence before and after the quoted word to understand the direction.",
    "One tonal clue — positive, negative or neutral — to narrow your options.",
    "Verify fit — swap each option into the sentence; the right one keeps it logical.",
    "Eliminate the familiar definition if the surrounding context points elsewhere.",
  ],
};

const PROVE_LABELS = ["P", "R", "O", "V", "E"] as const;
const PROVE_HINTS = ["Passage only", "Read the question first", "One anchor word", "Verify scope", "Evidence gap"] as const;

// ─── SHAPE method (SJT only) ──────────────────────────────────────────────────

const SHAPE: Record<string, [string, string, string, string, string]> = {
  "importance-questions": [
    "Safety, rights and honesty are almost always very important. Convenience, embarrassment and fear of discipline almost never are.",
    "Honesty-related factors carry high weight — concealment, misleading communication and record integrity always matter.",
    "Act within your role — a factor becomes important if it affects whether you need supervision or senior input.",
    "Proportionate importance — ask whether this factor would meaningfully change what a professional should do.",
    "Escalation relevance — if ignoring this factor could put someone at risk, it is almost certainly important.",
  ],
  "appropriate-action": [
    "Safety check — does this action protect people, or does it create or ignore a risk?",
    "Honesty check — does this action involve open, accurate communication, or does it conceal or mislead?",
    "Act within your role — is this action within what a student should do, or does it need a more senior person?",
    "Proportionate — decide appropriate or inappropriate first, then choose the strength of the rating.",
    "Escalation check — is the action at the right level? Too little leaves risk unaddressed; too much is disproportionate.",
  ],
  "safety-topic": [
    "Safety is the starting point — classify how immediate and serious the risk is before deciding anything.",
    "Honesty about what you observed — stick to facts; don't exaggerate or minimise the concern.",
    "Act within your role — make the situation safe within your ability, then involve the right senior person.",
    "Proportionate response — a minor one-off lapse and a serious or repeated risk need very different steps.",
    "Escalate to the right person — involve a senior when the risk is serious, repeated or beyond your control.",
  ],
  "honesty-openness": [
    "Safety — if an error affects patient care, correct it promptly; delay makes the situation worse.",
    "Honesty is non-negotiable — correct through the proper route, never conceal or alter records.",
    "Act within your role — seek senior support for errors that go beyond what you can manage alone.",
    "Proportionate — the response should match the severity; not every error requires a formal report.",
    "Escalate to a supervisor when the error affects patient care, records or trust within the team.",
  ],
  "consent-confidentiality": [
    "Safety — if a patient is at risk, limited disclosure may be justified; safety can override confidentiality.",
    "Honesty — communicate clearly and without coercion; people need accurate information to make real choices.",
    "Act within your role — if consent or capacity is genuinely unclear, seek senior guidance rather than deciding alone.",
    "Proportionate disclosure — share only the minimum necessary information with the people who need it.",
    "Escalate when safety and confidentiality conflict — this decision needs senior involvement, not a solo call.",
  ],
  "teamwork-colleagues": [
    "Safety — if a colleague's behaviour puts patients at risk, that overrides loyalty and friendship.",
    "Honesty — stick to what you actually observed; don't exaggerate, assume intent or make accusations.",
    "Act within your role — offer support for minor concerns; do not try to manage serious risk alone.",
    "Proportionate — a struggling colleague may need support first; formal reporting is not always the right first step.",
    "Escalate when informal steps have failed or the risk to patients is too high to handle without senior help.",
  ],
  "most-least-questions": [
    "Safety — ask which option best protects those at risk and which option creates or ignores a serious risk.",
    "Honesty — the least appropriate option often involves concealment, falsification or bypassing the proper process.",
    "Act within your role — the most appropriate action is usually the one a student can legitimately take.",
    "Proportionate — the most appropriate option matches the scale of the problem; the least is either extreme or avoids the issue entirely.",
    "Escalation check — does one option bypass the right channel or go to the wrong level entirely? That is usually the least appropriate.",
  ],
};

const SHAPE_LABELS = ["S", "H", "A", "P", "E"] as const;
const SHAPE_HINTS = ["Safety first", "Honesty always", "Act within your role", "Proportionate", "Escalate right"] as const;

// ─── Topic page ───────────────────────────────────────────────────────────────

function TopicPage({ section, topic, pageId, onNavigate, onPractice }: {
  section: GuideSection;
  topic: NonNullable<ReturnType<typeof findTopic>>;
  pageId: string;
  onNavigate: (id: string) => void;
  onPractice: () => void;
}) {
  return (
    <>
      <GuidePageHeader section={section} pageId={pageId} title={topic.title} eyebrow={`${section.short} topic guide`} subtitle={topic.description} />
      <section className="vrg-topic-summary">
        <div><h2>{topic.title}</h2><p>{topic.description}</p></div>
        <button className="vrg-practice-cta" onClick={onPractice} type="button">Practise this topic →</button>
      </section>

      {PROVE[topic.id] && (
        <div style={{ margin: "0 0 20px", borderRadius: 14, border: "1px solid var(--section)", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", background: "var(--section)", display: "flex", alignItems: "center", gap: 10 }}>
            <strong style={{ color: "white", fontSize: 13, letterSpacing: ".06em" }}>PROVE</strong>
            <span style={{ color: "rgba(255,255,255,.7)", fontSize: 11 }}>method for this question type</span>
          </div>
          {PROVE[topic.id].map((instruction, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "44px 90px 1fr",
              borderTop: i > 0 ? "1px solid var(--line)" : undefined,
              background: "white", alignItems: "center",
            }}>
              <div style={{ padding: "11px 0", textAlign: "center" }}>
                <strong style={{ fontSize: 16, fontWeight: 900, color: "var(--section)" }}>{PROVE_LABELS[i]}</strong>
              </div>
              <div style={{ padding: "11px 0", borderLeft: "1px solid var(--line)", borderRight: "1px solid var(--line)", paddingLeft: 12 }}>
                <small style={{ fontSize: 9, fontWeight: 750, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: ".04em" }}>{PROVE_HINTS[i]}</small>
              </div>
              <p style={{ margin: 0, padding: "11px 14px", fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>{instruction}</p>
            </div>
          ))}
        </div>
      )}

      {SHAPE[topic.id] && (
        <div style={{ margin: "0 0 20px", borderRadius: 14, border: "1px solid var(--section)", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", background: "var(--section)", display: "flex", alignItems: "center", gap: 10 }}>
            <strong style={{ color: "white", fontSize: 13, letterSpacing: ".06em" }}>SHAPE</strong>
            <span style={{ color: "rgba(255,255,255,.7)", fontSize: 11 }}>method for this question type</span>
          </div>
          {SHAPE[topic.id].map((instruction, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "44px 120px 1fr",
              borderTop: i > 0 ? "1px solid var(--line)" : undefined,
              background: "white", alignItems: "center",
            }}>
              <div style={{ padding: "11px 0", textAlign: "center" }}>
                <strong style={{ fontSize: 16, fontWeight: 900, color: "var(--section)" }}>{SHAPE_LABELS[i]}</strong>
              </div>
              <div style={{ padding: "11px 0 11px 12px", borderLeft: "1px solid var(--line)", borderRight: "1px solid var(--line)" }}>
                <small style={{ fontSize: 9, fontWeight: 750, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: ".04em" }}>{SHAPE_HINTS[i]}</small>
              </div>
              <p style={{ margin: 0, padding: "11px 14px", fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>{instruction}</p>
            </div>
          ))}
        </div>
      )}

      {/* Method card — DM and QR only (VR uses PROVE, SJT uses SHAPE) */}
      {!PROVE[topic.id] && !SHAPE[topic.id] && (
        <div style={{ margin: "0 0 20px", borderRadius: 14, border: "1px solid var(--section)", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", background: "var(--section)", display: "flex", alignItems: "center", gap: 10 }}>
            <strong style={{ color: "white", fontSize: 13, letterSpacing: ".06em" }}>Method</strong>
            <span style={{ color: "rgba(255,255,255,.7)", fontSize: 11 }}>a clear route through this question type</span>
          </div>
          {topic.steps.map((step, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "44px 1fr",
              borderTop: i > 0 ? "1px solid var(--line)" : undefined,
              background: "white", alignItems: "center",
            }}>
              <div style={{ padding: "11px 0", textAlign: "center" }}>
                <strong style={{ fontSize: 15, fontWeight: 900, color: "var(--section)" }}>{i + 1}</strong>
              </div>
              <p style={{ margin: 0, padding: "11px 14px", fontSize: 12, lineHeight: 1.6, color: "var(--ink)", borderLeft: "1px solid var(--line)" }}>{step}</p>
            </div>
          ))}
        </div>
      )}

      <div className="vrg-topic-blocks">
        <article className="vrg-block-spot">
          <div className="vrg-block-label">
            <span className="vrg-block-icon">◎</span>
            <span>How to spot it</span>
          </div>
          <h3>What will the question look like?</h3>
          <p>{topic.spot}</p>
        </article>
        <article className="vrg-block-rules">
          <div className="vrg-block-label">
            <span className="vrg-block-icon">✦</span>
            <span>Rules to remember</span>
          </div>
          <h3>Keep these in view</h3>
          <ul className="vrg-list rules">{topic.rules.map(r => <li key={r}>{r}</li>)}</ul>
        </article>
        <article className="vrg-block-traps">
          <div className="vrg-block-label">
            <span className="vrg-block-icon">⚑</span>
            <span>Common traps</span>
          </div>
          <h3>What tends to pull students off course</h3>
          <ul className="vrg-list traps">{topic.traps.map(t => <li key={t}>{t}</li>)}</ul>
        </article>
      </div>
      {topic.example && (
        <section className="vrg-example">
          <small>{topic.example[0]}</small>
          <h3>{topic.title} in context</h3>
          <p>{topic.example[1]}</p>
        </section>
      )}
      <section className="vrg-bottom-practice">
        <div>
          <strong>Ready to try {topic.title}?</strong>
          <p>We'll take you to the practice setup so you can choose your session length and timing.</p>
        </div>
        <button className="vrg-practice-cta" onClick={onPractice} type="button">Set up practice →</button>
      </section>
      <GuidePageActions section={section} pageId={pageId} onNavigate={onNavigate} />
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StudyGuidePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const sectionKey = (params.section as string) ?? "vr";
  const rawPageId = params.pageId as string[] | undefined;
  const pageId = rawPageId?.[0] ?? "overview";

  const section = studyGuideSections[sectionKey] ?? studyGuideSections.vr;

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [testDate, setTestDate] = useState<string | null>(null);
  const toggle = (id: string) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));

  const userName = session?.user?.name ?? null;

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/me")
      .then(r => r.json())
      .then(d => { if (d.test_date) setTestDate(d.test_date); })
      .catch(() => {});
  }, [session?.user]);

  const goToPage = (nextPage: string) => {
    if (nextPage === "overview") {
      router.push(`/study-guide/${sectionKey}`);
    } else {
      router.push(`/study-guide/${sectionKey}/${nextPage}`);
    }
  };

  const foundation = findFoundation(section, pageId);
  const topic = findTopic(section, pageId);

  return (
    <div
      id="pulsemed-vr-guide-root"
      style={{ "--vr-blue": section.color, "--vr-deep": section.deep, "--vr-tint": section.tint, "--section": section.color, "--section-deep": section.deep, "--section-tint": section.tint } as React.CSSProperties}
    >
      <div className="vrg-shell">
        <GuideSidebar
          section={section}
          sectionKey={sectionKey}
          pageId={pageId}
          onNavigate={goToPage}
          onBack={() => router.push(`/section/${sectionKey}`)}
          collapsed={collapsed}
          onToggle={toggle}
        />
        <div className="vrg-main">
          <GuideTopbar
            section={section}
            sectionKey={sectionKey}
            pageId={pageId}
            onSwitchSection={key => router.push(`/study-guide/${key}`)}
            userName={userName}
            testDate={testDate}
          />
          <main className="vrg-content">
            {pageId === "overview" && <GuideOverview section={section} pageId={pageId} onNavigate={goToPage} />}
            {foundation && <FoundationPage section={section} page={foundation} pageId={pageId} onNavigate={goToPage} />}
            {topic && <TopicPage section={section} topic={topic} pageId={pageId} onNavigate={goToPage} onPractice={() => router.push(`/practice/${sectionKey}`)} />}
          </main>
        </div>
      </div>
    </div>
  );
}
