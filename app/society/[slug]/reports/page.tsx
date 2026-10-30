"use client";

import { PageCard, Stat } from "@/components/demo/Shell";
import { formatINR, useDemoState } from "@/lib/demo/hooks";
import { useSocietySlug } from "@/lib/demo/useSocietySlug";

export default function ReportsPage() {
  const slug = useSocietySlug();
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  if (!society) return null;

  const sid = society.id;
  const collected = state.payments
    .filter((p) => p.societyId === sid)
    .reduce((s, p) => s + p.amount, 0);
  const billed = state.bills
    .filter((b) => b.societyId === sid && b.status !== "draft")
    .reduce((s, b) => s + b.totalAmount, 0);
  const outstanding = state.bills
    .filter((b) => b.societyId === sid && b.status !== "draft")
    .reduce((s, b) => s + Math.max(0, b.totalAmount - b.paidAmount), 0);
  const expenses = state.expenses
    .filter((e) => e.societyId === sid)
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="no-print flex justify-end">
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          onClick={() => window.print()}
        >
          Print report
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Billed" value={formatINR(billed)} />
        <Stat label="Collected" value={formatINR(collected)} />
        <Stat label="Receivable" value={formatINR(outstanding)} />
        <Stat label="Expenses" value={formatINR(expenses)} />
      </div>

      <PageCard title="Income vs expense">
        <p className="text-sm text-slate-600">
          Net position (collections − expenses):{" "}
          <strong>{formatINR(collected - expenses)}</strong>
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Collection & receivable reports + printable bills — demo print uses
          browser print stylesheet.
        </p>
      </PageCard>
    </div>
  );
}
