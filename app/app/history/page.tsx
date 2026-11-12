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

  const bills = state.bills
    .filter((b) => b.flatId === resident.flatId && b.status !== "draft")
    .sort((a, b) => b.month.localeCompare(a.month));

  return (
    <div className="space-y-4 p-5">
      <h2 className="text-lg font-semibold text-slate-900">Payment History</h2>

      {/* Payments */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Recent Payments</h3>
        {payments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No payments recorded yet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {payments.map((p) => {
              const bill = state.bills.find((b) => b.id === p.billId);
              return (
                <li
                  key={p.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-teal-100 p-2">
                        <svg className="h-4 w-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{formatINR(p.amount)}</p>
                        <p className="text-xs text-slate-500 uppercase">{p.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString("en-IN", {
                          dateStyle: "medium",
                        })}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(p.createdAt).toLocaleTimeString("en-IN", {
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                    <p className="text-slate-600">
                      Bill: <span className="font-medium text-slate-900">{bill?.month ?? "—"}</span>
                    </p>
                    {p.note ? (
                      <p className="text-xs text-slate-500">{p.note}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Bills */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Bill Status</h3>
        {bills.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No bills available.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {bills.map((bill) => {
              const balance = Math.max(0, bill.totalAmount - bill.paidAmount);
              const isPaid = balance === 0;
              return (
                <li
                  key={bill.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{bill.month}</p>
                      <p className="text-xs text-slate-500 capitalize">{bill.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {formatINR(bill.totalAmount)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Paid: {formatINR(bill.paidAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Balance due:</span>
                      <span className={`font-semibold ${isPaid ? 'text-green-600' : 'text-rose-600'}`}>
                        {formatINR(balance)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
