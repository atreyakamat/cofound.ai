import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LandingFAQ from "@/components/LandingFAQ";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ─── STICKY NAV ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🧠</span>
            <span className="text-xl font-bold text-brand-700 tracking-tight">CofounderAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#problem" className="hover:text-gray-900 transition-colors">Problem</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary">
              Get Started Free
            </Link>
          </div>
        </nav>
      </header>

      {/* ─── HERO ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white pt-24 pb-20 px-6">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold px-4 py-1.5 mb-6 ring-1 ring-brand-200">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            AI-Powered Decision Intelligence for Founders
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.08] tracking-tight">
            Every founder needs
            <br />
            <span className="text-brand-600">a brilliant co-founder.</span>
            <br />
            <span className="text-gray-400 font-bold">Now you have one.</span>
          </h1>
          <p className="mt-7 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            CofounderAI is an AI-powered decision partner that challenges your assumptions,
            asks the hard questions you&apos;ve been avoiding, and delivers structured
            analysis — so you stop second-guessing and start executing.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-base px-8 py-3.5 shadow-lg shadow-brand-200">
              Start Making Better Decisions →
            </Link>
            <a href="#how-it-works" className="btn-secondary text-base px-8 py-3.5">
              See How It Works
            </a>
          </div>
          <p className="mt-5 text-sm text-gray-400">Free to use · No credit card required</p>
        </div>

        {/* Chat mockup */}
        <div className="relative max-w-2xl mx-auto mt-16">
          <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200 overflow-hidden">
            {/* Fake window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-gray-400 font-medium">CofounderAI · Decision Session</span>
            </div>
            <div className="p-5 space-y-4 bg-gray-50">
              <div className="flex justify-end">
                <div className="bg-brand-600 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs shadow-sm">
                  Should I hire a full-time engineer now, or keep using contractors?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm shadow-sm ring-1 ring-gray-200">
                  <p className="font-semibold text-brand-700 mb-1 text-xs uppercase tracking-wide">CofounderAI</p>
                  Good question — but before I can give you useful analysis, I need to understand the full picture.
                  <br /><br />
                  <strong>What&apos;s driving the urgency right now?</strong> Is there a specific bottleneck in shipping speed, code quality, or is this more of a &quot;should I be thinking about this&quot; question?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-brand-600 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs shadow-sm">
                  We&apos;re moving too slowly. Contractors are flaky and don&apos;t understand the codebase.
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm shadow-sm ring-1 ring-gray-200">
                  <p className="font-semibold text-brand-700 mb-1 text-xs uppercase tracking-wide">CofounderAI</p>
                  That&apos;s a classic signal. Two follow-ups: <strong>What&apos;s your current runway?</strong> And have you validated that an FTE would fix the velocity issue, or could the problem be in your spec process?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm ring-1 ring-gray-200">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-4 left-8 right-8 h-8 bg-brand-200/30 rounded-full blur-xl" />
        </div>
      </section>

      {/* ─── STATS BAR ──────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-white py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "3–5", label: "Probing questions per decision" },
            { value: "<2s", label: "Average AI response time" },
            { value: "100%", label: "Decisions tracked & journaled" },
            { value: "$0", label: "Cost to get started" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-brand-600">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PROBLEM ────────────────────────────────────────────────── */}
      <section id="problem" className="bg-gray-950 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-4">The Problem</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Solo founders make the hardest
            <br />
            decisions <span className="text-brand-400">completely alone.</span>
          </h2>
          <p className="mt-6 text-gray-400 text-lg max-w-2xl leading-relaxed">
            When you&apos;re the only decision-maker, cognitive biases go unchecked,
            assumptions go unchallenged, and the pressure of getting it right can paralyze you.
          </p>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: "🌀",
                title: "Decision Overload",
                desc: "Founders make hundreds of strategic decisions every week — hiring, pricing, product direction, runway management. Decision fatigue is real and costly.",
              },
              {
                icon: "🪞",
                title: "No Sounding Board",
                desc: "Without a co-founder or senior advisor on demand, it&apos;s easy to confirm your existing beliefs instead of genuinely stress-testing them.",
              },
              {
                icon: "🎭",
                title: "Cognitive Biases",
                desc: "Sunk cost fallacy, optimism bias, and confirmation bias are the hidden enemies of founder decision-making — and they&apos;re invisible from the inside.",
              },
              {
                icon: "📭",
                title: "Zero Learning Loop",
                desc: "Most founders never revisit past decisions to understand why they worked or failed. Without that feedback loop, the same mistakes repeat.",
              },
            ].map((p) => (
              <div key={p.title} className="bg-gray-900 rounded-xl p-6 ring-1 ring-gray-800">
                <span className="text-2xl">{p.icon}</span>
                <h3 className="mt-3 text-lg font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-gray-400 text-sm leading-relaxed">{p.desc.replace(/&apos;/g, "'")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOLUTION INTRO ─────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-4">The Solution</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            An AI co-founder that thinks
            <br />with you, not <em>for</em> you.
          </h2>
          <p className="mt-6 text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            CofounderAI doesn&apos;t just answer questions — it asks better ones.
            It&apos;s purpose-built to uncover blind spots, challenge assumptions, and
            structure your thinking so you arrive at a decision you can defend.
          </p>
        </div>
      </section>

      {/* ─── HOW IT WORKS ───────────────────────────────────────────── */}
      <section id="how-it-works" className="py-8 pb-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-4">Process</p>
            <h2 className="text-4xl font-extrabold text-gray-900">How it works</h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              A structured 4-step loop that turns a fuzzy decision into a clear, documented choice.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                step: "01",
                icon: "💬",
                title: "Describe your decision",
                desc: "Tell CofounderAI what you're facing in plain English. No template required. Add context about your stage, constraints, or urgency.",
                example: '"Should I raise a seed round now or keep bootstrapping for 6 more months?"',
                tagClass: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
              },
              {
                step: "02",
                icon: "🔍",
                title: "Answer probing questions",
                desc: "CofounderAI asks 3–5 targeted questions to surface what actually matters. It challenges the assumptions you didn't know you were making.",
                example: '"What\'s your current MRR growth rate? Have you spoken to 3+ investors to gauge real interest?"',
                tagClass: "bg-purple-50 text-purple-700 ring-1 ring-purple-100",
              },
              {
                step: "03",
                icon: "📊",
                title: "Get a structured analysis",
                desc: "Once it has enough context, CofounderAI produces a full analysis: pros, cons, key risks with mitigations, and a clear recommendation with reasoning.",
                example: '"Recommendation: Bootstrap 3 more months — your 18% MoM growth makes you fundable by Q3 at better terms."',
                tagClass: "bg-green-50 text-green-700 ring-1 ring-green-100",
              },
              {
                step: "04",
                icon: "📓",
                title: "Track outcomes & learn",
                desc: "Every decision is logged. Come back to record what actually happened, rate the outcome, and build a personal learning library over time.",
                example: '"Decision Oct 15 → Outcome Dec 1 → Raised $500K at 2× better valuation. Outcome rating: 5/5."',
                tagClass: "bg-orange-50 text-orange-700 ring-1 ring-orange-100",
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl ring-1 ring-gray-200 p-7 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-5xl font-black text-gray-100 leading-none select-none">{item.step}</span>
                  <span className="text-3xl">{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{item.desc}</p>
                <div className={`rounded-lg p-3 text-xs font-medium italic leading-relaxed ${item.tagClass}`}>
                  {item.example}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-4">Features</p>
            <h2 className="text-4xl font-extrabold text-gray-900">Everything a co-founder would do</h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">Built for the decisions that matter at the zero-to-one stage.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🧠", title: "Bias Detection", desc: "Recognises sunk cost fallacy, optimism bias, and confirmation bias in your reasoning — and calls them out directly." },
              { icon: "🎯", title: "Decision Categories", desc: "Purpose-built context for hiring, pricing, fundraising, product, and operations decisions. The AI knows what to ask for each." },
              { icon: "📝", title: "Decision Templates", desc: "Jump-start with pre-built prompts for the most common founder decisions: first hire, pricing strategy, raise vs. bootstrap, and more." },
              { icon: "🗂️", title: "Decision Journal", desc: "Every decision is persisted with full conversation history, AI analysis, status tracking, and eventual outcome." },
              { icon: "📈", title: "Metrics Dashboard", desc: "Track MRR, burn rate, runway, customer count, and churn over time. Metrics become context for better AI recommendations." },
              { icon: "🔁", title: "Outcome Tracking", desc: "Log what actually happened after each decision. Rate it 1–5 and build a feedback loop for continuous improvement." },
              { icon: "🎤", title: "Voice Input", desc: "Speak your thoughts instead of typing. Full speech-to-text on web (Web Speech API) and mobile (native voice)." },
              { icon: "📱", title: "iOS & Android App", desc: "Native mobile app built with Expo + React Native. Full feature parity with the web app, optimised for mobile." },
              { icon: "🔒", title: "Secure & Private", desc: "Per-user data isolation, JWT auth for mobile, session auth for web. Your decisions are never shared." },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 ring-1 ring-gray-200 shadow-sm hover:ring-brand-300 hover:shadow-md transition-all">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-4 text-base font-bold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ANALYSIS PREVIEW ───────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-4">The Output</p>
              <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
                Not generic advice.
                <br />
                <span className="text-brand-600">Structured insight.</span>
              </h2>
              <p className="mt-5 text-gray-500 leading-relaxed">
                After your conversation, CofounderAI synthesises everything into a structured decision analysis — the kind a great advisor would write after a 30-minute call, delivered in seconds.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Plain-language summary of the decision",
                  "Weighted pros and cons",
                  "Key risks with specific mitigations",
                  "Clear recommendation with full reasoning",
                  "Concrete, numbered next steps",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Analysis card mockup */}
            <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-xl p-7 text-sm">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Analysis Complete</span>
              </div>
              <h4 className="font-bold text-base text-gray-900 mb-5">Hire Full-Time vs. Contractors</h4>
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Pros</p>
                <ul className="space-y-1.5">
                  {["Better codebase ownership and context", "Faster onboarding for key features", "Stronger long-term culture investment"].map((p) => (
                    <li key={p} className="flex items-start gap-2 text-gray-700"><span className="text-green-500 mt-0.5">+</span>{p}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Cons</p>
                <ul className="space-y-1.5">
                  {["~$120K/yr burn reduces runway by 5 months", "Hiring takes 6–10 weeks minimum"].map((p) => (
                    <li key={p} className="flex items-start gap-2 text-gray-700"><span className="text-red-400 mt-0.5">–</span>{p}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-brand-50 rounded-xl p-4 ring-1 ring-brand-100 mt-5">
                <p className="text-xs font-bold text-brand-700 uppercase tracking-widest mb-1">Recommendation</p>
                <p className="text-gray-800 text-sm leading-relaxed">Hire full-time, but only after closing your current sprint milestone in 3 weeks. Start the search now in parallel. Your 14-month runway comfortably absorbs the cost.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DECISION TYPES ─────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-4">Use Cases</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Built for every founder decision</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-12">Common decisions founders bring to CofounderAI every day.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "👥 First full-time hire", "💰 Pricing strategy", "🏦 Raise vs. bootstrap",
              "🛠️ Build vs. buy", "🔄 Pivot vs. persevere", "📣 Go-to-market channel",
              "🌍 Market expansion", "🤝 Co-founder decision", "⚙️ Outsource or in-house",
              "📦 Launch timing", "🎯 ICP narrowing", "📊 Metric prioritisation",
            ].map((d) => (
              <span key={d} className="rounded-full bg-white ring-1 ring-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm">
                {d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLATFORM ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-4">Platform</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-5">Available everywhere you work</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-14">
            Use it on your laptop while planning, or on your phone while walking through a tough call.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "🖥️", title: "Web App", desc: "Full-featured Next.js web app. Works in any browser. Fully responsive.", tag: "Available now", tagColor: "bg-green-100 text-green-700" },
              { icon: "📱", title: "iOS App", desc: "Native iPhone app with voice input and the full decision experience.", tag: "React Native · Expo", tagColor: "bg-blue-100 text-blue-700" },
              { icon: "🤖", title: "Android App", desc: "Native Android app with full feature parity with iOS.", tag: "React Native · Expo", tagColor: "bg-purple-100 text-purple-700" },
            ].map((p) => (
              <div key={p.title} className="bg-gray-50 rounded-2xl ring-1 ring-gray-200 p-7 text-left">
                <span className="text-4xl">{p.icon}</span>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{p.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                <span className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${p.tagColor}`}>{p.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHO IT'S FOR ────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-4">Who It&apos;s For</p>
            <h2 className="text-4xl font-extrabold">Built for a specific founder</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { emoji: "🧑‍💻", title: "Solo Technical Founders", desc: "You're great at building but need help with the business decisions: pricing, hiring, market timing, fundraising." },
              { emoji: "🚀", title: "Pre-Seed & Seed Founders", desc: "You're in the zero-to-one phase. Every decision is high-stakes, resources are scarce, and mistakes are expensive." },
              { emoji: "🤔", title: "First-Time Founders", desc: "You don't have pattern recognition yet for what good decisions look like. CofounderAI fills that gap with structured analysis." },
              { emoji: "⚡", title: "Indie Hackers & Bootstrappers", desc: "No investors, no board, no co-founder to pressure-test your ideas. CofounderAI becomes your thinking partner." },
            ].map((p) => (
              <div key={p.title} className="bg-gray-900 rounded-2xl ring-1 ring-gray-800 p-7">
                <span className="text-3xl">{p.emoji}</span>
                <h3 className="mt-4 text-lg font-bold text-white">{p.title}</h3>
                <p className="mt-2 text-gray-400 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-widest mb-4">FAQ</p>
            <h2 className="text-4xl font-extrabold text-gray-900">Common questions</h2>
          </div>
          <LandingFAQ />
        </div>
      </section>

      {/* ─── FINAL CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-brand-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Your next big decision
            <br />is worth getting right.
          </h2>
          <p className="mt-6 text-brand-100 text-lg max-w-xl mx-auto leading-relaxed">
            Stop making critical choices in isolation. Start every major decision with a structured conversation that forces clarity.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-white text-brand-700 font-bold text-base px-8 py-4 shadow-lg hover:bg-brand-50 transition-colors"
            >
              Get Started — It&apos;s Free →
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl ring-2 ring-white/40 text-white font-semibold text-base px-8 py-4 hover:bg-white/10 transition-colors"
            >
              Sign In
            </Link>
          </div>
          <p className="mt-6 text-brand-200 text-sm">No credit card · No setup fee · Free forever for core features</p>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-400 py-14 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🧠</span>
                <span className="text-white font-bold text-lg">CofounderAI</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                AI-powered decision support for solo founders and early-stage startups. Your virtual co-founder, always available.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-10 text-sm">
              <div>
                <p className="text-white font-semibold mb-4">Product</p>
                <ul className="space-y-2">
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <p className="text-white font-semibold mb-4">Account</p>
                <ul className="space-y-2">
                  <li><Link href="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
                  <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <p>© 2026 CofounderAI. Built by Atreya Kamat. Mumbai, India.</p>
            <p>Made with ❤️ for solo founders everywhere.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
