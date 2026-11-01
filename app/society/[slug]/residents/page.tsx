"use client";

import { useMemo, useState } from "react";
import {
  FlashBar,
  GhostBtn,
  PageCard,
  RowActions,
} from "@/components/demo/Shell";
import { useDemoState, useFlash, useHasPermission } from "@/lib/demo/hooks";
import { useRouter } from "next/navigation";
import {
  clearSession,
  deleteResident,
  inviteResident,
  startResidentSession,
  updateResident,
} from "@/lib/demo/store";
import { useSocietySlug } from "@/lib/demo/useSocietySlug";

export default function ResidentsPage() {
  const slug = useSocietySlug();
  const router = useRouter();
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  const canEdit = useHasPermission("residents.manage");
  const session = state.session;
  const staff = state.staff.find((s) => s.id === session?.staffId);
  const scope = staff?.buildingScopeIds;
  const { flash, ok, err } = useFlash();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [flatId, setFlatId] = useState("");
  const [lastInvite, setLastInvite] = useState<{
    code: string;
    phone: string;
    name: string;
  } | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editFlatId, setEditFlatId] = useState("");

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
      <FlashBar flash={flash} />

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
            if (editId === r.id) {
              return (
                <li key={r.id} className="py-3">
                  <form
                    className="flex flex-wrap gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateResident(r.id, {
                        name: editName,
                        phone: editPhone,
                        flatId: editFlatId,
                      });
                      setEditId(null);
                      ok(`Updated ${editName}`);
                    }}
                  >
                    <input
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                    <input
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      required
                    />
                    <select
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={editFlatId}
                      onChange={(e) => setEditFlatId(e.target.value)}
                    >
                      {flats.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.number}
                        </option>
                      ))}
                    </select>
                    <GhostBtn type="submit">Save</GhostBtn>
                    <GhostBtn onClick={() => setEditId(null)}>Cancel</GhostBtn>
                  </form>
                </li>
              );
            }
            return (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
              >
                <span>
                  <strong>{r.name}</strong> · {flat?.number} · {building?.name}
                  <span className="ml-2 font-mono text-slate-600">
                    {r.phone}
                  </span>
                  {r.inviteCode ? (
                    <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[11px] text-amber-900">
                      code {r.inviteCode}
                    </span>
                  ) : null}
                </span>
                <RowActions>
                  <GhostBtn
                    onClick={() => {
                      startResidentSession(r.id);
                      router.push("/app");
                    }}
                  >
                    Open app
                  </GhostBtn>
                  {canEdit ? (
                    <>
                      <GhostBtn
                        onClick={() => {
                          setEditId(r.id);
                          setEditName(r.name);
                          setEditPhone(r.phone);
                          setEditFlatId(r.flatId);
                        }}
                      >
                        Edit
                      </GhostBtn>
                      <GhostBtn
                        danger
                        onClick={() => {
                          deleteResident(r.id);
                          ok(`Removed ${r.name}`);
                        }}
                      >
                        Delete
                      </GhostBtn>
                    </>
                  ) : null}
                </RowActions>
              </li>
            );
          })}
          {residents.length === 0 ? (
            <li className="py-2 text-sm text-slate-500">No residents yet.</li>
          ) : null}
        </ul>

        {canEdit ? (
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!flats.length) {
                err("Add a flat first");
                return;
              }
              try {
                const result = inviteResident({
                  societyId: society.id,
                  flatId: flatId || flats[0]?.id,
                  name,
                  phone,
                });
                setLastInvite({
                  code: result.inviteCode,
                  phone: result.resident.phone,
                  name: result.resident.name,
                });
                ok(`Invited ${name} · ${result.resident.phone}`);
                setName("");
                setPhone("");
              } catch (e) {
                err(e instanceof Error ? e.message : "Invite failed");
              }
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
              placeholder="10-digit phone"
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
          <div className="mt-3 space-y-2 rounded-xl bg-teal-50 px-3 py-3 text-sm text-teal-900">
            <p>
              Invited <strong>{lastInvite.name}</strong>. Phone{" "}
              <strong className="font-mono">{lastInvite.phone}</strong> · invite
              code <strong className="font-mono">{lastInvite.code}</strong>
            </p>
            <p className="text-xs text-teal-800">
              Demo: open Resident app → login with that phone → OTP{" "}
              <strong>1234</strong> → enter invite code once.
            </p>
            <button
              type="button"
              className="rounded-lg bg-teal-800 px-3 py-1.5 text-xs font-medium text-white"
              onClick={() => {
                clearSession();
                router.push("/app/login");
              }}
            >
              Open resident phone login
            </button>
          </div>
        ) : null}
      </PageCard>
    </div>
  );
}
