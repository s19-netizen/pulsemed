"use client";
import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GUEST_QUESTIONS, type GuestQuestion, type VennFigure2, type VennFigure3, type VennFigure } from "@/lib/questions";

// ─── Venn Diagram components ─────────────────────────────────────────────────

function Num({ x, y, v, anchor = "middle" }: { x: number; y: number; v: number | undefined; anchor?: string }) {
  if (v === undefined) return null;
  return (
    <text x={x} y={y} textAnchor={anchor as "middle" | "start" | "end"} dominantBaseline="central"
      style={{ fontSize: 13, fontWeight: 700, fill: "#2d3748", fontFamily: "inherit" }}>
      {v}
    </text>
  );
}

function SetLabel({ x, y, label, count, anchor = "middle" }: { x: number; y: number; label: string; count?: number; anchor?: string }) {
  return (
    <>
      <text x={x} y={y} textAnchor={anchor as "middle" | "start" | "end"} dominantBaseline="central"
        style={{ fontSize: 11, fontWeight: 700, fill: "#6846d9", fontFamily: "inherit", letterSpacing: ".02em" }}>
        {label}
      </text>
      {count !== undefined && (
        <text x={x} y={y + 14} textAnchor={anchor as "middle" | "start" | "end"} dominantBaseline="central"
          style={{ fontSize: 10, fill: "#6b7280", fontFamily: "inherit" }}>
          n={count}
        </text>
      )}
    </>
  );
}

function VennDiagram2({ fig }: { fig: VennFigure2 }) {
  // Two overlapping circles: cx_a=118, cx_b=202, cy=100, r=70
  // Overlap region: x=132–188, centre x=160
  // Only-A centre: ~x=83, Only-B centre: ~x=237
  return (
    <div style={{ margin: "10px 0" }}>
      <svg viewBox="0 0 320 195" style={{ width: "100%", maxWidth: 340, display: "block" }} aria-label="Venn diagram">
        {/* Total */}
        {fig.total !== undefined && (
          <text x={160} y={11} textAnchor="middle" style={{ fontSize: 10, fill: "#9ca3af", fontFamily: "inherit" }}>
            Total: {fig.total}
          </text>
        )}

        {/* Circle fills */}
        <circle cx={118} cy={100} r={70} fill="rgba(104,70,217,0.07)" stroke="#8b6bff" strokeWidth={1.5} />
        <circle cx={202} cy={100} r={70} fill="rgba(104,70,217,0.07)" stroke="#8b6bff" strokeWidth={1.5} />

        {/* Labels at top of each circle (outside overlap) */}
        <SetLabel x={75} y={36} label={fig.labelA} count={fig.totalA} />
        <SetLabel x={245} y={36} label={fig.labelB} count={fig.totalB} />

        {/* Region values (only show what was given in the problem) */}
        <Num x={82} y={105} v={fig.onlyA} />
        <Num x={160} y={105} v={fig.both} />
        <Num x={238} y={105} v={fig.onlyB} />

        {/* "Neither" shown below circles */}
        {fig.neither !== undefined && (
          <>
            <rect x={120} y={174} width={80} height={16} rx={4} fill="#f3f4f6" />
            <text x={160} y={182} textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: 10, fill: "#6b7280", fontFamily: "inherit" }}>
              neither: {fig.neither}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

function VennDiagram3({ fig }: { fig: VennFigure3 }) {
  // Triangle layout: A top-left, B top-right, C bottom-centre
  // A: cx=120, cy=108, r=68 | B: cx=200, cy=108, r=68 | C: cx=160, cy=168, r=68
  return (
    <div style={{ margin: "10px 0" }}>
      <svg viewBox="0 0 320 265" style={{ width: "100%", maxWidth: 340, display: "block" }} aria-label="Venn diagram">
        {fig.total !== undefined && (
          <text x={160} y={10} textAnchor="middle" style={{ fontSize: 10, fill: "#9ca3af", fontFamily: "inherit" }}>
            Total: {fig.total}
          </text>
        )}

        {/* Circle fills */}
        <circle cx={120} cy={108} r={68} fill="rgba(104,70,217,0.06)" stroke="#8b6bff" strokeWidth={1.5} />
        <circle cx={200} cy={108} r={68} fill="rgba(104,70,217,0.06)" stroke="#8b6bff" strokeWidth={1.5} />
        <circle cx={160} cy={168} r={68} fill="rgba(104,70,217,0.06)" stroke="#8b6bff" strokeWidth={1.5} />

        {/* Set labels */}
        <SetLabel x={68} y={47} label={fig.labelA} count={fig.totalA} />
        <SetLabel x={252} y={47} label={fig.labelB} count={fig.totalB} />
        <SetLabel x={160} y={248} label={fig.labelC} count={fig.totalC} />

        {/* Region values — only show what was given */}
        <Num x={95}  y={90}  v={fig.onlyA} />
        <Num x={225} y={90}  v={fig.onlyB} />
        <Num x={160} y={225} v={fig.onlyC} />
        <Num x={160} y={86}  v={fig.ab} />
        <Num x={112} y={155} v={fig.ac} />
        <Num x={208} y={155} v={fig.bc} />
        <Num x={160} y={130} v={fig.abc} />

        {fig.neither !== undefined && (
          <>
            <rect x={8} y={242} width={68} height={15} rx={3} fill="#f3f4f6" />
            <text x={42} y={249} textAnchor="middle" dominantBaseline="central"
              style={{ fontSize: 9, fill: "#6b7280", fontFamily: "inherit" }}>
              neither: {fig.neither}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

function VennDiagram({ fig }: { fig: VennFigure }) {
  if (fig.kind === "venn2") return <VennDiagram2 fig={fig} />;
  return <VennDiagram3 fig={fig} />;
}

// ─── Chart / Table figures ────────────────────────────────────────────────────

type ChartSeries = { label: string; value: number };

type MultiSeries = { label: string; values: number[] };

type ChartFigure =
  | { type: "line";      title?: string; xLabel?: string; yLabel?: string; series: ChartSeries[] }
  | { type: "bar";       title?: string; xLabel?: string; yLabel?: string; series: ChartSeries[] }
  | { type: "pie";       title?: string; series: ChartSeries[] }
  | { type: "multiline"; title?: string; xLabel?: string; yLabel?: string; xLabels: string[]; series: MultiSeries[] }
  | { type: "table";     title?: string; headers: string[]; rows: (string | number)[][] }
  | { type: "prose";     text: string };

function niceStep(raw: number): number {
  const mag = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 0.001))));
  const n = raw / mag;
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * mag;
}

function LineChart({ fig }: { fig: Extract<ChartFigure, { type: "line" }> }) {
  const { series, title, xLabel, yLabel } = fig;
  const W = 320, H = 185;
  const PL = yLabel ? 52 : 42, PR = 16, PT = title ? 30 : 16, PB = xLabel ? 46 : 34;
  const pw = W - PL - PR, ph = H - PT - PB;

  const vals = series.map(s => s.value);
  const rawMin = Math.min(...vals), rawMax = Math.max(...vals);
  const vStep = niceStep((rawMax - rawMin || rawMax || 1) / 4);
  const yMin = Math.floor(rawMin / vStep) * vStep;
  const yMax = Math.ceil(rawMax / vStep) * vStep || vStep;

  const xPos = (i: number) => PL + (series.length > 1 ? i * pw / (series.length - 1) : pw / 2);
  const yPos = (v: number) => PT + ph - ((v - yMin) / (yMax - yMin)) * ph;

  const pts = series.map((s, i) => ({ x: xPos(i), y: yPos(s.value), ...s }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length-1].x},${PT+ph} L${pts[0].x},${PT+ph} Z`;

  const gridVals: number[] = [];
  for (let v = yMin; v <= yMax + vStep * 0.01; v += vStep) gridVals.push(Math.round(v * 100) / 100);

  return (
    <div style={{ margin: "10px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }} aria-label={title ?? "Line chart"}>
        {title && <text x={W/2} y={14} textAnchor="middle" style={{ fontSize: 10, fontWeight: 700, fill: "#6747d8", fontFamily: "inherit" }}>{title}</text>}
        {gridVals.map(v => (
          <g key={v}>
            <line x1={PL} y1={yPos(v)} x2={PL+pw} y2={yPos(v)} stroke="#e8ebf0" strokeWidth={1} />
            <text x={PL-5} y={yPos(v)} textAnchor="end" dominantBaseline="central" style={{ fontSize: 9, fill: "#9ca3af", fontFamily: "inherit" }}>{v}</text>
          </g>
        ))}
        <line x1={PL} y1={PT} x2={PL} y2={PT+ph} stroke="#d1d5db" strokeWidth={1.5} />
        <line x1={PL} y1={PT+ph} x2={PL+pw} y2={PT+ph} stroke="#d1d5db" strokeWidth={1.5} />
        <path d={area} fill="rgba(139,107,255,0.09)" />
        <path d={line} fill="none" stroke="#8b6bff" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill="white" stroke="#8b6bff" strokeWidth={2} />
            <text x={p.x} y={p.y - 9} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700, fill: "#4b3fa0", fontFamily: "inherit" }}>{p.value}</text>
            <text x={p.x} y={PT+ph+14} textAnchor="middle" style={{ fontSize: 9, fill: "#6b7280", fontFamily: "inherit" }}>{p.label}</text>
          </g>
        ))}
        {yLabel && <text transform={`rotate(-90) translate(${-(PT+ph/2)},13)`} textAnchor="middle" style={{ fontSize: 9, fill: "#9ca3af", fontFamily: "inherit" }}>{yLabel}</text>}
        {xLabel && <text x={PL+pw/2} y={H-4} textAnchor="middle" style={{ fontSize: 9, fill: "#9ca3af", fontFamily: "inherit" }}>{xLabel}</text>}
      </svg>
    </div>
  );
}

function BarChart({ fig }: { fig: Extract<ChartFigure, { type: "bar" }> }) {
  const { series, title, xLabel, yLabel } = fig;
  const W = 320, H = 185;
  const PL = yLabel ? 52 : 42, PR = 16, PT = title ? 30 : 16, PB = xLabel ? 46 : 34;
  const pw = W - PL - PR, ph = H - PT - PB;

  const vals = series.map(s => s.value);
  const rawMax = Math.max(...vals);
  const vStep = niceStep(rawMax / 4);
  const yMax = Math.ceil(rawMax / vStep) * vStep || vStep;
  const yPos = (v: number) => PT + ph - (v / yMax) * ph;

  const gridVals: number[] = [];
  for (let v = 0; v <= yMax + vStep * 0.01; v += vStep) gridVals.push(Math.round(v * 100) / 100);

  const slot = pw / series.length;
  const bw = slot * 0.55;

  return (
    <div style={{ margin: "10px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }} aria-label={title ?? "Bar chart"}>
        {title && <text x={W/2} y={14} textAnchor="middle" style={{ fontSize: 10, fontWeight: 700, fill: "#6747d8", fontFamily: "inherit" }}>{title}</text>}
        {gridVals.map(v => (
          <g key={v}>
            <line x1={PL} y1={yPos(v)} x2={PL+pw} y2={yPos(v)} stroke="#e8ebf0" strokeWidth={1} />
            <text x={PL-5} y={yPos(v)} textAnchor="end" dominantBaseline="central" style={{ fontSize: 9, fill: "#9ca3af", fontFamily: "inherit" }}>{v}</text>
          </g>
        ))}
        <line x1={PL} y1={PT} x2={PL} y2={PT+ph} stroke="#d1d5db" strokeWidth={1.5} />
        <line x1={PL} y1={PT+ph} x2={PL+pw} y2={PT+ph} stroke="#d1d5db" strokeWidth={1.5} />
        {series.map((s, i) => {
          const bx = PL + i * slot + (slot - bw) / 2;
          const by = yPos(s.value);
          const bh = PT + ph - by;
          return (
            <g key={i}>
              <rect x={bx} y={by} width={bw} height={bh} rx={3} fill="#8b6bff" opacity={0.82} />
              <text x={bx+bw/2} y={by-5} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700, fill: "#4b3fa0", fontFamily: "inherit" }}>{s.value}</text>
              <text x={bx+bw/2} y={PT+ph+14} textAnchor="middle" style={{ fontSize: 9, fill: "#6b7280", fontFamily: "inherit" }}>{s.label}</text>
            </g>
          );
        })}
        {yLabel && <text transform={`rotate(-90) translate(${-(PT+ph/2)},13)`} textAnchor="middle" style={{ fontSize: 9, fill: "#9ca3af", fontFamily: "inherit" }}>{yLabel}</text>}
        {xLabel && <text x={PL+pw/2} y={H-4} textAnchor="middle" style={{ fontSize: 9, fill: "#9ca3af", fontFamily: "inherit" }}>{xLabel}</text>}
      </svg>
    </div>
  );
}

function DataTable({ fig }: { fig: Extract<ChartFigure, { type: "table" }> }) {
  const { headers, rows, title } = fig;
  return (
    <div style={{ margin: "12px 0", overflowX: "auto" }}>
      {title && <p style={{ margin: "0 0 7px", fontSize: 11, fontWeight: 800, color: "#6747d8", textTransform: "uppercase", letterSpacing: ".06em" }}>{title}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: "7px 12px", background: "#f1ecff", color: "#4b3fa0", fontWeight: 800, textAlign: i === 0 ? "left" : "center", fontSize: 11, letterSpacing: ".03em", borderBottom: "2px solid #d4c8ff", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 === 0 ? "white" : "#faf9ff" }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: "7px 12px", color: "#1a2535", textAlign: ci === 0 ? "left" : "center", borderBottom: "1px solid #f0eeff", fontWeight: ci === 0 ? 700 : 400, whiteSpace: "nowrap" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CHART_COLORS = ["#8b6bff","#2d7ff9","#3dbe6c","#ff6b5c","#f59e0b","#06b6d4","#ec4899","#84cc16"];

function PieChart({ fig }: { fig: Extract<ChartFigure, { type: "pie" }> }) {
  const { series, title } = fig;
  const total = series.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  const W = 320, H = 190, cx = 100, cy = 95, r = 78;
  let angle = -Math.PI / 2;
  const slices = series.map((s, i) => {
    const frac = s.value / total;
    const sa = angle; angle += frac * 2 * Math.PI;
    const ea = angle;
    const x1 = cx + r * Math.cos(sa), y1 = cy + r * Math.sin(sa);
    const x2 = cx + r * Math.cos(ea), y2 = cy + r * Math.sin(ea);
    const mid = sa + frac * Math.PI;
    return { path: `M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r},0,${frac > 0.5 ? 1 : 0},1,${x2.toFixed(1)},${y2.toFixed(1)} Z`, color: CHART_COLORS[i % CHART_COLORS.length], frac, pct: Math.round(frac * 100), lx: cx + r * 0.62 * Math.cos(mid), ly: cy + r * 0.62 * Math.sin(mid), ...s };
  });
  return (
    <div style={{ margin: "10px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }} aria-label={title ?? "Pie chart"}>
        {title && <text x={W / 2} y={13} textAnchor="middle" style={{ fontSize: 10, fontWeight: 700, fill: "#6747d8", fontFamily: "inherit" }}>{title}</text>}
        {slices.map((s, i) => (
          <g key={i}>
            <path d={s.path} fill={s.color} opacity={0.85} stroke="white" strokeWidth={1.5} />
            {s.frac > 0.07 && <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="central" style={{ fontSize: 9, fontWeight: 700, fill: "white", fontFamily: "inherit" }}>{s.pct}%</text>}
          </g>
        ))}
        {slices.map((s, i) => (
          <g key={i} transform={`translate(196,${(title ? 26 : 14) + i * 16})`}>
            <rect width={9} height={9} rx={2} fill={s.color} opacity={0.85} />
            <text x={13} y={7} dominantBaseline="central" style={{ fontSize: 9, fill: "#374151", fontFamily: "inherit" }}>{s.label} ({s.value})</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function MultiLineChart({ fig }: { fig: Extract<ChartFigure, { type: "multiline" }> }) {
  const { series, xLabels, title, xLabel, yLabel } = fig;
  const W = 320, H = 195;
  const PL = yLabel ? 52 : 42, PR = 16, PT = title ? 30 : 16, PB = xLabel ? 50 : 38;
  const pw = W - PL - PR, ph = H - PT - PB;
  const allVals = series.flatMap(s => s.values);
  const rawMin = Math.min(...allVals), rawMax = Math.max(...allVals);
  const vStep = niceStep((rawMax - rawMin || rawMax || 1) / 4);
  const yMin = Math.floor(rawMin / vStep) * vStep;
  const yMax = Math.ceil(rawMax / vStep) * vStep || vStep;
  const n = xLabels.length;
  const xPos = (i: number) => PL + (n > 1 ? i * pw / (n - 1) : pw / 2);
  const yPos = (v: number) => PT + ph - ((v - yMin) / (yMax - yMin)) * ph;
  const gridVals: number[] = [];
  for (let v = yMin; v <= yMax + vStep * 0.01; v += vStep) gridVals.push(Math.round(v * 100) / 100);
  return (
    <div style={{ margin: "10px 0" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }} aria-label={title ?? "Line chart"}>
        {title && <text x={W / 2} y={14} textAnchor="middle" style={{ fontSize: 10, fontWeight: 700, fill: "#6747d8", fontFamily: "inherit" }}>{title}</text>}
        {gridVals.map(v => (
          <g key={v}>
            <line x1={PL} y1={yPos(v)} x2={PL + pw} y2={yPos(v)} stroke="#e8ebf0" strokeWidth={1} />
            <text x={PL - 5} y={yPos(v)} textAnchor="end" dominantBaseline="central" style={{ fontSize: 9, fill: "#9ca3af", fontFamily: "inherit" }}>{v}</text>
          </g>
        ))}
        <line x1={PL} y1={PT} x2={PL} y2={PT + ph} stroke="#d1d5db" strokeWidth={1.5} />
        <line x1={PL} y1={PT + ph} x2={PL + pw} y2={PT + ph} stroke="#d1d5db" strokeWidth={1.5} />
        {series.map((s, si) => {
          const color = CHART_COLORS[si % CHART_COLORS.length];
          const pts = s.values.map((v, i) => ({ x: xPos(i), y: yPos(v), v }));
          const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
          return (
            <g key={si}>
              <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={si > 0 ? "5,3" : undefined} />
              {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3} fill="white" stroke={color} strokeWidth={1.5} />)}
            </g>
          );
        })}
        {xLabels.map((l, i) => <text key={i} x={xPos(i)} y={PT + ph + 14} textAnchor="middle" style={{ fontSize: 9, fill: "#6b7280", fontFamily: "inherit" }}>{l}</text>)}
        {/* Legend */}
        {series.map((s, i) => (
          <g key={i} transform={`translate(${PL},${PT + ph + (xLabel ? 28 : 22) + i * 13})`}>
            <line x1={0} y1={5} x2={14} y2={5} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} strokeDasharray={i > 0 ? "4,2" : undefined} />
            <text x={18} y={8} dominantBaseline="central" style={{ fontSize: 9, fill: "#374151", fontFamily: "inherit" }}>{s.label}</text>
          </g>
        ))}
        {yLabel && <text transform={`rotate(-90) translate(${-(PT + ph / 2)},13)`} textAnchor="middle" style={{ fontSize: 9, fill: "#9ca3af", fontFamily: "inherit" }}>{yLabel}</text>}
        {xLabel && <text x={PL + pw / 2} y={H - 4} textAnchor="middle" style={{ fontSize: 9, fill: "#9ca3af", fontFamily: "inherit" }}>{xLabel}</text>}
      </svg>
    </div>
  );
}

function ProseFigure({ fig }: { fig: Extract<ChartFigure, { type: "prose" }> }) {
  // Split on sentence boundaries — ". " followed by a capital, "(", or end of string
  const sentences = fig.text
    .split(/\.\s+(?=[A-Z(])/g)
    .map(s => s.trim().replace(/\.+$/, ""))
    .filter(Boolean);
  return (
    <div style={{ marginTop: 4 }}>
      {sentences.map((s, i) => (
        <p key={i} style={{
          margin: i === sentences.length - 1 ? 0 : "0 0 11px",
          fontFamily: "Georgia, serif", fontSize: 14.5, lineHeight: 1.8,
          color: "#334354",
        }}>
          {s}.
        </p>
      ))}
    </div>
  );
}

function ChartRenderer({ fig }: { fig: ChartFigure }) {
  if (fig.type === "line")      return <LineChart      fig={fig} />;
  if (fig.type === "bar")       return <BarChart       fig={fig} />;
  if (fig.type === "pie")       return <PieChart       fig={fig} />;
  if (fig.type === "multiline") return <MultiLineChart fig={fig} />;
  if (fig.type === "table")     return <DataTable      fig={fig} />;
  if (fig.type === "prose")     return <ProseFigure    fig={fig} />;
  // DM charts: stored with headers+rows but no type field
  const f = fig as any;
  if (f.headers && f.rows)      return <DataTable fig={{ type: "table", headers: f.headers, rows: f.rows, title: f.title }} />;
  return null;
}

// ─── DM context formatter ────────────────────────────────────────────────────

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {items.map((line, i) => (
        <li key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
          <span style={{ color: "#8b6bff", fontWeight: 800, fontSize: 14, lineHeight: "1.6", flexShrink: 0 }}>•</span>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 14.5, lineHeight: 1.65, color: "#334354" }}>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function DmContextFormatter({ text, tag }: { text: string; tag: string }) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  if (tag === "dm-syllogisms") {
    return (
      <div>
        <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: ".08em", color: "#8b6bff", textTransform: "uppercase", marginBottom: 14 }}>
          Consider the following premises
        </p>
        <BulletList items={lines} />
      </div>
    );
  }

  if (tag === "dm-interpreting-information") {
    return (
      <div>
        <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: ".08em", color: "#8b6bff", textTransform: "uppercase", marginBottom: 14 }}>
          Eligibility rules
        </p>
        <BulletList items={lines} />
      </div>
    );
  }

  if (tag === "dm-logical-puzzles") {
    // First line: the setup sentence; rest: individual constraints
    const [setup, ...constraints] = lines;
    // Reformat "5 participants/items — X, Y, Z — must occupy the 5 ordered slots A, B, C, D, E, one per slot."
    const cleanSetup = setup
      .replace(/^(\d+)\s+participants\/items\s+/i, "")
      .replace(/\s+one\s+per\s+slot\.?$/i, ".")
      .replace(/must\s+occupy\s+the\s+\d+\s+ordered\s+slots\s+/i, "must each occupy one of five ordered positions: ");
    return (
      <div>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 14.5, lineHeight: 1.7, color: "#334354", marginBottom: 16 }}>
          {cleanSetup}
        </p>
        {constraints.length > 0 && <BulletList items={constraints} />}
      </div>
    );
  }

  // Arguments & Assumptions, Probability, Venn Diagrams — plain passage
  return (
    <div style={{ fontFamily: "Georgia, serif", fontSize: 14.5, lineHeight: 1.8, color: "#334354", whiteSpace: "pre-line" }}>
      {text}
    </div>
  );
}

// ─── Section colours ─────────────────────────────────────────────────────────

const SECTION_COLORS: Record<string, { color: string; deep: string; tint: string; short: string }> = {
  vr: { color: "#2d7ff9", deep: "#1a5fd0", tint: "#eaf2ff", short: "VR" },
  dm: { color: "#8b6bff", deep: "#6747d8", tint: "#f1ecff", short: "DM" },
  qr: { color: "#3dbe6c", deep: "#259650", tint: "#edfbf3", short: "QR" },
  sjt: { color: "#ff6b5c", deep: "#d94b3e", tint: "#ffedea", short: "SJT" },
};

// ─── Passage highlighting ────────────────────────────────────────────────────

function parseHighlightTag(text: string): { highlight: string; clean: string } {
  const m = String(text ?? "").match(/^\s*\[Highlight:\s*"([^"]+)"\]\s*/);
  return m ? { highlight: m[1], clean: text.slice(m[0].length) } : { highlight: "", clean: String(text ?? "") };
}

function applyHighlights(text: string, terms: string[]): React.ReactNode {
  // Build a list of [start, end] ranges to highlight, then render
  type Range = { start: number; end: number };
  const ranges: Range[] = [];

  for (const term of terms) {
    const clean = term.replace(/^[""''"']+|[""''"']+$/g, "").trim();
    if (!clean) continue;
    let idx = text.indexOf(clean);
    if (idx === -1) idx = text.toLowerCase().indexOf(clean.toLowerCase());
    if (idx !== -1) ranges.push({ start: idx, end: idx + clean.length });
  }

  if (ranges.length === 0) return <>{text}</>;

  // Sort and merge overlapping ranges
  ranges.sort((a, b) => a.start - b.start);
  const merged: Range[] = [ranges[0]];
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1];
    if (ranges[i].start <= last.end) last.end = Math.max(last.end, ranges[i].end);
    else merged.push(ranges[i]);
  }

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  for (const r of merged) {
    if (cursor < r.start) nodes.push(text.slice(cursor, r.start));
    nodes.push(<mark key={r.start} className="passage-highlight">{text.slice(r.start, r.end)}</mark>);
    cursor = r.end;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}

function HighlightedPassage({ text, evidence, revealed }: { text: string; evidence?: string; revealed: boolean }) {
  if (!revealed || !evidence) return <>{text}</>;
  const terms = evidence.split("||").map(s => s.trim()).filter(Boolean);
  return applyHighlights(text, terms);
}

// Strip [Highlight: "..."] tags from a displayed explanation string
function cleanExplanation(text: string): string {
  return text.replace(/\[Highlight:\s*"[^"]+"\]\s*/g, "");
}

// ─── Explanation parser ──────────────────────────────────────────────────────

type OptionPart = { letter: string; isCorrect: boolean; reason: string };

function parseOptionExplanations(explanation: string, options: string[], correctIdx: number): OptionPart[] {
  // Find where each option entry starts
  const entryRe = /\b([A-D])(?:\s*\([^)]*\))?\s+(is\s+(?:correct|ruled|not\s+correct|incorrect|wrong|inappropriate)|cannot\s+be\s+correct)/gi;
  const entries: { idx: number; letter: string; isCorrect: boolean }[] = [];
  let m: RegExpExecArray | null;

  while ((m = entryRe.exec(explanation)) !== null) {
    const before = explanation.slice(0, m.index).trim();
    const isEntry = before === "" || /[.!?]$/.test(before);
    if (!isEntry) continue;
    const phrase = m[2].toLowerCase();
    entries.push({
      idx: m.index,
      letter: m[1].toUpperCase(),
      isCorrect: phrase.startsWith("is correct"),
    });
  }

  if (entries.length === 0) {
    // Fallback: show full explanation under the correct option only
    return options.map((_, i) => ({
      letter: String.fromCharCode(65 + i),
      isCorrect: i === correctIdx,
      reason: i === correctIdx ? explanation : "",
    }));
  }

  const parts = entries.map((entry, i) => {
    const raw = explanation.slice(entry.idx, entries[i + 1]?.idx ?? explanation.length).trim().replace(/\.\s*$/, "");
    // Strip "X (Label) is correct because " / "X (Label) cannot be correct because " prefix
    const reason = raw
      .replace(/^[A-D]\s*(?:\([^)]*\))?\s+(?:is\s+correct(?:\s+because)?|is\s+ruled\s+out\s+(?:by|because)?|cannot\s+be\s+correct(?:\s+because)?|is\s+not\s+correct(?:\s+because)?|is\s+incorrect(?:\s+because)?|is\s+inappropriate(?:\s+because)?|is\s+wrong(?:\s+because)?)\s*/i, "")
      .trim();
    return { letter: entry.letter, isCorrect: entry.isCorrect, reason };
  });

  // Ensure every option has an entry
  options.forEach((_, i) => {
    const letter = String.fromCharCode(65 + i);
    if (!parts.find(p => p.letter === letter)) {
      parts.push({ letter, isCorrect: i === correctIdx, reason: "" });
    }
  });

  // Sort A→B→C→D
  parts.sort((a, b) => a.letter.charCodeAt(0) - b.letter.charCodeAt(0));
  return parts;
}

// ─── Explanation UI ──────────────────────────────────────────────────────────

// ── QR step-by-step explanation renderer ─────────────────────────────────────

function QRExplanation({ q, selected, takenMs }: { q: GuestQuestion; selected: number; takenMs: number }) {
  const isRight = selected === q.correct;
  const target = TARGET_S.qr;
  const timing = timingLabel(takenMs, target);
  const correctLetter = String.fromCharCode(65 + q.correct);
  const correctText = q.options[q.correct] ?? "";

  // Strip "What is the question asking? [question] • A) … D) …" preamble
  let raw = (q.explanation ?? "").trim();
  const stepStart = raw.search(/Step\s+1\s*[—–\-]/i);
  if (stepStart > 0) {
    raw = raw.slice(stepStart);
  } else {
    // strip up to last option label e.g. "D) 943.2 "
    raw = raw.replace(/^[\s\S]*?[D-E]\)\s*[^\n|]+[\s|]*/i, "").trim();
  }

  // Split into labelled segments: Step N, Calculation, Therefore
  const segments: { kind: "step" | "calc" | "answer" | "prose"; label?: string; text: string }[] = [];
  const lines = raw.split(/\n/);
  let current: (typeof segments)[0] | null = null;

  for (const line of lines) {
    const s = line.trim();
    if (!s) continue;
    const stepM = s.match(/^(Step\s+\d+)\s*[—–\-]\s*(.*)/i);
    const calcM  = s.match(/^Calculation[:\s—–\-]+(.*)/i);
    const thereM = s.match(/^Therefore[\s,]+(.*)/i);
    if (stepM) {
      if (current) segments.push(current);
      current = { kind: "step", label: stepM[1], text: stepM[2] };
    } else if (calcM) {
      if (current) segments.push(current);
      current = { kind: "calc", text: calcM[1] };
    } else if (thereM) {
      if (current) segments.push(current);
      current = { kind: "answer", text: thereM[1] };
    } else if (current) {
      current.text += " " + s;
    } else {
      segments.push({ kind: "prose", text: s });
    }
  }
  if (current) segments.push(current);

  // If no steps were found, just show the raw text cleanly
  const hasSteps = segments.some(s => s.kind === "step" || s.kind === "calc");

  return (
    <div className="exp-panel">
      <div className={`exp-verdict ${isRight ? "exp-verdict--right" : "exp-verdict--wrong"}`}>
        <span className="exp-verdict-icon">{isRight ? "✓" : "✗"}</span>
        <strong>{isRight ? "Correct" : "Incorrect"}</strong>
        <span>
          {isRight
            ? `— ${correctLetter}) ${correctText}`
            : `— the answer is ${correctLetter}) ${correctText}`}
        </span>
        <span className={`exp-timing ${timing.cls}`}>
          {fmtSec(takenMs)} <em>· target {target}s · {timing.label}</em>
        </span>
      </div>

      <div style={{ padding: "14px 16px 8px" }}>
        {hasSteps ? segments.map((seg, i) => {
          if (seg.kind === "step") return (
            <div key={i} style={{ marginBottom: 10 }}>
              <span style={{ display: "inline-block", background: "var(--section-tint)", color: "var(--section-deep)", fontWeight: 800, fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase" as const, borderRadius: 4, padding: "2px 7px", marginBottom: 4 }}>
                {seg.label}
              </span>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#334354" }}>{seg.text}</p>
            </div>
          );
          if (seg.kind === "calc") return (
            <div key={i} style={{ margin: "10px 0", background: "#f1ecff", borderLeft: "3px solid var(--section)", borderRadius: "0 6px 6px 0", padding: "8px 12px" }}>
              <p style={{ margin: 0, fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "var(--section-deep)" }}>{seg.text}</p>
            </div>
          );
          if (seg.kind === "answer") return (
            <p key={i} style={{ margin: "10px 0 0", fontSize: 13, fontWeight: 700, color: isRight ? "#259650" : "var(--section-deep)" }}>{seg.text}</p>
          );
          return <p key={i} style={{ margin: "0 0 6px", fontSize: 13, lineHeight: 1.6, color: "#334354" }}>{seg.text}</p>;
        }) : (
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#334354", whiteSpace: "pre-line" }}>{raw || q.explanation}</p>
        )}
      </div>
    </div>
  );
}

// ── Standard per-option explanation ──────────────────────────────────────────

function AnswerExplanation({ q, selected, takenMs, section }: { q: GuestQuestion; selected: number; takenMs: number; section: string }) {
  if (section === "qr") return <QRExplanation q={q} selected={selected} takenMs={takenMs} />;

  const isRight = selected === q.correct;
  const rawExplanation = cleanExplanation(q.explanation ?? "");

  // Use structured per-option explanations when available (VR admin, SJT)
  const parts: OptionPart[] = q.optionExplanations
    ? q.options.map((_, i) => ({
        letter: "ABCD"[i] ?? String.fromCharCode(65 + i),
        isCorrect: i === q.correct,
        reason: q.optionExplanations![i] ?? "",
      }))
    : parseOptionExplanations(rawExplanation, q.options, q.correct);

  const target = TARGET_S[section] ?? 40;
  const timing = timingLabel(takenMs, target);

  return (
    <div className="exp-panel">
      {/* Verdict + timing */}
      <div className={`exp-verdict ${isRight ? "exp-verdict--right" : "exp-verdict--wrong"}`}>
        <span className="exp-verdict-icon">{isRight ? "✓" : "✗"}</span>
        <strong>{isRight ? "Correct" : "Incorrect"}</strong>
        <span>{isRight ? "— well spotted" : `— the answer is ${String.fromCharCode(65 + q.correct)}`}</span>
        <span className={`exp-timing ${timing.cls}`}>
          {fmtSec(takenMs)} <em>· target {target}s · {timing.label}</em>
        </span>
      </div>

      {/* Per-option bullets */}
      <div className="exp-options">
        {parts.map((part, i) => {
          const optIdx = "ABCD".indexOf(part.letter);
          const optText = q.optionNotes?.[optIdx] ?? (optIdx >= 0 ? q.options[optIdx] : "");
          const isSelected = optIdx === selected;
          return (
            <div
              key={part.letter}
              className={`exp-row ${part.isCorrect ? "exp-row--correct" : "exp-row--wrong"} ${isSelected && !part.isCorrect ? "exp-row--selected" : ""}`}
            >
              <div className="exp-letter-badge">
                <span>{part.letter}</span>
              </div>
              <div className="exp-row-body">
                <div className="exp-row-head">
                  <span className="exp-opt-text">{optText}</span>
                  {part.isCorrect
                    ? <span className="exp-tag exp-tag--correct">Correct</span>
                    : <span className="exp-tag exp-tag--wrong">Incorrect</span>}
                </div>
                {part.reason && (
                  <p className="exp-reason">
                    <span className="exp-because">{part.isCorrect ? "Why correct — " : "Why not — "}</span>
                    {part.reason.replace(/^\s*because\s+/i, "")}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// ─── Timing ──────────────────────────────────────────────────────────────────

const TARGET_S: Record<string, number> = { vr: 30, dm: 63, qr: 39, sjt: 23 };

function timingLabel(takenMs: number, targetS: number): { label: string; cls: string } {
  const s = takenMs / 1000;
  if (s <= targetS) return { label: "Good pace", cls: "time-ok" };
  if (s <= targetS * 1.6) return { label: "A bit slow", cls: "time-slow" };
  return { label: "Too slow", cls: "time-danger" };
}

function fmtSec(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}:${String(s % 60).padStart(2, "0")}` : `${s}s`;
}

// ─── Slot helpers ─────────────────────────────────────────────────────────────

type QuestionSlot =
  | { kind: "single"; q: GuestQuestion }
  | { kind: "yn-set"; questions: GuestQuestion[] }
  | { kind: "qr-set"; questions: GuestQuestion[] };

function buildSlots(questions: GuestQuestion[], section?: string): QuestionSlot[] {
  const slots: QuestionSlot[] = [];
  let i = 0;
  while (i < questions.length) {
    const q = questions[i];
    const isYN = q.options.length === 2 && q.options[0] === "Yes" && q.options[1] === "No";
    const setId = (q as any).setId as string | undefined;
    const datasetId = (q as any).datasetId as string | undefined;

    if (isYN && setId) {
      // Group by setId — reliable even if stimulus text varies slightly
      const setQs: GuestQuestion[] = [q];
      let j = i + 1;
      while (j < questions.length) {
        const nq = questions[j];
        const nIsYN = nq.options.length === 2 && nq.options[0] === "Yes" && nq.options[1] === "No";
        if (nIsYN && (nq as any).setId === setId) { setQs.push(nq); j++; } else break;
      }
      slots.push({ kind: "yn-set", questions: setQs });
      i = j;
    } else if (section === "qr" && datasetId) {
      // Group QR questions by dataset — shown one at a time, sharing the same context pane
      const setQs: GuestQuestion[] = [q];
      let j = i + 1;
      while (j < questions.length && (questions[j] as any).datasetId === datasetId) {
        setQs.push(questions[j]); j++;
      }
      slots.push(setQs.length > 1 ? { kind: "qr-set", questions: setQs } : { kind: "single", q });
      i = j;
    } else {
      slots.push({ kind: "single", q });
      i++;
    }
  }
  return slots;
}

const Q_TYPE_LABELS: Record<string, string> = {
  "tf-direct": "Direct Retrieval",
  "tf-inference": "Inference",
  "tf-scope": "Scope Check",
  "dm-syllogism": "Syllogisms",
  "dm-interp": "Interpreting Info",
  "dm-logic": "Logic Puzzle",
  "dm-argument": "Arguments",
  "dm-venn": "Venn Diagram",
  "dm-probability": "Probability",
  "sjt-appropriateness": "Appropriateness",
  "sjt-importance": "Importance",
};

function questionTypeLabel(q: GuestQuestion): string {
  const qt = (q as any).questionType as string | undefined;
  if (qt) return qt;
  const tag = q.tag;
  for (const [k, v] of Object.entries(Q_TYPE_LABELS)) {
    if (tag.includes(k)) return v;
  }
  const parts = tag.split("-");
  return parts.slice(1, parts.length - 1).map(p => p[0].toUpperCase() + p.slice(1)).join(" ") || tag;
}

const DIFF_CLASS: Record<string, string> = {
  Bronze: "diff-bronze", Silver: "diff-silver", Gold: "diff-gold",
  Platinum: "diff-platinum", Diamond: "diff-diamond",
};

// ─── Session ─────────────────────────────────────────────────────────────────

function QuestionSession() {
  const router = useRouter();
  const params = useSearchParams();
  const section = params.get("sections")?.split(",")[0] ?? params.get("section") ?? "vr";
  const isGuest = params.get("guest") === "1";
  const difficulty = params.get("difficulty") ?? "Gold";
  const requestedCount = Number(params.get("count")) || 0;
  const colors = SECTION_COLORS[section] ?? SECTION_COLORS.vr;

  const useVRBank = section === "vr" && !isGuest;
  const useQRBank = section === "qr" && !isGuest;
  const useDMBank = section === "dm" && !isGuest;
  const useBank   = useVRBank || useQRBank || useDMBank;

  const staticQuestions: GuestQuestion[] = (() => {
    if (useBank) return [];
    const all = GUEST_QUESTIONS[section] ?? GUEST_QUESTIONS.vr;
    return requestedCount > 0 ? all.slice(0, requestedCount) : all;
  })();

  const [bankQuestions, setBankQuestions] = useState<GuestQuestion[]>([]);
  const [bankLoading, setBankLoading] = useState(useBank);
  const [vrError, setVrError] = useState("");
  const sessionIdRef = useRef<string>("");

  const startRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [lastTakenMs, setLastTakenMs] = useState(0);
  const allTimesRef = useRef<number[]>([]);

  useEffect(() => {
    if (!useBank) return;
    const count = requestedCount > 0 ? requestedCount : (useQRBank ? 20 : 15);
    let endpoint = "";
    if (useQRBank) endpoint = `/api/questions/qr?difficulty=${encodeURIComponent(difficulty)}&count=${count}`;
    else if (useDMBank) {
      const subtypesParam = params.get("subtypes") ?? "";
      const typeParam = params.get("type") ?? "";
      const family = subtypesParam && subtypesParam !== "all" ? subtypesParam : typeParam;
      endpoint = `/api/questions/dm?difficulty=${encodeURIComponent(difficulty)}&count=${count}${family ? `&family=${encodeURIComponent(family)}` : ""}`;
    } else {
      const subtypeParam = params.get("subtype") ?? "";
      endpoint = `/api/questions/vr?difficulty=${encodeURIComponent(difficulty)}&count=${count}${subtypeParam ? `&subtype=${encodeURIComponent(subtypeParam)}` : ""}`;
    }
    fetch(endpoint)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setVrError(data.error); setBankLoading(false); return; }
        sessionIdRef.current = data.sessionId ?? `${section}-${Date.now()}`;
        setBankQuestions(data.questions ?? []);
        setBankLoading(false);
      })
      .catch(() => { setVrError("Failed to load questions. Please try again."); setBankLoading(false); });
  }, []);

  const questions: GuestQuestion[] = useBank ? bankQuestions : staticQuestions;
  const slots = useMemo(() => buildSlots(questions, section), [questions, section]);

  // Slot navigation
  const [slotIdx, setSlotIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [setSelections, setSetSelections] = useState<(number | null)[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean }[]>([]);

  // QR set sub-question state
  const [qrSubIdx, setQrSubIdx] = useState(0);
  const [qrSubSel, setQrSubSel] = useState<number | null>(null);
  const [qrSubRevealed, setQrSubRevealed] = useState(false);

  // Back navigation
  type QSnap = { selected: number | null; setSelections: (number | null)[]; revealed: boolean; flagged: boolean };
  const [snapshots, setSnapshots] = useState<Record<number, QSnap>>({});
  const [answeredSlots, setAnsweredSlots] = useState<Set<number>>(new Set());

  const slot = slots[slotIdx];
  const isLast = slotIdx === slots.length - 1;

  // Representative question (for context, vennFigure, passage)
  const q0: GuestQuestion | undefined = slot
    ? slot.kind === "single" ? slot.q : slot.questions[0]
    : undefined;

  // For QR sets: the active sub-question (right panel)
  const qrCurrQ: GuestQuestion | undefined =
    slot?.kind === "qr-set" ? slot.questions[qrSubIdx] : undefined;

  // Timer target for current slot
  const baseTarget = TARGET_S[section] ?? 40;
  const targetS = slot?.kind === "yn-set" ? baseTarget * slot.questions.length : baseTarget;

  // Reset timer + qr sub-state on slot change
  useEffect(() => {
    startRef.current = Date.now();
    setElapsed(0);
    setQrSubIdx(0);
    setQrSubSel(null);
    setQrSubRevealed(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slotIdx]);

  if (bankLoading) {
    return (
      <div className="screen-question" style={{ "--section": colors.color, "--section-deep": colors.deep, "--section-tint": colors.tint } as any}>
        <div className="question-screen" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--ink-soft)", fontSize: 14 }}>Building your {section.toUpperCase()} session…</p>
        </div>
      </div>
    );
  }

  if (vrError || questions.length === 0 || !slot || !q0) {
    return (
      <div className="screen-question" style={{ "--section": colors.color, "--section-deep": colors.deep, "--section-tint": colors.tint } as any}>
        <div className="question-screen" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <p style={{ color: "var(--coral)", fontSize: 14, marginBottom: 12 }}>
              {vrError || "No questions available for that selection. Try a different difficulty."}
            </p>
            <Link href={`/practice/${section}`}><button style={{ background: colors.color, color: "white", border: 0, borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontWeight: 700 }}>← Back to practice</button></Link>
          </div>
        </div>
      </div>
    );
  }

  // VR passage tracking
  const prevPassageCode = slotIdx > 0 && slots[slotIdx - 1].kind === "single"
    ? (slots[slotIdx - 1] as { kind: "single"; q: GuestQuestion }).q
    : null;
  const curPassageCode = (q0 as any).passageCode;
  const isNewPassage = useVRBank && curPassageCode && (prevPassageCode as any)?.passageCode !== curPassageCode;

  // Derive effective highlighting evidence:
  // 1. Use supportingEvidence if set, OR
  // 2. Extract [Highlight: "..."] from the explanation string as fallback
  const q0SupportingEvidence = (q0 as any).supportingEvidence ?? "";
  const effectiveEvidence = q0SupportingEvidence || (revealed ? parseHighlightTag((q0 as any).explanation ?? "").highlight : "");

  // Can we confirm?
  const canConfirm = slot.kind === "single"
    ? selected !== null
    : slot.kind === "qr-set"
      ? qrSubSel !== null && !qrSubRevealed
      : slot.questions.every((_, i) => setSelections[i] !== undefined && setSelections[i] !== null);

  function saveSlotSnap(i: number) {
    setSnapshots(prev => ({ ...prev, [i]: { selected, setSelections, revealed, flagged } }));
  }

  async function handleExit() {
    if (answers.length > 0) {
      const times = allTimesRef.current;
      const avgMs = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
      const totalCorrect = answers.filter(a => a.correct).length;
      await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          correct: totalCorrect,
          total: answers.length,
          avgMs,
          sessionId: sessionIdRef.current,
        }),
      }).catch(() => {});
      router.push(`/results?section=${section}&total=${answers.length}&correct=${totalCorrect}&avgMs=${avgMs}&sessionId=${encodeURIComponent(sessionIdRef.current)}${isGuest ? "&guest=1" : ""}`);
    } else {
      router.push(`/practice/${section}`);
    }
  }

  function handleBack() {
    if (slotIdx === 0) return;
    const prevSnap = snapshots[slotIdx - 1];
    saveSlotSnap(slotIdx);
    setSlotIdx(s => s - 1);
    if (prevSnap) {
      setSelected(prevSnap.selected); setSetSelections(prevSnap.setSelections);
      setRevealed(prevSnap.revealed); setFlagged(prevSnap.flagged);
    } else {
      setSelected(null); setSetSelections([]); setRevealed(false); setFlagged(false);
    }
  }

  const handleSelect = (i: number) => { if (!revealed) setSelected(i); };

  const handleSetSelect = (qIdx: number, ansIdx: number) => {
    if (revealed) return;
    setSetSelections(prev => {
      const next = [...prev];
      next[qIdx] = ansIdx;
      return next;
    });
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const takenMs = Date.now() - startRef.current;
    setLastTakenMs(takenMs);
    allTimesRef.current = [...allTimesRef.current, takenMs];
    setRevealed(true);

    if (!answeredSlots.has(slotIdx)) {
      setAnsweredSlots(prev => new Set([...prev, slotIdx]));
      if (slot.kind === "single") {
        const isCorrect = selected === slot.q.correct;
        setAnswers(prev => [...prev, { correct: isCorrect }]);
        if (!isGuest) {
          fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionIdRef.current, session_type: "practice",
              question_index: slotIdx, question_tag: slot.q.tag, is_correct: isCorrect,
              time_taken_ms: takenMs, selected_answer: String(selected), correct_answer: String(slot.q.correct) }),
          }).catch(() => {});
        }
      } else {
        // Score as 1 question worth 2 marks: 5/5 = 2, 4/5 = 1, ≤3/5 = 0
        const numCorrect = slot.questions.filter((q, i) => setSelections[i] === q.correct).length;
        const total = slot.questions.length;
        const marks = numCorrect === total ? 2 : numCorrect === total - 1 ? 1 : 0;
        setAnswers(prev => [...prev, { correct: marks >= 1 }, { correct: marks >= 2 }]);
        if (!isGuest) {
          slot.questions.forEach((q, i) => {
            const isCorrect = setSelections[i] === q.correct;
            fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ session_id: sessionIdRef.current, session_type: "practice",
                question_index: slotIdx * 10 + i, question_tag: q.tag, is_correct: isCorrect,
                time_taken_ms: Math.round(takenMs / slot.questions.length),
                selected_answer: String(setSelections[i]), correct_answer: String(q.correct) }),
            }).catch(() => {});
          });
        }
      }
    }
  };

  const handleQrSubConfirm = () => {
    if (qrSubSel === null || qrSubRevealed || slot?.kind !== "qr-set") return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const takenMs = Date.now() - startRef.current;
    setLastTakenMs(takenMs);
    allTimesRef.current = [...allTimesRef.current, takenMs];
    setQrSubRevealed(true);
    const currQ = slot.questions[qrSubIdx];
    const isCorrect = qrSubSel === currQ.correct;
    setAnswers(prev => [...prev, { correct: isCorrect }]);
    if (!isGuest) {
      fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionIdRef.current, session_type: "practice",
          question_index: slotIdx * 10 + qrSubIdx, question_tag: currQ.tag, is_correct: isCorrect,
          time_taken_ms: takenMs, selected_answer: String(qrSubSel), correct_answer: String(currQ.correct) }),
      }).catch(() => {});
    }
  };

  const handleQrSubNext = () => {
    setQrSubIdx(i => i + 1);
    setQrSubSel(null);
    setQrSubRevealed(false);
    startRef.current = Date.now();
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 500);
  };

  const handleNext = () => {
    const nextSnap = snapshots[slotIdx + 1];
    saveSlotSnap(slotIdx);

    if (isLast) {
      const totalCorrect = answers.filter(a => a.correct).length;
      const totalQs = slots.reduce((acc, s) => acc + (s.kind === "yn-set" ? 2 : s.kind === "qr-set" ? s.questions.length : 1), 0);
      const times = allTimesRef.current;
      const avgMs = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
      if (isGuest) {
        document.cookie = `pm_done_${section}=${JSON.stringify({ correct: totalCorrect, total: totalQs })}; path=/; max-age=31536000; SameSite=Lax`;
      }
      router.push(`/results?section=${section}&total=${totalQs}&correct=${totalCorrect}&avgMs=${avgMs}&sessionId=${encodeURIComponent(sessionIdRef.current)}${isGuest ? "&guest=1" : ""}`);
      return;
    }
    setSlotIdx(s => s + 1);
    if (nextSnap) {
      setSelected(nextSnap.selected); setSetSelections(nextSnap.setSelections);
      setRevealed(nextSnap.revealed); setFlagged(nextSnap.flagged);
    } else {
      setSelected(null); setSetSelections([]); setRevealed(false); setFlagged(false);
    }
  };

  // Progress
  const totalSlots = slots.length;
  const doneSlots = slotIdx + (revealed || qrSubRevealed ? 1 : 0);
  const pct = Math.round((doneSlots / totalSlots) * 100);

  // VR passage counter
  const passageNumber = useVRBank && curPassageCode
    ? [...new Set(slots.slice(0, slotIdx + 1).map(s => (s.kind === "single" ? (s.q as any).passageCode : null)))].filter(Boolean).length
    : null;
  const totalPassages = useVRBank
    ? [...new Set(slots.map(s => (s.kind === "single" ? (s.q as any).passageCode : null)))].filter(Boolean).length
    : null;

  // Timer class
  const isAnyRevealed = revealed || qrSubRevealed;
  const timerCls = isAnyRevealed ? "q-timer--done" : elapsed < targetS ? "q-timer--ok" : "q-timer--over";

  // Question type label (from first question in slot)
  const typeLabel = questionTypeLabel(q0);
  const diff = (q0 as any).difficulty as string | undefined;

  return (
    <div className="screen-question" style={{ "--section": colors.color, "--section-deep": colors.deep, "--section-tint": colors.tint } as any}>
      <div className="question-screen">
        <div className="question-topbar">
          <Link href="/" className="question-brand">
            <svg viewBox="0 0 48 32" aria-hidden="true"><path d="M2 18h9l4-13 7 24 6-18 5 7h13" /></svg>
            <span>Pulsemed</span>
            <i>{colors.short}</i>
            <strong>Practice session</strong>
          </Link>
          <div className="question-progress">
            <span>
              {passageNumber !== null
                ? `Passage ${passageNumber} of ${totalPassages} · Q${slotIdx + 1} of ${totalSlots}`
                : slot.kind === "qr-set"
                  ? `Dataset ${slotIdx + 1} of ${totalSlots} · Q${qrSubIdx + 1}/${slot.questions.length}`
                  : `Question ${slotIdx + 1} of ${totalSlots}`}
            </span>
            <div><i style={{ width: `${pct}%` }} /></div>
          </div>
          <div className="question-tools">
            <span className={`q-timer ${timerCls}`}>
              ⏱ {isAnyRevealed ? fmtSec(lastTakenMs) : fmtSec(elapsed * 1000)}
            </span>
            <button className={flagged ? "flagged" : ""} onClick={() => setFlagged(f => !f)}>
              {flagged ? "★ Flagged" : "☆ Flag"}
            </button>
            <button onClick={handleExit}>✕ End session</button>
          </div>
        </div>

        <div className="question-main" style={section === "vr" ? { width: "min(1440px, calc(100% - 40px))" } : undefined}>
          {isNewPassage && (
            <div style={{ marginBottom: 12, padding: "6px 14px", background: colors.tint, borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: colors.color }}>
                Passage {passageNumber} of {totalPassages} — {(q0 as any).passageTitle}
              </span>
            </div>
          )}

          {/* Question type + difficulty badges */}
          <div className="q-meta-row">
            <span className="q-type-badge">{typeLabel}</span>
            {diff && <span className={`q-difficulty-badge ${DIFF_CLASS[diff] ?? ""}`}>{diff}</span>}
            <small style={{ marginLeft: "auto", color: "var(--ink-soft)", fontSize: 11 }}>
              {slot.kind === "yn-set" ? `${slot.questions.length} statements · target ${targetS}s` : `target ${targetS}s`}
            </small>
          </div>

          {(() => {
            const isQrSet  = slot.kind === "qr-set";
            const hasChart = !!(q0 as any).chartFigure || !!(q0 as any).vennFigure;
            // QR-sets: both columns are equal-width cards — don't use wide layout
            const useWide  = section === "vr" || (hasChart && !isQrSet);
            return (
          <div
            className="question-columns"
            style={useWide ? { gridTemplateColumns: "1.75fr 1fr" } : isQrSet ? { gridTemplateColumns: "1fr 1fr" } : undefined}
          >
            {/* LEFT — Passage / context / chart */}
            <div
              className={useWide ? undefined : "question-context"}
              style={useWide ? { padding: "8px 20px 8px 4px", overflowY: "auto", maxHeight: "calc(100vh - 220px)" } : undefined}
            >
              <p style={{ margin: "0 0 8px", color: "var(--section)", letterSpacing: ".1em", fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const }}>{q0.contextLabel}</p>
              {/* Show text if: no chart, OR non-QR section, OR QR-set (show scenario above figure) */}
              {(!(q0 as any).chartFigure || (section !== "qr") || isQrSet) && q0.context && (
                section === "dm" ? (
                  <DmContextFormatter text={q0.context} tag={q0.tag ?? ""} />
                ) : isQrSet ? (
                  <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 12, lineHeight: 1.55, color: "#526170", marginBottom: 14, margin: "0 0 14px" }}>
                    {q0.context}
                  </p>
                ) : (
                  <div
                    className={`passage-text ${revealed && effectiveEvidence ? "passage-text--revealed" : ""}`}
                    style={{ whiteSpace: "pre-line", fontFamily: "Georgia, serif", fontSize: 15, lineHeight: 1.85, color: "#334354" }}
                  >
                    <HighlightedPassage text={q0.context} evidence={effectiveEvidence} revealed={revealed} />
                  </div>
                )
              )}
              {(q0 as any).vennFigure && (
                <VennDiagram fig={(q0 as any).vennFigure as VennFigure} />
              )}
              {(q0 as any).chartFigure && (
                <ChartRenderer fig={(q0 as any).chartFigure as ChartFigure} />
              )}
            </div>

            {/* RIGHT — Question(s) + answers */}
            <div className="question-answer">
              {slot.kind === "yn-set" ? (
                /* ── YN set: all statements at once ── */
                <>
                  <p>YES OR NO — evaluate each statement</p>
                  <div className="yn-set-list">
                    {slot.questions.map((q, i) => {
                      const sel = setSelections[i] ?? null;
                      const isRight = revealed && sel === q.correct;
                      const isWrong = revealed && sel !== null && sel !== q.correct;
                      return (
                        <div key={q.id} className={`yn-row${revealed ? (isRight ? " yn-row--right" : " yn-row--wrong") : ""}`}>
                          <div className="yn-statement">
                            <span className="yn-num">{i + 1}</span>
                            <p>{q.question}</p>
                          </div>
                          <div className="yn-btns">
                            {["Yes", "No"].map((opt, j) => {
                              let cls = "yn-btn";
                              if (revealed) {
                                if (j === q.correct) cls += " yn-correct";
                                else if (j === sel) cls += " yn-incorrect";
                              } else if (j === sel) cls += " yn-selected";
                              return (
                                <button key={j} className={cls} onClick={() => handleSetSelect(i, j)} disabled={revealed}>
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {revealed && (
                            <div className="yn-exp">
                              <span className={isRight ? "yn-tick" : "yn-cross"}>{isRight ? "✓" : "✗"}</span>
                              <p>{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : slot.kind === "qr-set" ? (
                /* ── QR set: one question at a time, shared dataset context ── */
                <>
                  <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".1em", color: "var(--section)", textTransform: "uppercase" as const, margin: "0 0 6px" }}>
                    Question {qrSubIdx + 1} of {slot.questions.length}
                  </p>
                  <h2>{qrCurrQ!.question}</h2>
                  <div className="answer-list">
                    {qrCurrQ!.options.map((opt, i) => {
                      let cls = "";
                      if (qrSubRevealed) {
                        if (i === qrCurrQ!.correct) cls = "correct";
                        else if (i === qrSubSel) cls = "incorrect";
                      } else if (i === qrSubSel) cls = "selected";
                      return (
                        <button key={i} className={cls} onClick={() => { if (!qrSubRevealed) setQrSubSel(i); }}>
                          <span>{String.fromCharCode(65 + i)}</span>
                          {opt}
                          {qrSubRevealed && i === qrCurrQ!.correct && <b>✓</b>}
                        </button>
                      );
                    })}
                  </div>
                  {qrSubRevealed && qrSubSel !== null && (
                    <AnswerExplanation q={qrCurrQ!} selected={qrSubSel} takenMs={lastTakenMs} section={section} />
                  )}
                </>
              ) : (
                /* ── Single MCQ ── */
                <>
                  <p>QUESTION</p>
                  <h2>{slot.q.question}</h2>
                  <div className="answer-list">
                    {slot.q.options.map((opt, i) => {
                      let cls = "";
                      if (revealed) {
                        if (i === slot.q.correct) cls = "correct";
                        else if (i === selected) cls = "incorrect";
                      } else if (i === selected) cls = "selected";
                      return (
                        <button key={i} className={cls} onClick={() => handleSelect(i)}>
                          <span>{String.fromCharCode(65 + i)}</span>
                          {opt}
                          {revealed && i === slot.q.correct && <b>✓</b>}
                        </button>
                      );
                    })}
                  </div>
                  {revealed && selected !== null && (
                    <AnswerExplanation q={slot.q} selected={selected} takenMs={lastTakenMs} section={section} />
                  )}
                </>
              )}
            </div>
          </div>
          );
          })()}

          <div className="question-actions">
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ghost" onClick={handleBack} disabled={slotIdx === 0} style={{ opacity: slotIdx === 0 ? 0.4 : 1 }}>← Back</button>
              <button className="ghost" onClick={handleExit}>✕ Exit</button>
            </div>
            {slot.kind === "qr-set" ? (
              !qrSubRevealed ? (
                <button className="question-primary" disabled={qrSubSel === null} onClick={handleQrSubConfirm}>
                  Confirm answer
                </button>
              ) : qrSubIdx < slot.questions.length - 1 ? (
                <button className="question-primary" onClick={handleQrSubNext}>
                  Next question →
                </button>
              ) : (
                <button className="question-primary" onClick={handleNext}>
                  {isLast ? "See results →" : "Next dataset →"}
                </button>
              )
            ) : !revealed ? (
              <button className="question-primary" disabled={!canConfirm} onClick={handleConfirm}>
                Confirm {slot.kind === "yn-set" ? "all answers" : "answer"}
              </button>
            ) : (
              <button className="question-primary" onClick={handleNext}>
                {isLast ? "See results →" : "Next →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuestionPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "var(--ink-soft)" }}>Loading session…</div>}>
      <QuestionSession />
    </Suspense>
  );
}
