"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, resetDemoData } from "@/lib/demo/store";
import { useSession } from "@/lib/demo/hooks";

export function TopBar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const session = useSession();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-teal-700">
          Building Demo
        </p>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {session ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
            {session.label}
          </span>
        ) : null}
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
          onClick={() => {
            resetDemoData();
            router.push("/");
          }}
        >
          Reset demo
        </button>
        <button
          type="button"
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white hover:bg-slate-800"
          onClick={() => {
            clearSession();
            router.push("/");
          }}
        >
          Switch role
        </button>
      </div>
    </header>
  );
}

export function SideNav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  return (
    <nav className="flex w-full flex-row gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 p-2 md:w-56 md:flex-col md:border-b-0 md:border-r">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
              active
                ? "bg-teal-700 text-white"
                : "text-slate-700 hover:bg-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PageCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-500">{children}</p>;
}
