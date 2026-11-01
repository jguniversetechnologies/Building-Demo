"use client";

import { useState } from "react";
import {
  FlashBar,
  GhostBtn,
  PageCard,
  RowActions,
} from "@/components/demo/Shell";
import { useDemoState, useFlash, useHasPermission } from "@/lib/demo/hooks";
import {
  addStaff,
  deleteStaff,
  updateStaff,
  updateStaffPermissions,
} from "@/lib/demo/store";
import {
  ALL_PERMISSIONS,
  ROLE_PERMISSIONS,
  type Permission,
  type StaffUser,
} from "@/lib/demo/types";
import { useSocietySlug } from "@/lib/demo/useSocietySlug";

export default function StaffPage() {
  const slug = useSocietySlug();
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  const canEdit = useHasPermission("staff.manage");
  const buildings = state.buildings.filter((b) => b.societyId === society?.id);
  const multi = buildings.length > 1;
  const { flash, ok } = useFlash();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] =
    useState<StaffUser["roleTemplate"]>("secretary");
  const [scopeId, setScopeId] = useState<string>("");

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] =
    useState<StaffUser["roleTemplate"]>("secretary");
  const [editScopeId, setEditScopeId] = useState("");

  if (!society) return null;
  const staff = state.staff.filter((s) => s.societyId === society.id);

  return (
    <div className="space-y-4">
      <FlashBar flash={flash} />

      <PageCard title="Committee & staff">
        <ul className="space-y-3">
          {staff.map((s) => (
            <li
              key={s.id}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3"
            >
              {editId === s.id ? (
                <form
                  className="grid gap-2 sm:grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateStaff(s.id, {
                      name: editName,
                      phone: editPhone,
                      email: editEmail,
                      roleTemplate: editRole,
                      buildingScopeIds:
                        editRole === "building_manager" && editScopeId
                          ? [editScopeId]
                          : null,
                    });
                    if (editRole !== s.roleTemplate) {
                      updateStaffPermissions(
                        s.id,
                        [...ROLE_PERMISSIONS[editRole]],
                        editRole === "building_manager" && editScopeId
                          ? [editScopeId]
                          : null,
                      );
                    }
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
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                  <select
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={editRole}
                    onChange={(e) =>
                      setEditRole(e.target.value as StaffUser["roleTemplate"])
                    }
                  >
                    <option value="chairman">Chairman</option>
                    <option value="secretary">Secretary</option>
                    <option value="treasurer">Treasurer</option>
                    <option value="building_manager">Building manager</option>
                  </select>
                  {multi && editRole === "building_manager" ? (
                    <select
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
                      value={editScopeId || buildings[0]?.id}
                      onChange={(e) => setEditScopeId(e.target.value)}
                    >
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          Scope: {b.name}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  <div className="flex gap-2 sm:col-span-2">
                    <GhostBtn type="submit">Save</GhostBtn>
                    <GhostBtn onClick={() => setEditId(null)}>Cancel</GhostBtn>
                  </div>
                </form>
              ) : (
                <>
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
                                  buildings.find((b) => b.id === id)?.name ??
                                  id,
                              )
                              .join(", ")}`
                          : " · society-wide"}
                      </p>
                    </div>
                    {canEdit ? (
                      <RowActions>
                        <GhostBtn
                          onClick={() => {
                            setEditId(s.id);
                            setEditName(s.name);
                            setEditPhone(s.phone);
                            setEditEmail(s.email);
                            setEditRole(s.roleTemplate);
                            setEditScopeId(s.buildingScopeIds?.[0] ?? "");
                          }}
                        >
                          Edit
                        </GhostBtn>
                        <GhostBtn
                          danger
                          onClick={() => {
                            deleteStaff(s.id);
                            ok(`Removed ${s.name}`);
                          }}
                        >
                          Delete
                        </GhostBtn>
                      </RowActions>
                    ) : null}
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
                              ok(`${on ? "Revoked" : "Granted"} ${p}`);
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
                </>
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
              ok(`Added ${name}`);
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
