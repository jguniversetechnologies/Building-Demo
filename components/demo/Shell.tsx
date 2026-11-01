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
    <header className="no-print z-20 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-teal-700">
          Building Demo
        </p>
        <h1 className="truncate text-lg font-semibold text-slate-900">
          {title}
        </h1>
        {subtitle ? (
          <p className="truncate text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/"
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
        >
          Pitch home
        </Link>
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

function navItemActive(pathname: string, href: string, allHrefs: string[]) {
  const matches = allHrefs.filter(
    (h) => pathname === h || pathname.startsWith(`${h}/`),
  );
  if (matches.length === 0) return false;
  const best = matches.reduce((a, b) => (a.length >= b.length ? a : b));
  return best === href;
}

export function SideNav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const hrefs = items.map((i) => i.href);

  return (
    <nav className="no-print flex w-full shrink-0 flex-row gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 p-2 md:h-full md:w-56 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r">
      {items.map((item) => {
        const active = navItemActive(pathname, item.href, hrefs);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-teal-700 font-medium text-white shadow-sm"
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

export function AppShell({
  title,
  subtitle,
  items,
  children,
}: {
  title: string;
  subtitle?: string;
  items: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
      <TopBar title={title} subtitle={subtitle} />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <SideNav items={items} />
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
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

export function FlashBar({
  flash,
}: {
  flash: { text: string; tone: "ok" | "err" } | null;
}) {
  if (!flash) return null;
  return (
    <div
      role="status"
      className={`mb-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
        flash.tone === "ok"
          ? "bg-teal-50 text-teal-900 ring-1 ring-teal-200"
          : "bg-rose-50 text-rose-900 ring-1 ring-rose-200"
      }`}
    >
      {flash.text}
    </div>
  );
}

export function RowActions({ children }: { children: React.ReactNode }) {
  return <div className="flex shrink-0 flex-wrap gap-1">{children}</div>;
}

export function GhostBtn({
  children,
  onClick,
  danger,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-md px-2 py-1 text-xs font-medium transition ${
        danger
          ? "text-rose-700 hover:bg-rose-50"
          : "text-teal-800 hover:bg-teal-50"
      }`}
    >
      {children}
    </button>
  );
}

export function GateMessage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 p-10 text-center">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-600">{children}</p>
      <Link
        href="/"
        className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white"
      >
        Back to role picker
      </Link>
    </div>
  );
}
