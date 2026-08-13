"use client";
import { useState } from "react";
import Link from "next/link";
import type { User } from "next-auth";

const SEC_COLOR: Record<string, string> = { vr: "#2D7FF9", dm: "#8B6BFF", qr: "#3DBE6C", sjt: "#FF6B5C" };
const SEC_TINT:  Record<string, string> = { vr: "#EAF2FF", dm: "#F1ECFF", qr: "#EDFBF3", sjt: "#FFEDEA" };
const SEC_LABEL: Record<string, string> = { vr: "Verbal Reasoning", dm: "Decision Making", qr: "Quantitative Reasoning", sjt: "Situational Judgement" };

type Session = {
  section: string;
  correct: number;
  total: number;
  predicted_score: number | null;
  sjt_band: number | null;
  created_at: string;
};

export default function SettingsClient({ user, userRow, practiceSessions }: { user: User; userRow: any; practiceSessions: Session[] }) {
  const [examDate, setExamDate] = useState(userRow?.exam_date ?? "");
  const [name, setName] = useState(userRow?.name ?? user.name ?? "");
  const [saved, setSaved] = useState(false);

  const initials = (user.name ?? user.email ?? "U").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const handleSave = async () => {
    await fetch("/api/me/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, exam_date: examDate || null }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Settings</h1>
          <p>Manage your profile and preferences.</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Profile card */}
        <div className="content-card settings-card">
          <div className="settings-heading">
            <div className="profile-avatar large">{initials}</div>
            <div>
              <h2>Profile</h2>
              <p>{user.email}</p>
            </div>
          </div>

          <label>
            <span><strong>Display name</strong><small>How we address you in the app</small></span>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </label>

          <label>
            <span><strong>UCAT exam date</strong><small>Used for your countdown and study intensity</small></span>
            <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
          </label>

          <label>
            <span><strong>Email</strong><small>Linked via Google account</small></span>
            <input value={user.email ?? ""} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
          </label>

          <button className="save-settings" onClick={handleSave}>
            {saved ? "Saved ✓" : "Save changes"}
          </button>
        </div>

        {/* Study preferences */}
        <div className="content-card settings-card">
          <div className="settings-heading">
            <div className="settings-symbol">⚙️</div>
            <div>
              <h2>Preferences</h2>
              <p>Study session defaults</p>
            </div>
          </div>

          <div className="toggle-row">
            <span><strong>Show explanations after each question</strong><small>See why your answer was right or wrong immediately</small></span>
            <button className="toggle on"><i /></button>
          </div>

          <div className="toggle-row">
            <span><strong>Timed mode</strong><small>Track time per question in practice sessions</small></span>
            <button className="toggle on"><i /></button>
          </div>

          <div className="toggle-row">
            <span><strong>Study plan</strong><small>Generate personalised weekly recommendations</small></span>
            <button className="toggle on"><i /></button>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="content-card" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <p className="section-kicker" style={{ margin: "0 0 2px" }}>HISTORY</p>
            <h2 style={{ margin: 0 }}>Recent activity</h2>
          </div>
          {practiceSessions.length > 0 && (
            <span style={{ fontSize: 12, color: "var(--ink-soft)", fontWeight: 600 }}>
              {practiceSessions.length} session{practiceSessions.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {practiceSessions.length === 0 ? (
          <div style={{ padding: "24px 0", textAlign: "center" }}>
            <p style={{ color: "var(--ink-soft)", fontSize: 13, margin: "0 0 14px" }}>No practice sessions yet — start practising!</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {["vr", "dm", "qr", "sjt"].map(s => (
                <Link key={s} href={`/practice/${s}`}>
                  <button type="button" style={{
                    background: SEC_TINT[s], color: SEC_COLOR[s],
                    border: `1.5px solid ${SEC_COLOR[s]}33`,
                    borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}>{s.toUpperCase()} →</button>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {practiceSessions.map((sess, i) => {
              const pct = sess.total > 0 ? Math.round((sess.correct / sess.total) * 100) : 0;
              const color = SEC_COLOR[sess.section] ?? "#6B7A8C";
              const tint = SEC_TINT[sess.section] ?? "#F4F7FB";
              const perfColor = pct >= 70 ? "#3DBE6C" : pct >= 50 ? "#f59e0b" : "#FF6B5C";
              const date = new Date(sess.created_at);
              const dateStr = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
              const timeStr = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", background: "#F8F9FB",
                  borderRadius: 10, borderLeft: `3px solid ${color}`,
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 900, letterSpacing: "0.07em",
                    background: tint, color, borderRadius: 6,
                    padding: "3px 8px", flexShrink: 0,
                  }}>{sess.section.toUpperCase()}</span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: "0 0 1px" }}>
                      {SEC_LABEL[sess.section] ?? sess.section}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--ink-soft)", margin: 0 }}>
                      {sess.correct}/{sess.total} correct
                      {sess.predicted_score != null && ` · predicted ${sess.predicted_score}`}
                      {sess.sjt_band != null && ` · Band ${sess.sjt_band}`}
                    </p>
                  </div>

                  <span style={{
                    fontSize: 13, fontWeight: 800,
                    color: perfColor, background: perfColor + "18",
                    borderRadius: 6, padding: "3px 10px", flexShrink: 0,
                  }}>{pct}%</span>

                  <time style={{ fontSize: 11, color: "var(--ink-soft)", flexShrink: 0, textAlign: "right", minWidth: 60 }}>
                    {dateStr}<br />{timeStr}
                  </time>

                  <Link href={`/practice/${sess.section}`} style={{ flexShrink: 0 }}>
                    <button type="button" style={{
                      background: "white", border: "1.5px solid var(--line)",
                      borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700,
                      cursor: "pointer", color: "var(--ink-soft)",
                    }}>Again →</button>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
