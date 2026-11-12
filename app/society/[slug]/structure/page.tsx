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
  getFlatRate,
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
  const [flatCustomRate, setFlatCustomRate] = useState("");

  const [editBuildingId, setEditBuildingId] = useState<string | null>(null);
  const [editBuildingName, setEditBuildingName] = useState("");
  const [editTypeId, setEditTypeId] = useState<string | null>(null);
  const [editTypeName, setEditTypeName] = useState("");
  const [editTypeRate, setEditTypeRate] = useState(0);
  const [editFlatId, setEditFlatId] = useState<string | null>(null);
  const [editFlatNumber, setEditFlatNumber] = useState("");
  const [editFlatBuildingId, setEditFlatBuildingId] = useState("");
  const [editFlatTypeId, setEditFlatTypeId] = useState("");
  const [editFlatCustomRate, setEditFlatCustomRate] = useState<string>("");

  if (!society) return null;
  const sid = society.id;
  const buildings = state.buildings.filter((b) => b.societyId === sid);
  const types = state.flatTypes.filter((t) => t.societyId === sid);
  const flats = state.flats.filter((f) => f.societyId === sid);
  const multi = buildings.length > 1;

  return (
    <div className="space-y-6">
      <FlashBar flash={flash} />

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Society Structure
        </h2>
        <p className="text-sm text-slate-600">
          {buildings.length} buildings · {types.length} flat types · {flats.length} flats
        </p>
      </div>

      {/* Buildings */}
      <PageCard title="Buildings / Wings">
        {!multi ? (
          <div className="mb-4 rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-800">
            <span className="font-medium">Simple mode:</span> One building &quot;Main&quot;. Add a wing to unlock multi-building filters.
          </div>
        ) : (
          <div className="mb-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-medium">Multi-wing society</span> — Same CHS, central money.
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {buildings.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {b.name}
                    {b.isMain && (
                      <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        Main
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {flats.filter((f) => f.buildingId === b.id).length} flats
                  </p>
                </div>
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
              </div>
              {editBuildingId === b.id ? (
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    renameBuilding(b.id, editBuildingName);
                    setEditBuildingId(null);
                    ok(`Renamed to ${editBuildingName}`);
                  }}
                >
                  <input
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={editBuildingName}
                    onChange={(e) => setEditBuildingName(e.target.value)}
                    autoFocus
                  />
                  <GhostBtn type="submit">Save</GhostBtn>
                  <GhostBtn onClick={() => setEditBuildingId(null)}>
                    Cancel
                  </GhostBtn>
                </form>
              ) : null}
            </div>
          ))}
        </div>
        {canEdit ? (
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!wingName.trim()) return;
              const b = addBuilding(sid, wingName.trim());
              setWingName("");
              ok(`Added ${b.name}`);
            }}
          >
            <input
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Wing / Building name"
              value={wingName}
              onChange={(e) => setWingName(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
            >
              + Add Building
            </button>
          </form>
        ) : null}
      </PageCard>

      <PageCard title="Flat Types & Rates">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{t.name}</h3>
                  <p className="text-sm text-slate-500">{formatINR(t.monthlyRate)}/month</p>
                </div>
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
              </div>
              {editTypeId === t.id ? (
                <form
                  className="mt-3 flex gap-2"
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
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={editTypeName}
                    onChange={(e) => setEditTypeName(e.target.value)}
                  />
                  <input
                    type="number"
                    className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={editTypeRate}
                    onChange={(e) => setEditTypeRate(Number(e.target.value))}
                  />
                  <GhostBtn type="submit">Save</GhostBtn>
                  <GhostBtn onClick={() => setEditTypeId(null)}>Cancel</GhostBtn>
                </form>
              ) : null}
            </div>
          ))}
        </div>
        {canEdit ? (
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addFlatType(sid, typeName, typeRate);
              ok(`Added type ${typeName}`);
              setTypeName("");
            }}
          >
            <input
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Type name (e.g., 2BHK, 3BHK)"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              required
            />
            <input
              type="number"
              className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Rate"
              value={typeRate}
              onChange={(e) => setTypeRate(Number(e.target.value))}
            />
            <button
              type="submit"
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
            >
              + Add Type
            </button>
          </form>
        ) : null}
      </PageCard>

      <PageCard title="Flats">
        <div className="mb-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="px-3 py-3 font-medium">Flat</th>
                <th className="px-3 py-3 font-medium">Building</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Rate</th>
                <th className="px-3 py-3 font-medium">Custom</th>
                {canEdit ? <th className="px-3 py-3 font-medium">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {flats.map((f) => {
                const b = buildings.find((x) => x.id === f.buildingId);
                const t = types.find((x) => x.id === f.flatTypeId);
                if (editFlatId === f.id) {
                  return (
                    <tr key={f.id} className="bg-slate-50">
                      <td colSpan={6} className="p-3">
                        <form
                          className="flex flex-wrap gap-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            updateFlat(f.id, {
                              number: editFlatNumber,
                              buildingId: editFlatBuildingId,
                              flatTypeId: editFlatTypeId,
                              customRate: editFlatCustomRate ? Number(editFlatCustomRate) : null,
                            });
                            setEditFlatId(null);
                            ok(`Updated flat ${editFlatNumber}`);
                          }}
                        >
                          <input
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={editFlatNumber}
                            onChange={(e) => setEditFlatNumber(e.target.value)}
                            placeholder="Flat number"
                          />
                          <select
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={editFlatTypeId}
                            onChange={(e) => setEditFlatTypeId(e.target.value)}
                          >
                            {types.map((x) => (
                              <option key={x.id} value={x.id}>
                                {x.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            placeholder="Custom rate (optional)"
                            value={editFlatCustomRate}
                            onChange={(e) => setEditFlatCustomRate(e.target.value)}
                          />
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
                  <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <td className="px-3 py-3 font-medium">{f.number}</td>
                    <td className="px-3 py-3">{b?.name}</td>
                    <td className="px-3 py-3">{t?.name}</td>
                    <td className="px-3 py-3">
                      {formatINR(getFlatRate(f, types))}
                    </td>
                    <td className="px-3 py-3">
                      {f.customRate ? (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          Custom
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    {canEdit ? (
                      <td className="px-3 py-3">
                        <RowActions>
                          <GhostBtn
                            onClick={() => {
                              setEditFlatId(f.id);
                              setEditFlatNumber(f.number);
                              setEditFlatBuildingId(f.buildingId);
                              setEditFlatTypeId(f.flatTypeId);
                              setEditFlatCustomRate(f.customRate ? String(f.customRate) : "");
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
            className="mt-4 flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const flat = addFlat({
                societyId: sid,
                buildingId: flatBuildingId || buildings[0]?.id,
                number: flatNumber,
                flatTypeId: flatTypeId || types[0]?.id,
                customRate: flatCustomRate ? Number(flatCustomRate) : null,
              });
              ok(`Added flat ${flat.number}`);
              setFlatNumber("");
              setFlatCustomRate("");
            }}
          >
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Flat number"
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
            <input
              type="number"
              className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Custom rate (optional)"
              value={flatCustomRate}
              onChange={(e) => setFlatCustomRate(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
            >
              + Add Flat
            </button>
          </form>
        ) : null}
      </PageCard>
    </div>
  );
}
