"use client";

import { useDemoState } from "@/lib/demo/hooks";
import { clearSession } from "@/lib/demo/store";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const state = useDemoState();
  const resident = state.residents.find(
    (r) => r.id === state.session?.residentId,
  );
  const flat = state.flats.find((f) => f.id === resident?.flatId);
  const society = state.societies.find((s) => s.id === resident?.societyId);

  return (
    <div className="space-y-4 p-5">
      <h2 className="text-lg font-semibold text-slate-900">Profile</h2>

      {/* Profile Card */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white text-2xl font-bold">
            {resident?.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {resident?.name}
            </h3>
            <p className="text-sm text-slate-500">
              Flat {flat?.number} · {society?.name}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Phone</span>
            <span className="font-medium text-slate-900">{resident?.phone}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Flat</span>
            <span className="font-medium text-slate-900">{flat?.number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Society</span>
            <span className="font-medium text-slate-900">{society?.name}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          type="button"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Edit Profile
        </button>
        <button
          type="button"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Settings
        </button>
        <button
          type="button"
          className="w-full rounded-xl border border-rose-200 px-4 py-3 text-left text-sm font-medium text-rose-700 hover:bg-rose-50"
          onClick={() => {
            clearSession();
            router.push("/app/login");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
