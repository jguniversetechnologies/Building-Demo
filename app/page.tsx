"use client";

import { useRouter } from "next/navigation";
import { useDemoState } from "@/lib/demo/hooks";
import { setSession } from "@/lib/demo/store";
import type { DemoSession } from "@/lib/demo/types";

type Card = {
  step?: string;
  title: string;
  desc: string;
  session: DemoSession;
  href: string;
  accent?: string;
};

export default function HomePage() {
  const router = useRouter();
  const state = useDemoState();
  const green = state.societies.find((s) => s.slug === "green-park");
  const shanti = state.societies.find((s) => s.slug === "shanti-chs");

  const greenChair = state.staff.find((s) => s.id === "stf_green_chair");
  const greenSec = state.staff.find((s) => s.id === "stf_green_sec");
  const greenTreas = state.staff.find((s) => s.id === "stf_green_treas");
  const greenMgr = state.staff.find((s) => s.id === "stf_green_mgr_b");
  const resident = state.residents.find((r) => r.id === "res_gb101");

  const enter = (card: Card) => {
    setSession(card.session);
    router.push(card.href);
  };

  const pitch: Card[] = [
    {
      step: "1",
      title: "Super Admin",
      desc: "Create society → auto Main building → invite Chairman",
      href: "/admin/societies",
      accent: "from-slate-800 to-slate-950",
      session: {
        role: "super_admin",
        societyId: null,
        staffId: null,
        residentId: null,
        label: "Super Admin",
      },
    },
    {
      step: "2",
      title: "Secretary",
      desc: "Wings, flats, invite residents (temp password)",
      href: `/society/${green?.slug ?? "green-park"}/structure`,
      accent: "from-teal-700 to-teal-900",
      session: {
        role: "secretary",
        societyId: green?.id ?? null,
        staffId: greenSec?.id ?? null,
        residentId: null,
        label: `Secretary · ${greenSec?.name ?? ""}`,
      },
    },
    {
      step: "3",
      title: "Treasurer",
      desc: "Penalty config → generate → publish bills",
      href: `/society/${green?.slug ?? "green-park"}/billing`,
      accent: "from-emerald-700 to-emerald-900",
      session: {
        role: "treasurer",
        societyId: green?.id ?? null,
        staffId: greenTreas?.id ?? null,
        residentId: null,
        label: `Treasurer · ${greenTreas?.name ?? ""}`,
      },
    },
    {
      step: "4",
      title: "Resident pay",
      desc: "Digital bill + pay any amount (UPI demo) → reflects live",
      href: "/app/pay",
      accent: "from-cyan-700 to-cyan-950",
      session: {
        role: "resident",
        societyId: green?.id ?? null,
        staffId: null,
        residentId: resident?.id ?? null,
        label: `Resident · ${resident?.name ?? ""} · B-101`,
      },
    },
    {
      step: "5",
      title: "Overdue matrix",
      desc: "Room × month paid/unpaid/overdue (Deepak table)",
      href: `/society/${green?.slug ?? "green-park"}/overdue`,
      accent: "from-amber-700 to-amber-900",
      session: {
        role: "treasurer",
        societyId: green?.id ?? null,
        staffId: greenTreas?.id ?? null,
        residentId: null,
        label: `Treasurer · ${greenTreas?.name ?? ""}`,
      },
    },
  ];

  const more: Card[] = [
    {
      title: "Chairman",
      desc: `${green?.name ?? "Green Park"} — full control + staff permissions`,
      href: `/society/${green?.slug ?? "green-park"}`,
      session: {
        role: "chairman",
        societyId: green?.id ?? null,
        staffId: greenChair?.id ?? null,
        residentId: null,
        label: `Chairman · ${greenChair?.name ?? ""}`,
      },
    },
    {
      title: "Wing B Manager",
      desc: "LAM scoped — only Wing B residents",
      href: `/society/${green?.slug ?? "green-park"}/residents`,
      session: {
        role: "building_manager",
        societyId: green?.id ?? null,
        staffId: greenMgr?.id ?? null,
        residentId: null,
        label: `Wing Manager · ${greenMgr?.name ?? ""}`,
      },
    },
    {
      title: "Simple 1-building",
      desc: `${shanti?.name ?? "Shanti CHS"} — Main only, no wing noise`,
      href: `/society/${shanti?.slug ?? "shanti-chs"}`,
      session: {
        role: "chairman",
        societyId: shanti?.id ?? null,
        staffId: "stf_shanti_chair",
        residentId: null,
        label: "Chairman · Shanti CHS",
      },
    },
    {
      title: "Resident app home",
      desc: "Notices, due amount, bill, history, print",
      href: "/app",
      session: {
        role: "resident",
        societyId: green?.id ?? null,
        staffId: null,
        residentId: resident?.id ?? null,
        label: `Resident · ${resident?.name ?? ""}`,
      },
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
          Client pitch demo · Society Shastra flows
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          Maintenance, clear for committee & residents
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Follow steps 1→5 in order. Same store: when a resident pays, Treasurer
          Payments / Overdue update immediately. Data from{" "}
          <code className="rounded bg-white/80 px-1.5 py-0.5 text-sm">
            data/seed.json
          </code>
          + localStorage.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Pitch walkthrough
        </h2>
        <div className="grid gap-3 md:grid-cols-5">
          {pitch.map((card) => (
            <button
              key={card.title}
              type="button"
              onClick={() => enter(card)}
              className={`rounded-2xl bg-gradient-to-br ${card.accent} p-4 text-left text-white shadow-lg transition hover:-translate-y-1`}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                {card.step}
              </span>
              <h3 className="mt-3 text-lg font-semibold">{card.title}</h3>
              <p className="mt-1 text-sm text-white/85">{card.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          More roles
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {more.map((card) => (
            <button
              key={card.title}
              type="button"
              onClick={() => enter(card)}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-600 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{card.desc}</p>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
