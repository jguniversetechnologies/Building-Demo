"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FlashBar,
  GhostBtn,
  PageCard,
  RowActions,
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
    <div className="space-y-4">
      <FlashBar flash={flash} />

      <PageCard title="Create society">
        <p className="mb-4 text-sm text-slate-600">
          Super Admin creates the CHS account + Building <strong>Main</strong> +
          invites Chairman. Wings/flats/money stay in society console.
        </p>
        <form
          className="grid gap-3 sm:grid-cols-2"
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
          <label className="text-sm">
            Society name
            <input
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug) setSlug(slugify(e.target.value));
              }}
            />
          </label>
          <label className="text-sm">
            Slug
            <input
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
            />
          </label>
          <label className="text-sm sm:col-span-2">
            Address
            <input
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>
          <label className="text-sm">
            City
            <input
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </label>
          <label className="text-sm">
            Plan
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={plan}
              onChange={(e) => setPlan(e.target.value as "basic" | "pro")}
            >
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
            </select>
          </label>
          <label className="text-sm">
            Chairman name
            <input
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={chairmanName}
              onChange={(e) => setChairmanName(e.target.value)}
            />
          </label>
          <label className="text-sm">
            Chairman phone
            <input
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={chairmanPhone}
              onChange={(e) => setChairmanPhone(e.target.value)}
            />
          </label>
          <label className="text-sm sm:col-span-2">
            Chairman email
            <input
              required
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              value={chairmanEmail}
              onChange={(e) => setChairmanEmail(e.target.value)}
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
            >
              Create society
            </button>
            {createdSlug ? (
              <p className="mt-2 text-sm text-teal-800">
                Created.{" "}
                <Link className="underline" href={`/society/${createdSlug}`}>
                  Open society console
                </Link>
              </p>
            ) : null}
          </div>
        </form>
      </PageCard>

      <PageCard title="All societies">
        <ul className="divide-y divide-slate-100">
          {state.societies.map((s) =>
            editId === s.id ? (
              <li key={s.id} className="py-3">
                <form
                  className="grid gap-2 sm:grid-cols-2"
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
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    required
                  />
                  <input
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    required
                  />
                  <select
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={editPlan}
                    onChange={(e) =>
                      setEditPlan(e.target.value as Society["plan"])
                    }
                  >
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                  </select>
                  <select
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as Society["status"])
                    }
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                  <div className="flex gap-2 sm:col-span-2">
                    <GhostBtn type="submit">Save</GhostBtn>
                    <GhostBtn onClick={() => setEditId(null)}>Cancel</GhostBtn>
                  </div>
                </form>
              </li>
            ) : (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-slate-500">
                    /{s.slug} · {s.city} · {s.status} · {s.plan}
                  </p>
                </div>
                <RowActions>
                  <Link
                    href={`/society/${s.slug}`}
                    className="rounded-md px-2 py-1 text-xs font-medium text-teal-800 hover:bg-teal-50"
                  >
                    Open
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
                </RowActions>
              </li>
            ),
          )}
        </ul>
      </PageCard>
    </div>
  );
}
