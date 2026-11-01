"use client";

import { useState } from "react";
import {
  FlashBar,
  GhostBtn,
  PageCard,
  RowActions,
} from "@/components/demo/Shell";
import { useDemoState, useFlash, useHasPermission } from "@/lib/demo/hooks";
import { addNotice, deleteNotice, updateNotice } from "@/lib/demo/store";
import { useSocietySlug } from "@/lib/demo/useSocietySlug";

export default function NoticesPage() {
  const slug = useSocietySlug();
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  const canEdit = useHasPermission("notices.manage");
  const { flash, ok } = useFlash();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  if (!society) return null;
  const notices = state.notices.filter((n) => n.societyId === society.id);

  return (
    <div className="space-y-4">
      <FlashBar flash={flash} />

      <PageCard title="Broadcast to residents">
        <ul className="mb-4 space-y-2">
          {notices.map((n) =>
            editId === n.id ? (
              <li
                key={n.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                <form
                  className="space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateNotice(n.id, { title: editTitle, body: editBody });
                    setEditId(null);
                    ok("Notice updated");
                  }}
                >
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                  <textarea
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    rows={3}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    required
                  />
                  <div className="flex gap-2">
                    <GhostBtn type="submit">Save</GhostBtn>
                    <GhostBtn onClick={() => setEditId(null)}>Cancel</GhostBtn>
                  </div>
                </form>
              </li>
            ) : (
              <li
                key={n.id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{n.title}</p>
                    <p className="text-sm text-slate-600">{n.body}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(n.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                  {canEdit ? (
                    <RowActions>
                      <GhostBtn
                        onClick={() => {
                          setEditId(n.id);
                          setEditTitle(n.title);
                          setEditBody(n.body);
                        }}
                      >
                        Edit
                      </GhostBtn>
                      <GhostBtn
                        danger
                        onClick={() => {
                          deleteNotice(n.id);
                          ok("Notice deleted");
                        }}
                      >
                        Delete
                      </GhostBtn>
                    </RowActions>
                  ) : null}
                </div>
              </li>
            ),
          )}
          {notices.length === 0 ? (
            <p className="text-sm text-slate-500">No notices yet.</p>
          ) : null}
        </ul>
        {canEdit ? (
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              addNotice({ societyId: society.id, title, body });
              ok(`Broadcast: ${title}`);
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