"use client";

import { useState } from "react";
import {
  FlashBar,
  GhostBtn,
  PageCard,
  RowActions,
} from "@/components/demo/Shell";
import {
  formatINR,
  useDemoState,
  useFlash,
  useHasPermission,
} from "@/lib/demo/hooks";
import { addExpense, deleteExpense, updateExpense } from "@/lib/demo/store";
import { useSocietySlug } from "@/lib/demo/useSocietySlug";

export default function ExpensesPage() {
  const slug = useSocietySlug();
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  const canEdit = useHasPermission("expenses.manage");
  const { flash, ok } = useFlash();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("Maintenance");
  const [month, setMonth] = useState("2025-10");

  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState(0);
  const [editCategory, setEditCategory] = useState("");
  const [editMonth, setEditMonth] = useState("");

  if (!society) return null;
  const expenses = state.expenses.filter((e) => e.societyId === society.id);
  const monthTotal = expenses
    .filter((e) => e.month === month)
    .reduce((s, e) => s + e.amount, 0);
  const collected = state.payments
    .filter(
      (p) => p.societyId === society.id && p.createdAt.startsWith(month),
    )
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <FlashBar flash={flash} />

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Expenses
        </h2>
        <p className="text-sm text-slate-600">
          Track society expenses and monitor financial health
        </p>
      </div>

      {/* Month Tracker Card */}
      <PageCard title="Month Financial Tracker">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Select Month
            </label>
            <input
              type="month"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
          <div className="rounded-xl bg-teal-50 p-4">
            <p className="text-xs text-teal-600">Collected</p>
            <p className="mt-1 text-xl font-semibold text-teal-700">
              {formatINR(collected)}
            </p>
          </div>
          <div className="rounded-xl bg-amber-50 p-4">
            <p className="text-xs text-amber-600">Expenses</p>
            <p className="mt-1 text-xl font-semibold text-amber-700">
              {formatINR(monthTotal)}
            </p>
          </div>
          <div className={`rounded-xl p-4 ${collected - monthTotal >= 0 ? 'bg-green-50' : 'bg-rose-50'}`}>
            <p className={`text-xs ${collected - monthTotal >= 0 ? 'text-green-600' : 'text-rose-600'}`}>Net Balance</p>
            <p className={`mt-1 text-xl font-semibold ${collected - monthTotal >= 0 ? 'text-green-700' : 'text-rose-700'}`}>
              {formatINR(collected - monthTotal)}
            </p>
          </div>
        </div>
      </PageCard>

      {/* Add Expense Form */}
      {canEdit && (
        <PageCard title="Add New Expense">
          <form
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
            onSubmit={(e) => {
              e.preventDefault();
              addExpense({
                societyId: society.id,
                month,
                title,
                amount,
                category,
              });
              ok(`Added ${title}`);
              setTitle("");
              setAmount(0);
            }}
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Month
              </label>
              <input
                type="month"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Title
              </label>
              <input
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Expense description"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Amount (₹)
              </label>
              <input
                type="number"
                required
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="0"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
              >
                + Add Expense
              </button>
            </div>
            <div className="sm:col-span-4 lg:col-span-5">
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Category
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="e.g., Maintenance, Electricity, Water, Security"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </form>
        </PageCard>
      )}

      {/* Expenses List */}
      <PageCard title="All Expenses">
        {expenses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">No expenses recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="px-3 py-3 font-medium">Month</th>
                  <th className="px-3 py-3 font-medium">Title</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Amount</th>
                  {canEdit ? <th className="px-3 py-3 font-medium">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) =>
                  editId === e.id ? (
                    <tr key={e.id} className="bg-slate-50">
                      <td colSpan={5} className="p-3">
                        <form
                          className="grid gap-2 sm:grid-cols-5"
                          onSubmit={(ev) => {
                            ev.preventDefault();
                            updateExpense(e.id, {
                              title: editTitle,
                              amount: editAmount,
                              category: editCategory,
                              month: editMonth,
                            });
                            setEditId(null);
                            ok(`Updated ${editTitle}`);
                          }}
                        >
                          <input
                            type="month"
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={editMonth}
                            onChange={(ev) => setEditMonth(ev.target.value)}
                          />
                          <input
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={editTitle}
                            onChange={(ev) => setEditTitle(ev.target.value)}
                            required
                          />
                          <input
                            type="number"
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={editAmount}
                            onChange={(ev) => setEditAmount(Number(ev.target.value))}
                          />
                          <input
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            value={editCategory}
                            onChange={(ev) => setEditCategory(ev.target.value)}
                          />
                          <div className="flex gap-2">
                            <GhostBtn type="submit" className="flex-1">Save</GhostBtn>
                            <GhostBtn onClick={() => setEditId(null)}>Cancel</GhostBtn>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                      <td className="px-3 py-3">{e.month}</td>
                      <td className="px-3 py-3 font-medium">{e.title}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">
                          {e.category}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold text-amber-700">
                        {formatINR(e.amount)}
                      </td>
                      {canEdit ? (
                        <td className="px-3 py-3">
                          <RowActions>
                            <GhostBtn
                              onClick={() => {
                                setEditId(e.id);
                                setEditTitle(e.title);
                                setEditAmount(e.amount);
                                setEditCategory(e.category);
                                setEditMonth(e.month);
                              }}
                            >
                              Edit
                            </GhostBtn>
                            <GhostBtn
                              danger
                              onClick={() => {
                                deleteExpense(e.id);
                                ok(`Deleted ${e.title}`);
                              }}
                            >
                              Delete
                            </GhostBtn>
                          </RowActions>
                        </td>
                      ) : null}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </PageCard>
    </div>
  );
}
