import type {
  ChatResponse,
  CreateDecisionPayload,
  DashboardData,
  Decision,
  MetricsData,
  RegisterPayload,
} from "./types";

export class ApiClient {
  private baseUrl: string;
  private getToken: () => Promise<string | null>;

  constructor(baseUrl: string, getToken: () => Promise<string | null>) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // Auth
  async register(data: RegisterPayload) {
    return this.fetch<{ id: string; email: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    return this.fetch<{ token: string; user: any }>("/api/auth/mobile-login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // Dashboard
  async getDashboard() {
    return this.fetch<DashboardData>("/api/dashboard");
  }

  // Decisions
  async getDecisions(status?: string, category?: string) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    return this.fetch<Decision[]>(`/api/decisions?${params}`);
  }

  async getDecision(id: string) {
    return this.fetch<Decision>(`/api/decisions/${id}`);
  }

  async createDecision(data: CreateDecisionPayload) {
    return this.fetch<Decision>("/api/decisions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async sendMessage(decisionId: string, message: string) {
    return this.fetch<ChatResponse>(`/api/decisions/${decisionId}/chat`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }

  async requestAnalysis(decisionId: string) {
    return this.fetch<Decision>(`/api/decisions/${decisionId}/analyze`, {
      method: "POST",
    });
  }

  async updateDecision(id: string, data: Partial<Decision>) {
    return this.fetch<Decision>(`/api/decisions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteDecision(id: string) {
    return this.fetch<{ success: boolean }>(`/api/decisions/${id}`, {
      method: "DELETE",
    });
  }

  // Metrics
  async getMetrics() {
    return this.fetch<MetricsData>("/api/metrics");
  }

  async addMetric(data: { name: string; value: number; unit?: string }) {
    return this.fetch("/api/metrics", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}
