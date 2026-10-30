"use client";

import { use, useState } from "react";
import { PageCard } from "@/components/demo/Shell";
import { useDemoState, useHasPermission } from "@/lib/demo/hooks";
import { addStaff, updateStaffPermissions } from "@/lib/demo/store";
import {
  ALL_PERMISSIONS,
  ROLE_PERMISSIONS,
  type Permission,
  type StaffUser,
} from "@/lib/demo/types";

export default function StaffPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  const canEdit = useHasPermission("staff.manage");
  const buildings = state.buildings.filter((b) => b.societyId === society?.id);
  const multi = buildings.length > 1;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] =
    useState<StaffUser["roleTemplate"]>("secretary");
  const [scopeId, setScopeId] = useState<string>("");

  if (!society) return null;
  const staff = state.staff.filter((s) => s.societyId === society.id);

  return (
    <div className="space-y-4">
      <PageCard title="Committee & staff">
        <ul className="space-y-3">
          {staff.map((s) => (
            <li
              key={s.id}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {s.name}{" "}
                    <span className="text-xs uppercase text-teal-700">
                      {s.roleTemplate.replace("_", " ")}
                    </span>
                  </p>
                  <p className="text-sm text-slate-500">
                    {s.email} · {s.phone}
                    {s.buildingScopeIds?.length
                      ? ` · scoped: ${s.buildingScopeIds
                          .map(
                            (id) =>
                              buildings.find((b) => b.id === id)?.name ?? id,
                          )
                          .join(", ")}`
                      : " · society-wide"}
                  </p>
                </div>
              </div>
              {canEdit ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {ALL_PERMISSIONS.map((p) => {
                    const on = s.permissions.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        className={`rounded-full px-2 py-1 text-xs ${
                          on
                            ? "bg-teal-700 text-white"
                            : "bg-white text-slate-500"
                        }`}
                        onClick={() => {
                          const next: Permission[] = on
                            ? s.permissions.filter((x) => x !== p)
                            : [...s.permissions, p];
                          updateStaffPermissions(
                            s.id,
                            next,
                            s.buildingScopeIds,
                          );
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  {s.permissions.join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      </PageCard>

      {canEdit ? (
        <PageCard title="Invite staff">
          <form
            className="grid gap-2 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              addStaff({
                societyId: society.id,
                name,
                phone,
                email,
                roleTemplate: role,
                permissions: [...ROLE_PERMISSIONS[role]],
                buildingScopeIds:
                  role === "building_manager" && scopeId ? [scopeId] : null,
              });
              setName("");
              setPhone("");
              setEmail("");
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
            <input
              required
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as StaffUser["roleTemplate"])
              }
            >
              <option value="chairman">Chairman</option>
              <option value="secretary">Secretary</option>
              <option value="treasurer">Treasurer</option>
              <option value="building_manager">Building manager</option>
            </select>
            {multi && role === "building_manager" ? (
              <select
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
                value={scopeId || buildings[0]?.id}
                onChange={(e) => setScopeId(e.target.value)}
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    Scope: {b.name}
                  </option>
                ))}
              </select>
            ) : null}
            <button
              type="submit"
              className="rounded-lg bg-teal-700 px-3 py-2 text-sm text-white sm:col-span-2"
            >
              Add staff
            </button>
          </form>
        </PageCard>
      ) : null}
    </div>
  );
}
