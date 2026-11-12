"use client";

import Link from "next/link";
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
import {
  createAndPublishMonth,
  deleteBill,
  deleteMonthBills,
  generateBillsForMonth,
  publishBills,
  regenerateBillsForMonth,
  updateBillingConfig,
} from "@/lib/demo/store";
import { useSocietySlug } from "@/lib/demo/useSocietySlug";

function monthLabel(ym: string) {
  if (!/^\d{4}-\d{2}$/.test(ym)) return ym;
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function statusLabel(status: string, previousDue: number) {
  if (status === "draft") return { text: "Draft (not live)", tone: "bg-slate-100 text-slate-700" };
  if (status === "paid") return { text: "Paid", tone: "bg-teal-50 text-teal-800" };
  if (status === "partial") return { text: "Partial paid", tone: "bg-amber-50 text-amber-900" };
  if (status === "overdue" || previousDue > 0) {
    return { text: "Live · has arrears", tone: "bg-rose-50 text-rose-800" };
  }
  return { text: "Live · due", tone: "bg-sky-50 text-sky-900" };
}

const DEMO_MONTHS = ["2025-10", "2025-11"];

export default function BillingPage() {
  const slug = useSocietySlug();
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  const canEdit = useHasPermission("billing.manage");
  const [month, setMonth] = useState("2025-11");
  const { flash, ok, err } = useFlash();

  const monthBills = useMemo(() => {
    if (!society) return [];
    return state.bills
      .filter((b) => b.societyId === society.id && b.month === month)
      .sort((a, b) => {
        const fa = state.flats.find((f) => f.id === a.flatId)?.number ?? "";
        const fb = state.flats.find((f) => f.id === b.flatId)?.number ?? "";
        return fa.localeCompare(fb);
      });
  }, [society, state.bills, state.flats, month]);

  if (!society) return null;

  const cfg = state.billingConfigs.find((c) => c.societyId === society.id);
  const types = state.flatTypes.filter((t) => t.societyId === society.id);
  const flatCount = state.flats.filter((f) => f.societyId === society.id).length;
  const drafts = monthBills.filter((b) => b.status === "draft").length;
  const live = monthBills.filter((b) => b.status !== "draft").length;
  const step =
    monthBills.length === 0 ? 1 : drafts > 0 ? 2 : live > 0 ? 3 : 1;

  return (
    <div className="space-y-4">
      <FlashBar flash={flash} />

      <PageCard title="How billing works (simple)">
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
          <li>
            <strong>Create bills</strong> for one month → each flat gets an
            amount (rate + any unpaid earlier + penalty).
          </li>
          <li>
            <strong>Publish</strong> → bills go live → residents can see & pay.
          </li>
          <li>
            <strong>Collect</strong> → Payments page or resident UPI.
          </li>
        </ol>
        <p className="mt-3 text-xs text-slate-500">
          Tip: stick to demo months <strong>Oct 2025</strong> /{" "}
          <strong>Nov 2025</strong>. Don’t jump to 2026 unless you mean to.
        </p>
      </PageCard>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        <strong>Custom rates:</strong> If you change a flat&apos;s custom rate, click
        &quot;Regenerate with new rates&quot; to update existing bills. New bills
        automatically use the current rate.
      </div>

      <PageCard title="Rates (used when creating bills)">
        <div className="flex flex-wrap gap-4 text-sm">
          <label>
            Late penalty (₹)
            <input
              type="number"
              disabled={!canEdit}
              className="ml-2 w-24 rounded-lg border border-slate-200 px-2 py-1"
              defaultValue={cfg?.latePenaltyAmount ?? 0}
              onBlur={(e) => {
                if (!canEdit) return;
                updateBillingConfig(society.id, {
                  latePenaltyAmount: Number(e.target.value) || 0,
                });
                ok("Penalty updated");
              }}
            />
          </label>
          <label>
            Due day of month
            <input
              type="number"
              disabled={!canEdit}
              className="ml-2 w-16 rounded-lg border border-slate-200 px-2 py-1"
              defaultValue={cfg?.dueDayOfMonth ?? 10}
              onBlur={(e) => {
                if (!canEdit) return;
                updateBillingConfig(society.id, {
                  dueDayOfMonth: Number(e.target.value) || 10,
                });
                ok("Due day updated");
              }}
            />
          </label>
        </div>
        <p className="mt-3 text-sm text-slate-600">
          {types.map((t) => `${t.name} ${formatINR(t.monthlyRate)}/mo`).join(" · ")}
        </p>
      </PageCard>

      {canEdit ? (
        <PageCard title={`Work on one month · ${monthLabel(month)}`}>
          <div className="mb-3 flex flex-wrap gap-2">
            {DEMO_MONTHS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMonth(m)}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  month === m
                    ? "bg-teal-700 text-white"
                    : "border border-slate-200 bg-white"
                }`}
              >
                {monthLabel(m)}
              </button>
            ))}
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Other
              <input
                type="month"
                className="rounded-lg border border-slate-200 px-2 py-1"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </label>
          </div>

          <div className="mb-4 grid gap-2 sm:grid-cols-3">
            <div
              className={`rounded-xl border p-3 text-sm ${
                step === 1 ? "border-teal-600 bg-teal-50" : "border-slate-200"
              }`}
            >
              <p className="font-semibold">1 · Create</p>
              <p className="text-xs text-slate-600">
                Make draft bills for all {flatCount} flats
              </p>
            </div>
            <div
              className={`rounded-xl border p-3 text-sm ${
                step === 2 ? "border-teal-600 bg-teal-50" : "border-slate-200"
              }`}
            >
              <p className="font-semibold">2 · Publish</p>
              <p className="text-xs text-slate-600">
                Drafts → live (residents can pay)
              </p>
            </div>
            <div
              className={`rounded-xl border p-3 text-sm ${
                step === 3 ? "border-teal-600 bg-teal-50" : "border-slate-200"
              }`}
            >
              <p className="font-semibold">3 · Collect</p>
              <p className="text-xs text-slate-600">
                Record payment or resident UPI
              </p>
            </div>
          </div>

          <p className="mb-3 text-sm text-slate-700">
            Selected: <strong>{monthLabel(month)}</strong> ({month}) ·{" "}
            {monthBills.length === 0
              ? "No bills yet"
              : `${drafts} draft · ${live} live`}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white"
              onClick={() => {
                const res = createAndPublishMonth(society.id, month);
                ok(
                  `${monthLabel(month)} live · created ${res.created}, published ${res.published}`,
                );
              }}
            >
              Create & publish {monthLabel(month)}
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              onClick={() => {
                const res = generateBillsForMonth(society.id, month);
                if (res.created === 0) {
                  ok(`All flats already have a bill for ${monthLabel(month)}`);
                } else {
                  ok(`Created ${res.created} draft bills`);
                }
              }}
            >
              Only create drafts
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              disabled={drafts === 0}
              onClick={() => {
                const res = publishBills(society.id, month);
                ok(`Published ${res.published} bills`);
              }}
            >
              Publish drafts only
            </button>
            <button
              type="button"
              className="rounded-lg border border-amber-200 px-3 py-2 text-sm text-amber-700"
              disabled={live === 0}
              onClick={() => {
                const res = regenerateBillsForMonth(society.id, month);
                if (res.changed === 0) {
                  ok(`All bills already use current rates (${res.updated} checked)`);
                } else {
                  ok(`Updated ${res.changed} bills with new rates (${res.updated} total)`);
                }
              }}
            >
              Regenerate with new rates
            </button>
            <button
              type="button"
              className="rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-700"
              onClick={() => {
                const res = deleteMonthBills(society.id, month);
                if (!res.ok) err(res.error);
                else ok(`Removed ${res.removed} bills for ${monthLabel(month)}`);
              }}
            >
              Clear this month
            </button>
            <Link
              href={`/society/${slug}/payments`}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              Go to Payments →
            </Link>
          </div>
        </PageCard>
      ) : null}

      <PageCard title={`Bills for ${monthLabel(month)} only`}>
        {monthBills.length === 0 ? (
          <p className="text-sm text-slate-500">
            No bills for this month yet. Click <strong>Create & publish</strong>{" "}
            above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-3">Flat</th>
                  <th className="py-2 pr-3">Rate</th>
                  <th className="py-2 pr-3">Arrears</th>
                  <th className="py-2 pr-3">Penalty</th>
                  <th className="py-2 pr-3">Total</th>
                  <th className="py-2 pr-3">Paid</th>
                  <th className="py-2 pr-3">Status</th>
                  {canEdit ? <th className="py-2">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {monthBills.map((b) => {
                  const flat = state.flats.find((f) => f.id === b.flatId);
                  const st = statusLabel(b.status, b.previousDue);
                  const type = types.find((t) => t.id === flat?.flatTypeId);
                  const typeRate = type?.monthlyRate ?? 0;
                  return (
                    <tr key={b.id} className="border-b border-slate-100">
                      <td className="py-2 pr-3 font-medium">{flat?.number}</td>
                      <td className="py-2 pr-3">
                        {formatINR(b.maintenanceAmount)}
                        {flat?.customRate && flat.customRate !== typeRate ? (
                          <span className="ml-1 text-xs text-amber-600">(custom)</span>
                        ) : null}
                      </td>
                      <td className="py-2 pr-3">
                        {formatINR(b.previousDue)}
                      </td>
                      <td className="py-2 pr-3">{formatINR(b.penalty)}</td>
                      <td className="py-2 pr-3 font-medium">
                        {formatINR(b.totalAmount)}
                      </td>
                      <td className="py-2 pr-3">{formatINR(b.paidAmount)}</td>
                      <td className="py-2 pr-3">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${st.tone}`}
                        >
                          {st.text}
                        </span>
                      </td>
                      {canEdit ? (
                        <td className="py-2">
                          <RowActions>
                            <GhostBtn
                              danger
                              onClick={() => {
                                const res = deleteBill(b.id);
                                if (!res.ok) err(res.error);
                                else ok(`Deleted ${flat?.number}`);
                              }}
                            >
                              Delete
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
