"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, resetDemoData } from "@/lib/demo/store";
import { useDemoState } from "@/lib/demo/hooks";

const tabs = [
  { href: "/app", label: "Home" },
  { href: "/app/pay", label: "Payments" },
  { href: "/app/complaints", label: "Complaints" },
  { href: "/app/notices", label: "Notices" },
  { href: "/app/profile", label: "Profile" },
];

function tabActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function ResidentAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const state = useDemoState();
  const session = state.session;
  const isLogin = pathname === "/app/login";
  const isResident = session?.role === "resident";
  const resident = state.residents.find((r) => r.id === session?.residentId);
  const flat = state.flats.find((f) => f.id === resident?.flatId);
  const society = state.societies.find((s) => s.id === resident?.societyId);

  useEffect(() => {
    if (isLogin) return;
    if (!isResident) {
      router.replace("/app/login");
    }
  }, [isLogin, isResident, router]);

  const showChrome = isResident && !isLogin;

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-6">
      <div className="mb-4 flex w-full max-w-md items-center justify-between gap-2 no-print">
        <p className="text-sm text-slate-600">Resident app (phone preview)</p>
        <div className="flex gap-2">
          <Link
            href="/"
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
          >
            Pitch
          </Link>
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
            onClick={() => {
              resetDemoData();
              router.push("/app/login");
            }}
          >
            Reset
          </button>
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-2 py-1 text-xs text-white"
            onClick={() => {
              clearSession();
              router.push("/app/login");
            }}
          >
            {isResident ? "Logout" : "Login"}
          </button>
        </div>
      </div>

      <div className="flex h-[640px] w-full max-w-[390px] flex-col overflow-hidden rounded-[2rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl">
        <div className="shrink-0 bg-gradient-to-b from-teal-800 to-teal-900 px-5 pb-4 pt-8 text-white">
          {showChrome ? (
            <>
              <p className="text-xs text-teal-100">
                {society?.name ?? "Society"}
              </p>
              <h1 className="text-xl font-semibold">
                {resident?.name ?? "Resident"}
              </h1>
              <p className="text-sm text-teal-100">
                Flat {flat?.number ?? "—"} · {resident?.phone}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-teal-100">Building Demo</p>
              <h1 className="text-xl font-semibold">Resident app</h1>
              <p className="text-sm text-teal-100">Login with your mobile</p>
            </>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50">
          {isLogin || isResident ? (
            children
          ) : (
            <div className="p-5 text-sm text-slate-600">Opening login…</div>
          )}
        </div>
        {showChrome ? (
          <nav className="no-print grid shrink-0 grid-cols-5 border-t border-slate-200 bg-white">
            {tabs.map((tab) => {
              const active = tabActive(pathname, tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`py-3 text-center text-xs ${
                    active
                      ? "font-semibold text-teal-700"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
