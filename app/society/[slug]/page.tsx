"use client";

import Link from "next/link";
import { PageCard } from "@/components/demo/Shell";
import { formatINR, useDemoState } from "@/lib/demo/hooks";
import { useSocietySlug } from "@/lib/demo/useSocietySlug";

function monthLabel(ym: string) {
  if (!/^\d{4}-\d{2}$/.test(ym)) return ym;
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

export default function SocietyDashboardPage() {
  const slug = useSocietySlug();
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  if (!society) return null;

  const sid = society.id;
  const months = [
    ...new Set([
      ...state.bills.filter((b) => b.societyId === sid).map((b) => b.month),
      ...state.expenses.filter((e) => e.societyId === sid).map((e) => e.month),
      ...state.payments
        .filter((p) => p.societyId === sid)
        .map((p) => p.createdAt.slice(0, 7)),
    ]),
  ].sort();
  const month = months.at(-1) ?? "2025-10";

  // Calculate metrics
  const totalBilled = state.bills
    .filter((b) => b.societyId === sid && b.month === month && b.status !== "draft")
    .reduce((s, b) => s + b.totalAmount, 0);
  const collected = state.payments
    .filter((p) => p.societyId === sid && p.createdAt.startsWith(month))
    .reduce((s, p) => s + p.amount, 0);
  const overdue = state.bills
    .filter(
      (b) =>
        b.societyId === sid &&
        b.status !== "draft" &&
        b.totalAmount - b.paidAmount > 0,
    )
    .reduce((s, b) => s + (b.totalAmount - b.paidAmount), 0);
  const expenses = state.expenses
    .filter((e) => e.societyId === sid && e.month === month)
    .reduce((s, e) => s + e.amount, 0);
  const flats = state.flats.filter((f) => f.societyId === sid).length;
  const residents = state.residents.filter((r) => r.societyId === sid).length;
  const notices = state.notices.filter((n) => n.societyId === sid);
  const net = collected - expenses;
  const trackMax = Math.max(collected + expenses, 1);

  // Payment method breakdown
  const paymentMethods = state.payments
    .filter((p) => p.societyId === sid && p.createdAt.startsWith(month))
    .reduce((acc, p) => {
      acc[p.method] = (acc[p.method] || 0) + p.amount;
      return acc;
    }, {} as Record<string, number>);

  // Recent payments
  const recentPayments = state.payments
    .filter((p) => p.societyId === sid)
    .slice(0, 5);

  // Collection rate
  const collectionRate = totalBilled > 0 ? Math.round((collected / totalBilled) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header with month selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {society.name}
          </h2>
          <p className="text-sm text-slate-600">
            {society.city} · {flats} flats · {residents} residents
          </p>
        </div>
        <div className="flex gap-2">
          {months.slice(-3).map((m) => (
            <button
              key={m}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                month === m
                  ? "bg-teal-700 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {monthLabel(m)}
            </button>
          ))}
        </div>
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
                {formatINR(totalBilled)}
              </p>
              <p className="mt-1 text-xs text-slate-500">{monthLabel(month)}</p>
            </div>
            <div className="rounded-full bg-slate-100 p-3">
              <svg
                className="h-6 w-6 text-slate-600"
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
              <p className="mt-1 text-xs text-slate-500">
                {collectionRate}% of billed
              </p>
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
                {formatINR(overdue)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {state.bills.filter(
                  (b) => b.societyId === sid && b.status === "overdue"
                ).length}{" "}
                overdue flats
              </p>
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
              <p className="mt-1 text-xs text-slate-500">{monthLabel(month)}</p>
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

      {/* Collection Rate Card */}
      <PageCard title="Collection Performance">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Collection Rate
              </span>
              <span className="text-2xl font-bold text-teal-700">
                {collectionRate}%
              </span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-500"
                style={{ width: `${collectionRate}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>{formatINR(collected)} collected</span>
              <span>{formatINR(totalBilled)} billed</span>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-700">
              Payment Methods ({monthLabel(month)})
            </p>
            <div className="space-y-2">
              {Object.entries(paymentMethods).map(([method, amount]) => (
                <div key={method} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-slate-600">{method}</span>
                  <span className="font-medium text-slate-900">
                    {formatINR(amount)}
                  </span>
                </div>
              ))}
              {Object.keys(paymentMethods).length === 0 && (
                <p className="text-sm text-slate-400">No payments this month</p>
              )}
            </div>
          </div>
        </div>
      </PageCard>

      {/* Financial Health & Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PageCard title="Financial Health">
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">Collected</span>
                <span className="font-medium text-slate-900">
                  {formatINR(collected)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-600"
                  style={{ width: `${(collected / trackMax) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">Expenses</span>
                <span className="font-medium text-slate-900">
                  {formatINR(expenses)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${(expenses / trackMax) * 100}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Net Balance</span>
                <span
                  className={`text-xl font-bold ${
                    net >= 0 ? "text-teal-700" : "text-rose-700"
                  }`}
                >
                  {formatINR(net)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {net >= 0
                  ? "Surplus after expenses"
                  : "Deficit - review expenses"}
              </p>
            </div>
          </div>
        </PageCard>

        <PageCard title="Quick Actions">
          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              href={`/society/${slug}/billing`}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-teal-600 cursor-pointer hover:bg-teal-50 cursor-pointer"
            >
              <div className="rounded-full bg-teal-100 p-2">
                <svg
                  className="h-5 w-5 text-teal-700"
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
              <div>
                <p className="font-medium text-slate-900">Billing</p>
                <p className="text-xs text-slate-500">Generate & manage bills</p>
              </div>
            </Link>

            <Link
              href={`/society/${slug}/overdue`}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              <div className="rounded-full bg-rose-100 p-2">
                <svg
                  className="h-5 w-5 text-rose-700"
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
              <div>
                <p className="font-medium text-slate-900">Overdue Matrix</p>
                <p className="text-xs text-slate-500">Track pending payments</p>
              </div>
            </Link>

            <Link
              href={`/society/${slug}/payments`}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-amber-600 hover:bg-amber-50 cursor-pointer"
            >
              <div className="rounded-full bg-amber-100 p-2">
                <svg
                  className="h-5 w-5 text-amber-700"
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
              <div>
                <p className="font-medium text-slate-900">Payments</p>
                <p className="text-xs text-slate-500">Record & view payments</p>
              </div>
            </Link>

            <Link
              href={`/society/${slug}/expenses`}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-600 hover:bg-slate-50"
            >
              <div className="rounded-full bg-slate-100 p-2">
                <svg
                  className="h-5 w-5 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900">Expenses</p>
                <p className="text-xs text-slate-500">Track society expenses</p>
              </div>
            </Link>
          </div>
        </PageCard>
      </div>

      {/* Recent Activity & Notices */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PageCard title="Recent Payments">
          {recentPayments.length === 0 ? (
            <p className="text-sm text-slate-500">No payments recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentPayments.map((p) => {
                const flat = state.flats.find((f) => f.id === p.flatId);
                const resident = state.residents.find((r) => r.flatId === p.flatId);
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {flat?.number} · {resident?.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString("en-IN")} ·{" "}
                        <span className="capitalize">{p.method}</span>
                      </p>
                    </div>
                    <span className="font-semibold text-teal-700">
                      {formatINR(p.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </PageCard>

        <PageCard
          title="Broadcast Notices"
          action={
            <Link
              href={`/society/${slug}/notices`}
              className="text-sm text-teal-700 hover:underline"
            >
              Manage
            </Link>
          }
        >
          {notices.length === 0 ? (
            <p className="text-sm text-slate-500">No notices posted yet.</p>
          ) : (
            <ul className="space-y-2">
              {notices.slice(0, 3).map((n) => (
                <li key={n.id} className="rounded-xl bg-slate-50 p-3">
                  <p className="font-medium text-slate-900">{n.title}</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{n.body}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </li>
              ))}
              {notices.length > 3 && (
                <p className="text-sm text-slate-500">
                  +{notices.length - 3} more notices
                </p>
              )}
            </ul>
          )}
        </PageCard>
      </div>
    </div>
  );
}
