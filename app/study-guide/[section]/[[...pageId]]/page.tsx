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

// ─── QR lesson data ──────────────────────────────────────────────────────────

type FPart    = string | { top: string; bottom: string };
type QRFormula = { title: string; parts: FPart[]; example: string };
type QRStep    = { label: string; calc: string; result: string };
type QRWorked  = { title: string; passage: string; question: string; steps: QRStep[]; answer: string; trap?: string };
type QRLesson  = {
  idea: string;
  where: string[];
  formulas: QRFormula[];
  method: [string, string][];
  worked: QRWorked[];
  rules: [string, string][];
  chartDemo?: { title: string; caption: string; headers: string[]; rows: string[][]; notes: string[] };
};

const QR_LESSONS: Record<string, QRLesson> = {
  "ratio-rates": {
    idea: "A ratio describes how a total is divided into relative shares. The key habit: always find the value of one part first, then scale.",
    where: [
      "A drink recipe mixes concentrate and water in a ratio — how many litres of concentrate in a 660 ml batch?",
      "A concrete mix uses cement : sand : gravel = 1 : 3 : 5 — how much sand in a 360 kg batch?",
      "Eight pumps empty a tank in 6 hours — how long for 6 pumps? (inverse proportion)",
      "A car travels 120 km at 80 km/h — how long for the same car at 60 km/h?",
      "A factory uses 480 kg of raw material. 7% is lost in processing. How much finished product?",
    ],
    formulas: [
      {
        title: "One part of a ratio",
        parts: ["One part  =  ", { top: "Total", bottom: "Sum of all ratio parts" }],
        example: "Ratio 3 : 5  →  sum = 8.  Total = 480.  One part = 480 ÷ 8 = 60.",
      },
      {
        title: "Your share of a ratio",
        parts: ["Share  =  One part  ×  Your ratio number"],
        example: "The '3' share = 60 × 3 = 180.  The '5' share = 60 × 5 = 300.",
      },
      {
        title: "Direct proportion (scale up/down)",
        parts: ["New amount  =  ", { top: "Target quantity", bottom: "Base quantity" }, "  ×  Original amount"],
        example: "Recipe for 8 needs 320 g flour. For 14: (14 ÷ 8) × 320 = 560 g.",
      },
      {
        title: "Inverse proportion (rate × time = constant)",
        parts: ["Rate₁ × Time₁  =  Rate₂ × Time₂"],
        example: "4 pumps × 9 h = 6 pumps × T₂.  T₂ = 36 ÷ 6 = 6 hours.",
      },
      {
        title: "Reverse a processing loss",
        parts: ["Raw input  =  ", { top: "Usable output", bottom: "Survival rate" }],
        example: "Need 186 L usable. 7% lost → survival = 0.93.  Raw = 186 ÷ 0.93 = 200 L.",
      },
    ],
    method: [
      ["Read the ratio", "Write it with labels: concentrate : water = 3 : 8. Keep the stated order — reversing it is the #1 error."],
      ["Add the parts", "Sum all ratio numbers: 3 + 8 = 11 total parts. This is your denominator."],
      ["Find one part", "One part = Total ÷ sum. If 770 L total: one part = 770 ÷ 11 = 70 L."],
      ["Scale to each share", "Multiply one part by each ratio number. Concentrate = 70 × 3 = 210 L. Water = 70 × 8 = 560 L."],
      ["Sense-check", "Shares must add back to the total. 210 + 560 = 770 ✓. If they don't, you added the ratio parts wrong."],
    ],
    worked: [
      {
        title: "2-part ratio split",
        passage: "A sports drink is made by mixing concentrate and water in the ratio 3 : 8. A finished batch contains 770 litres.",
        question: "How many litres of water are in the batch?",
        steps: [
          { label: "Add ratio parts", calc: "3 + 8", result: "11 total parts" },
          { label: "Find one part", calc: "770 ÷ 11", result: "70 L per part" },
          { label: "Water share (8 parts)", calc: "70 × 8", result: "560 L" },
          { label: "Check: concentrate + water", calc: "210 + 560", result: "770 ✓" },
        ],
        answer: "560 litres",
        trap: "Don't divide 770 by 8 directly — that ignores the 3 parts for concentrate.",
      },
      {
        title: "3-part ratio",
        passage: "An alloy is made from copper, zinc and nickel in the ratio 5 : 3 : 2. A sample weighs 640 g.",
        question: "How much zinc does the sample contain?",
        steps: [
          { label: "Add all 3 ratio parts", calc: "5 + 3 + 2", result: "10 total parts" },
          { label: "Find one part", calc: "640 ÷ 10", result: "64 g per part" },
          { label: "Zinc share (3 parts)", calc: "64 × 3", result: "192 g" },
          { label: "Check all three: 5+3+2 = 10 parts", calc: "320 + 192 + 128", result: "640 g ✓" },
        ],
        answer: "192 g",
        trap: "Adding only two of the three parts when calculating the sum (e.g. 5 + 3 = 8) — always add every part.",
      },
      {
        title: "Direct proportion — recipe scaling",
        passage: "A recipe for 12 portions uses 1.8 kg of rice, 1.2 kg of vegetables and 0.6 L of sauce. A caterer needs to prepare 35 portions.",
        question: "How much sauce is required for 35 portions?",
        steps: [
          { label: "Sauce per portion", calc: "0.6 ÷ 12", result: "0.05 L per portion" },
          { label: "Scale to 35 portions", calc: "0.05 × 35", result: "1.75 L" },
          { label: "Or in one step: multiply by scale factor", calc: "0.6 × (35 ÷ 12)", result: "0.6 × 2.917 = 1.75 L" },
        ],
        answer: "1.75 L",
        trap: "Using the ratio 12 : 35 directly without finding the per-portion amount first.",
      },
      {
        title: "Inverse proportion — pumps and time",
        passage: "Four identical pumps can empty a 14,400-litre tank in 9 hours.",
        question: "How long would it take 6 pumps to empty the same tank?",
        steps: [
          { label: "Find rate per pump", calc: "14,400 ÷ 9 ÷ 4", result: "400 L/h per pump" },
          { label: "Combined rate of 6 pumps", calc: "400 × 6", result: "2,400 L/h" },
          { label: "Time for 6 pumps", calc: "14,400 ÷ 2,400", result: "6 hours" },
          { label: "Or use inverse rule: 4 × 9 = 6 × T₂", calc: "36 ÷ 6", result: "6 hours ✓" },
        ],
        answer: "6 hours",
        trap: "More pumps = less time (inverse), not more time. Direct proportion gives the wrong answer here.",
      },
      {
        title: "Processing loss — reverse calculation",
        passage: "During production, 7% of raw concentrate is lost. A recipe requires 210 litres of usable concentrate.",
        question: "How many litres of raw concentrate must enter the process?",
        steps: [
          { label: "Survival rate after 7% loss", calc: "100% − 7%", result: "93% = 0.93 survives" },
          { label: "210 L is 93% of the raw input — reverse it", calc: "210 ÷ 0.93", result: "225.8 L raw needed" },
        ],
        answer: "225.8 L",
        trap: "Multiplying 210 × 1.07 = 224.7 — close but wrong. To reverse a loss you divide by the survival rate, not multiply by (1 + loss rate).",
      },
    ],
    rules: [
      ["Add ALL parts", "For a 3-part ratio like 1:3:5, the sum is 9 — not 4 or 8. Miss one part and everything is wrong."],
      ["Keep the order", "Concentrate : Water = 3 : 8 is not the same as 8 : 3. Label each number before calculating."],
      ["More workers = less time", "Inverse proportion: double the workers, halve the time. The product (rate × time) stays constant."],
      ["Reverse a loss with division", "If 7% is lost, 93% survives. To find the original input, divide the output by 0.93 — never multiply."],
      ["Round up for whole items", "Bags, containers, batches — if 5.2 bags are needed, buy 6. Round down only if the question asks for the maximum that fits."],
    ],
  },

  "charts-graphs": {
    idea: "Every wrong number in a chart question traces back to one mistake: grabbing a figure before fully reading the axis, legend or title. Spend five seconds orienting before you calculate.",
    where: [
      "A bar chart shows monthly sales — what was the percentage increase from March to June?",
      "A line graph has two series — which month did Series A overtake Series B?",
      "A stacked bar chart shows total and components — what fraction was Category X in Year 2?",
      "A table shows hospital admissions by region and quarter — what was the total for Region B in H1?",
      "A pie chart shows market share — if the total market is £2.4 m, what is the value of the 35° sector?",
    ],
    formulas: [
      {
        title: "Reading a bar or line chart",
        parts: ["Value  =  Scale value at the top of the bar (or point on the line)"],
        example: "Bar reaches 7.5 on a 0–10 axis with gridlines every 2.5 → value = 7.5.",
      },
      {
        title: "Pie chart — value from angle",
        parts: ["Value  =  ", { top: "Angle", bottom: "360" }, "  ×  Total"],
        example: "Sector angle = 72°. Total = £500,000.  Value = (72 ÷ 360) × 500,000 = £100,000.",
      },
      {
        title: "Pie chart — angle from percentage",
        parts: ["Angle  =  Percentage  ×  3.6"],
        example: "35% sector: 35 × 3.6 = 126°.",
      },
      {
        title: "Stacked bar — reading a segment",
        parts: ["Segment value  =  Top of segment  −  Bottom of segment"],
        example: "Top of middle segment = 80. Bottom of middle segment = 50.  Segment = 30.",
      },
      {
        title: "Percentage change from a chart",
        parts: ["% change  =  ", { top: "New − Old", bottom: "Old" }, "  ×  100"],
        example: "Bar rises from 40 to 52.  Change = 12. % change = (12 ÷ 40) × 100 = 30%.",
      },
    ],
    method: [
      ["Read the title", "Before any numbers: what does this chart show? Time period, geographic area, unit (£, thousands, %)."],
      ["Check every axis", "X-axis label and scale. Y-axis label, scale and — crucially — whether it starts at zero or is truncated."],
      ["Read the legend", "Which colour/pattern/marker is which series? Don't guess. A mis-identified series wastes the whole calculation."],
      ["Check for footnotes", "Footnotes often define the unit (e.g. 'all figures in millions') or exclude a group. They change the answer."],
      ["Extract, then calculate", "Write the raw values down first. Only then do arithmetic. This separates reading errors from calculation errors."],
    ],
    worked: [
      {
        title: "Reading a table — finding the right cell",
        passage: "A table shows average daily water use (litres) by region and year.",
        question: "Using the table below, what was the total water use across all three regions in 2024?",
        steps: [
          { label: "Read the table title and units", calc: "Units: litres per day per household", result: "Noted — don't add raw numbers yet" },
          { label: "Read 2024 column for each region", calc: "North: 142 L  |  East: 155 L  |  South: 138 L", result: "Three values extracted" },
          { label: "Sum all three regions", calc: "142 + 155 + 138", result: "435 L per day across the three regions" },
        ],
        answer: "435 litres per day",
        trap: "Reading the 2023 column instead of 2024 — always trace the column heading, not just left-to-right order.",
      },
      {
        title: "Bar chart — percentage change",
        passage: "A bar chart shows quarterly revenue. Q1 = £40,000. Q3 = £52,000.",
        question: "What is the percentage increase from Q1 to Q3?",
        steps: [
          { label: "Identify old and new values", calc: "Old = £40,000  |  New = £52,000", result: "From Q1 and Q3 bars" },
          { label: "Calculate the change", calc: "52,000 − 40,000", result: "£12,000 increase" },
          { label: "Divide by the ORIGINAL (Q1)", calc: "12,000 ÷ 40,000", result: "0.30" },
          { label: "Convert to percentage", calc: "0.30 × 100", result: "30% increase" },
        ],
        answer: "30%",
        trap: "Dividing by the new value (52,000) gives 23% — wrong. Always divide by the original (starting) value.",
      },
      {
        title: "Stacked bar — reading one segment",
        passage: "A stacked bar chart shows total sales split into Online and In-store. In Year 2, the bar reaches 80. The Online segment runs from 50 to 80.",
        question: "What were the In-store sales in Year 2?",
        steps: [
          { label: "Total bar height", calc: "Bar top = 80", result: "Total = 80 units" },
          { label: "Online segment", calc: "Top: 80  −  Bottom: 50", result: "Online = 30 units" },
          { label: "In-store = remainder", calc: "80 − 30", result: "In-store = 50 units (bottom segment)" },
        ],
        answer: "50 units",
        trap: "Reading just the top number (80) as the In-store value — the bar shows the total, not the segment.",
      },
    ],
    chartDemo: {
      title: "Example data table — Water usage by region",
      caption: "Average daily household water consumption (litres)",
      headers: ["Region", "Households", "Use per household", "Leakage rate", "Net supply needed"],
      rows: [
        ["North",  "48,000", "142 L", "18%", "8,317,073 L"],
        ["East",   "36,000", "155 L", "12%", "6,340,909 L"],
        ["South",  "52,000", "138 L", "15%", "8,447,059 L"],
      ],
      notes: [
        "Leakage rate = proportion of water entering the network that is lost before reaching households.",
        "Net supply = (Households × Use per household) ÷ (1 − Leakage rate).",
        "Always check the footnotes — 'leakage' here refers to network loss, not household waste.",
      ],
    },
    rules: [
      ["Title first", "The chart title tells you the population, unit and time period. A wrong reading here means every calculation is wrong."],
      ["Truncated axes inflate change", "If a bar chart's Y-axis starts at 60, a bar rising from 70 to 77 looks like it doubled. Always note the baseline."],
      ["Stacked bar: subtract", "A stacked segment's value = top of segment − bottom of segment. Never read a mid-point directly."],
      ["Cumulative line: subtract", "A cumulative line graph for June includes Jan–Jun. June-only = cumulative June − cumulative May."],
      ["Pie: use angle or fraction", "Part/whole = angle/360. Convert the angle to a fraction, then multiply by the total."],
      ["Two y-axes: check which series uses which", "In a dual-axis chart, both series look similar in scale but one axis may be 10× the other."],
    ],
  },

  "percentages-change": {
    idea: "Every percentage question is one of four types: find the percentage, find the amount, find the original, or apply repeated changes. Identify the type before picking up the calculator.",
    where: [
      "A price is reduced by 15% — what is the sale price?",
      "After a 20% rise, a salary is £36,000 — what was it before?",
      "A clinic saw 12,400 patients last year. This year there are 8% more — how many this year?",
      "A laptop is discounted 20% then VAT of 20% is added — is the final price higher or lower than the original?",
      "Two years of 5% annual growth — what multiplier covers both years?",
    ],
    formulas: [
      {
        title: "Percentage of an amount",
        parts: ["Amount  =  ", { top: "Percentage", bottom: "100" }, "  ×  Total"],
        example: "35% of £18,000 = 0.35 × 18,000 = £6,300.",
      },
      {
        title: "Percentage change",
        parts: ["% change  =  ", { top: "Change", bottom: "Original" }, "  ×  100"],
        example: "Price rises from £80 to £92. Change = 12. % change = (12 ÷ 80) × 100 = 15%.",
      },
      {
        title: "Multiplier for a change",
        parts: ["Increase by r%  →  multiply by  (1 + ", { top: "r", bottom: "100" }, ")     Decrease by r%  →  multiply by  (1 − ", { top: "r", bottom: "100" }, ")"],
        example: "15% discount: multiply by 0.85.  20% rise: multiply by 1.20.",
      },
      {
        title: "Reverse a percentage (find the original)",
        parts: ["Original  =  ", { top: "Known value", bottom: "Multiplier" }],
        example: "After 15% off, price is £68. Original = £68 ÷ 0.85 = £80.",
      },
      {
        title: "Repeated percentage changes",
        parts: ["Final  =  Original  ×  Multiplier₁  ×  Multiplier₂  × …"],
        example: "−20% then +20%: 1.00 × 0.80 × 1.20 = 0.96 → net −4%. They do NOT cancel.",
      },
    ],
    method: [
      ["Name the type", "Is this 'find the percentage', 'find the amount', 'find the original' or 'repeated change'?"],
      ["Write the multiplier", "15% off → 0.85. 8% more → 1.08. Writing it down prevents sign errors."],
      ["Apply in order", "For multi-step problems (discount then VAT then delivery), apply each multiplier in the given sequence."],
      ["Reverse with division", "If you're given the result and need the original, divide by the multiplier — never subtract the percentage directly."],
      ["Check direction", "Estimate first: 15% off £80 should be below £80. If your answer is above, something went wrong."],
    ],
    worked: [
      {
        title: "Reverse a percentage — find the original price",
        passage: "A laptop is reduced by 15%. VAT at 20% is then added to the discounted price. Delivery costs £24. The final bill is £840.",
        question: "What was the original price of the laptop before the discount?",
        steps: [
          { label: "Remove delivery charge", calc: "840 − 24", result: "£816 is the price after discount + VAT" },
          { label: "Reverse the 20% VAT (÷ 1.20)", calc: "816 ÷ 1.20", result: "£680 is the discounted price before VAT" },
          { label: "Reverse the 15% discount (÷ 0.85)", calc: "680 ÷ 0.85", result: "£800 original price" },
        ],
        answer: "£800",
        trap: "Adding 15% back to £680 gives £782 — wrong. To reverse a discount you divide by the survival rate, not add the percentage.",
      },
      {
        title: "Percentage change between two values",
        passage: "A clinic recorded 18,000 appointments in 2025 and 19,800 in 2026.",
        question: "What is the percentage increase in appointments from 2025 to 2026?",
        steps: [
          { label: "Calculate the change", calc: "19,800 − 18,000", result: "1,800 more appointments" },
          { label: "Divide by the ORIGINAL (2025)", calc: "1,800 ÷ 18,000", result: "0.10" },
          { label: "Convert to percentage", calc: "0.10 × 100", result: "10% increase" },
        ],
        answer: "10%",
        trap: "Dividing by 19,800 gives 9.09% — wrong. Always divide by the starting value, not the new one.",
      },
    ],
    rules: [
      ["Original = denominator", "In a % change, always divide by where you STARTED. The original is the denominator."],
      ["Reverse by dividing", "To find the original after a % change, divide by the multiplier. Never subtract the % from the final value."],
      ["Successive changes multiply", "−20% then +20% is NOT zero change. It's 0.80 × 1.20 = 0.96 → a net 4% loss."],
      ["Percentage points ≠ percentages", "A rise from 20% to 25% is a 5 percentage-point increase, but a 25% relative increase."],
      ["Markup vs margin", "Markup uses cost as the base. Margin uses selling price. Different denominators → different answers."],
    ],
  },

  "tables-data": {
    idea: "Correct calculation with the wrong table cell is still a wrong answer. Read column headings, row labels, units and footnotes before touching the calculator.",
    where: [
      "A table gives hospital admissions by region and quarter — total for Region B in Q1 and Q2",
      "A table gives costs and quantities — total expenditure for a selected category",
      "A table gives population and percentage figures — absolute number from the percentage",
      "A table has a sub-total row — checking whether it includes or excludes certain items",
      "A table footnote redefines the unit — 'all figures in thousands'",
    ],
    formulas: [
      {
        title: "Absolute value from a percentage column",
        parts: ["Absolute amount  =  Row total  ×  ", { top: "Percentage", bottom: "100" }],
        example: "Row total = 18,000. Follow-up % = 35%.  Follow-ups = 18,000 × 0.35 = 6,300.",
      },
      {
        title: "Combining two rows",
        parts: ["Combined total  =  Row A value  +  Row B value  (same column)"],
        example: "North Q1 = 4,200. South Q1 = 3,800. Combined = 8,000.",
      },
    ],
    method: [
      ["Read the title", "Establish what the table measures, the population covered and the time period."],
      ["Check units once", "Find where units are stated — often in the header, sometimes in a footnote. 'Thousands' in a footnote changes every number."],
      ["Trace row AND column", "Lay one finger on the row label and one on the column heading. The intersection is your number."],
      ["Check for a totals row/column", "If a totals row exists, verify your sum against it — or check whether the question asks for a sub-group, not the total."],
      ["Read footnotes before calculating", "Footnotes often redefine included/excluded groups or change units. Missing them is the single most common error."],
    ],
    worked: [
      {
        title: "Extract and combine from a table",
        passage: "A water company table shows average daily consumption (litres per household) for three regions: North 142 L, East 155 L, South 138 L. North has 48,000 households, East 36,000, South 52,000.",
        question: "What is the total volume of water used daily across all three regions?",
        steps: [
          { label: "North: households × use", calc: "48,000 × 142", result: "6,816,000 L" },
          { label: "East: households × use", calc: "36,000 × 155", result: "5,580,000 L" },
          { label: "South: households × use", calc: "52,000 × 138", result: "7,176,000 L" },
          { label: "Sum all three", calc: "6,816,000 + 5,580,000 + 7,176,000", result: "19,572,000 L per day" },
        ],
        answer: "19,572,000 litres per day",
        trap: "Adding just the 'use per household' figures (142 + 155 + 138 = 435) — that ignores the different household counts in each region.",
      },
    ],
    rules: [
      ["Title and units first", "Two minutes on the title and units saves five minutes of recalculation with the wrong base."],
      ["Footnotes change numbers", "A footnote saying 'all figures in millions' means 4.2 means 4,200,000 — not 4.2."],
      ["Don't double-count totals", "If a 'Total' row is present and you've already added the component rows, don't add the Total row again."],
      ["One row, one column", "In dense tables, physically trace both axes. Picking a neighbouring cell is the most common reading error."],
    ],
  },
};

// ─── DM lesson data ──────────────────────────────────────────────────────────

const DM_LESSONS: Record<string, {
  idea: string;
  method: [string, string][];
  concepts: { label: string; symbol: string; detail: string }[];
  example: { title: string; stimulus: string[]; q: string; steps: string[]; answer: string };
  rules: [string, string][];
}> = {
  "interpreting-information": {
    idea: "Read each rule exactly as written, map who it applies to, then trace what must follow — never add anything the rules don't give you.",
    method: [
      ["List the rules", "Number each rule. Separate if-then rules from direct facts about named people or things."],
      ["Find the trigger", "Each rule fires only when a specific condition is met. Name it before doing anything else."],
      ["Apply the rule", "Does the subject in the question match the trigger? If yes, the consequence must follow."],
      ["Check the contrapositive", "If not-consequence, then not-trigger. This is always valid and often tested in reverse."],
      ["Test each option", "Work through options one at a time. Eliminate by pointing to the rule that rules it out."],
    ],
    concepts: [
      { label: "If A then B", symbol: "A → B", detail: "A is the trigger. B must follow when A is true. The rule says nothing about non-A cases." },
      { label: "Contrapositive", symbol: "¬B → ¬A", detail: "Logically identical to A → B. If the consequence is absent, the trigger must also be absent." },
      { label: "OR condition", symbol: "A or B", detail: "Only one condition needs to be true. If either fires, the rule is satisfied." },
      { label: "AND condition", symbol: "A and B", detail: "Both conditions must be true simultaneously. One missing = rule doesn't apply." },
    ],
    example: {
      title: "Hospital rules — what must be true?",
      stimulus: [
        "All patients admitted before 08:00 are assessed by Team A.",
        "Patients assessed by Team A who require imaging are transferred to Unit 3.",
        "No patient in Unit 3 is discharged before imaging is completed.",
        "Maya was admitted at 07:45 and discharged at 11:30.",
      ],
      q: "Which statement must be true? A) Maya required imaging  B) Maya was assessed by Team A  C) Maya was transferred to Unit 3  D) Maya's imaging was completed before 11:30",
      steps: [
        "Rule 1 trigger: admitted before 08:00. Maya = 07:45 ✓. Consequence: assessed by Team A. → Option B is forced.",
        "Rule 2 trigger: Team A AND requires imaging. Maya is in Team A. But imaging is not confirmed. Rule 2 does not fire.",
        "Rule 3 trigger: in Unit 3. Since Rule 2 didn't fire, Unit 3 is not confirmed. Rule 3 does not fire.",
        "Options A, C, D all depend on imaging being required — which the stimulus never states.",
        "Only B is guaranteed. Every other option adds an assumption the rules don't support.",
      ],
      answer: "B — Maya was assessed by Team A",
    },
    rules: [
      ["A → B ≠ B → A", "The converse is invalid. The rule fires when A is true — not when B is true."],
      ["OR = at least one", "An OR rule fires when either condition is met. Both is fine too, but not required."],
      ["AND = both required", "An AND rule fires only when every condition is simultaneously met. One missing → rule doesn't apply."],
      ["'Must' needs a forced rule", "Choose an option only when you can point to an exact rule that forces it. Plausible is not enough."],
      ["Contrapositive is always valid", "Not-B → Not-A is a free deduction from A → B. Use it when the question tests the reverse direction."],
    ],
  },

  "arguments-assumptions": {
    idea: "Every argument has a hidden link — find the gap between the evidence and the conclusion and you have found the assumption.",
    method: [
      ["State the proposal", "What is the argument trying to justify or prove?"],
      ["Find the evidence", "What reason or data does it offer?"],
      ["Spot the gap", "What unstated step must be true for the evidence to support the conclusion?"],
      ["Use the negation test", "Negate each candidate. If the argument collapses when you negate it, that's the assumption."],
      ["For strengthen / weaken", "Ask: does this close the gap further (strengthen) or offer an alternative explanation (weaken)?"],
    ],
    concepts: [
      { label: "Assumption", symbol: "Gap", detail: "A hidden premise the argument silently relies on. Negate it — if the conclusion breaks, it's required." },
      { label: "Strengthen", symbol: "+ Link", detail: "Evidence that closes the gap between the reason and the conclusion more tightly." },
      { label: "Weaken", symbol: "Alt", detail: "An alternative cause — or evidence that the link between reason and conclusion can break." },
      { label: "Negation test", symbol: "¬A → fails?", detail: "Negate the assumption. If the argument now fails to hold, the assumption is required." },
    ],
    example: {
      title: "Congestion charge — what does the argument assume?",
      stimulus: [
        "A city is considering introducing a congestion charge in its centre.",
        "Supporters argue: the charge should be introduced because it will reduce traffic.",
      ],
      q: "Which assumption is required? A) Everyone can afford the charge  B) At least some drivers would alter their behaviour  C) Public transport is cheaper  D) Congestion is caused exclusively by cars",
      steps: [
        "Proposal: introduce a congestion charge.",
        "Evidence: it will reduce traffic.",
        "Gap: what is the mechanism by which a charge reduces traffic? Drivers must change what they do — fewer trips, different routes, or different modes.",
        "Negate B: 'No drivers alter their behaviour.' → The charge has no mechanism to reduce traffic. The argument collapses. B is required.",
        "Negate A: 'Not everyone can afford it.' → The argument can still work if some drivers change — it doesn't need everyone. Not required.",
        "C and D add facts the argument doesn't need. Weaken the claim if anything.",
      ],
      answer: "B — At least some drivers would alter their behaviour because of the charge",
    },
    rules: [
      ["Relevant, not just true", "A true statement that doesn't affect the argument's core link is never the right answer."],
      ["Alternative cause weakens", "If something else could explain the evidence, the evidence supports the conclusion less."],
      ["Negation test for assumptions", "Negate the candidate. If the conclusion breaks, the assumption is required."],
      ["Strengthen = closes the gap", "The best strengthener directly confirms the link between evidence and conclusion."],
      ["Weaken = opens a gap", "The best weakener shows the evidence could exist even if the conclusion were false."],
    ],
  },

  "logic-puzzles": {
    idea: "Work from certainty outward — fixed rules first, then chain linked constraints, and branch only when stuck.",
    method: [
      ["Choose a grid or slots", "Ordering → a row of slots. Room/day assignment → a grid with rows and columns. Grouping → labelled columns."],
      ["Place fixed rules first", "Direct statements ('N is on Thursday') go straight into the grid before you touch anything else."],
      ["Chain linked rules", "'K immediately after L' + 'J before L' → treat L-K as a fixed block, then place J before it."],
      ["Branch the most restrictive rule", "If a rule limits a slot to two options, try each branch and eliminate the one that breaks another rule."],
      ["Eliminate with options", "Test each answer option against every rule. The first one to break a rule is wrong."],
    ],
    concepts: [
      { label: "Before / After", symbol: "A < B", detail: "A comes somewhere before B. They don't need to be adjacent — any gap is fine." },
      { label: "Immediately before", symbol: "[A–B]", detail: "A and B are adjacent with no gap. Treat them as a block that must move together." },
      { label: "At one end", symbol: "pos 1 or last", detail: "The person or item must be in the very first or very last position." },
      { label: "Not adjacent", symbol: "A ✕✕ B", detail: "A and B cannot occupy neighbouring positions — at least one slot must separate them." },
    ],
    example: {
      title: "Five presentations Mon–Fri",
      stimulus: [
        "Five presentations — J, K, L, M, N — occur Monday to Friday, one per day.",
        "J occurs before L.  |  K occurs immediately after L.  |  N on Thursday.  |  M on Friday.",
      ],
      q: "Which presentation must occur on Monday? A) J  B) K  C) L  D) N",
      steps: [
        "Fixed facts first: Thursday = N, Friday = M. Three slots remain: Mon, Tue, Wed for J, L, K.",
        "K immediately after L → L-K is a block. Block can only fit Mon-Tue or Tue-Wed.",
        "J must come before L. If L = Monday there is no slot left for J. So L ≠ Monday.",
        "Therefore the L-K block must be Tue-Wed, which forces J = Monday.",
        "Final: Mon=J, Tue=L, Wed=K, Thu=N, Fri=M. Answer is A.",
      ],
      answer: "A — J must occur on Monday",
    },
    rules: [
      ["Fixed facts first", "Always fill in directly stated positions before working out constrained ones."],
      ["Block rules", "Treat 'immediately before/after' pairs as a single block. Blocks cut down the number of valid positions."],
      ["Before ≠ immediately before", "'J before L' allows any gap. 'K immediately after L' means zero gap. Don't conflate them."],
      ["Eliminate answer options actively", "Don't try to prove the right answer — disprove all the wrong ones by finding a rule they break."],
      ["One contradiction = invalid", "If a proposed arrangement breaks any single rule, the whole arrangement is ruled out."],
    ],
  },

  "venn-diagrams": {
    idea: "Fill regions from the centre outward — place the most certain facts first, then use totals to find what's left.",
    method: [
      ["Draw the circles", "Two sets = two overlapping circles. Three sets = three circles, each pair overlapping."],
      ["Place universal facts", "'All A are B' → A sits inside B. 'No A are B' → circles are completely separate."],
      ["Place existential facts", "'Some A are B' → at least one person sits in the A∩B region. Mark it, but don't invent a number."],
      ["Fill the centre region first", "In three-set counting problems, always place A∩B∩C before working on pairwise overlaps."],
      ["Subtract outward", "Each pairwise overlap given includes the centre. Subtract A∩B∩C to find the A∩B-only region."],
    ],
    concepts: [
      { label: "Two-set union", symbol: "|A∪B| = |A|+|B|−|A∩B|", detail: "The union counts everyone in at least one set. Subtract the overlap to avoid double-counting." },
      { label: "Neither region", symbol: "Total − |A∪B|", detail: "People in neither set = Total minus everyone in the union." },
      { label: "A-only region", symbol: "|A only| = |A| − |A∩B|", detail: "Subtract from A everyone who is also in B." },
      { label: "Three-set formula", symbol: "|A∪B∪C| = Σ|single| − Σ|pairs| + |all three|", detail: "Add all three set sizes, subtract all pairwise overlaps, add back the triple overlap once." },
    ],
    example: {
      title: "Symptoms X and Y — how many have both?",
      stimulus: [
        "Of 100 patients: 62 have symptom X, 51 have symptom Y, 23 have neither symptom.",
      ],
      q: "How many patients have both X and Y? A) 13  B) 28  C) 36  D) 49",
      steps: [
        "Find the union first: patients with at least one symptom = 100 − 23 = 77.",
        "Apply the formula: |X∪Y| = |X| + |Y| − |X∩Y|.",
        "Substitute: 77 = 62 + 51 − both.",
        "Rearrange: both = 113 − 77 = 36.",
        "Check: X-only = 62−36 = 26. Y-only = 51−36 = 15. Total = 26 + 36 + 15 + 23 = 100. ✓",
      ],
      answer: "C — 36 patients have both X and Y",
    },
    rules: [
      ["Circle size is irrelevant", "Unless numbers are given, a larger drawn circle does not represent a larger group."],
      ["'Some' guarantees a shared region", "'Some A are B' means at least one person sits in A∩B — but gives no count."],
      ["Work centre-outward for counts", "In three-set problems: find A∩B∩C first, then pairwise-only, then exclusive regions."],
      ["Double-subtraction trap", "The A∩B figure given usually includes A∩B∩C. Subtract the triple overlap to get A∩B-only."],
      ["Rearrange the union formula", "|A∩B| = |A| + |B| − |A∪B|. You can find any term if you know the other three."],
    ],
  },

  "probability": {
    idea: "Set up a frequency table or probability tree before calculating — never run numbers blind.",
    method: [
      ["Name the type", "Single event, combined AND/OR, without replacement, conditional (given that), or binomial (exactly k from n)?"],
      ["Use a concrete base", "Convert percentages to frequencies using 100, 1 000 or 10 000. Whole numbers are far easier to work with."],
      ["Build a table or tree", "Tables work for two conditions. Trees work for sequential events where the denominator changes."],
      ["Track denominators", "With replacement: denominator stays fixed. Without replacement: subtract one after every draw."],
      ["Restrict for conditional", "'Given that it is defective' means work only within the defective sub-group — not the full sample."],
    ],
    concepts: [
      { label: "AND — both happen", symbol: "P(A∩B) = P(A) × P(B|A)", detail: "Multiply probabilities along the same path. If events are independent: P(A) × P(B)." },
      { label: "OR — either happens", symbol: "P(A∪B) = P(A)+P(B)−P(A∩B)", detail: "Add the probabilities, then subtract any overlap to avoid double-counting." },
      { label: "Without replacement", symbol: "2nd draw: n−1", detail: "After the first draw, one item is gone. The second fraction has one fewer item in the denominator." },
      { label: "At least one", symbol: "1 − P(none)", detail: "Calculate P(none of the event), then subtract from 1. Almost always the faster route." },
    ],
    example: {
      title: "Defective components — Bayes' reasoning",
      stimulus: [
        "Machine A makes 60% of components; 2% are defective.",
        "Machine B makes 40% of components; 5% are defective.",
        "A randomly selected component is known to be defective.",
      ],
      q: "What is the probability the defective component came from Machine B? A) 40%  B) 50%  C) 62.5%  D) 71.4%",
      steps: [
        "Use 10,000 components as a base.",
        "Machine A: 6,000 × 2% = 120 defective.",
        "Machine B: 4,000 × 5% = 200 defective.",
        "Total defective = 320.",
        "We already know the component is defective → restrict to those 320.",
        "Of those 320, exactly 200 came from Machine B.",
        "P(B | defective) = 200 ÷ 320 = 0.625 = 62.5%.",
      ],
      answer: "C — 62.5% probability it came from Machine B",
    },
    rules: [
      ["Set up before calculating", "Write out the table or tree with labels before touching any numbers."],
      ["Without replacement: −1 each draw", "Second draw from 12 items has denominator 11, not 12."],
      ["Conditional: restrict your sample", "'Given that it is defective' means ignore non-defective components entirely."],
      ["At-least-one: use the complement", "P(at least one) = 1 − P(none). It is almost always the faster route."],
      ["Binomial: C(n,k) × pᵏ × (1−p)ⁿ⁻ᵏ", "Exactly k successes from n independent trials. C(n,k) counts the arrangements."],
    ],
  },
};

// ─── Topic-specific visual aid (replaces "Key concepts" grid) ────────────────

function TopicVisual({ topicId, color: c, tint: t, deep: d }: { topicId: string; color: string; tint: string; deep: string }) {
  if (topicId === "interpreting-information") {
    return (
      <>
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: "var(--ink)" }}>How a rule fires</h2>
        <div style={{ borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "stretch", background: "white" }}>
            <div style={{ flex: 1, padding: "14px 16px", background: t }}>
              <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 800, color: c, letterSpacing: ".1em", textTransform: "uppercase" as const }}>Trigger (A)</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Admitted before 08:00</p>
            </div>
            <div style={{ display: "grid", placeItems: "center", padding: "0 16px", fontSize: 24, fontWeight: 900, color: c }}>→</div>
            <div style={{ flex: 1, padding: "14px 16px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 800, color: c, letterSpacing: ".1em", textTransform: "uppercase" as const }}>Consequence (B)</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Assessed by Team A</p>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--line)", padding: "10px 16px", background: "#fafafa" }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "var(--ink-soft)" }}>Contrapositive — always valid, always free:</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--ink)", fontFamily: "monospace" }}>
              Not assessed by Team A → Not admitted before 08:00
            </p>
          </div>
          <div style={{ borderTop: "1px solid var(--line)", padding: "10px 16px" }}>
            <p style={{ margin: 0, fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.6 }}>
              The rule is silent when A is false — "admitted after 08:00" tells you nothing. Only the trigger fires the consequence.
            </p>
          </div>
        </div>
      </>
    );
  }

  if (topicId === "arguments-assumptions") {
    return (
      <>
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: "var(--ink)" }}>Anatomy of an argument</h2>
        <div style={{ borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", padding: "16px", gap: 8 }}>
            <div style={{ flex: 1, textAlign: "center" as const }}>
              <div style={{ display: "inline-block", padding: "10px 16px", borderRadius: 10, background: t, border: `1px solid ${c}` }}>
                <p style={{ margin: "0 0 2px", fontSize: 9, fontWeight: 800, color: c, letterSpacing: ".1em", textTransform: "uppercase" as const }}>Evidence</p>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>A charge reduces traffic</p>
              </div>
            </div>
            <div style={{ fontSize: 20, color: "var(--ink-soft)", flexShrink: 0 }}>→</div>
            <div style={{ flex: 1, textAlign: "center" as const }}>
              <div style={{ display: "inline-block", padding: "10px 16px", borderRadius: 10, background: "#fffbe6", border: "2px dashed #e6a817" }}>
                <p style={{ margin: "0 0 2px", fontSize: 9, fontWeight: 800, color: "#e6a817", letterSpacing: ".1em", textTransform: "uppercase" as const }}>Hidden gap</p>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#b8860b" }}>Some drivers change behaviour</p>
              </div>
            </div>
            <div style={{ fontSize: 20, color: "var(--ink-soft)", flexShrink: 0 }}>→</div>
            <div style={{ flex: 1, textAlign: "center" as const }}>
              <div style={{ display: "inline-block", padding: "10px 16px", borderRadius: 10, background: "#edfbf3", border: "1px solid #259650" }}>
                <p style={{ margin: "0 0 2px", fontSize: 9, fontWeight: 800, color: "#259650", letterSpacing: ".1em", textTransform: "uppercase" as const }}>Conclusion</p>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>Introduce the charge</p>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--line)", padding: "10px 16px", background: "#fafafa" }}>
            <p style={{ margin: 0, fontSize: 12, color: "var(--ink)", lineHeight: 1.6 }}>
              The <strong>assumption</strong> fills the gap. Negate it — if the argument collapses without it, you found what the argument silently requires.
            </p>
          </div>
        </div>
      </>
    );
  }

  if (topicId === "logic-puzzles") {
    return (
      <>
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: "var(--ink)" }}>Set up a grid before you solve</h2>
        <div style={{ borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden", marginBottom: 28 }}>
          <div style={{ padding: "14px 16px", overflowX: "auto" as const }}>
            <table style={{ borderCollapse: "collapse" as const, width: "100%", minWidth: 300 }}>
              <thead>
                <tr>
                  <th style={{ padding: "6px 12px", background: t, border: "1px solid var(--line)", fontSize: 10, fontWeight: 800, color: c, textAlign: "left" as const }}>Slot</th>
                  {["Mon", "Tue", "Wed", "Thu", "Fri"].map(day => (
                    <th key={day} style={{ padding: "6px 12px", background: t, border: "1px solid var(--line)", fontSize: 11, fontWeight: 800, color: "var(--ink)", textAlign: "center" as const }}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: "8px 12px", background: t, border: "1px solid var(--line)", fontSize: 10, fontWeight: 800, color: c }}>Who</td>
                  <td style={{ padding: "8px 12px", border: "1px solid var(--line)", background: "#edfbf3", fontSize: 13, fontWeight: 900, color: "#259650", textAlign: "center" as const }}>J ✓</td>
                  <td style={{ padding: "8px 12px", border: "1px solid var(--line)", fontSize: 13, fontWeight: 700, color: "var(--ink)", textAlign: "center" as const }}>L</td>
                  <td style={{ padding: "8px 12px", border: "1px solid var(--line)", fontSize: 13, fontWeight: 700, color: "var(--ink)", textAlign: "center" as const }}>K</td>
                  <td style={{ padding: "8px 12px", border: "1px solid var(--line)", background: t, fontSize: 13, fontWeight: 700, color: "var(--ink-soft)", textAlign: "center" as const }}>N *</td>
                  <td style={{ padding: "8px 12px", border: "1px solid var(--line)", background: t, fontSize: 13, fontWeight: 700, color: "var(--ink-soft)", textAlign: "center" as const }}>M *</td>
                </tr>
              </tbody>
            </table>
            <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--ink-soft)" }}>* Fixed directly from the rules. The L-K block (adjacent rule) then forces Mon = J.</p>
          </div>
          <div style={{ borderTop: "1px solid var(--line)", padding: "10px 16px", background: "#fafafa" }}>
            <p style={{ margin: 0, fontSize: 12, color: "var(--ink)", lineHeight: 1.6 }}>
              Draw the grid before looking at the answer options. Trying to hold positions in your head wastes time and causes errors.
            </p>
          </div>
        </div>
      </>
    );
  }

  if (topicId === "venn-diagrams") {
    return (
      <>
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: "var(--ink)" }}>The formula in action</h2>
        <div style={{ borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden", marginBottom: 28 }}>
          <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column" as const, gap: 10 }}>
            <code style={{ padding: "11px 14px", borderRadius: 8, background: t, fontSize: 14, fontWeight: 800, color: "var(--ink)", fontFamily: "monospace", display: "block" }}>
              |A ∪ B| = |A| + |B| − |A ∩ B|
            </code>
            <code style={{ padding: "11px 14px", borderRadius: 8, background: "#fafafa", fontSize: 14, fontWeight: 800, color: "var(--ink)", fontFamily: "monospace", display: "block", border: "1px solid var(--line)" }}>
              77 = 62 + 51 − both → both = 36
            </code>
          </div>
          <div style={{ borderTop: "1px solid var(--line)", padding: "10px 16px" }}>
            <p style={{ margin: 0, fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.6 }}>
              Find the union first (100 − 23 = 77), then rearrange to find the overlap. Always check by summing all four regions back to the total.
            </p>
          </div>
        </div>
      </>
    );
  }

  if (topicId === "probability") {
    return (
      <>
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: "var(--ink)" }}>Convert to a frequency table first</h2>
        <div style={{ borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden", marginBottom: 28 }}>
          <div style={{ padding: "14px 16px", overflowX: "auto" as const }}>
            <table style={{ borderCollapse: "collapse" as const, width: "100%", fontSize: 12 }}>
              <thead>
                <tr>
                  {["", "Defective", "OK", "Total"].map((h, i) => (
                    <th key={i} style={{ padding: "6px 12px", background: t, border: "1px solid var(--line)", fontSize: 11, fontWeight: 800, color: i === 1 ? "#d94b3e" : i === 3 ? c : "var(--ink)", textAlign: i === 0 ? "left" as const : "center" as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Machine A", def: "120", ok: "5,880", total: "6,000" },
                  { label: "Machine B", def: "200", ok: "3,800", total: "4,000" },
                  { label: "Total", def: "320", ok: "9,680", total: "10,000", bold: true },
                ].map(r => (
                  <tr key={r.label}>
                    <td style={{ padding: "8px 12px", border: "1px solid var(--line)", background: t, fontWeight: 800, fontSize: 11, color: c }}>{r.label}</td>
                    <td style={{ padding: "8px 12px", border: "1px solid var(--line)", textAlign: "center" as const, fontWeight: r.bold ? 800 : 500, background: r.bold ? "#fff5f5" : undefined, color: r.bold ? "#d94b3e" : undefined }}>{r.def}</td>
                    <td style={{ padding: "8px 12px", border: "1px solid var(--line)", textAlign: "center" as const }}>{r.ok}</td>
                    <td style={{ padding: "8px 12px", border: "1px solid var(--line)", textAlign: "center" as const, fontWeight: r.bold ? 800 : 500 }}>{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--ink-soft)" }}>
              P(B | defective) = 200 ÷ 320 = <strong>62.5%</strong> — the answer comes straight off the table.
            </p>
          </div>
          <div style={{ borderTop: "1px solid var(--line)", padding: "10px 16px", background: "#fafafa" }}>
            <p style={{ margin: 0, fontSize: 12, color: "var(--ink)", lineHeight: 1.6 }}>
              Use 100, 1,000 or 10,000 as your base — whichever turns the percentages into whole numbers with no messy rounding.
            </p>
          </div>
        </div>
      </>
    );
  }

  return null;
}

// ─── DM lesson page (all 5 non-syllogism DM topics) ─────────────────────────

function DMLessonPage({ section, topic, pageId, onNavigate, onPractice }: {
  section: GuideSection;
  topic: NonNullable<ReturnType<typeof findTopic>>;
  pageId: string;
  onNavigate: (id: string) => void;
  onPractice: () => void;
}) {
  const c = section.color, t = section.tint, d = section.deep;
  const lesson = DM_LESSONS[topic.id];
  if (!lesson) return null;

  const row = (i: number, name: string, desc: string) => (
    <div key={name} style={{ display: "grid", gridTemplateColumns: "200px 1fr", borderTop: i > 0 ? "1px solid var(--line)" : undefined, background: "white" }}>
      <div style={{ padding: "11px 14px", background: t, borderRight: "1px solid var(--line)" }}>
        <strong style={{ fontSize: 11, fontWeight: 800, color: c, fontFamily: "monospace" }}>{name}</strong>
      </div>
      <p style={{ margin: 0, padding: "11px 14px", fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>{desc}</p>
    </div>
  );

  return (
    <>
      <GuidePageHeader section={section} pageId={pageId} title={topic.title} eyebrow="DM topic guide" subtitle={topic.description} />

      {/* Core idea */}
      <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--ink)", borderLeft: `3px solid ${c}`, background: t, padding: "13px 18px", borderRadius: "0 12px 12px 0", margin: "0 0 26px" }}>
        {lesson.idea}
      </p>

      {/* Method */}
      <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: "var(--ink)" }}>The method — step by step</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)", marginBottom: 28 }}>
        {lesson.method.map(([title, detail], i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "32px 1fr", background: "white", borderTop: i > 0 ? "1px solid var(--line)" : undefined }}>
            <div style={{ display: "grid", placeItems: "center", background: t, borderRight: "1px solid var(--line)" }}>
              <strong style={{ fontSize: 13, fontWeight: 900, color: c }}>{i + 1}</strong>
            </div>
            <div style={{ padding: "11px 14px" }}>
              <strong style={{ fontSize: 12, fontWeight: 800, color: d, display: "block", marginBottom: 2 }}>{title}</strong>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "var(--ink-soft)" }}>{detail}</p>
            </div>
          </div>
        ))}
      </div>

      <TopicVisual topicId={topic.id} color={c} tint={t} deep={d} />

      {/* Worked example */}
      <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: "var(--ink)" }}>Worked example</h2>
      <div style={{ borderRadius: 14, border: "1px solid var(--line)", background: "white", overflow: "hidden", marginBottom: 28 }}>
        <div style={{ padding: "10px 16px", background: t, borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
          <strong style={{ fontSize: 11, color: c, fontWeight: 800, letterSpacing: ".04em" }}>EXAMPLE</strong>
          <span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 600 }}>{lesson.example.title}</span>
        </div>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
          <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase" as const, letterSpacing: ".05em" }}>Given</p>
          {lesson.example.stimulus.map((s, i) => (
            <div key={i} style={{ padding: "6px 12px", borderRadius: 7, background: t, marginBottom: 5, fontSize: 13, color: "var(--ink)", fontStyle: "italic" }}>{s}</div>
          ))}
        </div>
        <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)", background: "#fafafa" }}>
          <p style={{ margin: "0 0 3px", fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase" as const, letterSpacing: ".05em" }}>Question</p>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{lesson.example.q}</p>
        </div>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
          <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase" as const, letterSpacing: ".05em" }}>Working</p>
          {lesson.example.steps.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 7 }}>
              <span style={{ width: 20, height: 20, borderRadius: 6, background: t, color: c, fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>{s}</p>
            </div>
          ))}
        </div>
        <div style={{ padding: "10px 16px", background: "#edfbf3", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20, background: "#259650", color: "white" }}>Answer</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#259650" }}>{lesson.example.answer}</span>
        </div>
      </div>

      {/* Rules */}
      <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: "var(--ink)" }}>Rules to remember</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)", marginBottom: 28 }}>
        {lesson.rules.map(([name, desc], i) => row(i, name, desc))}
      </div>

      <section className="vrg-bottom-practice">
        <div>
          <strong>Ready to practise {topic.title}?</strong>
          <p>We'll take you to the practice setup so you can choose your session and timing.</p>
        </div>
        <button className="vrg-practice-cta" onClick={onPractice} type="button">Set up practice →</button>
      </section>
      <GuidePageActions section={section} pageId={pageId} onNavigate={onNavigate} />
    </>
  );
}

// ─── QR lesson page ──────────────────────────────────────────────────────────

function QRLessonPage({ section, topic, pageId, onNavigate, onPractice }: {
  section: GuideSection;
  topic: NonNullable<ReturnType<typeof findTopic>>;
  pageId: string;
  onNavigate: (id: string) => void;
  onPractice: () => void;
}) {
  const c = section.color, t = section.tint, d = section.deep;
  const lesson = QR_LESSONS[topic.id];
  if (!lesson) return null;

  return (
    <>
      <GuidePageHeader section={section} pageId={pageId} title={topic.title} eyebrow="QR topic guide" subtitle={topic.description} />

      {/* Core idea */}
      <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--ink)", borderLeft: `3px solid ${c}`, background: t, padding: "13px 18px", borderRadius: "0 12px 12px 0", margin: "0 0 26px" }}>
        {lesson.idea}
      </p>

      {/* Where you'll see it */}
      <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: "var(--ink)" }}>Where this appears in QR questions</h2>
      <div style={{ borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden", marginBottom: 28 }}>
        {lesson.where.map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", background: "white", borderTop: i > 0 ? "1px solid var(--line)" : undefined }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: c, flexShrink: 0, marginTop: 6 }} />
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>{w}</p>
          </div>
        ))}
      </div>

      {/* Formulas */}
      <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: "var(--ink)" }}>Formulas</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {lesson.formulas.map((f, i) => (
          <div key={i} style={{ borderRadius: 12, border: `1.5px solid ${c}`, overflow: "hidden" }}>
            <div style={{ padding: "8px 14px", background: c }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: "white", letterSpacing: ".06em", textTransform: "uppercase" as const }}>{f.title}</span>
            </div>
            <div style={{ padding: "12px 16px", background: "white" }}>
              <div style={{ background: t, borderRadius: 8, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px 2px" }}>
                {f.parts.map((p, pi) =>
                  typeof p === "string"
                    ? <span key={pi} style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: d, whiteSpace: "pre" }}>{p}</span>
                    : <span key={pi} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", margin: "0 4px", verticalAlign: "middle" }}>
                        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: d, lineHeight: 1.2, paddingBottom: 2 }}>{p.top}</span>
                        <span style={{ display: "block", height: 2, background: d, borderRadius: 1, width: "100%", minWidth: 20 }} />
                        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: d, lineHeight: 1.2, paddingTop: 2 }}>{p.bottom}</span>
                      </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.6 }}>
                <strong style={{ color: "var(--ink)" }}>Example: </strong>{f.example}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Method */}
      <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: "var(--ink)" }}>The method — step by step</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)", marginBottom: 28 }}>
        {lesson.method.map(([title, detail], i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "36px 1fr", background: "white", borderTop: i > 0 ? "1px solid var(--line)" : undefined }}>
            <div style={{ display: "grid", placeItems: "center", background: t, borderRight: "1px solid var(--line)" }}>
              <strong style={{ fontSize: 13, fontWeight: 900, color: c }}>{i + 1}</strong>
            </div>
            <div style={{ padding: "11px 14px" }}>
              <strong style={{ fontSize: 12, fontWeight: 800, color: d, display: "block", marginBottom: 2 }}>{title}</strong>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "var(--ink-soft)" }}>{detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart demo (charts-graphs topic only) */}
      {lesson.chartDemo && (
        <>
          <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 6px", color: "var(--ink)" }}>{lesson.chartDemo.title}</h2>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--ink-soft)" }}>{lesson.chartDemo.caption}</p>
          <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)", marginBottom: 10 }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    {lesson.chartDemo.headers.map((h, i) => (
                      <th key={i} style={{ padding: "9px 14px", background: c, color: "white", fontWeight: 800, textAlign: "left", whiteSpace: "nowrap", borderRight: i < lesson.chartDemo!.headers.length - 1 ? "1px solid rgba(255,255,255,.2)" : undefined }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lesson.chartDemo.rows.map((row, ri) => (
                    <tr key={ri} style={{ background: ri % 2 === 0 ? "white" : t }}>
                      {row.map((cell, ci) => (
                        <td key={ci} style={{ padding: "9px 14px", borderTop: "1px solid var(--line)", borderRight: ci < row.length - 1 ? "1px solid var(--line)" : undefined, fontWeight: ci === 0 ? 700 : 400 }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ marginBottom: 28 }}>
            {lesson.chartDemo.notes.map((n, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "5px 0" }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: c, flexShrink: 0, marginTop: 2 }}>ⓘ</span>
                <p style={{ margin: 0, fontSize: 11, color: "var(--ink-soft)", lineHeight: 1.6 }}>{n}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Worked examples */}
      <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 14px", color: "var(--ink)" }}>Worked examples</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
        {lesson.worked.map((w, wi) => (
          <div key={wi} style={{ borderRadius: 14, border: "1px solid var(--line)", background: "white", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "9px 16px", background: t, borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 9px", borderRadius: 20, background: c, color: "white" }}>EXAMPLE {wi + 1}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{w.title}</span>
            </div>
            {/* Passage */}
            <div style={{ padding: "11px 16px", borderBottom: "1px solid var(--line)", background: "#fafafa" }}>
              <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 800, color: "var(--ink-soft)", textTransform: "uppercase" as const, letterSpacing: ".06em" }}>Given</p>
              <p style={{ margin: 0, fontSize: 13, color: "var(--ink)", lineHeight: 1.6, fontStyle: "italic" }}>{w.passage}</p>
            </div>
            {/* Question */}
            <div style={{ padding: "9px 16px", borderBottom: "1px solid var(--line)" }}>
              <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 800, color: "var(--ink-soft)", textTransform: "uppercase" as const, letterSpacing: ".06em" }}>Question</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{w.question}</p>
            </div>
            {/* Steps */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
              <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 800, color: "var(--ink-soft)", textTransform: "uppercase" as const, letterSpacing: ".06em" }}>Working</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 10, overflow: "hidden", border: "1px solid var(--line)" }}>
                {w.steps.map((s, si) => (
                  <div key={si} style={{ display: "grid", gridTemplateColumns: "26px 1fr 140px", background: si % 2 === 0 ? "white" : t, borderTop: si > 0 ? "1px solid var(--line)" : undefined }}>
                    <div style={{ display: "grid", placeItems: "center", borderRight: "1px solid var(--line)", padding: "8px 0" }}>
                      <span style={{ fontSize: 11, fontWeight: 900, color: c }}>{si + 1}</span>
                    </div>
                    <div style={{ padding: "8px 12px", borderRight: "1px solid var(--line)" }}>
                      <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 700, color: "var(--ink-soft)" }}>{s.label}</p>
                      <p style={{ margin: 0, fontSize: 12, fontFamily: "monospace", color: d, fontWeight: 600 }}>{s.calc}</p>
                    </div>
                    <div style={{ padding: "8px 12px", display: "flex", alignItems: "center" }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "var(--ink)" }}>= {s.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Answer */}
            <div style={{ padding: "9px 16px", background: "#edfbf3", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20, background: "#259650", color: "white" }}>Answer</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#259650" }}>{w.answer}</span>
            </div>
            {/* Trap */}
            {w.trap && (
              <div style={{ padding: "9px 16px", background: "#fff4f3", borderTop: "1px solid #ffd6d3", display: "flex", gap: 8 }}>
                <span style={{ fontSize: 13, flexShrink: 0 }}>⚠️</span>
                <p style={{ margin: 0, fontSize: 12, color: "#c0392b", lineHeight: 1.6 }}><strong>Common trap: </strong>{w.trap}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rules */}
      <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: "var(--ink)" }}>Rules to remember</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)", marginBottom: 28 }}>
        {lesson.rules.map(([name, desc], i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr", borderTop: i > 0 ? "1px solid var(--line)" : undefined, background: "white" }}>
            <div style={{ padding: "11px 14px", background: t, borderRight: "1px solid var(--line)" }}>
              <strong style={{ fontSize: 11, fontWeight: 800, color: c }}>{name}</strong>
            </div>
            <p style={{ margin: 0, padding: "11px 14px", fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>{desc}</p>
          </div>
        ))}
      </div>

      <section className="vrg-bottom-practice">
        <div>
          <strong>Ready to practise {topic.title}?</strong>
          <p>We'll take you to the practice setup so you can choose your session and timing.</p>
        </div>
        <button className="vrg-practice-cta" onClick={onPractice} type="button">Set up practice →</button>
      </section>
      <GuidePageActions section={section} pageId={pageId} onNavigate={onNavigate} />
    </>
  );
}

// ─── VR lesson data ──────────────────────────────────────────────────────────

type VRWorked = {
  title: string;
  passage: string;
  question: string;
  format: "tfct" | "mcq";
  options?: string[];
  correctIdx?: number;
  steps: { label: string; action: string }[];
  highlight: string;
  answer: string;
  trap?: string;
};

type VRLesson = {
  format: "tfct" | "mcq";
  idea: string;
  identify: string[];
  signals: string[];
  proveNotes: [string, string][];
  worked: VRWorked[];
  traps: [string, string][];
};

const VR_LESSONS: Record<string, VRLesson> = {
  "tfct-direct": {
    format: "tfct",
    idea: "The answer is explicitly stated in the passage. You are matching a statement to words that are already there — not inferring anything, just finding and confirming.",
    identify: [
      "The statement closely paraphrases one sentence in the passage.",
      "The question asks about a specific fact: who, what, when, where, how many.",
      "You should be able to underline a single sentence that settles the question.",
    ],
    signals: ["According to the passage…", "What happened…", "Where did…", "When did…", "Who…", "Which factor…"],
    proveNotes: [
      ["P — Passage only", "No outside knowledge. Everything you need is in the text."],
      ["R — Read the statement", "Break it into parts. Identify every specific claim (person, time, quantity)."],
      ["O — One anchor", "Pick the most distinctive word or number in the statement to scan for. Names and dates work best."],
      ["V — Verify every part", "A joined statement ('X happened and Y followed') needs both halves supported."],
      ["E — Evidence gap", "If the passage says nothing about a claim, that is Can't Tell — not False."],
    ],
    worked: [
      {
        title: "Direct fact — location",
        format: "tfct",
        passage: "The first clinical trials of the new malaria vaccine began in Kenya in 2014. Researchers initially recruited 600 adults before expanding the study to include children the following year.",
        question: "The first trials of the malaria vaccine began in Kenya.",
        steps: [
          { label: "Anchor", action: "Use 'first trials' — that phrase appears almost verbatim in the passage." },
          { label: "Locate", action: "Sentence 1: 'The first clinical trials of the new malaria vaccine began in Kenya in 2014.'" },
          { label: "Compare", action: "Statement says 'began in Kenya.' Passage says 'began in Kenya.' Exact match." },
          { label: "Decision", action: "The passage directly and explicitly supports the statement." },
        ],
        highlight: "The first clinical trials of the new malaria vaccine began in Kenya in 2014.",
        answer: "True",
      },
      {
        title: "Joined statement — both parts must hold",
        format: "tfct",
        passage: "The bridge was completed in 1887. It was opened to pedestrians only; motor vehicles were not permitted to cross until 1924.",
        question: "The bridge was completed in 1887 and was immediately open to all traffic.",
        steps: [
          { label: "Split the statement", action: "Part 1: 'completed in 1887' — Part 2: 'immediately open to all traffic'" },
          { label: "Verify Part 1", action: "Passage says 'completed in 1887.' Supported." },
          { label: "Verify Part 2", action: "Passage says 'pedestrians only' and motor vehicles not until 1924. 'All traffic' is contradicted." },
          { label: "Decision", action: "One part is contradicted. The whole statement is False." },
        ],
        highlight: "opened to pedestrians only; motor vehicles were not permitted to cross until 1924.",
        answer: "False",
        trap: "Part 1 is true — students who stop after matching the first clause choose True. Always check every clause.",
      },
      {
        title: "Silence is not contradiction",
        format: "tfct",
        passage: "The committee met three times during November. Its recommendations were submitted to the board in December.",
        question: "The committee met more than three times in November.",
        steps: [
          { label: "Anchor", action: "Use 'November' and 'committee met'." },
          { label: "Locate", action: "Passage says 'met three times during November.'" },
          { label: "Compare", action: "Statement says 'more than three times.' Passage says exactly three." },
          { label: "Does the passage contradict it?", action: "Yes — 'three times' directly contradicts 'more than three times.'" },
        ],
        highlight: "The committee met three times during November.",
        answer: "False",
        trap: "If the passage had said 'at least twice,' the answer would be Can't Tell — 'at least twice' doesn't rule out more meetings. Exact numbers do contradict.",
      },
    ],
    traps: [
      ["Stop after one keyword", "Matching the anchor word is step one, not the finish line. Read the whole evidence sentence."],
      ["Half-right trap", "Both parts of a joined statement must be supported. The first clause alone is not enough."],
      ["Missing a negative", "If the passage says 'not before 1900' and the statement says 'after 1900,' those are different claims."],
      ["Silence = Can't Tell", "If the passage simply doesn't mention something, that is Can't Tell — not False."],
    ],
  },

  "tfct-inference": {
    format: "tfct",
    idea: "The answer follows necessarily from the passage — it is not stated word for word, but it cannot be avoided given the evidence. The key question is: must this be true, not could it be true.",
    identify: [
      "The statement combines two or more facts from the passage.",
      "The conclusion is one step removed from the stated text.",
      "No single sentence settles the question alone.",
    ],
    signals: ["Which of the following can be inferred…", "What must follow…", "What can be concluded…", "It follows that…"],
    proveNotes: [
      ["P — Passage only", "Build the chain only from evidence in the passage. Do not import any real-world assumptions."],
      ["R — Read the conclusion", "Identify what the statement is actually claiming before searching for evidence."],
      ["O — One starting fact", "Find the first piece of evidence in the chain and anchor your reading there."],
      ["V — Verify necessity", "Ask: is any other outcome still possible? If yes, the conclusion is possible, not certain — Can't Tell."],
      ["E — Evidence gap", "False needs the passage to actively rule something out. Uncertainty alone is Can't Tell."],
    ],
    worked: [
      {
        title: "Two-fact chain",
        format: "tfct",
        passage: "For most of the year, the island's ferry service operated every two hours. During winter storms, however, crossings were frequently cancelled because the harbour became unsafe. Islanders were therefore advised to keep several days' supplies of essential goods at home between November and February.",
        question: "Winter weather can disrupt islanders' access to the mainland.",
        steps: [
          { label: "Anchor", action: "Use 'winter' — this anchors to the middle sentence." },
          { label: "Fact 1", action: "'During winter storms, crossings were frequently cancelled.'" },
          { label: "Fact 2", action: "'Islanders were advised to keep several days' supplies at home' — implying supply chains could be interrupted." },
          { label: "Chain", action: "Cancelled crossings → disrupted access. The conclusion must follow." },
          { label: "Decision", action: "The passage establishes this unavoidably. True." },
        ],
        highlight: "During winter storms, however, crossings were frequently cancelled because the harbour became unsafe.",
        answer: "True",
        trap: "Don't over-infer: 'The island is completely inaccessible in winter' is False — the passage says frequently, not always.",
      },
      {
        title: "Necessary vs merely possible",
        format: "tfct",
        passage: "All manuscripts catalogued before 1900 are stored in the off-site archive. The Alderton manuscript was catalogued in 1887.",
        question: "The Alderton manuscript is stored in the off-site archive.",
        steps: [
          { label: "Rule", action: "'All manuscripts catalogued before 1900 are stored off-site.'" },
          { label: "Fact", action: "'The Alderton manuscript was catalogued in 1887.'" },
          { label: "Apply", action: "1887 is before 1900, so the Alderton falls under the rule. It must be stored off-site." },
          { label: "Decision", action: "No other outcome is allowed. True." },
        ],
        highlight: "All manuscripts catalogued before 1900 are stored in the off-site archive.",
        answer: "True",
      },
    ],
    traps: [
      ["Possible vs certain", "'Could be true' is not the same as 'must be true.' If any doubt remains, choose Can't Tell."],
      ["Reversing a rule", "From 'all A are B' you cannot conclude 'all B are A.' The rule only runs one way."],
      ["Adding a cause", "If the passage shows two things happening together, that is not evidence of one causing the other."],
      ["Mixing groups", "Evidence about one group cannot automatically be applied to a different group in the same passage."],
    ],
  },

  "tfct-comparisons": {
    format: "tfct",
    idea: "The passage gives numbers, rankings or relationships. You must check whether the comparison in the statement matches what the passage actually says — including direction, base and time period.",
    identify: [
      "The statement uses comparison language: more, less, higher, lower, twice, faster, earlier.",
      "Numbers or percentages appear in the passage.",
      "The question involves ranking, proportion or change over time.",
    ],
    signals: ["Which was greater…", "Compared with…", "Twice as many…", "Higher than…", "Increased by…"],
    proveNotes: [
      ["P — Passage only", "Use only the figures given. Do not assume a starting value or typical baseline."],
      ["R — Name both things", "Identify what is being compared to what — the base matters as much as the figure."],
      ["O — Anchor on numbers", "Scan for the specific number or percentage mentioned in the statement."],
      ["V — Verify direction", "Check: is A higher than B or B higher than A? Reversals are the most common trap."],
      ["E — Evidence gap", "If the passage doesn't give one of the values needed, that is Can't Tell."],
    ],
    worked: [
      {
        title: "Percentage comparison — watch the base",
        format: "tfct",
        passage: "In the trial, Group A showed a 20% improvement in test scores. Group B showed a 15% improvement over the same period. Both groups started at the same baseline score of 60 points.",
        question: "Group A's final score was higher than Group B's final score.",
        steps: [
          { label: "Anchor", action: "Use 'Group A' and 'Group B' + 'score'." },
          { label: "Extract", action: "Both start at 60. Group A: 60 × 1.20 = 72. Group B: 60 × 1.15 = 69." },
          { label: "Compare", action: "72 > 69. Group A's final score is higher." },
          { label: "Decision", action: "True." },
        ],
        highlight: "Group A showed a 20% improvement… Group B showed a 15% improvement… Both groups started at the same baseline score of 60 points.",
        answer: "True",
        trap: "If the groups had different starting scores, you cannot compare percentages directly. Always check the base.",
      },
      {
        title: "Reversal trap",
        format: "tfct",
        passage: "Hospital A admitted 840 patients in Q1. Hospital B admitted 1,120 patients in the same period.",
        question: "Hospital A admitted more patients than Hospital B in Q1.",
        steps: [
          { label: "Extract A", action: "840 patients." },
          { label: "Extract B", action: "1,120 patients." },
          { label: "Compare", action: "840 < 1,120. A admitted fewer, not more." },
          { label: "Decision", action: "The statement says A > B, but the evidence says A < B. False." },
        ],
        highlight: "Hospital A admitted 840 patients in Q1. Hospital B admitted 1,120 patients in the same period.",
        answer: "False",
        trap: "Reversals feel obvious once spotted but are easy to miss when reading quickly under time pressure.",
      },
    ],
    traps: [
      ["Reversal", "Mixing up which thing is bigger. Always write A vs B with arrows before deciding."],
      ["Different bases", "Comparing percentages only works when the starting values are the same or the passage gives absolute figures."],
      ["Wrong time period", "A comparison in one year doesn't prove anything about a different year."],
      ["Association ≠ cause", "Even if A is higher than B, the passage may not say A caused B."],
    ],
  },

  "tfct-scope": {
    format: "tfct",
    idea: "The passage says something about a limited group or situation. The statement stretches that finding — using stronger, broader or more certain language than the evidence supports. Your job is to judge whether the claim stays within the passage's boundaries.",
    identify: [
      "The statement uses absolute or universal language: all, always, every, never, proves, causes, definitely.",
      "The passage uses qualified language: some, may, suggests, associated with, in this study.",
      "The claim is broader than the evidence: the passage studied one group; the statement claims everyone.",
    ],
    signals: ["All… always… every… never… only… must… proves… causes… entirely… definitely…"],
    proveNotes: [
      ["P — Passage only", "The passage defines the evidence boundary. Don't let outside knowledge expand it."],
      ["R — Read the scope words", "Circle every word in the statement that controls strength or breadth (all, may, causes, suggests)."],
      ["O — Locate the evidence", "Find the passage sentence that is most relevant to the statement."],
      ["V — Compare scope", "Is the statement's claim stronger or broader than the passage's evidence? If yes, it fails the scope test."],
      ["E — Evidence gap", "If the passage is silent on some of the claim, that is Can't Tell. Only False if the passage actively contradicts the scope."],
    ],
    worked: [
      {
        title: "Association is not causation",
        format: "tfct",
        passage: "A study of 1,200 university students found that those who regularly ate breakfast reported higher average concentration scores than students who skipped breakfast. The researchers noted that several other factors, including sleep and exercise, may have influenced the results. They therefore concluded that breakfast consumption was associated with concentration but that a causal relationship had not been established.",
        question: "Eating breakfast causes university students to concentrate better.",
        steps: [
          { label: "Scope word in statement", action: "'causes' — this is a strong causal claim." },
          { label: "Find evidence", action: "'breakfast consumption was associated with concentration' and 'a causal relationship had not been established.'" },
          { label: "Compare", action: "Statement: 'causes.' Passage: 'associated, not causal.' Direct contradiction." },
          { label: "Decision", action: "False — the passage explicitly rejects causation." },
        ],
        highlight: "breakfast consumption was associated with concentration but that a causal relationship had not been established.",
        answer: "False",
        trap: "The study does show a positive link — that makes True tempting. But the passage uses 'associated,' not 'causes.'",
      },
      {
        title: "Some vs all — Can't Tell boundary",
        format: "tfct",
        passage: "Several employees who took part in the four-day working week trial reported improved job satisfaction.",
        question: "All employees experienced improved job satisfaction during the trial.",
        steps: [
          { label: "Scope word in statement", action: "'All' — universal claim." },
          { label: "Evidence scope", action: "'Several employees' — partial, not universal." },
          { label: "Does the passage say some didn't improve?", action: "No — it only says 'several reported improvement.'" },
          { label: "Decision", action: "Can't prove all. Can't prove not-all either. Can't Tell." },
        ],
        highlight: "Several employees who took part in the four-day working week trial reported improved job satisfaction.",
        answer: "Can't Tell",
        trap: "Choosing False because 'several ≠ all' — that's the most common mistake here. The passage doesn't say some didn't improve, so you cannot call it False.",
      },
    ],
    traps: [
      ["Some → All", "Some, several, many — these are not all. But they don't prove 'not all' either. The gap is Can't Tell."],
      ["May → Will", "The treatment may reduce symptoms ≠ the treatment will reduce symptoms."],
      ["One study → Universal", "A single study, sample or trial cannot prove a universal claim."],
      ["Suggesting → Proving", "'The results suggest' is softer than 'the results prove.' Match the strength exactly."],
      ["No evidence → False", "If the passage doesn't address a claim, that is Can't Tell, not False."],
    ],
  },

  "mcq-direct": {
    format: "mcq",
    idea: "One of the four options accurately restates a specific fact from the passage. The other three either misquote a detail, apply it to the wrong person or time period, or use near-match wording that quietly changes the meaning.",
    identify: [
      "The stem asks for a specific fact: who, what, when, where, how many, which one.",
      "The stem often says 'according to the passage' or 'what does the passage state.'",
      "One option will match a single sentence in the passage closely.",
    ],
    signals: ["According to the passage…", "What does the passage say about…", "Which of the following is stated…", "What did X do…", "When did…"],
    proveNotes: [
      ["P — Passage only", "Don't rely on what you know about the topic. Only what this passage says counts."],
      ["R — Name the target detail", "Identify exactly what you're hunting: a person, date, place, action or quantity."],
      ["O — Most distinctive word", "Use the rarest word in the stem — a name, unusual term or number — as your scan anchor."],
      ["V — Test every clause", "Read the whole option, not just the part that sounds familiar. The wrong clause is often at the end."],
      ["E — Eliminate explicitly", "Rule each wrong option out by pointing to what the passage says instead."],
    ],
    worked: [
      {
        title: "Right fact, wrong person",
        format: "mcq",
        passage: "Dr Yuen led the original research project in 2019. Her colleague Dr Marsh joined the team in 2021 and took over project leadership when Dr Yuen moved to a different institution the following year.",
        question: "According to the passage, who led the research project from 2022?",
        options: ["Dr Yuen", "Dr Marsh", "Both Dr Yuen and Dr Marsh jointly", "The passage does not say"],
        correctIdx: 1,
        steps: [
          { label: "Anchor", action: "Use '2022' — the question asks about leadership from that year." },
          { label: "Locate", action: "'Dr Yuen moved to a different institution the following year' — the year after 2021 is 2022. Dr Marsh 'took over project leadership' at that point." },
          { label: "Test Option A", action: "Dr Yuen moved away in 2022. Eliminated." },
          { label: "Test Option B", action: "Dr Marsh took over leadership. Supported by the passage." },
          { label: "Decision", action: "B." },
        ],
        highlight: "Dr Marsh joined the team in 2021 and took over project leadership when Dr Yuen moved to a different institution the following year.",
        answer: "B — Dr Marsh",
        trap: "Dr Yuen is the first name mentioned and leads the project initially — a hurried reading assigns 2022 leadership to her.",
      },
      {
        title: "Near-match wording",
        format: "mcq",
        passage: "The scheme was proposed in 2019 and approved by the council in June 2020. Construction began the following January and the facility opened to the public in March 2022.",
        question: "According to the passage, when did the scheme receive council approval?",
        options: ["2019", "June 2020", "January 2021", "March 2022"],
        correctIdx: 1,
        steps: [
          { label: "Target", action: "'Council approval' — scan for that phrase or synonyms." },
          { label: "Locate", action: "'approved by the council in June 2020.'" },
          { label: "Match", action: "Option B: 'June 2020.' Exact match." },
          { label: "Eliminate others", action: "2019 = proposed. January 2021 = construction start. March 2022 = opening." },
        ],
        highlight: "approved by the council in June 2020.",
        answer: "B — June 2020",
        trap: "2019 is the first year mentioned and 'proposed' sounds close to 'approved.' Check what happened in each year.",
      },
    ],
    traps: [
      ["Right fact, wrong person", "The detail is real but the passage assigns it to someone else."],
      ["Right fact, wrong time", "The event happened — but in a different year or phase."],
      ["Near-match wording", "One word changes the meaning: 'planned' vs 'launched,' 'proposed' vs 'approved.'"],
      ["Familiar option", "An option feels right because it's the first thing mentioned — always verify against the passage."],
    ],
  },

  "mcq-inference": {
    format: "mcq",
    idea: "The right answer follows necessarily from the passage but is not stated word for word. It uses the fewest assumptions, the mildest language, and stays closest to what the text actually establishes.",
    identify: [
      "The stem says 'can be inferred,' 'most reasonably concluded,' 'most strongly suggested.'",
      "No single sentence states the answer directly.",
      "You need to combine two or more details to reach a conclusion.",
    ],
    signals: ["Which of the following can be inferred…", "What can be most reasonably concluded…", "The passage most strongly suggests…", "What must follow from…"],
    proveNotes: [
      ["P — Passage only", "Real-world assumptions disqualify an answer. Every step of the chain must come from the passage."],
      ["R — Identify the region", "Work out which part of the passage the question draws from before looking at the options."],
      ["O — Evidence anchor", "Find the central piece of evidence the inference depends on."],
      ["V — Check for added assumptions", "Ask of each option: does reaching this conclusion require any fact the passage doesn't give?"],
      ["E — Eliminate the travellers", "Reject options that travel furthest from the text. The right answer often sounds modest."],
    ],
    worked: [
      {
        title: "Narrowest safe conclusion",
        format: "mcq",
        passage: "A community organisation tracked volunteering hours over two years. When coordinators were assigned to specific roles with clear descriptions, volunteers stayed for significantly longer periods than when roles were loosely defined. The organisation also noted that recruitment costs fell during the second year when retention improved.",
        question: "Which of the following can be inferred from the passage?",
        options: [
          "Role clarity is the sole factor that determines volunteer retention.",
          "Volunteer retention may be linked to the clarity of role descriptions.",
          "The organisation will continue to use clear role descriptions in future.",
          "All organisations benefit from assigning specific volunteer roles.",
        ],
        correctIdx: 1,
        steps: [
          { label: "Central evidence", action: "'volunteers stayed for significantly longer periods' when roles had 'clear descriptions.'" },
          { label: "Test A", action: "'Sole factor' — the passage shows a link but does not rule out other factors. Too strong." },
          { label: "Test B", action: "'May be linked' — cautious language. The passage establishes a correlation. This fits." },
          { label: "Test C", action: "Future plans — the passage says nothing about what the organisation will do next. Can't infer." },
          { label: "Test D", action: "'All organisations' — the passage studies one organisation. Far too broad." },
        ],
        highlight: "When coordinators were assigned to specific roles with clear descriptions, volunteers stayed for significantly longer periods.",
        answer: "B — Volunteer retention may be linked to the clarity of role descriptions",
        trap: "Option A sounds like a strong summary — but 'sole factor' goes beyond what one study can establish.",
      },
    ],
    traps: [
      ["Too strong", "Absolute language (only, always, proves) nearly always fails. The right answer is usually cautious."],
      ["Outside knowledge", "Something that is true in general may not be established by this specific passage."],
      ["Cause from correlation", "Two things happening together doesn't mean one caused the other."],
      ["Future prediction", "What the passage reports about the past doesn't prove what will happen next."],
    ],
  },

  "mcq-main-idea": {
    format: "mcq",
    idea: "The question asks for the central message of the whole passage — what the author is mainly arguing or doing. Wrong options either describe just one example (too narrow) or go beyond the passage entirely (too broad).",
    identify: [
      "The stem asks for the main point, best summary, best title or primary purpose.",
      "You need to account for the whole passage, not just one part.",
      "The right answer describes the argument's direction, not just its topic.",
    ],
    signals: ["The main point of the passage is…", "The passage is primarily about…", "Which best summarises…", "The best title for this passage would be…", "The primary purpose of the passage is…"],
    proveNotes: [
      ["P — Passage only", "The main idea must be grounded in the passage — don't go beyond what it argues."],
      ["R — Read opening and closing", "The author's central argument usually appears near the start and is restated at the end."],
      ["O — One structural turn", "Find the major contrast or pivot in the passage — 'however,' 'but,' 'yet' often mark the author's real point."],
      ["V — Breadth check", "The right answer covers the whole passage. Too narrow = one example. Too broad = not established."],
      ["E — Eliminate scope errors", "A detail that appears once cannot be the main point, however vivid."],
    ],
    worked: [
      {
        title: "Detail vs whole argument",
        format: "mcq",
        passage: "For decades, governments have attempted to reduce traffic congestion primarily by building additional roads. Such projects can initially improve journey times, but the effect is often temporary because greater road capacity encourages more people to drive. Public transport investment, cycling infrastructure and changes to land use may therefore be needed alongside road expansion. The challenge of congestion is not simply a shortage of road space, but a consequence of how cities organise and encourage travel.",
        question: "Which option best summarises the main point of the passage?",
        options: [
          "Building roads is always a waste of public money.",
          "Traffic congestion requires a broader approach than simply expanding road capacity.",
          "Cycling is the most effective solution to urban congestion.",
          "Governments have consistently failed to manage urban infrastructure.",
        ],
        correctIdx: 1,
        steps: [
          { label: "Opening claim", action: "Governments have relied on building roads." },
          { label: "Major turn", action: "'but the effect is often temporary' — the author questions this approach." },
          { label: "Conclusion", action: "'not simply a shortage of road space, but a consequence of how cities organise travel.'" },
          { label: "Test A", action: "'Always a waste' — the passage says roads can help temporarily. Too strong." },
          { label: "Test B", action: "'Broader approach needed' — exactly what the whole passage argues." },
          { label: "Test C", action: "Cycling is one example. The passage doesn't say it's the best solution." },
          { label: "Test D", action: "'Consistently failed' — too strong and too broad." },
        ],
        highlight: "The challenge of congestion is not simply a shortage of road space, but a consequence of how cities organise and encourage travel.",
        answer: "B — Traffic congestion requires a broader approach than simply expanding road capacity",
        trap: "Option C (cycling) appears in the passage — but mentioning something once doesn't make it the main point.",
      },
    ],
    traps: [
      ["Vivid detail", "A striking statistic or example can feel like the main point but is often just evidence."],
      ["Topic without angle", "Naming the subject is not the same as capturing the author's argument about it."],
      ["Ignoring the conclusion", "The final sentence often contains the real thesis — don't skip it."],
      ["Too narrow", "Any answer that only describes one paragraph, example or study is probably wrong."],
    ],
  },

  "mcq-viewpoint": {
    format: "mcq",
    idea: "The question asks whose view a statement represents, or what the author (or a named person) actually thinks. Passages contain many voices — critics, researchers, supporters — and wrong options mix them up or misread the strength of each position.",
    identify: [
      "The stem asks about the author's view, a named person's opinion, or the author's attitude.",
      "The passage quotes or describes several different viewpoints.",
      "Contrast words (however, yet, although) often signal where the author's own voice appears.",
    ],
    signals: ["The author argues…", "According to the passage, X believes…", "Which best reflects the author's view…", "Which statement best describes the author's attitude…"],
    proveNotes: [
      ["P — Passage only", "The author's view is in the text — you don't need to guess or infer motives."],
      ["R — Name the speaker", "Before scanning, decide whose view is being tested."],
      ["O — Contrast words", "Scan for however, yet, but, although — these often mark the author's own position after presenting others."],
      ["V — Verify strength", "Match the option's certainty to the passage's language. A cautious view should stay cautious."],
      ["E — Eliminate speaker swaps", "If an option correctly states what a critic says but attributes it to the author, it is wrong."],
    ],
    worked: [
      {
        title: "Author vs critic — using 'however'",
        format: "mcq",
        passage: "Critics of urban tree-planting programmes argue that their environmental impact is frequently exaggerated. It is true that planting trees alone cannot solve the problem of urban air pollution. However, dismissing such programmes on this basis would be equally misguided. Trees can lower local temperatures, provide habitats for wildlife and improve residents' access to green space. Urban planting should therefore be regarded as one useful component of a broader environmental strategy rather than a complete solution.",
        question: "Which statement best reflects the author's view?",
        options: [
          "Urban tree planting is largely ineffective.",
          "Urban tree planting cannot solve air pollution alone.",
          "Urban tree planting is useful but should be part of a wider strategy.",
          "Critics of urban tree planting have no valid concerns.",
        ],
        correctIdx: 2,
        steps: [
          { label: "Identify contrast", action: "'However, dismissing such programmes on this basis would be equally misguided.' — 'However' signals the author's voice." },
          { label: "Author's conclusion", action: "'Urban planting should therefore be regarded as one useful component of a broader environmental strategy.'" },
          { label: "Test A", action: "The author says dismissing is 'misguided' — they do not say it is ineffective." },
          { label: "Test B", action: "True but this is what the author concedes, not the main argument." },
          { label: "Test C", action: "Matches: useful but part of a wider strategy." },
          { label: "Test D", action: "Author concedes critics have some point — this option is too extreme." },
        ],
        highlight: "Urban planting should therefore be regarded as one useful component of a broader environmental strategy rather than a complete solution.",
        answer: "C — Urban tree planting is useful but should be part of a wider strategy",
        trap: "Option A captures the critics' view, not the author's. 'Critics argue…' is the signal that this is not the author speaking.",
      },
    ],
    traps: [
      ["Speaker-author swap", "A view the author reports or challenges is not automatically the author's own view."],
      ["Neutral = no opinion", "An author who presents both sides may still have a position — usually revealed after a contrast word."],
      ["Too strong", "An author who says 'may be' does not 'believe definitively.' Match the strength."],
      ["Concession as agreement", "The author may concede a point before arguing against it. The concession is not their main view."],
    ],
  },

  "mcq-meaning": {
    format: "mcq",
    idea: "The question quotes a word or phrase from the passage and asks what it means in that specific context. The most familiar dictionary meaning is often a trap — the passage context decides.",
    identify: [
      "The stem quotes a specific word or phrase in quotation marks.",
      "The question asks what the word 'most nearly means' or what the phrase 'refers to.'",
      "Context (the surrounding sentences) will narrow the meaning."],
    signals: ["In the context of the passage, 'X' most nearly means…", "The phrase '…' is used to mean…", "What does the author mean when they say '…'"],
    proveNotes: [
      ["P — Passage only", "The passage context is the only valid source. The dictionary is not."],
      ["R — Read the sentence before and after", "The meaning is shaped by what comes immediately around the word."],
      ["O — Tone anchor", "Decide whether the word is being used positively, negatively or neutrally — this narrows your options."],
      ["V — Swap each option", "Replace the word with each option and check whether the sentence still makes sense logically and tonally."],
      ["E — Eliminate by tone or logic", "If an option changes the tone or logic of the sentence, it is wrong."],
    ],
    worked: [
      {
        title: "Figurative vs literal",
        format: "mcq",
        passage: "The inquiry cast light on the opaque practices that had developed over two decades. Several officials who had assumed their decisions would never be scrutinised were taken aback by the thoroughness of the investigation.",
        question: "In the context of the passage, 'cast light on' most nearly means:",
        options: ["physically illuminated", "revealed or made clear", "celebrated", "questioned the legality of"],
        correctIdx: 1,
        steps: [
          { label: "Read around the phrase", action: "The inquiry 'cast light on opaque practices' — opaque means hidden or unclear." },
          { label: "Test A", action: "'Physically illuminated' — literal interpretation of 'light.' Context is about uncovering hidden practices, not actual light." },
          { label: "Test B", action: "'Revealed or made clear' — fits the idea of making opaque things visible." },
          { label: "Test C", action: "'Celebrated' — the passage says officials were 'taken aback,' not that anything was praised." },
          { label: "Test D", action: "'Questioned the legality' — the passage says nothing about legality." },
        ],
        highlight: "The inquiry cast light on the opaque practices that had developed over two decades.",
        answer: "B — revealed or made clear",
        trap: "Option A (physically illuminated) is the literal meaning of 'cast light.' In context it is always figurative.",
      },
    ],
    traps: [
      ["Familiar definition", "The most common meaning of a word may be wrong in this specific context."],
      ["Ignoring figurative use", "Words used metaphorically or idiomatically don't mean what they say literally."],
      ["Wrong tone", "A replacement word with the right meaning but wrong emotion (sarcastic vs sincere) is still wrong."],
      ["Partial match", "An option that matches one part of the phrase but not the whole surrounding meaning."],
    ],
  },
};

// ─── VR overview page ─────────────────────────────────────────────────────────

const VR_SUBTYPES: { id: string; title: string; format: "tfct" | "mcq"; spot: string; quick: string }[] = [
  { id: "tfct-direct",      format: "tfct", title: "Direct Retrieval",       spot: "The answer is explicitly stated in the passage.",                            quick: "Where does it say this?" },
  { id: "tfct-inference",   format: "tfct", title: "Inference",               spot: "The conclusion must follow necessarily from two or more facts.",             quick: "Must this be true?" },
  { id: "tfct-comparisons", format: "tfct", title: "Comparisons",             spot: "The statement describes a ranking, amount or relationship.",                 quick: "Direction, base and time correct?" },
  { id: "tfct-scope",       format: "tfct", title: "Scope & Evidence",        spot: "The claim may be stronger or broader than the passage's evidence.",          quick: "Is this going beyond the evidence?" },
  { id: "mcq-direct",       format: "mcq",  title: "Direct Retrieval (MCQ)",  spot: "One option accurately restates a specific fact.",                           quick: "Which option matches the text?" },
  { id: "mcq-inference",    format: "mcq",  title: "Inference (MCQ)",         spot: "The right answer follows from the text using the fewest assumptions.",       quick: "Does this require any added assumption?" },
  { id: "mcq-main-idea",    format: "mcq",  title: "Main Idea & Purpose",     spot: "The question asks what the passage is mainly arguing or doing.",             quick: "Is this the whole passage or one detail?" },
  { id: "mcq-viewpoint",    format: "mcq",  title: "Author & Speaker View",   spot: "You must identify who holds a view and how strongly.",                       quick: "Whose opinion — and how certain?" },
  { id: "mcq-meaning",      format: "mcq",  title: "Meaning in Context",      spot: "A quoted word or phrase — what does it mean in this passage?",               quick: "What meaning fits this sentence?" },
];

const PROVE_FULL: { letter: string; name: string; body: string; color: string }[] = [
  { letter: "P", name: "Passage only",        color: "#2D7FF9", body: "The passage is your entire world. Do not use outside knowledge, assumptions or what is 'probably' true. If the passage does not say it, you cannot use it." },
  { letter: "R", name: "Read the question",   color: "#8B6BFF", body: "Before reading closely, work out what you are being asked. Notice strong words like all, always, every, never, only — these often create traps." },
  { letter: "O", name: "One anchor word",     color: "#3DBE6C", body: "Use the most distinctive word in the question to locate the relevant part of the passage. Names, dates and unusual terms work best." },
  { letter: "V", name: "Verify",              color: "#FF9500", body: "Ask: does the passage actually support this exact answer? Compare the wording and strength of the evidence against the statement." },
  { letter: "E", name: "Evidence",            color: "#FF6B5C", body: "Before choosing, you should be able to say: 'I know this because the passage says…' If you cannot point to the sentence, be suspicious." },
];

function VROverviewPage({ section, pageId, onNavigate }: { section: GuideSection; pageId: string; onNavigate: (id: string) => void }) {
  const tfct = VR_SUBTYPES.filter(s => s.format === "tfct");
  const mcq  = VR_SUBTYPES.filter(s => s.format === "mcq");

  return (
    <>
      <GuidePageHeader section={section} pageId={pageId} title="VR overview" eyebrow="Start here" subtitle="Find evidence — judge it honestly — stay inside the passage." />

      {/* Section stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 26 }}>
        {[["44", "questions"], ["22 min", "section time"], ["~2 min", "per passage"], ["11", "passages"]].map(([v, l]) => (
          <div key={l} style={{ padding: "14px 16px", borderRadius: 12, border: "1px solid var(--line)", background: "white", textAlign: "center" }}>
            <strong style={{ display: "block", fontSize: 22, fontWeight: 850, color: "var(--section)", lineHeight: 1.1 }}>{v}</strong>
            <small style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600 }}>{l}</small>
          </div>
        ))}
      </div>

      {/* PROVE method */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 17 }}>One method for almost every question — PROVE</h2>
        <p style={{ margin: "0 0 14px", fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6 }}>Use this five-step check instead of trying to remember separate approaches for each question type.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {PROVE_FULL.map(p => (
            <div key={p.letter} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}>
              <div style={{ background: p.color, padding: "10px 12px" }}>
                <span style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 900, color: "white", lineHeight: 1 }}>{p.letter}</span>
                <span style={{ display: "block", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.85)", marginTop: 2, letterSpacing: "0.04em", textTransform: "uppercase" }}>{p.name}</span>
              </div>
              <div style={{ padding: "10px 12px", background: "white" }}>
                <p style={{ margin: 0, fontSize: 11.5, lineHeight: 1.65, color: "var(--ink)" }}>{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Two formats */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 17 }}>Two question formats</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "True / False / Can't Tell", short: "T/F/CT", color: "#2D7FF9", bg: "#EAF2FF", desc: "A statement is given. Decide whether the passage supports it, contradicts it, or leaves it unresolved. The most important rule: no evidence ≠ False. Silence means Can't Tell." },
            { label: "Multiple Choice", short: "A–D", color: "#8B6BFF", bg: "#F1ECFF", desc: "Four options. One is best supported by the passage. Distractors borrow real details and quietly change a word, person, time or strength. Eliminate by evidence, not by feel." },
          ].map(f => (
            <div key={f.label} style={{ borderRadius: 12, border: `2px solid ${f.color}`, background: f.bg, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 900, color: f.color, background: "white", borderRadius: 8, padding: "4px 10px", border: `1.5px solid ${f.color}` }}>{f.short}</span>
                <strong style={{ fontSize: 14, fontWeight: 800, color: f.color }}>{f.label}</strong>
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "var(--ink)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TFCT subtypes */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 13, color: "#2D7FF9", background: "#EAF2FF", padding: "3px 9px", borderRadius: 6 }}>T/F/CT</span>
          <h2 style={{ margin: 0, fontSize: 16 }}>True / False / Can't Tell subtypes</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {tfct.map((s, i) => (
            <article
              key={s.id}
              onClick={() => onNavigate(s.id)}
              style={{ borderRadius: 12, border: "1.5px solid var(--line)", background: "white", padding: "18px 20px", cursor: "pointer", transition: "box-shadow 0.15s" }}
              onMouseOver={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)")}
              onMouseOut={e => (e.currentTarget.style.boxShadow = "")}
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && onNavigate(s.id)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2D7FF9", background: "#EAF2FF", padding: "2px 8px", borderRadius: 4 }}>TFCT {i + 1}</span>
                <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>→</span>
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 800 }}>{s.title}</h3>
              <p style={{ margin: "0 0 10px", fontSize: 12.5, lineHeight: 1.6, color: "var(--ink)" }}>{s.spot}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "#EAF2FF", borderRadius: 7 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#2D7FF9" }}>QUICK CHECK</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#1a5fd0", fontStyle: "italic" }}>{s.quick}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* MCQ subtypes */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 13, color: "#8B6BFF", background: "#F1ECFF", padding: "3px 9px", borderRadius: 6 }}>A–D</span>
          <h2 style={{ margin: 0, fontSize: 16 }}>Multiple Choice subtypes</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {mcq.map((s, i) => (
            <article
              key={s.id}
              onClick={() => onNavigate(s.id)}
              style={{ borderRadius: 12, border: "1.5px solid var(--line)", background: "white", padding: "18px 20px", cursor: "pointer", transition: "box-shadow 0.15s" }}
              onMouseOver={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)")}
              onMouseOut={e => (e.currentTarget.style.boxShadow = "")}
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && onNavigate(s.id)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B6BFF", background: "#F1ECFF", padding: "2px 8px", borderRadius: 4 }}>MCQ {i + 1}</span>
                <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>→</span>
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 800 }}>{s.title}</h3>
              <p style={{ margin: "0 0 10px", fontSize: 12.5, lineHeight: 1.6, color: "var(--ink)" }}>{s.spot}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "#F1ECFF", borderRadius: 7 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#8B6BFF" }}>QUICK CHECK</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#6747d8", fontStyle: "italic" }}>{s.quick}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* TFCT decision rules */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 17 }}>T/F/CT — the three decisions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            { label: "TRUE", color: "#3DBE6C", bg: "#EDFBF3", desc: "The passage states or clearly implies it. You can point to the sentence." },
            { label: "FALSE", color: "#FF6B5C", bg: "#FFEDEA", desc: "The passage gives evidence against it. Silence alone is never enough for False." },
            { label: "CAN'T TELL", color: "#FF9500", bg: "#FFF8EC", desc: "The passage neither proves nor contradicts it. When in doubt, this is usually right." },
          ].map(d => (
            <div key={d.label} style={{ borderRadius: 12, background: d.bg, border: `1.5px solid ${d.color}`, padding: "16px 18px" }}>
              <strong style={{ display: "block", fontSize: 13, fontWeight: 900, color: d.color, marginBottom: 8 }}>{d.label}</strong>
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "var(--ink)" }}>{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top traps */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ margin: "0 0 12px", fontSize: 17 }}>Top traps across all VR questions</h2>
        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}>
          {[
            ["Some → All", "The passage says some or several. The option says all or every. Wrong unless the passage says all."],
            ["May → Will", "The passage says may or might. The option says will or does. Too strong."],
            ["Association → Causation", "Two things correlate in the passage. The option says one caused the other. Not established."],
            ["False vs Can't Tell", "No evidence for a claim ≠ evidence against it. Uncertainty is Can't Tell."],
            ["Outside knowledge", "Something true in real life is irrelevant unless this passage says it. Passage only."],
          ].map(([name, desc], i) => (
            <div key={name as string} style={{ display: "grid", gridTemplateColumns: "160px 1fr", borderTop: i > 0 ? "1px solid var(--line)" : undefined, background: "white" }}>
              <div style={{ padding: "12px 14px", background: "#EAF2FF", borderRight: "1px solid var(--line)" }}>
                <strong style={{ fontSize: 12, fontWeight: 800, color: "#2D7FF9" }}>{name}</strong>
              </div>
              <p style={{ margin: 0, padding: "12px 14px", fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <GuidePageActions section={section} pageId={pageId} onNavigate={onNavigate} />
    </>
  );
}

// ─── VR lesson page ───────────────────────────────────────────────────────────

function VRLessonPage({ section, topic, pageId, onNavigate, onPractice }: {
  section: GuideSection; topic: NonNullable<ReturnType<typeof findTopic>>;
  pageId: string; onNavigate: (id: string) => void; onPractice: () => void;
}) {
  const lesson = VR_LESSONS[topic.id];
  if (!lesson) return <TopicPage section={section} topic={topic} pageId={pageId} onNavigate={onNavigate} onPractice={onPractice} />;

  const fmtColor = lesson.format === "tfct" ? "#2D7FF9" : "#8B6BFF";
  const fmtBg    = lesson.format === "tfct" ? "#EAF2FF" : "#F1ECFF";
  const fmtLabel = lesson.format === "tfct" ? "True / False / Can't Tell" : "Multiple Choice";

  return (
    <>
      <GuidePageHeader section={section} pageId={pageId} title={topic.title} eyebrow={`VR — ${fmtLabel}`} subtitle={topic.description} />

      {/* Format badge + big idea */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 20 }}>
        <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 12, color: fmtColor, background: fmtBg, padding: "4px 10px", borderRadius: 6, flexShrink: 0, marginTop: 2 }}>
          {lesson.format === "tfct" ? "T/F/CT" : "A–D"}
        </span>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: "var(--ink)", background: fmtBg, borderLeft: `3px solid ${fmtColor}`, padding: "12px 16px", borderRadius: "0 10px 10px 0", flex: 1 }}>
          {lesson.idea}
        </p>
      </div>

      {/* How to identify */}
      <section style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>How to identify this type</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {lesson.identify.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ width: 20, height: 20, borderRadius: 6, background: fmtBg, color: fmtColor, fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--ink)" }}>{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Signal words */}
      <section style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Signal wording in question stems</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {lesson.signals.map((s, i) => (
            <span key={i} style={{ background: fmtBg, color: fmtColor, border: `1px solid ${fmtColor}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>{s}</span>
          ))}
        </div>
      </section>

      {/* PROVE breakdown */}
      <section style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>PROVE for this question type</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}>
          {lesson.proveNotes.map(([label, note], i) => (
            <div key={label} style={{ display: "grid", gridTemplateColumns: "160px 1fr", borderTop: i > 0 ? "1px solid var(--line)" : undefined, background: "white" }}>
              <div style={{ padding: "11px 14px", background: fmtBg, borderRight: "1px solid var(--line)" }}>
                <strong style={{ fontSize: 12, fontWeight: 800, color: fmtColor }}>{label}</strong>
              </div>
              <p style={{ margin: 0, padding: "11px 14px", fontSize: 12.5, lineHeight: 1.6, color: "var(--ink)" }}>{note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Worked examples */}
      <section style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 16 }}>Worked examples</h2>
        {lesson.worked.map((w, wi) => (
          <div key={wi} style={{ marginBottom: 18, borderRadius: 12, border: "1.5px solid var(--line)", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "12px 16px", background: fmtBg, borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: fmtColor, background: "white", border: `1px solid ${fmtColor}`, borderRadius: 5, padding: "2px 8px" }}>
                Example {wi + 1}
              </span>
              <strong style={{ fontSize: 13, color: "var(--ink)" }}>{w.title}</strong>
            </div>

            <div style={{ padding: "16px 18px", background: "white" }}>
              {/* Passage */}
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px", marginBottom: 12, borderLeft: "3px solid #cbd5e1" }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-soft)", display: "block", marginBottom: 6 }}>Passage</span>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: "var(--ink)", fontStyle: "italic" }}>{w.passage}</p>
              </div>

              {/* Question */}
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-soft)", display: "block", marginBottom: 5 }}>Question</span>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--ink)", lineHeight: 1.5 }}>{w.question}</p>
              </div>

              {/* MCQ options if present */}
              {w.options && (
                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
                  {w.options.map((opt, oi) => (
                    <div key={oi} style={{ display: "flex", gap: 8, alignItems: "center", padding: "7px 12px", borderRadius: 7, background: oi === w.correctIdx ? "#EDFBF3" : "#f8fafc", border: `1px solid ${oi === w.correctIdx ? "#3DBE6C" : "var(--line)"}` }}>
                      <span style={{ fontWeight: 900, fontSize: 12, color: oi === w.correctIdx ? "#3DBE6C" : "var(--ink-soft)", flexShrink: 0 }}>{String.fromCharCode(65 + oi)}.</span>
                      <span style={{ fontSize: 12.5, color: "var(--ink)" }}>{opt}</span>
                      {oi === w.correctIdx && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 800, color: "#3DBE6C" }}>✓ CORRECT</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Steps */}
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-soft)", display: "block", marginBottom: 8 }}>Working through it</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {w.steps.map((s, si) => (
                    <div key={si} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 0, borderRadius: 8, overflow: "hidden", border: "1px solid var(--line)" }}>
                      <div style={{ padding: "9px 12px", background: fmtBg }}>
                        <strong style={{ fontSize: 11.5, fontWeight: 800, color: fmtColor }}>{s.label}</strong>
                      </div>
                      <div style={{ padding: "9px 12px", background: "white" }}>
                        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: "var(--ink)" }}>{s.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evidence highlight */}
              <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "10px 14px", marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#78350f", display: "block", marginBottom: 4 }}>KEY EVIDENCE</span>
                <p style={{ margin: 0, fontSize: 12.5, fontStyle: "italic", color: "#78350f", lineHeight: 1.6 }}>"{w.highlight}"</p>
              </div>

              {/* Answer */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ background: "#3DBE6C", color: "white", fontWeight: 900, fontSize: 11, padding: "4px 12px", borderRadius: 6 }}>ANSWER</span>
                <strong style={{ fontSize: 13, color: "#259650" }}>{w.answer}</strong>
              </div>

              {/* Trap */}
              {w.trap && (
                <div style={{ marginTop: 10, background: "#FFEDEA", border: "1px solid #FF6B5C", borderRadius: 8, padding: "9px 14px" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#d94b3e", display: "block", marginBottom: 3 }}>COMMON TRAP HERE</span>
                  <p style={{ margin: 0, fontSize: 12, color: "#d94b3e", lineHeight: 1.6 }}>{w.trap}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Traps */}
      <section style={{ marginBottom: 22 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Traps specific to this type</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)" }}>
          {lesson.traps.map(([name, desc], i) => (
            <div key={name} style={{ display: "grid", gridTemplateColumns: "150px 1fr", borderTop: i > 0 ? "1px solid var(--line)" : undefined, background: "white" }}>
              <div style={{ padding: "11px 14px", background: fmtBg, borderRight: "1px solid var(--line)" }}>
                <strong style={{ fontSize: 12, fontWeight: 800, color: fmtColor }}>{name}</strong>
              </div>
              <p style={{ margin: 0, padding: "11px 14px", fontSize: 12.5, lineHeight: 1.6, color: "var(--ink)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="vrg-panel tint" style={{ marginBottom: 14 }}>
        <span className="vrg-panel-label">Practice tip</span>
        <h3>{topic.spot}</h3>
        <p>Remember the quick check: <em>{topic.rules[0]}</em></p>
      </section>

      <section style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button className="vrg-practice-cta" onClick={onPractice} type="button">Practice VR questions →</button>
      </section>

      <GuidePageActions section={section} pageId={pageId} onNavigate={onNavigate} />
    </>
  );
}

// ─── Syllogisms deep page ────────────────────────────────────────────────────

function SyllogismsPage({ section, topic, pageId, onNavigate, onPractice }: {
  section: GuideSection;
  topic: NonNullable<ReturnType<typeof findTopic>>;
  pageId: string;
  onNavigate: (id: string) => void;
  onPractice: () => void;
}) {
  const c = section.color, t = section.tint, d = section.deep;
  const row = (i: number, name: string, desc: string) => (
    <div key={name} style={{ display: "grid", gridTemplateColumns: "180px 1fr", borderTop: i > 0 ? "1px solid var(--line)" : undefined, background: "white" }}>
      <div style={{ padding: "12px 14px", background: t, borderRight: "1px solid var(--line)" }}>
        <strong style={{ fontSize: 11, fontWeight: 800, color: c, fontFamily: "monospace" }}>{name}</strong>
      </div>
      <p style={{ margin: 0, padding: "12px 14px", fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>{desc}</p>
    </div>
  );

  return (
    <>
      <GuidePageHeader section={section} pageId={pageId} title="Syllogisms" eyebrow="DM topic guide"
        subtitle="Translate every premise into notation, draw the smallest diagram you can, then check whether the conclusion is forced." />

      <p style={{ fontSize: 14, lineHeight: 1.8, color: "var(--ink)", borderLeft: `3px solid ${c}`, background: t, padding: "13px 18px", borderRadius: "0 12px 12px 0", margin: "0 0 26px" }}>
        Syllogisms give you two or three premises about categories, then ask whether a conclusion <strong>must</strong> follow.
        The golden rule: never add anything that is not in the premises. Only draw what the arrows force.
      </p>

      {/* ── 1. The four statements ── */}
      <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 12px", color: "var(--ink)" }}>1 — The four statement types</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>

        {/* All A are B */}
        <div style={{ borderRadius: 12, border: "1px solid var(--line)", background: "white", padding: "16px" }}>
          <strong style={{ fontSize: 13, color: c, display: "block", marginBottom: 12 }}>All A are B</strong>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ flex: "1 1 0", border: `2px dashed ${c}`, borderRadius: 10, padding: "10px 12px", background: t, textAlign: "center" as const }}>
              <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 800, color: c, letterSpacing: ".1em", textTransform: "uppercase" as const }}>Write this</p>
              <code style={{ fontSize: 28, fontWeight: 900, color: d, letterSpacing: ".04em", display: "block" }}>A ⇒ B</code>
              <p style={{ margin: "4px 0 0", fontSize: 10, color: c, fontStyle: "italic" }}>double arrow = all of A goes into B</p>
            </div>
            <svg viewBox="0 0 100 68" width="90" height="62" aria-hidden="true" style={{ flexShrink: 0 }}>
              <circle cx="54" cy="34" r="29" fill={t} stroke={c} strokeWidth="1.5"/>
              <circle cx="46" cy="36" r="14" fill={c} fillOpacity=".25" stroke={c} strokeWidth="1.5"/>
              <text x="46" y="40" textAnchor="middle" fontSize="11" fontWeight="800" fill={d}>A</text>
              <text x="73" y="17" textAnchor="middle" fontSize="11" fontWeight="800" fill={d}>B</text>
            </svg>
          </div>
          <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>A sits completely inside B. Every member of A is also a member of B.</p>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: "#fff0f0", color: "#d94b3e", flexShrink: 0 }}>✗ Not reversible</span>
            <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>All B are A is not implied — B can contain members outside A.</span>
          </div>
        </div>

        {/* No A are B */}
        <div style={{ borderRadius: 12, border: "1px solid var(--line)", background: "white", padding: "16px" }}>
          <strong style={{ fontSize: 13, color: c, display: "block", marginBottom: 12 }}>No A are B</strong>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ flex: "1 1 0", border: `2px dashed ${c}`, borderRadius: 10, padding: "10px 12px", background: t, textAlign: "center" as const }}>
              <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 800, color: c, letterSpacing: ".1em", textTransform: "uppercase" as const }}>Write this</p>
              <code style={{ fontSize: 28, fontWeight: 900, color: d, letterSpacing: ".04em", display: "block" }}>A ✕ B</code>
              <p style={{ margin: "4px 0 0", fontSize: 10, color: c, fontStyle: "italic" }}>✕ = totally separate, no overlap</p>
            </div>
            <svg viewBox="0 0 108 68" width="97" height="62" aria-hidden="true" style={{ flexShrink: 0 }}>
              <circle cx="27" cy="34" r="22" fill={t} stroke={c} strokeWidth="1.5"/>
              <circle cx="81" cy="34" r="22" fill={t} stroke={c} strokeWidth="1.5"/>
              <line x1="51" y1="28" x2="57" y2="40" stroke="#d94b3e" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="57" y1="28" x2="51" y2="40" stroke="#d94b3e" strokeWidth="2.5" strokeLinecap="round"/>
              <text x="27" y="38" textAnchor="middle" fontSize="11" fontWeight="800" fill={d}>A</text>
              <text x="81" y="38" textAnchor="middle" fontSize="11" fontWeight="800" fill={d}>B</text>
            </svg>
          </div>
          <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>A and B are completely separate. No member of A is in B.</p>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: "#edfbf3", color: "#259650", flexShrink: 0 }}>✓ Reversible</span>
            <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>No B are A is equally true — exclusion is symmetric.</span>
          </div>
        </div>

        {/* Some A are B */}
        <div style={{ borderRadius: 12, border: "1px solid var(--line)", background: "white", padding: "16px" }}>
          <strong style={{ fontSize: 13, color: c, display: "block", marginBottom: 12 }}>Some A are B</strong>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ flex: "1 1 0", border: `2px dashed ${c}`, borderRadius: 10, padding: "10px 12px", background: t, textAlign: "center" as const }}>
              <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 800, color: c, letterSpacing: ".1em", textTransform: "uppercase" as const }}>Write this</p>
              <code style={{ fontSize: 28, fontWeight: 900, color: d, letterSpacing: ".04em", display: "block" }}>A → B</code>
              <p style={{ margin: "4px 0 0", fontSize: 10, color: c, fontStyle: "italic" }}>→ = some of A links to B</p>
            </div>
            <svg viewBox="0 0 108 68" width="97" height="62" aria-hidden="true" style={{ flexShrink: 0 }}>
              <defs><clipPath id="sl-c1"><circle cx="36" cy="34" r="23"/></clipPath></defs>
              <circle cx="36" cy="34" r="23" fill={t} stroke={c} strokeWidth="1.5"/>
              <circle cx="72" cy="34" r="23" fill={t} stroke={c} strokeWidth="1.5"/>
              <circle cx="72" cy="34" r="23" fill={c} fillOpacity=".32" clipPath="url(#sl-c1)" stroke="none"/>
              <text x="24" y="38" textAnchor="middle" fontSize="11" fontWeight="800" fill={d}>A</text>
              <text x="84" y="38" textAnchor="middle" fontSize="11" fontWeight="800" fill={d}>B</text>
            </svg>
          </div>
          <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>At least one A is also a B. The circles partially overlap.</p>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: "#edfbf3", color: "#259650", flexShrink: 0 }}>✓ Reversible</span>
            <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>Some B are A is equally true — if one item is in both sets, that works both ways.</span>
          </div>
        </div>

        {/* Some A are not B */}
        <div style={{ borderRadius: 12, border: "1px solid var(--line)", background: "white", padding: "16px" }}>
          <strong style={{ fontSize: 13, color: c, display: "block", marginBottom: 12 }}>Some A are not B</strong>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ flex: "1 1 0", border: `2px dashed ${c}`, borderRadius: 10, padding: "10px 12px", background: t, textAlign: "center" as const }}>
              <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 800, color: c, letterSpacing: ".1em", textTransform: "uppercase" as const }}>Write this</p>
              <code style={{ fontSize: 24, fontWeight: 900, color: d, letterSpacing: ".04em", display: "block" }}>A →✕ B</code>
              <p style={{ margin: "4px 0 0", fontSize: 10, color: c, fontStyle: "italic" }}>→✕ = some A are cut off from B</p>
            </div>
            <svg viewBox="0 0 108 68" width="97" height="62" aria-hidden="true" style={{ flexShrink: 0 }}>
              <defs><clipPath id="sl-c2"><circle cx="40" cy="34" r="23"/></clipPath></defs>
              <circle cx="40" cy="34" r="23" fill={c} fillOpacity=".14" stroke={c} strokeWidth="1.5"/>
              <circle cx="76" cy="34" r="23" fill={t} stroke={c} strokeWidth="1.5"/>
              <circle cx="76" cy="34" r="23" fill={c} fillOpacity=".22" clipPath="url(#sl-c2)" stroke="none"/>
              <circle cx="22" cy="34" r="4" fill={c} fillOpacity=".7"/>
              <text x="29" y="52" textAnchor="middle" fontSize="9" fill={d} fontWeight="700">A</text>
              <text x="87" y="52" textAnchor="middle" fontSize="9" fill={d} fontWeight="700">B</text>
            </svg>
          </div>
          <p style={{ margin: "0 0 10px", fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>At least one A (the dot) falls outside B. Part of A extends beyond the B circle.</p>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: "#fff0f0", color: "#d94b3e", flexShrink: 0 }}>✗ Not reversible</span>
            <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>Tells us nothing from B's perspective — never reverse this.</span>
          </div>
        </div>

      </div>

      {/* Equals sign callout */}
      <div style={{ borderRadius: 12, border: `2px solid ${c}`, background: t, padding: "14px 18px", marginBottom: 28, display: "flex", gap: 16, alignItems: "flex-start" }}>
        <div style={{ flex: "0 0 auto", border: `2px dashed ${c}`, borderRadius: 10, padding: "8px 14px", background: "white", textAlign: "center" as const }}>
          <p style={{ margin: "0 0 3px", fontSize: 9, fontWeight: 800, color: c, letterSpacing: ".1em", textTransform: "uppercase" as const }}>Also valid</p>
          <code style={{ fontSize: 26, fontWeight: 900, color: d }}>A = B</code>
        </div>
        <div>
          <strong style={{ fontSize: 13, color: c, display: "block", marginBottom: 4 }}>When can you write A = B?</strong>
          <p style={{ margin: "0 0 6px", fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>
            Only when you know <em>both</em> "All A are B" <em>and</em> "All B are A" — meaning the two sets are completely identical.
            A&nbsp;=&nbsp;B means every A is a B and every B is an A, so you can swap them freely in any direction.
          </p>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>
            <strong>A ⇒ B alone is not enough</strong> — that only tells you A goes into B, not that B goes into A.
            Use = only when a question explicitly tells you the sets are identical, which is rare.
          </p>
        </div>
      </div>

      {/* ── 2. Chaining ── */}
      <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 6px", color: "var(--ink)" }}>2 — Chaining premises</h2>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--ink-soft)", margin: "0 0 14px" }}>
        Put premises end-to-end. If you can trace an unbroken path from start to finish, the conclusion follows.
        If the chain breaks or arrows don't connect, it does not follow.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>

        {([
          {
            title: "All + All → All", valid: true,
            premises: ["All nurses are healthcare workers.", "All healthcare workers have DBS checks."],
            chain: (
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                <span style={{ padding: "4px 10px", background: "white", border: `1px solid ${c}`, borderRadius: 7, fontSize: 12, fontWeight: 700, color: d }}>Nurses</span>
                <span style={{ color: c, fontWeight: 900, fontSize: 18 }}>⇒</span>
                <span style={{ padding: "4px 10px", background: "white", border: `1px solid ${c}`, borderRadius: 7, fontSize: 12, fontWeight: 700, color: d }}>Healthcare</span>
                <span style={{ color: c, fontWeight: 900, fontSize: 18 }}>⇒</span>
                <span style={{ padding: "4px 10px", background: "white", border: `1px solid ${c}`, borderRadius: 7, fontSize: 12, fontWeight: 700, color: d }}>DBS checks</span>
              </div>
            ),
            conclusion: "∴ All nurses have DBS checks ✓",
          },
          {
            title: "All + No → No", valid: true,
            premises: ["All cats are mammals.", "No mammals are fish."],
            chain: (
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                <span style={{ padding: "4px 10px", background: "white", border: `1px solid ${c}`, borderRadius: 7, fontSize: 12, fontWeight: 700, color: d }}>Cats</span>
                <span style={{ color: c, fontWeight: 900, fontSize: 18 }}>⇒</span>
                <span style={{ padding: "4px 10px", background: "white", border: `1px solid ${c}`, borderRadius: 7, fontSize: 12, fontWeight: 700, color: d }}>Mammals</span>
                <span style={{ color: "#d94b3e", fontWeight: 900, fontSize: 18 }}>✕</span>
                <span style={{ padding: "4px 10px", background: "white", border: "1px solid #d94b3e", borderRadius: 7, fontSize: 12, fontWeight: 700, color: "#d94b3e" }}>Fish</span>
              </div>
            ),
            conclusion: "∴ No cats are fish ✓",
          },
          {
            title: "Some + All → Some", valid: true,
            premises: ["Some doctors are researchers.", "All researchers have PhDs."],
            chain: (
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                <span style={{ padding: "4px 10px", background: "white", border: `1px solid ${c}`, borderRadius: 7, fontSize: 12, fontWeight: 700, color: d }}>Doctors</span>
                <span style={{ color: c, fontWeight: 900, fontSize: 18 }}>→</span>
                <span style={{ padding: "4px 10px", background: "white", border: `1px solid ${c}`, borderRadius: 7, fontSize: 12, fontWeight: 700, color: d }}>Researchers</span>
                <span style={{ color: c, fontWeight: 900, fontSize: 18 }}>⇒</span>
                <span style={{ padding: "4px 10px", background: "white", border: `1px solid ${c}`, borderRadius: 7, fontSize: 12, fontWeight: 700, color: d }}>PhDs</span>
              </div>
            ),
            conclusion: "∴ Some doctors have PhDs ✓",
          },
          {
            title: "Reversed All — converse error", valid: false,
            premises: ["All accountants are graduates.", "Sara is a graduate."],
            chain: (
              <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                <span style={{ padding: "4px 10px", background: "white", border: "1px solid #d94b3e", borderRadius: 7, fontSize: 12, fontWeight: 700, color: "#d94b3e" }}>Accountants</span>
                <span style={{ color: "#d94b3e", fontWeight: 900, fontSize: 18 }}>⇒</span>
                <span style={{ padding: "4px 10px", background: "white", border: "1px solid #d94b3e", borderRadius: 7, fontSize: 12, fontWeight: 700, color: "#d94b3e" }}>Graduates</span>
                <span style={{ color: "var(--ink-soft)", fontWeight: 800, fontSize: 12 }}>← Sara is here, but...</span>
              </div>
            ),
            conclusion: "✗ Sara does not have to be inside Accountants. A ⇒ B ≠ B ⇒ A.",
          },
        ] as const).map((ex, i) => (
          <div key={i} style={{ borderRadius: 12, border: `1px solid ${ex.valid ? c : "#d94b3e"}`, background: ex.valid ? t : "#fff5f5", padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong style={{ fontSize: 12, color: ex.valid ? c : "#d94b3e", fontWeight: 800 }}>{ex.title}</strong>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: ex.valid ? c : "#d94b3e", color: "white" }}>{ex.valid ? "✓ FOLLOWS" : "✗ INVALID"}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--ink)", marginBottom: 10 }}>
              {ex.premises.map((p, j) => <div key={j} style={{ marginBottom: 2 }}>• {p}</div>)}
            </div>
            {ex.chain}
            <p style={{ margin: "8px 0 0", fontSize: 12, fontWeight: 700, color: ex.valid ? "#259650" : "#d94b3e" }}>{ex.conclusion}</p>
          </div>
        ))}

      </div>

      {/* ── 3. Worked examples ── */}
      <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: "var(--ink)" }}>3 — Worked examples</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>

        {/* Example 1 — three-premise chain */}
        <div style={{ borderRadius: 14, border: "1px solid var(--line)", background: "white", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", background: t, borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
            <strong style={{ fontSize: 11, color: c, fontWeight: 800, letterSpacing: ".04em" }}>EXAMPLE 1</strong>
            <span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 600 }}>Three-premise chain</span>
          </div>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase" as const, letterSpacing: ".05em" }}>Given</p>
            {["All reptiles are cold-blooded.", "No cold-blooded animals are warm-blooded.", "Some lizards are reptiles."].map((p, i) => (
              <div key={i} style={{ padding: "6px 12px", borderRadius: 7, background: t, marginBottom: 5, fontSize: 13, color: "var(--ink)", fontStyle: "italic" }}>{p}</div>
            ))}
          </div>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)", background: "#fafafa" }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase" as const, letterSpacing: ".05em" }}>Conclusion to test</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Some lizards are not warm-blooded.</p>
          </div>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase" as const, letterSpacing: ".05em" }}>Working</p>
            {[
              "Translate: Reptiles ⇒ Cold-blooded. Cold-blooded ✕ Warm-blooded. Lizards →(some) Reptiles.",
              "From P1: everything in the Reptiles circle is also in Cold-blooded.",
              "From P2: Cold-blooded and Warm-blooded are completely separate circles — so Reptiles are also outside Warm-blooded.",
              "From P3: some lizards sit inside the Reptiles circle.",
              "Those lizards are therefore inside Cold-blooded, and therefore outside Warm-blooded.",
              "Chain: Lizards →(some) Reptiles ⇒ Cold-blooded ✕ Warm-blooded → some lizards are not warm-blooded.",
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 7 }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, background: t, color: c, fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>{s}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: "10px 16px", background: "#edfbf3", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20, background: "#259650", color: "white" }}>Follows</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#259650" }}>YES — must follow</span>
          </div>
        </div>

        {/* Example 2 — converse trap */}
        <div style={{ borderRadius: 14, border: "1px solid var(--line)", background: "white", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", background: t, borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
            <strong style={{ fontSize: 11, color: c, fontWeight: 800, letterSpacing: ".04em" }}>EXAMPLE 2</strong>
            <span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 600 }}>The converse trap</span>
          </div>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase" as const, letterSpacing: ".05em" }}>Given</p>
            {["All pilots are licensed to fly.", "James is licensed to fly."].map((p, i) => (
              <div key={i} style={{ padding: "6px 12px", borderRadius: 7, background: t, marginBottom: 5, fontSize: 13, color: "var(--ink)", fontStyle: "italic" }}>{p}</div>
            ))}
          </div>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)", background: "#fafafa" }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase" as const, letterSpacing: ".05em" }}>Conclusion to test</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>James is a pilot.</p>
          </div>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase" as const, letterSpacing: ".05em" }}>Working</p>
            {[
              "Translate: Pilots ⇒ Licensed-to-fly. James ∈ Licensed-to-fly.",
              "Draw: Licensed-to-fly is a large set. Pilots is a smaller circle inside it. James is somewhere in Licensed-to-fly.",
              "Ask: must James be inside the Pilots circle? No — James could be a flight instructor, a drone operator, a student with a training licence. Many arrangements are valid.",
              "This is the converse error. A ⇒ B (All pilots are licensed) does not mean B ⇒ A (all licensed people are pilots).",
              "One valid counterexample — James is a flight instructor, not a pilot — is enough to prove the conclusion does not must follow.",
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 7 }}>
                <span style={{ width: 20, height: 20, borderRadius: 6, background: "#fff0f0", color: "#d94b3e", fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "var(--ink)" }}>{s}</p>
              </div>
            ))}
          </div>
          <div style={{ padding: "10px 16px", background: "#fff0f0", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20, background: "#d94b3e", color: "white" }}>Does not follow</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#d94b3e" }}>NO — converse error</span>
          </div>
        </div>

        {/* Example 3 — five-statement Yes/No set */}
        <div style={{ borderRadius: 14, border: "1px solid var(--line)", background: "white", overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", background: t, borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
            <strong style={{ fontSize: 11, color: c, fontWeight: 800, letterSpacing: ".04em" }}>EXAMPLE 3</strong>
            <span style={{ fontSize: 12, color: "var(--ink)", fontWeight: 600 }}>Five-statement Yes / No set</span>
          </div>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase" as const, letterSpacing: ".05em" }}>Given</p>
            {[
              "All surgeons are doctors.",
              "All doctors must complete continuing professional development (CPD).",
              "Some surgeons are also researchers.",
              "No researchers work fewer than 50 hours per week.",
            ].map((p, i) => (
              <div key={i} style={{ padding: "6px 12px", borderRadius: 7, background: t, marginBottom: 5, fontSize: 13, color: "var(--ink)", fontStyle: "italic" }}>{p}</div>
            ))}
          </div>
          <div style={{ padding: "14px 16px" }}>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase" as const, letterSpacing: ".05em" }}>Judge each statement</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {([
                { stmt: "All surgeons must complete CPD.", answer: "Yes" as const, reason: "Surgeons ⇒ Doctors (P1). Doctors must complete CPD (P2). The chain forces it: all surgeons must complete CPD." },
                { stmt: "Some doctors are researchers.", answer: "Yes" as const, reason: "Some surgeons are researchers (P3). All surgeons are doctors (P1). Those surgeon-researchers are therefore doctors who are also researchers — so some doctors are researchers." },
                { stmt: "No surgeons work fewer than 50 hours per week.", answer: "No" as const, reason: "Only some surgeons are researchers (P3), so only those have the 50-hour rule (P4). Non-researcher surgeons could work fewer hours. The word 'no' is too strong here." },
                { stmt: "All researchers must complete CPD.", answer: "No" as const, reason: "P1 tells us surgeons ⇒ doctors, and P2 says doctors must do CPD. But researchers who are not surgeons are not shown to be doctors, so P2 does not apply to them. Only researcher-surgeons definitely must complete CPD." },
                { stmt: "Some researchers are doctors.", answer: "Yes" as const, reason: "Some surgeons are researchers (P3). All surgeons are doctors (P1). Those surgeon-researchers are both doctors and researchers, so some researchers are doctors." },
              ]).map((item, i) => (
                <div key={i} style={{ borderRadius: 10, border: `1px solid ${item.answer === "Yes" ? "#259650" : "#d94b3e"}`, overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "8px 12px", background: item.answer === "Yes" ? "#edfbf3" : "#fff5f5", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{item.stmt}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 10px", borderRadius: 20, background: item.answer === "Yes" ? "#259650" : "#d94b3e", color: "white", alignSelf: "center" }}>{item.answer}</span>
                  </div>
                  <p style={{ margin: 0, padding: "8px 12px", fontSize: 11, lineHeight: 1.6, color: "var(--ink-soft)" }}>{item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── 4. Rules recap ── */}
      <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: "var(--ink)" }}>4 — Rules to remember</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)", marginBottom: 28 }}>
        {([
          ["A ⇒ B ≠ B ⇒ A", "The converse is not valid. All A are B does not mean All B are A. This is the most common mistake in UCAT syllogisms."],
          ["A ✕ B = B ✕ A", "Exclusion works both ways. No A are B also means No B are A — you can always reverse a 'no' statement."],
          ["A → B = B → A", "Some A are B also means Some B are A. Overlap works both ways."],
          ["A →✕ B ≠ B →✕ A", "Some A are not B tells you nothing about B's perspective. Never reverse a 'some are not' statement."],
          ["Some means at least one", "'Some' does not mean 'not all'. It means one or more, and could theoretically include all."],
          ["Existence is never guaranteed", "All X are Y does not prove any X exist. Universal statements work on what is given to exist in the question."],
          ["One counterexample defeats must", "If you can draw a valid arrangement where the conclusion is false, it does not must follow. Draw it and move on."],
        ] as [string, string][]).map(([name, desc], i) => row(i, name, desc))}
      </div>

      <section className="vrg-bottom-practice">
        <div>
          <strong>Ready to try Syllogisms?</strong>
          <p>We'll take you to the practice setup so you can choose your session length and timing.</p>
        </div>
        <button className="vrg-practice-cta" onClick={onPractice} type="button">Set up practice →</button>
      </section>
      <GuidePageActions section={section} pageId={pageId} onNavigate={onNavigate} />
    </>
  );
}

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
            {pageId === "overview" && (sectionKey === "vr"
              ? <VROverviewPage section={section} pageId={pageId} onNavigate={goToPage} />
              : <GuideOverview section={section} pageId={pageId} onNavigate={goToPage} />)}
            {foundation && <FoundationPage section={section} page={foundation} pageId={pageId} onNavigate={goToPage} />}
            {topic && topic.id === "syllogisms"
              ? <SyllogismsPage section={section} topic={topic} pageId={pageId} onNavigate={goToPage} onPractice={() => router.push(`/practice/${sectionKey}`)} />
              : topic && sectionKey === "vr" && VR_LESSONS[topic.id]
              ? <VRLessonPage section={section} topic={topic} pageId={pageId} onNavigate={goToPage} onPractice={() => router.push(`/practice/${sectionKey}`)} />
              : topic && sectionKey === "dm" && DM_LESSONS[topic.id]
              ? <DMLessonPage section={section} topic={topic} pageId={pageId} onNavigate={goToPage} onPractice={() => router.push(`/practice/${sectionKey}`)} />
              : topic && sectionKey === "qr" && QR_LESSONS[topic.id]
              ? <QRLessonPage section={section} topic={topic} pageId={pageId} onNavigate={goToPage} onPractice={() => router.push(`/practice/${sectionKey}`)} />
              : topic && <TopicPage section={section} topic={topic} pageId={pageId} onNavigate={goToPage} onPractice={() => router.push(`/practice/${sectionKey}`)} />}
          </main>
        </div>
      </div>
    </div>
  );
}
