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
    <div className="space-y-6">
      <FlashBar flash={flash} />

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Broadcast Notices
        </h2>
        <p className="text-sm text-slate-600">
          Send announcements to all residents via the resident app
        </p>
      </div>

      {/* Add Notice Form */}
      {canEdit && (
        <PageCard title="Create New Notice">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              addNotice({ societyId: society.id, title, body });
              ok(`Broadcast: ${title}`);
              setTitle("");
              setBody("");
            }}
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Title
              </label>
              <input
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Notice headline"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Message
              </label>
              <textarea
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={4}
                placeholder="Detailed message shown on resident app home screen"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
            >
              📢 Broadcast Notice
            </button>
          </form>
        </PageCard>
      )}

      {/* Notices List */}
      <PageCard title="All Notices">
        {notices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No notices posted yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {notices.map((n) =>
              editId === n.id ? (
                <div
                  key={n.id}
                  className="rounded-xl border border-teal-200 bg-teal-50 p-4"
                >
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateNotice(n.id, { title: editTitle, body: editBody });
                      setEditId(null);
                      ok("Notice updated");
                    }}
                  >
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700">
                        Title
                      </label>
                      <input
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700">
                        Message
                      </label>
                      <textarea
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        rows={3}
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <GhostBtn type="submit" className="flex-1">Save</GhostBtn>
                      <GhostBtn onClick={() => setEditId(null)}>Cancel</GhostBtn>
                    </div>
                  </form>
                </div>
              ) : (
                <div
                  key={n.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-600 cursor-pointer hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{n.title}</h3>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-3">{n.body}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(n.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
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
                </div>
              ),
            )}
          </div>
        )}
      </PageCard>
    </div>
  );
}