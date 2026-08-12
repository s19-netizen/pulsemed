// ─── Shared types for Mock 1 and Mock 2 ──────────────────────────────────────

export type MockSection = "vr" | "dm" | "qr" | "sjt";
export type MockFormat =
  | "mcq"       // 4-option MCQ
  | "tfct"      // True / False / Can't Tell
  | "multi"     // 5-statement Yes/No (DM)
  | "approp"    // Appropriateness 4-point (SJT)
  | "import"    // Importance 4-point (SJT)
  | "mostleast"; // Most/Least Important (SJT)

export interface MockQuestion {
  id: string;
  qNum: number;          // display number (1-based, resets per section)
  globalNum: number;     // 1-184 overall
  section: MockSection;
  format: MockFormat;
  subtype: string;

  // Context references
  passageId?: string;
  scenarioId?: string;
  dataSetId?: string;

  // Question content
  preamble?: string;     // DM info text / QR extra context
  stem: string;

  // MCQ / TFCT / Appropriateness / Importance
  options?: string[];
  correct?: number;        // 0-based index into options
  correctAnswer?: string;  // For TFCT: "True"/"False"/"Can't Tell"

  // Multi-statement Yes/No (DM)
  statements?: string[];
  correctStatements?: boolean[];

  // Most/Least (SJT)
  factors?: string[];
  correctMost?: number;
  correctLeast?: number;

  // Scoring
  mark_value?: 1 | 2;
  critical_safety?: boolean;

  // Explanation from mark scheme
  explanation: string;
}

export interface MockPassage {
  id: string;
  title: string;
  text: string;
}

export interface MockScenario {
  id: string;
  title: string;
  text: string;
}

export interface MockDataSet {
  id: string;
  title: string;
  description: string;
  tableData?: { headers: string[]; rows: (string | number)[][] };
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export interface ScoringTable {
  [raw: number]: number; // raw → PulseMed score
}

export interface MockScoringTables {
  vr: ScoringTable;
  dm: ScoringTable;
  qr: ScoringTable;
  sjtBands: { min: number; max: number; band: string }[];
  cognitiveClassifications: { min: number; max: number; label: string }[];
}
