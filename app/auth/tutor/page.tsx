"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

type Tab = "signin" | "register";

export default function TutorAuthPage() {
  const [tab, setTab]         = useState<Tab>("signin");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("tutor-credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email or password incorrect.");
    } else {
      window.location.href = "/tutor";
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    const res = await fetch("/api/auth/tutor-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
    });
    const data = await res.json();
    if (!res.ok) { setLoading(false); setError(data.error ?? "Registration failed."); return; }
    // auto-sign-in after registration
    await signIn("tutor-credentials", { email: email.trim().toLowerCase(), password, redirect: false });
    setLoading(false);
    window.location.href = "/tutor";
  }

  const inputStyle: React.CSSProperties = {
    border: "1.5px solid #e0e6ef", borderRadius: 10, padding: "11px 14px",
    fontSize: 14, outline: "none", fontFamily: "inherit",
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        <Link href="/" className="signin-logo">
          <svg viewBox="0 0 48 32" aria-hidden="true">
            <path d="M2 18h9l4-13 7 24 6-18 5 7h13" />
          </svg>
          Pulsemed
        </Link>

        <div style={{ display: "flex", gap: 0, background: "#f4f7fb", borderRadius: 11, padding: 3, marginBottom: 20 }}>
          {(["signin", "register"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
              style={{
                flex: 1, border: 0, borderRadius: 9, padding: "9px 0",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                background: tab === t ? "white" : "transparent",
                color: tab === t ? "#1a2a3a" : "#6b7a8c",
                boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,.09)" : "none",
              }}
            >
              {t === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {tab === "signin" ? (
          <>
            <h1 style={{ marginBottom: 4 }}>Tutor Sign In</h1>
            <p>Access your tutor dashboard and student roster.</p>
            <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7a8c" }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required autoFocus style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7a8c" }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
              </div>
              {error && <ErrorBox msg={error} />}
              <Btn loading={loading}>Sign In</Btn>
            </form>
          </>
        ) : (
          <>
            <h1 style={{ marginBottom: 4 }}>Create Tutor Account</h1>
            <p>Set up your account to manage and track your students.</p>
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7a8c" }}>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" required autoFocus style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7a8c" }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7a8c" }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" required style={inputStyle} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7a8c" }}>Confirm Password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required style={inputStyle} />
              </div>
              {error && <ErrorBox msg={error} />}
              <Btn loading={loading}>Create Account</Btn>
            </form>
          </>
        )}

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#8a9ab0" }}>
          Are you a student?{" "}
          <Link href="/auth/student" style={{ color: "#2d7ff9", fontWeight: 700 }}>Student login →</Link>
        </p>
      </div>
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div style={{ background: "#fff0ef", border: "1px solid #ffd6d3", borderRadius: 9, padding: "10px 14px", color: "#c0392b", fontSize: 13, fontWeight: 600 }}>
      {msg}
    </div>
  );
}

function Btn({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{ background: "#2d7ff9", color: "white", border: 0, borderRadius: 11, padding: "13px", fontSize: 14, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
