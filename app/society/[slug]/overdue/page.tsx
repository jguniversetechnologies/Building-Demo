"use client";

import { use, useMemo } from "react";
import { PageCard } from "@/components/demo/Shell";
import { formatINR, useDemoState } from "@/lib/demo/hooks";

export default function OverduePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);

  const months = useMemo(() => {
    if (!society) return [];
    const set = new Set(
      state.bills
        .filter((b) => b.societyId === society.id && b.status !== "draft")
        .map((b) => b.month),
    );
    return [...set].sort();
  }, [society, state.bills]);

  if (!society) return null;

  const flats = state.flats
    .filter((f) => f.societyId === society.id)
    .sort((a, b) => a.number.localeCompare(b.number));

  return (
    <PageCard title="Overdue matrix (room × month)">
      <p className="mb-3 text-sm text-slate-600">
        Deepak-style view: paid / unpaid / overdue amount per flat per month.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs md:text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="sticky left-0 bg-white py-2 pr-3">Flat</th>
              {months.map((m) => (
                <th key={m} className="px-2 py-2">
                  {m}
                </th>
              ))}
              <th className="px-2 py-2">Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {flats.map((flat) => {
              let outstanding = 0;
              return (
                <tr key={flat.id} className="border-b border-slate-100">
                  <td className="sticky left-0 bg-white py-2 pr-3 font-medium">
                    {flat.number}
                  </td>
                  {months.map((m) => {
                    const bill = state.bills.find(
                      (b) =>
                        b.flatId === flat.id &&
                        b.month === m &&
                        b.status !== "draft",
                    );
                    if (!bill) {
                      return (
                        <td key={m} className="px-2 py-2 text-slate-300">
                          —
                        </td>
                      );
                    }
                    const due = bill.totalAmount - bill.paidAmount;
                    outstanding += Math.max(0, due);
                    const tone =
                      due <= 0
                        ? "bg-teal-50 text-teal-800"
                        : bill.paidAmount > 0
                          ? "bg-amber-50 text-amber-900"
                          : "bg-rose-50 text-rose-800";
                    const label =
                      due <= 0
                        ? "Paid"
                        : bill.paidAmount > 0
                          ? `Partial · ${formatINR(due)}`
                          : `Unpaid · ${formatINR(due)}`;
                    return (
                      <td key={m} className="px-2 py-2">
                        <span
                          className={`inline-block rounded-md px-2 py-1 text-[11px] font-medium ${tone}`}
                        >
                          {label}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 font-medium">
                    {formatINR(outstanding)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageCard>
  );
}
