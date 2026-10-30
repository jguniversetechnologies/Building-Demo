"use client";

import { use, useMemo, useState } from "react";
import { PageCard } from "@/components/demo/Shell";
import { useDemoState, useHasPermission } from "@/lib/demo/hooks";
import { inviteResident } from "@/lib/demo/store";

export default function ResidentsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  const canEdit = useHasPermission("residents.manage");
  const session = state.session;
  const staff = state.staff.find((s) => s.id === session?.staffId);
  const scope = staff?.buildingScopeIds;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [flatId, setFlatId] = useState("");
  const [lastInvite, setLastInvite] = useState<string | null>(null);

  const flats = useMemo(() => {
    if (!society) return [];
    let list = state.flats.filter((f) => f.societyId === society.id);
    if (scope?.length) list = list.filter((f) => scope.includes(f.buildingId));
    return list;
  }, [society, state.flats, scope]);

  const residents = useMemo(() => {
    if (!society) return [];
    const flatIds = new Set(flats.map((f) => f.id));
    return state.residents.filter(
      (r) => r.societyId === society.id && flatIds.has(r.flatId),
    );
  }, [society, state.residents, flats]);

  if (!society) return null;

  return (
    <div className="space-y-4">
      {scope?.length ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Scoped view: only buildings assigned to this staff user (LAM).
        </p>
      ) : null}

      <PageCard title="Residents">
        <ul className="mb-4 divide-y divide-slate-100">
          {residents.map((r) => {
            const flat = state.flats.find((f) => f.id === r.flatId);
            const building = state.buildings.find(
              (b) => b.id === flat?.buildingId,
            );
            return (
              <li key={r.id} className="flex justify-between py-2 text-sm">
                <span>
                  <strong>{r.name}</strong> · {flat?.number} · {building?.name}
                </span>
                <span className="text-slate-500">{r.phone}</span>
              </li>
            );
          })}
        </ul>

        {canEdit ? (
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const result = inviteResident({
                societyId: society.id,
                flatId: flatId || flats[0]?.id,
                name,
                phone,
              });
              setLastInvite(result.inviteCode);
              setName("");
              setPhone("");
            }}
          >
            <input
              required
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              required
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={flatId || flats[0]?.id || ""}
              onChange={(e) => setFlatId(e.target.value)}
            >
              {flats.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.number}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-teal-700 px-3 py-2 text-sm text-white"
            >
              Invite resident
            </button>
          </form>
        ) : null}

        {lastInvite ? (
          <p className="mt-3 rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-900">
            Invite created. Temp password / code:{" "}
            <strong className="font-mono">{lastInvite}</strong> (Deepak: resident
            verifies with password then uses app — demo shows code only)
          </p>
        ) : null}
      </PageCard>
    </div>
  );
}
