"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR, useDemoState } from "@/lib/demo/hooks";
import {
  outstandingForFlat,
  recordPayment,
} from "@/lib/demo/store";

export default function ResidentPayPage() {
  const router = useRouter();
  const state = useDemoState();
  const resident = state.residents.find(
    (r) => r.id === state.session?.residentId,
  );
  const openBills = useMemo(() => {
    if (!resident) return [];
    return state.bills
      .filter(
        (b) =>
          b.flatId === resident.flatId &&
          b.status !== "draft" &&
          b.totalAmount - b.paidAmount > 0,
      )
      .sort((a, b) => a.month.localeCompare(b.month)); // Oldest first
  }, [resident, state.bills]);

  const primary = openBills[0];
  const maxDue = useMemo(() => {
    return primary
      ? Math.max(0, primary.totalAmount - primary.paidAmount)
      : 0;
  }, [primary]);
  const totalOutstanding = resident
    ? outstandingForFlat(resident.flatId)
    : 0;
  const [amount, setAmount] = useState(() => maxDue);
  const [error, setError] = useState("");

  if (!resident) {
    return (
      <div className="p-5 text-sm text-slate-600">
        Login with phone first.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-5">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Pay Maintenance</h3>
        <p className="mt-1 text-sm text-slate-600">
          Enter any amount up to this bill. Oldest unpaid month is charged first.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">Total outstanding</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{formatINR(totalOutstanding)}</p>
          </div>
          <div className="rounded-xl bg-teal-50 p-4">
            <p className="text-xs text-teal-600">Paying for</p>
            <p className="mt-1 text-xl font-semibold text-teal-900">
              {primary ? primary.month : "—"}
            </p>
          </div>
        </div>

        {primary ? (
          <>
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Amount for {primary.month} (max {formatINR(maxDue)})
              </label>
              <input
                type="number"
                min={1}
                max={maxDue}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                onClick={() => setAmount(Math.min(1000, maxDue))}
              >
                ₹1,000
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                onClick={() => setAmount(Math.min(Math.floor(maxDue / 2), maxDue))}
              >
                Half
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                onClick={() => setAmount(maxDue)}
              >
                Full for {primary.month}
              </button>
            </div>

            <button
              type="button"
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 py-4 text-sm font-medium text-white shadow-md hover:from-teal-700 hover:to-teal-800"
              onClick={() => {
                setError("");
                if (!amount || amount <= 0) {
                  setError("Enter an amount");
                  return;
                }
                const payment = recordPayment({
                  societyId: resident.societyId,
                  flatId: resident.flatId,
                  billId: primary.id,
                  amount,
                  method: "upi",
                  note: "Resident UPI (demo)",
                });
                if (!payment) {
                  setError("Could not record payment");
                  return;
                }
                router.push(`/app/pay/success?amount=${amount}`);
              }}
            >
              💳 Pay {amount ? formatINR(amount) : ""} with UPI
            </button>
            {error ? (
              <p className="mt-3 text-sm text-rose-600 text-center">{error}</p>
            ) : null}
          </>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-green-200 bg-green-50 p-6 text-center">
            <p className="text-sm text-green-800">✓ No open dues. All clear!</p>
          </div>
        )}
      </div>
    </div>
  );
}
