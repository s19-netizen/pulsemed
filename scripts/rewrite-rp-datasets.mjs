/**
 * Full rewrite of all 18 QR Ratio/Proportion & Rates datasets.
 * Replaces mechanical template content with natural prose + genuine UCAT-style questions.
 * Run: node scripts/rewrite-rp-datasets.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envRaw = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const getEnv = k => { const m = envRaw.match(new RegExp(`^${k}=(.+)$`, "m")); return m ? m[1].trim() : ""; };

const BASE_URL = `${getEnv("NEXT_PUBLIC_SUPABASE_URL")}/rest/v1`;
const KEY      = getEnv("SUPABASE_SERVICE_ROLE_KEY");
const HEADERS  = { "Content-Type": "application/json", "apikey": KEY, "Authorization": `Bearer ${KEY}` };

async function patch(table, id, body) {
  const res = await fetch(`${BASE_URL}/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH", headers: { ...HEADERS, "Prefer": "return=minimal" }, body: JSON.stringify(body),
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`PATCH ${id}: ${res.status} ${t.slice(0,200)}`); }
}

// Each dataset: id, prose text, scenario label, and 4 questions
const DATASETS = [
  {
    id: "QR-RP-001",
    scenario: "City General Hospital — staffing and ward capacity",
    prose: "City General Hospital employs 36 doctors and 72 nurses across two wards. Ward 1 can process 30 patients per hour, while Ward 2 processes 24 patients per hour.",
    questions: [
      {
        id: "QR-RP-001-Q1",
        question: "What proportion of the hospital's staff are doctors?",
        option_a: "1/4", option_b: "1/3", option_c: "2/5", option_d: "1/2",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Find the total number of staff.\n36 + 72 = 108\n\nStep 2 — Express doctors as a proportion.\nCalculation: 36 ÷ 108 = 1/3\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-001-Q2",
        question: "Ward 1 operates for 3 hours and Ward 2 operates for 5 hours simultaneously. How many patients are processed in total?",
        option_a: "180", option_b: "195", option_c: "210", option_d: "225",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Calculate patients processed by each ward.\nWard 1: 30 × 3 = 90 patients\nWard 2: 24 × 5 = 120 patients\n\nCalculation: 90 + 120 = 210\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-001-Q3",
        question: "Both wards run simultaneously. How long does it take to clear a backlog of 270 patients?",
        option_a: "4 hours", option_b: "5 hours", option_c: "6 hours", option_d: "7 hours",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Find the combined processing rate.\n30 + 24 = 54 patients per hour\n\nCalculation: 270 ÷ 54 = 5 hours\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-001-Q4",
        question: "The hospital recruits additional nurses until the nurse-to-doctor ratio is 3:1. How many extra nurses are recruited?",
        option_a: "18", option_b: "36", option_c: "54", option_d: "72",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — At a 3:1 nurse-to-doctor ratio with 36 doctors, the target is:\n36 × 3 = 108 nurses\n\nStep 2 — Nurses already employed: 72\n\nCalculation: 108 − 72 = 36 additional nurses\n\nTherefore the correct option is B.",
      },
    ],
  },
  {
    id: "QR-RP-002",
    scenario: "Bakery recipe — flour, sugar, and mixing rates",
    prose: "A bakery produces a spiced loaf using 66 g of flour and 110 g of sugar per batch. Mixer A can process ingredients at 33 g per hour; Mixer B processes at 26 g per hour.",
    questions: [
      {
        id: "QR-RP-002-Q1",
        question: "What percentage of the dry ingredient mix is flour?",
        option_a: "30%", option_b: "35%", option_c: "37.5%", option_d: "40%",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Total dry ingredients: 66 + 110 = 176 g\n\nCalculation: 66 ÷ 176 × 100 = 37.5%\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-002-Q2",
        question: "The recipe is scaled up so that flour increases to 99 g, keeping the same flour-to-sugar ratio. How much sugar is needed?",
        option_a: "143 g", option_b: "154 g", option_c: "165 g", option_d: "176 g",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Original ratio: flour:sugar = 66:110 = 3:5\n\nStep 2 — New flour is 99 g. Find the ratio multiplier: 99 ÷ 3 = 33\n\nCalculation: sugar = 5 × 33 = 165 g\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-002-Q3",
        question: "Mixer A runs for 2 hours. What fraction of the full 176 g batch has been processed?",
        option_a: "1/4", option_b: "3/8", option_c: "1/2", option_d: "5/8",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Amount processed by Mixer A in 2 hours:\n33 × 2 = 66 g\n\nCalculation: 66 ÷ 176 = 3/8\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-002-Q4",
        question: "Mixer A runs for the first 2 hours, then both mixers run together for 1 more hour. How many grams are processed in total?",
        option_a: "92 g", option_b: "111 g", option_c: "125 g", option_d: "139 g",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Mixer A alone for 2 hours: 33 × 2 = 66 g\n\nStep 2 — Combined rate: 33 + 26 = 59 g per hour. Together for 1 hour: 59 g\n\nCalculation: 66 + 59 = 125 g\n\nTherefore the correct option is C.",
      },
    ],
  },
  {
    id: "QR-RP-003",
    scenario: "Interior design — paint blending and application rates",
    prose: "An interior design firm creates a custom teal shade by mixing 104 litres of red base and 156 litres of blue base. Sprayer A applies the blend at 36 litres per hour; Sprayer B applies at 28 litres per hour.",
    questions: [
      {
        id: "QR-RP-003-Q1",
        question: "What is the ratio of red to blue paint in its simplest form?",
        option_a: "1:2", option_b: "2:3", option_c: "3:4", option_d: "3:5",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Simplify 104:156.\nDivide both by their HCF (52): 104 ÷ 52 = 2, 156 ÷ 52 = 3\n\nCalculation: 2:3\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-003-Q2",
        question: "A second project requires 325 litres of the same blend. How many litres of blue paint are needed?",
        option_a: "130 L", option_b: "156 L", option_c: "175 L", option_d: "195 L",
        option_e: "",
        correct_answer: "D",
        walkthrough: "Step 1 — Blue paint makes up 3/5 of the total blend (ratio 2:3).\n\nCalculation: 3/5 × 325 = 195 L\n\nTherefore the correct option is D.",
      },
      {
        id: "QR-RP-003-Q3",
        question: "Both sprayers run simultaneously. How long does it take to apply 192 litres?",
        option_a: "2 hours", option_b: "2.5 hours", option_c: "3 hours", option_d: "3.5 hours",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Combined application rate: 36 + 28 = 64 litres per hour\n\nCalculation: 192 ÷ 64 = 3 hours\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-003-Q4",
        question: "A third job uses the same red-to-blue ratio and requires 70 litres of red paint. How many litres of blue paint are needed?",
        option_a: "90 L", option_b: "95 L", option_c: "100 L", option_d: "105 L",
        option_e: "",
        correct_answer: "D",
        walkthrough: "Step 1 — Red:Blue = 2:3. If red = 70 L, find the multiplier: 70 ÷ 2 = 35\n\nCalculation: blue = 3 × 35 = 105 L\n\nTherefore the correct option is D.",
      },
    ],
  },
  {
    id: "QR-RP-004",
    scenario: "Courier company — vehicle fleet and delivery rates",
    prose: "A courier company operates a fleet of 150 vans managed by 210 drivers. Route A vans complete deliveries at 39 per hour; Route B vans complete 30 per hour.",
    questions: [
      {
        id: "QR-RP-004-Q1",
        question: "What percentage of the workforce are drivers (as opposed to van operators)?",
        option_a: "41.7%", option_b: "50%", option_c: "58.3%", option_d: "60%",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Total workforce: 150 + 210 = 360\n\nCalculation: 210 ÷ 360 × 100 = 58.3%\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-004-Q2",
        question: "Route A operates for 5 hours and Route B for 3 hours. How many deliveries are completed in total?",
        option_a: "225", option_b: "255", option_c: "285", option_d: "315",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Route A: 39 × 5 = 195 deliveries\nRoute B: 30 × 3 = 90 deliveries\n\nCalculation: 195 + 90 = 285\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-004-Q3",
        question: "Both routes run simultaneously. How long does it take to complete 345 deliveries?",
        option_a: "4 hours", option_b: "5 hours", option_c: "6 hours", option_d: "7 hours",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Combined rate: 39 + 30 = 69 deliveries per hour\n\nCalculation: 345 ÷ 69 = 5 hours\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-004-Q4",
        question: "The company buys enough additional vans to match the number of drivers. How many vans are purchased?",
        option_a: "30", option_b: "45", option_c: "60", option_d: "75",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Target number of vans = number of drivers = 210\nCurrent vans = 150\n\nCalculation: 210 − 150 = 60 additional vans\n\nTherefore the correct option is C.",
      },
    ],
  },
  {
    id: "QR-RP-005",
    scenario: "Wildlife reserve — animal census and survey rates",
    prose: "Thornfield Nature Reserve is home to 68 mammals and 102 birds across two survey zones. Zone A rangers can survey 42 animals per hour; Zone B rangers survey 32 per hour.",
    questions: [
      {
        id: "QR-RP-005-Q1",
        question: "What fraction of the reserve's recorded animals are mammals?",
        option_a: "1/3", option_b: "2/5", option_c: "1/2", option_d: "2/3",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Total animals: 68 + 102 = 170\n\nCalculation: 68 ÷ 170 = 2/5\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-005-Q2",
        question: "Zone A surveys for 2 hours and Zone B surveys for 3 hours. How many animals are surveyed in total?",
        option_a: "156", option_b: "164", option_c: "180", option_d: "192",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Zone A: 42 × 2 = 84 animals\nZone B: 32 × 3 = 96 animals\n\nCalculation: 84 + 96 = 180\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-005-Q3",
        question: "A new annual survey counts 255 animals, maintaining the same mammal-to-bird ratio. How many birds are recorded?",
        option_a: "102", option_b: "143", option_c: "153", option_d: "170",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Original ratio: mammals:birds = 68:102 = 2:3. Birds make up 3/5 of total.\n\nCalculation: 3/5 × 255 = 153 birds\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-005-Q4",
        question: "Both zones work simultaneously. How long does it take to survey a batch of 148 animals?",
        option_a: "1.5 hours", option_b: "2 hours", option_c: "2.5 hours", option_d: "3 hours",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Combined survey rate: 42 + 32 = 74 animals per hour\n\nCalculation: 148 ÷ 74 = 2 hours\n\nTherefore the correct option is B.",
      },
    ],
  },
  {
    id: "QR-RP-006",
    scenario: "Building site — crew composition and bricklaying rates",
    prose: "A building firm has a crew of 114 bricklayers and 152 labourers on site. Unit A lays bricks at 45 courses per hour; Unit B lays at 34 courses per hour.",
    questions: [
      {
        id: "QR-RP-006-Q1",
        question: "What is the ratio of bricklayers to labourers in its simplest form?",
        option_a: "1:2", option_b: "2:3", option_c: "3:4", option_d: "4:5",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Find the HCF of 114 and 152.\n114 = 2 × 3 × 19; 152 = 8 × 19. HCF = 38\n114 ÷ 38 = 3; 152 ÷ 38 = 4\n\nCalculation: 3:4\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-006-Q2",
        question: "Both units work simultaneously. How many courses are laid in 3 hours?",
        option_a: "197", option_b: "217", option_c: "237", option_d: "257",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Combined rate: 45 + 34 = 79 courses per hour\n\nCalculation: 79 × 3 = 237 courses\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-006-Q3",
        question: "The project requires 395 courses. Both units work together. How long will this take?",
        option_a: "4 hours", option_b: "5 hours", option_c: "6 hours", option_d: "7 hours",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Combined rate: 45 + 34 = 79 courses per hour\n\nCalculation: 395 ÷ 79 = 5 hours\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-006-Q4",
        question: "The firm hires additional bricklayers until they match the number of labourers. How many bricklayers are added?",
        option_a: "19", option_b: "28", option_c: "38", option_d: "57",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Target bricklayers = 152 (to match labourers). Current = 114.\n\nCalculation: 152 − 114 = 38 additional bricklayers\n\nTherefore the correct option is C.",
      },
    ],
  },
  {
    id: "QR-RP-007",
    scenario: "Hospital pharmacy — stock levels and dispensing rates",
    prose: "A hospital pharmacy holds 168 packs of antibiotics and 210 packs of painkillers. The dispensary's Unit A processes stock at 48 packs per hour; Unit B processes at 36 packs per hour.",
    questions: [
      {
        id: "QR-RP-007-Q1",
        question: "What percentage of the pharmacy's total stock are antibiotics?",
        option_a: "40%", option_b: "44.4%", option_c: "50%", option_d: "55.6%",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Total stock: 168 + 210 = 378 packs\n\nCalculation: 168 ÷ 378 × 100 = 44.4%\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-007-Q2",
        question: "Unit A runs for 2 hours and Unit B runs for 3 hours. How many packs are processed in total?",
        option_a: "192", option_b: "204", option_c: "216", option_d: "228",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Unit A: 48 × 2 = 96 packs\nUnit B: 36 × 3 = 108 packs\n\nCalculation: 96 + 108 = 204 packs\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-007-Q3",
        question: "Both units work together. How long does it take to process all 378 packs?",
        option_a: "3.5 hours", option_b: "4 hours", option_c: "4.5 hours", option_d: "5 hours",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Combined rate: 48 + 36 = 84 packs per hour\n\nCalculation: 378 ÷ 84 = 4.5 hours\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-007-Q4",
        question: "A new delivery brings total stock to 504 packs, keeping the same antibiotic-to-painkiller ratio. How many additional antibiotic packs arrived?",
        option_a: "42", option_b: "56", option_c: "63", option_d: "84",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Ratio: antibiotics:painkillers = 168:210 = 4:5. Antibiotics = 4/9 of total.\nNew antibiotic total: 4/9 × 504 = 224 packs\n\nStep 2 — Previous stock: 168 packs\n\nCalculation: 224 − 168 = 56 additional packs\n\nTherefore the correct option is B.",
      },
    ],
  },
  {
    id: "QR-RP-008",
    scenario: "Regional water network — reservoir volumes and pump rates",
    prose: "Two reservoirs supply the regional network: Reservoir A holds 230 megalitres and Reservoir B holds 276 megalitres. Pump station Unit A transfers water at 51 megalitres per hour; Unit B operates at 38 megalitres per hour.",
    questions: [
      {
        id: "QR-RP-008-Q1",
        question: "What is the ratio of Reservoir A's volume to Reservoir B's volume in simplest form?",
        option_a: "4:5", option_b: "5:6", option_c: "6:7", option_d: "7:8",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Find the HCF of 230 and 276.\n230 = 2 × 5 × 23; 276 = 4 × 3 × 23. HCF = 46\n230 ÷ 46 = 5; 276 ÷ 46 = 6\n\nCalculation: 5:6\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-008-Q2",
        question: "Unit B runs for 6 hours. How many megalitres are transferred?",
        option_a: "192", option_b: "204", option_c: "216", option_d: "228",
        option_e: "",
        correct_answer: "D",
        walkthrough: "Step 1 — Unit B rate: 38 megalitres per hour\n\nCalculation: 38 × 6 = 228 megalitres\n\nTherefore the correct option is D.",
      },
      {
        id: "QR-RP-008-Q3",
        question: "Both pumps run simultaneously. How long does it take to transfer 445 megalitres?",
        option_a: "4 hours", option_b: "5 hours", option_c: "6 hours", option_d: "7 hours",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Combined rate: 51 + 38 = 89 megalitres per hour\n\nCalculation: 445 ÷ 89 = 5 hours\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-008-Q4",
        question: "A third reservoir is built to hold water in the same ratio to Reservoir B as Reservoir A does. What is its capacity?",
        option_a: "184 ML", option_b: "192 ML", option_c: "230 ML", option_d: "276 ML",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Reservoir A : Reservoir B = 5:6. The new reservoir has the same ratio to B as A does, so it holds the same as A.\n\nCalculation: 230 megalitres\n\nTherefore the correct option is C.",
      },
    ],
  },
  {
    id: "QR-RP-009",
    scenario: "Event catering — meal allocation and kitchen throughput",
    prose: "A catering company prepares for a large conference: 100 adult meals and 350 children's meals are required. Kitchen Unit A can prepare and plate 54 covers per hour; Unit B manages 40 covers per hour.",
    questions: [
      {
        id: "QR-RP-009-Q1",
        question: "What fraction of all covers are adult meals?",
        option_a: "1/5", option_b: "2/9", option_c: "2/7", option_d: "1/4",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Total covers: 100 + 350 = 450\n\nCalculation: 100 ÷ 450 = 2/9\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-009-Q2",
        question: "A last-minute addition brings the total to 630 covers, keeping the same adult-to-child ratio. How many extra adult meals are needed?",
        option_a: "20", option_b: "30", option_c: "40", option_d: "50",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Adults make up 2/9 of total covers.\nNew adult total: 2/9 × 630 = 140 meals\n\nStep 2 — Previously: 100 adult meals\n\nCalculation: 140 − 100 = 40 extra adult meals\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-009-Q3",
        question: "Both kitchens run simultaneously. How long does it take to prepare 376 covers?",
        option_a: "3 hours", option_b: "3.5 hours", option_c: "4 hours", option_d: "4.5 hours",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Combined rate: 54 + 40 = 94 covers per hour\n\nCalculation: 376 ÷ 94 = 4 hours\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-009-Q4",
        question: "Unit A runs for 3 hours and Unit B for 2 hours. What percentage of the 450-cover order is complete?",
        option_a: "46.2%", option_b: "50%", option_c: "53.8%", option_d: "57.3%",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Covers completed:\nUnit A: 54 × 3 = 162\nUnit B: 40 × 2 = 80\nTotal: 162 + 80 = 242\n\nCalculation: 242 ÷ 450 × 100 = 53.8%\n\nTherefore the correct option is C.",
      },
    ],
  },
  {
    id: "QR-RP-010",
    scenario: "Transport depot — fuel blending and pump throughput",
    prose: "A transport depot blends its own fuel from two stocks: 162 litres of standard petrol and 162 litres of biofuel, mixed in equal parts. Blending pump Unit A processes the mixture at 57 litres per hour; Unit B works at 42 litres per hour.",
    questions: [
      {
        id: "QR-RP-010-Q1",
        question: "The depot receives a 486-litre delivery in the same 1:1 petrol-to-biofuel ratio. How many litres of petrol does it contain?",
        option_a: "162 L", option_b: "216 L", option_c: "243 L", option_d: "270 L",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Petrol:Biofuel = 1:1, so petrol = half the total.\n\nCalculation: 486 ÷ 2 = 243 L\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-010-Q2",
        question: "Unit B processes 252 litres. How long does this take?",
        option_a: "4 hours", option_b: "5 hours", option_c: "6 hours", option_d: "7 hours",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Unit B rate: 42 litres per hour\n\nCalculation: 252 ÷ 42 = 6 hours\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-010-Q3",
        question: "Unit A processes for 3 hours. What fraction of the original 324-litre batch remains unprocessed?",
        option_a: "11/36", option_b: "17/36", option_c: "1/2", option_d: "5/9",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Unit A processes: 57 × 3 = 171 L\nRemaining: 324 − 171 = 153 L\n\nCalculation: 153 ÷ 324 = 17/36\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-010-Q4",
        question: "Both pumps run simultaneously. How long to process 198 litres?",
        option_a: "1.5 hours", option_b: "2 hours", option_c: "2.5 hours", option_d: "3 hours",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Combined rate: 57 + 42 = 99 litres per hour\n\nCalculation: 198 ÷ 99 = 2 hours\n\nTherefore the correct option is B.",
      },
    ],
  },
  {
    id: "QR-RP-011",
    scenario: "Print house — press output and printing rates",
    prose: "A print house runs two presses side by side, each producing 232 units per shift. Press A prints at 60 units per hour; Press B prints at 44 units per hour.",
    questions: [
      {
        id: "QR-RP-011-Q1",
        question: "Press A completes its 232-unit quota first. How long does Press A take?",
        option_a: "3 hours 20 min", option_b: "3 hours 52 min", option_c: "4 hours", option_d: "4 hours 20 min",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Time for Press A: 232 ÷ 60 = 3.867 hours\n\nCalculation: 0.867 hours × 60 = 52 minutes → 3 hours 52 minutes\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-011-Q2",
        question: "Both presses run simultaneously. How long does it take to produce 312 units in total?",
        option_a: "2 hours", option_b: "3 hours", option_c: "3.5 hours", option_d: "4 hours",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Combined rate: 60 + 44 = 104 units per hour\n\nCalculation: 312 ÷ 104 = 3 hours\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-011-Q3",
        question: "Press B runs for 4 hours. What fraction of its 232-unit quota is complete?",
        option_a: "3/4", option_b: "22/29", option_c: "5/6", option_d: "19/23",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Press B produces: 44 × 4 = 176 units\n\nCalculation: 176 ÷ 232 = 22/29\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-011-Q4",
        question: "A rush order requires both presses to complete 520 units. How long will this take working simultaneously?",
        option_a: "4 hours", option_b: "5 hours", option_c: "6 hours", option_d: "7 hours",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Combined rate: 60 + 44 = 104 units per hour\n\nCalculation: 520 ÷ 104 = 5 hours\n\nTherefore the correct option is B.",
      },
    ],
  },
  {
    id: "QR-RP-012",
    scenario: "Research laboratory — solution preparation and pipette rates",
    prose: "A research laboratory prepares a standard solution using 310 mL of concentrate and 310 mL of diluent, mixed in equal parts. Automated pipette Unit A fills vials at 63 mL per hour; Unit B operates at 46 mL per hour.",
    questions: [
      {
        id: "QR-RP-012-Q1",
        question: "The lab scales up to produce 930 mL of solution using the same 1:1 ratio. How much concentrate is required?",
        option_a: "310 mL", option_b: "400 mL", option_c: "465 mL", option_d: "620 mL",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Concentrate:Diluent = 1:1, so concentrate = half the total.\n\nCalculation: 930 ÷ 2 = 465 mL\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-012-Q2",
        question: "Unit A runs for 4 hours. How many mL does it fill?",
        option_a: "184 mL", option_b: "212 mL", option_c: "252 mL", option_d: "268 mL",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Unit A rate: 63 mL per hour\n\nCalculation: 63 × 4 = 252 mL\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-012-Q3",
        question: "Both units run simultaneously. How long does it take to fill 436 mL?",
        option_a: "3 hours", option_b: "4 hours", option_c: "4.5 hours", option_d: "5 hours",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Combined rate: 63 + 46 = 109 mL per hour\n\nCalculation: 436 ÷ 109 = 4 hours\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-012-Q4",
        question: "Unit A fills vials for 3 hours, then Unit B takes over for 2 hours. What total volume is filled?",
        option_a: "257 mL", option_b: "271 mL", option_c: "281 mL", option_d: "299 mL",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Unit A: 63 × 3 = 189 mL\nUnit B: 46 × 2 = 92 mL\n\nCalculation: 189 + 92 = 281 mL\n\nTherefore the correct option is C.",
      },
    ],
  },
  {
    id: "QR-RP-013",
    scenario: "Fulfilment warehouse — picker-to-packer ratio and order rates",
    prose: "A fulfilment warehouse employs 132 pickers and 396 packers across two processing units. Unit A handles orders at 66 items per hour; Unit B processes 48 items per hour.",
    questions: [
      {
        id: "QR-RP-013-Q1",
        question: "What is the ratio of pickers to packers in simplest form?",
        option_a: "1:2", option_b: "1:3", option_c: "2:5", option_d: "1:4",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Simplify 132:396.\nDivide both by 132: 132 ÷ 132 = 1; 396 ÷ 132 = 3\n\nCalculation: 1:3\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-013-Q2",
        question: "Both units work simultaneously. How long does it take to process 570 items?",
        option_a: "4 hours", option_b: "5 hours", option_c: "6 hours", option_d: "7 hours",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Combined rate: 66 + 48 = 114 items per hour\n\nCalculation: 570 ÷ 114 = 5 hours\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-013-Q3",
        question: "Unit A runs for 3 hours, then Unit B runs for 4 hours. How many items are processed in total?",
        option_a: "362", option_b: "374", option_c: "386", option_d: "390",
        option_e: "",
        correct_answer: "D",
        walkthrough: "Step 1 — Unit A: 66 × 3 = 198 items\nUnit B: 48 × 4 = 192 items\n\nCalculation: 198 + 192 = 390 items\n\nTherefore the correct option is D.",
      },
      {
        id: "QR-RP-013-Q4",
        question: "The warehouse hires additional pickers to achieve a 1:2 picker-to-packer ratio. How many pickers are hired?",
        option_a: "46", option_b: "54", option_c: "66", option_d: "132",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — At a 1:2 ratio with 396 packers, target pickers = 396 ÷ 2 = 198\nCurrent pickers = 132\n\nCalculation: 198 − 132 = 66 additional pickers\n\nTherefore the correct option is C.",
      },
    ],
  },
  {
    id: "QR-RP-014",
    scenario: "Hospital trust — nurse-to-patient ratios and ward throughput",
    prose: "A hospital trust has 210 nurses covering 490 patients across two wards. Ward 1 nursing teams can attend to 69 patients per hour; Ward 2 teams cover 50 patients per hour.",
    questions: [
      {
        id: "QR-RP-014-Q1",
        question: "What is the nurse-to-patient ratio in simplest form?",
        option_a: "1:2", option_b: "3:7", option_c: "2:5", option_d: "3:8",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Simplify 210:490.\nDivide both by 70: 210 ÷ 70 = 3; 490 ÷ 70 = 7\n\nCalculation: 3:7\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-014-Q2",
        question: "Ward 1 operates for 4 hours and Ward 2 for 3 hours. How many patients are attended to in total?",
        option_a: "396", option_b: "408", option_c: "420", option_d: "426",
        option_e: "",
        correct_answer: "D",
        walkthrough: "Step 1 — Ward 1: 69 × 4 = 276 patients\nWard 2: 50 × 3 = 150 patients\n\nCalculation: 276 + 150 = 426 patients\n\nTherefore the correct option is D.",
      },
      {
        id: "QR-RP-014-Q3",
        question: "Both wards run simultaneously. How long to cover a waiting list of 357 patients?",
        option_a: "3 hours", option_b: "3.5 hours", option_c: "4 hours", option_d: "4.5 hours",
        option_e: "",
        correct_answer: "A",
        walkthrough: "Step 1 — Combined rate: 69 + 50 = 119 patients per hour\n\nCalculation: 357 ÷ 119 = 3 hours\n\nTherefore the correct option is A.",
      },
      {
        id: "QR-RP-014-Q4",
        question: "The trust aims to improve staffing to a 1:2 nurse-to-patient ratio. How many additional nurses must be hired?",
        option_a: "15", option_b: "25", option_c: "35", option_d: "45",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — At a 1:2 ratio covering 490 patients: target nurses = 490 ÷ 2 = 245\nCurrent nurses = 210\n\nCalculation: 245 − 210 = 35 additional nurses\n\nTherefore the correct option is C.",
      },
    ],
  },
  {
    id: "QR-RP-015",
    scenario: "Wholesale bakery — dough scaling and mixer throughput",
    prose: "A bakery is scaling up production for a wholesale order. Each batch of bread dough requires 296 kg of flour and 222 kg of water. Mixer A can process dough at 72 kg per hour; Mixer B processes at 52 kg per hour.",
    questions: [
      {
        id: "QR-RP-015-Q1",
        question: "What is the ratio of flour to water in the dough in its simplest form?",
        option_a: "3:2", option_b: "4:3", option_c: "5:4", option_d: "7:5",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Simplify 296:222.\nDivide both by 74: 296 ÷ 74 = 4; 222 ÷ 74 = 3\n\nCalculation: 4:3\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-015-Q2",
        question: "A double batch requires 1036 kg of dough in total. How much water is needed?",
        option_a: "370 kg", option_b: "408 kg", option_c: "444 kg", option_d: "518 kg",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Water fraction = 3/7 of dough (ratio 4:3).\n\nCalculation: 3/7 × 1036 = 444 kg\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-015-Q3",
        question: "Both mixers run simultaneously. How long does it take to process 496 kg of dough?",
        option_a: "3 hours", option_b: "4 hours", option_c: "5 hours", option_d: "6 hours",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Combined rate: 72 + 52 = 124 kg per hour\n\nCalculation: 496 ÷ 124 = 4 hours\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-015-Q4",
        question: "Mixer A runs for 3 hours, then Mixer B works alone for 2 hours. How many kilograms are processed in total?",
        option_a: "296 kg", option_b: "316 kg", option_c: "320 kg", option_d: "336 kg",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Mixer A: 72 × 3 = 216 kg\nMixer B: 52 × 2 = 104 kg\n\nCalculation: 216 + 104 = 320 kg\n\nTherefore the correct option is C.",
      },
    ],
  },
  {
    id: "QR-RP-016",
    scenario: "City bus authority — fleet allocation and passenger rates",
    prose: "A city transport authority operates a fleet of 390 single-deck and 312 double-deck buses. Route A buses carry passengers at 75 per hour; Route B buses carry 54 per hour.",
    questions: [
      {
        id: "QR-RP-016-Q1",
        question: "What fraction of the entire fleet are double-deck buses?",
        option_a: "4/9", option_b: "4/7", option_c: "5/9", option_d: "4/11",
        option_e: "",
        correct_answer: "A",
        walkthrough: "Step 1 — Total fleet: 390 + 312 = 702\n\nStep 2 — Simplify 312:702. HCF = 78.\n312 ÷ 78 = 4; 702 ÷ 78 = 9\n\nCalculation: 312/702 = 4/9\n\nTherefore the correct option is A.",
      },
      {
        id: "QR-RP-016-Q2",
        question: "Route A runs for 4 hours and Route B runs for 5 hours. How many passengers are carried in total?",
        option_a: "520", option_b: "570", option_c: "600", option_d: "670",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Route A: 75 × 4 = 300 passengers\nRoute B: 54 × 5 = 270 passengers\n\nCalculation: 300 + 270 = 570\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-016-Q3",
        question: "Both routes run simultaneously. How long to carry 1,161 passengers?",
        option_a: "7 hours", option_b: "8 hours", option_c: "9 hours", option_d: "10 hours",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Combined rate: 75 + 54 = 129 passengers per hour\n\nCalculation: 1161 ÷ 129 = 9 hours\n\nTherefore the correct option is C.",
      },
      {
        id: "QR-RP-016-Q4",
        question: "The authority retires single-deck buses until the fleet is split equally between types. How many single-deck buses are retired?",
        option_a: "39", option_b: "58", option_c: "78", option_d: "97",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — For a 1:1 ratio, single-deck must equal double-deck = 312.\nCurrent single-deck = 390.\n\nCalculation: 390 − 312 = 78 buses retired\n\nTherefore the correct option is C.",
      },
    ],
  },
  {
    id: "QR-RP-017",
    scenario: "Construction firm — concrete mix proportions and mixing rates",
    prose: "A construction company prepares concrete for foundations using 164 kg of cement and 410 kg of sand. Mixing drum Unit A combines materials at 78 kg per hour; Unit B processes 56 kg per hour.",
    questions: [
      {
        id: "QR-RP-017-Q1",
        question: "What is the ratio of cement to sand in its simplest form?",
        option_a: "1:2", option_b: "2:5", option_c: "1:3", option_d: "3:7",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Simplify 164:410.\nDivide both by 82: 164 ÷ 82 = 2; 410 ÷ 82 = 5\n\nCalculation: 2:5\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-017-Q2",
        question: "A larger pour requires 1,148 kg of concrete mix in the same ratio. How much cement is needed?",
        option_a: "276 kg", option_b: "328 kg", option_c: "356 kg", option_d: "411 kg",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Cement fraction = 2/7 of total mix (ratio 2:5).\n\nCalculation: 2/7 × 1148 = 328 kg\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-017-Q3",
        question: "Both drums run simultaneously. How long to process 536 kg of concrete mix?",
        option_a: "4 hours", option_b: "4.5 hours", option_c: "5 hours", option_d: "5.5 hours",
        option_e: "",
        correct_answer: "A",
        walkthrough: "Step 1 — Combined rate: 78 + 56 = 134 kg per hour\n\nCalculation: 536 ÷ 134 = 4 hours\n\nTherefore the correct option is A.",
      },
      {
        id: "QR-RP-017-Q4",
        question: "Unit A mixes for 2 hours, then both drums work together for 3 more hours. How many kilograms are processed in total?",
        option_a: "518 kg", option_b: "558 kg", option_c: "578 kg", option_d: "622 kg",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Unit A alone: 78 × 2 = 156 kg\nBoth together for 3 hours: (78 + 56) × 3 = 134 × 3 = 402 kg\n\nCalculation: 156 + 402 = 558 kg\n\nTherefore the correct option is B.",
      },
    ],
  },
  {
    id: "QR-RP-018",
    scenario: "Manufacturing plant — assembly line output and component stock",
    prose: "A manufacturing plant runs two assembly lines. Line A assembles Machine A components, with 258 units in stock; Line B handles Machine B components, with 516 units available. Line A assembles at 81 units per hour; Line B assembles at 58 units per hour.",
    questions: [
      {
        id: "QR-RP-018-Q1",
        question: "What is the ratio of Machine A stock to Machine B stock in simplest form?",
        option_a: "1:2", option_b: "1:3", option_c: "2:3", option_d: "3:4",
        option_e: "",
        correct_answer: "A",
        walkthrough: "Step 1 — Simplify 258:516.\nDivide both by 258: 258 ÷ 258 = 1; 516 ÷ 258 = 2\n\nCalculation: 1:2\n\nTherefore the correct option is A.",
      },
      {
        id: "QR-RP-018-Q2",
        question: "Line A runs for 3 hours. How many Machine A units remain in stock?",
        option_a: "12", option_b: "15", option_c: "18", option_d: "21",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Units assembled by Line A in 3 hours: 81 × 3 = 243\n\nCalculation: 258 − 243 = 15 units remaining\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-018-Q3",
        question: "Both lines run simultaneously. How long does it take to assemble 695 units in total?",
        option_a: "4 hours", option_b: "5 hours", option_c: "6 hours", option_d: "7 hours",
        option_e: "",
        correct_answer: "B",
        walkthrough: "Step 1 — Combined rate: 81 + 58 = 139 units per hour\n\nCalculation: 695 ÷ 139 = 5 hours\n\nTherefore the correct option is B.",
      },
      {
        id: "QR-RP-018-Q4",
        question: "Line A assembles for 2 hours, then Line B assembles for 4 hours. What is the combined total output?",
        option_a: "374 units", option_b: "388 units", option_c: "394 units", option_d: "404 units",
        option_e: "",
        correct_answer: "C",
        walkthrough: "Step 1 — Line A: 81 × 2 = 162 units\nLine B: 58 × 4 = 232 units\n\nCalculation: 162 + 232 = 394 units\n\nTherefore the correct option is C.",
      },
    ],
  },
];

async function main() {
  console.log("=== Rewriting all 18 RP datasets ===\n");

  for (const ds of DATASETS) {
    process.stdout.write(`${ds.id}: updating dataset... `);
    await patch("qr_datasets", ds.id, {
      scenario: ds.scenario,
      figure_brief: JSON.stringify({ type: "prose", text: ds.prose }),
    });
    console.log("✓");

    for (const q of ds.questions) {
      const { id, ...fields } = q;
      process.stdout.write(`  ${id}... `);
      await patch("qr_questions", id, fields);
      console.log("✓");
    }
  }

  console.log("\n✓ All 18 RP datasets rewritten.");
}

main().catch(e => { console.error("✗", e.message); process.exit(1); });
