"use client";

import Link from "next/link";
import { formatINR, useDemoState } from "@/lib/demo/hooks";
import { outstandingForFlat } from "@/lib/demo/store";

const quickActions = [
  { href: "/app/bill", label: "Maintenance", icon: "📋" },
  { href: "/app/complaints", label: "Complaints", icon: "📝" },
  { href: "/app/notices", label: "Notices", icon: "📢" },
  { href: "/app/visitor", label: "Visitor Pass", icon: "🎫" },
  { href: "/app/expenses", label: "Expenses", icon: "💰" },
  { href: "/app/more", label: "More", icon: "⋯" },
];

export default function ResidentHomePage() {
  const state = useDemoState();
  const resident = state.residents.find(
    (r) => r.id === state.session?.residentId,
  );
  const flat = state.flats.find((f) => f.id === resident?.flatId);
  const flatId = resident?.flatId ?? "";
  const due = flatId ? outstandingForFlat(flatId) : 0;
  const notices = state.notices.filter(
    (n) => n.societyId === resident?.societyId,
  );

  if (!resident) {
    return (
      <div className="p-5 text-sm text-slate-600">
        <Link href="/app/login" className="text-teal-700 underline">
          Login with phone
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-5">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Hello, {resident.name}
        </h2>
        <p className="text-sm text-slate-500">
          Flat {flat?.number ?? "—"} · {resident.phone}
        </p>
      </div>

      {/* Maintenance Due Card */}
      {due > 0 ? (
        <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 p-5 text-white shadow-lg">
          <p className="text-sm font-medium text-teal-100">Monthly Maintenance</p>
          <p className="mt-2 text-3xl font-bold">{formatINR(due)}</p>
          <p className="mt-1 text-sm text-teal-100">Due on 10 Nov 2025</p>
          <Link
            href="/app/pay"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50"
          >
            Pay Now
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-gradient-to-br from-green-600 to-green-700 p-5 text-white shadow-lg">
          <p className="text-sm font-medium text-green-100">Monthly Maintenance</p>
          <p className="mt-2 text-3xl font-bold">{formatINR(due)}</p>
          <p className="mt-1 text-sm text-green-100">All dues cleared!</p>
          <div className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-white/20 px-4 py-3 text-sm font-semibold text-white">
            ✓ No outstanding amount
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center rounded-xl bg-white p-4 text-center shadow-sm transition hover:bg-slate-50"
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="mt-2 text-xs font-medium text-slate-700">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Notices Preview */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Notices</p>
          <Link
            href="/app/notices"
            className="text-xs text-teal-600 hover:text-teal-700"
          >
            View all
          </Link>
        </div>
        <ul className="space-y-2">
          {notices.slice(0, 2).map((n) => (
            <li
              key={n.id}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm"
            >
              <p className="font-medium text-slate-900">{n.title}</p>
              <p className="mt-1 text-xs text-slate-600 line-clamp-2">{n.body}</p>
            </li>
          ))}
          {notices.length === 0 ? (
            <p className="text-sm text-slate-500">No notices.</p>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
