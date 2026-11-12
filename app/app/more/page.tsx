"use client";

import Link from "next/link";

export default function MorePage() {
  return (
    <div className="space-y-4 p-5">
      <h2 className="text-lg font-semibold text-slate-900">More</h2>
      <div className="space-y-2">
        <Link
          href="/app/history"
          className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm"
        >
          <span className="text-sm font-medium text-slate-900">Payment History</span>
          <span className="text-slate-400">→</span>
        </Link>
        <Link
          href="/app/complaints/history"
          className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm"
        >
          <span className="text-sm font-medium text-slate-900">My Complaints</span>
          <span className="text-slate-400">→</span>
        </Link>
        <Link
          href="/app/profile"
          className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm"
        >
          <span className="text-sm font-medium text-slate-900">Profile</span>
          <span className="text-slate-400">→</span>
        </Link>
        <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm opacity-50">
          <span className="text-sm font-medium text-slate-900">Settings</span>
          <span className="text-slate-400">→</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm opacity-50">
          <span className="text-sm font-medium text-slate-900">Help & Support</span>
          <span className="text-slate-400">→</span>
        </div>
      </div>
    </div>
  );
}
