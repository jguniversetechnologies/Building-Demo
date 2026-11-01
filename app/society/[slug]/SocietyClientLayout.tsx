"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell, GateMessage } from "@/components/demo/Shell";
import { useDemoState, useHasPermission, useSession } from "@/lib/demo/hooks";
import { useSocietySlug } from "@/lib/demo/useSocietySlug";

export function SocietyClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const slug = useSocietySlug();
  const router = useRouter();
  const state = useDemoState();
  const session = useSession();
  const society = state.societies.find((s) => s.slug === slug);

  const canStructure = useHasPermission("structure.manage");
  const canResidents = useHasPermission("residents.manage");
  const canBilling = useHasPermission("billing.manage");
  const canPayments = useHasPermission("payments.view");
  const canExpenses = useHasPermission("expenses.manage");
  const canReports = useHasPermission("reports.view");
  const canStaff = useHasPermission("staff.manage");
  const canNotices = useHasPermission("notices.manage");
  const isResident = session?.role === "resident";
  const isSuper = session?.role === "super_admin";

  useEffect(() => {
    if (!session) {
      router.replace("/");
      return;
    }
    if (isResident) {
      router.replace("/app");
    }
  }, [session, isResident, router]);

  if (!session) {
    return <GateMessage title="Pick a role first">Open the pitch home and choose who you are pitching as.</GateMessage>;
  }

  if (isResident) {
    return (
      <GateMessage title="Resident app">
        Residents use the phone preview — redirecting…
      </GateMessage>
    );
  }

  if (!slug) {
    return (
      <div className="p-8">
        <p className="text-sm text-slate-600">Loading society…</p>
      </div>
    );
  }

  if (!society) {
    return (
      <GateMessage title="Society not found">
        No society with slug “{slug}”. Reset the demo or create one as Super
        Admin.
      </GateMessage>
    );
  }

  if (!isSuper && session.societyId && session.societyId !== society.id) {
    const own = state.societies.find((s) => s.id === session.societyId);
    return (
      <GateMessage title="Wrong society for this role">
        You signed in for {own?.name ?? "another society"}. Switch role or open
        that society.
      </GateMessage>
    );
  }

  const base = `/society/${slug}`;
  const items = [
    { href: base, label: "Dashboard" },
    ...(canStructure ? [{ href: `${base}/structure`, label: "Structure" }] : []),
    ...(canResidents ? [{ href: `${base}/residents`, label: "Residents" }] : []),
    ...(canStaff ? [{ href: `${base}/staff`, label: "Staff" }] : []),
    ...(canBilling ? [{ href: `${base}/billing`, label: "Billing" }] : []),
    ...(canPayments ? [{ href: `${base}/payments`, label: "Payments" }] : []),
    ...(canPayments || canReports
      ? [{ href: `${base}/overdue`, label: "Overdue" }]
      : []),
    ...(canExpenses ? [{ href: `${base}/expenses`, label: "Expenses" }] : []),
    ...(canNotices ? [{ href: `${base}/notices`, label: "Notices" }] : []),
    ...(canReports ? [{ href: `${base}/reports`, label: "Reports" }] : []),
  ];

  const buildings = state.buildings.filter((b) => b.societyId === society.id);

  return (
    <AppShell
      title={society.name}
      subtitle={`${society.city} · ${buildings.length} building(s) · /${society.slug}`}
      items={items}
    >
      {children}
    </AppShell>
  );
}
