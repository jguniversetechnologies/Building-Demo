#!/usr/bin/env node
/**
 * Demo data seeder (Option A — JSON seed).
 * Source of truth: data/seed.json
 * Browser loads it into localStorage on first visit / Reset demo.
 *
 * Usage: pnpm seed
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedPath = path.join(root, "data", "seed.json");

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

if (!fs.existsSync(seedPath)) fail(`Missing ${seedPath}`);

let seed;
try {
  seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
} catch (e) {
  fail(`Invalid JSON in data/seed.json: ${e.message}`);
}

const required = [
  "version",
  "societies",
  "buildings",
  "flatTypes",
  "flats",
  "staff",
  "residents",
  "billingConfigs",
  "bills",
  "payments",
  "expenses",
  "notices",
];
for (const key of required) {
  if (!(key in seed)) fail(`seed.json missing key: ${key}`);
}

const flatById = new Map(seed.flats.map((f) => [f.id, f]));
const buildingById = new Map(seed.buildings.map((b) => [b.id, b]));
const societyById = new Map(seed.societies.map((s) => [s.id, s]));

for (const r of seed.residents) {
  if (!flatById.has(r.flatId)) fail(`Resident ${r.id} → missing flat ${r.flatId}`);
  if (!societyById.has(r.societyId)) fail(`Resident ${r.id} → missing society`);
}
for (const b of seed.bills) {
  if (!flatById.has(b.flatId)) fail(`Bill ${b.id} → missing flat ${b.flatId}`);
}
for (const p of seed.payments) {
  if (!seed.bills.some((b) => b.id === p.billId)) {
    fail(`Payment ${p.id} → missing bill ${p.billId}`);
  }
}

console.log("\n✓ data/seed.json OK (demo seeder)\n");
console.log(`  version: ${seed.version}`);
console.log(`  societies: ${seed.societies.length}`);
console.log(`  buildings: ${seed.buildings.length}`);
console.log(`  flats: ${seed.flats.length}`);
console.log(`  residents: ${seed.residents.length}`);
console.log(`  staff: ${seed.staff.length}`);
console.log(`  bills: ${seed.bills.length}`);
console.log(`  payments: ${seed.payments.length}`);
console.log(`  expenses: ${seed.expenses.length}`);
console.log(`  notices: ${seed.notices.length}`);

for (const soc of seed.societies) {
  const flats = seed.flats.filter((f) => f.societyId === soc.id);
  const occupied = new Set(
    seed.residents.filter((r) => r.societyId === soc.id).map((r) => r.flatId),
  );
  console.log(
    `\n  ${soc.name} (/${soc.slug}): ${flats.length} flats · ${occupied.size} occupied · ${flats.length - occupied.size} empty`,
  );
}

console.log("\n── Pitch resident phones (for future phone login) ──");
for (const r of seed.residents.filter((x) => x.societyId === "soc_green")) {
  const flat = flatById.get(r.flatId);
  const wing = buildingById.get(flat?.buildingId)?.name ?? "";
  console.log(`  ${r.phone}  ${r.name.padEnd(16)}  ${flat?.number} (${wing})`);
}

console.log("\n── Hero overdue resident ──");
console.log("  Neha Kapoor  9000002101  B-101");
console.log("  Open dues: Aug ₹4,000 + Sep ₹4,000 + Oct ₹4,300 = ₹12,300");

console.log("\n── Apply seed in browser ──");
console.log("  1. pnpm dev");
console.log("  2. Open app → click “Reset demo” (or hard refresh after version bump)");
console.log("  localStorage key follows DEMO_STORAGE_KEY in lib/demo/types.ts\n");
