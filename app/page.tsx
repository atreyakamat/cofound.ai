import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <span className="text-xl font-bold text-brand-700">CofounderAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary">
            Sign In
          </Link>
          <Link href="/register" className="btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-6 pt-20 pb-16">
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
          Your AI Co-Founder for
          <br />
          <span className="text-brand-600">Better Decisions</span>
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Stop second-guessing yourself. CofounderAI challenges your assumptions,
          asks the hard questions, and helps you make data-driven decisions —
          like having a brilliant co-founder on call 24/7.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/register" className="btn-primary text-lg px-8 py-3">
            Start Making Better Decisions →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "💬",
              title: "AI Sounding Board",
              desc: "Describe any decision and get probing questions that challenge your thinking and uncover blind spots.",
            },
            {
              icon: "📊",
              title: "Structured Analysis",
              desc: "Get clear pros/cons, risk assessment, and actionable recommendations — not generic advice.",
            },
            {
              icon: "📓",
              title: "Decision Journal",
              desc: "Track every decision, log outcomes, and learn from patterns over time.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-8 ring-1 ring-gray-200 shadow-sm"
            >
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        <div className="space-y-8">
          {[
            {
              step: "1",
              title: "Describe your decision",
              desc: '"Should I hire a full-time engineer or use contractors?"',
            },
            {
              step: "2",
              title: "Answer probing questions",
              desc: "CofounderAI asks about your runway, urgency, product stage, and hiring goals.",
            },
            {
              step: "3",
              title: "Get a structured analysis",
              desc: "Receive pros, cons, risks, and a clear recommendation with reasoning.",
            },
            {
              step: "4",
              title: "Track & learn",
              desc: "Log your decision, come back to record the outcome, and learn from patterns.",
            },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-5">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-600 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="bg-brand-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold">Ready to decide smarter?</h2>
          <p className="mt-3 text-brand-100 text-lg">
            Join founders who are making better decisions with AI.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-sm font-semibold text-brand-700 shadow-sm hover:bg-brand-50 transition-colors"
          >
            Get Started — Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-8 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>© 2026 CofounderAI. Built by Atreya Kamat.</p>
      </footer>
    </div>
  );
}
