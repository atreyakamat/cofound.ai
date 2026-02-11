export interface User {
  id: string;
  name: string | null;
  email: string;
  companyName?: string | null;
  industry?: string | null;
  stage?: string | null;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface Decision {
  id: string;
  title: string;
  context: string | null;
  category: string;
  status: "in_progress" | "decided" | "tracking" | "completed";
  finalDecision: string | null;
  outcome: string | null;
  outcomeRating: number | null;
  aiAnalysis: string | null;
  createdAt: string;
  updatedAt: string;
  decidedAt: string | null;
  messages: Message[];
  _count?: { messages: number };
}

export interface Metric {
  id: string;
  name: string;
  value: number;
  unit: string | null;
  date: string;
}

export interface DashboardData {
  totalDecisions: number;
  decidedCount: number;
  trackingCount: number;
  inProgressCount: number;
  avgOutcomeRating: number | null;
  recentDecisions: Decision[];
}

export interface MetricsData {
  metrics: Metric[];
  grouped: Record<string, Metric[]>;
}

export interface ChatResponse {
  userMessage: { role: string; content: string };
  aiMessage: { role: string; content: string; id: string };
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  companyName?: string;
  industry?: string;
  stage?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CreateDecisionPayload {
  title: string;
  context?: string;
  category?: string;
}
