"use client";

import Link from "next/link";
import { PageCard, Stat } from "@/components/demo/Shell";
import { formatINR, useDemoState } from "@/lib/demo/hooks";
import { useSocietySlug } from "@/lib/demo/useSocietySlug";

export default function SocietyDashboardPage() {
  const slug = useSocietySlug();
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  if (!society) return null;

  const sid = society.id;
  const month = "2025-10";
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
  const notices = state.notices.filter((n) => n.societyId === sid);
  const net = collected - expenses;
  const trackMax = Math.max(collected + expenses, 1);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Flats" value={String(flats)} />
        <Stat label="Collected (Oct)" value={formatINR(collected)} />
        <Stat label="Outstanding" value={formatINR(overdue)} />
        <Stat label="Expenses (Oct)" value={formatINR(expenses)} />
      </div>

      <PageCard title="Month maintenance tracker (Deepak #1)">
        <p className="mb-3 text-sm text-slate-600">
          Collections vs expenses this month — expenses deducted from
          maintenance received.
        </p>
        <div className="space-y-2">
          <div>
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>Collected</span>
              <span>{formatINR(collected)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal-600"
                style={{ width: `${(collected / trackMax) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>Expenses</span>
              <span>{formatINR(expenses)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${(expenses / trackMax) * 100}%` }}
              />
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm">
          Net after expenses:{" "}
          <strong className={net >= 0 ? "text-teal-800" : "text-rose-700"}>
            {formatINR(net)}
          </strong>
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link
            href={`/society/${slug}/overdue`}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-white"
          >
            Overdue matrix
          </Link>
          <Link
            href={`/society/${slug}/expenses`}
            className="rounded-lg border border-slate-200 px-3 py-1.5"
          >
            Expenses
          </Link>
          <Link
            href={`/society/${slug}/reports`}
            className="rounded-lg border border-slate-200 px-3 py-1.5"
          >
            Reports / print
          </Link>
        </div>
      </PageCard>

      <PageCard
        title="Broadcast notices"
        action={
          <Link
            href={`/society/${slug}/notices`}
            className="text-sm text-teal-700 hover:underline"
          >
            Manage
          </Link>
        }
      >
        <ul className="space-y-2">
          {notices.map((n) => (
            <li key={n.id} className="rounded-xl bg-slate-50 p-3">
              <p className="font-medium">{n.title}</p>
              <p className="text-sm text-slate-600">{n.body}</p>
            </li>
          ))}
          {notices.length === 0 ? (
            <p className="text-sm text-slate-500">No notices.</p>
          ) : null}
        </ul>
      </PageCard>
    </div>
  );
}
