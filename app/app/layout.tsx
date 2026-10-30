"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, resetDemoData } from "@/lib/demo/store";
import { useDemoState } from "@/lib/demo/hooks";

const tabs = [
  { href: "/app", label: "Home" },
  { href: "/app/bill", label: "Bill" },
  { href: "/app/pay", label: "Pay" },
  { href: "/app/history", label: "History" },
];

export default function ResidentAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const state = useDemoState();
  const resident = state.residents.find(
    (r) => r.id === state.session?.residentId,
  );
  const flat = state.flats.find((f) => f.id === resident?.flatId);
  const society = state.societies.find((s) => s.id === resident?.societyId);

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-6">
      <div className="mb-4 flex w-full max-w-md items-center justify-between gap-2 no-print">
        <p className="text-sm text-slate-600">Resident app (phone preview)</p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
            onClick={() => {
              resetDemoData();
              router.push("/");
            }}
          >
            Reset
          </button>
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-2 py-1 text-xs text-white"
            onClick={() => {
              clearSession();
              router.push("/");
            }}
          >
            Switch role
          </button>
        </div>
      </div>

      <div className="w-full max-w-[390px] overflow-hidden rounded-[2rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl">
        <div className="bg-gradient-to-b from-teal-800 to-teal-900 px-5 pb-4 pt-8 text-white">
          <p className="text-xs text-teal-100">{society?.name ?? "Society"}</p>
          <h1 className="text-xl font-semibold">
            {resident?.name ?? "Resident"}
          </h1>
          <p className="text-sm text-teal-100">Flat {flat?.number ?? "—"}</p>
        </div>
        <div className="min-h-[520px] bg-slate-50 pb-20">{children}</div>
        <nav className="grid grid-cols-4 border-t border-slate-200 bg-white">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`py-3 text-center text-xs ${
                  active ? "font-semibold text-teal-700" : "text-slate-500"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
