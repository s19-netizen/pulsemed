"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OnboardingForm() {
  const router = useRouter();
  const [testDate, setTestDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_date: testDate || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); setSaving(false); return; }
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <Link href="/" className="onboarding-logo">
          <svg viewBox="0 0 48 32" aria-hidden="true">
            <path d="M2 18h9l4-13 7 24 6-18 5 7h13" />
          </svg>
          Pulsemed
        </Link>
        <h1>One quick question</h1>
        <p>Tell us when your UCAT exam is so we can build a personalised study plan for you.</p>

        <label className="field-label" htmlFor="testdate">When is your UCAT exam?</label>
        <input
          id="testdate"
          className="field-input"
          type="date"
          value={testDate}
          min={today}
          onChange={e => setTestDate(e.target.value)}
          style={{ marginBottom: 6 }}
        />
        <p className="field-hint">We'll show a countdown and adjust your plan intensity. You can skip this for now.</p>

        {error && <div className="error-box" style={{ marginTop: 16 }}>{error}</div>}

        <button
          className="primary-btn"
          style={{ marginTop: 28 }}
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Setting up your plan…" : "Go to my dashboard →"}
        </button>
      </div>
    </div>
  );
}
