"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UpgradePage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push("/dashboard"), 3000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #eaf2ff 0%, #fff 60%)",
      padding: "40px 20px",
    }}>
      <div style={{ textAlign: "center", maxWidth: 460 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", background: "#eaf2ff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, margin: "0 auto 24px",
        }}>✓</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e", margin: "0 0 12px" }}>
          Pulsemed is 100% free
        </h1>
        <p style={{ fontSize: 16, color: "#667", lineHeight: 1.6, margin: "0 0 32px" }}>
          No payment needed. No credit card. No premium tier. Every question, explanation,
          and study plan on Pulsemed is completely free for every user, forever.
        </p>
        <Link href="/dashboard" style={{
          display: "inline-block", padding: "14px 32px", borderRadius: 10,
          background: "linear-gradient(135deg, #2D7FF9, #6747d8)",
          color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none",
        }}>
          Go to Dashboard →
        </Link>
      </div>
    </div>
  );
}
