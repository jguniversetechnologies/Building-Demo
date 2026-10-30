"use client";

import { use } from "react";
import { SideNav, TopBar } from "@/components/demo/Shell";
import { useDemoState, useHasPermission } from "@/lib/demo/hooks";

export default function SocietyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  const canStructure = useHasPermission("structure.manage");
  const canResidents = useHasPermission("residents.manage");
  const canBilling = useHasPermission("billing.manage");
  const canPayments = useHasPermission("payments.view");
  const canExpenses = useHasPermission("expenses.manage");
  const canReports = useHasPermission("reports.view");
  const canStaff = useHasPermission("staff.manage");
  const canNotices = useHasPermission("notices.manage");
  const isResident = state.session?.role === "resident";
  const isSuper = state.session?.role === "super_admin";

  const base = `/society/${slug}`;
  const items = [
    { href: base, label: "Dashboard" },
    ...(canStructure || isSuper
      ? [{ href: `${base}/structure`, label: "Structure" }]
      : []),
    ...(canResidents || isSuper
      ? [{ href: `${base}/residents`, label: "Residents" }]
      : []),
    ...(canStaff || isSuper ? [{ href: `${base}/staff`, label: "Staff" }] : []),
    ...(canBilling || isSuper
      ? [{ href: `${base}/billing`, label: "Billing" }]
      : []),
    ...(canPayments || isSuper
      ? [{ href: `${base}/payments`, label: "Payments" }]
      : []),
    ...(canPayments || canReports || isSuper
      ? [{ href: `${base}/overdue`, label: "Overdue" }]
      : []),
    ...(canExpenses || isSuper
      ? [{ href: `${base}/expenses`, label: "Expenses" }]
      : []),
    ...(canNotices || isSuper
      ? [{ href: `${base}/notices`, label: "Notices" }]
      : []),
    ...(canReports || isSuper
      ? [{ href: `${base}/reports`, label: "Reports" }]
      : []),
  ];

  if (!society) {
    return (
      <div className="p-8">
        <p>Society not found.</p>
      </div>
    );
  }

  if (isResident) {
    return (
      <div className="p-8">
        <p className="text-sm text-slate-600">
          Residents use the mobile app view.
        </p>
      </div>
    );
  }

  const buildings = state.buildings.filter((b) => b.societyId === society.id);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar
        title={society.name}
        subtitle={`${society.city} · ${buildings.length} building(s) · /${society.slug}`}
      />
      <div className="flex flex-1 flex-col md:flex-row">
        <SideNav items={items} />
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
