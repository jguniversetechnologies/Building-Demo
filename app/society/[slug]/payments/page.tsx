"use client";

import { useMemo, useState } from "react";
import {
  FlashBar,
  GhostBtn,
  PageCard,
  RowActions,
} from "@/components/demo/Shell";
import {
  formatINR,
  useDemoState,
  useFlash,
  useHasPermission,
} from "@/lib/demo/hooks";
import { deletePayment, recordPayment } from "@/lib/demo/store";
import type { Payment } from "@/lib/demo/types";
import { useSocietySlug } from "@/lib/demo/useSocietySlug";

export default function PaymentsPage() {
  const slug = useSocietySlug();
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  const canRecord = useHasPermission("payments.record");
  const { flash, ok, err } = useFlash();

  const openBills = useMemo(() => {
    if (!society) return [];
    return state.bills
      .filter(
        (b) =>
          b.societyId === society.id &&
          b.status !== "draft" &&
          b.totalAmount - b.paidAmount > 0,
      )
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [society, state.bills]);

  const [billId, setBillId] = useState("");
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<Payment["method"]>("cash");
  const [note, setNote] = useState("");

  if (!society) return null;

  const payments = state.payments
    .filter((p) => p.societyId === society.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const selected =
    openBills.find((b) => b.id === billId) ?? openBills[0] ?? null;
  const due = selected
    ? Math.max(0, selected.totalAmount - selected.paidAmount)
    : 0;

  return (
    <div className="space-y-6">
      <FlashBar flash={flash} />

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Payments
        </h2>
        <p className="text-sm text-slate-600">
          {payments.length} total · {formatINR(payments.reduce((s, p) => s + p.amount, 0))} collected
        </p>
      </div>

      {canRecord ? (
        <PageCard title="Record Office Payment">
          <p className="mb-4 text-sm text-slate-600">
            Cash / cheque / bank — same ledger as resident UPI. Partial amounts allowed.
          </p>
          {selected ? (
            <form
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
              onSubmit={(e) => {
                e.preventDefault();
                const bill = selected;
                const payAmount = amount || due;
                const payment = recordPayment({
                  societyId: society.id,
                  flatId: bill.flatId,
                  billId: bill.id,
                  amount: payAmount,
                  method,
                  note: note || "Office entry",
                });
                if (payment) {
                  ok(`Recorded ${formatINR(payment.amount)}`);
                  setAmount(0);
                  setNote("");
                  setBillId("");
                } else {
                  err("Could not record payment");
                }
              }}
            >
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Select Bill
                </label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={selected.id}
                  onChange={(e) => {
                    setBillId(e.target.value);
                    setAmount(0);
                  }}
                >
                  {openBills.map((b) => {
                    const flat = state.flats.find((f) => f.id === b.flatId);
                    const left = b.totalAmount - b.paidAmount;
                    return (
                      <option key={b.id} value={b.id}>
                        {flat?.number} · {b.month} · due {formatINR(left)}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min={1}
                  max={due}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder={String(due)}
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Method
                </label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={method}
                  onChange={(e) =>
                    setMethod(e.target.value as Payment["method"])
                  }
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
                >
                  Record Payment
                </button>
              </div>
              <div className="sm:col-span-4 lg:col-span-5">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Note (optional)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Reference number or description"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </form>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">No open dues to record payment against.</p>
            </div>
          )}
        </PageCard>
      ) : null}

      <PageCard title="Payment Ledger">
        <p className="mb-4 text-sm text-slate-600">
          Resident UPI and office entries share this list — updates instantly.
        </p>
        {payments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="px-3 py-3 font-medium">Date & Time</th>
                  <th className="px-3 py-3 font-medium">Flat</th>
                  <th className="px-3 py-3 font-medium">Amount</th>
                  <th className="px-3 py-3 font-medium">Method</th>
                  <th className="px-3 py-3 font-medium">Note</th>
                  {canRecord ? <th className="px-3 py-3 font-medium">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const flat = state.flats.find((f) => f.id === p.flatId);
                  return (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                      <td className="px-3 py-3">
                        {new Date(p.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-3 py-3 font-medium">{flat?.number}</td>
                      <td className="px-3 py-3 font-semibold text-teal-700">
                        {formatINR(p.amount)}
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize">
                          {p.method}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{p.note || "—"}</td>
                      {canRecord ? (
                        <td className="px-3 py-3">
                          <RowActions>
                            <GhostBtn
                              danger
                              onClick={() => {
                                deletePayment(p.id);
                                ok(
                                  `Removed ${formatINR(p.amount)} — bill balance restored`,
                                );
                              }}
                            >
                              Undo
                            </GhostBtn>
                          </RowActions>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PageCard>
    </div>
  );
}
