"use client";

import { formatINR, useDemoState } from "@/lib/demo/hooks";

export default function ResidentHistoryPage() {
  const state = useDemoState();
  const resident = state.residents.find(
    (r) => r.id === state.session?.residentId,
  );
  if (!resident) return <div className="p-5 text-sm">No resident session.</div>;

  const payments = state.payments
    .filter((p) => p.flatId === resident.flatId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-4 p-5">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Payment history</p>
          <button
            type="button"
            className="text-xs text-teal-700 no-print"
            onClick={() => window.print()}
          >
            Print
          </button>
        </div>
        <ul className="space-y-3">
          {payments.map((p) => {
            const bill = state.bills.find((b) => b.id === p.billId);
            return (
              <li
                key={p.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm"
              >
                <div className="flex justify-between font-medium">
                  <span>{formatINR(p.amount)}</span>
                  <span className="uppercase text-slate-500">{p.method}</span>
                </div>
                <p className="mt-1 text-slate-600">
                  Bill {bill?.month ?? "—"} ·{" "}
                  {new Date(p.createdAt).toLocaleString("en-IN")}
                </p>
                {p.note ? (
                  <p className="mt-1 text-xs text-slate-500">{p.note}</p>
                ) : null}
              </li>
            );
          })}
          {payments.length === 0 ? (
            <p className="text-sm text-slate-500">No payments yet.</p>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
