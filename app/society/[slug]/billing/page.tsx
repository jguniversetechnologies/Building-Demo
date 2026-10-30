"use client";

import { use, useState } from "react";
import { PageCard } from "@/components/demo/Shell";
import { formatINR, useDemoState, useHasPermission } from "@/lib/demo/hooks";
import {
  generateBillsForMonth,
  publishBills,
  updateBillingConfig,
} from "@/lib/demo/store";

export default function BillingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  const canEdit = useHasPermission("billing.manage");
  const [month, setMonth] = useState("2025-11");

  if (!society) return null;
  const cfg = state.billingConfigs.find((c) => c.societyId === society.id);
  const bills = state.bills
    .filter((b) => b.societyId === society.id)
    .sort((a, b) => b.month.localeCompare(a.month));
  const types = state.flatTypes.filter((t) => t.societyId === society.id);

  return (
    <div className="space-y-4">
      <PageCard title="Billing config">
        <div className="flex flex-wrap gap-4 text-sm">
          <label>
            Late penalty (₹)
            <input
              type="number"
              disabled={!canEdit}
              className="ml-2 w-24 rounded-lg border border-slate-200 px-2 py-1"
              defaultValue={cfg?.latePenaltyAmount ?? 0}
              onBlur={(e) =>
                canEdit &&
                updateBillingConfig(society.id, {
                  latePenaltyAmount: Number(e.target.value) || 0,
                })
              }
            />
          </label>
          <label>
            Due day
            <input
              type="number"
              disabled={!canEdit}
              className="ml-2 w-16 rounded-lg border border-slate-200 px-2 py-1"
              defaultValue={cfg?.dueDayOfMonth ?? 10}
              onBlur={(e) =>
                canEdit &&
                updateBillingConfig(society.id, {
                  dueDayOfMonth: Number(e.target.value) || 10,
                })
              }
            />
          </label>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Rates by flat type:{" "}
          {types.map((t) => `${t.name} ${formatINR(t.monthlyRate)}`).join(" · ")}
        </p>
      </PageCard>

      {canEdit ? (
        <PageCard title="Generate & publish">
          <div className="flex flex-wrap gap-2">
            <input
              type="month"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              onClick={() => generateBillsForMonth(society.id, month)}
            >
              Generate drafts
            </button>
            <button
              type="button"
              className="rounded-lg bg-teal-700 px-3 py-2 text-sm text-white"
              onClick={() => publishBills(society.id, month)}
            >
              Publish month
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Flow: generate flat-wise bills (current + previous due + penalty) →
            publish → resident can pay.
          </p>
        </PageCard>
      ) : null}

      <PageCard title="Bills">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-3">Flat</th>
                <th className="py-2 pr-3">Month</th>
                <th className="py-2 pr-3">Total</th>
                <th className="py-2 pr-3">Paid</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => {
                const flat = state.flats.find((f) => f.id === b.flatId);
                return (
                  <tr key={b.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{flat?.number}</td>
                    <td className="py-2 pr-3">{b.month}</td>
                    <td className="py-2 pr-3">{formatINR(b.totalAmount)}</td>
                    <td className="py-2 pr-3">{formatINR(b.paidAmount)}</td>
                    <td className="py-2 capitalize">{b.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PageCard>
    </div>
  );
}
