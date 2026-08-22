"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function StudentSignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("student-credentials", {
      username: username.trim().toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Username or password incorrect.");
    } else {
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="signin-page">
      <div className="signin-card">
        <Link href="/" className="signin-logo">
          <svg viewBox="0 0 48 32" aria-hidden="true">
            <path d="M2 18h9l4-13 7 24 6-18 5 7h13" />
          </svg>
          Pulsemed
        </Link>
        <h1>Student Sign In</h1>
        <p>Enter the username and password your tutor gave you.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7a8c" }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="your-username"
              required
              autoFocus
              autoComplete="username"
              style={{ border: "1.5px solid #e0e6ef", borderRadius: 10, padding: "11px 14px", fontSize: 14, outline: "none", fontFamily: "inherit" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7a8c" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={{ border: "1.5px solid #e0e6ef", borderRadius: 10, padding: "11px 14px", fontSize: 14, outline: "none", fontFamily: "inherit" }}
            />
          </div>

          {error && (
            <div style={{ background: "#fff0ef", border: "1px solid #ffd6d3", borderRadius: 9, padding: "10px 14px", color: "#c0392b", fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ background: "#2d7ff9", color: "white", border: 0, borderRadius: 11, padding: "13px", fontSize: 14, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#8a9ab0" }}>
          Are you a tutor?{" "}
          <Link href="/auth/tutor" style={{ color: "#2d7ff9", fontWeight: 700 }}>Tutor login →</Link>
        </p>
      </div>
    </div>
  );
}
