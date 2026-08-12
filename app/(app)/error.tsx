"use client";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "var(--ink-soft)", fontSize: 13 }}>Something went wrong.</p>
        <p style={{ color: "var(--ink-soft)", fontSize: 11, marginTop: 4 }}>{error.message}</p>
        <button onClick={reset} style={{ marginTop: 14, padding: "8px 18px", border: "1px solid var(--line)", borderRadius: 8, cursor: "pointer", fontSize: 13, background: "white" }}>Try again</button>
      </div>
    </div>
  );
}
