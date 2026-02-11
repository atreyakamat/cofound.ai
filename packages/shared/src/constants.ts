export const CATEGORIES = [
  { value: "hiring", label: "Hiring", icon: "👥", desc: "Team & recruitment decisions" },
  { value: "pricing", label: "Pricing", icon: "💰", desc: "Pricing & monetization" },
  { value: "fundraising", label: "Fundraising", icon: "🏦", desc: "Funding & investor decisions" },
  { value: "product", label: "Product", icon: "🛠️", desc: "Product & feature decisions" },
  { value: "operations", label: "Operations", icon: "⚙️", desc: "Business operations" },
  { value: "other", label: "Other", icon: "🔮", desc: "Something else" },
] as const;

export const STAGES = [
  { value: "idea", label: "Idea Stage" },
  { value: "pre-seed", label: "Pre-Seed" },
  { value: "seed", label: "Seed" },
  { value: "series-a", label: "Series A" },
  { value: "growth", label: "Growth" },
] as const;

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  in_progress: { bg: "#FEF3C7", text: "#92400E" },
  decided: { bg: "#D1FAE5", text: "#065F46" },
  tracking: { bg: "#DBEAFE", text: "#1E40AF" },
  completed: { bg: "#F3F4F6", text: "#374151" },
};

export const CATEGORY_ICONS: Record<string, string> = {
  hiring: "👥",
  pricing: "💰",
  fundraising: "🏦",
  product: "🛠️",
  operations: "⚙️",
  other: "🔮",
};

export const METRIC_OPTIONS = [
  { name: "mrr", label: "Monthly Recurring Revenue", unit: "$" },
  { name: "burn_rate", label: "Monthly Burn Rate", unit: "$" },
  { name: "runway", label: "Runway", unit: "months" },
  { name: "customers", label: "Customers", unit: "count" },
  { name: "churn", label: "Churn Rate", unit: "%" },
] as const;

export const DECISION_TEMPLATES = [
  { title: "Should I hire a full-time engineer or use contractors?", category: "hiring" },
  { title: "How should I price my SaaS product?", category: "pricing" },
  { title: "Should I raise funding or bootstrap?", category: "fundraising" },
  { title: "Should I build this feature or focus on growth?", category: "product" },
  { title: "Should I pivot or persevere with my current direction?", category: "product" },
] as const;
