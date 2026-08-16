"use client";

export type ChartData = {
  type: "bar" | "line" | "pie" | "table";
  title?: string;
  data: { label: string; value: number }[];
};

function BarPreview({ data }: { data: ChartData["data"] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const w = 280, h = 120, pad = 24;
  const step = (w - pad * 2) / Math.max(data.length, 1);
  const bw = Math.min(28, step - 6);
  return (
    <svg viewBox={`0 0 ${w} ${h + 28}`} style={{ width: "100%", maxWidth: 280 }}>
      {data.map((d, i) => {
        const bh = Math.max(2, (d.value / max) * (h - 16));
        const x = pad + i * step + (step - bw) / 2;
        const y = h - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} fill="#8b6bff" opacity={0.75} rx={2} />
            <text x={x + bw / 2} y={y - 3} textAnchor="middle" style={{ fontSize: 8, fill: "#334354", fontFamily: "inherit" }}>{d.value}</text>
            <text x={x + bw / 2} y={h + 14} textAnchor="middle" style={{ fontSize: 8, fill: "#6b7280", fontFamily: "inherit" }}>{String(d.label).slice(0, 8)}</text>
          </g>
        );
      })}
      <line x1={pad} y1={h} x2={w - pad} y2={h} stroke="#e5e9f0" strokeWidth={1} />
    </svg>
  );
}

function LinePreview({ data }: { data: ChartData["data"] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const w = 280, h = 120, pad = 24;
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map((d, i) => ({ x: pad + i * step, y: h - (d.value / max) * (h - 16) }));
  const pStr = pts.map(p => `${p.x},${p.y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h + 28}`} style={{ width: "100%", maxWidth: 280 }}>
      <polyline points={pStr} fill="none" stroke="#8b6bff" strokeWidth={2} />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} fill="#8b6bff" />
          <text x={p.x} y={h + 14} textAnchor="middle" style={{ fontSize: 8, fill: "#6b7280", fontFamily: "inherit" }}>{String(data[i].label).slice(0, 8)}</text>
        </g>
      ))}
      <line x1={pad} y1={h} x2={w - pad} y2={h} stroke="#e5e9f0" strokeWidth={1} />
    </svg>
  );
}

function PiePreview({ data }: { data: ChartData["data"] }) {
  if (!data.length) return null;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const COLORS = ["#8b6bff","#2d7ff9","#3dbe6c","#ff6b5c","#f59e0b","#06b6d4"];
  let angle = -Math.PI / 2;
  const cx = 85, cy = 80, r = 60;
  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
    return { path: `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2}Z`, color: COLORS[i % COLORS.length], label: d.label };
  });
  return (
    <svg viewBox="0 0 230 165" style={{ width: "100%", maxWidth: 230 }}>
      {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} opacity={0.82} />)}
      {slices.map((s, i) => (
        <g key={i}>
          <rect x={170} y={8 + i * 16} width={10} height={10} fill={s.color} rx={2} />
          <text x={184} y={17 + i * 16} style={{ fontSize: 9, fill: "#334354", fontFamily: "inherit" }}>{String(s.label).slice(0, 12)}</text>
        </g>
      ))}
    </svg>
  );
}

function TablePreview({ data }: { data: ChartData["data"] }) {
  return (
    <table style={{ fontSize: 11, borderCollapse: "collapse", width: "100%" }}>
      <thead><tr>
        <th style={{ textAlign: "left", padding: "4px 8px", background: "#f5f7fb", borderBottom: "1.5px solid #e5e9f0", fontWeight: 800, color: "#334354" }}>Label</th>
        <th style={{ textAlign: "right", padding: "4px 8px", background: "#f5f7fb", borderBottom: "1.5px solid #e5e9f0", fontWeight: 800, color: "#334354" }}>Value</th>
      </tr></thead>
      <tbody>{data.map((d, i) => (
        <tr key={i} style={{ background: i % 2 ? "#f9fafb" : "white" }}>
          <td style={{ padding: "4px 8px", color: "#334354" }}>{d.label}</td>
          <td style={{ padding: "4px 8px", textAlign: "right", fontWeight: 700, color: "#334354" }}>{d.value}</td>
        </tr>
      ))}</tbody>
    </table>
  );
}

const fi: React.CSSProperties = { border: "1.5px solid #e5e9f0", borderRadius: 7, padding: "6px 9px", fontSize: 12, color: "#1a2535", boxSizing: "border-box" };

export function ChartBuilder({ value, onChange }: { value: ChartData | null; onChange: (v: ChartData | null) => void }) {
  const enabled = !!value;

  function toggle() {
    if (enabled) onChange(null);
    else onChange({ type: "bar", title: "", data: [{ label: "", value: 0 }, { label: "", value: 0 }] });
  }

  function updateRow(i: number, k: "label" | "value", v: string) {
    if (!value) return;
    const data = [...value.data];
    data[i] = { ...data[i], [k]: k === "value" ? (Number(v) || 0) : v };
    onChange({ ...value, data });
  }

  return (
    <div style={{ border: "1.5px dashed #d0d8e8", borderRadius: 12, padding: 16, background: "#fafffe" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: enabled ? 16 : 0 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: "#3dbe6c" }}>CHART / TABLE</span>
        <button onClick={toggle} style={{
          border: "1.5px solid", borderColor: enabled ? "#3dbe6c" : "#e5e9f0",
          background: enabled ? "#edfbf3" : "white", color: enabled ? "#238a4b" : "#9ba6b5",
          borderRadius: 7, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer",
        }}>{enabled ? "Enabled ✓" : "Add chart"}</button>
      </div>

      {enabled && value && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <p style={{ margin: "0 0 5px", fontSize: 10, color: "#6b7a8c", fontWeight: 700 }}>TYPE</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(["bar","line","pie","table"] as const).map(t => (
                  <button key={t} onClick={() => onChange({ ...value, type: t })} style={{
                    border: "1.5px solid", borderColor: value.type === t ? "#3dbe6c" : "#e5e9f0",
                    background: value.type === t ? "#edfbf3" : "white", color: value.type === t ? "#238a4b" : "#6b7a8c",
                    borderRadius: 7, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer",
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin: "0 0 5px", fontSize: 10, color: "#6b7a8c", fontWeight: 700 }}>TITLE (optional)</p>
              <input style={{ ...fi, width: "100%" }} value={value.title ?? ""} onChange={e => onChange({ ...value, title: e.target.value })} placeholder="e.g. Monthly Revenue (£)" />
            </div>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 10, color: "#6b7a8c", fontWeight: 700 }}>DATA ROWS</p>
              {value.data.map((row, i) => (
                <div key={i} style={{ display: "flex", gap: 5, marginBottom: 5, alignItems: "center" }}>
                  <input style={{ ...fi, flex: 2 }} value={row.label} onChange={e => updateRow(i, "label", e.target.value)} placeholder="Label" />
                  <input style={{ ...fi, width: 72 }} type="number" value={row.value || ""} onChange={e => updateRow(i, "value", e.target.value)} placeholder="0" />
                  <button onClick={() => onChange({ ...value, data: value.data.filter((_, j) => j !== i) })} style={{ border: 0, background: "none", color: "#ff6b5c", cursor: "pointer", fontSize: 14, padding: "0 4px", flexShrink: 0 }}>✕</button>
                </div>
              ))}
              <button onClick={() => onChange({ ...value, data: [...value.data, { label: "", value: 0 }] })} style={{ border: "1.5px dashed #dce2ea", background: "none", borderRadius: 7, padding: "4px 12px", fontSize: 11, color: "#9ba6b5", cursor: "pointer" }}>+ Add row</button>
            </div>
          </div>
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 10, color: "#6b7a8c", fontWeight: 700 }}>PREVIEW</p>
            {value.type === "bar"   && <BarPreview   data={value.data} />}
            {value.type === "line"  && <LinePreview  data={value.data} />}
            {value.type === "pie"   && <PiePreview   data={value.data} />}
            {value.type === "table" && <TablePreview data={value.data} />}
          </div>
        </div>
      )}
    </div>
  );
}
