"use client";

import { useState } from "react";
import { PageCard } from "@/components/demo/Shell";
import { formatINR, useDemoState, useHasPermission } from "@/lib/demo/hooks";
import { addExpense } from "@/lib/demo/store";
import { useSocietySlug } from "@/lib/demo/useSocietySlug";

export default function ExpensesPage() {
  const slug = useSocietySlug();
  const state = useDemoState();
  const society = state.societies.find((s) => s.slug === slug);
  const canEdit = useHasPermission("expenses.manage");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState("Maintenance");
  const [month, setMonth] = useState("2025-10");

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
    <div className="space-y-4">
      <PageCard title="Month tracker">
        <div className="flex flex-wrap gap-4 text-sm">
          <label>
            Month
            <input
              type="month"
              className="ml-2 rounded-lg border border-slate-200 px-2 py-1"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </label>
          <span>
            Collected: <strong>{formatINR(collected)}</strong>
          </span>
          <span>
            Expenses: <strong>{formatINR(monthTotal)}</strong>
          </span>
          <span>
            Net: <strong>{formatINR(collected - monthTotal)}</strong>
          </span>
        </div>
      </PageCard>

      <PageCard title="Expenses">
        <ul className="mb-4 divide-y divide-slate-100">
          {expenses.map((e) => (
            <li key={e.id} className="flex justify-between py-2 text-sm">
              <span>
                {e.month} · {e.title}{" "}
                <span className="text-slate-500">({e.category})</span>
              </span>
              <span className="font-medium">{formatINR(e.amount)}</span>
            </li>
          ))}
        </ul>
        {canEdit ? (
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              addExpense({
                societyId: society.id,
                month,
                title,
                amount,
                category,
              });
              setTitle("");
              setAmount(0);
            }}
          >
            <input
              required
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="number"
              required
              className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <input
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-lg bg-teal-700 px-3 py-2 text-sm text-white"
            >
              Add expense
            </button>
          </form>
        ) : null}
      </PageCard>
    </div>
  );
}
