"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UpgradeSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push("/dashboard"), 3000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #edfbf3 0%, #fff 60%)",
      padding: "40px 20px",
    }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", background: "#edfbf3",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, margin: "0 auto 24px",
        }}>✓</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1a1a2e", margin: "0 0 12px" }}>
          You&apos;re in!
        </h1>
        <p style={{ fontSize: 16, color: "#667", lineHeight: 1.6, margin: "0 0 32px" }}>
          You now have full access to Pulsemed — completely free, no credit card required.
          Taking you to your dashboard now…
        </p>
        <Link href="/dashboard" style={{
          display: "inline-block", padding: "14px 32px", borderRadius: 10,
          background: "linear-gradient(135deg, #3dbe6c, #259650)",
          color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none",
        }}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
