"use client";
import React from "react";

// ─── Grouped Bar Chart ─────────────────────────────────────────────────────────

interface GroupedBarData {
  title: string;
  groups: string[];
  series: { label: string; color: string; values: number[] }[];
  yMax: number;
  yLabel: string;
  notes?: string[];
}

export function GroupedBarChart({ data }: { data: GroupedBarData }) {
  const { title, groups, series, yMax, yLabel, notes } = data;
  const W = 520, H = 280;
  const PAD = { top: 44, right: 16, bottom: 72, left: 56 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const groupW = plotW / groups.length;
  const barCount = series.length;
  const gap = 8;
  const barW = (groupW - gap * (barCount + 1)) / barCount;
  const yTicks = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax];

  function barX(gi: number, si: number) {
    return PAD.left + gi * groupW + gap + si * (barW + gap);
  }
  function barY(val: number) {
    return PAD.top + plotH - (val / yMax) * plotH;
  }
  function barH(val: number) {
    return (val / yMax) * plotH;
  }

  return (
    <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid var(--line)", padding: "12px 8px 6px" }}>
      <p style={{ textAlign: "center", fontSize: 13, fontWeight: 800, color: "var(--ink)", margin: "0 0 8px" }}>{title}</p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block", margin: "0 auto", overflow: "visible", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
        {/* Y axis label */}
        <text transform={`translate(12,${PAD.top + plotH / 2}) rotate(-90)`} textAnchor="middle" fontSize="13" fill="#555">{yLabel}</text>

        {/* Y grid + ticks */}
        {yTicks.map((v, i) => {
          const y = barY(v);
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={PAD.left + plotW} y2={y} stroke="#e5e8ed" strokeWidth="1" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="13" fill="#777">{v}</text>
            </g>
          );
        })}

        {/* Bars */}
        {groups.map((group, gi) => (
          <g key={gi}>
            {series.map((s, si) => {
              const val = s.values[gi];
              const x = barX(gi, si);
              const y = barY(val);
              const h = barH(val);
              const labelInside = h > 22;
              return (
                <g key={si}>
                  <rect x={x} y={y} width={barW} height={h} fill={s.color} rx="2" />
                  <text
                    x={x + barW / 2}
                    y={labelInside ? y + h - 8 : y - 6}
                    textAnchor="middle" fontSize="13" fontWeight="800"
                    fill={labelInside ? "white" : s.color}
                    stroke={labelInside ? "none" : "white"} strokeWidth="3" strokeLinejoin="round"
                    paintOrder="stroke"
                  >
                    {val}
                  </text>
                </g>
              );
            })}
            <text
              x={PAD.left + gi * groupW + groupW / 2}
              y={PAD.top + plotH + 20}
              textAnchor="middle" fontSize="13" fill="#444" fontWeight="700"
            >
              {group}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + plotH} stroke="#999" strokeWidth="1.5" />
        <line x1={PAD.left} y1={PAD.top + plotH} x2={PAD.left + plotW} y2={PAD.top + plotH} stroke="#999" strokeWidth="1.5" />

        {/* Legend */}
        {series.map((s, i) => (
          <g key={i} transform={`translate(${PAD.left + i * 140},${H - 16})`}>
            <rect x={0} y={-8} width={14} height={14} fill={s.color} rx="2" />
            <text x={20} y={4} fontSize="13" fill="#444">{s.label}</text>
          </g>
        ))}
      </svg>

      {notes && notes.length > 0 && (
        <div style={{ fontSize: 11, color: "var(--ink-soft)", paddingLeft: 8, borderTop: "1px solid var(--line)", marginTop: 4, paddingTop: 6 }}>
          {notes.map((n, i) => <p key={i} style={{ margin: "1px 0" }}>{n}</p>)}
        </div>
      )}
    </div>
  );
}

// ─── Line Graph ───────────────────────────────────────────────────────────────

interface LineGraphData {
  title: string;
  xLabels: string[];
  yMin: number;
  yMax: number;
  yLabel: string;
  series: { label: string; color: string; values: number[] }[];
}

export function LineGraph({ data }: { data: LineGraphData }) {
  const { title, xLabels, yMin, yMax, yLabel, series } = data;
  const W = 520, H = 260;
  const PAD = { top: 40, right: 20, bottom: 60, left: 60 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const yRange = yMax - yMin;
  const yTicks = [0, 100, 200, 300, 400, 500, 600, 700].filter(v => v >= yMin && v <= yMax);

  function px(xi: number) {
    return PAD.left + xi * (plotW / (xLabels.length - 1));
  }
  function py(val: number) {
    return PAD.top + plotH - ((val - yMin) / yRange) * plotH;
  }

  return (
    <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid var(--line)", padding: "12px 8px 6px" }}>
      <p style={{ textAlign: "center", fontSize: 13, fontWeight: 800, color: "var(--ink)", margin: "0 0 8px" }}>{title}</p>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block", margin: "0 auto", overflow: "visible", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
        <text transform={`translate(12,${PAD.top + plotH / 2}) rotate(-90)`} textAnchor="middle" fontSize="13" fill="#555">{yLabel}</text>

        {yTicks.map((v, i) => {
          const y = py(v);
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={PAD.left + plotW} y2={y} stroke="#e5e8ed" strokeWidth="1" strokeDasharray="4,3" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="13" fill="#777">{v}</text>
            </g>
          );
        })}

        {series.map((s, si) => {
          const points = s.values.map((v, xi) => `${px(xi)},${py(v)}`).join(" ");
          return (
            <g key={si}>
              <polyline points={points} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {s.values.map((v, xi) => {
                const otherClose = series.some((o, i) => i !== si && Math.abs(o.values[xi] - v) < 50);
                const dy = otherClose ? (si === 0 ? -13 : 19) : -13;
                return (
                  <g key={xi}>
                    <circle cx={px(xi)} cy={py(v)} r="5" fill={s.color} />
                    <text
                      x={px(xi)} y={py(v) + dy}
                      textAnchor="middle" fontSize="13" fontWeight="800" fill={s.color}
                      stroke="white" strokeWidth="3" strokeLinejoin="round" paintOrder="stroke"
                    >
                      {v}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + plotH} stroke="#999" strokeWidth="1.5" />
        <line x1={PAD.left} y1={PAD.top + plotH} x2={PAD.left + plotW} y2={PAD.top + plotH} stroke="#999" strokeWidth="1.5" />

        {xLabels.map((lbl, xi) => (
          <text key={xi} x={px(xi)} y={PAD.top + plotH + 20} textAnchor="middle" fontSize="13" fill="#444">{lbl}</text>
        ))}

        {series.map((s, i) => (
          <g key={i} transform={`translate(${PAD.left + i * 140},${H - 16})`}>
            <line x1={0} y1={-3} x2={18} y2={-3} stroke={s.color} strokeWidth="2.5" />
            <circle cx={9} cy={-3} r="4" fill={s.color} />
            <text x={24} y={2} fontSize="13" fill="#444">{s.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Pie Chart Pair ───────────────────────────────────────────────────────────

interface PiePairData {
  categories: string[];
  colors: string[];
  charts: { label: string; values: number[] }[];
}

function PieSlices({ values, colors, cx, cy, r }: {
  values: number[]; colors: string[]; cx: number; cy: number; r: number;
}) {
  const total = values.reduce((a, b) => a + b, 0);
  let startAngle = -Math.PI / 2;
  return (
    <>
      {values.map((v, i) => {
        const sweep = (v / total) * 2 * Math.PI;
        const endAngle = startAngle + sweep;
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const large = sweep > Math.PI ? 1 : 0;
        const midAngle = startAngle + sweep / 2;
        const lx = cx + (r * 0.62) * Math.cos(midAngle);
        const ly = cy + (r * 0.62) * Math.sin(midAngle);
        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
        startAngle = endAngle;
        return (
          <g key={i}>
            <path d={path} fill={colors[i]} stroke="white" strokeWidth="1.5" />
            {v >= 8 && (
              <text
                x={lx} y={ly}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="13" fill="white" fontWeight="800"
                stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" paintOrder="stroke"
              >
                {v}%
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}

export function PieChartPair({ data }: { data: PiePairData }) {
  const { categories, colors, charts } = data;
  const W = 520, H = 280;
  const r = 82;
  const cy = 100;
  const half = Math.ceil(categories.length / 2);

  return (
    <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid var(--line)", padding: "12px 8px 8px" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block", margin: "0 auto", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
        <PieSlices values={charts[0].values} colors={colors} cx={130} cy={cy} r={r} />
        <text x={130} y={cy + r + 20} textAnchor="middle" fontSize="13" fontWeight="800" fill="#333">{charts[0].label}</text>

        <PieSlices values={charts[1].values} colors={colors} cx={360} cy={cy} r={r} />
        <text x={360} y={cy + r + 20} textAnchor="middle" fontSize="13" fontWeight="800" fill="#333">{charts[1].label}</text>

        {/* Legend — two rows centered */}
        {categories.map((cat, i) => {
          const row = i < half ? 0 : 1;
          const col = i < half ? i : i - half;
          const rowCount = row === 0 ? half : categories.length - half;
          const rowW = rowCount * 110;
          const rowX = (W - rowW) / 2 + col * 110;
          const rowY = cy + r + 44 + row * 22;
          return (
            <g key={i} transform={`translate(${rowX},${rowY})`}>
              <rect x={0} y={-9} width={14} height={14} fill={colors[i]} rx="2" />
              <text x={20} y={3} fontSize="13" fill="#333">{cat}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Theatre Table ─────────────────────────────────────────────────────────────

interface TheatreData {
  categories: { type: string; seats: number; price: number }[];
  performances: { name: string; premium: number; standard: number; restricted: number }[];
}

export function TheatreTable({ data }: { data: TheatreData }) {
  const { categories, performances } = data;
  const th: React.CSSProperties = {
    padding: "9px 14px", fontSize: 13, fontWeight: 800, color: "var(--ink)",
    background: "#f0f2f5", borderBottom: "2px solid var(--line)", textAlign: "left",
    whiteSpace: "nowrap",
  };
  const td: React.CSSProperties = {
    padding: "9px 14px", fontSize: 13, color: "var(--ink-soft)", borderBottom: "1px solid var(--line)",
    whiteSpace: "nowrap",
  };
  const tdRight: React.CSSProperties = { ...td, textAlign: "right", fontVariantNumeric: "tabular-nums" };

  return (
    <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid var(--line)", overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", fontSize: 12, color: "var(--ink-soft)", fontWeight: 600 }}>
        Operating costs: £4,850 fixed + £6.40 per attendee
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Ticket type</th>
              <th style={{ ...th, textAlign: "right" }}>Seats/perf.</th>
              <th style={{ ...th, textAlign: "right" }}>Price</th>
              <th style={{ ...th, textAlign: "right" }}>Matinee sold</th>
              <th style={{ ...th, textAlign: "right" }}>Evening 1 sold</th>
              <th style={{ ...th, textAlign: "right" }}>Evening 2 sold</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => {
              const key = cat.type === "Premium" ? "premium" : cat.type === "Standard" ? "standard" : "restricted";
              const perf = performances.map(p => p[key as keyof typeof p] as number);
              return (
                <tr key={i}>
                  <td style={td}>{cat.type}</td>
                  <td style={tdRight}>{cat.seats}</td>
                  <td style={tdRight}>£{cat.price}</td>
                  {perf.map((v, j) => <td key={j} style={tdRight}>{v}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Exhibition Room Floor Plan ────────────────────────────────────────────────

interface RoomData {
  room: { length: number; width: number; height: number };
  door: { width: number; height: number };
  windows: { count: number; width: number; height: number };
  module: { length: number; width: number; height?: number };
  paintCoverage: number;
  coats: number;
  tinSize: number;
}

export function RoomDataCard({ data }: { data: RoomData }) {
  const { room, door, windows, module } = data;

  const S = 55;
  const PL = 60, PT = 30, PR = 44, PB = 64;
  const RW = Math.round(room.length * S);
  const RH = Math.round(room.width * S);
  const W = RW + PL + PR;
  const H = RH + PT + PB;
  const rx = PL, ry = PT;

  const doorPx = Math.round(door.width * S);
  const doorX = rx + Math.round((RW - doorPx) / 2);
  const doorBotY = ry + RH;

  const winPx = Math.round(windows.width * S);
  const winXr = rx + RW;
  const winSpacing = RH / (windows.count + 1);

  // Display unit standalone (shown beside room)
  const DUS = 72; // px per metre for standalone diagram
  const duW = Math.round(module.length * DUS);
  const duH = Math.round(module.width * DUS);
  const DU_PAD = 24;
  const DU_W = duW + DU_PAD * 2;
  const DU_H = duH + DU_PAD * 2 + 26;

  return (
    <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid var(--line)", padding: "12px 8px 12px" }}>
      <p style={{ textAlign: "center", fontSize: 13, fontWeight: 800, color: "var(--ink)", margin: "0 0 10px" }}>
        Exhibition Room — Floor Plan
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* ── Room SVG ── */}
        <div style={{ flex: "3 1 280px" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block", margin: "0 auto", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            {/* Floor fill */}
            <rect x={rx} y={ry} width={RW} height={RH} fill="#eef2f8" />

            {/* Top wall */}
            <line x1={rx} y1={ry} x2={rx + RW} y2={ry} stroke="#1e2c3d" strokeWidth="3" strokeLinecap="round" />
            {/* Left wall */}
            <line x1={rx} y1={ry} x2={rx} y2={ry + RH} stroke="#1e2c3d" strokeWidth="3" strokeLinecap="round" />

            {/* Right wall with window gaps */}
            {(() => {
              const segs: React.ReactElement[] = [];
              let prevY = ry;
              for (let w = 0; w < windows.count; w++) {
                const wCy = ry + Math.round((w + 1) * winSpacing);
                const wY1 = wCy - Math.round(winPx / 2);
                const wY2 = wCy + Math.round(winPx / 2);
                segs.push(
                  <line key={`ws${w}`} x1={winXr} y1={prevY} x2={winXr} y2={wY1} stroke="#1e2c3d" strokeWidth="3" strokeLinecap="round" />,
                  <rect key={`wr${w}`} x={winXr - 6} y={wY1} width={6} height={wY2 - wY1} fill="#a0c4ff" stroke="#6699dd" strokeWidth="1.5" />,
                );
                segs.push(
                  <text key={`wl${w}`} x={winXr + 10} y={wCy + 5} fontSize="12" fill="#4477bb" fontWeight="700">
                    {windows.width} m × {windows.height} m
                  </text>
                );
                prevY = wY2;
              }
              segs.push(<line key="wslast" x1={winXr} y1={prevY} x2={winXr} y2={ry + RH} stroke="#1e2c3d" strokeWidth="3" strokeLinecap="round" />);
              return segs;
            })()}

            {/* Bottom wall with door gap */}
            <line x1={rx} y1={doorBotY} x2={doorX} y2={doorBotY} stroke="#1e2c3d" strokeWidth="3" strokeLinecap="round" />
            <line x1={doorX + doorPx} y1={doorBotY} x2={rx + RW} y2={doorBotY} stroke="#1e2c3d" strokeWidth="3" strokeLinecap="round" />
            {/* Door swing arc */}
            <path
              d={`M ${doorX} ${doorBotY} A ${doorPx} ${doorPx} 0 0 1 ${doorX + doorPx} ${doorBotY - doorPx}`}
              fill="none" stroke="#1e2c3d" strokeWidth="1.5" strokeDasharray="5,3"
            />
            <line x1={doorX} y1={doorBotY} x2={doorX + doorPx} y2={doorBotY - doorPx} stroke="#1e2c3d" strokeWidth="1.5" />
            <text x={doorX + doorPx / 2} y={doorBotY + 18} textAnchor="middle" fontSize="12" fill="#1e2c3d" fontWeight="700">
              Door {door.width} m × {door.height} m
            </text>

            {/* Room height label (inside top-left) */}
            <text x={rx + 8} y={ry + 18} fontSize="12" fill="#666" fontWeight="700">h = {room.height} m</text>

            {/* Width dimension (below room) */}
            <line x1={rx} y1={H - 28} x2={rx + RW} y2={H - 28} stroke="#333" strokeWidth="1.5" />
            <line x1={rx} y1={H - 34} x2={rx} y2={H - 22} stroke="#333" strokeWidth="1.5" />
            <line x1={rx + RW} y1={H - 34} x2={rx + RW} y2={H - 22} stroke="#333" strokeWidth="1.5" />
            <text x={rx + RW / 2} y={H - 10} textAnchor="middle" fontSize="13" fill="#111" fontWeight="900">
              {room.length} m
            </text>

            {/* Depth dimension (left of room) */}
            <line x1={22} y1={ry} x2={22} y2={ry + RH} stroke="#333" strokeWidth="1.5" />
            <line x1={16} y1={ry} x2={28} y2={ry} stroke="#333" strokeWidth="1.5" />
            <line x1={16} y1={ry + RH} x2={28} y2={ry + RH} stroke="#333" strokeWidth="1.5" />
            <text x={12} y={ry + RH / 2} textAnchor="middle" fontSize="13" fill="#111" fontWeight="900"
              transform={`rotate(-90,12,${ry + RH / 2})`}>
              {room.width} m
            </text>
          </svg>
        </div>

        {/* ── Display unit — plan + elevation ── */}
        <div style={{ flex: "1 1 140px", textAlign: "center" }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: "var(--ink-soft)", margin: "0 0 6px", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Display Unit
          </p>

          {/* Top view (plan) */}
          <svg viewBox={`0 0 ${DU_W} ${DU_H}`} style={{ width: "100%", maxWidth: DU_W, display: "block", margin: "0 auto", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
            <rect x={DU_PAD} y={DU_PAD} width={duW} height={duH} fill="#c2d8f8" stroke="#6699dd" strokeWidth="2" rx="3" />
            <text x={DU_PAD + duW / 2} y={DU_PAD + duH + 18} textAnchor="middle" fontSize="12" fill="#111" fontWeight="800">
              {module.length} m
            </text>
            <text x={DU_PAD - 10} y={DU_PAD + duH / 2} textAnchor="middle" fontSize="12" fill="#111" fontWeight="800"
              transform={`rotate(-90,${DU_PAD - 10},${DU_PAD + duH / 2})`}>
              {module.width} m
            </text>
          </svg>
          <p style={{ fontSize: 10, color: "var(--ink-soft)", margin: "0 0 8px" }}>plan (top view)</p>

          {/* Side elevation view — only shown when height is provided */}
          {module.height !== undefined && (() => {
            const ELS = 50; // px per metre
            const elW = Math.round(module.length * ELS);
            const elH = Math.round(module.height * ELS);
            const EP = 20;
            const SVG_W = elW + EP * 2 + 30;
            const SVG_H = elH + EP * 2 + 20;
            return (
              <>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: "100%", maxWidth: SVG_W, display: "block", margin: "0 auto", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
                  <rect x={EP} y={EP} width={elW} height={elH} fill="#c2d8f8" stroke="#6699dd" strokeWidth="2" rx="3" />
                  {/* Width label below */}
                  <text x={EP + elW / 2} y={EP + elH + 15} textAnchor="middle" fontSize="12" fill="#111" fontWeight="800">
                    {module.length} m
                  </text>
                  {/* Height label on right */}
                  <line x1={EP + elW + 6} y1={EP} x2={EP + elW + 6} y2={EP + elH} stroke="#333" strokeWidth="1.5" />
                  <line x1={EP + elW + 2} y1={EP} x2={EP + elW + 10} y2={EP} stroke="#333" strokeWidth="1.5" />
                  <line x1={EP + elW + 2} y1={EP + elH} x2={EP + elW + 10} y2={EP + elH} stroke="#333" strokeWidth="1.5" />
                  <text x={EP + elW + 20} y={EP + elH / 2 + 4} textAnchor="middle" fontSize="12" fill="#111" fontWeight="800">
                    {module.height} m
                  </text>
                </svg>
                <p style={{ fontSize: 10, color: "var(--ink-soft)", margin: "0" }}>elevation (side view)</p>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── Orbital Cargo Bay (Space Geometry dataset) ────────────────────────────────

export interface CargoData {
  bay: { widthM: number; lengthM: number; heightM: number };
  shielding: { sidewall: number; endwall: number; floor: number; ceiling: number };
  lsm: { footprintA: number; footprintB: number; height: number };
  massKg: number;
}

export function CargoDataCard({ data }: { data: CargoData }) {
  const { bay, shielding, lsm, massKg } = data;
  const uw = bay.widthM  * 100 - shielding.sidewall * 2;  // 264 cm
  const ul = bay.lengthM * 100 - shielding.endwall  * 2;  // 342 cm
  const uh = bay.heightM * 100 - shielding.floor - shielding.ceiling; // 220 cm

  // ── Cargo bay oblique-projection box ──────────────────────────────────────────
  // Front face: width(264cm)=88px × height(220cm)=72px
  // Depth projection: length(342cm) → dx=36px, dy=22px
  //
  // Front face corners (origin with ML=50 left margin, MT=26 top margin):
  //   FTL(86,26)  FTR(174,26)
  //   FBL(86,98)  FBR(174,98)
  // Back corners (depth offset):
  //   BTL(50,48)  BTR(138,48)  BBR(138,120)
  //
  // Dimension lines drawn OUTSIDE each face.

  // ── LSM oblique-projection box ────────────────────────────────────────────────
  // Front face: width(54cm)=42px × height(40cm)=31px
  // Depth projection: depth(36cm) → dx=20px, dy=13px
  //
  // Front face corners (ML=38, MT=22):
  //   FTL(58,22)  FTR(100,22)
  //   FBL(58,53)  FBR(100,53)
  // Back corners:
  //   BTL(38,35)  BTR(80,35)  BBR(80,66)

  return (
    <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid var(--line)", padding: "14px 12px" }}>
      <p style={{ textAlign: "center", fontSize: 12, fontWeight: 800, color: "var(--ink)", margin: "0 0 12px", letterSpacing: ".04em", textTransform: "uppercase" as const }}>Cargo Bay &amp; Module</p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" as const, justifyContent: "center" }}>

        {/* ── Cargo Bay 3D box ── */}
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, flex: "2 1 200px" }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase" as const, letterSpacing: ".08em" }}>Available cargo space</span>
          <svg viewBox="0 0 238 152" style={{ width: "100%", maxWidth: 238 }}>
            {/* Right face (darkest) */}
            <polygon points="174,26 138,48 138,120 174,98" fill="#93c5fd" stroke="#2d7ff9" strokeWidth="1.8"/>
            {/* Top face */}
            <polygon points="50,48 138,48 174,26 86,26" fill="#bfdbfe" stroke="#2d7ff9" strokeWidth="1.8"/>
            {/* Front face (lightest) */}
            <polygon points="86,26 174,26 174,98 86,98" fill="#dbeafe" stroke="#2d7ff9" strokeWidth="1.8"/>

            {/* Depth edge bottom-right — visible spine */}
            <line x1="174" y1="98" x2="138" y2="120" stroke="#2d7ff9" strokeWidth="1.8"/>

            {/* ── Width label (264 cm) — below front bottom edge ── */}
            <line x1="86" y1="108" x2="174" y2="108" stroke="#1a5fd0" strokeWidth="1.2"/>
            <line x1="86"  y1="104" x2="86"  y2="112" stroke="#1a5fd0" strokeWidth="1.2"/>
            <line x1="174" y1="104" x2="174" y2="112" stroke="#1a5fd0" strokeWidth="1.2"/>
            <text x="130" y="124" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1a5fd0">{uw} cm</text>

            {/* ── Height label (220 cm) — right of front right edge ── */}
            <line x1="183" y1="26" x2="183" y2="98" stroke="#1a5fd0" strokeWidth="1.2"/>
            <line x1="179" y1="26" x2="187" y2="26" stroke="#1a5fd0" strokeWidth="1.2"/>
            <line x1="179" y1="98" x2="187" y2="98" stroke="#1a5fd0" strokeWidth="1.2"/>
            <text x="204" y="66" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1a5fd0" transform="rotate(-90,204,66)">{uh} cm</text>

            {/* ── Length label (342 cm) — along top-left depth edge, outside box ── */}
            {/* Edge: FTL(86,26)→BTL(50,48) · angle ≈ −31° · label offset above/left */}
            <line x1="86" y1="26" x2="50" y2="48" stroke="#1a5fd0" strokeWidth="1.2"/>
            <text x="58" y="22" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1a5fd0" transform="rotate(-31,58,22)">{ul} cm</text>
          </svg>
        </div>

        {/* ── LSM 3D box ── */}
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, flex: "1 1 130px" }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase" as const, letterSpacing: ".08em" }}>Life-Support Module</span>
          <svg viewBox="0 0 148 120" style={{ width: "100%", maxWidth: 148 }}>
            {/* Right face */}
            <polygon points="100,22 80,35 80,66 100,53" fill="#6ee7b7" stroke="#259650" strokeWidth="1.8"/>
            {/* Top face */}
            <polygon points="38,35 80,35 100,22 58,22" fill="#a7f3d0" stroke="#259650" strokeWidth="1.8"/>
            {/* Front face */}
            <polygon points="58,22 100,22 100,53 58,53" fill="#d1fae5" stroke="#259650" strokeWidth="1.8"/>
            {/* Bottom-right depth spine */}
            <line x1="100" y1="53" x2="80" y2="66" stroke="#259650" strokeWidth="1.8"/>

            {/* ── Width label (54 cm) — below front bottom ── */}
            <line x1="58" y1="62" x2="100" y2="62" stroke="#259650" strokeWidth="1.2"/>
            <line x1="58"  y1="58" x2="58"  y2="66" stroke="#259650" strokeWidth="1.2"/>
            <line x1="100" y1="58" x2="100" y2="66" stroke="#259650" strokeWidth="1.2"/>
            <text x="79" y="77" textAnchor="middle" fontSize="10" fontWeight="800" fill="#259650">{lsm.footprintA} cm</text>

            {/* ── Height label (40 cm) — right of front right edge ── */}
            <line x1="109" y1="22" x2="109" y2="53" stroke="#259650" strokeWidth="1.2"/>
            <line x1="105" y1="22" x2="113" y2="22" stroke="#259650" strokeWidth="1.2"/>
            <line x1="105" y1="53" x2="113" y2="53" stroke="#259650" strokeWidth="1.2"/>
            <text x="128" y="40" textAnchor="middle" fontSize="10" fontWeight="800" fill="#259650" transform="rotate(-90,128,40)">{lsm.height} cm</text>

            {/* ── Depth label (36 cm) — along top-left depth edge, outside box ── */}
            <line x1="58" y1="22" x2="38" y2="35" stroke="#259650" strokeWidth="1.2"/>
            <text x="36" y="17" textAnchor="middle" fontSize="10" fontWeight="800" fill="#259650" transform="rotate(-33,36,17)">{lsm.footprintB} cm</text>

            {/* ── Mass ── */}
            <text x="79" y="96" textAnchor="middle" fontSize="13" fontWeight="900" fill="#1e293b">{massKg} kg</text>
            <text x="79" y="110" textAnchor="middle" fontSize="9" fontWeight="600" fill="#64748b">per module</text>
          </svg>
        </div>

      </div>
    </div>
  );
}
