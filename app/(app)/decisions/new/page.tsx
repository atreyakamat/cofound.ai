"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const categories = [
  { value: "hiring", label: "👥 Hiring", desc: "Team & recruitment decisions" },
  { value: "pricing", label: "💰 Pricing", desc: "Pricing & monetization" },
  { value: "fundraising", label: "🏦 Fundraising", desc: "Funding & investor decisions" },
  { value: "product", label: "🛠️ Product", desc: "Product & feature decisions" },
  { value: "operations", label: "⚙️ Operations", desc: "Business operations" },
  { value: "other", label: "🔮 Other", desc: "Something else" },
];

const templates = [
  { title: "Should I hire a full-time engineer or use contractors?", category: "hiring" },
  { title: "How should I price my SaaS product?", category: "pricing" },
  { title: "Should I raise funding or bootstrap?", category: "fundraising" },
  { title: "Should I build this feature or focus on growth?", category: "product" },
  { title: "Should I pivot or persevere with my current direction?", category: "product" },
];

export default function NewDecisionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [category, setCategory] = useState("other");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please describe your decision");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, context, category }),
      });

      if (!res.ok) throw new Error("Failed to create decision");

      const decision = await res.json();
      toast.success("Decision created! Let's work through it.");
      router.push(`/decisions/${decision.id}`);
    } catch (error) {
      toast.error("Something went wrong");
      setLoading(false);
    }
  }

  function useTemplate(t: (typeof templates)[0]) {
    setTitle(t.title);
    setCategory(t.category);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">New Decision</h1>
      <p className="text-gray-600 mb-8">
        Describe the decision you&apos;re facing. Your AI co-founder will ask
        probing questions to help you think it through.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`rounded-xl p-3 text-left ring-1 transition-all ${
                  category === c.value
                    ? "ring-2 ring-brand-600 bg-brand-50"
                    : "ring-gray-200 bg-white hover:ring-gray-300"
                }`}
              >
                <p className="text-sm font-medium">{c.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
            What decision are you facing?
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="e.g., Should I hire a full-time engineer or use contractors?"
            required
          />
        </div>

        {/* Context */}
        <div>
          <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-1.5">
            Additional context{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="input-field min-h-[100px]"
            placeholder="What's the background? Any constraints, deadlines, or key factors?"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
          {loading ? "Starting conversation..." : "Start Decision Session →"}
        </button>
      </form>

      {/* Templates */}
      <div className="mt-10">
        <h3 className="text-sm font-medium text-gray-500 mb-3">
          Or start with a common decision:
        </h3>
        <div className="space-y-2">
          {templates.map((t, i) => (
            <button
              key={i}
              onClick={() => useTemplate(t)}
              className="w-full text-left px-4 py-3 rounded-lg bg-white ring-1 ring-gray-200 hover:ring-brand-300 hover:bg-brand-50 transition-all text-sm text-gray-700"
            >
              {t.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
