"use client";

import Link from "next/link";
import { PageCard, Stat } from "@/components/demo/Shell";
import { formatINR, useDemoState } from "@/lib/demo/hooks";

export default function AdminDashboardPage() {
  const state = useDemoState();
  const flats = state.flats.length;
  const collected = state.payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Societies" value={String(state.societies.length)} />
        <Stat label="Flats (all tenants)" value={String(flats)} />
        <Stat label="Demo collections" value={formatINR(collected)} />
      </div>

      <PageCard
        title="Societies"
        action={
          <Link
            href="/admin/societies"
            className="text-sm font-medium text-teal-700 hover:underline"
          >
            Manage
          </Link>
        }
      >
        <ul className="divide-y divide-slate-100">
          {state.societies.map((s) => {
            const buildings = state.buildings.filter((b) => b.societyId === s.id);
            const flatCount = state.flats.filter((f) => f.societyId === s.id).length;
            return (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-slate-900">{s.name}</p>
                  <p className="text-sm text-slate-500">
                    {s.city} · {buildings.length} building(s) · {flatCount} flats ·{" "}
                    {s.plan}
                  </p>
                </div>
                <Link
                  href={`/society/${s.slug}`}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
                >
                  Open console
                </Link>
              </li>
            );
          })}
        </ul>
      </PageCard>
    </div>
  );
}
