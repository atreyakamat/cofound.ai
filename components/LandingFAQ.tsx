"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Is this just another ChatGPT wrapper?",
    a: "No. CofounderAI is purpose-built for startup decision-making with a structured questioning flow, decision persistence, outcome tracking, and a system prompt engineered specifically to challenge founder cognitive biases. Generic AI gives generic advice — CofounderAI gives founder-specific analysis.",
  },
  {
    q: "What kinds of decisions can I bring to it?",
    a: "Any high-stakes founder decision: hiring (full-time vs. contractor, first engineer, co-founder), product (build vs. buy, feature prioritization, pivot vs. persevere), fundraising (raise now vs. bootstrap, valuation, investor choice), pricing, go-to-market strategy, and operations.",
  },
  {
    q: "How is this different from asking a mentor or advisor?",
    a: "Advisors are available once a month. CofounderAI is available at 2am when you're agonizing over a decision. It never gets tired, never judges you, and always asks the questions your advisors would ask — plus ones they might miss because they don't know your full context.",
  },
  {
    q: "Does CofounderAI make the decision for me?",
    a: "No — and that's intentional. It acts as a sounding board that helps you think more clearly. The final decision is always yours. CofounderAI gives you a structured analysis, highlights risks you might not have seen, and presents a clear recommendation — but you remain in control.",
  },
  {
    q: "Is my data private?",
    a: "Your decisions are stored per-account and never shared with other users. AI analysis uses OpenAI's API (data is sent to OpenAI for processing under their data policy). For full privacy, you can self-host with Ollama as a local model — no data leaves your machine.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes. CofounderAI has a native iOS and Android app built with Expo + React Native, with the same full feature set as the web app — including voice input so you can speak your decisions hands-free.",
  },
  {
    q: "How much does it cost?",
    a: "The MVP is completely free. In the future there may be a paid tier for advanced features like pattern recognition across decisions and team collaboration. AI API costs are approximately $0.03 per decision at current OpenAI rates.",
  },
];

export default function LandingFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left"
          >
            <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
            <span
              className={`flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 transition-transform ${
                open === i ? "rotate-45" : ""
              }`}
            >
              +
            </span>
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
