"use client";
import { useState } from "react";
import type { User } from "next-auth";

export default function SettingsClient({ user, userRow }: { user: User; userRow: any }) {
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
            <span><strong>AI study plan</strong><small>Generate personalised weekly recommendations</small></span>
            <button className="toggle on"><i /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
