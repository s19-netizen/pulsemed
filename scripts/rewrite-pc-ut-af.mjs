/**
 * Convert PC, UT, and AF datasets from mechanical tables to appropriate formats.
 * PC → prose paragraph  |  UT → prose paragraph  |  AF → clean weekday table + scenario sentence
 * Run: node scripts/rewrite-pc-ut-af.mjs
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

// ─── PC: natural prose ────────────────────────────────────────────────────────
const PC_UPDATES = [
  { id: "QR-PC-001", scenario: "Supermarket weekend promotion — baseline sales, two campaign shifts, target and loyalty subgroup",
    prose: "A supermarket ran a weekend promotion starting from a baseline of 800 sales. In Period 1, sales increased by 8%. In Period 2, they fell by 5%. The comparison target for the full promotion is 944 sales. Loyalty-card members form a subgroup representing 12% of the original baseline." },
  { id: "QR-PC-002", scenario: "GP clinic — baseline appointments, two attendance shifts, target and priority-patient subgroup",
    prose: "A GP clinic recorded 875 patient appointments in the reference month. Attendance rose by 11% in Period 1, then declined by 7% in Period 2. The clinic's comparison target is 1,032 appointments. Priority patients account for a subgroup of 16% of the opening figure." },
  { id: "QR-PC-003", scenario: "Concert venue — opening ticket sales, two demand phases, target and premium-seat subgroup",
    prose: "A concert venue opened with 950 advance ticket sales. Period 1 brought a 14% increase in demand. Period 2 saw a 9% decline. The venue's comparison target for the full run is 1,121 tickets sold. Premium-seat bookings form a subgroup of 20% of the opening baseline." },
  { id: "QR-PC-004", scenario: "Household energy account — original usage, tariff change, efficiency reduction and comparison figure",
    prose: "A household's annual energy usage stood at 1,025 units. A tariff change in Period 1 raised consumption by 17%. Efficiency measures in Period 2 reduced it by 11%. The supplier's comparison figure is 1,209 units. Low-usage customers represent a subgroup of 24% of the original reading." },
  { id: "QR-PC-005", scenario: "Fundraising campaign — opening donations, two campaign effects, target and recurring-donor subgroup",
    prose: "A fundraising campaign opened with 1,100 donations. Period 1 saw a 20% increase following a publicity drive. In Period 2, donations fell by 13%. The campaign's comparison target is 1,298. Recurring donors form a subgroup of 12% of the opening total." },
  { id: "QR-PC-006", scenario: "Gym — starting membership, promotional uplift, dip, capacity target and student share",
    prose: "A gym started the year with 1,175 active members. A promotional offer in Period 1 drove a 23% increase. In Period 2, numbers dipped by 5%. The gym's comparison target is 1,386 members. Student members form a subgroup of 16% of the original count." },
  { id: "QR-PC-007", scenario: "Hotel bookings — original room-nights, two demand changes, occupancy target and business-travel share",
    prose: "A hotel recorded 1,250 room-nights booked in its reference period. Period 1 brought an 8% uplift in bookings. In Period 2, demand fell by 7%. The hotel's comparison target is 1,475 room-nights. Business travellers form a subgroup of 20% of the baseline." },
  { id: "QR-PC-008", scenario: "Factory — baseline output, productivity increase, maintenance dip, target and priority-order share",
    prose: "A factory's baseline output was 1,325 units. Period 1 brought an 11% productivity increase. Output fell by 9% in Period 2 during a scheduled maintenance window. The production comparison target is 1,563 units. Priority orders form a subgroup of 24% of the original output." },
  { id: "QR-PC-009", scenario: "Food delivery app — baseline orders, promotional surge, post-promotion dip, target and subscriber share",
    prose: "A food delivery app recorded 1,400 orders in its reference week. A promotional campaign in Period 1 increased orders by 14%. In Period 2, orders fell by 11% after the promotion ended. The service comparison target is 1,652 orders. Subscription customers form a subgroup of 12% of the baseline." },
  { id: "QR-PC-010", scenario: "University admissions — initial applications, clearing uplift, decline, target and international share",
    prose: "A university received 1,475 applications in its first admissions window. A clearing campaign in Period 1 raised applications by 17%. Period 2 saw a 13% decline. The admissions comparison target is 1,740. International applicants form a subgroup of 16% of the original figure." },
  { id: "QR-PC-011", scenario: "Insurance claims — baseline volume, adverse-weather surge, stabilisation, target and high-value share",
    prose: "An insurer received 1,550 claims in the reference quarter. Adverse weather in Period 1 pushed claims up by 20%. Period 2 brought a 5% reduction. The planning comparison target is 1,829 claims. High-value claims form a subgroup of 20% of the original total." },
  { id: "QR-PC-012", scenario: "Telecom — opening customers, promotional surge, churn dip, growth target and premium-plan share",
    prose: "A telecom provider had 1,625 customers on its standard data plan. A promotional campaign in Period 1 drove a 23% subscriber increase. In Period 2, numbers fell by 7%. The growth target is 1,917 customers. Premium-plan holders form a subgroup of 24% of the opening figure." },
  { id: "QR-PC-013", scenario: "Retail clearance — opening stock, two sell-through phases, clearance target and premium-stock share",
    prose: "A retailer launched a clearance sale with 1,700 units in stock. Period 1 saw an 8% increase in sell-through above baseline. In Period 2, the rate dropped by 9%. The clearance target is 2,006 units sold. Premium-stock items form a subgroup of 12% of the opening inventory." },
  { id: "QR-PC-014", scenario: "Vaccination programme — baseline uptake, outreach uplift, dip, target and priority-group share",
    prose: "A regional vaccination programme recorded 1,775 uptake events in its first phase. A community outreach campaign in Period 1 raised uptake by 11%. In Period 2, uptake fell by 11%. The programme's comparison target is 2,094. Priority-group vaccinations form a subgroup of 16% of the baseline." },
  { id: "QR-PC-015", scenario: "Car hire — base rental rate, peak surcharge, off-peak discount and comparison quote",
    prose: "A car hire company's base rental rate was £1,850. A peak-season surcharge in Period 1 raised it by 14%. An off-peak discount in Period 2 reduced it by 13%. The comparison quote for the period is £2,183. Long-term rentals form a subgroup of 20% of the original booking volume." },
  { id: "QR-PC-016", scenario: "Cinema — baseline revenue, attendance and pricing uplift, dip, target and premium-screen share",
    prose: "A cinema's baseline weekly revenue was £1,925. Increased attendance and a price rise in Period 1 pushed revenue up by 17%. Period 2 brought a 5% decline. The annual comparison target is £2,271. Premium-screen admissions form a subgroup of 24% of the baseline figure." },
  { id: "QR-PC-017", scenario: "Subscription service — opening subscribers, loyalty uplift, churn dip, target and annual-plan share",
    prose: "A subscription service entered its renewal campaign with 2,000 active subscribers. A loyalty incentive in Period 1 increased renewals by 20%. In Period 2, churn reduced numbers by 7%. The campaign comparison target is 2,360. Annual-plan holders form a subgroup of 12% of the original subscriber count." },
  { id: "QR-PC-018", scenario: "Airport — baseline passengers, new-route surge, seasonal dip, planning target and transfer-passenger share",
    prose: "An airport handled 2,075 passengers in its reference period. A new airline launching routes in Period 1 drove a 23% traffic increase. Seasonal trends in Period 2 brought a 9% decline. The traffic planning target is 2,448 passengers. Transfer passengers form a subgroup of 16% of the baseline." },
];

// ─── UT: natural prose ────────────────────────────────────────────────────────
const UT_UPDATES = [
  { id: "QR-UT-001", scenario: "Warehouse — floor area, crate footprint, usable space and delivery route",
    prose: "The warehouse floor measures 9.05 m × 5.62 m with a ceiling height of 2.45 m. Each storage crate has a base footprint of 0.50 m × 0.35 m, and 91% of the floor area is usable. A delivery route covers 91 km at an average speed of 45 km/h, with a 10-minute stop en route. (1 m³ = 1,000 litres)" },
  { id: "QR-UT-002", scenario: "Swimming pool plant room — room dimensions, equipment footprint and service route",
    prose: "The pool plant room measures 9.70 m × 6.04 m with a ceiling height of 2.50 m. Each maintenance unit has a footprint of 0.55 m × 0.40 m, and 90% of the floor is accessible. A service vehicle travels 98 km at 48 km/h, with a 12-minute stop at the supply depot. (1 m³ = 1,000 litres)" },
  { id: "QR-UT-003", scenario: "Rail depot maintenance bay — bay dimensions, equipment footprint and engineering route",
    prose: "A rail depot maintenance bay measures 10.35 m × 6.46 m with a height of 2.55 m. Equipment has a floor footprint of 0.60 m × 0.30 m, with 89% of the bay usable. A maintenance vehicle covers 105 km at 51 km/h, with a 14-minute stop for engineering checks. (1 m³ = 1,000 litres)" },
  { id: "QR-UT-004", scenario: "Garden storage shed — shed dimensions, item footprint, usable area and delivery route",
    prose: "A garden storage shed measures 11.00 m × 6.88 m with an internal height of 2.60 m. Each stored item occupies a footprint of 0.45 m × 0.35 m, with 92% of the floor usable. A delivery vehicle travels 112 km at 54 km/h to reach the site, with a 16-minute unloading stop. (1 m³ = 1,000 litres)" },
  { id: "QR-UT-005", scenario: "Medical supplies room — room dimensions, infusion unit footprint and delivery route",
    prose: "A medical supplies room measures 11.65 m × 7.30 m with a ceiling height of 2.65 m. Each infusion unit occupies a footprint of 0.50 m × 0.40 m, with 91% of the room usable. A supply van covers 119 km at 57 km/h, making an 8-minute stop at a distribution hub. (1 m³ = 1,000 litres)" },
  { id: "QR-UT-006", scenario: "Factory packaging area — area dimensions, unit footprint, usable space and distribution route",
    prose: "A factory packaging area measures 12.30 m × 7.72 m with a ceiling height of 2.70 m. Each packing unit has a footprint of 0.55 m × 0.30 m, with 90% of the floor in active use. A distribution lorry travels 126 km at 60 km/h, stopping for 10 minutes at a checkpoint. (1 m³ = 1,000 litres)" },
  { id: "QR-UT-007", scenario: "Distribution centre loading bay — bay dimensions, pallet footprint and delivery route",
    prose: "A distribution centre loading bay measures 12.95 m × 8.14 m with a height of 2.75 m. Each loaded pallet has a footprint of 0.60 m × 0.35 m, with 89% of the bay usable. A delivery truck covers 133 km at 63 km/h, with a 12-minute stop at a waypoint. (1 m³ = 1,000 litres)" },
  { id: "QR-UT-008", scenario: "Sports hall — hall dimensions, flooring panel size, usable area and supply route",
    prose: "The sports hall measures 13.60 m × 8.56 m with a ceiling height of 2.80 m. Each flooring panel is 0.45 m × 0.40 m, and 92% of the hall area is available for installation. A supply vehicle travels 140 km at 66 km/h to deliver materials, with a 14-minute stop at a depot. (1 m³ = 1,000 litres)" },
  { id: "QR-UT-009", scenario: "Water storage chamber — chamber dimensions, unit footprint and maintenance route",
    prose: "A water storage chamber measures 14.25 m × 8.98 m with an interior height of 2.85 m. Each storage unit has a base footprint of 0.50 m × 0.30 m, with 91% of the floor usable. A maintenance vehicle covers 147 km at 69 km/h, with a 16-minute refuelling stop. (1 m³ = 1,000 litres)" },
  { id: "QR-UT-010", scenario: "Exhibition hall — hall dimensions, stand footprint, usable floor and delivery route",
    prose: "The exhibition hall floor measures 14.9 m × 9.4 m with a ceiling height of 2.9 m. Each exhibition stand has a footprint of 0.55 m × 0.35 m, and 90% of the hall floor is available for stands. A delivery vehicle travels 154 km at 72 km/h to reach the venue, with an 8-minute loading stop. (1 m³ = 1,000 litres)" },
  { id: "QR-UT-011", scenario: "Office — floor dimensions, equipment trolley footprint, accessible area and supply route",
    prose: "The office floor measures 15.55 m × 9.82 m with a ceiling height of 2.95 m. Each paint trolley occupies a footprint of 0.60 m × 0.40 m, with 89% of the floor accessible. A supply van travels 161 km at 75 km/h to deliver materials, with a 10-minute stop en route. (1 m³ = 1,000 litres)" },
  { id: "QR-UT-012", scenario: "Catering storage area — area dimensions, container footprint, usable space and cold-chain delivery",
    prose: "A catering storage area measures 16.20 m × 10.24 m with an internal height of 3.00 m. Each container has a footprint of 0.45 m × 0.30 m, with 92% of the floor usable. A refrigerated delivery truck covers 168 km at 78 km/h, with a 12-minute stop at a cold storage depot. (1 m³ = 1,000 litres)" },
  { id: "QR-UT-013", scenario: "Rooftop installation — surface dimensions, panel footprint, suitable area and site route",
    prose: "A rooftop installation area measures 16.85 m × 10.66 m with a height clearance of 3.05 m. Each solar panel has a footprint of 0.50 m × 0.35 m, and 91% of the roof area is suitable for installation. An installation vehicle travels 175 km at 81 km/h, with a 14-minute equipment check stop. (1 m³ = 1,000 litres)" },
  { id: "QR-UT-014", scenario: "Cycle storage facility — facility dimensions, rack footprint, usable area and maintenance route",
    prose: "A cycle storage facility measures 17.50 m × 11.08 m with a ceiling height of 3.10 m. Each bike rack unit occupies 0.55 m × 0.40 m, with 90% of the floor usable. A maintenance van covers 182 km at 84 km/h, stopping for 16 minutes at a service centre. (1 m³ = 1,000 litres)" },
  { id: "QR-UT-015", scenario: "Runway maintenance depot — depot dimensions, vehicle footprint, accessible area and support route",
    prose: "A runway maintenance depot measures 18.15 m × 11.50 m with a ceiling height of 3.15 m. Each maintenance vehicle has a floor footprint of 0.60 m × 0.30 m, with 89% of the depot accessible. A support vehicle covers 189 km at 87 km/h, with an 8-minute stop at an inspection point. (1 m³ = 1,000 litres)" },
  { id: "QR-UT-016", scenario: "Cold storage room — room dimensions, pallet footprint, usable area and refrigerated delivery route",
    prose: "The cold storage room measures 18.80 m × 11.92 m with an internal height of 3.20 m. Each storage pallet occupies 0.45 m × 0.35 m of floor space, with 92% of the room usable. A refrigerated lorry travels 196 km at 90 km/h, stopping for 10 minutes at a loading bay. (1 m³ = 1,000 litres)" },
  { id: "QR-UT-017", scenario: "Fuel storage facility — facility dimensions, tank footprint, floor use and tanker route",
    prose: "A fuel storage facility measures 19.45 m × 12.34 m with a ceiling height of 3.25 m. Each tank unit occupies a footprint of 0.50 m × 0.40 m, with 91% of the floor in use. A fuel tanker travels 203 km at 93 km/h to the depot, with a 12-minute stop for safety checks. (1 m³ = 1,000 litres)" },
  { id: "QR-UT-018", scenario: "Parcel sorting facility — facility dimensions, packing station footprint, workspace and transfer route",
    prose: "A parcel sorting facility measures 20.10 m × 12.76 m with a ceiling height of 3.30 m. Each packing station occupies 0.55 m × 0.30 m of floor space, with 90% of the floor active workspace. A delivery van covers 210 km at 96 km/h, with a 14-minute stop at a transfer hub. (1 m³ = 1,000 litres)" },
];

// ─── AF: clean weekday table + financial params in scenario ───────────────────
const AF_UPDATES = [
  { id: "QR-AF-001", scenario: "Coffee shop — Items sell at £9.25 each; variable cost £4.53/unit; 102 units sold this week; fixed costs £158.",
    days: [28,34,30,38,34] },
  { id: "QR-AF-002", scenario: "Cinema — Tickets priced at £10.00; variable cost £5.00 per admission; 114 admissions this week; fixed costs £176.",
    days: [30,37,32,41,38] },
  { id: "QR-AF-003", scenario: "Pharmacy — Items sell at £10.75 each; variable cost £5.48/unit; 126 units sold this week; fixed costs £194.",
    days: [32,40,34,44,42] },
  { id: "QR-AF-004", scenario: "Hotel — Average rate £11.50 per room; variable cost £5.52/room; 138 rooms booked this week; fixed overheads £212.",
    days: [34,43,36,47,46] },
  { id: "QR-AF-005", scenario: "Subscription business — Plans priced at £12.25 each; variable cost £6.00/customer; 150 new subscriptions this week; fixed costs £230.",
    days: [36,46,38,50,50] },
  { id: "QR-AF-006", scenario: "Charity event — Tickets priced at £13.00 each; variable cost £6.50/ticket; 162 tickets sold; fixed event costs £248.",
    days: [38,49,40,53,54] },
  { id: "QR-AF-007", scenario: "Courier company — Each parcel charges £13.75; variable handling cost £7.01; 174 parcels dispatched this week; fixed costs £266.",
    days: [40,52,42,56,58] },
  { id: "QR-AF-008", scenario: "Sports club — Sessions priced at £14.50; variable cost £6.96/member; 186 sessions this week; fixed costs £284.",
    days: [42,55,44,59,62] },
  { id: "QR-AF-009", scenario: "Market stall — Items sell at £15.25 each; variable cost £7.47/unit; 198 units sold this week; fixed stall costs £302.",
    days: [44,58,46,62,66] },
  { id: "QR-AF-010", scenario: "University society — Entry £16.00 per person; variable cost £8.00 per head; 210 attendees this week; fixed overheads £320.",
    days: [46,61,48,65,70] },
  { id: "QR-AF-011", scenario: "Freelance work — Rate £16.75 per unit billed; variable cost £8.54/unit; 222 units billed this week; fixed overheads £338.",
    days: [48,64,50,68,74] },
  { id: "QR-AF-012", scenario: "Car hire — Daily rate £17.50 per vehicle; variable cost £8.40/rental; 234 rentals this week; fixed costs £356.",
    days: [50,67,52,71,78] },
  { id: "QR-AF-013", scenario: "Restaurant — Each cover priced at £18.25; variable cost £8.94/cover; 246 covers served this week; fixed costs £374.",
    days: [52,70,54,74,82] },
  { id: "QR-AF-014", scenario: "Mobile phone retailer — Plans at £19.00/month; variable cost £9.50/customer; 258 sign-ups this week; fixed costs £392.",
    days: [54,73,56,77,86] },
  { id: "QR-AF-015", scenario: "Travel agency — Bookings valued at £19.75 each; variable cost £10.07/booking; 270 bookings this week; fixed operating costs £410.",
    days: [56,76,58,80,90] },
  { id: "QR-AF-016", scenario: "Event ticketing — Tickets at £20.50 each; variable cost £9.84/ticket; 282 tickets sold this week; fixed platform costs £428.",
    days: [58,79,60,83,94] },
  { id: "QR-AF-017", scenario: "Online marketplace — Transactions valued at £21.25 each; variable cost £10.41/transaction; 294 transactions this week; fixed costs £446.",
    days: [60,82,62,86,98] },
  { id: "QR-AF-018", scenario: "Small business payroll — Rate £22.00 per staff-day; variable cost £11.00/day; 306 staff-days this week; fixed overhead £464.",
    days: [62,85,64,89,102] },
];

function afTable(days) {
  return JSON.stringify({
    type: "table",
    headers: ["Day", "Count"],
    rows: [
      ["Monday",    String(days[0])],
      ["Tuesday",   String(days[1])],
      ["Wednesday", String(days[2])],
      ["Thursday",  String(days[3])],
      ["Friday",    String(days[4])],
    ],
  });
}

async function main() {
  // PC
  console.log("=== PC: converting to prose ===");
  for (const u of PC_UPDATES) {
    process.stdout.write(u.id + "... ");
    await patch("qr_datasets", u.id, {
      scenario: u.scenario,
      figure_brief: JSON.stringify({ type: "prose", text: u.prose }),
    });
    console.log("✓");
  }

  // UT
  console.log("\n=== UT: converting to prose ===");
  for (const u of UT_UPDATES) {
    process.stdout.write(u.id + "... ");
    await patch("qr_datasets", u.id, {
      scenario: u.scenario,
      figure_brief: JSON.stringify({ type: "prose", text: u.prose }),
    });
    console.log("✓");
  }

  // AF
  console.log("\n=== AF: clean weekday table + scenario sentence ===");
  for (const u of AF_UPDATES) {
    process.stdout.write(u.id + "... ");
    await patch("qr_datasets", u.id, {
      scenario: u.scenario,
      figure_brief: afTable(u.days),
    });
    console.log("✓");
  }

  console.log("\n✓ Done: 54 datasets updated (PC + UT + AF).");
}

main().catch(e => { console.error("✗", e.message); process.exit(1); });
