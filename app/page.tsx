import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LandingFAQ from "@/components/LandingFAQ";
import Aurora from "@/components/landing/Aurora";
import Particles from "@/components/landing/Particles";
import SplitText from "@/components/landing/SplitText";
import SpotlightCard from "@/components/landing/SpotlightCard";
import TiltCard from "@/components/landing/TiltCard";
import CountUp from "@/components/landing/CountUp";
import ScrollReveal from "@/components/landing/ScrollReveal";
import MagneticButton from "@/components/landing/MagneticButton";
import InfiniteMarquee from "@/components/landing/InfiniteMarquee";
import ScrollProgress from "@/components/landing/ScrollProgress";
import { AnimatedStat, FadeStagger, FadeItem } from "@/components/landing/Animations";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const decisions = [
    "👥 First full-time hire", "💰 Pricing strategy", "🏦 Raise vs. bootstrap",
    "🛠️ Build vs. buy", "🔄 Pivot vs. persevere", "📣 Go-to-market channel",
    "🌍 Market expansion", "🤝 Co-founder split", "⚙️ Outsource or in-house",
    "📦 Launch timing", "🎯 ICP narrowing", "📊 Metric prioritisation",
    "💸 Unit economics", "🤖 AI tooling", "🗺️ Roadmap sequencing",
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <ScrollProgress />

      {/* ─── STICKY NAV ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🧠</span>
            <span className="text-xl font-black text-brand-700 tracking-tight">CofounderAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#problem" className="hover:text-gray-900 transition-colors">Problem</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#providers" className="hover:text-gray-900 transition-colors">AI Models</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary glow-pulse">
              Get Started Free
            </Link>
          </div>
        </nav>
      </header>

      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[90vh] flex flex-col items-center justify-center pt-16 pb-24 px-6 noise-overlay">
        {/* Animated Aurora background */}
        <Aurora colorStops={["#6366f1", "#8b5cf6", "#c4b5fd", "#818cf8"]} speed={0.3} />
        {/* Floating particles */}
        <Particles count={55} color="#6366f1" speed={0.25} size={1.5} />
        {/* Gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/70 via-white/40 to-white pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <ScrollReveal delay={0}>
            <div className="inline-flex items-center gap-2.5 rounded-full bg-white/90 text-brand-700 text-xs font-bold px-5 py-2 mb-8 ring-1 ring-brand-200 shadow-lg shadow-brand-100/50 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              AI-Powered Decision Intelligence · No co-founder required
            </div>
          </ScrollReveal>

          <h1 className="text-5xl sm:text-6xl lg:text-[80px] font-black text-gray-900 leading-[1.04] tracking-tight">
            <SplitText text="Every founder needs" stagger={0.022} delay={0.1} className="block" />
            <SplitText
              text="a brilliant co-founder."
              stagger={0.022}
              delay={0.5}
              className="block gradient-text mt-1"
            />
            <SplitText
              text="Now you have one."
              stagger={0.022}
              delay={0.95}
              className="block text-gray-400 mt-1"
            />
          </h1>

          <ScrollReveal delay={1.3} y={20}>
            <p className="mt-8 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              CofounderAI is a structured AI decision partner that challenges your assumptions,
              asks the hard questions, and delivers analysis — so you stop second-guessing and
              start executing.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={1.5} y={16}>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 text-white font-bold text-base px-9 py-4 shadow-xl shadow-brand-300/40 hover:bg-brand-700 transition-all hover:scale-105 active:scale-95"
                >
                  Start Making Better Decisions
                  <span className="text-brand-200">→</span>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white text-gray-700 font-semibold text-base px-9 py-4 ring-1 ring-gray-200 shadow-sm hover:ring-brand-300 hover:text-brand-700 transition-all"
                >
                  See How It Works
                </a>
              </MagneticButton>
            </div>
            <p className="mt-5 text-sm text-gray-400">Free to use · No credit card required · Works with OpenAI, Ollama & more</p>
          </ScrollReveal>
        </div>

        {/* Floating chat mockup */}
        <ScrollReveal delay={1.7} y={40} className="relative max-w-2xl w-full mx-auto mt-20 z-10">
          <div className="float bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-brand-200/30 ring-1 ring-gray-200/80 overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50/90 border-b border-gray-100">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-gray-400 font-medium">CofounderAI · Decision Session</span>
              <span className="ml-auto flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            </div>
            <div className="p-5 space-y-4 bg-gray-50/50">
              <div className="flex justify-end">
                <div className="bg-brand-600 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs shadow-sm">
                  Should I hire a full-time engineer now, or keep using contractors?
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="w-7 h-7 shrink-0 rounded-full bg-brand-100 flex items-center justify-center text-sm mt-0.5">🧠</div>
                <div className="bg-white text-gray-800 text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm shadow-sm ring-1 ring-gray-200">
                  <p className="font-semibold text-brand-700 mb-1.5 text-xs uppercase tracking-wide">CofounderAI</p>
                  Good question — but before I can give you useful analysis, I need to understand the full picture.
                  <br /><br />
                  <strong>What&apos;s driving the urgency?</strong> Is there a specific bottleneck in shipping speed, or is this more of a strategic question about scalability?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-brand-600 text-white text-sm rounded-2xl rounded-tr-sm px-4 py-3 max-w-xs shadow-sm">
                  We&apos;re moving too slowly. Contractors are flaky and don&apos;t know the codebase.
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="w-7 h-7 shrink-0 rounded-full bg-brand-100 flex items-center justify-center text-sm mt-0.5">🧠</div>
                <div className="bg-white text-gray-800 text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-sm shadow-sm ring-1 ring-gray-200">
                  <p className="font-semibold text-brand-700 mb-1.5 text-xs uppercase tracking-wide">CofounderAI</p>
                  That&apos;s a classic signal. Two follow-ups: <strong>What&apos;s your current runway?</strong> And have you ruled out that the velocity problem is in your spec process — not the contractor?
                </div>
              </div>
              <div className="flex gap-1 pl-10">
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 left-12 right-12 h-10 bg-brand-300/20 rounded-full blur-2xl" />
        </ScrollReveal>
      </section>

      {/* ─── STATS BAR ───────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-white py-14 px-6 shimmer">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <AnimatedStat value={<CountUp to={3} suffix="–5" />} label="Probing questions per decision" delay={0} />
          <AnimatedStat value={<><CountUp to={2} suffix="s" /></>} label="Average AI response time" delay={0.1} />
          <AnimatedStat value={<CountUp to={100} suffix="%" />} label="Decisions tracked and journaled" delay={0.2} />
          <AnimatedStat value="$0" label="Cost to get started" delay={0.3} />
        </div>
      </section>

      {/* ─── PROBLEM ─────────────────────────────────────────────── */}
      <section id="problem" className="relative bg-gray-950 text-white py-28 px-6 overflow-hidden">
        <Particles count={30} color="#818cf8" speed={0.2} size={1} />
        <div className="relative z-10 max-w-4xl mx-auto">
          <ScrollReveal>
            <p className="text-brand-400 text-sm font-bold uppercase tracking-widest mb-5">The Problem</p>
            <h2 className="text-4xl sm:text-5xl font-black leading-tight">
              Solo founders make the hardest decisions
              <br />
              <span className="gradient-text">completely alone.</span>
            </h2>
            <p className="mt-6 text-gray-400 text-lg max-w-2xl leading-relaxed">
              When you&apos;re the only decision-maker, cognitive biases go unchecked,
              assumptions go unchallenged, and the pressure of getting it right can paralyze you.
            </p>
          </ScrollReveal>

          <FadeStagger className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5" delay={0.1}>
            {[
              { icon: "🌀", title: "Decision Overload", desc: "Founders make hundreds of strategic decisions weekly — hiring, pricing, product direction, runway management. Decision fatigue is real and costly." },
              { icon: "🪞", title: "No Sounding Board", desc: "Without a co-founder on demand, it's easy to confirm your existing beliefs instead of genuinely stress-testing them." },
              { icon: "🎭", title: "Cognitive Biases", desc: "Sunk cost fallacy, optimism bias, and confirmation bias are the hidden enemies of founder decision-making — invisible from the inside." },
              { icon: "📭", title: "Zero Learning Loop", desc: "Most founders never revisit past decisions to understand why they worked or failed. Without that feedback loop, the same mistakes repeat." },
            ].map((p) => (
              <FadeItem key={p.title}>
                <TiltCard maxTilt={6}>
                  <div className="bg-gray-900 rounded-2xl p-7 ring-1 ring-gray-800 h-full hover:ring-brand-700/50 transition-colors">
                    <span className="text-3xl">{p.icon}</span>
                    <h3 className="mt-4 text-lg font-bold text-white">{p.title}</h3>
                    <p className="mt-2 text-gray-400 text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </TiltCard>
              </FadeItem>
            ))}
          </FadeStagger>
        </div>
      </section>

      {/* ─── SOLUTION INTRO ──────────────────────────────────────── */}
      <section className="py-28 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <p className="text-brand-600 text-sm font-bold uppercase tracking-widest mb-5">The Solution</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
              An AI co-founder that thinks
              <br />
              <span className="gradient-text">with you, not for you.</span>
            </h2>
            <p className="mt-7 text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              CofounderAI doesn&apos;t just answer questions — it asks better ones. Purpose-built to
              uncover blind spots, challenge assumptions, and structure your thinking so you arrive
              at a decision you can defend.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────── */}
      <section id="how-it-works" className="pb-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <p className="text-brand-600 text-sm font-bold uppercase tracking-widest mb-4">Process</p>
            <h2 className="text-4xl font-black text-gray-900">How it works</h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">A 4-step loop that turns a fuzzy decision into a clear documented choice.</p>
          </ScrollReveal>

          <FadeStagger className="grid grid-cols-1 md:grid-cols-2 gap-7" delay={0.05}>
            {[
              { step: "01", icon: "💬", title: "Describe your decision", desc: "Tell CofounderAI what you're facing in plain English. No template. Add context about your stage, constraints, or urgency.", example: '"Should I raise a seed round now or keep bootstrapping for 6 more months?"', color: "from-blue-50 to-indigo-50", ring: "ring-blue-100", tag: "bg-blue-50 text-blue-700 ring-blue-100" },
              { step: "02", icon: "🔍", title: "Answer probing questions", desc: "CofounderAI asks 3–5 targeted questions to surface what actually matters. It challenges the assumptions you didn't know you were making.", example: '"What\'s your current MRR growth? Have you spoken to 3+ investors to gauge real interest?"', color: "from-purple-50 to-violet-50", ring: "ring-purple-100", tag: "bg-purple-50 text-purple-700 ring-purple-100" },
              { step: "03", icon: "📊", title: "Get structured analysis", desc: "Once it has enough context, CofounderAI produces a full analysis: insights, risks with mitigations, detected biases, and a clear recommendation.", example: '"Recommendation: Bootstrap 3 more months — your 18% MoM growth makes you fundable by Q3 at better terms."', color: "from-green-50 to-emerald-50", ring: "ring-green-100", tag: "bg-green-50 text-green-700 ring-green-100" },
              { step: "04", icon: "📓", title: "Track outcomes & learn", desc: "Every decision is logged. Come back to record what actually happened, rate the outcome, and build a personal learning library over time.", example: '"Decision Oct 15 → Outcome Dec 1 → Raised $500K at 2× better valuation."', color: "from-orange-50 to-amber-50", ring: "ring-orange-100", tag: "bg-orange-50 text-orange-700 ring-orange-100" },
            ].map((item) => (
              <FadeItem key={item.step}>
                <TiltCard maxTilt={4}>
                  <div className={`relative bg-gradient-to-br ${item.color} rounded-2xl ring-1 ${item.ring} p-8 h-full overflow-hidden group hover:shadow-lg transition-all`}>
                    <span className="absolute -right-4 -top-6 text-[120px] font-black text-black/[0.04] select-none leading-none">{item.step}</span>
                    <span className="text-4xl">{item.icon}</span>
                    <h3 className="mt-5 text-xl font-bold text-gray-900">{item.title}</h3>
                    <p className="mt-3 text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                    <div className={`mt-5 rounded-xl p-3.5 text-xs font-medium italic leading-relaxed ring-1 ${item.tag}`}>
                      {item.example}
                    </div>
                  </div>
                </TiltCard>
              </FadeItem>
            ))}
          </FadeStagger>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────────────── */}
      <section id="features" className="py-28 px-6 bg-gray-950 overflow-hidden relative">
        <Particles count={20} color="#818cf8" speed={0.15} size={1} />
        <div className="relative z-10 max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <p className="text-brand-400 text-sm font-bold uppercase tracking-widest mb-4">Features</p>
            <h2 className="text-4xl font-black text-white">Everything a co-founder would do</h2>
            <p className="mt-4 text-gray-400 max-w-xl mx-auto">Built for the decisions that matter at the zero-to-one stage.</p>
          </ScrollReveal>

          <FadeStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" delay={0.06}>
            {[
              { icon: "🧠", title: "Bias Detection", desc: "Recognises sunk cost fallacy, optimism bias, and confirmation bias in your reasoning — and calls them out.", glow: "rgba(99,102,241,0.2)" },
              { icon: "🎯", title: "Decision Categories", desc: "Purpose-built context for hiring, pricing, fundraising, product, and operations. The AI knows what to ask for each.", glow: "rgba(139,92,246,0.2)" },
              { icon: "🗂️", title: "Decision Journal", desc: "Every decision persisted with full conversation history, AI analysis, status tracking, and eventual outcome.", glow: "rgba(99,102,241,0.2)" },
              { icon: "📈", title: "Metrics Dashboard", desc: "Track MRR, burn rate, runway, customer count over time. Metrics become context for better AI recommendations.", glow: "rgba(16,185,129,0.2)" },
              { icon: "🔁", title: "Outcome Tracking", desc: "Log what actually happened after each decision. Rate it 1–5 and build a feedback loop for improvement.", glow: "rgba(245,158,11,0.2)" },
              { icon: "🎤", title: "Voice Input", desc: "Speak your thoughts instead of typing. Web Speech API on browser, native voice on iOS and Android.", glow: "rgba(236,72,153,0.2)" },
              { icon: "📱", title: "iOS & Android", desc: "Native mobile app with Expo + React Native. Full feature parity with web, optimised for mobile.", glow: "rgba(59,130,246,0.2)" },
              { icon: "🤖", title: "3 AI Providers", desc: "Works with OpenAI, OpenRouter (100+ models), or Ollama locally. Switch providers in one env var.", glow: "rgba(99,102,241,0.25)" },
              { icon: "🔒", title: "Secure & Private", desc: "Per-user data isolation, JWT auth for mobile, session auth for web. Your decisions are never shared.", glow: "rgba(39,39,42,0.6)" },
            ].map((f) => (
              <FadeItem key={f.title}>
                <SpotlightCard spotlightColor={f.glow} className="bg-gray-900 rounded-2xl ring-1 ring-gray-800 p-7 h-full hover:ring-brand-700/60 transition-colors">
                  <span className="text-3xl">{f.icon}</span>
                  <h3 className="mt-4 text-base font-bold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </SpotlightCard>
              </FadeItem>
            ))}
          </FadeStagger>
        </div>
      </section>

      {/* ─── AI PROVIDERS ────────────────────────────────────────── */}
      <section id="providers" className="py-28 px-6 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-50/60 via-white to-white pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-16">
            <p className="text-brand-600 text-sm font-bold uppercase tracking-widest mb-4">AI Models</p>
            <h2 className="text-4xl font-black text-gray-900">
              Runs on{" "}
              <span className="gradient-text">any AI model</span>
            </h2>
            <p className="mt-5 text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              One env var switches your entire decision engine between providers.
              Use cloud APIs or run fully locally — no API key required.
            </p>
          </ScrollReveal>

          <FadeStagger className="grid grid-cols-1 md:grid-cols-3 gap-7" delay={0.08}>
            {[
              {
                logo: "⚡",
                name: "OpenAI",
                tag: "Default · Cloud",
                tagColor: "bg-green-100 text-green-700",
                models: ["gpt-4o (analysis)", "gpt-4o-mini (fast tasks)"],
                desc: "The default provider. Best quality-to-cost ratio for most startups. Full JSON mode support across all engine modules.",
                env: "AI_PROVIDER=openai",
                border: "ring-gray-200 hover:ring-brand-300",
              },
              {
                logo: "🌐",
                name: "OpenRouter",
                tag: "Flexible · 100+ Models",
                tagColor: "bg-purple-100 text-purple-700",
                models: ["GPT-4o", "Claude Sonnet", "Gemini 2.0", "DeepSeek R1"],
                desc: "One API key unlocks every major model. Switch between providers without changing code — just change the model name.",
                env: "AI_PROVIDER=openrouter",
                border: "ring-gray-200 hover:ring-purple-300",
              },
              {
                logo: "🦙",
                name: "Ollama",
                tag: "Local · Private · Free",
                tagColor: "bg-orange-100 text-orange-700",
                models: ["llama3.2", "qwen2.5:32b", "mistral", "deepseek-r1:8b"],
                desc: "Run the entire decision engine locally on your machine. Zero API cost, 100% private, no data leaves your device.",
                env: "AI_PROVIDER=ollama",
                border: "ring-gray-200 hover:ring-orange-300",
              },
            ].map((p) => (
              <FadeItem key={p.name}>
                <TiltCard maxTilt={5}>
                  <SpotlightCard
                    spotlightColor="rgba(99,102,241,0.08)"
                    className={`bg-white rounded-2xl ring-1 ${p.border} p-7 h-full transition-all shadow-sm hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-4xl">{p.logo}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.tagColor}`}>{p.tag}</span>
                    </div>
                    <h3 className="text-xl font-black text-gray-900">{p.name}</h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                    <div className="mt-5 space-y-1.5">
                      {p.models.map((m) => (
                        <div key={m} className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
                          {m}
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 bg-gray-950 rounded-lg px-3 py-2 font-mono text-xs text-brand-400">
                      {p.env}
                    </div>
                  </SpotlightCard>
                </TiltCard>
              </FadeItem>
            ))}
          </FadeStagger>

          <ScrollReveal delay={0.3} className="mt-10 text-center">
            <p className="text-sm text-gray-400">
              Override any model with{" "}
              <code className="bg-gray-100 rounded px-1.5 py-0.5 text-gray-700">AI_MODEL_FAST</code>
              {" "}or{" "}
              <code className="bg-gray-100 rounded px-1.5 py-0.5 text-gray-700">AI_MODEL_REASONING</code>
              {" "}— provider-agnostic.{" "}
              <a href="#" className="text-brand-600 font-semibold hover:underline">See full docs →</a>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── ANALYSIS PREVIEW ────────────────────────────────────── */}
      <section className="py-28 px-6 bg-gray-50 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <p className="text-brand-600 text-sm font-bold uppercase tracking-widest mb-5">The Output</p>
              <h2 className="text-4xl font-black text-gray-900 leading-tight">
                Not generic advice.
                <br />
                <span className="gradient-text">Structured insight.</span>
              </h2>
              <p className="mt-5 text-gray-500 leading-relaxed">
                After your conversation, CofounderAI synthesises everything into a structured
                decision analysis — the kind a great advisor would write after a 30-minute call,
                delivered in seconds.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Plain-language summary of the decision",
                  "Key insights the founder may have missed",
                  "Pros / cons trade-off grid",
                  "Risks with likelihood + specific mitigations",
                  "Second-order effects of the decision",
                  "Detected cognitive biases with reframes",
                  "Clear recommendation with full reasoning",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-black">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            {/* Analysis card mockup */}
            <ScrollReveal delay={0.2}>
              <TiltCard maxTilt={4}>
                <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-xl p-7 text-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Analysis Complete</span>
                    </div>
                    <span className="text-xs bg-brand-50 text-brand-700 font-bold px-2.5 py-1 rounded-full ring-1 ring-brand-100">High Confidence</span>
                  </div>
                  <h4 className="font-black text-base text-gray-900 mb-1">Hire Full-Time vs. Contractors</h4>
                  <p className="text-xs text-gray-400 mb-5">Hiring · High complexity · 1–3 month horizon</p>

                  <div className="bg-amber-50 rounded-xl p-4 ring-1 ring-amber-100 mb-4">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1.5">⚠ Bias Detected</p>
                    <p className="text-amber-800 text-xs leading-relaxed">Urgency bias — &quot;We need to decide this week&quot; may be self-imposed. What&apos;s the real deadline?</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-green-50 rounded-xl p-3 ring-1 ring-green-100">
                      <p className="text-xs font-bold text-green-700 mb-2">Doing this ✓</p>
                      <p className="text-xs text-gray-600">Better codebase ownership, faster onboarding</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3 ring-1 ring-red-100">
                      <p className="text-xs font-bold text-red-700 mb-2">Not doing this ✗</p>
                      <p className="text-xs text-gray-600">$120K/yr burn, 5 months less runway</p>
                    </div>
                  </div>

                  <div className="bg-brand-50 rounded-xl p-4 ring-1 ring-brand-100">
                    <p className="text-xs font-bold text-brand-700 uppercase tracking-widest mb-1.5">Recommendation</p>
                    <p className="text-gray-800 text-xs leading-relaxed">Hire full-time, but only after closing your current sprint milestone. Start the search now in parallel. Your 14-month runway comfortably absorbs the cost.</p>
                  </div>
                </div>
              </TiltCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── DECISION TYPES — Infinite Marquee ───────────────────── */}
      <section className="py-20 px-6 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <ScrollReveal>
            <p className="text-brand-600 text-sm font-bold uppercase tracking-widest mb-4">Use Cases</p>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Built for every founder decision</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Common decisions founders bring to CofounderAI every day.</p>
          </ScrollReveal>
        </div>
        <div className="space-y-4">
          <InfiniteMarquee items={decisions} speed={38} direction="left" />
          <InfiniteMarquee items={[...decisions].reverse()} speed={42} direction="right" />
        </div>
      </section>

      {/* ─── WHO IT'S FOR ────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-gray-950 text-white relative overflow-hidden">
        <Particles count={25} color="#6366f1" speed={0.2} size={1.2} />
        <div className="relative z-10 max-w-4xl mx-auto">
          <ScrollReveal className="text-center mb-14">
            <p className="text-brand-400 text-sm font-bold uppercase tracking-widest mb-4">Who It&apos;s For</p>
            <h2 className="text-4xl font-black">Built for a specific founder</h2>
          </ScrollReveal>
          <FadeStagger className="grid grid-cols-1 md:grid-cols-2 gap-6" delay={0.08}>
            {[
              { emoji: "🧑‍💻", title: "Solo Technical Founders", desc: "Great at building but need help with the business decisions: pricing, hiring, market timing, fundraising." },
              { emoji: "🚀", title: "Pre-Seed & Seed Founders", desc: "You're in the zero-to-one phase. Every decision is high-stakes, resources are scarce, and mistakes are expensive." },
              { emoji: "🤔", title: "First-Time Founders", desc: "You don't have pattern recognition yet for what good decisions look like. CofounderAI fills that gap." },
              { emoji: "⚡", title: "Indie Hackers & Bootstrappers", desc: "No investors, no board, no co-founder to pressure-test your ideas. CofounderAI becomes your thinking partner." },
            ].map((p) => (
              <FadeItem key={p.title}>
                <TiltCard maxTilt={5}>
                  <SpotlightCard spotlightColor="rgba(99,102,241,0.15)" className="bg-gray-900 rounded-2xl ring-1 ring-gray-800 p-8 h-full hover:ring-brand-700/50 transition-colors">
                    <span className="text-4xl">{p.emoji}</span>
                    <h3 className="mt-5 text-xl font-bold text-white">{p.title}</h3>
                    <p className="mt-2 text-gray-400 text-sm leading-relaxed">{p.desc}</p>
                  </SpotlightCard>
                </TiltCard>
              </FadeItem>
            ))}
          </FadeStagger>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────── */}
      <section id="faq" className="py-28 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal className="text-center mb-14">
            <p className="text-brand-600 text-sm font-bold uppercase tracking-widest mb-4">FAQ</p>
            <h2 className="text-4xl font-black text-gray-900">Common questions</h2>
          </ScrollReveal>
          <LandingFAQ />
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────────── */}
      <section className="relative py-28 px-6 overflow-hidden bg-gray-950">
        <Aurora colorStops={["#4f46e5", "#7c3aed", "#6366f1"]} speed={0.25} />
        <Particles count={40} color="#a78bfa" speed={0.3} size={1.5} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight">
              Your next big decision
              <br />
              <span className="gradient-text">is worth getting right.</span>
            </h2>
            <p className="mt-7 text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
              Stop making critical choices in isolation. Start every major decision with a
              structured conversation that forces clarity.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <MagneticButton>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white text-brand-700 font-black text-base px-10 py-4.5 shadow-2xl hover:bg-brand-50 transition-all hover:scale-105 active:scale-95"
                  style={{ paddingTop: "1.125rem", paddingBottom: "1.125rem" }}
                >
                  Get Started — It&apos;s Free
                  <span>→</span>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-2xl ring-1 ring-white/20 text-white/80 font-semibold text-base px-10 hover:bg-white/10 hover:ring-white/40 hover:text-white transition-all"
                  style={{ paddingTop: "1.125rem", paddingBottom: "1.125rem" }}
                >
                  Sign In
                </Link>
              </MagneticButton>
            </div>
            <p className="mt-7 text-gray-500 text-sm">No credit card · No setup fee · Works with Ollama locally</p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-black text-gray-400 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-2xl">🧠</span>
                <span className="text-white font-black text-lg">CofounderAI</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                AI-powered decision support for solo founders. Works with OpenAI,
                OpenRouter, and Ollama. Your virtual co-founder, always on.
              </p>
              <div className="flex gap-3 mt-5">
                {["OpenAI", "OpenRouter", "Ollama"].map((p) => (
                  <span key={p} className="text-xs bg-gray-900 text-gray-400 px-2.5 py-1 rounded-full ring-1 ring-gray-800">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-12 text-sm">
              <div>
                <p className="text-white font-bold mb-4">Product</p>
                <ul className="space-y-2.5">
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#providers" className="hover:text-white transition-colors">AI Models</a></li>
                  <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <p className="text-white font-bold mb-4">Account</p>
                <ul className="space-y-2.5">
                  <li><Link href="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
                  <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-700">
            <p>© 2026 CofounderAI. Built by Atreya Kamat. Mumbai, India.</p>
            <p>Made with ❤️ for solo founders everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

