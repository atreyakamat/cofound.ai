"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const metricOptions = [
  { name: "mrr", label: "Monthly Recurring Revenue", unit: "$" },
  { name: "burn_rate", label: "Monthly Burn Rate", unit: "$" },
  { name: "runway", label: "Runway", unit: "months" },
  { name: "customers", label: "Customers", unit: "count" },
  { name: "churn", label: "Churn Rate", unit: "%" },
];

export default function MetricsPage() {
  const [metricsData, setMetricsData] = useState<any>({ metrics: [], grouped: {} });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState("mrr");

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    try {
      const res = await fetch("/api/metrics");
      const data = await res.json();
      setMetricsData(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMetric(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const value = formData.get("value") as string;
    const option = metricOptions.find((m) => m.name === name);

    try {
      const res = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          value: parseFloat(value),
          unit: option?.unit,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("Metric added!");
      setShowForm(false);
      fetchMetrics();
    } catch {
      toast.error("Failed to add metric");
    }
  }

  function getChartData(metricName: string) {
    const data = metricsData.grouped[metricName] || [];
    return data
      .slice()
      .reverse()
      .map((m: any) => ({
        date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: m.value,
      }));
  }

  function getLatestValue(metricName: string) {
    const data = metricsData.grouped[metricName];
    if (!data || data.length === 0) return null;
    return data[0];
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Metrics</h1>
          <p className="text-gray-600 mt-1">
            Track your key business metrics over time
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Add Metric
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {metricOptions.map((opt) => {
          const latest = getLatestValue(opt.name);
          return (
            <button
              key={opt.name}
              onClick={() => setSelectedMetric(opt.name)}
              className={`text-left bg-white rounded-xl p-5 ring-1 transition-all ${
                selectedMetric === opt.name
                  ? "ring-2 ring-brand-600"
                  : "ring-gray-200 hover:ring-gray-300"
              }`}
            >
              <p className="text-sm text-gray-500">{opt.label}</p>
              {latest ? (
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {opt.unit === "$" ? "$" : ""}
                  {latest.value.toLocaleString()}
                  {opt.unit === "%" ? "%" : ""}
                  {opt.unit === "months" ? " mo" : ""}
                </p>
              ) : (
                <p className="text-sm text-gray-400 mt-1">No data</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      {getChartData(selectedMetric).length > 1 && (
        <div className="bg-white rounded-xl ring-1 ring-gray-200 p-6 mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            {metricOptions.find((m) => m.name === selectedMetric)?.label} — Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getChartData(selectedMetric)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4c6ef5"
                strokeWidth={2}
                dot={{ fill: "#4c6ef5" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Add Metric Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Add Metric</h3>
            <form onSubmit={handleAddMetric} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Metric
                </label>
                <select name="name" required className="input-field">
                  {metricOptions.map((opt) => (
                    <option key={opt.name} value={opt.name}>
                      {opt.label} ({opt.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Value
                </label>
                <input
                  name="value"
                  type="number"
                  step="any"
                  required
                  className="input-field"
                  placeholder="e.g., 5000"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-gray-400">Loading metrics...</div>
      )}
    </div>
  );
}
