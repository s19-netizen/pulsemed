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

      {/* Key concepts */}
      <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: "var(--ink)" }}>Key concepts</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
        {lesson.concepts.map(({ label, symbol, detail }) => (
          <div key={label} style={{ borderRadius: 12, border: `1px solid ${c}`, background: "white", padding: "14px 16px" }}>
            <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 800, color: c, letterSpacing: ".1em", textTransform: "uppercase" as const }}>Key concept</p>
            <code style={{ fontSize: 18, fontWeight: 900, color: d, display: "block", marginBottom: 6 }}>{symbol}</code>
            <strong style={{ fontSize: 11, fontWeight: 800, color: "var(--ink)", display: "block", marginBottom: 3 }}>{label}</strong>
            <p style={{ margin: 0, fontSize: 11, lineHeight: 1.6, color: "var(--ink-soft)" }}>{detail}</p>
          </div>
        ))}
      </div>

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
            {pageId === "overview" && <GuideOverview section={section} pageId={pageId} onNavigate={goToPage} />}
            {foundation && <FoundationPage section={section} page={foundation} pageId={pageId} onNavigate={goToPage} />}
            {topic && topic.id === "syllogisms"
              ? <SyllogismsPage section={section} topic={topic} pageId={pageId} onNavigate={goToPage} onPractice={() => router.push(`/practice/${sectionKey}`)} />
              : topic && sectionKey === "dm" && DM_LESSONS[topic.id]
              ? <DMLessonPage section={section} topic={topic} pageId={pageId} onNavigate={goToPage} onPractice={() => router.push(`/practice/${sectionKey}`)} />
              : topic && <TopicPage section={section} topic={topic} pageId={pageId} onNavigate={goToPage} onPractice={() => router.push(`/practice/${sectionKey}`)} />}
          </main>
        </div>
      </div>
    </div>
  );
}
