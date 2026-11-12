import { createSeedState } from "./seed";
import type {
  Bill,
  BillingConfig,
  Building,
  Complaint,
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
import { DEMO_STATE_VERSION, DEMO_STORAGE_KEY, ROLE_PERMISSIONS } from "./types";

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
    // Drop stale localStorage when seed schema version changes.
    if (parsed.version !== DEMO_STATE_VERSION) return null;
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
  const slug = input.slug.trim().toLowerCase();
  if (!slug) throw new Error("Slug required");
  if (state.societies.some((s) => s.slug === slug)) {
    throw new Error(`Slug “${slug}” already exists`);
  }
  const societyId = uid("soc");
  const buildingId = uid("bld");
  const staffId = uid("stf");
  const society: Society = {
    id: societyId,
    name: input.name,
    slug,
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
  customRate?: number | null;
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
  inviteCode?: string | null;
}) {
  const state = readState();
  const phone = normalizePhone(input.phone);
  if (state.residents.some((r) => normalizePhone(r.phone) === phone)) {
    throw new Error("This phone is already registered");
  }
  const resident: Resident = {
    id: uid("res"),
    societyId: input.societyId,
    flatId: input.flatId,
    name: input.name,
    phone,
    inviteCode: input.inviteCode ?? null,
  };
  state.residents.push(resident);
  writeState(state);
  return resident;
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

/** Resident app login: phone (+ optional invite code for newly invited). */
export function loginResidentByPhone(phone: string, inviteCode?: string) {
  const state = readState();
  const digits = normalizePhone(phone);
  if (digits.length !== 10) {
    return { ok: false as const, error: "Enter a valid 10-digit mobile number" };
  }
  const resident = state.residents.find(
    (r) => normalizePhone(r.phone) === digits,
  );
  if (!resident) {
    return {
      ok: false as const,
      error: "No resident found for this phone. Invite them first from Residents.",
    };
  }
  if (resident.inviteCode) {
    const code = (inviteCode ?? "").trim().toUpperCase();
    if (!code) {
      return {
        ok: false as const,
        error: "Enter the invite code given by the committee",
      };
    }
    if (code !== resident.inviteCode.toUpperCase()) {
      return { ok: false as const, error: "Invite code does not match" };
    }
  }
  const flat = state.flats.find((f) => f.id === resident.flatId);
  const society = state.societies.find((s) => s.id === resident.societyId);
  const session: DemoSession = {
    role: "resident",
    societyId: resident.societyId,
    staffId: null,
    residentId: resident.id,
    label: `Resident · ${resident.name} · ${flat?.number ?? ""}`,
  };
  state.session = session;
  // First successful login clears invite requirement for smoother re-entry
  if (resident.inviteCode) resident.inviteCode = null;
  writeState(state);
  return { ok: true as const, resident, society, session };
}

export function startResidentSession(residentId: string) {
  const state = readState();
  const resident = state.residents.find((r) => r.id === residentId);
  if (!resident) return null;
  const flat = state.flats.find((f) => f.id === resident.flatId);
  const session: DemoSession = {
    role: "resident",
    societyId: resident.societyId,
    staffId: null,
    residentId: resident.id,
    label: `Resident · ${resident.name} · ${flat?.number ?? ""}`,
  };
  state.session = session;
  writeState(state);
  return session;
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

/** Unpaid amount of a bill's own month charges only (not nested arrears). */
function unpaidOwnCharges(bill: Bill) {
  const own = bill.maintenanceAmount + bill.penalty;
  return Math.max(0, own - Math.min(bill.paidAmount, own));
}

export function generateBillsForMonth(societyId: string, month: string) {
  const state = readState();
  const flats = state.flats.filter((f) => f.societyId === societyId);
  const types = new Map(
    state.flatTypes.filter((t) => t.societyId === societyId).map((t) => [t.id, t]),
  );
  const cfg = state.billingConfigs.find((c) => c.societyId === societyId);
  const penalty = cfg?.latePenaltyAmount ?? 0;
  let created = 0;

  for (const flat of flats) {
    const exists = state.bills.some(
      (b) => b.flatId === flat.id && b.month === month,
    );
    if (exists) continue;
    // Use custom rate if set, otherwise fall back to flat type rate
    const rate = flat.customRate ?? types.get(flat.flatTypeId)?.monthlyRate ?? 0;
    // Sum only each prior month's own charges still unpaid — avoids double-counting.
    const prior = state.bills
      .filter(
        (b) =>
          b.flatId === flat.id &&
          b.month < month &&
          b.status !== "draft",
      )
      .reduce((sum, b) => sum + unpaidOwnCharges(b), 0);
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
    created += 1;
  }
  writeState(state);
  return { created, month };
}

export function publishBills(societyId: string, month: string) {
  const state = readState();
  let published = 0;
  for (const bill of state.bills) {
    if (bill.societyId !== societyId || bill.month !== month) continue;
    if (bill.status === "draft") {
      // "overdue" = this bill includes unpaid arrears from earlier months
      bill.status = bill.previousDue > 0 ? "overdue" : "published";
      bill.publishedAt = nowIso();
      published += 1;
    }
  }
  writeState(state);
  return { published, month };
}

/** Demo one-click: create drafts (if needed) then publish for the month. */
export function createAndPublishMonth(societyId: string, month: string) {
  const gen = generateBillsForMonth(societyId, month);
  const pub = publishBills(societyId, month);
  return { ...gen, ...pub };
}

export function deleteMonthBills(societyId: string, month: string) {
  const state = readState();
  const monthBills = state.bills.filter(
    (b) => b.societyId === societyId && b.month === month,
  );
  for (const bill of monthBills) {
    if (bill.paidAmount > 0 || state.payments.some((p) => p.billId === bill.id)) {
      return {
        ok: false as const,
        error: "Some bills have payments — undo payments first",
      };
    }
  }
  const ids = new Set(monthBills.map((b) => b.id));
  state.bills = state.bills.filter((b) => !ids.has(b.id));
  writeState(state);
  return { ok: true as const, removed: monthBills.length };
}

/** Regenerate bills for a month with current flat rates (custom or type) */
export function regenerateBillsForMonth(societyId: string, month: string) {
  const state = readState();
  const flats = state.flats.filter((f) => f.societyId === societyId);
  const types = new Map(
    state.flatTypes.filter((t) => t.societyId === societyId).map((t) => [t.id, t]),
  );
  const cfg = state.billingConfigs.find((c) => c.societyId === societyId);
  const penalty = cfg?.latePenaltyAmount ?? 0;

  let updated = 0;
  let changed = 0;

  for (const flat of flats) {
    const bill = state.bills.find(
      (b) => b.flatId === flat.id && b.month === month,
    );
    if (!bill) continue;

    // Get current effective rate (custom or type)
    const newRate = flat.customRate ?? types.get(flat.flatTypeId)?.monthlyRate ?? 0;
    const oldRate = bill.maintenanceAmount;

    // If rate hasn't changed, skip
    if (newRate === oldRate) {
      updated++;
      continue;
    }

    // Recalculate: preserve previousDue, recalculate penalty, update total
    const prior = bill.previousDue;
    const late = prior > 0 ? penalty : 0;
    const newTotal = newRate + prior + late;

    bill.maintenanceAmount = newRate;
    bill.totalAmount = newTotal;
    // Re-evaluate status
    if (bill.status === "paid" && bill.paidAmount < newTotal) {
      bill.status = bill.paidAmount > 0 ? "partial" : "published";
    }

    changed++;
    updated++;
  }

  writeState(state);
  return { updated, changed, month };
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

export function addComplaint(input: {
  residentId: string;
  flatId: string;
  societyId: string;
  type: "complaint" | "maintenance";
  category: string;
  description: string;
}) {
  const state = readState();
  const complaint: Complaint = {
    id: uid("cmp"),
    ...input,
    status: "pending",
    createdAt: nowIso(),
  };
  state.complaints.unshift(complaint);
  writeState(state);
  return complaint;
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
  const resident = addResident({
    ...input,
    phone: normalizePhone(input.phone),
    inviteCode,
  });
  return { resident, inviteCode };
}

export function updateSociety(
  societyId: string,
  patch: Partial<Pick<Society, "name" | "address" | "city" | "status" | "plan">>,
) {
  const state = readState();
  const society = state.societies.find((s) => s.id === societyId);
  if (!society) return null;
  Object.assign(society, patch);
  writeState(state);
  return society;
}

export function deleteSociety(societyId: string) {
  const state = readState();
  state.societies = state.societies.filter((s) => s.id !== societyId);
  state.buildings = state.buildings.filter((b) => b.societyId !== societyId);
  state.flatTypes = state.flatTypes.filter((t) => t.societyId !== societyId);
  state.flats = state.flats.filter((f) => f.societyId !== societyId);
  state.staff = state.staff.filter((s) => s.societyId !== societyId);
  state.residents = state.residents.filter((r) => r.societyId !== societyId);
  state.billingConfigs = state.billingConfigs.filter(
    (c) => c.societyId !== societyId,
  );
  state.bills = state.bills.filter((b) => b.societyId !== societyId);
  state.payments = state.payments.filter((p) => p.societyId !== societyId);
  state.expenses = state.expenses.filter((e) => e.societyId !== societyId);
  state.notices = state.notices.filter((n) => n.societyId !== societyId);
  if (state.session?.societyId === societyId) state.session = null;
  writeState(state);
}

export function renameBuilding(buildingId: string, name: string) {
  const state = readState();
  const building = state.buildings.find((b) => b.id === buildingId);
  if (!building || !name.trim()) return null;
  building.name = name.trim();
  writeState(state);
  return building;
}

export function deleteBuilding(buildingId: string) {
  const state = readState();
  const building = state.buildings.find((b) => b.id === buildingId);
  if (!building) return { ok: false as const, error: "Not found" };
  if (building.isMain) {
    return { ok: false as const, error: "Main building can’t be deleted" };
  }
  if (state.flats.some((f) => f.buildingId === buildingId)) {
    return {
      ok: false as const,
      error: "Move or delete flats in this wing first",
    };
  }
  state.buildings = state.buildings.filter((b) => b.id !== buildingId);
  for (const s of state.staff) {
    if (s.buildingScopeIds?.includes(buildingId)) {
      s.buildingScopeIds = s.buildingScopeIds.filter((id) => id !== buildingId);
      if (s.buildingScopeIds.length === 0) s.buildingScopeIds = null;
    }
  }
  writeState(state);
  return { ok: true as const };
}

export function updateFlatType(
  flatTypeId: string,
  patch: Partial<Pick<FlatType, "name" | "monthlyRate">>,
) {
  const state = readState();
  const ft = state.flatTypes.find((f) => f.id === flatTypeId);
  if (!ft) return null;
  Object.assign(ft, patch);
  writeState(state);
  return ft;
}

export function deleteFlatType(flatTypeId: string) {
  const state = readState();
  if (state.flats.some((f) => f.flatTypeId === flatTypeId)) {
    return { ok: false as const, error: "Flats still use this type" };
  }
  state.flatTypes = state.flatTypes.filter((t) => t.id !== flatTypeId);
  writeState(state);
  return { ok: true as const };
}

export function updateFlat(
  flatId: string,
  patch: Partial<Pick<Flat, "number" | "buildingId" | "flatTypeId" | "customRate">>,
) {
  const state = readState();
  const flat = state.flats.find((f) => f.id === flatId);
  if (!flat) return null;
  Object.assign(flat, patch);
  writeState(state);
  return flat;
}

export function deleteFlat(flatId: string) {
  const state = readState();
  if (state.residents.some((r) => r.flatId === flatId)) {
    return { ok: false as const, error: "Remove residents from this flat first" };
  }
  state.flats = state.flats.filter((f) => f.id !== flatId);
  state.bills = state.bills.filter((b) => b.flatId !== flatId);
  state.payments = state.payments.filter((p) => p.flatId !== flatId);
  writeState(state);
  return { ok: true as const };
}

export function updateResident(
  residentId: string,
  patch: Partial<Pick<Resident, "name" | "phone" | "flatId">>,
) {
  const state = readState();
  const resident = state.residents.find((r) => r.id === residentId);
  if (!resident) return null;
  const next = { ...patch };
  if (next.phone) {
    next.phone = normalizePhone(next.phone);
    const clash = state.residents.find(
      (r) =>
        r.id !== residentId && normalizePhone(r.phone) === next.phone,
    );
    if (clash) throw new Error("This phone is already registered");
  }
  Object.assign(resident, next);
  writeState(state);
  return resident;
}

export function deleteResident(residentId: string) {
  const state = readState();
  state.residents = state.residents.filter((r) => r.id !== residentId);
  if (state.session?.residentId === residentId) state.session = null;
  writeState(state);
}

export function updateStaff(
  staffId: string,
  patch: Partial<
    Pick<StaffUser, "name" | "phone" | "email" | "roleTemplate" | "buildingScopeIds">
  >,
) {
  const state = readState();
  const staff = state.staff.find((s) => s.id === staffId);
  if (!staff) return null;
  Object.assign(staff, patch);
  if (patch.roleTemplate && !patch.buildingScopeIds) {
    // keep existing scope unless role change clears manager scope
    if (patch.roleTemplate !== "building_manager") staff.buildingScopeIds = null;
  }
  writeState(state);
  return staff;
}

/** Get the effective monthly rate for a flat (custom rate or flat type rate) */
export function getFlatRate(flat: Flat, flatTypes: FlatType[]): number {
  if (flat.customRate !== null && flat.customRate !== undefined) {
    return flat.customRate;
  }
  const type = flatTypes.find((t) => t.id === flat.flatTypeId);
  return type?.monthlyRate ?? 0;
}

export function deleteStaff(staffId: string) {
  const state = readState();
  state.staff = state.staff.filter((s) => s.id !== staffId);
  if (state.session?.staffId === staffId) state.session = null;
  writeState(state);
}

export function updateExpense(
  expenseId: string,
  patch: Partial<Pick<Expense, "title" | "amount" | "category" | "month">>,
) {
  const state = readState();
  const expense = state.expenses.find((e) => e.id === expenseId);
  if (!expense) return null;
  Object.assign(expense, patch);
  writeState(state);
  return expense;
}

export function deleteExpense(expenseId: string) {
  const state = readState();
  state.expenses = state.expenses.filter((e) => e.id !== expenseId);
  writeState(state);
}

export function updateNotice(
  noticeId: string,
  patch: Partial<Pick<{ title: string; body: string }, "title" | "body">>,
) {
  const state = readState();
  const notice = state.notices.find((n) => n.id === noticeId);
  if (!notice) return null;
  Object.assign(notice, patch);
  writeState(state);
  return notice;
}

export function deleteNotice(noticeId: string) {
  const state = readState();
  state.notices = state.notices.filter((n) => n.id !== noticeId);
  writeState(state);
}

export function deletePayment(paymentId: string) {
  const state = readState();
  const payment = state.payments.find((p) => p.id === paymentId);
  if (!payment) return;
  const bill = state.bills.find((b) => b.id === payment.billId);
  if (bill) {
    bill.paidAmount = Math.max(0, bill.paidAmount - payment.amount);
    bill.status = recomputeBillStatus(bill);
  }
  state.payments = state.payments.filter((p) => p.id !== paymentId);
  writeState(state);
}

export function deleteBill(billId: string) {
  const state = readState();
  const bill = state.bills.find((b) => b.id === billId);
  if (!bill) return { ok: false as const, error: "Not found" };
  if (bill.paidAmount > 0 || state.payments.some((p) => p.billId === billId)) {
    return {
      ok: false as const,
      error: "Bill has payments — remove payments first",
    };
  }
  state.bills = state.bills.filter((b) => b.id !== billId);
  writeState(state);
  return { ok: true as const };
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
