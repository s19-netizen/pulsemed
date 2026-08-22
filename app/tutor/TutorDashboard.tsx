"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

type Student = {
  id: string;
  name: string;
  username: string;
  exam_date: string | null;
  created_at: string;
  sessions: number;
  avg_score: number | null;
  last_active: string | null;
  avg_time_s: number | null;
  section_bests: Record<string, number>;
};

const SECTION_COLORS: Record<string, string> = { vr: "#2d7ff9", dm: "#8b6bff", qr: "#3dbe6c", sjt: "#ff6b5c" };
const SECTION_LABELS: Record<string, string> = { vr: "VR", dm: "DM", qr: "QR", sjt: "SJT" };

export default function TutorDashboard({ tutor, students: initial }: { tutor: { name: string; email: string }; students: Student[] }) {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>(initial);
  const [showAdd, setShowAdd]   = useState(false);
  const [search, setSearch]     = useState("");

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.username.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove ${name} from your roster? Their practice data will be kept.`)) return;
    await fetch(`/api/tutor/students?id=${id}`, { method: "DELETE" });
    setStudents(s => s.filter(x => x.id !== id));
  }

  function onStudentAdded(student: Student) {
    setStudents(s => [student, ...s]);
    setShowAdd(false);
  }

  const initials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const scoreColor = (score: number | null) => {
    if (score === null) return "#8a9ab0";
    if (score >= 70) return "#3dbe6c";
    if (score >= 50) return "#f5c842";
    return "#ff6b5c";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #eaeef4", padding: "0 clamp(20px, 3vw, 48px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="36" height="24" viewBox="0 0 48 32" fill="none" stroke="#2d7ff9" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 18h9l4-13 7 24 6-18 5 7h13" />
            </svg>
            <span style={{ fontFamily: "var(--font-baloo,sans-serif)", fontSize: 22, fontWeight: 800, color: "#2d7ff9", letterSpacing: "-0.03em" }}>Pulsemed</span>
            <span style={{ background: "#eaf2ff", color: "#2d7ff9", fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 20, letterSpacing: ".06em" }}>TUTOR</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{tutor.name}</div>
              <div style={{ fontSize: 11, color: "#8a9ab0" }}>{tutor.email}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/tutor" })}
              style={{ border: "1.5px solid #e0e6ef", background: "white", borderRadius: 9, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#6b7a8c" }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px clamp(20px, 3vw, 48px)" }}>
        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: "var(--font-baloo,sans-serif)", fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1 }}>
              My Students
            </h1>
            <p style={{ margin: "6px 0 0", color: "#6b7a8c", fontSize: 14 }}>
              {students.length} student{students.length !== 1 ? "s" : ""} on your roster
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="search"
              placeholder="Search students…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: "1.5px solid #e0e6ef", borderRadius: 10, padding: "9px 14px", fontSize: 13, outline: "none", fontFamily: "inherit", minWidth: 200 }}
            />
            <button
              onClick={() => setShowAdd(true)}
              style={{ background: "#2d7ff9", color: "white", border: 0, borderRadius: 11, padding: "10px 20px", fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Add Student
            </button>
          </div>
        </div>

        {/* Summary stats */}
        {students.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Total Students", value: students.length, color: "#2d7ff9" },
              { label: "Active (ever)", value: students.filter(s => s.sessions > 0).length, color: "#3dbe6c" },
              { label: "Avg Accuracy", value: students.filter(s => s.avg_score !== null).length ? `${Math.round(students.filter(s=>s.avg_score!==null).reduce((a,s)=>a+(s.avg_score??0),0)/students.filter(s=>s.avg_score!==null).length)}%` : "—", color: "#f5c842" },
              { label: "Total Sessions", value: students.reduce((a, s) => a + s.sessions, 0), color: "#8b6bff" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "white", border: "1px solid #eaeef4", borderRadius: 14, padding: "16px 18px", boxShadow: "0 4px 16px rgba(26,42,58,.05)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#8a9ab0", marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: "var(--font-baloo,sans-serif)", fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Student grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#8a9ab0" }}>
            {students.length === 0 ? (
              <>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👩‍🏫</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No students yet</div>
                <div style={{ fontSize: 13 }}>Click "Add Student" to create their first login.</div>
              </>
            ) : (
              <div style={{ fontWeight: 700 }}>No students match "{search}"</div>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 14 }}>
            {filtered.map(s => (
              <div
                key={s.id}
                onClick={() => router.push(`/tutor/${s.id}`)}
                style={{ background: "white", border: "1px solid #eaeef4", borderRadius: 16, padding: 20, cursor: "pointer", transition: "box-shadow .15s,border-color .15s", boxShadow: "0 4px 16px rgba(26,42,58,.05)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(26,42,58,.11)"; (e.currentTarget as HTMLDivElement).style.borderColor = "#c0d4f0"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(26,42,58,.05)"; (e.currentTarget as HTMLDivElement).style.borderColor = "#eaeef4"; }}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: "#eaf2ff", color: "#2d7ff9", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                      {initials(s.name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: "#8a9ab0", marginTop: 2 }}>@{s.username}</div>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(s.id, s.name); }}
                    title="Remove student"
                    style={{ border: 0, background: "transparent", cursor: "pointer", color: "#c8d3df", padding: 4, borderRadius: 7 }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#ff6b5c")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#c8d3df")}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                  </button>
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {[
                    { label: "Sessions", value: s.sessions },
                    { label: "Accuracy", value: s.avg_score !== null ? `${s.avg_score}%` : "—", color: scoreColor(s.avg_score) },
                    { label: "Avg Time", value: s.avg_time_s !== null ? `${s.avg_time_s}s` : "—" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: "#f8fafd", borderRadius: 10, padding: "9px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#8a9ab0", fontWeight: 700, marginBottom: 2 }}>{label}</div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: color ?? "#1a2a3a", fontFamily: "var(--font-baloo,sans-serif)" }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Section pills */}
                {Object.keys(s.section_bests).length > 0 && (
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                    {Object.entries(s.section_bests).map(([sec, pct]) => (
                      <span key={sec} style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: `${SECTION_COLORS[sec] ?? "#8a9ab0"}18`, color: SECTION_COLORS[sec] ?? "#8a9ab0" }}>
                        {SECTION_LABELS[sec] ?? sec.toUpperCase()} {pct}%
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #f0f3f8" }}>
                  <div style={{ fontSize: 11, color: "#a0aec0" }}>
                    {s.last_active
                      ? `Active ${new Date(s.last_active).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                      : "No activity yet"}
                  </div>
                  {s.exam_date && (
                    <div style={{ fontSize: 11, color: "#8a9ab0" }}>
                      Exam: {new Date(s.exam_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddStudentModal onClose={() => setShowAdd(false)} onAdded={onStudentAdded} />}
    </div>
  );
}

function AddStudentModal({ onClose, onAdded }: { onClose: () => void; onAdded: (s: Student) => void }) {
  const [name, setName]         = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [examDate, setExamDate] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/tutor/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), username: username.trim(), password, exam_date: examDate || null }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) { setError(data.error ?? "Failed to create student."); return; }
      onAdded(data.student);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message ?? "Network error — please try again.");
    }
  }

  const inputStyle: React.CSSProperties = { border: "1.5px solid #e0e6ef", borderRadius: 10, padding: "10px 13px", fontSize: 13, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: "#6b7a8c", display: "block", marginBottom: 4 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,20,40,.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "white", borderRadius: 18, padding: 28, width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(10,20,40,.2)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-baloo,sans-serif)", fontSize: 22, fontWeight: 800 }}>Add Student</h2>
          <button onClick={onClose} style={{ border: 0, background: "transparent", cursor: "pointer", fontSize: 20, color: "#8a9ab0", lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Username *</label>
            <div style={{ display: "flex", gap: 7 }}>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="janesmith" required style={{ ...inputStyle, flex: 1 }} />
              <button
                type="button"
                onClick={() => {
                  const base = name.trim().toLowerCase().replace(/\s+/g, "").replace(/[^a-z]/g, "") || "student";
                  setUsername(base + Math.floor(100 + Math.random() * 900));
                }}
                title="Generate username from name"
                style={{ flexShrink: 0, border: "1.5px solid #e0e6ef", background: "#f8fafd", borderRadius: 10, padding: "0 12px", fontSize: 11, fontWeight: 800, cursor: "pointer", color: "#2d7ff9", whiteSpace: "nowrap" }}
              >
                Generate
              </button>
            </div>
            <div style={{ fontSize: 10, color: "#a0aec0", marginTop: 3 }}>Lowercase, no spaces. Student uses this to log in.</div>
          </div>
          <div>
            <label style={labelStyle}>Password *</label>
            <div style={{ display: "flex", gap: 7 }}>
              <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required style={{ ...inputStyle, flex: 1 }} />
              <button
                type="button"
                onClick={() => setPassword(String(Math.floor(100000 + Math.random() * 900000)))}
                title="Generate 6-digit password"
                style={{ flexShrink: 0, border: "1.5px solid #e0e6ef", background: "#f8fafd", borderRadius: 10, padding: "0 12px", fontSize: 11, fontWeight: 800, cursor: "pointer", color: "#2d7ff9", whiteSpace: "nowrap" }}
              >
                Generate
              </button>
            </div>
            <div style={{ fontSize: 10, color: "#a0aec0", marginTop: 3 }}>Share this with the student. They can't change it themselves.</div>
          </div>
          <div>
            <label style={labelStyle}>Exam Date (optional)</label>
            <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} style={inputStyle} />
          </div>

          {error && (
            <div style={{ background: "#fff0ef", border: "1px solid #ffd6d3", borderRadius: 9, padding: "10px 13px", color: "#c0392b", fontSize: 12, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 9, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, border: "1.5px solid #e0e6ef", background: "white", borderRadius: 10, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 2, background: "#2d7ff9", color: "white", border: 0, borderRadius: 10, padding: "11px", fontSize: 13, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creating…" : "Create Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
