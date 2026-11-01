"use client";

import { useState } from "react";
import {
  FlashBar,
  GhostBtn,
  PageCard,
  RowActions,
} from "@/components/demo/Shell";
import { formatINR, useDemoState, useFlash, useHasPermission } from "@/lib/demo/hooks";
import {
  addBuilding,
  addFlat,
  addFlatType,
  deleteBuilding,
  deleteFlat,
  deleteFlatType,
  renameBuilding,
  updateFlat,
  updateFlatType,
} from "@/lib/demo/store";
import { useSocietySlug } from "@/lib/demo/useSocietySlug";

export default function StructurePage() {
  const slug = useSocietySlug();
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  const canEdit = useHasPermission("structure.manage");
  const { flash, ok, err } = useFlash();

  const [wingName, setWingName] = useState("");
  const [typeName, setTypeName] = useState("");
  const [typeRate, setTypeRate] = useState(3500);
  const [flatNumber, setFlatNumber] = useState("");
  const [flatBuildingId, setFlatBuildingId] = useState("");
  const [flatTypeId, setFlatTypeId] = useState("");

  const [editBuildingId, setEditBuildingId] = useState<string | null>(null);
  const [editBuildingName, setEditBuildingName] = useState("");
  const [editTypeId, setEditTypeId] = useState<string | null>(null);
  const [editTypeName, setEditTypeName] = useState("");
  const [editTypeRate, setEditTypeRate] = useState(0);
  const [editFlatId, setEditFlatId] = useState<string | null>(null);
  const [editFlatNumber, setEditFlatNumber] = useState("");
  const [editFlatBuildingId, setEditFlatBuildingId] = useState("");
  const [editFlatTypeId, setEditFlatTypeId] = useState("");

  if (!society) return null;
  const sid = society.id;
  const buildings = state.buildings.filter((b) => b.societyId === sid);
  const types = state.flatTypes.filter((t) => t.societyId === sid);
  const flats = state.flats.filter((f) => f.societyId === sid);
  const multi = buildings.length > 1;

  return (
    <div className="space-y-4">
      <FlashBar flash={flash} />

      <PageCard title="Buildings / Wings">
        {!multi ? (
          <p className="mb-3 text-sm text-teal-800">
            Simple mode: one building <strong>Main</strong>. Add a wing to unlock
            multi-building filters.
          </p>
        ) : (
          <p className="mb-3 text-sm text-slate-600">
            Multi-wing society — same CHS, central money.
          </p>
        )}
        <ul className="mb-3 space-y-2">
          {buildings.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"
            >
              {editBuildingId === b.id ? (
                <form
                  className="flex flex-1 flex-wrap gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    renameBuilding(b.id, editBuildingName);
                    setEditBuildingId(null);
                    ok(`Renamed to ${editBuildingName}`);
                  }}
                >
                  <input
                    className="rounded-lg border border-slate-200 px-2 py-1"
                    value={editBuildingName}
                    onChange={(e) => setEditBuildingName(e.target.value)}
                    autoFocus
                  />
                  <GhostBtn type="submit">Save</GhostBtn>
                  <GhostBtn onClick={() => setEditBuildingId(null)}>
                    Cancel
                  </GhostBtn>
                </form>
              ) : (
                <>
                  <span>
                    {b.name}
                    {b.isMain ? " · Main" : ""}
                    {" · "}
                    {flats.filter((f) => f.buildingId === b.id).length} flats
                  </span>
                  {canEdit ? (
                    <RowActions>
                      <GhostBtn
                        onClick={() => {
                          setEditBuildingId(b.id);
                          setEditBuildingName(b.name);
                        }}
                      >
                        Edit
                      </GhostBtn>
                      {!b.isMain ? (
                        <GhostBtn
                          danger
                          onClick={() => {
                            const res = deleteBuilding(b.id);
                            if (!res.ok) err(res.error);
                            else ok(`Deleted ${b.name}`);
                          }}
                        >
                          Delete
                        </GhostBtn>
                      ) : null}
                    </RowActions>
                  ) : null}
                </>
              )}
            </li>
          ))}
        </ul>
        {canEdit ? (
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!wingName.trim()) return;
              const b = addBuilding(sid, wingName.trim());
              setWingName("");
              ok(`Added ${b.name}`);
            }}
          >
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Wing / Building name"
              value={wingName}
              onChange={(e) => setWingName(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-lg bg-teal-700 px-3 py-2 text-sm text-white"
            >
              Add building
            </button>
          </form>
        ) : null}
      </PageCard>

      <PageCard title="Flat types & rates">
        <ul className="mb-3 space-y-2">
          {types.map((t) => (
            <li
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"
            >
              {editTypeId === t.id ? (
                <form
                  className="flex flex-1 flex-wrap gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateFlatType(t.id, {
                      name: editTypeName,
                      monthlyRate: editTypeRate,
                    });
                    setEditTypeId(null);
                    ok(`Updated ${editTypeName}`);
                  }}
                >
                  <input
                    className="rounded-lg border border-slate-200 px-2 py-1"
                    value={editTypeName}
                    onChange={(e) => setEditTypeName(e.target.value)}
                  />
                  <input
                    type="number"
                    className="w-28 rounded-lg border border-slate-200 px-2 py-1"
                    value={editTypeRate}
                    onChange={(e) => setEditTypeRate(Number(e.target.value))}
                  />
                  <GhostBtn type="submit">Save</GhostBtn>
                  <GhostBtn onClick={() => setEditTypeId(null)}>Cancel</GhostBtn>
                </form>
              ) : (
                <>
                  <span>
                    {t.name} · {formatINR(t.monthlyRate)}/mo
                  </span>
                  {canEdit ? (
                    <RowActions>
                      <GhostBtn
                        onClick={() => {
                          setEditTypeId(t.id);
                          setEditTypeName(t.name);
                          setEditTypeRate(t.monthlyRate);
                        }}
                      >
                        Edit
                      </GhostBtn>
                      <GhostBtn
                        danger
                        onClick={() => {
                          const res = deleteFlatType(t.id);
                          if (!res.ok) err(res.error);
                          else ok(`Deleted ${t.name}`);
                        }}
                      >
                        Delete
                      </GhostBtn>
                    </RowActions>
                  ) : null}
                </>
              )}
            </li>
          ))}
        </ul>
        {canEdit ? (
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addFlatType(sid, typeName, typeRate);
              ok(`Added type ${typeName}`);
              setTypeName("");
            }}
          >
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Type name"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              required
            />
            <input
              type="number"
              className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={typeRate}
              onChange={(e) => setTypeRate(Number(e.target.value))}
            />
            <button
              type="submit"
              className="rounded-lg bg-teal-700 px-3 py-2 text-sm text-white"
            >
              Add type
            </button>
          </form>
        ) : null}
      </PageCard>

      <PageCard title="Flats">
        <div className="mb-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-3">Flat</th>
                <th className="py-2 pr-3">Building</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">Rate</th>
                {canEdit ? <th className="py-2">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {flats.map((f) => {
                const b = buildings.find((x) => x.id === f.buildingId);
                const t = types.find((x) => x.id === f.flatTypeId);
                if (editFlatId === f.id) {
                  return (
                    <tr key={f.id} className="border-b border-slate-100">
                      <td colSpan={5} className="py-2">
                        <form
                          className="flex flex-wrap gap-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            updateFlat(f.id, {
                              number: editFlatNumber,
                              buildingId: editFlatBuildingId,
                              flatTypeId: editFlatTypeId,
                            });
                            setEditFlatId(null);
                            ok(`Updated flat ${editFlatNumber}`);
                          }}
                        >
                          <input
                            className="rounded-lg border border-slate-200 px-2 py-1"
                            value={editFlatNumber}
                            onChange={(e) => setEditFlatNumber(e.target.value)}
                          />
                          <select
                            className="rounded-lg border border-slate-200 px-2 py-1"
                            value={editFlatBuildingId}
                            onChange={(e) =>
                              setEditFlatBuildingId(e.target.value)
                            }
                          >
                            {buildings.map((x) => (
                              <option key={x.id} value={x.id}>
                                {x.name}
                              </option>
                            ))}
                          </select>
                          <select
                            className="rounded-lg border border-slate-200 px-2 py-1"
                            value={editFlatTypeId}
                            onChange={(e) => setEditFlatTypeId(e.target.value)}
                          >
                            {types.map((x) => (
                              <option key={x.id} value={x.id}>
                                {x.name}
                              </option>
                            ))}
                          </select>
                          <GhostBtn type="submit">Save</GhostBtn>
                          <GhostBtn onClick={() => setEditFlatId(null)}>
                            Cancel
                          </GhostBtn>
                        </form>
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={f.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-medium">{f.number}</td>
                    <td className="py-2 pr-3">{b?.name}</td>
                    <td className="py-2 pr-3">{t?.name}</td>
                    <td className="py-2 pr-3">
                      {formatINR(t?.monthlyRate ?? 0)}
                    </td>
                    {canEdit ? (
                      <td className="py-2">
                        <RowActions>
                          <GhostBtn
                            onClick={() => {
                              setEditFlatId(f.id);
                              setEditFlatNumber(f.number);
                              setEditFlatBuildingId(f.buildingId);
                              setEditFlatTypeId(f.flatTypeId);
                            }}
                          >
                            Edit
                          </GhostBtn>
                          <GhostBtn
                            danger
                            onClick={() => {
                              const res = deleteFlat(f.id);
                              if (!res.ok) err(res.error);
                              else ok(`Deleted flat ${f.number}`);
                            }}
                          >
                            Delete
                          </GhostBtn>
                        </RowActions>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {canEdit ? (
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const flat = addFlat({
                societyId: sid,
                buildingId: flatBuildingId || buildings[0]?.id,
                number: flatNumber,
                flatTypeId: flatTypeId || types[0]?.id,
              });
              ok(`Added flat ${flat.number}`);
              setFlatNumber("");
            }}
          >
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Flat no"
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              required
            />
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={flatBuildingId || buildings[0]?.id || ""}
              onChange={(e) => setFlatBuildingId(e.target.value)}
            >
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={flatTypeId || types[0]?.id || ""}
              onChange={(e) => setFlatTypeId(e.target.value)}
            >
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-teal-700 px-3 py-2 text-sm text-white"
            >
              Add flat
            </button>
          </form>
        ) : null}
      </PageCard>
    </div>
  );
}
