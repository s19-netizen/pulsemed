"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#888", fontSize: 13 }}>Something went wrong.</p>
        <button onClick={reset} style={{ marginTop: 12, padding: "8px 18px", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Try again</button>
      </div>
    </div>
  );
}
