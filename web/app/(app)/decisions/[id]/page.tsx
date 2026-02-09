"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import Link from "next/link";
import VoiceInput from "@/components/VoiceInput";

// ...existing code (Message, Decision interfaces)...

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
}

export default function DecisionPage() {
  const params = useParams();
  const router = useRouter();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [input, setInput] = useState("");
  const [interimText, setInterimText] = useState("");
  const [sending, setSending] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/decisions/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
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
  }, [decision?.messages]);

  const handleVoiceTranscript = useCallback((text: string) => {
    setInput((prev) => (prev ? prev + " " + text : text));
    setInterimText("");
  }, []);

  const handleInterimTranscript = useCallback((text: string) => {
    setInterimText(text);
  }, []);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg = input;
    setInput("");
    setInterimText("");
    setSending(true);

    setDecision((prev) =>
      prev
        ? {
            ...prev,
            messages: [
              ...prev.messages,
              { id: "temp", role: "user", content: userMsg, createdAt: new Date().toISOString() },
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

      if (!res.ok) throw new Error();
      const data = await res.json();

      setDecision((prev) => {
        if (!prev) return null;
        const msgs = prev.messages.filter((m) => m.id !== "temp");
        return {
          ...prev,
          messages: [
            ...msgs,
            { id: Date.now().toString(), role: "user", content: userMsg, createdAt: new Date().toISOString() },
            { id: data.aiMessage.id, role: "assistant", content: data.aiMessage.content, createdAt: new Date().toISOString() },
          ],
        };
      });
    } catch {
      toast.error("Failed to send message");
      setDecision((prev) =>
        prev ? { ...prev, messages: prev.messages.filter((m) => m.id !== "temp") } : null
      );
    } finally {
      setSending(false);
    }
  }

  async function requestAnalysis() {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/decisions/${params.id}/analyze`, { method: "POST" });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setDecision(updated);
      toast.success("Analysis generated!");
    } catch {
      toast.error("Failed to generate analysis");
    } finally {
      setAnalyzing(false);
    }
  }

  async function saveOutcome(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const outcome = formData.get("outcome") as string;
    const rating = parseInt(formData.get("rating") as string);

    try {
      const res = await fetch(`/api/decisions/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome, outcomeRating: rating, status: "completed" }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setDecision(updated);
      setShowOutcome(false);
      toast.success("Outcome saved!");
    } catch {
      toast.error("Failed to save outcome");
    }
  }

  if (!decision) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Loading decision...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <Link href="/decisions" className="text-gray-400 hover:text-gray-600">←</Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 truncate">{decision.title}</h1>
              <p className="text-xs text-gray-500">{decision.category} • {decision.status.replace("_", " ")}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {decision.status === "in_progress" && (
            <button onClick={requestAnalysis} disabled={analyzing} className="btn-primary text-xs">
              {analyzing ? "Analyzing..." : "📊 Get Analysis"}
            </button>
          )}
          {(decision.status === "decided" || decision.status === "tracking") && !decision.outcome && (
            <button onClick={() => setShowOutcome(true)} className="btn-secondary text-xs">📝 Log Outcome</button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {decision.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === "user" ? "bg-brand-600 text-white" : "bg-white ring-1 ring-gray-200 text-gray-900"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white ring-1 ring-gray-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Outcome Modal */}
      {showOutcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Log Outcome</h3>
            <form onSubmit={saveOutcome} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">What actually happened?</label>
                <textarea name="outcome" required className="input-field min-h-[80px]" placeholder="Describe the outcome..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Rate the outcome (1-5)</label>
                <select name="rating" required className="input-field">
                  <option value="1">1 — Poor</option>
                  <option value="2">2 — Below Average</option>
                  <option value="3">3 — Average</option>
                  <option value="4">4 — Good</option>
                  <option value="5">5 — Excellent</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowOutcome(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save Outcome</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Input with Voice */}
      {decision.status !== "completed" && (
        <div className="border-t border-gray-200 bg-white px-6 py-4">
          {interimText && (
            <p className="text-xs text-gray-400 italic mb-2 px-1">🎙️ {interimText}</p>
          )}
          <form onSubmit={sendMessage} className="flex gap-2">
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              onInterimTranscript={handleInterimTranscript}
              disabled={sending}
            />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input-field flex-1"
              placeholder="Type or speak your response..."
              disabled={sending}
            />
            <button type="submit" disabled={sending || !input.trim()} className="btn-primary">
              Send
            </button>
          </form>
        </div>
      )}

      {decision.outcome && (
        <div className="border-t border-gray-200 bg-green-50 px-6 py-4">
          <p className="text-sm font-medium text-green-800">📋 Outcome: {decision.outcome}</p>
          <p className="text-xs text-green-600 mt-1">Rating: {"⭐".repeat(decision.outcomeRating || 0)}</p>
        </div>
      )}
    </div>
  );
}
