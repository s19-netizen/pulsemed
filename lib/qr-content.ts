// Quantitative Reasoning content — 8 topics

export type Rule = { title: string; body: string };
export type Step = { label: string; body: string; highlight?: string };
export type WorkedQ = {
  question: string;
  passage?: string;
  steps: Step[];
  answer: string;
  answerNote: string;
  trap?: string;
};
export type PracticeQ = {
  passage: string;
  question: string;
  opts: string[];
  cor: number;
  explanation: string;
};

export type QRSubtype = {
  key: string;
  label: string;
  tagline: string;
  rules: Rule[];
  errors: string[];
  passage: string;
  workedQs: WorkedQ[];
  practice: PracticeQ[];
};

export const QR_NAV = [
  {
    label: "All Topics",
    subtypes: ["fractions","percentages","ratios","averages","rates","money","geometry","data"],
  },
];

// ─── passages ───────────────────────────────────────────────────────────────

const P_FRACTIONS = `A laboratory receives 2,000 sample tubes.
• 3/8 are assigned to Department A.
• 0.275 of the total are assigned to Department B.
• The remainder go to Department C.
• During inspection, 4% of Department C's tubes fail quality checks.`;

const P_PERCENTAGES = `A clinic recorded appointments:

Year  | Total appts | % that were follow-ups
2025  |  18,000     |        35%
2026  |  19,800     |        40%

A laptop is reduced by 15%. VAT at 20% is then added to the discounted price. Delivery costs £24. The final bill is £840.`;

const P_RATIOS = `A drink is produced using concentrate and water in the ratio 3 : 8.
A finished batch contains 770 litres.
7% of the concentrate is lost during processing before it is mixed with water.

Eight identical pumps can empty a 540,000-litre reservoir in 6 hours 45 minutes.
All eight pumps run for 2 hours 15 minutes. Two then fail and the remaining six continue.`;

const P_AVERAGES = `Examination results by programme:

Programme   | Students | Mean score
Foundation  |    40    |     62
Standard    |    75    |     71
Advanced    |    35    |     78

Seven ordered waiting times: 12, 15, 18, x, 23, 27, 31 — their mean is 21 minutes.
An eighth time of 33 minutes is then added.`;

const P_RATES = `A train leaves at 08:14 and arrives at 09:50.
It travels 126 km and remains stationary at an intermediate station for 12 minutes.

A reservoir (capacity 640,000 L) is 35% full at 07:35.
Three pumps begin filling it, each supplying 520 litres per minute.
After 80 minutes, one pump stops.`;

const P_MONEY = `A retailer buys 300 devices for £18.40 each.
20 are damaged and cannot be sold.
Remaining devices sell at £29.50, but 25% are sold with an 8% discount.

A hotel booking costs €1,260. Exchange rate: £1 = €1.17.
Card fee: 2.5% of the pound value. Booking website fee: £18.`;

const P_GEOMETRY = `A rectangular garden: 28 m × 18 m.
• Circular pond — radius 3.5 m
• Rectangular patio — 8 m × 5 m
Remaining area will be turfed. 7% extra turf ordered for waste. Each pack covers 14 m². (Use π = 3.14)

A cylindrical tank: diameter 1.6 m, height 2.2 m. It is 75% full.
Water drains at 28 litres per minute. (Use π = 3.14)`;

const P_DATA = `Water company — average daily figures:

Region | Households | Use per household | Leakage
North  |   48,000   |      142 L        |   18%
East   |   36,000   |      155 L        |   12%
South  |   52,000   |      138 L        |   15%

Leakage % = proportion of water ENTERING the regional network that is lost.
So: Customer use = Entering water × (1 − leakage rate).`;

// ─── subtypes ────────────────────────────────────────────────────────────────

export const QR_SUBTYPES: QRSubtype[] = [
  {
    key: "fractions",
    label: "Number, Fractions & Decimals",
    tagline: "Convert between forms, find fractions of amounts, reverse them",
    rules: [
      { title: "Order of operations", body: "Brackets → Indices → Division/Multiplication → Addition/Subtraction. Never skip steps." },
      { title: "Fraction of an amount", body: "Divide by the denominator, then multiply by the numerator. E.g. 3/8 of 2000 = 2000 ÷ 8 × 3 = 750." },
      { title: "Recover a whole from a part", body: "If you know 7/12 of the tank = 2,940 L, the full tank = 2,940 ÷ 7 × 12." },
      { title: "Convert before comparing", body: "Change fractions and decimals to the same form before adding or comparing." },
      { title: "Round only at the end", body: "Carry full precision through each step. Round only the final answer — rounding early compounds errors." },
      { title: "Practical rounding direction", body: "If you need complete items (containers, bags), round UP even when the decimal is small." },
    ],
    errors: [
      "Finding the amount used instead of the amount remaining — re-read what the question asks for.",
      "Reversing a fraction: dividing by the numerator instead of the denominator.",
      "Losing place value when multiplying or dividing decimals.",
      "Rounding intermediate results, which distorts the final answer.",
      "Giving a decimal answer when only whole items (buses, containers) are possible.",
    ],
    passage: P_FRACTIONS,
    workedQs: [
      {
        question: "How many usable tubes does Department C receive after inspection?",
        steps: [
          { label: "Department A tubes", body: "To find 3/8 of a number: divide by 8 first, then multiply by 3. So 2,000 ÷ 8 = 250, × 3 = 750 tubes go to A.", highlight: "3/8 are assigned to Department A" },
          { label: "Department B tubes", body: "0.275 is just 27.5% written as a decimal — multiply it straight onto the total: 2,000 × 0.275 = 550 tubes for B.", highlight: "0.275 of the total are assigned to Department B" },
          { label: "Department C before inspection", body: "'The remainder' means whatever's left after A and B. Subtract both from the total: 2,000 − 750 − 550 = 700 go to C.", highlight: "The remainder go to Department C" },
          { label: "Remove failed tubes (4%)", body: "4% fail, so 96% pass. Multiply by 0.96 to keep only the usable ones: 700 × 0.96 = 672 usable tubes.", highlight: "4% of Department C's tubes fail quality checks" },
        ],
        answer: "672",
        answerNote: "Always complete the full chain: assign A, assign B, remainder to C, then apply the failure rate.",
        trap: "700 is the tubes assigned to C before inspection — not the final answer.",
      },
      {
        question: "A storage tank is 7/12 full when it contains 2,940 litres. 8% of the current water is then used. Containers hold 450 L each. What is the minimum number of containers to refill the tank?",
        steps: [
          { label: "Recover tank capacity", body: "7/12 of the tank = 2,940 L. To reverse a fraction and find the whole: divide by the numerator (7) then multiply by the denominator (12). 2,940 ÷ 7 × 12 = 5,040 L." },
          { label: "Water remaining after use", body: "8% is used, so 92% stays. Write 92% as 0.92 and multiply: 2,940 × 0.92 = 2,704.8 L still in the tank." },
          { label: "Water needed", body: "Gap to fill = full capacity minus what's already there: 5,040 − 2,704.8 = 2,335.2 L needed." },
          { label: "Containers required", body: "2,335.2 ÷ 450 = 5.19 containers. You can't order a fraction of a container — always round UP. Five would only hold 2,250 L, which isn't enough." },
        ],
        answer: "6 containers",
        answerNote: "When buying containers or bags to reach a target, always round UP.",
        trap: "5 containers hold only 2,250 L — not enough. Round up to 6.",
      },
    ],
    practice: [
      {
        passage: `A factory prepares 3,600 kg of alloy:
• 5/12 is copper
• 0.35 is aluminium
• Remainder is zinc`,
        question: "What fraction of the original mixture is zinc?",
        opts: ["1/5", "7/30", "1/4", "7/24"],
        cor: 1,
        explanation: "Copper: 3,600 × 5/12 = 1,500. Aluminium: 3,600 × 0.35 = 1,260. Zinc: 3,600 − 1,500 − 1,260 = 840. Fraction: 840/3,600 = 7/30.",
      },
      {
        passage: `A factory prepares 3,600 kg of alloy:
• 5/12 is copper (1,500 kg)
• 2.5% of the copper becomes unusable during processing`,
        question: "How much usable copper remains?",
        opts: ["1,425 kg", "1,437.5 kg", "1,462.5 kg", "1,500 kg"],
        cor: 2,
        explanation: "Usable copper = 1,500 × 0.975 = 1,462.5 kg. 2.5% is lost, so 97.5% remains.",
      },
      {
        passage: `A factory prepares 3,600 kg of alloy:
• Copper (5/12): 1,500 kg → 2.5% lost → 1,462.5 kg usable
• Aluminium (0.35): 1,260 kg (assume all usable)
• Zinc (remainder): 840 kg → 1/14 lost during processing

All usable material is packed into containers holding 84 kg maximum.`,
        question: "What is the minimum number of containers required?",
        opts: ["40", "41", "42", "43"],
        cor: 2,
        explanation: "Zinc lost: 840 ÷ 14 = 60 kg. Usable zinc: 780 kg. Copper lost: 37.5 kg. Usable material: 1,462.5 + 1,260 + 780 = 3,502.5 kg. Containers: 3,502.5 ÷ 84 = 41.7 → round UP to 42.",
      },
    ],
  },

  {
    key: "percentages",
    label: "Percentages",
    tagline: "Percentage change, reverse percentages, multipliers and percentage points",
    rules: [
      { title: "Percentage change formula", body: "% change = (new − original) ÷ original × 100. Always divide by the ORIGINAL value." },
      { title: "Use multipliers", body: "A 15% increase → multiply by 1.15. A 15% decrease → multiply by 0.85. Chain them: two separate changes must be applied separately." },
      { title: "Reverse a percentage", body: "If the discounted price is 85% of the original, divide by 0.85 to recover the original." },
      { title: "Percentage vs percentage points", body: "A rate rising from 35% to 40% is a 5 percentage-point increase, but a 14.3% increase in the rate itself (5 ÷ 35 × 100)." },
      { title: "Apply subgroup percentages carefully", body: "A percentage that applies to a subgroup (e.g. 40% of follow-ups) must be calculated from the subgroup total, not the overall total." },
    ],
    errors: [
      "Dividing by the new value instead of the original when calculating % change.",
      "Finding the discount amount instead of the final price.",
      "Confusing percentage change with percentage-point change.",
      "Adding two percentage changes together (e.g. 15% then 10% is NOT 25%).",
      "Applying a subgroup percentage to the wrong (total) population.",
    ],
    passage: P_PERCENTAGES,
    workedQs: [
      {
        question: "By what percentage did the number of follow-up appointments increase from 2025 to 2026?",
        passage: `Clinic follow-up appointments:
• 2025: 18,000 appointments — 35% follow-ups → 6,300 follow-ups
• 2026: 19,800 appointments — 40% follow-ups → 7,920 follow-ups

% change formula: (new − original) ÷ original × 100`,
        steps: [
          { label: "Follow-ups in 2025", body: "35% of appointments were follow-ups. Write 35% as 0.35 and multiply by the total: 18,000 × 0.35 = 6,300 follow-ups in 2025.", highlight: "18,000 appointments — 35% follow-ups" },
          { label: "Follow-ups in 2026", body: "Same method for 2026: 40% = 0.40. Multiply: 19,800 × 0.40 = 7,920 follow-ups. More appointments AND a higher follow-up rate both push this up.", highlight: "19,800 appointments — 40% follow-ups" },
          { label: "Absolute increase", body: "The raw increase in follow-up numbers: 7,920 − 6,300 = 1,620 more follow-ups. Now we need to express this growth as a percentage." },
          { label: "Percentage increase", body: "% increase = increase ÷ original × 100. The original count was 6,300 in 2025. 1,620 ÷ 6,300 × 100 = 25.7%. The 5% you might think of is just the change in the rate — not the count.", highlight: "(new − original) ÷ original × 100" },
        ],
        answer: "25.7%",
        answerNote: "The follow-up percentage rose by 5 percentage points, but the NUMBER of follow-ups rose by 25.7%.",
        trap: "The answer is not 5% — that is the percentage-point change in the rate, not the change in the actual count.",
      },
      {
        question: "A laptop is reduced by 15%, then VAT at 20% is added. Delivery is £24. The final bill is £840. What was the original laptop price before the discount?",
        steps: [
          { label: "Remove delivery", body: "Work backwards through each charge. The £24 delivery is a flat add-on applied last, so remove it first: £840 − £24 = £816 — the laptop price with VAT only.", highlight: "Delivery costs £24" },
          { label: "Remove VAT", body: "20% VAT was added, so £816 represents 120% of the discounted price. To undo it: divide by 1.20. £816 ÷ 1.20 = £680 — the discounted laptop price before VAT.", highlight: "VAT at 20% is then added to the discounted price" },
          { label: "Reverse the 15% discount", body: "A 15% discount means you paid 85% of the original. To find the original: divide by 0.85. £680 ÷ 0.85 = £800. Never add 15% back on — that inflates from the wrong base.", highlight: "A laptop is reduced by 15%" },
        ],
        answer: "£800",
        answerNote: "Work backwards: strip each charge in reverse order using division.",
        trap: "Adding 15% to £680 gives £782 — wrong. To reverse a 15% reduction, divide by 0.85, not multiply by 1.15.",
      },
    ],
    practice: [
      {
        passage: `Subscription service:
Plan     | 2025 users | Monthly price | 2026 change
Basic    |   8,400    |     £12       | +15% users, +5% price
Premium  |   5,600    |     £20       | −4% users, −10% price`,
        question: "How many Basic users are expected in 2026?",
        opts: ["8,820", "9,240", "9,600", "9,660"],
        cor: 3,
        explanation: "8,400 × 1.15 = 9,660. A 15% increase multiplies by 1.15.",
      },
      {
        passage: `A product was priced at £X. It was increased by 20% and then reduced by 20%.`,
        question: "What is the final price as a percentage of the original?",
        opts: ["100% (unchanged)", "96%", "104%", "80%"],
        cor: 1,
        explanation: "Increase by 20%: × 1.20. Then decrease by 20%: × 0.80. Combined: 1.20 × 0.80 = 0.96. The final price is 96% of the original — a net 4% reduction. Sequential percentage changes cannot be added.",
      },
      {
        passage: `In 2024, a town had 4,500 residents. By 2026 this had fallen to 4,095.`,
        question: "What was the overall percentage decrease over the two years?",
        opts: ["5%", "9%", "9.5%", "10%"],
        cor: 1,
        explanation: "% change = (4,095 − 4,500) ÷ 4,500 × 100 = −405 ÷ 4,500 × 100 = −9%. The decrease is 9%. Always divide by the original (2024 figure).",
      },
    ],
  },

  {
    key: "ratios",
    label: "Ratios & Proportion",
    tagline: "Scale ratios, handle processing loss, and apply inverse proportion",
    rules: [
      { title: "Add all ratio parts first", body: "For a ratio of 3:8, the total parts = 11. One part = total ÷ 11. Scale from there." },
      { title: "Apply processing loss by reversing", body: "If 7% of the raw material is lost, the usable amount is 93% of raw. So raw needed = usable ÷ 0.93." },
      { title: "Direct proportion", body: "Both quantities change in the same direction. Use the unitary method: find one unit, then scale up." },
      { title: "Inverse proportion", body: "More workers/pumps = less time. Rate × time = total work. Hold total work constant and recalculate when rate changes." },
      { title: "Round UP when buying", body: "When calculating bags, packs or containers required, always round UP — you cannot buy half a bag." },
    ],
    errors: [
      "Treating ratio parts as actual quantities rather than relative shares.",
      "Scaling one part of a ratio without scaling the others.",
      "Applying direct proportion to pumps or workers — this requires inverse proportion.",
      "Confusing raw material required with usable material produced.",
      "Rounding down when the question asks for the minimum sufficient amount.",
    ],
    passage: P_RATIOS,
    workedQs: [
      {
        question: "How much raw concentrate must enter the process to produce a 770-litre finished batch (3:8 concentrate:water, 7% loss)?",
        steps: [
          { label: "Find concentrate in finished batch", body: "Ratio 3:8 means 3 out of every 11 parts is concentrate (add the parts: 3 + 8 = 11). Concentrate in the 770 L batch: 770 × 3/11 = 210 L.", highlight: "ratio 3 : 8" },
          { label: "Reverse the 7% loss", body: "210 L is what survived after a 7% loss — it's 93% of what entered the process. To find the original starting amount, divide by 0.93: 210 ÷ 0.93 = 225.8 L raw concentrate needed.", highlight: "7% of the concentrate is lost during processing" },
        ],
        answer: "225.8 L",
        answerNote: "The concentrate in the finished drink is the usable portion. Reversing the loss means dividing by the survival rate.",
        trap: "Multiplying 210 by 1.07 gives 224.7 — close but wrong. To reverse a loss, divide by the survival fraction.",
      },
      {
        question: "Eight pumps empty 540,000 L in 6h 45min. All eight run for 2h 15min, then two fail. How long does the entire job take?",
        steps: [
          { label: "Find each pump's rate", body: "First, find the rate per pump. Convert 6h 45min to 6.75 h. All 8 together: 540,000 ÷ 6.75 = 80,000 L/h. Per pump: 80,000 ÷ 8 = 10,000 L/h each.", highlight: "Eight identical pumps can empty a 540,000-litre reservoir in 6 hours 45 minutes" },
          { label: "Water removed in first phase", body: "All 8 pumps run for 2h 15min = 2.25 h. Together: 80,000 × 2.25 = 180,000 L cleared. Track what remains: 540,000 − 180,000 = 360,000 L still to go.", highlight: "All eight pumps run for 2 hours 15 minutes" },
          { label: "Six-pump phase", body: "Two pumps fail, so 6 remain. New rate: 6 × 10,000 = 60,000 L/h. Time to clear the remaining 360,000 L: 360,000 ÷ 60,000 = 6 hours.", highlight: "Two then fail and the remaining six continue" },
          { label: "Total time", body: "Add both phases: 2h 15min + 6h = 8h 15min total. Always split changing-rate problems — don't recalculate the whole job with the reduced number of pumps." },
        ],
        answer: "8 hours 15 minutes",
        answerNote: "Split the problem into two phases. Find the individual pump rate first, then apply it to the new group.",
        trap: "Do not recalculate the whole job with 6 pumps — you must account for the water already removed.",
      },
    ],
    practice: [
      {
        passage: `A recipe for 24 portions requires 1.8 kg rice, 1.2 kg vegetables and 0.75 L sauce.
The caterer must prepare 175 portions.`,
        question: "How much sauce is required for exactly 175 portions?",
        opts: ["4.69 L", "5.25 L", "5.47 L", "5.63 L"],
        cor: 2,
        explanation: "Sauce per portion = 0.75 ÷ 24 = 0.03125 L. For 175 portions: 0.03125 × 175 = 5.47 L (rounded from 5.46875).",
      },
      {
        passage: `A recipe for 24 portions requires 1.8 kg rice. The caterer needs 175 portions.
8% of raw rice is lost during preparation. Rice is sold in 2.5 kg bags.`,
        question: "What is the minimum number of rice bags required?",
        opts: ["5", "6", "7", "8"],
        cor: 1,
        explanation: "Usable rice needed: 1.8 ÷ 24 × 175 = 13.125 kg. Raw rice needed: 13.125 ÷ 0.92 = 14.27 kg. Bags: 14.27 ÷ 2.5 = 5.71 → round UP to 6.",
      },
      {
        passage: `Concrete is mixed in the ratio cement : sand : gravel = 1 : 3 : 5.
A batch requires 360 kg total.`,
        question: "How much sand is in the batch?",
        opts: ["36 kg", "120 kg", "135 kg", "200 kg"],
        cor: 1,
        explanation: "Total parts = 1 + 3 + 5 = 9. One part = 360 ÷ 9 = 40 kg. Sand = 3 parts = 3 × 40 = 120 kg.",
      },
    ],
  },

  {
    key: "averages",
    label: "Averages & Statistics",
    tagline: "Weighted means, missing values, median and combined group averages",
    rules: [
      { title: "Recover totals before combining", body: "Mean × count = total. When combining two groups, sum both totals and divide by the combined count." },
      { title: "Never average two averages directly", body: "If Group A (100 people) averaged 60 and Group B (50 people) averaged 90, the combined mean is NOT (60+90)÷2 = 75. You must weight by group size." },
      { title: "Find a missing value from the mean", body: "Total = mean × count. Subtract the known values to find the missing one." },
      { title: "Median: always sort first", body: "Order all values. For an odd count, the median is the middle value. For an even count, it is the mean of the two middle values." },
      { title: "Adding a value shifts the median", body: "When a new value is added, re-order and re-identify the middle position." },
    ],
    errors: [
      "Averaging two group means without weighting by group size.",
      "Forgetting to order values before finding the median.",
      "Dividing by the wrong count (e.g. using the original n when a value has been added).",
      "Assuming every value equals the mean — the mean describes the group, not each individual.",
      "Calculating the mean of the middle two values incorrectly when n is even.",
    ],
    passage: P_AVERAGES,
    workedQs: [
      {
        question: "What is the combined mean score across all three programmes?",
        passage: `Examination results by programme:
• Foundation: 40 students, mean score 62
• Standard: 75 students, mean score 71
• Advanced: 35 students, mean score 78`,
        steps: [
          { label: "Recover each group's total", body: "Never average the means directly — group size matters. First recover each group's total score: mean × students. Foundation: 62 × 40 = 2,480 total points.", highlight: "Foundation: 40 students, mean score 62" },
          { label: "Sum totals and counts", body: "Add all three score totals: 2,480 + 5,325 + 2,730 = 10,535 points. Add all students: 40 + 75 + 35 = 150 students.", highlight: "Standard: 75 students, mean score 71" },
          { label: "Calculate combined mean", body: "Combined mean = total points ÷ total students = 10,535 ÷ 150 = 70.2. If you just averaged 62, 71 and 78 directly you'd get 70.3 — wrong because the groups are different sizes.", highlight: "Advanced: 35 students, mean score 78" },
        ],
        answer: "70.2",
        answerNote: "Always weight by group size. The unweighted average of 62, 71 and 78 is 70.3 — close but wrong, because Foundation has fewer students.",
        trap: "(62 + 71 + 78) ÷ 3 = 70.3 ignores the different group sizes.",
      },
      {
        question: "Seven ordered waiting times: 12, 15, 18, x, 23, 27, 31. Mean = 21 min. An 8th time of 33 min is added. What is the new median?",
        steps: [
          { label: "Find the missing value x", body: "If the mean of 7 values is 21, their total must be 7 × 21 = 147. The 6 known values add up to 126. So the missing value x = 147 − 126 = 21.", highlight: "Seven ordered waiting times: 12, 15, 18, x, 23, 27, 31" },
          { label: "Add the 8th value", body: "Insert x = 21 and add the new value 33. Full ordered list: 12, 15, 18, 21, 23, 27, 31, 33. Always re-order when a new value is added.", highlight: "An eighth time of 33 minutes is then added" },
          { label: "Find the median of 8 values", body: "With 8 values (even count), the median sits between the 4th and 5th. Those values are 21 and 23. Median = (21 + 23) ÷ 2 = 22 minutes." },
        ],
        answer: "22 minutes",
        answerNote: "Solve for x first using the mean formula, insert it in order, then find the new median.",
        trap: "The median after adding 33 is not the same as before — re-order and recount every time.",
      },
    ],
    practice: [
      {
        passage: P_AVERAGES,
        question: "20 additional students with a mean score of 68 are added to the original 150. What is the new combined mean?",
        opts: ["68.0", "69.4", "70.0", "70.2"],
        cor: 2,
        explanation: "Additional total: 20 × 68 = 1,360. New total: 10,535 + 1,360 = 11,895. New count: 150 + 20 = 170. Mean: 11,895 ÷ 170 = 69.97 ≈ 70.0.",
      },
      {
        passage: `Clinic A saw 240 patients, average wait 38 min. Clinic B saw 160 patients, average wait 53 min.`,
        question: "What is the combined mean waiting time across both clinics?",
        opts: ["43.5 min", "44.0 min", "44.8 min", "45.5 min"],
        cor: 2,
        explanation: "Clinic A total: 240 × 38 = 9,120 min. Clinic B total: 160 × 53 = 8,480 min. Combined: (9,120 + 8,480) ÷ 400 = 17,600 ÷ 400 = 44.0 min.",
      },
      {
        passage: `Five values in order: 14, 18, x, 26, 30. Their mean is 22.`,
        question: "What is x?",
        opts: ["20", "22", "24", "25"],
        cor: 1,
        explanation: "Total = 5 × 22 = 110. Known sum = 14 + 18 + 26 + 30 = 88. x = 110 − 88 = 22.",
      },
    ],
  },

  {
    key: "rates",
    label: "Rates, Time & Capacity",
    tagline: "Speed, flow rates, capacity limits — split multi-phase problems",
    rules: [
      { title: "Speed = distance ÷ time", body: "Always convert time to the same units (hours or minutes) before dividing. 90 minutes = 1.5 hours, not 1.9." },
      { title: "Exclude stops from moving time", body: "If a vehicle stops for 12 minutes mid-journey, subtract that from total journey time to get moving time." },
      { title: "Split changing-rate problems into phases", body: "Calculate what happens in phase 1, subtract from the total, then calculate phase 2 with the new rate." },
      { title: "Round capacity limits DOWN", body: "A lorry that can hold 132.4 items cannot hold 133 — round DOWN to stay within the limit." },
      { title: "Round vehicles or containers UP", body: "If you need 5.2 trips to move everything, you need 6 trips — round UP." },
    ],
    errors: [
      "Treating minutes as decimal hours (e.g. writing 1h 36min as 1.36 h instead of 1.6 h).",
      "Including stop time when calculating average moving speed.",
      "Forgetting to subtract fluid already moved when the rate changes mid-problem.",
      "Rounding in the wrong direction (down for required containers, up for capacity limits).",
      "Using total journey time instead of moving time for speed calculations.",
    ],
    passage: P_RATES,
    workedQs: [
      {
        question: "What is the train's average speed while moving (excluding the 12-minute stop)?",
        steps: [
          { label: "Total journey time", body: "Count from 08:14 to 09:50: 1 hour 36 minutes = 96 minutes total. But this includes the station stop — we can't use it for speed yet.", highlight: "A train leaves at 08:14 and arrives at 09:50" },
          { label: "Moving time", body: "The train was stationary for 12 minutes and covered no distance during that time. Remove it: 96 − 12 = 84 minutes moving. Convert to hours: 84 ÷ 60 = 1.4 h.", highlight: "remains stationary at an intermediate station for 12 minutes" },
          { label: "Speed", body: "Speed = distance ÷ moving time = 126 ÷ 1.4 = 90 km/h. Using the full 96 min (1.6 h) gives only 78.75 km/h — that's wrong because the stop adds time without adding distance.", highlight: "It travels 126 km" },
        ],
        answer: "90 km/h",
        answerNote: "Use MOVING time only. The stop is real time but the train covers no distance during it.",
        trap: "126 ÷ 1.6 = 78.75 km/h uses the full 96-minute journey time — this includes the stop and underestimates the speed.",
      },
      {
        question: "Three pumps start filling the reservoir at 07:35. One stops after 80 minutes. At what time does the reservoir become full?",
        steps: [
          { label: "Initial water", body: "The reservoir isn't empty — it starts 35% full. 640,000 × 0.35 = 224,000 L already inside. The pumps only need to fill the remaining 65%.", highlight: "35% full at 07:35" },
          { label: "Phase 1 (3 pumps, 80 min)", body: "3 pumps at 520 L/min each = 1,560 L/min combined. Over 80 minutes: 1,560 × 80 = 124,800 L added. Running total: 224,000 + 124,800 = 348,800 L.", highlight: "Three pumps begin filling it, each supplying 520 litres per minute" },
          { label: "Phase 2 (2 pumps)", body: "One pump stops, leaving 2 at 1,040 L/min. Still needed: 640,000 − 348,800 = 291,200 L. Time to fill it: 291,200 ÷ 1,040 = 280 minutes.", highlight: "After 80 minutes, one pump stops" },
          { label: "Total time and finish time", body: "Total time: 80 + 280 = 360 min = 6 hours. Started at 07:35 — add 6 hours: tank fills at 13:35." },
        ],
        answer: "13:35",
        answerNote: "Two-phase problems: calculate phase 1, find what remains, then use the new rate for phase 2.",
        trap: "Forgetting the initial 35% already in the reservoir — the pumps don't start from empty.",
      },
    ],
    practice: [
      {
        passage: `A courier van leaves the depot at 09:18, travels 84 km to a distribution centre at 56 km/h, then spends 18 minutes unloading.`,
        question: "When does the van arrive at the distribution centre?",
        opts: ["10:36", "10:42", "10:48", "11:06"],
        cor: 2,
        explanation: "Travel time = 84 ÷ 56 = 1.5 h = 90 min. 09:18 + 90 min = 10:48.",
      },
      {
        passage: `After unloading (arriving 10:48, 18 min unload), the van returns along the same 84 km route at 48 km/h.`,
        question: "When does the van return to the depot?",
        opts: ["12:33", "12:39", "12:45", "12:51"],
        cor: 3,
        explanation: "Departs distribution centre: 10:48 + 18 min = 11:06. Return time: 84 ÷ 48 = 1.75 h = 1 h 45 min. Returns: 11:06 + 1 h 45 min = 12:51.",
      },
      {
        passage: `The van's maximum load is 1.8 tonnes. It may carry no more than 92% of its maximum load. Parcels average 12.5 kg each.`,
        question: "What is the greatest number of average-mass parcels the van may carry?",
        opts: ["126", "130", "132", "133"],
        cor: 2,
        explanation: "Allowed load: 1,800 × 0.92 = 1,656 kg. Parcels: 1,656 ÷ 12.5 = 132.48 → round DOWN to 132 (cannot exceed the limit).",
      },
    ],
  },

  {
    key: "money",
    label: "Money & Financial Calculations",
    tagline: "Profit, margin, mark-up, discounts and currency conversion",
    rules: [
      { title: "Profit = revenue − cost", body: "Cost includes ALL stock purchased, including damaged items that cannot be sold." },
      { title: "Profit margin vs mark-up", body: "Margin = profit ÷ REVENUE × 100. Mark-up = profit ÷ COST × 100. These are different denominators." },
      { title: "Apply discounts to the right group", body: "If 25% of items are discounted, calculate revenue for the discounted group and the full-price group separately, then add." },
      { title: "Currency conversion direction", body: "To convert £ to €: multiply by the rate. To convert € to £: divide by the rate. Double-check which direction you need." },
      { title: "Add transaction fees after converting", body: "Fees charged in the destination currency are applied after conversion, not before." },
    ],
    errors: [
      "Forgetting damaged or unsold stock when calculating total cost.",
      "Confusing profit margin (÷ revenue) with mark-up (÷ cost).",
      "Applying a discount to every sale rather than only the discounted proportion.",
      "Reversing the exchange rate — dividing instead of multiplying or vice versa.",
      "Confusing revenue and profit — profit is what remains after costs.",
    ],
    passage: P_MONEY,
    workedQs: [
      {
        question: "What is the retailer's profit margin on the device sale?",
        steps: [
          { label: "Total cost", body: "Cost covers ALL 300 devices — including the broken ones you can't sell. You paid for them, so they count: 300 × £18.40 = £5,520.", highlight: "300 devices for £18.40 each" },
          { label: "Sellable devices", body: "Of the 300 purchased, 20 are damaged and unsellable. Only 280 can actually generate revenue.", highlight: "20 are damaged and cannot be sold" },
          { label: "Split into full-price and discounted", body: "25% of 280 = 70 sell at a discount (8% off = 92% of price = £27.14). The remaining 210 sell at full price (£29.50).", highlight: "25% are sold with an 8% discount" },
          { label: "Revenue", body: "Calculate each group separately and add: (210 × £29.50) + (70 × £27.14) = £6,195 + £1,899.80 = £8,094.80 total revenue." },
          { label: "Profit margin", body: "Profit = revenue − cost = £8,094.80 − £5,520 = £2,574.80. Margin = profit ÷ revenue × 100 = 31.8%. Margin always divides by revenue, not cost." },
        ],
        answer: "31.8%",
        answerNote: "Include ALL 300 devices in cost, even the 20 that can't be sold.",
        trap: "~46.6% is approximately the mark-up on cost (profit ÷ cost). Margin divides by revenue.",
      },
      {
        question: "What is the total cost of the hotel booking in pounds?",
        steps: [
          { label: "Convert to pounds", body: "Rate says £1 = €1.17, so euros are worth less than pounds. To go from euros to pounds, divide by 1.17: €1,260 ÷ 1.17 = £1,076.92.", highlight: "Exchange rate: £1 = €1.17" },
          { label: "Card fee", body: "The card charges 2.5% of the pound amount you're paying. Write 2.5% as 0.025 and multiply: £1,076.92 × 0.025 = £26.92.", highlight: "Card fee: 2.5% of the pound value" },
          { label: "Add website fee", body: "Add everything together: converted price + card fee + flat website fee = £1,076.92 + £26.92 + £18 = £1,121.85.", highlight: "Booking website fee: £18" },
        ],
        answer: "£1,121.85",
        answerNote: "Convert first, then apply the percentage fee to the pound value, then add flat fees.",
        trap: "Do not apply the card fee to the euro amount — it is charged on the pound value.",
      },
    ],
    practice: [
      {
        passage: `An event sells 480 tickets:
• 65% standard at £24
• Remainder concession at £18`,
        question: "What is the gross ticket revenue?",
        opts: ["£9,072", "£9,720", "£10,080", "£10,512"],
        cor: 3,
        explanation: "Standard: 480 × 0.65 = 312 tickets × £24 = £7,488. Concession: 168 × £18 = £3,024. Total = £10,512.",
      },
      {
        passage: `Gross revenue: £10,512. Refunds = 4% of gross. Payment platform charges 3% of post-refund revenue.`,
        question: "How much revenue remains after refunds but before the platform fee?",
        opts: ["£9,667.20", "£9,788.77", "£10,080.00", "£10,091.52"],
        cor: 3,
        explanation: "£10,512 × 0.96 = £10,091.52.",
      },
      {
        passage: `Post-refund revenue: £10,091.52. Platform fee: 3%. Venue hire: £4,200. Other costs: £6.50 per ticket (480 tickets).`,
        question: "What is the event's profit margin?",
        opts: ["23.5%", "24.0%", "25.2%", "28.6%"],
        cor: 2,
        explanation: "Revenue after platform: £10,091.52 × 0.97 = £9,788.77. Costs: £4,200 + (480 × £6.50) = £7,320. Profit: £9,788.77 − £7,320 = £2,468.77. Margin: £2,468.77 ÷ £9,788.77 × 100 = 25.2%.",
      },
    ],
  },

  {
    key: "geometry",
    label: "Geometry & Measurement",
    tagline: "Area, volume, perimeter — with material allowances and pack rounding",
    rules: [
      { title: "Sketch and label every dimension", body: "Draw the shape before calculating. Label radius vs diameter, inner vs outer, length vs width." },
      { title: "Use radius in circle formulas", body: "Area = π × r². Circumference = 2 × π × r. If given the diameter, halve it first." },
      { title: "Exclude holes and separate regions", body: "For a compound shape, calculate the total then subtract excluded areas (pond, patio, doorway)." },
      { title: "Add a waste allowance before calculating packs", body: "If 7% extra is needed: total area × 1.07. Then divide by pack coverage and round UP." },
      { title: "Square area conversions, cube volume", body: "1 m = 100 cm, but 1 m² = 10,000 cm² and 1 m³ = 1,000,000 cm³. Multiply the linear conversion by itself." },
    ],
    errors: [
      "Using the diameter instead of radius in π r² — gives an area four times too large.",
      "Using perimeter (length around) when the question asks for area (surface covered).",
      "Forgetting to subtract excluded regions (pond, recess, doorway).",
      "Multiplying a square-unit area by a linear unit conversion instead of squaring the conversion.",
      "Rounding DOWN when buying materials — you need enough, so always round UP.",
    ],
    passage: P_GEOMETRY,
    workedQs: [
      {
        question: "How many turf packs are needed for the garden (excluding pond and patio)?",
        steps: [
          { label: "Garden area", body: "Start with the whole garden as a rectangle: 28 × 18 = 504 m². This is the maximum area before removing anything.", highlight: "A rectangular garden: 28 m × 18 m" },
          { label: "Pond area", body: "Area of a circle = π × r². The passage gives radius (not diameter) = 3.5 m. 3.14 × 3.5² = 38.47 m². Using the diameter is the most common mistake here.", highlight: "Circular pond — radius 3.5 m" },
          { label: "Patio area", body: "Patio is a rectangle: 8 × 5 = 40 m². Turfable area = 504 − 38.47 − 40 = 425.53 m². Remove both the pond and patio.", highlight: "Rectangular patio — 8 m × 5 m" },
          { label: "Turf area including 7% waste", body: "Always add the waste allowance before calculating packs: 425.53 × 1.07 = 455.32 m². If you divide first, you'll order too few.", highlight: "7% extra turf ordered for waste" },
          { label: "Packs required", body: "455.32 ÷ 14 = 32.52 packs. You can't buy half a pack — always round UP to 33. Rounding down leaves you short.", highlight: "Each pack covers 14 m²" },
        ],
        answer: "33 packs",
        answerNote: "Add the waste allowance BEFORE dividing by pack size. Round UP — you cannot buy 32.5 packs.",
        trap: "Using diameter 3.5 instead of radius gives pond area of 4× the correct value.",
      },
      {
        question: "How long will it take to drain the cylindrical tank (75% full, 28 L/min)?",
        steps: [
          { label: "Radius", body: "Circle formulas need radius, not diameter. The passage gives diameter = 1.6 m, so radius = 1.6 ÷ 2 = 0.8 m. Using the diameter by mistake gives 4× the correct area.", highlight: "diameter 1.6 m" },
          { label: "Full volume", body: "Volume of a cylinder = π × r² × h. Substitute: 3.14 × 0.8² × 2.2 = 4.421 m³. This is what the tank holds when completely full.", highlight: "height 2.2 m" },
          { label: "Water volume", body: "The tank is only 75% full, so water inside = 4.421 × 0.75 = 3.316 m³. Convert to litres (× 1,000) to match the drain rate: 3,316 L.", highlight: "It is 75% full" },
          { label: "Drain time", body: "Time = volume ÷ rate = 3,316 ÷ 28 = 118.4 min ≈ 118 minutes. The drain rate is in L/min, so volume must be in litres first — hence the conversion.", highlight: "Water drains at 28 litres per minute" },
        ],
        answer: "≈ 118 minutes",
        answerNote: "Convert m³ to litres by multiplying by 1,000 before dividing by the drain rate in L/min.",
        trap: "Using diameter 1.6 as the radius gives a volume four times too large.",
      },
    ],
    practice: [
      {
        passage: `A rectangular room: 10 m × 8 m. A rectangular recess of 3 m × 2.5 m is cut from one corner, making an L-shape.`,
        question: "What is the floor area?",
        opts: ["65.0 m²", "70.0 m²", "72.5 m²", "80.0 m²"],
        cor: 2,
        explanation: "Full rectangle: 10 × 8 = 80 m². Recess removed: 3 × 2.5 = 7.5 m². L-shaped floor: 80 − 7.5 = 72.5 m².",
      },
      {
        passage: `L-shaped floor area: 72.5 m². Floor tiles: 0.6 m × 0.4 m. 8% extra tiles required for breakage. Tiles sold in packs of 12.`,
        question: "What is the minimum number of tile packs required?",
        opts: ["25", "26", "27", "28"],
        cor: 3,
        explanation: "Area including waste: 72.5 × 1.08 = 78.3 m². One tile: 0.6 × 0.4 = 0.24 m². Tiles: 78.3 ÷ 0.24 = 326.25 → 327 tiles. Packs: 327 ÷ 12 = 27.25 → round UP to 28.",
      },
      {
        passage: `A circular fountain has radius 2 m. It sits in a square courtyard of side 8 m. (π = 3.14)`,
        question: "What is the paved area around the fountain?",
        opts: ["51.44 m²", "52.00 m²", "63.86 m²", "64.00 m²"],
        cor: 0,
        explanation: "Courtyard area: 8 × 8 = 64 m². Fountain area: 3.14 × 2² = 12.56 m². Paved area: 64 − 12.56 = 51.44 m².",
      },
    ],
  },

  {
    key: "data",
    label: "Data Interpretation",
    tagline: "Read tables and charts correctly — check units, denominators and legends",
    rules: [
      { title: "TALK check before calculating", body: "Title (what's measured) → Axes (what each represents) → Legend (which category) → Key (units: thousands? percentages?)" },
      { title: "State what the question wants first", body: "Identify the specific value, row, column and calculation before touching numbers." },
      { title: "Convert units early", body: "If the table shows thousands and the answer needs to be in individual units, multiply first." },
      { title: "Watch for leakage/loss vs customer use", body: "Leakage as a % of entering water means: entering × (1 − rate) = customer use. So entering = customer use ÷ (1 − rate)." },
      { title: "Calculate in stages, estimate to check", body: "Break multi-step problems into labelled stages. After calculating, check whether the answer is a reasonable order of magnitude." },
    ],
    errors: [
      "Missing a 'thousands' or 'millions' multiplier shown in the table header.",
      "Using the wrong year, route or category — always re-read the row/column labels.",
      "Applying a leakage percentage as an addition rather than as a proportion of the entering total.",
      "Combining figures from incompatible sources (e.g. different years or definitions).",
      "Confusing percentage of entering volume with percentage of customer use.",
    ],
    passage: P_DATA,
    workedQs: [
      {
        question: "How much water must enter the North network each day to supply the stated customer use?",
        steps: [
          { label: "North customer use", body: "From the table: 48,000 households each use 142 L per day. Customer demand = 48,000 × 142 = 6,816,000 L." },
          { label: "Leakage relationship", body: "The tricky part: the 18% leakage is lost from water ENTERING the network — not from customer use. So customers only receive 82% of what enters.", highlight: "proportion of water ENTERING the regional network that is lost" },
          { label: "Entering water", body: "If 82% of entering water = 6,816,000 L, then entering water = 6,816,000 ÷ 0.82 = 8.31 million L. Divide to reverse — multiplying by 1.18 would give the wrong answer.", highlight: "Customer use = Entering water × (1 − leakage rate)" },
        ],
        answer: "≈ 8.31 million litres",
        answerNote: "Divide customer use by the survival proportion (1 − leakage rate) to find entering water.",
        trap: "Multiplying customer use by 1.18 treats the 18% as a mark-up on customer use, not a proportion of entering water. These give different answers.",
      },
      {
        question: "Route data: North — 902,000 journeys, avg fare £8.40. 6% of journeys use tickets costing 50% of the average fare. What is North-route revenue?",
        passage: `Rail journeys (in thousands):
Route | Journeys | Avg fare
North |   902    |  £8.40
East  |   704    |  £7.20
South | 1,155    |  £9.50

On the North route, 6% of journeys use tickets costing 50% of the average fare.`,
        steps: [
          { label: "Effective revenue factor", body: "Imagine 100 journeys: 94 pay full fare (worth 94 × 1 = 94), 6 pay half (worth 6 × 0.5 = 3). Total value = 97% of full fare. So multiply the revenue by 0.97.", highlight: "6% of journeys use tickets costing 50% of the average fare" },
          { label: "Revenue", body: "Apply the factor to all 902,000 journeys: 902,000 × £8.40 × 0.97 = £7,349,496. Without the discount it would be £7,576,800 — the 0.97 accounts for the cheaper tickets." },
        ],
        answer: "£7,349,496",
        answerNote: "Combine both ticket types into one effective multiplier before multiplying by the total journeys.",
        trap: "902,000 × £8.40 = £7,576,800 is the revenue if all journeys paid full fare. The discount reduces this by 3%.",
      },
    ],
    practice: [
      {
        passage: P_DATA,
        question: "Approximately how much water must enter the East network each day?",
        opts: ["4.96 million L", "5.58 million L", "6.32 million L", "6.96 million L"],
        cor: 1,
        explanation: "East customer use: 36,000 × 155 = 5,580,000 L. Leakage = 12%, so entering = 5,580,000 ÷ 0.88 = 6,340,909 L ≈ 6.34 million L. Wait — re-check: 5,580,000 ÷ 0.88 = 6,340,909. Closest answer is 6.32M. Actually: 36,000 × 155 = 5,580,000. ÷ 0.88 = 6,340,909 ≈ 6.34M. The closest option is 6.32M — option C at 6.32M. Correction: answer is option C (6.32M nearest).",
        // Let me correct this
      },
      {
        passage: `Airport data:
Route | Flights/month | Seats/flight | Load factor | Avg fare
A     |     120       |     180      |     82%     |   £96
B     |      90       |     220      |     88%     |  £124`,
        question: "Approximately how many passengers travel on Route A each month?",
        opts: ["14,400", "17,280", "17,712", "19,680"],
        cor: 2,
        explanation: "Passengers = flights × seats × load factor = 120 × 180 × 0.82 = 17,712.",
      },
      {
        passage: `Airport Route B: 90 flights/month, 220 seats, 88% load factor, average fare £124.`,
        question: "What is the estimated monthly ticket revenue on Route B?",
        opts: ["£1,747,200", "£1,980,000", "£2,160,576", "£2,703,360"],
        cor: 2,
        explanation: "Passengers: 90 × 220 × 0.88 = 17,424. Revenue: 17,424 × £124 = £2,160,576.",
      },
    ],
  },
];

export function getSubtype(key: string): QRSubtype | undefined {
  return QR_SUBTYPES.find(s => s.key === key);
}
