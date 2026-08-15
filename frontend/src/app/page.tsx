import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Play,
  Search,
  Bot,
  ShieldCheck,
  Gauge,
  FileInput,
  Zap,
  UploadCloud,
  CheckCircle,
  FileText,
  Database,
  Server,
  Cpu,
  ChevronRight,
  BarChart3,
  GitBranch,
  Lock,
  TrendingUp,
  Users,
  MessageSquare,
  BookOpen,
  Award,
  Square,

} from "lucide-react";

// ─── Typed data arrays ─────────────────────────────────────────────────────────

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Search,
    title: "Hybrid Retrieval Engine",
    description:
      "Combines BM25 keyword precision with cosine-similarity vector search on SQLite embeddings for unmatched candidate-to-job relevance.",
  },
  {
    icon: Bot,
    title: "Multi-Agent LangGraph Pipeline",
    description:
      "Parsing, skill extraction, experience scoring, and synthesis are handled by a stateful LangGraph agent graph—not a single prompt.",
  },
  {
    icon: ShieldCheck,
    title: "AI Skill Gap Analysis",
    description:
      "Automatically surfaces missing skills with priority levels (High / Medium / Low) and a personalised learning path roadmap per candidate.",
  },
  {
    icon: Gauge,
    title: "Transparent Ranking Formula",
    description:
      "Scores derive from six measurable dimensions: Semantic 40%, Skills 20%, Experience 15%, Education 10%, Projects 10%, Certs 5%.",
  },
  {
    icon: MessageSquare,
    title: "AI Mock Interview Simulator",
    description:
      "Generates technical, behavioral, coding, and project questions per candidate. Simulate answers and receive AI-graded diagnostic reviews.",
  },
  {
    icon: BarChart3,
    title: "Side-by-Side Comparison Matrix",
    description:
      "Compare candidates across all scoring dimensions in a dense data table. The Recruiter Copilot explains rankings in plain English via RAG.",
  },
];

interface Step {
  number: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Upload Resumes",
    description:
      "Upload PDF, DOCX, or TXT files. The parsing agent extracts name, skills, experience, education, and projects automatically.",
  },
  {
    number: "02",
    title: "Post a Job Opening",
    description:
      "Paste your job description. The JD agent auto-detects required skills, experience level, and education requirements.",
  },
  {
    number: "03",
    title: "AI Ranks Candidates",
    description:
      "The LangGraph pipeline scores every candidate against the job using the weighted formula and local vector embeddings.",
  },
];

interface RoleRow {
  role: string;
  access: string;
  upload: boolean;
  compare: boolean;
  manage: boolean;
}

const ROLES: RoleRow[] = [
  { role: "Admin", access: "All Candidates & Jobs", upload: true, compare: true, manage: true },
  { role: "Recruiter", access: "Dept. Candidates + All Jobs", upload: true, compare: true, manage: false },
  { role: "Hiring Manager", access: "Assigned Job Pipelines", upload: false, compare: true, manage: false },
];

interface TechItem {
  label: string;
}

const TECH: TechItem[] = [
  { label: "FastAPI" },
  { label: "LangGraph" },
  { label: "SQLite + pgvector" },
  { label: "Next.js 16" },
  { label: "Gemini / OpenAI" },
  { label: "Python 3.10+" },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function FeatureCard({ icon: Icon, title, description }: Feature) {
  return (
    <div className="group flex flex-col p-6 bg-white border border-zinc-200 rounded-xl shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-200">
      <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50 border border-blue-100 mb-4">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <h3 className="text-base font-semibold text-zinc-900 tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description, children }: Step & { children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-zinc-100">
        <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">Step {number}</span>
        <h4 className="text-base font-semibold text-zinc-900 tracking-tight mt-1">{title}</h4>
        <p className="text-sm text-zinc-500 leading-relaxed mt-1">{description}</p>
      </div>
      <div className="flex-1 p-6 bg-zinc-50 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

// ─── Landing Page ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased">

      {/* ── Sticky Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 border-b border-zinc-200 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 bg-blue-600 flex items-center justify-center rounded-lg group-hover:bg-blue-700 transition-colors">
              <Square className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-zinc-900">
              ATS Intelligence
            </span>
          </Link>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-7">
            <a href="#features" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">How it Works</a>
            <a href="#security" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Security</a>
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-3">
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:block text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors px-3 py-2"
            >
              Documentation
            </a>
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              Access Dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="max-w-3xl mx-auto space-y-7">
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <Sparkles className="h-3 w-3" />
              AI-Powered Applicant Tracking System
            </span>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.08] text-zinc-900">
              Screen smarter.<br />
              <span className="text-blue-600">Hire faster.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg text-zinc-500 leading-relaxed max-w-2xl mx-auto">
              An AI-powered resume screening platform that uses <strong className="text-zinc-700 font-semibold">LangGraph multi-agent pipelines</strong>, vector similarity, and a weighted six-dimension scoring formula to rank candidates—not keyword-match them.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="http://127.0.0.1:8000/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-md text-zinc-700 font-semibold px-7 py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4 text-blue-600" />
                View Live Demo
              </a>
            </div>
          </div>

          {/* Hero Visual — Dashboard UI Mockup */}
          <div className="mt-14 max-w-5xl mx-auto border border-zinc-200 rounded-2xl overflow-hidden shadow-xl shadow-zinc-200/60">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 h-11 bg-zinc-100 border-b border-zinc-200">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-zinc-300" />
                <div className="h-3 w-3 rounded-full bg-zinc-300" />
                <div className="h-3 w-3 rounded-full bg-zinc-300" />
              </div>
              <div className="ml-4 flex-1 flex items-center justify-center">
                <div className="bg-white border border-zinc-200 text-zinc-400 text-xs py-1 px-3 rounded-md w-56 text-center flex items-center justify-center gap-1.5">
                  <Lock className="h-3 w-3" />
                  localhost:3000/dashboard
                </div>
              </div>
            </div>

            {/* App Layout */}
            <div className="flex h-72 bg-zinc-50">
              {/* Sidebar */}
              <div className="w-52 shrink-0 border-r border-zinc-200 bg-white p-3 space-y-1">
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold px-2 mb-3">Job Openings</p>
                {["Senior Backend Eng.", "Frontend Developer", "ML Engineer"].map((job, i) => (
                  <div key={job} className={`px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${i === 0 ? "bg-blue-600 text-white" : "text-zinc-500 hover:bg-zinc-50"}`}>
                    {job}
                  </div>
                ))}
                <div className="pt-4 border-t border-zinc-100 mt-3 space-y-0.5">
                  <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold px-2 mb-2">Standings</p>
                  {[
                    { name: "Arjun Mehta", score: 91, rank: 1, color: "bg-emerald-50 text-emerald-700" },
                    { name: "Priya Sharma", score: 78, rank: 2, color: "bg-yellow-50 text-yellow-700" },
                    { name: "David Chen", score: 64, rank: 3, color: "bg-zinc-100 text-zinc-500" },
                  ].map(({ name, score, rank, color }) => (
                    <div key={name} className="flex items-center justify-between px-2 py-1.5">
                      <span className="text-[10px] text-zinc-600 truncate font-medium">{name}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${color}`}>{score}%</span>
                        <span className="text-[9px] text-zinc-400">#{rank}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Panel */}
              <div className="flex-1 p-5 space-y-4 overflow-hidden bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Arjun Mehta</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">arjun@email.com · 5 yrs exp · B.Tech CS</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold">AI Match Score</p>
                    <p className="text-2xl font-black text-blue-600 mt-0.5">91%</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Semantic", value: 94, color: "bg-blue-600" },
                    { label: "Skills", value: 88, color: "bg-violet-500" },
                    { label: "Experience", value: 90, color: "bg-emerald-500" },
                    { label: "Education", value: 85, color: "bg-sky-500" },
                    { label: "Projects", value: 92, color: "bg-pink-500" },
                    { label: "ATS Compat.", value: 95, color: "bg-amber-500" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between text-[9px]">
                        <span className="text-zinc-500">{label}</span>
                        <span className="text-zinc-700 font-semibold">{value}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-zinc-100">
                        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-[10px] text-zinc-500 leading-relaxed">
                  <span className="font-semibold text-zinc-700">AI Summary:</span> Arjun&apos;s experience with distributed systems closely matches role requirements. Skill gap: Terraform — <span className="text-blue-600 font-medium">Learning path generated.</span>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-[10px] text-zinc-400">
                    Why was candidate A ranked higher?
                  </div>
                  <div className="px-3 py-2 bg-blue-600 rounded-lg text-[10px] text-white font-semibold flex items-center gap-1 cursor-pointer">
                    <Sparkles className="h-3 w-3" /> Ask
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust / Tech Bar ──────────────────────────────────────────────── */}
        <section className="border-y border-zinc-100 bg-zinc-50">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center gap-6 md:gap-12">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest shrink-0">
              Built for enterprise scale
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {TECH.map(({ label }) => (
                <span key={label} className="text-sm font-semibold text-zinc-400 hover:text-zinc-600 transition-colors">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Core Features Grid ────────────────────────────────────────────── */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Platform Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 mb-4">
              Beyond keyword matching.
            </h2>
            <p className="text-zinc-500 text-lg leading-relaxed">
              Every feature gives recruiters deep signal, not just surface-level resume scanning.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────────────────── */}
        <section id="how-it-works" className="bg-zinc-50 border-y border-zinc-100">
          <div className="max-w-7xl mx-auto px-6 py-24">
            <div className="mb-12 text-center max-w-2xl mx-auto">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">Workflow</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 mb-4">
                From upload to hire decision.
              </h2>
              <p className="text-zinc-500 text-lg leading-relaxed">
                A three-step pipeline that turns a stack of resumes into ranked, AI-evaluated candidate profiles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <StepCard number={STEPS[0].number} title={STEPS[0].title} description={STEPS[0].description}>
                {/* Upload drag-and-drop mock */}
                <div className="w-full max-w-[200px] border-2 border-dashed border-blue-200 rounded-xl bg-white px-4 py-6 text-center">
                  <UploadCloud className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-zinc-600">Drop files here</p>
                  <p className="text-[10px] text-zinc-400 mt-1">PDF, DOCX, TXT — up to 20 MB</p>
                  <div className="mt-3 px-3 py-1.5 bg-blue-600 rounded-lg text-[10px] text-white font-semibold">
                    Browse Files
                  </div>
                </div>
              </StepCard>

              {/* Step 2 */}
              <StepCard number={STEPS[1].number} title={STEPS[1].title} description={STEPS[1].description}>
                {/* JD input mock */}
                <div className="w-full space-y-2">
                  <div className="bg-white border border-zinc-200 rounded-lg p-3 text-[10px] text-zinc-400 leading-relaxed h-16 overflow-hidden">
                    We are looking for a Senior Backend Engineer with 4+ years of experience in Python, FastAPI, and PostgreSQL…
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[10px] text-zinc-400">Engineering</div>
                    <div className="px-3 py-2 bg-blue-600 rounded-lg text-[10px] text-white font-semibold">Create Job</div>
                  </div>
                </div>
              </StepCard>

              {/* Step 3 */}
              <StepCard number={STEPS[2].number} title={STEPS[2].title} description={STEPS[2].description}>
                {/* Results mock */}
                <div className="w-full space-y-2">
                  {[
                    { name: "Arjun Mehta", score: 91, color: "text-emerald-700 bg-emerald-50" },
                    { name: "Priya Sharma", score: 78, color: "text-yellow-700 bg-yellow-50" },
                    { name: "David Chen", score: 64, color: "text-zinc-600 bg-zinc-100" },
                  ].map(({ name, score, color }, i) => (
                    <div key={name} className="flex items-center justify-between bg-white border border-zinc-200 rounded-lg px-3 py-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-zinc-400">#{i + 1}</span>
                        <span className="text-[11px] font-semibold text-zinc-700">{name}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>{score}%</span>
                    </div>
                  ))}
                </div>
              </StepCard>
            </div>

            {/* Connector arrows */}
            <div className="hidden md:flex items-center justify-center mt-8 gap-2 text-xs text-zinc-400 font-medium">
              {["Upload", "Configure", "Review Results"].map((label, i, arr) => (
                <React.Fragment key={label}>
                  <span className="px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-500 shadow-sm">{label}</span>
                  {i < arr.length - 1 && <ChevronRight className="h-4 w-4 text-zinc-300 shrink-0" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* ── Security / RBAC Section ───────────────────────────────────────── */}
        <section id="security" className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left copy */}
            <div className="space-y-6">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Access Control</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900">
                Security by Design.
              </h2>
              <p className="text-zinc-500 text-lg leading-relaxed">
                Data privacy is paramount. The platform enforces strict permission boundaries across the entire recruitment pipeline. Candidates never see each other. Hiring managers see only their assigned pipelines.
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  "API key authentication on every backend route",
                  "LLM API keys stay server-side — never exposed to clients",
                  "Offline / local mode: no candidate data leaves your machine",
                  "Isolated candidate profiles per job pipeline",
                  "Resume text parsed and stored in local SQLite only",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-zinc-600">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Role table mockup */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-zinc-800">Role Hierarchy & Permissions</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50">
                      <th className="py-3 px-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Role</th>
                      <th className="py-3 px-5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Data Access</th>
                      <th className="py-3 px-4 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">Upload</th>
                      <th className="py-3 px-4 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">Compare</th>
                      <th className="py-3 px-4 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {ROLES.map(({ role, access, upload, compare, manage }) => (
                      <tr key={role} className="bg-white hover:bg-zinc-50 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-zinc-800">{role}</td>
                        <td className="py-3.5 px-5">
                          <span className="text-xs px-2 py-1 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200 font-medium whitespace-nowrap">
                            {access}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {upload
                            ? <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                            : <span className="text-zinc-300 font-bold text-base leading-none">—</span>}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {compare
                            ? <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                            : <span className="text-zinc-300 font-bold text-base leading-none">—</span>}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {manage
                            ? <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                            : <span className="text-zinc-300 font-bold text-base leading-none">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Banner ────────────────────────────────────────────────────── */}
        <section className="bg-zinc-50 border-t border-zinc-100">
          <div className="max-w-7xl mx-auto px-6 py-20 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900">
              Ready to screen smarter?
            </h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto leading-relaxed">
              Runs entirely on your machine. No signup, no cloud dependency, no vendor lock-in. Start the FastAPI backend and open the dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                Access Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-sm text-zinc-700 font-semibold px-8 py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.071 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.579.688.481C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/></svg>
                View on GitHub
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-6 w-6 bg-blue-600 flex items-center justify-center rounded-md group-hover:bg-blue-700 transition-colors">
              <Square className="h-3 w-3 text-white fill-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-zinc-700 group-hover:text-zinc-900 transition-colors">
              ATS Intelligence
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">Privacy</a>
            <a href="#" className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">Terms</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">GitHub</a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} ATS Resume Intelligence. Built with FastAPI + LangGraph.
          </p>
        </div>
      </footer>
    </div>
  );
}
