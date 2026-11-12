"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FlashBar,
  GhostBtn,
  PageCard,
} from "@/components/demo/Shell";
import { useDemoState, useFlash } from "@/lib/demo/hooks";
import {
  createSociety,
  deleteSociety,
  updateSociety,
} from "@/lib/demo/store";
import type { Society } from "@/lib/demo/types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function SocietiesPage() {
  const state = useDemoState();
  const { flash, ok, err } = useFlash();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [plan, setPlan] = useState<"basic" | "pro">("basic");
  const [chairmanName, setChairmanName] = useState("");
  const [chairmanPhone, setChairmanPhone] = useState("");
  const [chairmanEmail, setChairmanEmail] = useState("");
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editPlan, setEditPlan] = useState<Society["plan"]>("basic");
  const [editStatus, setEditStatus] = useState<Society["status"]>("active");

  return (
    <div className="space-y-6">
      <FlashBar flash={flash} />

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Manage Societies
        </h2>
        <p className="text-sm text-slate-600">
          {state.societies.length} societies · Create new CHS accounts
        </p>
      </div>

      {/* Create Society Form */}
      <PageCard title="Create New Society">
        <p className="mb-4 text-sm text-slate-600">
          Creates the CHS account + Building <strong>Main</strong> + invites Chairman.
          Wings/flats/money stay in society console.
        </p>
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            try {
              const finalSlug = slug || slugify(name);
              const society = createSociety({
                name,
                slug: finalSlug,
                address,
                city,
                plan,
                chairmanName,
                chairmanPhone,
                chairmanEmail,
              });
              setCreatedSlug(society.slug);
              ok(`Created ${society.name}`);
              setName("");
              setSlug("");
              setAddress("");
              setChairmanName("");
              setChairmanPhone("");
              setChairmanEmail("");
            } catch (e) {
              err(e instanceof Error ? e.message : "Could not create");
            }
          }}
        >
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Society Name
            </label>
            <input
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="e.g., Green Park CHS"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug) setSlug(slugify(e.target.value));
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Slug (URL)
            </label>
            <input
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="green-park"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Address
            </label>
            <input
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Full address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              City
            </label>
            <input
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Plan
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={plan}
              onChange={(e) => setPlan(e.target.value as "basic" | "pro")}
            >
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Chairman Name
            </label>
            <input
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Full name"
              value={chairmanName}
              onChange={(e) => setChairmanName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Chairman Phone
            </label>
            <input
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Mobile number"
              value={chairmanPhone}
              onChange={(e) => setChairmanPhone(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Chairman Email
            </label>
            <input
              required
              type="email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Email address"
              value={chairmanEmail}
              onChange={(e) => setChairmanEmail(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
            >
              + Create Society
            </button>
            {createdSlug && (
              <Link
                href={`/society/${createdSlug}`}
                className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100"
              >
                Open Console →
              </Link>
            )}
          </div>
        </form>
      </PageCard>

      {/* Societies List */}
      <PageCard title="All Societies">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.societies.map((s) =>
            editId === s.id ? (
              <div key={s.id} className="rounded-xl border border-teal-200 bg-teal-50 p-4">
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateSociety(s.id, {
                      name: editName,
                      address: editAddress,
                      city: editCity,
                      plan: editPlan,
                      status: editStatus,
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
                      City
                    </label>
                    <input
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Address
                    </label>
                    <input
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700">
                        Plan
                      </label>
                      <select
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={editPlan}
                        onChange={(e) =>
                          setEditPlan(e.target.value as Society["plan"])
                        }
                      >
                        <option value="basic">Basic</option>
                        <option value="pro">Pro</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700">
                        Status
                      </label>
                      <select
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={editStatus}
                        onChange={(e) =>
                          setEditStatus(e.target.value as Society["status"])
                        }
                      >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <GhostBtn type="submit" className="flex-1">Save</GhostBtn>
                    <GhostBtn onClick={() => setEditId(null)}>Cancel</GhostBtn>
                  </div>
                </form>
              </div>
            ) : (
              <div
                key={s.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-600 hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{s.name}</h3>
                    <p className="text-sm text-slate-500">/{s.slug} · {s.city}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      s.plan === "pro"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {s.plan}
                  </span>
                  <p className="text-xs text-slate-500">{s.address}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/society/${s.slug}`}
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Open Console
                  </Link>
                  <GhostBtn
                    onClick={() => {
                      setEditId(s.id);
                      setEditName(s.name);
                      setEditAddress(s.address);
                      setEditCity(s.city);
                      setEditPlan(s.plan);
                      setEditStatus(s.status);
                    }}
                  >
                    Edit
                  </GhostBtn>
                  <GhostBtn
                    danger
                    onClick={() => {
                      deleteSociety(s.id);
                      ok(`Deleted ${s.name}`);
                    }}
                  >
                    Delete
                  </GhostBtn>
                </div>
              </div>
            ),
          )}
        </div>
      </PageCard>
    </div>
  );
}
