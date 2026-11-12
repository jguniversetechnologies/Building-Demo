"use client";

import { useState } from "react";
import { useDemoState } from "@/lib/demo/hooks";
import { addComplaint } from "@/lib/demo/store";

export default function ComplaintsPage() {
  const [tab, setTab] = useState<"complaint" | "maintenance">("complaint");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const state = useDemoState();
  const resident = state.residents.find(
    (r) => r.id === state.session?.residentId,
  );

  const handleSubmit = () => {
    setError("");
    if (!category) {
      setError("Please select a category");
      return;
    }
    if (!description.trim()) {
      setError("Please describe your issue");
      return;
    }
    if (!resident) {
      setError("Please login first");
      return;
    }

    // Save complaint to store
    addComplaint({
      residentId: resident.id,
      flatId: resident.flatId,
      societyId: resident.societyId,
      type: tab,
      category,
      description,
    });

    setSubmitted(true);
    // Reset form after delay
    setTimeout(() => {
      setCategory("");
      setDescription("");
      setSubmitted(false);
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-5 py-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">
          Complaint Submitted!
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Your {tab} has been registered. We will review it shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-5">
      <h2 className="text-lg font-semibold text-slate-900">
        Raise Complaint / Request
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab("complaint")}
          className={`pb-2 text-sm font-medium ${
            tab === "complaint"
              ? "border-b-2 border-teal-600 text-teal-700"
              : "text-slate-500"
          }`}
        >
          Complaint
        </button>
        <button
          type="button"
          onClick={() => setTab("maintenance")}
          className={`pb-2 text-sm font-medium ${
            tab === "maintenance"
              ? "border-b-2 border-teal-600 text-teal-700"
              : "text-slate-500"
          }`}
        >
          Maintenance Request
        </button>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Select Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="">Select category</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="cleaning">Cleaning</option>
            <option value="security">Security</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Describe your issue...
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            placeholder="Describe the issue in detail"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Add Photo (Optional)
          </label>
          <button
            type="button"
            className="w-full rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 hover:border-teal-500 hover:text-teal-600"
          >
            📷 Upload Image
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 py-3 text-sm font-semibold text-white shadow-md transition hover:from-teal-700 hover:to-teal-800 cursor-pointer"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
