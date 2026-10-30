"use client";

import Link from "next/link";
import { formatINR, useDemoState } from "@/lib/demo/hooks";
import { outstandingForFlat } from "@/lib/demo/store";

export default function ResidentHomePage() {
  const state = useDemoState();
  const resident = state.residents.find(
    (r) => r.id === state.session?.residentId,
  );
  const flatId = resident?.flatId ?? "";
  const due = flatId ? outstandingForFlat(flatId) : 0;
  const notices = state.notices.filter((n) => n.societyId === resident?.societyId);

  if (!resident) {
    return (
      <div className="p-5 text-sm text-slate-600">
        Open from role picker as Resident.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-5">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-xs uppercase text-slate-500">Amount due</p>
        <p className="mt-1 text-3xl font-semibold text-slate-900">
          {formatINR(due)}
        </p>
        <Link
          href="/app/pay"
          className="mt-4 inline-flex rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white"
        >
          Pay now
        </Link>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="mb-2 text-sm font-semibold">Notices</p>
        <ul className="space-y-2">
          {notices.map((n) => (
            <li key={n.id} className="rounded-xl bg-slate-50 p-3 text-sm">
              <p className="font-medium">{n.title}</p>
              <p className="text-slate-600">{n.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
