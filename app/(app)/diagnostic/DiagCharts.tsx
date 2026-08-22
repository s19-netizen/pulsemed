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

  const dim: React.CSSProperties = { fontSize: 11, fontWeight: 800, color: "#1a5fd0", textAlign: "center" as const };
  const dimG: React.CSSProperties = { fontSize: 10, fontWeight: 800, color: "#259650", textAlign: "center" as const };
  const label: React.CSSProperties = { fontSize: 9, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase" as const, letterSpacing: ".08em", textAlign: "center" as const };

  return (
    <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid var(--line)", padding: "14px 12px" }}>
      <p style={{ textAlign: "center", fontSize: 12, fontWeight: 800, color: "var(--ink)", margin: "0 0 12px", letterSpacing: ".04em", textTransform: "uppercase" as const }}>Cargo Bay &amp; Module</p>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" as const, justifyContent: "center" }}>

        {/* ── Cargo Bay ── */}
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 }}>
          <span style={label}>Available cargo space</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#1a5fd0" }}>Height: {uh} cm</span>
          {/* top-down floor plan: width across, length down */}
          <svg viewBox="0 0 164 144" style={{ width: 164, display: "block" }}>
            <rect x="30" y="14" width="96" height="78" fill="#dbeafe" stroke="#2d7ff9" strokeWidth="2" rx="2"/>
            {/* width arrow below box */}
            <line x1="30" y1="104" x2="126" y2="104" stroke="#1a5fd0" strokeWidth="1.2"/>
            <line x1="30" y1="100" x2="30"  y2="108" stroke="#1a5fd0" strokeWidth="1.2"/>
            <line x1="126" y1="100" x2="126" y2="108" stroke="#1a5fd0" strokeWidth="1.2"/>
            <text x="78" y="118" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1a5fd0">width {uw} cm</text>
            {/* length arrow left of box */}
            <line x1="18" y1="14" x2="18" y2="92" stroke="#1a5fd0" strokeWidth="1.2"/>
            <line x1="14" y1="14" x2="22" y2="14" stroke="#1a5fd0" strokeWidth="1.2"/>
            <line x1="14" y1="92" x2="22" y2="92" stroke="#1a5fd0" strokeWidth="1.2"/>
            <text x="10" y="57" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1a5fd0" transform="rotate(-90,10,57)">length {ul} cm</text>
          </svg>
        </div>

        {/* ── LSM ── */}
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 }}>
          <span style={label}>Life-Support Module</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#259650" }}>Height: {lsm.height} cm</span>
          <svg viewBox="0 0 130 120" style={{ width: 130, display: "block" }}>
            <rect x="26" y="14" width="64" height="52" fill="#d1fae5" stroke="#259650" strokeWidth="2" rx="2"/>
            {/* width arrow below */}
            <line x1="26" y1="78" x2="90" y2="78" stroke="#259650" strokeWidth="1.2"/>
            <line x1="26" y1="74" x2="26" y2="82" stroke="#259650" strokeWidth="1.2"/>
            <line x1="90" y1="74" x2="90" y2="82" stroke="#259650" strokeWidth="1.2"/>
            <text x="58" y="93" textAnchor="middle" fontSize="10" fontWeight="800" fill="#259650">width {lsm.footprintA} cm</text>
            {/* length arrow left */}
            <line x1="14" y1="14" x2="14" y2="66" stroke="#259650" strokeWidth="1.2"/>
            <line x1="10" y1="14" x2="18" y2="14" stroke="#259650" strokeWidth="1.2"/>
            <line x1="10" y1="66" x2="18" y2="66" stroke="#259650" strokeWidth="1.2"/>
            <text x="6" y="43" textAnchor="middle" fontSize="10" fontWeight="800" fill="#259650" transform="rotate(-90,6,43)">length {lsm.footprintB} cm</text>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 900, color: "#1e293b" }}>{massKg} kg</span>
          <span style={{ fontSize: 9, fontWeight: 600, color: "#64748b" }}>per module</span>
        </div>

      </div>
    </div>
  );
}
