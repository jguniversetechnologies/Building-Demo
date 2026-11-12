"use client";

import Link from "next/link";
import { PageCard } from "@/components/demo/Shell";
import { formatINR, useDemoState } from "@/lib/demo/hooks";

export default function AdminDashboardPage() {
  const state = useDemoState();
  const flats = state.flats.length;
  const residents = state.residents.length;
  const buildings = state.buildings.length;
  const collected = state.payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Platform Overview
        </h2>
        <p className="text-sm text-slate-600">
          Manage all societies and platform-wide metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Societies
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {state.societies.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">Active CHS</p>
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Buildings
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {buildings}
              </p>
              <p className="mt-1 text-xs text-slate-500">Total wings</p>
            </div>
            <div className="rounded-full bg-purple-50 p-3">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Flats
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {flats}
              </p>
              <p className="mt-1 text-xs text-slate-500">{residents} residents</p>
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Collections
              </p>
              <p className="mt-1 text-2xl font-semibold text-teal-700">
                {formatINR(collected)}
              </p>
              <p className="mt-1 text-xs text-slate-500">Demo data</p>
            </div>
            <div className="rounded-full bg-green-50 p-3">
              <svg
                className="h-6 w-6 text-green-600"
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
      </div>

      {/* Societies List */}
      <PageCard
        title="All Societies"
        action={
          <Link
            href="/admin/societies"
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            + Add Society
          </Link>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {state.societies.map((s) => {
            const buildings = state.buildings.filter((b) => b.societyId === s.id);
            const flatCount = state.flats.filter((f) => f.societyId === s.id).length;
            const residentCount = state.residents.filter((r) => r.societyId === s.id).length;
            return (
              <div
                key={s.id}
                className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-teal-600 cursor-pointer hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{s.name}</h3>
                    <p className="text-sm text-slate-500">{s.city}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      s.plan === "pro"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {s.plan}
                  </span>
                </div>
                <div className="mb-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-lg font-semibold text-slate-900">
                      {buildings.length}
                    </p>
                    <p className="text-xs text-slate-500">Buildings</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-lg font-semibold text-slate-900">
                      {flatCount}
                    </p>
                    <p className="text-xs text-slate-500">Flats</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-lg font-semibold text-slate-900">
                      {residentCount}
                    </p>
                    <p className="text-xs text-slate-500">Residents</p>
                  </div>
                </div>
                <Link
                  href={`/society/${s.slug}`}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-100 cursor-pointer"
                >
                  Open Console →
                </Link>
              </div>
            );
          })}
        </div>
      </PageCard>
    </div>
  );
}
