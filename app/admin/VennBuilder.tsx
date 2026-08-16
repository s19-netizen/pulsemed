"use client";
import { useState } from "react";

export type VennData =
  | { kind: "venn2"; labelA: string; labelB: string; totalA?: number; totalB?: number; total?: number; onlyA?: number; both?: number; onlyB?: number; neither?: number }
  | { kind: "venn3"; labelA: string; labelB: string; labelC: string; totalA?: number; totalB?: number; totalC?: number; total?: number; onlyA?: number; onlyB?: number; onlyC?: number; ab?: number; ac?: number; bc?: number; abc?: number; neither?: number };

function n(v: string): number | undefined { const x = Number(v); return v === "" ? undefined : isNaN(x) ? undefined : x; }

function Preview2({ f }: { f: Extract<VennData, { kind: "venn2" }> }) {
  return (
    <svg viewBox="0 0 320 195" style={{ width: "100%", maxWidth: 280 }}>
      {f.total !== undefined && <text x={160} y={11} textAnchor="middle" style={{ fontSize: 10, fill: "#9ca3af", fontFamily: "inherit" }}>Total: {f.total}</text>}
      <circle cx={118} cy={100} r={70} fill="rgba(104,70,217,0.07)" stroke="#8b6bff" strokeWidth={1.5} />
      <circle cx={202} cy={100} r={70} fill="rgba(104,70,217,0.07)" stroke="#8b6bff" strokeWidth={1.5} />
      <text x={75} y={36} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: "#6846d9", fontFamily: "inherit" }}>{f.labelA}</text>
      <text x={245} y={36} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: "#6846d9", fontFamily: "inherit" }}>{f.labelB}</text>
      {f.onlyA !== undefined && <text x={82} y={105} textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: "#2d3748", fontFamily: "inherit" }}>{f.onlyA}</text>}
      {f.both !== undefined && <text x={160} y={105} textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: "#2d3748", fontFamily: "inherit" }}>{f.both}</text>}
      {f.onlyB !== undefined && <text x={238} y={105} textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: "#2d3748", fontFamily: "inherit" }}>{f.onlyB}</text>}
      {f.neither !== undefined && <text x={160} y={183} textAnchor="middle" style={{ fontSize: 10, fill: "#6b7280", fontFamily: "inherit" }}>neither: {f.neither}</text>}
    </svg>
  );
}

function Preview3({ f }: { f: Extract<VennData, { kind: "venn3" }> }) {
  return (
    <svg viewBox="0 0 320 265" style={{ width: "100%", maxWidth: 280 }}>
      {f.total !== undefined && <text x={160} y={10} textAnchor="middle" style={{ fontSize: 10, fill: "#9ca3af", fontFamily: "inherit" }}>Total: {f.total}</text>}
      <circle cx={120} cy={108} r={68} fill="rgba(104,70,217,0.06)" stroke="#8b6bff" strokeWidth={1.5} />
      <circle cx={200} cy={108} r={68} fill="rgba(104,70,217,0.06)" stroke="#8b6bff" strokeWidth={1.5} />
      <circle cx={160} cy={168} r={68} fill="rgba(104,70,217,0.06)" stroke="#8b6bff" strokeWidth={1.5} />
      <text x={68} y={47} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: "#6846d9", fontFamily: "inherit" }}>{f.labelA}</text>
      <text x={252} y={47} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: "#6846d9", fontFamily: "inherit" }}>{f.labelB}</text>
      <text x={160} y={255} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: "#6846d9", fontFamily: "inherit" }}>{f.labelC}</text>
      {f.onlyA !== undefined && <text x={95} y={90} textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: "#2d3748", fontFamily: "inherit" }}>{f.onlyA}</text>}
      {f.onlyB !== undefined && <text x={225} y={90} textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: "#2d3748", fontFamily: "inherit" }}>{f.onlyB}</text>}
      {f.onlyC !== undefined && <text x={160} y={228} textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: "#2d3748", fontFamily: "inherit" }}>{f.onlyC}</text>}
      {f.ab !== undefined && <text x={160} y={86} textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: "#2d3748", fontFamily: "inherit" }}>{f.ab}</text>}
      {f.ac !== undefined && <text x={112} y={155} textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: "#2d3748", fontFamily: "inherit" }}>{f.ac}</text>}
      {f.bc !== undefined && <text x={208} y={155} textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: "#2d3748", fontFamily: "inherit" }}>{f.bc}</text>}
      {f.abc !== undefined && <text x={160} y={130} textAnchor="middle" style={{ fontSize: 13, fontWeight: 700, fill: "#2d3748", fontFamily: "inherit" }}>{f.abc}</text>}
    </svg>
  );
}

const fs: React.CSSProperties = { border: "1.5px solid #e5e9f0", borderRadius: 8, padding: "6px 9px", fontSize: 12, color: "#1a2535", width: "100%", boxSizing: "border-box" };

export function VennBuilder({ value, onChange }: { value: VennData | null; onChange: (v: VennData | null) => void }) {
  const mode = value?.kind ?? "none";

  function setMode(m: "none" | "venn2" | "venn3") {
    if (m === "none") onChange(null);
    else if (m === "venn2") onChange({ kind: "venn2", labelA: "Set A", labelB: "Set B" });
    else onChange({ kind: "venn3", labelA: "Set A", labelB: "Set B", labelC: "Set C" });
  }

  function set2(k: string, v: string) {
    const cur = value as Extract<VennData, { kind: "venn2" }>;
    const isLabel = k === "labelA" || k === "labelB";
    onChange({ ...cur, [k]: isLabel ? v : n(v) });
  }
  function set3(k: string, v: string) {
    const cur = value as Extract<VennData, { kind: "venn3" }>;
    const isLabel = k.startsWith("label");
    onChange({ ...cur, [k]: isLabel ? v : n(v) });
  }

  const modeBtns = (["none", "venn2", "venn3"] as const).map(m => ({
    m, label: m === "none" ? "No Venn" : m === "venn2" ? "2 Circles" : "3 Circles",
  }));

  return (
    <div style={{ border: "1.5px dashed #d0d8e8", borderRadius: 12, padding: 16, background: "#fafbff" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: value ? 16 : 0 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: "#8b6bff", alignSelf: "center", marginRight: 4 }}>VENN (explanation)</span>
        {modeBtns.map(({ m, label }) => (
          <button key={m} onClick={() => setMode(m)} style={{
            border: "1.5px solid", borderColor: mode === m ? "#8b6bff" : "#e5e9f0",
            background: mode === m ? "#f1ecff" : "white", color: mode === m ? "#6747d8" : "#6b7a8c",
            borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer",
          }}>{label}</button>
        ))}
      </div>

      {value?.kind === "venn2" && (() => {
        const f = value as Extract<VennData, { kind: "venn2" }>;
        const fields: [string, string][] = [["labelA","Label A"],["labelB","Label B"],["onlyA","Only A"],["both","A ∩ B"],["onlyB","Only B"],["neither","Neither"],["totalA","Total A"],["totalB","Total B"],["total","Grand Total"]];
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {fields.map(([k, lbl]) => (
                <div key={k}>
                  <p style={{ margin: "0 0 3px", fontSize: 10, color: "#6b7a8c", fontWeight: 700 }}>{lbl}</p>
                  <input style={fs} value={String((f as any)[k] ?? "")} onChange={e => set2(k, e.target.value)} placeholder={k.startsWith("label") ? "Name…" : "number"} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center" }}><Preview2 f={f} /></div>
          </div>
        );
      })()}

      {value?.kind === "venn3" && (() => {
        const f = value as Extract<VennData, { kind: "venn3" }>;
        const fields: [string, string][] = [["labelA","Label A"],["labelB","Label B"],["labelC","Label C"],["onlyA","Only A"],["onlyB","Only B"],["onlyC","Only C"],["ab","A ∩ B"],["ac","A ∩ C"],["bc","B ∩ C"],["abc","A ∩ B ∩ C"],["neither","Neither"],["total","Total"]];
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {fields.map(([k, lbl]) => (
                <div key={k}>
                  <p style={{ margin: "0 0 3px", fontSize: 10, color: "#6b7a8c", fontWeight: 700 }}>{lbl}</p>
                  <input style={fs} value={String((f as any)[k] ?? "")} onChange={e => set3(k, e.target.value)} placeholder={k.startsWith("label") ? "Name…" : "number"} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center" }}><Preview3 f={f} /></div>
          </div>
        );
      })()}
    </div>
  );
}
