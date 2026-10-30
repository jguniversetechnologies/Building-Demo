"use client";

import { useState } from "react";
import { PageCard } from "@/components/demo/Shell";
import { formatINR, useDemoState, useHasPermission } from "@/lib/demo/hooks";
import { addBuilding, addFlat, addFlatType, updateFlatTypeRate } from "@/lib/demo/store";
import { useSocietySlug } from "@/lib/demo/useSocietySlug";

export default function StructurePage() {
  const slug = useSocietySlug();
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  const canEdit = useHasPermission("structure.manage");
  const [wingName, setWingName] = useState("");
  const [typeName, setTypeName] = useState("");
  const [typeRate, setTypeRate] = useState(3500);
  const [flatNumber, setFlatNumber] = useState("");
  const [flatBuildingId, setFlatBuildingId] = useState("");
  const [flatTypeId, setFlatTypeId] = useState("");

  if (!society) return null;
  const sid = society.id;
  const buildings = state.buildings.filter((b) => b.societyId === sid);
  const types = state.flatTypes.filter((t) => t.societyId === sid);
  const flats = state.flats.filter((f) => f.societyId === sid);
  const multi = buildings.length > 1;

  return (
    <div className="space-y-4">
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
        <ul className="mb-3 space-y-1">
          {buildings.map((b) => (
            <li key={b.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
              {b.name}
              {b.isMain ? " · Main" : ""}
              {" · "}
              {flats.filter((f) => f.buildingId === b.id).length} flats
            </li>
          ))}
        </ul>
        {canEdit ? (
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!wingName.trim()) return;
              addBuilding(sid, wingName.trim());
              setWingName("");
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
              <span>
                {t.name} · {formatINR(t.monthlyRate)}/mo
              </span>
              {canEdit ? (
                <input
                  type="number"
                  className="w-28 rounded border border-slate-200 px-2 py-1"
                  defaultValue={t.monthlyRate}
                  onBlur={(e) =>
                    updateFlatTypeRate(t.id, Number(e.target.value) || 0)
                  }
                />
              ) : null}
            </li>
          ))}
        </ul>
        {canEdit ? (
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addFlatType(sid, typeName, typeRate);
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
                <th className="py-2">Rate</th>
              </tr>
            </thead>
            <tbody>
              {flats.map((f) => {
                const b = buildings.find((x) => x.id === f.buildingId);
                const t = types.find((x) => x.id === f.flatTypeId);
                return (
                  <tr key={f.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-medium">{f.number}</td>
                    <td className="py-2 pr-3">{b?.name}</td>
                    <td className="py-2 pr-3">{t?.name}</td>
                    <td className="py-2">{formatINR(t?.monthlyRate ?? 0)}</td>
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
              addFlat({
                societyId: sid,
                buildingId: flatBuildingId || buildings[0]?.id,
                number: flatNumber,
                flatTypeId: flatTypeId || types[0]?.id,
              });
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
