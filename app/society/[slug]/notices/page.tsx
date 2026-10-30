"use client";

import { useState } from "react";
import { PageCard } from "@/components/demo/Shell";
import { useDemoState, useHasPermission } from "@/lib/demo/hooks";
import { addNotice } from "@/lib/demo/store";
import { useSocietySlug } from "@/lib/demo/useSocietySlug";

export default function NoticesPage() {
  const slug = useSocietySlug();
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  const canEdit =
    useHasPermission("notices.manage") || state.session?.role === "super_admin";
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  if (!society) return null;
  const notices = state.notices.filter((n) => n.societyId === society.id);

  return (
    <div className="space-y-4">
      <PageCard title="Broadcast to residents (Deepak #6 — notices; chat = phase 3)">
        <ul className="mb-4 space-y-2">
          {notices.map((n) => (
            <li key={n.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="font-medium">{n.title}</p>
              <p className="text-sm text-slate-600">{n.body}</p>
              <p className="mt-1 text-xs text-slate-400">
                {new Date(n.createdAt).toLocaleString("en-IN")}
              </p>
            </li>
          ))}
        </ul>
        {canEdit ? (
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              addNotice({ societyId: society.id, title, body });
              setTitle("");
              setBody("");
            }}
          >
            <input
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Notice title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              rows={3}
              placeholder="Message shown on resident app home"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-lg bg-teal-700 px-3 py-2 text-sm text-white"
            >
              Broadcast notice
            </button>
          </form>
        ) : null}
      </PageCard>
    </div>
  );
}
