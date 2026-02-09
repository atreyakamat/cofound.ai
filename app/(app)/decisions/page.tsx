"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const statusColors: Record<string, string> = {
  in_progress: "bg-yellow-100 text-yellow-800",
  decided: "bg-green-100 text-green-800",
  tracking: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-800",
};

const categoryIcons: Record<string, string> = {
  hiring: "👥",
  pricing: "💰",
  fundraising: "🏦",
  product: "🛠️",
  operations: "⚙️",
  other: "🔮",
};

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (categoryFilter) params.set("category", categoryFilter);

    fetch(`/api/decisions?${params}`)
      .then((r) => r.json())
      .then(setDecisions)
      .finally(() => setLoading(false));
  }, [statusFilter, categoryFilter]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Decision Journal</h1>
          <p className="text-gray-600 mt-1">
            Track and learn from every decision
          </p>
        </div>
        <Link href="/decisions/new" className="btn-primary">
          💡 New Decision
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All statuses</option>
          <option value="in_progress">In Progress</option>
          <option value="decided">Decided</option>
          <option value="tracking">Tracking</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All categories</option>
          <option value="hiring">Hiring</option>
          <option value="pricing">Pricing</option>
          <option value="fundraising">Fundraising</option>
          <option value="product">Product</option>
          <option value="operations">Operations</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : decisions.length === 0 ? (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-12 text-center">
          <p className="text-4xl mb-4">📓</p>
          <p className="text-gray-500 mb-4">No decisions found</p>
          <Link href="/decisions/new" className="btn-primary">
            Start Your First Decision
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {decisions.map((d) => (
            <Link
              key={d.id}
              href={`/decisions/${d.id}`}
              className="block bg-white rounded-xl ring-1 ring-gray-200 p-5 hover:ring-brand-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{categoryIcons[d.category] || "🔮"}</span>
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {d.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(d.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    • {d._count.messages} messages
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusColors[d.status]
                  }`}
                >
                  {d.status.replace("_", " ")}
                </span>
              </div>
              {d.outcomeRating && (
                <p className="text-xs text-gray-500 mt-2">
                  Outcome: {"⭐".repeat(d.outcomeRating)}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
