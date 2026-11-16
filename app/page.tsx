"use client";

import { useRouter } from "next/navigation";
import { useDemoState } from "@/lib/demo/hooks";
import { clearSession, setSession } from "@/lib/demo/store";
import type { DemoSession, StaffUser } from "@/lib/demo/types";

type Card = {
  step?: string;
  title: string;
  desc: string;
  session: DemoSession | null;
  href: string;
  accent?: string;
};

const STAFF_ROLE_ORDER: StaffUser["roleTemplate"][] = [
  "chairman",
  "secretary",
  "treasurer",
  "building_manager",
];

function staffHref(role: StaffUser["roleTemplate"], slug: string) {
  if (role === "secretary") return `/society/${slug}/residents`;
  if (role === "treasurer") return `/society/${slug}/billing`;
  if (role === "building_manager") return `/society/${slug}/residents`;
  return `/society/${slug}`;
}

function roleLabel(role: StaffUser["roleTemplate"]) {
  return role.replace("_", " ");
}

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
    if (card.session) setSession(card.session);
    else clearSession();
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
      desc: "Structure + invite resident with phone number",
      href: `/society/${green?.slug ?? "green-park"}/residents`,
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
      title: "Resident login & pay",
      desc: `Phone login (${resident?.phone ?? "9000002101"}) → OTP 1234 → pay any amount`,
      href: `/app/login?society=${encodeURIComponent(green?.slug ?? "green-park")}`,
      accent: "from-cyan-700 to-cyan-950",
      session: null,
    },
    {
      step: "5",
      title: "Overdue matrix",
      desc: "Room × month paid / partial / unpaid",
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
      title: "Resident phone login",
      desc: "Open app → enter mobile → OTP 1234 → bill & pay",
      href: `/app/login?society=${encodeURIComponent(green?.slug ?? "green-park")}`,
      session: null,
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10">
      <div className="flex max-w-3xl flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
            Client pitch demo · Society Shastra flows
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            Maintenance, clear for committee & residents
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Follow steps 1→5 in order. Same store: when a resident pays,
            Treasurer Payments / Overdue update immediately.
          </p>
          {state.session ? (
            <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-sm text-slate-700">
              Last role: <strong>{state.session.label}</strong> — pick another
              card or use Switch role inside consoles.
            </p>
          ) : null}
        </div>
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
              className={`rounded-2xl bg-gradient-to-br ${card.accent} p-4 text-left text-white shadow-lg transition hover:-translate-y-1 cursor-pointer cursor-pointer`}
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
          Enter any society
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          After creating a society, switch into Chairman, Secretary, or
          Treasurer here. Resident login opens that society’s phone login with
          its resident list below.
        </p>
        <div className="space-y-4">
          {state.societies.map((society) => {
            const staff = state.staff
              .filter((s) => s.societyId === society.id)
              .sort(
                (a, b) =>
                  STAFF_ROLE_ORDER.indexOf(a.roleTemplate) -
                  STAFF_ROLE_ORDER.indexOf(b.roleTemplate),
              );
            const residentCount = state.residents.filter(
              (r) => r.societyId === society.id,
            ).length;
            return (
              <div
                key={society.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {society.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      /{society.slug} · {society.city}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {staff.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() =>
                        enter({
                          title: s.roleTemplate,
                          desc: s.name,
                          href: staffHref(s.roleTemplate, society.slug),
                          session: {
                            role: s.roleTemplate,
                            societyId: society.id,
                            staffId: s.id,
                            residentId: null,
                            label: `${roleLabel(s.roleTemplate)} · ${s.name}`,
                          },
                        })
                      }
                      className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm transition hover:border-teal-600 hover:bg-teal-50"
                    >
                      <span className="block font-medium capitalize text-slate-900">
                        {roleLabel(s.roleTemplate)}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {s.name}
                      </span>
                    </button>
                  ))}
                  {residentCount > 0 ? (
                    <button
                      type="button"
                      onClick={() =>
                        enter({
                          title: "Resident login",
                          desc: society.name,
                          href: `/app/login?society=${encodeURIComponent(society.slug)}`,
                          session: null,
                        })
                      }
                      className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm transition hover:border-cyan-600 hover:bg-cyan-50"
                    >
                      <span className="block font-medium text-slate-900">
                        Resident login
                      </span>
                      <span className="block text-xs text-slate-500">
                        {residentCount} resident{residentCount === 1 ? "" : "s"} ·
                        phone + OTP
                      </span>
                    </button>
                  ) : null}
                  {staff.length === 0 && residentCount === 0 ? (
                    <p className="text-sm text-slate-500">
                      No staff or residents yet.
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
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
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 cursor-pointer hover:border-teal-600 hover:shadow-md cursor-pointer"
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
