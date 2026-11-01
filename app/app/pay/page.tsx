"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR, useDemoState } from "@/lib/demo/hooks";
import {
  outstandingForFlat,
  recordPayment,
  setSession,
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
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [resident, state.bills]);

  const primary = openBills[0];
  const maxDue = primary
    ? Math.max(0, primary.totalAmount - primary.paidAmount)
    : 0;
  const totalOutstanding = resident
    ? outstandingForFlat(resident.flatId)
    : 0;
  const [amount, setAmount] = useState(0);
  const [doneAmount, setDoneAmount] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setAmount(maxDue);
  }, [maxDue, primary?.id]);

  if (!resident) {
    return (
      <div className="p-5 text-sm text-slate-600">
        Login with phone first.
      </div>
    );
  }

  const society = state.societies.find((s) => s.id === resident.societyId);
  const treas = state.staff.find(
    (s) => s.societyId === resident.societyId && s.roleTemplate === "treasurer",
  );

  return (
    <div className="space-y-4 p-5">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold">Pay maintenance</p>
        <p className="mt-1 text-sm text-slate-600">
          Enter any amount up to this bill. Oldest unpaid month is charged
          first.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Total outstanding</p>
            <p className="font-semibold">{formatINR(totalOutstanding)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Paying for</p>
            <p className="font-semibold">
              {primary ? primary.month : "—"}
            </p>
          </div>
        </div>

        {primary ? (
          <>
            <p className="mt-4 text-xs uppercase text-slate-500">
              Amount for {primary.month} (max {formatINR(maxDue)})
            </p>
            <label className="mt-1 block text-sm">
              Pay amount (₹)
              <input
                type="number"
                min={1}
                max={maxDue}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-lg"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs"
                onClick={() => setAmount(Math.min(1000, maxDue))}
              >
                ₹1,000
              </button>
              <button
                type="button"
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs"
                onClick={() => setAmount(Math.min(Math.floor(maxDue / 2), maxDue))}
              >
                Half
              </button>
              <button
                type="button"
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs"
                onClick={() => setAmount(maxDue)}
              >
                Full for {primary.month}
              </button>
            </div>
            <button
              type="button"
              className="mt-5 w-full rounded-xl bg-teal-700 py-3 text-sm font-medium text-white"
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
                setDoneAmount(payment.amount);
              }}
            >
              Pay {amount ? formatINR(amount) : ""} with UPI
            </button>
            {error ? (
              <p className="mt-2 text-sm text-rose-600">{error}</p>
            ) : null}
            {doneAmount != null ? (
              <div className="mt-4 space-y-2 rounded-xl bg-teal-50 p-3 text-sm text-teal-950">
                <p className="font-semibold">
                  Payment done · {formatINR(doneAmount)}
                </p>
                <p>
                  Remaining outstanding:{" "}
                  {formatINR(outstandingForFlat(resident.flatId))}
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    className="rounded-lg bg-teal-800 px-3 py-2 text-xs font-medium text-white"
                    onClick={() => {
                      if (!society || !treas) return;
                      setSession({
                        role: "treasurer",
                        societyId: society.id,
                        staffId: treas.id,
                        residentId: null,
                        label: `Treasurer · ${treas.name}`,
                      });
                      router.push(`/society/${society.slug}/payments`);
                    }}
                  >
                    Show Treasurer payments
                  </button>
                  <button
                    type="button"
                    className="text-xs underline"
                    onClick={() => router.push("/app/history")}
                  >
                    View receipt history
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No open dues. All clear.</p>
        )}
      </div>
    </div>
  );
}
