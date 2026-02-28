"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import Link from "next/link";
import AnalysisCard from "@/components/AnalysisCard";
import SpeechButton from "@/components/SpeechButton";
import type { StructuredAnalysis } from "@/lib/decision-engine/analysisGenerator";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Decision {
  id: string;
  title: string;
  context: string | null;
  category: string;
  status: string;
  aiAnalysis: string | null;
  outcome: string | null;
  outcomeRating: number | null;
  messages: Message[];
  analysisData?: StructuredAnalysis;
}

const statusLabel: Record<string, { label: string; color: string }> = {
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
  decided: { label: "Decided", color: "bg-green-100 text-green-800" },
  tracking: { label: "Tracking", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-800" },
};

const categoryIcons: Record<string, string> = {
  hiring: "👥",
  pricing: "💰",
  fundraising: "🏦",
  product: "🛠️",
  operations: "⚙️",
  growth: "📈",
  pivot: "🔄",
  other: "🔮",
};

function parseAnalysis(content: string): StructuredAnalysis | null {
  try {
    if (content.startsWith("__ANALYSIS__")) {
      return JSON.parse(content.slice("__ANALYSIS__".length)) as StructuredAnalysis;
    }
    return null;
  } catch {
    return null;
  }
}

export default function DecisionPage() {
  const params = useParams();
  const router = useRouter();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [savingOutcome, setSavingOutcome] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSpeechTranscript = useCallback((text: string) => {
    setInput((prev) => (prev ? `${prev} ${text}` : text));
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    fetch(`/api/decisions/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setDecision)
      .catch(() => {
        toast.error("Decision not found");
        router.push("/decisions");
      });
  }, [params.id, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [decision?.messages?.length, sending]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = input.trim();
    setInput("");
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    setDecision((prev) =>
      prev
        ? {
            ...prev,
            messages: [
              ...prev.messages,
              { id: tempId, role: "user", content: userMsg, createdAt: new Date().toISOString() },
            ],
          }
        : null
    );

    try {
      const res = await fetch(`/api/decisions/${params.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      setDecision((prev) => {
        if (!prev) return null;
        const msgs = prev.messages.filter((m) => m.id !== tempId);
        return {
          ...prev,
          messages: [
            ...msgs,
            { id: `u-${Date.now()}`, role: "user", content: userMsg, createdAt: new Date().toISOString() },
            { id: data.aiMessage.id, role: "assistant", content: data.aiMessage.content, createdAt: new Date().toISOString() },
          ],
        };
      });
    } catch {
      toast.error("Failed to send message");
      setDecision((prev) =>
        prev ? { ...prev, messages: prev.messages.filter((m) => m.id !== tempId) } : null
      );
    } finally {
      setSending(false);
    }
  }

  async function requestAnalysis() {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/decisions/${params.id}/analyze`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setDecision(updated);
      toast.success("Analysis complete!");
    } catch {
      toast.error("Failed to generate analysis. Check your OpenAI API key.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function saveOutcome(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingOutcome(true);
    const formData = new FormData(e.currentTarget);
    const outcome = formData.get("outcome") as string;
    const rating = parseInt(formData.get("rating") as string);

    try {
      const res = await fetch(`/api/decisions/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome, outcomeRating: rating, status: "completed" }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setDecision(updated);
      setShowOutcome(false);
      toast.success("Outcome saved — great for your learning loop!");
    } catch {
      toast.error("Failed to save outcome");
    } finally {
      setSavingOutcome(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as unknown as React.FormEvent);
    }
  }

  if (!decision) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand-500" />
          <p className="text-sm">Loading decision...</p>
        </div>
      </div>
    );
  }

  const status = statusLabel[decision.status] || statusLabel.in_progress;
  const icon = categoryIcons[decision.category] || "🔮";
  const canAnalyze = decision.status === "in_progress" && decision.messages.length >= 3;
  const canLogOutcome =
    (decision.status === "decided" || decision.status === "tracking") && !decision.outcome;

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/decisions"
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <span className="text-xl">{icon}</span>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold text-gray-900 truncate">{decision.title}</h1>
            <p className="text-xs text-gray-500 capitalize">{decision.category}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
            {canAnalyze && (
              <button onClick={requestAnalysis} disabled={analyzing} className="btn-primary text-xs py-2 px-3">
                {analyzing ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 animate-spin rounded-full border border-white/50 border-t-white" />
                    Analyzing...
                  </span>
                ) : (
                  "Get Analysis →"
                )}
              </button>
            )}
            {canLogOutcome && (
              <button onClick={() => setShowOutcome(true)} className="btn-secondary text-xs py-2 px-3">
                Log Outcome
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 bg-gray-50">
        {decision.messages.map((msg) => {
          const analysisData = parseAnalysis(msg.content);
          if (analysisData) {
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="w-full max-w-2xl bg-white rounded-2xl px-5 py-4 ring-1 ring-brand-200 shadow-sm">
                  <AnalysisCard analysis={analysisData} />
                </div>
              </div>
            );
          }
          return (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="shrink-0 h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center mr-2 mt-1">
                  <span className="text-xs">🧠</span>
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.role === "user"
                    ? "bg-brand-600 text-white"
                    : "bg-white ring-1 ring-gray-200 text-gray-900"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-strong:text-gray-900">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                )}
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex justify-start">
            <div className="shrink-0 h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center mr-2">
              <span className="text-xs">🧠</span>
            </div>
            <div className="bg-white ring-1 ring-gray-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {analyzing && (
          <div className="flex justify-center py-4">
            <div className="bg-white ring-1 ring-brand-200 rounded-xl px-5 py-4 text-center max-w-sm">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Generating decision analysis...</p>
              <p className="text-xs text-gray-500 mt-1">Building context → detecting biases → structuring reasoning</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Outcome Banner ── */}
      {decision.outcome && (
        <div className="shrink-0 border-t border-green-200 bg-green-50 px-6 py-3">
          <p className="text-sm font-medium text-green-800">Outcome: {decision.outcome}</p>
          <p className="text-xs text-green-600 mt-0.5">
            Rating: {"⭐".repeat(decision.outcomeRating || 0)} ({decision.outcomeRating}/5)
          </p>
        </div>
      )}

      {/* ── Input ── */}
      {decision.status !== "completed" && (
        <div className="shrink-0 border-t border-gray-200 bg-white px-4 sm:px-6 py-4">
          <form onSubmit={sendMessage} className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input-field flex-1 resize-none"
              placeholder="Answer the questions above... (Enter to send, Shift+Enter for newline)"
              disabled={sending}
              rows={2}
            />
            <SpeechButton onTranscript={handleSpeechTranscript} disabled={sending} />
            <button type="submit" disabled={sending || !input.trim()} className="btn-primary shrink-0">
              Send
            </button>
          </form>
        </div>
      )}

      {/* ── Outcome Modal ── */}
      {showOutcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl ring-1 ring-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Log Decision Outcome</h3>
            <p className="text-sm text-gray-500 mb-5">What actually happened? This closes the learning loop.</p>
            <form onSubmit={saveOutcome} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">What actually happened?</label>
                <textarea name="outcome" required className="input-field min-h-[80px]" placeholder="Describe the actual outcome..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Outcome quality</label>
                <select name="rating" required className="input-field">
                  <option value="">Select rating...</option>
                  <option value="1">1 — Poor outcome</option>
                  <option value="2">2 — Below expectations</option>
                  <option value="3">3 — Met expectations</option>
                  <option value="4">4 — Good outcome</option>
                  <option value="5">5 — Excellent outcome</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowOutcome(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={savingOutcome} className="btn-primary flex-1">
                  {savingOutcome ? "Saving..." : "Save Outcome"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
