"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const INCLUDED = [
  "Full VR, DM, QR & SJT question banks",
  "AI-powered performance insights after every session",
  "Progress dashboard & accuracy tracking",
  "Personalised study plan",
  "Step-by-step walkthroughs for every question",
  "Unlimited practice sessions",
];

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCheckout() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #f8f6ff 0%, #fff 60%)",
      padding: "40px 20px",
    }}>
      <div style={{ maxWidth: 480, width: "100%" }}>

        {/* Badge */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{
            display: "inline-block", background: "#f1ecff", color: "#6747d8",
            fontWeight: 700, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase",
            borderRadius: 20, padding: "5px 14px",
          }}>
            Full Access
          </span>
        </div>

        {/* Heading */}
        <h1 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: "#1a1a2e", margin: "0 0 10px" }}>
          Unlock PulseMed
        </h1>
        <p style={{ textAlign: "center", fontSize: 16, color: "#667", margin: "0 0 36px", lineHeight: 1.5 }}>
          One payment. Everything included. No subscription.
        </p>

        {/* Card */}
        <div style={{
          background: "#fff", borderRadius: 20, boxShadow: "0 4px 40px rgba(107,71,216,.12)",
          padding: "36px 32px", marginBottom: 16,
        }}>
          {/* Price */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span style={{ fontSize: 52, fontWeight: 900, color: "#1a1a2e", letterSpacing: "-.02em" }}>£19.99</span>
            <div style={{ fontSize: 14, color: "#888", marginTop: 4 }}>one-time payment · lifetime access</div>
          </div>

          {/* Included list */}
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px" }}>
            {INCLUDED.map((item, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                <span style={{
                  flexShrink: 0, width: 20, height: 20, borderRadius: "50%",
                  background: "#edfbf3", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, color: "#259650", fontWeight: 800, marginTop: 1,
                }}>✓</span>
                <span style={{ fontSize: 14.5, color: "#334354", lineHeight: 1.5 }}>{item}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            style={{
              width: "100%", padding: "16px 0", borderRadius: 12, border: "none",
              background: loading ? "#c4b5ff" : "linear-gradient(135deg, #8b6bff, #6747d8)",
              color: "#fff", fontWeight: 800, fontSize: 16, cursor: loading ? "default" : "pointer",
              letterSpacing: ".01em", transition: "opacity .2s",
            }}
          >
            {loading ? "Redirecting to payment…" : "Get Full Access — £19.99"}
          </button>
        </div>

        {/* Trust */}
        <p style={{ textAlign: "center", fontSize: 13, color: "#999" }}>
          Secure payment via Stripe · Instant access after payment
        </p>

        {/* Back to diagnostic */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a href="/diagnostic" style={{ fontSize: 13, color: "#8b6bff", textDecoration: "none" }}>
            ← Take the free diagnostic first
          </a>
        </div>

      </div>
    </div>
  );
}
