"use client";

import { formatINR, useDemoState } from "@/lib/demo/hooks";

export default function ResidentBillPage() {
  const state = useDemoState();
  const resident = state.residents.find(
    (r) => r.id === state.session?.residentId,
  );
  if (!resident) return <div className="p-5 text-sm">No resident session.</div>;

  const society = state.societies.find((s) => s.id === resident.societyId);
  const flat = state.flats.find((f) => f.id === resident.flatId);
  const building = state.buildings.find((b) => b.id === flat?.buildingId);
  const bills = state.bills
    .filter((b) => b.flatId === resident.flatId && b.status !== "draft")
    .sort((a, b) => b.month.localeCompare(a.month));
  const current = bills[0];
  const balance = current
    ? Math.max(0, current.totalAmount - current.paidAmount)
    : 0;

  return (
    <div className="space-y-4 p-5">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b-2 border-dashed border-slate-200 bg-slate-900 px-4 py-4 text-white">
          <p className="text-[10px] uppercase tracking-[0.2em] text-teal-200">
            Digital maintenance bill
          </p>
          <h2 className="mt-1 text-lg font-semibold">{society?.name}</h2>
          <p className="text-xs text-slate-300">
            {society?.address}, {society?.city}
          </p>
        </div>
        {current ? (
          <div className="space-y-3 p-4 text-sm">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-500">Flat / Wing</p>
                <p className="font-medium">
                  {flat?.number} · {building?.name}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Bill month</p>
                <p className="font-medium">{current.month}</p>
              </div>
              <div>
                <p className="text-slate-500">Generated</p>
                <p className="font-medium">
                  {current.publishedAt
                    ? new Date(current.publishedAt).toLocaleDateString("en-IN")
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Resident</p>
                <p className="font-medium">{resident.name}</p>
              </div>
            </div>

            <dl className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex justify-between">
                <dt>Current maintenance</dt>
                <dd>{formatINR(current.maintenanceAmount)}</dd>
              </div>
              <div className="flex justify-between text-amber-800">
                <dt>Previous overdue</dt>
                <dd>{formatINR(current.previousDue)}</dd>
              </div>
              <div className="flex justify-between text-rose-700">
                <dt>Late penalty</dt>
                <dd>{formatINR(current.penalty)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold">
                <dt>Total payable</dt>
                <dd>{formatINR(current.totalAmount)}</dd>
              </div>
              <div className="flex justify-between text-teal-700">
                <dt>Already paid</dt>
                <dd>{formatINR(current.paidAmount)}</dd>
              </div>
              <div className="flex justify-between rounded-xl bg-rose-50 px-3 py-2 font-semibold text-rose-800">
                <dt>Balance due</dt>
                <dd>{formatINR(balance)}</dd>
              </div>
            </dl>

            <button
              type="button"
              className="w-full rounded-xl border border-slate-200 py-2 text-xs font-medium no-print"
              onClick={() => window.print()}
            >
              Print / save bill
            </button>
          </div>
        ) : (
          <p className="p-4 text-sm text-slate-500">No published bill.</p>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-2 text-sm font-semibold">Month-wise history</p>
        <ul className="space-y-2 text-sm">
          {bills.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
            >
              <span>
                {b.month}{" "}
                <span className="capitalize text-slate-500">· {b.status}</span>
              </span>
              <span className="font-medium">
                {formatINR(Math.max(0, b.totalAmount - b.paidAmount))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
