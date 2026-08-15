import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  ChevronRight,
  Search,
  Bot,
  ShieldCheck,
  Gauge,
  MessageSquare,
  BarChart3,
  UploadCloud,
  Sparkles,
  Lock,
  TrendingUp,
  Users,
  Clock,
  Zap,
  FileSearch,
  Brain,
  GitMerge,
} from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: FileSearch, title: "Hybrid Retrieval Engine", desc: "BM25 keyword precision fused with cosine-similarity vector search for unmatched candidate-to-role relevance.", bg: "bg-indigo-50 border-indigo-100", ic: "text-indigo-600" },
  { icon: Brain, title: "Multi-Agent LangGraph Pipeline", desc: "Stateful graph of specialised agents: parser, extractor, scorer, synthesiser — not a single monolithic prompt.", bg: "bg-violet-50 border-violet-100", ic: "text-violet-600" },
  { icon: ShieldCheck, title: "Skill Gap Intelligence", desc: "Surfaces missing skills by priority tier and generates a personalised learning path roadmap per candidate.", bg: "bg-rose-50 border-rose-100", ic: "text-rose-600" },
  { icon: Gauge, title: "Six-Dimension Scoring", desc: "Semantic 40 · Skills 20 · Experience 15 · Education 10 · Projects 10 · Certifications 5 — fully transparent.", bg: "bg-amber-50 border-amber-100", ic: "text-amber-600" },
  { icon: MessageSquare, title: "Mock Interview Simulator", desc: "Technical, behavioral, coding, and project questions generated per candidate. AI grades simulated answers instantly.", bg: "bg-emerald-50 border-emerald-100", ic: "text-emerald-600" },
  { icon: BarChart3, title: "Comparison Matrix + Copilot", desc: "Rank N candidates side-by-side across all dimensions. Ask the Recruiter Copilot why in plain English.", bg: "bg-sky-50 border-sky-100", ic: "text-sky-600" },
];

const STEPS = [
  { n: "01", title: "Ingest Resumes", body: "Drop PDFs, DOCX, or TXT files. The parsing agent extracts name, skills, years, education, projects, and certifications automatically.", num: "text-indigo-600 border-indigo-200 bg-indigo-50" },
  { n: "02", title: "Post a Job", body: "Paste your JD. The description agent detects required skills, experience level, and education requirements in under a second.", num: "text-violet-600 border-violet-200 bg-violet-50" },
  { n: "03", title: "AI Scores & Ranks", body: "The LangGraph pipeline evaluates every candidate against the job using the six-dimension weighted formula and local embeddings.", num: "text-pink-600 border-pink-200 bg-pink-50" },
  { n: "04", title: "Review & Decide", body: "Inspect match reports, skill gaps, resume improvements, and run the AI interview simulator — all in one dashboard.", num: "text-emerald-600 border-emerald-200 bg-emerald-50" },
];

const SCORE_WEIGHTS = [
  { label: "Semantic Match", pct: 40, color: "bg-indigo-600" },
  { label: "Skills Coverage", pct: 20, color: "bg-violet-500" },
  { label: "Experience", pct: 15, color: "bg-emerald-500" },
  { label: "Education", pct: 10, color: "bg-blue-500" },
  { label: "Projects", pct: 10, color: "bg-pink-500" },
  { label: "Certifications", pct: 5, color: "bg-amber-500" },
];

const PERMISSIONS = [
  { role: "Admin", scope: "All candidates & jobs", upload: true, compare: true, manage: true },
  { role: "Recruiter", scope: "Dept. candidates + all jobs", upload: true, compare: true, manage: false },
  { role: "Hiring Manager", scope: "Assigned pipelines only", upload: false, compare: true, manage: false },
];

const STATS = [
  { value: "40%", label: "Semantic weight", color: "bg-indigo-600" },
  { value: "6", label: "Score dimensions", color: "bg-violet-500" },
  { value: "<2s", label: "Per resume", color: "bg-emerald-500" },
  { value: "4×", label: "Interview types", color: "bg-amber-500" },
];

// ─── Landing Page ──────────────────────────────────────────────────────────────

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased">

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/98 border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-7 w-7 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-700 transition-colors">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-zinc-900 tracking-tight">ATS Intelligence</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {["#features", "#how-it-works", "#scoring", "#security"].map((href, i) => (
              <a key={href} href={href} className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                {["Features", "How it works", "Scoring", "Security"][i]}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors px-3 py-2">
              API Docs <ArrowUpRight className="h-3 w-3" />
            </a>
            <Link href="/dashboard"
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
              Open Dashboard <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      <main>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-indigo-50 via-white to-violet-50/60 border-b border-indigo-100/60">
          <div className="max-w-6xl mx-auto px-6 pt-20 pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* Left — copy */}
              <div className="space-y-8">
                <div className="space-y-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-full">
                    <Zap className="h-3 w-3" /> Production-grade AI resume screening
                  </span>
                  <h1 className="text-5xl lg:text-[3.5rem] font-black tracking-tight leading-[1.06] text-zinc-900">
                    The recruiter who<br />
                    <span className="text-indigo-600">never sleeps.</span>
                  </h1>
                  <p className="text-base text-zinc-500 leading-relaxed max-w-md">
                    Multi-agent LangGraph pipelines, vector similarity, and a transparent six-dimension scoring formula — so your team reviews signal, not noise.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/dashboard"
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-md shadow-indigo-200 transition-all">
                    Get started <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href="#how-it-works"
                    className="flex items-center justify-center gap-2 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-sm">
                    See how it works <ChevronRight className="h-4 w-4 text-zinc-400" />
                  </a>
                </div>

                {/* Trust signals */}
                <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-indigo-100">
                  {[
                    { icon: Lock, label: "Runs 100% locally", color: "text-indigo-400" },
                    { icon: Zap, label: "< 2s per resume", color: "text-violet-400" },
                    { icon: GitMerge, label: "LangGraph multi-agent", color: "text-emerald-500" },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                      <Icon className={`h-3.5 w-3.5 ${color}`} /> {label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — browser mockup */}
              <div className="relative">
                <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-100/80">
                  {/* Browser chrome */}
                  <div className="bg-zinc-100 border-b border-zinc-200 px-4 h-10 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="bg-white border border-zinc-200 rounded-md px-3 py-0.5 flex items-center gap-1.5 text-[10px] text-zinc-400 w-44 justify-center">
                        <Lock className="h-2.5 w-2.5" /> localhost:3000/dashboard
                      </div>
                    </div>
                  </div>

                  {/* App UI */}
                  <div className="flex h-64 bg-white">
                    {/* Sidebar */}
                    <div className="w-44 shrink-0 border-r border-zinc-100 bg-zinc-50 p-3 space-y-1">
                      <p className="text-[8px] text-zinc-400 uppercase tracking-widest font-bold px-2 mb-2">Jobs</p>
                      {["Senior Backend Eng.", "Frontend Dev", "ML Engineer"].map((j, i) => (
                        <div key={j} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium ${i === 0 ? "bg-indigo-600 text-white" : "text-zinc-500"}`}>{j}</div>
                      ))}
                      <div className="pt-3 border-t border-zinc-200 mt-3 space-y-0.5">
                        <p className="text-[8px] text-zinc-400 uppercase tracking-widest font-bold px-2 mb-2">Standings</p>
                        {[
                          { n: "Arjun M.", s: 91, c: "bg-emerald-100 text-emerald-700" },
                          { n: "Priya S.", s: 78, c: "bg-yellow-100 text-yellow-700" },
                          { n: "David C.", s: 63, c: "bg-zinc-200 text-zinc-500" },
                        ].map(({ n, s, c }) => (
                          <div key={n} className="flex items-center justify-between px-2 py-1">
                            <span className="text-[9px] text-zinc-600 font-medium">{n}</span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${c}`}>{s}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Main panel */}
                    <div className="flex-1 p-4 space-y-3 bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-zinc-900">Arjun Mehta</p>
                          <p className="text-[9px] text-zinc-400 mt-0.5">5 yrs · arjun@email.com</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-zinc-400 font-semibold uppercase tracking-wider">AI Score</p>
                          <p className="text-xl font-black text-indigo-600">91%</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          ["Semantic", 94, "bg-indigo-600"],
                          ["Skills", 88, "bg-violet-500"],
                          ["Experience", 90, "bg-emerald-500"],
                          ["Education", 85, "bg-blue-500"],
                        ].map(([l, v, c]) => (
                          <div key={String(l)}>
                            <div className="flex justify-between text-[8px] mb-0.5">
                              <span className="text-zinc-400">{l}</span>
                              <span className="font-semibold text-zinc-700">{v}%</span>
                            </div>
                            <div className="h-1 w-full rounded-full bg-zinc-100">
                              <div className={`h-1 rounded-full ${c}`} style={{ width: `${v}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2.5 text-[9px] text-indigo-800 leading-relaxed">
                        <span className="font-semibold">AI Summary: </span>Strong distributed systems background. Gap: Terraform. Learning path generated.
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-[9px] text-zinc-400">Why was Arjun ranked #1?</div>
                        <div className="bg-indigo-600 rounded-lg px-2.5 py-1.5 text-[9px] text-white font-semibold flex items-center gap-1">
                          <Sparkles className="h-2.5 w-2.5" /> Ask
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating stat */}
                <div className="absolute -bottom-5 -left-6 hidden lg:block bg-white border border-zinc-200 rounded-xl p-3 shadow-lg">
                  <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider">Parse latency</p>
                  <p className="text-lg font-black text-zinc-900">1.4<span className="text-xs font-normal text-zinc-400"> s</span></p>
                  <p className="text-[9px] text-emerald-600 flex items-center gap-0.5 mt-0.5"><TrendingUp className="h-2.5 w-2.5" /> Offline mode</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats strip ──────────────────────────────────────────────────── */}
        <section className="border-b border-zinc-100 bg-white">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATS.map(({ value, label, color }) => (
                <div key={label} className="flex items-center gap-3 p-4 rounded-xl border border-zinc-100 bg-zinc-50">
                  <div className={`h-2 w-2 rounded-full ${color} shrink-0`} />
                  <div>
                    <p className="text-xl font-black text-zinc-900 tracking-tight">{value}</p>
                    <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tech strip ───────────────────────────────────────────────────── */}
        <div className="border-b border-zinc-100 bg-zinc-50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-10">
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold shrink-0">Built on</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {["FastAPI", "LangGraph", "SQLite + pgvector", "Next.js 16", "Gemini / OpenAI", "Python 3.10+"].map((t) => (
                <span key={t} className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 transition-colors">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Features ─────────────────────────────────────────────────────── */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-24">
          <div className="mb-14">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Capabilities</p>
            <h2 className="text-3xl font-black tracking-tight text-zinc-900">Built for signal, not noise.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, bg, ic }) => (
              <div key={title} className="bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-md hover:border-zinc-300 transition-all group">
                <div className={`h-10 w-10 rounded-xl ${bg} border flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                  <Icon className={`h-5 w-5 ${ic}`} />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 tracking-tight mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section id="how-it-works" className="bg-gradient-to-b from-zinc-50 to-white border-y border-zinc-100">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="mb-14 text-center">
              <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-3">Workflow</p>
              <h2 className="text-3xl font-black tracking-tight text-zinc-900">From upload to hire decision.</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map(({ n, title, body, num }, i) => (
                <div key={n} className="relative flex flex-col">
                  <div className={`relative z-10 h-11 w-11 rounded-full border-2 flex items-center justify-center mb-5 shadow-sm ${num}`}>
                    <span className="text-xs font-black">{n}</span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 tracking-tight mb-2">{title}</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-4">{body}</p>

                  {/* Mini UI mock per step */}
                  {i === 0 && (
                    <div className="mt-auto border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/50 px-4 py-5 text-center">
                      <UploadCloud className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
                      <p className="text-[10px] font-medium text-zinc-500">Drop PDF, DOCX, TXT</p>
                      <div className="mt-2 bg-indigo-600 rounded-md px-3 py-1 text-[10px] text-white font-semibold inline-block">Browse</div>
                    </div>
                  )}
                  {i === 1 && (
                    <div className="mt-auto space-y-2">
                      <div className="bg-white border border-zinc-200 rounded-lg p-2.5 text-[10px] text-zinc-400 h-10 leading-relaxed">We are looking for a Senior Engineer with 4+ years…</div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-[10px] text-zinc-400">Engineering</div>
                        <div className="bg-violet-600 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-semibold">Post</div>
                      </div>
                    </div>
                  )}
                  {i === 2 && (
                    <div className="mt-auto space-y-1.5">
                      {[
                        { n: "Arjun M.", s: 91, c: "bg-emerald-100 text-emerald-700" },
                        { n: "Priya S.", s: 78, c: "bg-yellow-100 text-yellow-700" },
                        { n: "David C.", s: 63, c: "bg-zinc-100 text-zinc-500" },
                      ].map(({ n, s, c }) => (
                        <div key={n} className="flex justify-between bg-white border border-zinc-200 rounded-lg px-3 py-1.5 shadow-sm">
                          <span className="text-[10px] font-semibold text-zinc-700">{n}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${c}`}>{s}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {i === 3 && (
                    <div className="mt-auto bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="p-2.5 border-b border-zinc-100 bg-emerald-50 flex justify-between">
                        <span className="text-[9px] font-bold text-zinc-700">Arjun Mehta</span>
                        <span className="text-[10px] font-black text-emerald-600">91%</span>
                      </div>
                      <div className="p-2.5 space-y-1">
                        {[["Semantic", 94, "bg-indigo-600"], ["Skills", 88, "bg-violet-500"]].map(([l, v, c]) => (
                          <div key={String(l)}>
                            <div className="h-1 rounded-full bg-zinc-100">
                              <div className={`h-1 rounded-full ${c}`} style={{ width: `${v}%` }} />
                            </div>
                          </div>
                        ))}
                        <p className="text-[8px] text-zinc-400 pt-1">Skill gap: Terraform · <span className="text-indigo-600 font-semibold">Path generated</span></p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Scoring formula ───────────────────────────────────────────────── */}
        <section id="scoring" className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Ranking Formula</p>
              <h2 className="text-3xl font-black tracking-tight text-zinc-900">Transparent scoring.<br />No black box.</h2>
              <p className="text-zinc-500 text-base leading-relaxed">
                Every candidate receives a score from six measurable dimensions — weights tuned to prioritise semantic alignment over keyword frequency.
              </p>
              <div className="space-y-3">
                {SCORE_WEIGHTS.map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-zinc-600 font-medium">{label}</span>
                      <span className="text-zinc-900 font-bold">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-100">
                      <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct * 2.5}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Syntax-highlighted code block */}
            <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-zinc-800 border-b border-zinc-700 px-5 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs font-semibold text-zinc-400 ml-2">scoring_formula.py</span>
              </div>
              <div className="p-6 font-mono text-sm bg-zinc-900 space-y-2">
                <p className="text-zinc-500 text-xs"># Weighted six-dimension score</p>
                <p><span className="text-violet-400">def</span> <span className="text-indigo-400">compute_score</span><span className="text-zinc-400">(candidate, job):</span></p>
                <div className="pl-5 space-y-1">
                  <p className="text-zinc-400"><span className="text-amber-400">return</span> (</p>
                  <div className="pl-5 space-y-0.5">
                    <p><span className="text-zinc-500">0.40</span> <span className="text-zinc-600">*</span> <span className="text-indigo-400">semantic_sim</span><span className="text-zinc-500">(c, j)</span> <span className="text-zinc-500">+</span></p>
                    <p><span className="text-zinc-500">0.20</span> <span className="text-zinc-600">*</span> <span className="text-violet-400">skills_overlap</span><span className="text-zinc-500">(c, j)</span> <span className="text-zinc-500">+</span></p>
                    <p><span className="text-zinc-500">0.15</span> <span className="text-zinc-600">*</span> <span className="text-emerald-400">experience_match</span><span className="text-zinc-500">(c, j)</span> <span className="text-zinc-500">+</span></p>
                    <p><span className="text-zinc-500">0.10</span> <span className="text-zinc-600">*</span> <span className="text-blue-400">education_match</span><span className="text-zinc-500">(c, j)</span> <span className="text-zinc-500">+</span></p>
                    <p><span className="text-zinc-500">0.10</span> <span className="text-zinc-600">*</span> <span className="text-pink-400">project_relevance</span><span className="text-zinc-500">(c, j)</span> <span className="text-zinc-500">+</span></p>
                    <p><span className="text-zinc-500">0.05</span> <span className="text-zinc-600">*</span> <span className="text-amber-400">certifications</span><span className="text-zinc-500">(c, j)</span></p>
                  </div>
                  <p className="text-zinc-400">)</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Security ─────────────────────────────────────────────────────── */}
        <section id="security" className="border-y border-zinc-100 bg-gradient-to-br from-zinc-50 to-indigo-50/40">
          <div className="max-w-6xl mx-auto px-6 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div className="space-y-6">
                <p className="text-xs font-bold text-rose-600 uppercase tracking-widest">Access Control</p>
                <h2 className="text-3xl font-black tracking-tight text-zinc-900">Security by design.</h2>
                <p className="text-zinc-500 text-base leading-relaxed">
                  Built for internal use: data never leaves your machine, LLM keys stay server-side, and every route is API-key gated.
                </p>
                <ul className="space-y-3">
                  {[
                    { text: "Runs entirely locally — no SaaS, no cloud dependency", c: "text-emerald-500" },
                    { text: "LLM API keys server-side only, never exposed to clients", c: "text-emerald-500" },
                    { text: "SQLite storage — candidate data stays on your machine", c: "text-emerald-500" },
                    { text: "API key required on every backend route", c: "text-emerald-500" },
                    { text: "Isolated candidate profiles per job pipeline", c: "text-emerald-500" },
                  ].map(({ text, c }) => (
                    <li key={text} className="flex items-start gap-3 text-sm text-zinc-600">
                      <CheckCircle className={`h-4 w-4 ${c} shrink-0 mt-0.5`} /> {text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-zinc-100 bg-rose-50 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-rose-500" />
                  <h4 className="text-sm font-semibold text-zinc-700">Role Permission Matrix</h4>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50">
                      <th className="py-3 px-5 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Role</th>
                      <th className="py-3 px-5 text-left text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Scope</th>
                      <th className="py-3 px-4 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Upload</th>
                      <th className="py-3 px-4 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Compare</th>
                      <th className="py-3 px-4 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {PERMISSIONS.map(({ role, scope, upload, compare, manage }) => (
                      <tr key={role} className="hover:bg-zinc-50 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-zinc-800">{role}</td>
                        <td className="py-3.5 px-5">
                          <span className="text-[10px] bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-md px-2 py-1 font-medium">{scope}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">{upload ? <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" /> : <span className="text-zinc-200 font-bold">—</span>}</td>
                        <td className="py-3.5 px-4 text-center">{compare ? <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" /> : <span className="text-zinc-200 font-bold">—</span>}</td>
                        <td className="py-3.5 px-4 text-center">{manage ? <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" /> : <span className="text-zinc-200 font-bold">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="bg-indigo-600">
          <div className="max-w-6xl mx-auto px-6 py-20 text-center space-y-6">
            <h2 className="text-3xl font-black tracking-tight text-white">Ready to screen smarter?</h2>
            <p className="text-indigo-200 leading-relaxed max-w-md mx-auto">No signup. No cloud. No vendor lock-in. Start the FastAPI server and you&apos;re live in under 30 seconds.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-sm px-8 py-3.5 rounded-xl shadow-sm transition-colors">
                Open Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-700 hover:bg-indigo-800 border border-indigo-500 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-colors">
                API Reference <ArrowUpRight className="h-4 w-4 text-indigo-300" />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-6 w-6 bg-indigo-600 rounded-md flex items-center justify-center group-hover:bg-indigo-700 transition-colors">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-bold text-zinc-600">ATS Intelligence</span>
          </Link>
          <div className="flex items-center gap-6">
            {[["Privacy", "#"], ["Terms", "#"], ["GitHub", "https://github.com"], ["API Docs", "http://127.0.0.1:8000/docs"]].map(([label, href]) => (
              <a key={String(label)} href={String(href)} target={String(href).startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                className="text-[11px] text-zinc-400 hover:text-zinc-700 transition-colors font-medium">{label}</a>
            ))}
          </div>
          <p className="text-[11px] text-zinc-400">&copy; {new Date().getFullYear()} ATS Resume Intelligence</p>
        </div>
      </footer>
    </div>
  );
}
