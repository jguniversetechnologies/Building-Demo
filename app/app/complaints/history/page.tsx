"use client";

import { useDemoState } from "@/lib/demo/hooks";

export default function ComplaintsHistoryPage() {
  const state = useDemoState();
  const resident = state.residents.find(
    (r) => r.id === state.session?.residentId,
  );

  const complaints = state.complaints
    .filter((c) => c.residentId === resident?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      plumbing: "Plumbing",
      electrical: "Electrical",
      cleaning: "Cleaning",
      security: "Security",
      other: "Other",
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-4 p-5">
      <h2 className="text-lg font-semibold text-slate-900">My Complaints</h2>

      {complaints.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">No complaints submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium capitalize">
                      {complaint.type}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getStatusColor(
                        complaint.status
                      )}`}
                    >
                      {complaint.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-1">
                    {getCategoryLabel(complaint.category)}
                  </p>
                  <p className="text-sm text-slate-600">{complaint.description}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                      dateStyle: "medium",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
