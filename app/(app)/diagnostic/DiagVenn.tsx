"use client";

export interface DiagVennFigure3 {
  labelA: string; labelB: string; labelC: string;
  total?: number; neither?: number;
  onlyA?: number; onlyB?: number; onlyC?: number;
  ab?: number; ac?: number; bc?: number; abc?: number;
}

const FONT = "Inter, ui-sans-serif, system-ui, sans-serif";

function Num({ x, y, v }: { x: number; y: number; v: number | undefined }) {
  if (v === undefined) return null;
  return (
    <text
      x={x} y={y} textAnchor="middle" dominantBaseline="central"
      fontFamily={FONT} fontSize="14" fontWeight="700" fill="#2d3748"
      stroke="white" strokeWidth="3" strokeLinejoin="round" paintOrder="stroke"
    >
      {v}
    </text>
  );
}

function SLabel({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <text
      x={x} y={y} textAnchor="middle" dominantBaseline="central"
      fontFamily={FONT} fontSize="13" fontWeight="800" fill="#5b3fd4"
      stroke="white" strokeWidth="4" strokeLinejoin="round" paintOrder="stroke"
    >
      {label}
    </text>
  );
}

export function DiagVenn3({ fig }: { fig: DiagVennFigure3 }) {
  // Circles
  const cA = { cx: 125, cy: 118, r: 73 };
  const cB = { cx: 215, cy: 118, r: 73 };
  const cC = { cx: 170, cy: 180, r: 73 };

  return (
    <div style={{ margin: "12px 0" }}>
      <svg
        viewBox="0 0 340 310"
        style={{ width: "100%", maxWidth: 340, display: "block", fontFamily: FONT }}
        aria-label="Venn diagram"
      >
        {/* Total */}
        {fig.total !== undefined && (
          <text x={170} y={14} textAnchor="middle" dominantBaseline="central"
            fontFamily={FONT} fontSize="12" fill="#9ca3af">
            Total: {fig.total}
          </text>
        )}

        {/* Circles */}
        <circle {...cA} fill="rgba(104,70,217,0.07)" stroke="#8b6bff" strokeWidth={1.5} />
        <circle {...cB} fill="rgba(104,70,217,0.07)" stroke="#8b6bff" strokeWidth={1.5} />
        <circle {...cC} fill="rgba(104,70,217,0.07)" stroke="#8b6bff" strokeWidth={1.5} />

        {/* Labels — well outside circles, clear of all numbers */}
        <SLabel x={72}  y={36}  label={fig.labelA} />
        <SLabel x={268} y={36}  label={fig.labelB} />
        <SLabel x={170} y={296} label={fig.labelC} />

        {/* Only regions */}
        <Num x={80}  y={106} v={fig.onlyA} />
        <Num x={260} y={106} v={fig.onlyB} />
        <Num x={170} y={218} v={fig.onlyC} />

        {/* Pairwise intersections */}
        <Num x={170} y={95}  v={fig.ab} />
        <Num x={110} y={158} v={fig.ac} />
        <Num x={230} y={158} v={fig.bc} />

        {/* All three */}
        <Num x={170} y={145} v={fig.abc} />

        {/* Neither box — between circle C bottom and labelC */}
        {fig.neither !== undefined && (
          <>
            <rect x={105} y={258} width={130} height={20} rx={4} fill="#f3f4f6" />
            <text x={170} y={268} textAnchor="middle" dominantBaseline="central"
              fontFamily={FONT} fontSize="12" fill="#6b7280">
              neither: {fig.neither}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
