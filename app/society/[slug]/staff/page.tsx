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
    <div className="space-y-6">
      <FlashBar flash={flash} />

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Committee & Staff
        </h2>
        <p className="text-sm text-slate-600">
          {staff.length} members · {multi ? "Multi-wing society" : "Single building"}
        </p>
      </div>

      {/* Staff Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-600 hover:shadow-md"
          >
            {editId === s.id ? (
              <form
                className="space-y-3"
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
                    Email
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Role
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
                </div>
                {multi && editRole === "building_manager" ? (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Building Scope
                    </label>
                    <select
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={editScopeId || buildings[0]?.id}
                      onChange={(e) => setEditScopeId(e.target.value)}
                    >
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <GhostBtn type="submit" className="flex-1">Save</GhostBtn>
                  <GhostBtn onClick={() => setEditId(null)}>Cancel</GhostBtn>
                </div>
              </form>
            ) : (
              <>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{s.name}</h3>
                    <span className="inline-flex rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium capitalize text-teal-800">
                      {s.roleTemplate.replace("_", " ")}
                    </span>
                    <p className="mt-1 text-sm text-slate-600">{s.email}</p>
                    <p className="text-sm text-slate-600">{s.phone}</p>
                    {s.buildingScopeIds?.length ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Scoped: {s.buildingScopeIds
                          .map((id) => buildings.find((b) => b.id === id)?.name ?? id)
                          .join(", ")}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">Society-wide access</p>
                    )}
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
                  <div className="flex flex-wrap gap-1">
                    {ALL_PERMISSIONS.map((p) => {
                      const on = s.permissions.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          className={`rounded-full px-2 py-1 text-[10px] font-medium transition ${
                            on
                              ? "bg-teal-700 text-white hover:bg-teal-800 cursor-pointer"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
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
                          {p.replace(".", " ")}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {s.permissions.map((p) => (
                      <span
                        key={p}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600"
                      >
                        {p.replace(".", " ")}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add Staff Form */}
      {canEdit && (
        <PageCard title="Add New Staff Member">
          <form
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
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
                placeholder="Mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Email
              </label>
              <input
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Role
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 cursor-pointer"
              >
                + Add Staff
              </button>
            </div>
            {multi && role === "building_manager" ? (
              <div className="sm:col-span-2 lg:col-span-5">
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Building Scope
                </label>
                <select
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={scopeId || buildings[0]?.id}
                  onChange={(e) => setScopeId(e.target.value)}
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </form>
        </PageCard>
      )}
    </div>
  );
}
