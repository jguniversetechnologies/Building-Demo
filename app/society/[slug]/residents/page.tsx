"use client";

import { useMemo, useState } from "react";
import {
  FlashBar,
  GhostBtn,
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
  const [searchTerm, setSearchTerm] = useState("");

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
    let list = state.residents.filter(
      (r) => r.societyId === society.id && flatIds.has(r.flatId),
    );
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.phone.includes(term) ||
          flats.find((f) => f.id === r.flatId)?.number.toLowerCase().includes(term)
      );
    }
    return list;
  }, [society, state.residents, flats, searchTerm]);

  if (!society) return null;

  return (
    <div className="space-y-6">
      <FlashBar flash={flash} />

      {/* Header with stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Residents
          </h2>
          <p className="text-sm text-slate-600">
            {residents.length} registered · {flats.length} flats
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
            onClick={() => {
              const inviteSection = document.getElementById("invite-section");
              inviteSection?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            + Invite Resident
          </button>
        )}
      </div>

      {scope?.length ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="font-medium">Scoped view:</span> Only buildings assigned to this staff user (LAM).
        </div>
      ) : null}

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name, phone, or flat number..."
          className="w-full rounded-lg border border-slate-200 px-4 py-3 pl-10 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <svg
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Residents Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {residents.map((r) => {
          const flat = state.flats.find((f) => f.id === r.flatId);
          const building = state.buildings.find((b) => b.id === flat?.buildingId);
          if (editId === r.id) {
            return (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <form
                  className="space-y-3"
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
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Name
                    </label>
                    <input
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Phone
                    </label>
                    <input
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Flat
                    </label>
                    <select
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={editFlatId}
                      onChange={(e) => setEditFlatId(e.target.value)}
                    >
                      {flats.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.number}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <GhostBtn type="submit" className="flex-1">
                      Save
                    </GhostBtn>
                    <GhostBtn onClick={() => setEditId(null)}>Cancel</GhostBtn>
                  </div>
                </form>
              </div>
            );
          }

          return (
            <div
              key={r.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-600 cursor-pointer hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{r.name}</h3>
                  <p className="text-sm text-slate-500">{flat?.number} · {building?.name}</p>
                  <p className="mt-1 font-mono text-sm text-slate-600">{r.phone}</p>
                </div>
                {r.inviteCode ? (
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                    New
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <GhostBtn
                  onClick={() => {
                    startResidentSession(r.id);
                    router.push("/app");
                  }}
                >
                  Open App
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
              </div>
            </div>
          );
        })}
      </div>

      {residents.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500">
            {searchTerm ? "No residents match your search." : "No residents yet. Invite your first resident."}
          </p>
        </div>
      )}

      {/* Invite Form */}
      {canEdit && (
        <div id="invite-section" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Invite New Resident
          </h3>
          <form
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
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
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Name
              </label>
              <input
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Phone
              </label>
              <input
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="10-digit mobile"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Assign Flat
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={flatId || flats[0]?.id || ""}
                onChange={(e) => setFlatId(e.target.value)}
              >
                {flats.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.number}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
              >
                Send Invite
              </button>
            </div>
          </form>

          {lastInvite ? (
            <div className="mt-4 rounded-xl bg-teal-50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-teal-100 p-2">
                  <svg
                    className="h-5 w-5 text-teal-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-teal-900">
                    Invite sent to {lastInvite.name}
                  </p>
                  <p className="mt-1 text-sm text-teal-800">
                    Phone: <span className="font-mono">{lastInvite.phone}</span> · Code:{" "}
                    <span className="font-mono">{lastInvite.code}</span>
                  </p>
                  <p className="mt-2 text-xs text-teal-700">
                    Share this code with the resident. They&apos;ll enter it when logging in.
                  </p>
                  <button
                    type="button"
                    className="mt-3 rounded-lg bg-teal-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-900"
                    onClick={() => {
                      clearSession();
                      router.push("/app/login");
                    }}
                  >
                    Open Resident App Login
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
