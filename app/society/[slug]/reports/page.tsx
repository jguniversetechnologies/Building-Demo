"use client";

import { PageCard } from "@/components/demo/Shell";
import { formatINR, useDemoState } from "@/lib/demo/hooks";
import { useSocietySlug } from "@/lib/demo/useSocietySlug";

export default function ReportsPage() {
  const slug = useSocietySlug();
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  if (!society) return null;

  const sid = society.id;
  const collected = state.payments
    .filter((p) => p.societyId === sid)
    .reduce((s, p) => s + p.amount, 0);
  const billed = state.bills
    .filter((b) => b.societyId === sid && b.status !== "draft")
    .reduce((s, b) => s + b.totalAmount, 0);
  const outstanding = state.bills
    .filter((b) => b.societyId === sid && b.status !== "draft")
    .reduce((s, b) => s + Math.max(0, b.totalAmount - b.paidAmount), 0);
  const expenses = state.expenses
    .filter((e) => e.societyId === sid)
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Reports
          </h2>
          <p className="text-sm text-slate-600">
            Financial overview and printable reports
          </p>
        </div>
        <button
          type="button"
          className="no-print rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          onClick={() => window.print()}
        >
          🖨️ Print Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Total Billed
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {formatINR(billed)}
              </p>
              <p className="mt-1 text-xs text-slate-500">All time</p>
            </div>
            <div className="rounded-full bg-blue-50 p-3">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Collected
              </p>
              <p className="mt-1 text-2xl font-semibold text-teal-700">
                {formatINR(collected)}
              </p>
              <p className="mt-1 text-xs text-slate-500">All time</p>
            </div>
            <div className="rounded-full bg-teal-50 p-3">
              <svg
                className="h-6 w-6 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Outstanding
              </p>
              <p className="mt-1 text-2xl font-semibold text-rose-700">
                {formatINR(outstanding)}
              </p>
              <p className="mt-1 text-xs text-slate-500">Receivable</p>
            </div>
            <div className="rounded-full bg-rose-50 p-3">
              <svg
                className="h-6 w-6 text-rose-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Expenses
              </p>
              <p className="mt-1 text-2xl font-semibold text-amber-700">
                {formatINR(expenses)}
              </p>
              <p className="mt-1 text-xs text-slate-500">All time</p>
            </div>
            <div className="rounded-full bg-amber-50 p-3">
              <svg
                className="h-6 w-6 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <PageCard title="Financial Summary">
        <div className="rounded-xl bg-slate-50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              Net Position (Collections − Expenses)
            </span>
            <span
              className={`text-2xl font-bold ${
                collected - expenses >= 0 ? "text-teal-700" : "text-rose-700"
              }`}
            >
              {formatINR(collected - expenses)}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-xs text-slate-500">Collection Rate</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {billed > 0 ? Math.round((collected / billed) * 100) : 0}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">Outstanding %</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {billed > 0 ? Math.round((outstanding / billed) * 100) : 0}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-500">Total Bills</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {state.bills.filter((b) => b.societyId === sid && b.status !== "draft").length}
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          💡 Tip: Use browser print (Ctrl+P / Cmd+P) to generate PDF reports. The demo
          uses the browser&apos;s default print stylesheet for clean output.
        </p>
      </PageCard>
    </div>
  );
}
