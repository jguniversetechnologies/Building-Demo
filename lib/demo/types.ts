export type Permission =
  | "structure.manage"
  | "residents.manage"
  | "billing.manage"
  | "payments.view"
  | "payments.record"
  | "expenses.manage"
  | "reports.view"
  | "notices.manage"
  | "staff.manage";

export type RoleTemplate =
  | "super_admin"
  | "chairman"
  | "secretary"
  | "treasurer"
  | "building_manager"
  | "resident";

export type SessionRole = RoleTemplate;

export interface Society {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  status: "active" | "paused";
  plan: "basic" | "pro";
  createdAt: string;
}

export interface Building {
  id: string;
  societyId: string;
  name: string;
  isMain: boolean;
}

export interface FlatType {
  id: string;
  societyId: string;
  name: string;
  monthlyRate: number;
}

export interface Flat {
  id: string;
  societyId: string;
  buildingId: string;
  number: string;
  flatTypeId: string;
  customRate?: number | null;
}

export interface StaffUser {
  id: string;
  societyId: string;
  name: string;
  phone: string;
  email: string;
  roleTemplate: Exclude<RoleTemplate, "super_admin" | "resident">;
  permissions: Permission[];
  buildingScopeIds: string[] | null;
}

export interface Resident {
  id: string;
  societyId: string;
  flatId: string;
  name: string;
  phone: string;
  /** Demo invite / temp password — optional after committee invite */
  inviteCode?: string | null;
}

export interface BillingConfig {
  societyId: string;
  latePenaltyAmount: number;
  dueDayOfMonth: number;
}

export type BillStatus = "draft" | "published" | "partial" | "paid" | "overdue";

export interface Bill {
  id: string;
  societyId: string;
  flatId: string;
  month: string;
  maintenanceAmount: number;
  previousDue: number;
  penalty: number;
  totalAmount: number;
  paidAmount: number;
  status: BillStatus;
  publishedAt: string | null;
}

export interface Payment {
  id: string;
  societyId: string;
  flatId: string;
  billId: string;
  amount: number;
  method: "upi" | "cash" | "bank" | "cheque";
  note: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  societyId: string;
  month: string;
  title: string;
  amount: number;
  category: string;
  createdAt: string;
}

export interface Notice {
  id: string;
  societyId: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface DemoSession {
  role: SessionRole;
  societyId: string | null;
  staffId: string | null;
  residentId: string | null;
  label: string;
}

export interface DemoState {
  version: number;
  societies: Society[];
  buildings: Building[];
  flatTypes: FlatType[];
  flats: Flat[];
  staff: StaffUser[];
  residents: Resident[];
  billingConfigs: BillingConfig[];
  bills: Bill[];
  payments: Payment[];
  expenses: Expense[];
  notices: Notice[];
  session: DemoSession | null;
}

export const ALL_PERMISSIONS: Permission[] = [
  "structure.manage",
  "residents.manage",
  "billing.manage",
  "payments.view",
  "payments.record",
  "expenses.manage",
  "reports.view",
  "notices.manage",
  "staff.manage",
];

export const ROLE_PERMISSIONS: Record<
  Exclude<RoleTemplate, "super_admin" | "resident">,
  Permission[]
> = {
  chairman: [...ALL_PERMISSIONS],
  secretary: [
    "structure.manage",
    "residents.manage",
    "payments.view",
    "reports.view",
    "notices.manage",
  ],
  treasurer: [
    "billing.manage",
    "payments.view",
    "payments.record",
    "expenses.manage",
    "reports.view",
  ],
  building_manager: [
    "residents.manage",
    "payments.view",
    "notices.manage",
    "reports.view",
  ],
};

export const DEMO_STORAGE_KEY = "building-demo-v4";
export const DEMO_STATE_VERSION = 4;
