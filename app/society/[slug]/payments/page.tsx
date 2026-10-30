"use client";

import { PageCard } from "@/components/demo/Shell";
import { formatINR, useDemoState } from "@/lib/demo/hooks";
import { useSocietySlug } from "@/lib/demo/useSocietySlug";

export default function PaymentsPage() {
  const slug = useSocietySlug();
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  if (!society) return null;

  const payments = state.payments
    .filter((p) => p.societyId === society.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <PageCard title="Payment ledger">
      <p className="mb-3 text-sm text-slate-600">
        Resident custom pays appear here instantly (same localStorage store).
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2 pr-3">When</th>
              <th className="py-2 pr-3">Flat</th>
              <th className="py-2 pr-3">Amount</th>
              <th className="py-2 pr-3">Method</th>
              <th className="py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => {
              const flat = state.flats.find((f) => f.id === p.flatId);
              return (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3">
                    {new Date(p.createdAt).toLocaleString("en-IN")}
                  </td>
                  <td className="py-2 pr-3">{flat?.number}</td>
                  <td className="py-2 pr-3 font-medium">
                    {formatINR(p.amount)}
                  </td>
                  <td className="py-2 pr-3 uppercase">{p.method}</td>
                  <td className="py-2">{p.note || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageCard>
  );
}
