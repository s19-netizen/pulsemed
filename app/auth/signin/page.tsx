"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleStudentSignIn(e: React.FormEvent) {
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

  const inputStyle: React.CSSProperties = {
    border: "1.5px solid #e0e6ef", borderRadius: 10, padding: "11px 14px",
    fontSize: 14, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box",
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
        <h1>Sign in to Pulsemed</h1>
        <p>Continue your UCAT preparation.</p>

        {/* Google */}
        <button
          className="google-btn"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2 14.2-5.2l-6.5-5.5C29.7 35 27 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.3C9.6 35.5 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.2-4.1 5.5l6.5 5.5C42.6 35.4 44 30 44 24c0-1.3-.1-2.6-.4-3.9z" />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#eaeef4" }} />
          <span style={{ fontSize: 12, color: "#a0aec0", fontWeight: 600 }}>or sign in as a student</span>
          <div style={{ flex: 1, height: 1, background: "#eaeef4" }} />
        </div>

        {/* Student credentials form */}
        <form onSubmit={handleStudentSignIn} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7a8c" }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="your-username"
              autoComplete="username"
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7a8c" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ background: "#fff0ef", border: "1px solid #ffd6d3", borderRadius: 9, padding: "10px 13px", color: "#c0392b", fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ background: "#1a2a3a", color: "white", border: 0, borderRadius: 11, padding: "12px", fontSize: 14, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in…" : "Sign In as Student"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 18, fontSize: 12, color: "#a0aec0" }}>
          Are you a tutor?{" "}
          <Link href="/auth/tutor" style={{ color: "#2d7ff9", fontWeight: 700 }}>Tutor login →</Link>
        </p>
      </div>
    </div>
  );
}
