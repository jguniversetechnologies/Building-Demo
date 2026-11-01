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
    <div className="space-y-4">
      <FlashBar flash={flash} />

      {canRecord ? (
        <PageCard title="Record office payment">
          <p className="mb-3 text-sm text-slate-600">
            Cash / cheque / bank — same ledger as resident UPI. Partial amounts
            allowed.
          </p>
          {selected ? (
            <form
              className="flex flex-wrap items-end gap-2"
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
              <label className="text-sm">
                Open bill
                <select
                  className="mt-1 block min-w-[220px] rounded-lg border border-slate-200 px-3 py-2"
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
              </label>
              <label className="text-sm">
                Amount (₹)
                <input
                  type="number"
                  min={1}
                  max={due}
                  className="mt-1 block w-28 rounded-lg border border-slate-200 px-3 py-2"
                  placeholder={String(due)}
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </label>
              <label className="text-sm">
                Method
                <select
                  className="mt-1 block rounded-lg border border-slate-200 px-3 py-2"
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
              </label>
              <label className="text-sm">
                Note
                <input
                  className="mt-1 block w-40 rounded-lg border border-slate-200 px-3 py-2"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <button
                type="submit"
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm text-white"
              >
                Save payment
              </button>
            </form>
          ) : (
            <p className="text-sm text-slate-500">No open dues to record.</p>
          )}
        </PageCard>
      ) : null}

      <PageCard title="Payment ledger">
        <p className="mb-3 text-sm text-slate-600">
          Resident UPI and office entries share this list — updates instantly.
        </p>
        {payments.length === 0 ? (
          <p className="text-sm text-slate-500">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3">Flat</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Method</th>
                  <th className="py-2 pr-3">Note</th>
                  {canRecord ? <th className="py-2">Actions</th> : null}
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
                      <td className="py-2 pr-3">{p.note || "—"}</td>
                      {canRecord ? (
                        <td className="py-2">
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
