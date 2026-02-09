"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardData {
  totalDecisions: number;
  decidedCount: number;
  trackingCount: number;
  inProgressCount: number;
  avgOutcomeRating: number | null;
  recentDecisions: any[];
}

const statusColors: Record<string, string> = {
  in_progress: "bg-yellow-100 text-yellow-800",
  decided: "bg-green-100 text-green-800",
  tracking: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-800",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  const stats = [
    { name: "Total Decisions", value: data?.totalDecisions || 0, icon: "📝" },
    { name: "In Progress", value: data?.inProgressCount || 0, icon: "⏳" },
    { name: "Decided", value: data?.decidedCount || 0, icon: "✅" },
    { name: "Tracking Outcomes", value: data?.trackingCount || 0, icon: "📊" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Your decision-making command center
          </p>
        </div>
        <Link href="/decisions/new" className="btn-primary">
          💡 New Decision
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-xl p-5 ring-1 ring-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Decisions */}
      <div className="bg-white rounded-xl ring-1 ring-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Decisions
          </h2>
        </div>
        {data?.recentDecisions && data.recentDecisions.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {data.recentDecisions.map((decision: any) => (
              <li key={decision.id}>
                <Link
                  href={`/decisions/${decision.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {decision.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(decision.createdAt).toLocaleDateString()} •{" "}
                      {decision._count.messages} messages
                    </p>
                  </div>
                  <span
                    className={`ml-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      statusColors[decision.status] || statusColors.in_progress
                    }`}
                  >
                    {decision.status.replace("_", " ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 mb-4">No decisions yet</p>
            <Link href="/decisions/new" className="btn-primary">
              Make Your First Decision
            </Link>
          </div>
        )}
        {data?.recentDecisions && data.recentDecisions.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100">
            <Link
              href="/decisions"
              className="text-sm text-brand-600 hover:text-brand-500 font-medium"
            >
              View all decisions →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
