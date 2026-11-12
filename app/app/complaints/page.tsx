"use client";

import { useState } from "react";

export default function ComplaintsPage() {
  const [tab, setTab] = useState<"complaint" | "maintenance">("complaint");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

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

        <button
          type="button"
          className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 py-3 text-sm font-semibold text-white shadow-md transition hover:from-teal-700 hover:to-teal-800"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
