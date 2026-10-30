import { createSeedState } from "./seed";
import type {
  Bill,
  BillingConfig,
  Building,
  DemoSession,
  DemoState,
  Expense,
  Flat,
  FlatType,
  Payment,
  Permission,
  Resident,
  Society,
  StaffUser,
} from "./types";
import { DEMO_STORAGE_KEY, ROLE_PERMISSIONS } from "./types";

type Listener = () => void;
const listeners = new Set<Listener>();

/** Stable SSR snapshot — must be referentially equal across renders. */
const serverSnapshot: DemoState = createSeedState();

let clientSnapshot: DemoState | null = null;

export function subscribeDemoStore(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((l) => l());
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function parseState(raw: string | null): DemoState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DemoState;
    if (!parsed?.societies || !Array.isArray(parsed.societies)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function readState(): DemoState {
  if (!canUseStorage()) return serverSnapshot;
  if (clientSnapshot) return clientSnapshot;
  const existing = parseState(window.localStorage.getItem(DEMO_STORAGE_KEY));
  if (existing) {
    clientSnapshot = existing;
    return clientSnapshot;
  }
  const seed = createSeedState();
  window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(seed));
  clientSnapshot = seed;
  return clientSnapshot;
}

function writeState(state: DemoState) {
  // New reference required so useSyncExternalStore subscribers re-render.
  clientSnapshot = structuredClone(state);
  if (canUseStorage()) {
    window.localStorage.setItem(
      DEMO_STORAGE_KEY,
      JSON.stringify(clientSnapshot),
    );
  }
  notify();
}

export function getDemoState(): DemoState {
  return readState();
}

export function getServerDemoState(): DemoState {
  return serverSnapshot;
}

export function ensureDemoSeeded() {
  readState();
}

export function resetDemoData() {
  clientSnapshot = null;
  writeState(createSeedState());
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function recomputeBillStatus(bill: Bill): BillStatusComputed {
  const due = bill.totalAmount - bill.paidAmount;
  if (bill.status === "draft" && bill.paidAmount <= 0) return "draft";
  if (due <= 0) return "paid";
  if (bill.paidAmount > 0) return "partial";
  return bill.previousDue > 0 || bill.penalty > 0 ? "overdue" : "published";
}

type BillStatusComputed = Bill["status"];

export function setSession(session: DemoSession | null) {
  const state = readState();
  state.session = session;
  writeState(state);
}

export function clearSession() {
  setSession(null);
}

export function createSociety(input: {
  name: string;
  slug: string;
  address: string;
  city: string;
  plan: Society["plan"];
  chairmanName: string;
  chairmanPhone: string;
  chairmanEmail: string;
}) {
  const state = readState();
  const societyId = uid("soc");
  const buildingId = uid("bld");
  const staffId = uid("stf");
  const society: Society = {
    id: societyId,
    name: input.name,
    slug: input.slug,
    address: input.address,
    city: input.city,
    status: "active",
    plan: input.plan,
    createdAt: nowIso(),
  };
  const building: Building = {
    id: buildingId,
    societyId,
    name: "Main",
    isMain: true,
  };
  const chairman: StaffUser = {
    id: staffId,
    societyId,
    name: input.chairmanName,
    phone: input.chairmanPhone,
    email: input.chairmanEmail,
    roleTemplate: "chairman",
    permissions: [...ROLE_PERMISSIONS.chairman],
    buildingScopeIds: null,
  };
  const config: BillingConfig = {
    societyId,
    latePenaltyAmount: 200,
    dueDayOfMonth: 10,
  };
  const defaultTypes: FlatType[] = [
    { id: uid("ft"), societyId, name: "2BHK", monthlyRate: 3500 },
    { id: uid("ft"), societyId, name: "3BHK", monthlyRate: 4500 },
  ];
  state.societies.push(society);
  state.buildings.push(building);
  state.staff.push(chairman);
  state.billingConfigs.push(config);
  state.flatTypes.push(...defaultTypes);
  writeState(state);
  return society;
}

export function addBuilding(societyId: string, name: string) {
  const state = readState();
  const building: Building = {
    id: uid("bld"),
    societyId,
    name,
    isMain: false,
  };
  state.buildings.push(building);
  writeState(state);
  return building;
}

export function addFlatType(
  societyId: string,
  name: string,
  monthlyRate: number,
) {
  const state = readState();
  const ft: FlatType = { id: uid("ft"), societyId, name, monthlyRate };
  state.flatTypes.push(ft);
  writeState(state);
  return ft;
}

export function updateFlatTypeRate(flatTypeId: string, monthlyRate: number) {
  const state = readState();
  const ft = state.flatTypes.find((f) => f.id === flatTypeId);
  if (!ft) return;
  ft.monthlyRate = monthlyRate;
  writeState(state);
}

export function addFlat(input: {
  societyId: string;
  buildingId: string;
  number: string;
  flatTypeId: string;
}) {
  const state = readState();
  const flat: Flat = { id: uid("flt"), ...input };
  state.flats.push(flat);
  writeState(state);
  return flat;
}

export function addResident(input: {
  societyId: string;
  flatId: string;
  name: string;
  phone: string;
}) {
  const state = readState();
  const resident: Resident = { id: uid("res"), ...input };
  state.residents.push(resident);
  writeState(state);
  return resident;
}

export function addStaff(input: {
  societyId: string;
  name: string;
  phone: string;
  email: string;
  roleTemplate: StaffUser["roleTemplate"];
  permissions?: Permission[];
  buildingScopeIds?: string[] | null;
}) {
  const state = readState();
  const staff: StaffUser = {
    id: uid("stf"),
    societyId: input.societyId,
    name: input.name,
    phone: input.phone,
    email: input.email,
    roleTemplate: input.roleTemplate,
    permissions: input.permissions ?? [...ROLE_PERMISSIONS[input.roleTemplate]],
    buildingScopeIds: input.buildingScopeIds ?? null,
  };
  state.staff.push(staff);
  writeState(state);
  return staff;
}

export function updateStaffPermissions(
  staffId: string,
  permissions: Permission[],
  buildingScopeIds: string[] | null,
) {
  const state = readState();
  const staff = state.staff.find((s) => s.id === staffId);
  if (!staff) return;
  staff.permissions = permissions;
  staff.buildingScopeIds = buildingScopeIds;
  writeState(state);
}

export function updateBillingConfig(
  societyId: string,
  patch: Partial<BillingConfig>,
) {
  const state = readState();
  const cfg = state.billingConfigs.find((c) => c.societyId === societyId);
  if (!cfg) return;
  Object.assign(cfg, patch);
  writeState(state);
}

export function generateBillsForMonth(societyId: string, month: string) {
  const state = readState();
  const flats = state.flats.filter((f) => f.societyId === societyId);
  const types = new Map(
    state.flatTypes.filter((t) => t.societyId === societyId).map((t) => [t.id, t]),
  );
  const cfg = state.billingConfigs.find((c) => c.societyId === societyId);
  const penalty = cfg?.latePenaltyAmount ?? 0;

  for (const flat of flats) {
    const exists = state.bills.some(
      (b) => b.flatId === flat.id && b.month === month,
    );
    if (exists) continue;
    const rate = types.get(flat.flatTypeId)?.monthlyRate ?? 0;
    const prior = state.bills
      .filter((b) => b.flatId === flat.id && b.month < month)
      .reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);
    const late = prior > 0 ? penalty : 0;
    const total = rate + prior + late;
    state.bills.push({
      id: uid("bill"),
      societyId,
      flatId: flat.id,
      month,
      maintenanceAmount: rate,
      previousDue: prior,
      penalty: late,
      totalAmount: total,
      paidAmount: 0,
      status: "draft",
      publishedAt: null,
    });
  }
  writeState(state);
}

export function publishBills(societyId: string, month: string) {
  const state = readState();
  for (const bill of state.bills) {
    if (bill.societyId !== societyId || bill.month !== month) continue;
    if (bill.status === "draft") {
      bill.status = bill.previousDue > 0 ? "overdue" : "published";
      bill.publishedAt = nowIso();
    }
  }
  writeState(state);
}

export function recordPayment(input: {
  societyId: string;
  flatId: string;
  billId: string;
  amount: number;
  method?: Payment["method"];
  note?: string;
}) {
  const state = readState();
  const bill = state.bills.find((b) => b.id === input.billId);
  if (!bill || input.amount <= 0) return null;
  const due = Math.max(0, bill.totalAmount - bill.paidAmount);
  const amount = Math.min(input.amount, due || input.amount);
  const payment: Payment = {
    id: uid("pay"),
    societyId: input.societyId,
    flatId: input.flatId,
    billId: input.billId,
    amount,
    method: input.method ?? "upi",
    note: input.note ?? "",
    createdAt: nowIso(),
  };
  bill.paidAmount += amount;
  bill.status = recomputeBillStatus(bill);
  if (bill.status === "draft") bill.status = "published";
  state.payments.unshift(payment);
  writeState(state);
  return payment;
}

export function addExpense(input: {
  societyId: string;
  month: string;
  title: string;
  amount: number;
  category: string;
}) {
  const state = readState();
  const expense: Expense = {
    id: uid("exp"),
    ...input,
    createdAt: nowIso(),
  };
  state.expenses.unshift(expense);
  writeState(state);
  return expense;
}

export function addNotice(input: {
  societyId: string;
  title: string;
  body: string;
}) {
  const state = readState();
  state.notices.unshift({
    id: uid("ntc"),
    societyId: input.societyId,
    title: input.title,
    body: input.body,
    createdAt: nowIso(),
  });
  writeState(state);
}

export function inviteResident(input: {
  societyId: string;
  flatId: string;
  name: string;
  phone: string;
}) {
  const inviteCode = `CHS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const resident = addResident(input);
  return { resident, inviteCode };
}

export function societyBySlug(slug: string) {
  return readState().societies.find((s) => s.slug === slug) ?? null;
}

export function outstandingForFlat(flatId: string) {
  const state = readState();
  return state.bills
    .filter((b) => b.flatId === flatId && b.status !== "draft")
    .reduce((sum, b) => sum + Math.max(0, b.totalAmount - b.paidAmount), 0);
}
