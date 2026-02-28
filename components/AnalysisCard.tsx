"use client";

import type { StructuredAnalysis } from "@/lib/decision-engine/analysisGenerator";

const confidenceColors = {
  Low: "bg-red-100 text-red-800 border-red-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  High: "bg-green-100 text-green-800 border-green-200",
};

const riskColors = {
  Low: "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  High: "bg-red-50 text-red-700 border-red-200",
};

export default function AnalysisCard({
  analysis,
}: {
  analysis: StructuredAnalysis;
}) {
  return (
    <div className="space-y-5 py-2">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Decision Analysis
          </h3>
          <p className="mt-1 text-sm text-gray-700">{analysis.summary}</p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
            confidenceColors[analysis.confidence]
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              analysis.confidence === "High"
                ? "bg-green-500"
                : analysis.confidence === "Medium"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          />
          {analysis.confidence} Confidence
        </span>
      </div>

      {/* Decision Reframe */}
      {analysis.decision_reframe && (
        <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-1">
            Real Question
          </p>
          <p className="text-sm text-brand-900 font-medium">
            {analysis.decision_reframe}
          </p>
        </div>
      )}

      {/* Key Insights */}
      {analysis.key_insights?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Key Insights
          </p>
          <ul className="space-y-2">
            {analysis.key_insights.map((insight, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="mt-0.5 shrink-0 text-brand-500">→</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tradeoffs */}
      {analysis.tradeoffs?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Tradeoffs
          </p>
          <div className="space-y-2">
            {analysis.tradeoffs.map((t, i) => (
              <div
                key={i}
                className="grid grid-cols-2 gap-2 text-xs rounded-lg overflow-hidden ring-1 ring-gray-200"
              >
                <div className="bg-green-50 px-3 py-2">
                  <p className="font-semibold text-green-700 mb-0.5">Doing this</p>
                  <p className="text-green-800">{t.doing_this}</p>
                </div>
                <div className="bg-red-50 px-3 py-2">
                  <p className="font-semibold text-red-700 mb-0.5">Not doing this</p>
                  <p className="text-red-800">{t.not_doing_this}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risks */}
      {analysis.risks?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Risks
          </p>
          <div className="space-y-2">
            {analysis.risks.map((r, i) => (
              <div
                key={i}
                className={`rounded-lg border px-3 py-2.5 ${riskColors[r.likelihood]}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{r.risk}</p>
                  <span className="shrink-0 text-xs font-semibold opacity-70">
                    {r.likelihood}
                  </span>
                </div>
                <p className="text-xs mt-1 opacity-80">
                  Mitigation: {r.mitigation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Second Order Effects */}
      {analysis.second_order_effects?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Second-Order Effects
          </p>
          <ul className="space-y-1.5">
            {analysis.second_order_effects.map((effect, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="shrink-0 text-orange-400">⟳</span>
                {effect}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detected Biases */}
      {analysis.detected_biases?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Detected Reasoning Biases
          </p>
          <div className="space-y-2">
            {analysis.detected_biases.map((b, i) => (
              <div
                key={i}
                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5"
              >
                <p className="text-xs font-bold text-amber-800">{b.bias}</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Signal: {b.signal}
                </p>
                <p className="text-xs text-amber-900 font-medium mt-1.5">
                  Reframe: {b.reframe}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className="rounded-xl border-2 border-brand-300 bg-brand-50 px-4 py-4">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-2">
          Recommendation
        </p>
        <p className="text-sm font-semibold text-brand-900">
          {analysis.recommendation}
        </p>
        <p className="text-xs text-brand-700 mt-2 leading-relaxed">
          {analysis.recommendation_reasoning}
        </p>
      </div>

      {/* Confidence Reasoning */}
      {analysis.confidence_reasoning && (
        <p className="text-xs text-gray-500 italic">
          Confidence note: {analysis.confidence_reasoning}
        </p>
      )}

      {/* Next Steps */}
      {analysis.next_steps?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Next Steps
          </p>
          <ol className="space-y-1.5">
            {analysis.next_steps.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="shrink-0 font-bold text-brand-600">
                  {i + 1}.
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
