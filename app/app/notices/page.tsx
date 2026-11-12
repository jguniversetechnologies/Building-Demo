"use client";

import { useState } from "react";
import { useDemoState } from "@/lib/demo/hooks";

export default function NoticesPage() {
  const [tab, setTab] = useState<"all" | "notices" | "events" | "circulars">("all");
  const state = useDemoState();
  const resident = state.residents.find(
    (r) => r.id === state.session?.residentId,
  );
  const notices = state.notices.filter(
    (n) => n.societyId === resident?.societyId,
  );

  return (
    <div className="space-y-4 p-5">
      <h2 className="text-lg font-semibold text-slate-900">
        Notices & Announcements
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setTab("all")}
          className={`pb-2 text-sm font-medium whitespace-nowrap ${
            tab === "all"
              ? "border-b-2 border-teal-600 text-teal-700"
              : "text-slate-500"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setTab("notices")}
          className={`pb-2 text-sm font-medium whitespace-nowrap ${
            tab === "notices"
              ? "border-b-2 border-teal-600 text-teal-700"
              : "text-slate-500"
          }`}
        >
          Notices
        </button>
        <button
          type="button"
          onClick={() => setTab("events")}
          className={`pb-2 text-sm font-medium whitespace-nowrap ${
            tab === "events"
              ? "border-b-2 border-teal-600 text-teal-700"
              : "text-slate-500"
          }`}
        >
          Events
        </button>
        <button
          type="button"
          onClick={() => setTab("circulars")}
          className={`pb-2 text-sm font-medium whitespace-nowrap ${
            tab === "circulars"
              ? "border-b-2 border-teal-600 text-teal-700"
              : "text-slate-500"
          }`}
        >
          Circulars
        </button>
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h3 className="font-semibold text-slate-900">{notice.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{notice.body}</p>
            <p className="mt-2 text-xs text-slate-400">
              {notice.createdAt
                ? new Date(notice.createdAt).toLocaleDateString("en-IN", {
                    dateStyle: "medium",
                  })
                : ""}
            </p>
          </div>
        ))}
        {notices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No notices available.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
