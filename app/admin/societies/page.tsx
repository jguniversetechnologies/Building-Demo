"use client";

import { useState } from "react";
import Link from "next/link";
import { PageCard } from "@/components/demo/Shell";
import { useDemoState } from "@/lib/demo/hooks";
import { createSociety } from "@/lib/demo/store";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function SocietiesPage() {
  const state = useDemoState();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [plan, setPlan] = useState<"basic" | "pro">("basic");
  const [chairmanName, setChairmanName] = useState("");
  const [chairmanPhone, setChairmanPhone] = useState("");
  const [chairmanEmail, setChairmanEmail] = useState("");
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <PageCard title="Create society">
        <p className="mb-4 text-sm text-slate-600">
          Super Admin creates the CHS account + Building <strong>Main</strong> +
          invites Chairman. Wings/flats/money stay in society console.
        </p>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
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
            setName("");
            setSlug("");
            setAddress("");
            setChairmanName("");
            setChairmanPhone("");
            setChairmanEmail("");
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
          {state.societies.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-slate-500">
                  /{s.slug} · {s.status} · {s.plan}
                </p>
              </div>
              <Link
                href={`/society/${s.slug}`}
                className="text-sm text-teal-700 hover:underline"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      </PageCard>
    </div>
  );
}
