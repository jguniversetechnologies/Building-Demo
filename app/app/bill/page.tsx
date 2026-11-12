"use client";

import { useState } from "react";
import Link from "next/link";
import { formatINR, useDemoState } from "@/lib/demo/hooks";

export default function ResidentBillPage() {
  const [tab, setTab] = useState<"current" | "previous">("current");
  const state = useDemoState();
  const resident = state.residents.find(
    (r) => r.id === state.session?.residentId,
  );
  if (!resident) return <div className="p-5 text-sm">No resident session.</div>;

  const flat = state.flats.find((f) => f.id === resident.flatId);
  const bills = state.bills
    .filter((b) => b.flatId === resident.flatId && b.status !== "draft")
    .sort((a, b) => b.month.localeCompare(a.month));

  // Current bill = bills that are NOT paid (have status other than "paid")
  const current = bills.find((b) => b.status !== "paid");

  // Previous bills = bills that ARE paid
  const previous = bills.filter((b) => b.status === "paid");

  const balance = current
    ? Math.max(0, current.totalAmount - current.paidAmount)
    : 0;

  // Debug: Log to console to help diagnose
  if (typeof window !== "undefined") {
    console.log("Bill Page Debug:", {
      totalBills: bills.length,
      currentBill: current ? { month: current.month, status: current.status, balance: current.totalAmount - current.paidAmount } : null,
      previousCount: previous.length,
    });
  }

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Billing</h2>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-xs text-teal-600 hover:text-teal-700"
        >
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab("current")}
          className={`pb-2 text-sm font-medium ${
            tab === "current"
              ? "border-b-2 border-teal-600 text-teal-700"
              : "text-slate-500"
          }`}
        >
          Current Bill
        </button>
        <button
          type="button"
          onClick={() => setTab("previous")}
          className={`pb-2 text-sm font-medium ${
            tab === "previous"
              ? "border-b-2 border-teal-600 text-teal-700"
              : "text-slate-500"
          }`}
        >
          Previous Bills
        </button>
      </div>

      {tab === "current" && current ? (
        <div className="space-y-4">
          {/* Flat Info */}
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <p className="font-medium text-slate-900">
              Flat No. {flat?.number}
            </p>
            <p className="text-xs text-slate-500">{current.month}</p>
          </div>

          {/* Charges Breakdown */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Maintenance Charges
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Base Maintenance</span>
                <span className="font-medium text-slate-900">
                  {formatINR(current.maintenanceAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Parking Charges</span>
                <span className="font-medium text-slate-900">{formatINR(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Sinking Fund</span>
                <span className="font-medium text-slate-900">{formatINR(0)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold">
                <span className="text-slate-900">Total</span>
                <span className="text-slate-900">
                  {formatINR(current.maintenanceAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Previous Outstanding */}
          {current.previousDue > 0 && (
            <div className="rounded-2xl bg-amber-50 p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-amber-900">
                Previous Outstanding
              </h3>
              <p className="text-sm text-amber-800">
                {current.previousDue > 0
                  ? `Oct 2025 ${formatINR(current.previousDue)}`
                  : "None"}
              </p>
            </div>
          )}

          {/* Total Payable */}
          <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 p-4 text-white shadow-lg">
            <h3 className="text-sm font-medium text-teal-100">Total Payable</h3>
            <p className="mt-2 text-3xl font-bold">{formatINR(current.totalAmount)}</p>
            <p className="mt-1 text-xs text-teal-100">
              Balance due: {formatINR(balance)}
            </p>
          </div>

          {/* Proceed to Pay */}
          <Link
            href="/app/pay"
            className="block w-full rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:from-teal-700 hover:to-teal-800"
          >
            Proceed to Pay
          </Link>
        </div>
      ) : tab === "current" ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">All Bills Paid!</p>
              <p className="mt-1 text-sm text-slate-500">You have no outstanding dues.</p>
            </div>
            <Link
              href="/app/history"
              className="mt-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white"
            >
              View Payment History
            </Link>
          </div>
        </div>
      ) : null}

      {tab === "previous" && previous.length > 0 ? (
        <div className="space-y-3">
          {previous.map((bill) => {
            const billBalance = Math.max(0, bill.totalAmount - bill.paidAmount);
            const isFullyPaid = billBalance === 0;
            return (
              <div
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
                    <span className="text-slate-600">Balance:</span>
                    <span className={`font-semibold ${isFullyPaid ? 'text-green-600' : 'text-rose-600'}`}>
                      {formatINR(billBalance)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : tab === "previous" ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">No previous bills available.</p>
        </div>
      ) : null}
    </div>
  );
}
