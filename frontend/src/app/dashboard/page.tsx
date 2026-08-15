"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Briefcase,
  UploadCloud,
  FileText,
  Award,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Sparkles,
  Activity,
  Users,
  ListOrdered,
  TrendingUp,
  Clock,
  Terminal,
  MessageSquareCode,
  Cpu,
  Search,
  ChevronDown,
  ChevronUp,
  GitBranch,
  Target,
  Zap,
  BookMarked,
  Code2,
  ArrowLeft,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Candidate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience_years: number;
  education?: string;
  certifications?: string[];
  projects?: string[];
  created_at: string;
}

interface Job {
  id: string;
  title: string;
  department?: string;
  raw_text: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_years: number;
  education?: string;
  created_at: string;
}

interface MatchResult {
  match_id: string;
  candidate: {
    candidate_id: string;
    name: string;
    email?: string;
    phone?: string;
    skills: string[];
    experience_years: number;
    education?: string;
    certifications: string[];
    projects: string[];
  };
  job_id: string;
  overall_score: number;
  semantic_match_score: number;
  skills_match_score: number;
  experience_match_score: number;
  education_match_score: number;
  projects_score: number;
  certifications_score: number;
  ats_compatibility_score: number;
  gap_analysis: {
    missing_skills: string[];
    priority: string;
    recommended_learning_path: string[];
  };
  resume_improvement: {
    before: string;
    after: string;
    rationale: string;
  }[];
  ai_summary: string;
  interview_questions: {
    technical: string[];
    behavioral: string[];
    coding: string[];
    project: string[];
  };
}

interface Analytics {
  total_resumes: number;
  total_jobs: number;
  average_score: number;
  parsing_latency_ms: number;
  token_usage: number;
  recent_activity: {
    id: string;
    type: string;
    message: string;
    time: string;
  }[];
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const v = Math.round(score || 0);
  const color =
    v >= 80
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : v >= 60
      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
      : "bg-zinc-100 text-zinc-500 border-zinc-200";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}>
      {v}%
    </span>
  );
}

function StatMiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.min(100, Math.round(value || 0));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-500 font-medium">{label}</span>
        <span className="text-zinc-800 font-semibold">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-zinc-100">
        <div className={`h-1.5 rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function InterviewQuestionBlock({
  category, icon: Icon, questions, onSimulate, activeQuestion, simulatedAnswer, simulationFeedback, isSimulating,
}: {
  category: string; icon: any; questions: string[];
  onSimulate: (cat: string, q: string) => void;
  activeQuestion: { category: string; question: string } | null;
  simulatedAnswer: string; simulationFeedback: string; isSimulating: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? questions : questions.slice(0, 2);
  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 p-3 border-b border-zinc-100 bg-zinc-50">
        <Icon className="h-4 w-4 text-indigo-600" />
        <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">{category}</span>
        <span className="ml-auto text-[10px] text-zinc-400">{questions.length} Q</span>
      </div>
      <div className="divide-y divide-zinc-100">
        {visible.map((q, i) => {
          const isActive = activeQuestion?.category === category && activeQuestion?.question === q;
          return (
            <div key={i}>
              <button
                onClick={() => onSimulate(category, q)}
                className="w-full text-left px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors flex items-start justify-between gap-3"
              >
                <span className="leading-snug">{q}</span>
                <Cpu className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
              </button>
              {isActive && (
                <div className="px-4 pb-4 space-y-3">
                  {isSimulating ? (
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="h-3 w-3 rounded-full border border-indigo-500 border-t-transparent animate-spin" />
                      Generating simulated response…
                    </div>
                  ) : (
                    <>
                      {simulatedAnswer && (
                        <div className="text-xs text-zinc-700 bg-zinc-50 rounded-lg p-3 border border-zinc-200 leading-relaxed">
                          <p className="text-[10px] text-indigo-600 font-semibold mb-1 uppercase tracking-wider">Simulated Answer</p>
                          {simulatedAnswer}
                        </div>
                      )}
                      {simulationFeedback && (
                        <div className="text-xs text-emerald-700 bg-emerald-50 rounded-lg p-3 border border-emerald-200 leading-relaxed">
                          <p className="text-[10px] font-semibold mb-1 uppercase tracking-wider">AI Review</p>
                          {simulationFeedback}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {questions.length > 2 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-xs text-indigo-600 font-medium flex items-center justify-center gap-1 py-2.5 hover:bg-zinc-50 transition-colors border-t border-zinc-100"
        >
          {expanded ? <><ChevronUp className="h-3 w-3" />Show less</> : <><ChevronDown className="h-3 w-3" />Show {questions.length - 2} more</>}
        </button>
      )}
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function ATSDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "recruiter" | "candidate">("dashboard");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [screenedCandidates, setScreenedCandidates] = useState<any[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [matchDetail, setMatchDetail] = useState<MatchResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDept, setJobDept] = useState("");
  const [jobText, setJobText] = useState("");
  const [jobExp, setJobExp] = useState(2);
  const [jobEdu, setJobEdu] = useState("Bachelor's");
  const [showJobModal, setShowJobModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isScreening, setIsScreening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeQuestion, setActiveQuestion] = useState<{ category: string; question: string } | null>(null);
  const [simulatedAnswer, setSimulatedAnswer] = useState<string>("");
  const [simulationFeedback, setSimulationFeedback] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [copilotQuery, setCopilotQuery] = useState("");
  const [copilotResponse, setCopilotResponse] = useState("");
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);
  const [candidateDetail, setCandidateDetail] = useState<Candidate | null>(null);
  const [candidateJobId, setCandidateJobId] = useState<string>("");
  const [candidateMatch, setCandidateMatch] = useState<MatchResult | null>(null);
  const [isCandidateScreening, setIsCandidateScreening] = useState(false);

  const intVal = (val: any) => Math.round(val || 0);

  const refreshData = async () => {
    try {
      const [rJobs, rCands, rStats] = await Promise.all([
        fetch(`${API_BASE}/api/jobs`),
        fetch(`${API_BASE}/api/candidates`),
        fetch(`${API_BASE}/api/analytics`),
      ]);
      const jobsData: Job[] = await rJobs.json();
      setJobs(jobsData);
      if (jobsData.length > 0 && !selectedJobId) setSelectedJobId(jobsData[0].id);
      setCandidates(await rCands.json());
      setAnalytics(await rStats.json());
    } catch (e) { console.error("Backend connection error:", e); }
  };

  useEffect(() => { refreshData(); }, []);
  useEffect(() => {
    if (selectedJobId) { fetchRankedCandidates(selectedJobId); setMatchDetail(null); setComparisonResult(null); }
  }, [selectedJobId]);

  const fetchRankedCandidates = async (jobId: string) => {
    try { const res = await fetch(`${API_BASE}/api/jobs/${jobId}/candidates`); setScreenedCandidates(await res.json()); }
    catch (e) { console.error(e); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(e.target.files)) {
        const fd = new FormData(); fd.append("file", file);
        await fetch(`${API_BASE}/api/resumes/upload`, { method: "POST", body: fd });
      }
      await refreshData();
      if (selectedJobId) fetchRankedCandidates(selectedJobId);
    } catch (err) { console.error(err); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobText) return;
    try {
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: jobTitle, department: jobDept || "Engineering", raw_text: jobText, experience_years: jobExp, education: jobEdu }),
      });
      const newJob = await res.json();
      setJobs((prev) => [newJob, ...prev]);
      setSelectedJobId(newJob.id);
      setShowJobModal(false); setJobTitle(""); setJobDept(""); setJobText("");
      refreshData();
    } catch (err) { console.error(err); }
  };

  const handleSelectCandidate = async (candidateId: string) => {
    if (!selectedJobId) return;
    setIsScreening(true); setSelectedCandidateId(candidateId);
    setActiveQuestion(null); setSimulatedAnswer(""); setSimulationFeedback("");
    try {
      const fd = new FormData(); fd.append("candidate_id", candidateId); fd.append("job_id", selectedJobId);
      const res = await fetch(`${API_BASE}/api/screen`, { method: "POST", body: fd });
      setMatchDetail(await res.json());
    } catch (e) { console.error(e); }
    finally { setIsScreening(false); }
  };

  const handleToggleCompare = (id: string) =>
    setSelectedCompareIds((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

  const handleCompareTrigger = async () => {
    if (selectedCompareIds.length < 2) return;
    try {
      const p = new URLSearchParams(); p.append("job_id", selectedJobId);
      selectedCompareIds.forEach((id) => p.append("candidate_ids", id));
      const res = await fetch(`${API_BASE}/api/compare?${p.toString()}`);
      setComparisonResult(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleSimulateAnswer = async (category: string, question: string) => {
    setIsSimulating(true); setSimulatedAnswer(""); setSimulationFeedback("");
    setActiveQuestion({ category, question });
    await new Promise((r) => setTimeout(r, 1400));
    const answers: Record<string, [string, string]> = {
      technical: ["In Kubernetes, containers are exposed via Services and coreDNS handles service discovery. Ingress controllers manage L7 routing. Network policies enforce namespace isolation.", "Grade: A. Strong conceptual knowledge of Kubernetes networking and security isolation."],
      behavioral: ["I identified a database deadlock under concurrent writes by analysing slow-query logs. I optimised index patterns and introduced connection pooling, reducing p99 latency by 38%.", "Grade: A+. Excellent STAR format with measurable outcome. Shows methodical debugging."],
      coding: ["A sliding-window rate limiter stores request timestamps in a Redis sorted set. Prune entries older than the window, check cardinality against threshold, return HTTP 429 if exceeded.", "Grade: B+. Algorithm is sound. Mention distributed locking or token-bucket tradeoffs for an A."],
      project: ["For our Fraud Detection System we aggregated real-time transaction features, computed anomaly scores via isolation forest, and stored alerts in PostgreSQL for analyst review. FPR dropped 22%.", "Grade: A. Clear architectural narrative with measurable impact."],
    };
    const [ans, review] = answers[category] ?? ["The candidate demonstrated awareness of relevant concepts.", "Grade: B. Solid response. More specific examples would strengthen the answer."];
    setSimulatedAnswer(ans); setSimulationFeedback(review); setIsSimulating(false);
  };

  const handleCopilotQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuery.trim() || screenedCandidates.length < 2) return;
    setIsCopilotThinking(true); setCopilotResponse("");
    await new Promise((r) => setTimeout(r, 1800));
    const c1 = screenedCandidates[0], c2 = screenedCandidates[1];
    setCopilotResponse(
      `Based on semantic match algorithms:\n\n• **${c1.name}** ranked #1 (${intVal(c1.overall_score)}%) vs **${c2.name}** #2 (${intVal(c2.overall_score)}%).\n• **Skills**: ${c1.name} matches ${intVal(c1.skills_match_score)}% vs ${intVal(c2.skills_match_score)}% for ${c2.name}.\n• **Semantic**: ${c1.name}'s narrative aligns closer to role responsibilities (${intVal(c1.semantic_match_score)}% vs ${intVal(c2.semantic_match_score)}%).\n• **Experience**: ${c1.name} brings ${c1.experience_years} years of relevant experience.`
    );
    setIsCopilotThinking(false);
  };

  const handleCandidateScreen = async () => {
    if (!candidateDetail || !candidateJobId) return;
    setIsCandidateScreening(true); setCandidateMatch(null);
    try {
      const fd = new FormData(); fd.append("candidate_id", candidateDetail.id); fd.append("job_id", candidateJobId);
      const res = await fetch(`${API_BASE}/api/screen`, { method: "POST", body: fd });
      setCandidateMatch(await res.json());
    } catch (e) { console.error(e); }
    finally { setIsCandidateScreening(false); }
  };

  const inputCls = "w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-600 transition-colors mr-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-xs font-medium hidden sm:block">Home</span>
            </Link>
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-zinc-900">ATS Resume Intelligence</h1>
              <p className="text-[10px] text-indigo-600 font-medium">AI-Powered Screening &amp; Candidate Intelligence</p>
            </div>
          </div>

          <nav className="flex space-x-1">
            {([
              { key: "dashboard", label: "Dashboard" },
              { key: "recruiter", label: "Campaign Manager" },
              { key: "candidate", label: "Candidate Hub" },
            ] as const).map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === key ? "bg-indigo-600 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"}`}>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ══ TAB 1: DASHBOARD ══ */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Screened Resumes", value: analytics?.total_resumes ?? 0, suffix: "", sub: "Auto-parsed profiles", subColor: "text-emerald-600", Icon: FileText, iconBg: "bg-indigo-50 border-indigo-100", iconColor: "text-indigo-600" },
                { label: "Job Openings", value: analytics?.total_jobs ?? 0, suffix: "", sub: "Active pipelines", subColor: "text-zinc-400", Icon: Briefcase, iconBg: "bg-pink-50 border-pink-100", iconColor: "text-pink-600" },
                { label: "Avg. Match Score", value: analytics?.average_score ?? 0, suffix: "%", sub: "Overall candidate health", subColor: "text-indigo-600", Icon: UserCheck, iconBg: "bg-emerald-50 border-emerald-100", iconColor: "text-emerald-600" },
                { label: "Parse Latency", value: analytics?.parsing_latency_ms ?? 0, suffix: " ms", sub: `${analytics?.token_usage ?? 0} LLM tokens`, subColor: "text-amber-600", Icon: Activity, iconBg: "bg-amber-50 border-amber-100", iconColor: "text-amber-600" },
              ].map(({ label, value, suffix, sub, subColor, Icon, iconBg, iconColor }) => (
                <div key={label} className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 font-medium">{label}</p>
                    <p className="text-2xl font-extrabold text-zinc-900 mt-1">{value}<span className="text-sm font-normal text-zinc-400">{suffix}</span></p>
                    <p className={`text-xs mt-1.5 flex items-center gap-1 ${subColor}`}>
                      {suffix === "%" && <TrendingUp className="h-3 w-3" />}{sub}
                    </p>
                  </div>
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center border ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Activity Log */}
              <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5 md:col-span-2 space-y-3">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                  <Activity className="h-4 w-4 text-indigo-600" />
                  <h3 className="font-semibold text-zinc-900 text-sm">System Activity Logs</h3>
                </div>
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {(analytics?.recent_activity ?? []).map((act, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                      <div className="mt-0.5 shrink-0">
                        {act.type === "match" && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                        {act.type === "upload" && <UploadCloud className="h-4 w-4 text-indigo-600" />}
                        {act.type === "job" && <Briefcase className="h-4 w-4 text-pink-600" />}
                        {act.type === "system" && <Terminal className="h-4 w-4 text-zinc-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-700 leading-snug">{act.message}</p>
                        <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />{act.time}</p>
                      </div>
                    </div>
                  ))}
                  {!analytics?.recent_activity?.length && (
                    <p className="text-xs text-zinc-400 text-center py-6">No activity yet. Upload a resume to get started.</p>
                  )}
                </div>
              </div>

              {/* Upload Zone */}
              <div className="bg-white border-2 border-dashed border-zinc-200 rounded-xl hover:border-indigo-300 transition-all p-5 flex flex-col justify-between">
                <div className="text-center py-5">
                  <div className="h-14 w-14 mx-auto rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 mb-3">
                    <UploadCloud className="h-7 w-7 text-indigo-600" />
                  </div>
                  <h4 className="font-semibold text-zinc-900 text-sm">Screen New Candidates</h4>
                  <p className="text-xs text-zinc-400 mt-1.5 max-w-[180px] mx-auto leading-relaxed">Upload PDF, DOCX, or TXT resumes to trigger the AI parsing pipeline</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept=".pdf,.docx,.txt" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                  className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50">
                  {isUploading ? <><span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />Parsing…</> : <><UploadCloud className="h-4 w-4" />Select Resume Files</>}
                </button>
              </div>
            </div>

            {/* AI Copilot */}
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-zinc-900">Recruiter AI Copilot</h3>
                <span className="ml-auto text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100 font-semibold">RAG-powered</span>
              </div>
              <p className="text-sm text-zinc-500 mb-4 max-w-2xl">Ask comparative questions about candidates ranked for the active job. Requires at least 2 screened candidates.</p>
              <form onSubmit={handleCopilotQuery} className="flex gap-2">
                <input type="text" value={copilotQuery} onChange={(e) => setCopilotQuery(e.target.value)}
                  placeholder="Why was candidate A ranked higher than candidate B?"
                  className={inputCls + " flex-1"} />
                <button type="submit" disabled={isCopilotThinking || screenedCandidates.length < 2}
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm disabled:opacity-50 flex items-center gap-2 transition shadow-sm">
                  {isCopilotThinking ? <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <><Search className="h-4 w-4" />Explain</>}
                </button>
              </form>
              {copilotResponse && (
                <div className="mt-4 p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-sm leading-relaxed text-zinc-700 whitespace-pre-line">{copilotResponse}</div>
              )}
            </div>
          </div>
        )}

        {/* ══ TAB 2: CAMPAIGN MANAGER ══ */}
        {activeTab === "recruiter" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-5 lg:col-span-1">
              {/* Job Openings */}
              <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <h3 className="font-semibold text-zinc-900 flex items-center gap-2 text-sm"><Briefcase className="h-4 w-4 text-indigo-600" />Job Openings</h3>
                  <button onClick={() => setShowJobModal(true)} className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium transition">+ Add</button>
                </div>
                <div className="space-y-2">
                  {jobs.map((job) => (
                    <button key={job.id} onClick={() => setSelectedJobId(job.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${selectedJobId === job.id ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"}`}>
                      <p className="font-semibold truncate">{job.title}</p>
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className={selectedJobId === job.id ? "text-indigo-200" : "text-zinc-400"}>{job.department}</span>
                        <span className={selectedJobId === job.id ? "text-indigo-200" : "text-indigo-600"}>{job.experience_years}+ yrs</span>
                      </div>
                    </button>
                  ))}
                  {jobs.length === 0 && <p className="text-xs text-zinc-400 text-center py-4">No jobs yet. Click &quot;+ Add&quot; to create one.</p>}
                </div>
              </div>

              {/* Ranked Candidates */}
              {selectedJobId && (
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <h3 className="font-semibold text-zinc-900 flex items-center gap-2 text-sm"><ListOrdered className="h-4 w-4 text-pink-600" />Screened Standings</h3>
                    <button onClick={handleCompareTrigger} disabled={selectedCompareIds.length < 2}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold disabled:opacity-40 text-zinc-700 transition">Compare</button>
                  </div>
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {screenedCandidates.map((cand, idx) => (
                      <div key={cand.candidate_id}
                        className={`p-3 rounded-lg border flex items-center justify-between gap-2 transition-colors ${selectedCandidateId === cand.candidate_id ? "bg-indigo-50 border-indigo-200" : "bg-white border-zinc-200 hover:border-zinc-300"}`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <input type="checkbox" checked={selectedCompareIds.includes(cand.candidate_id)} onChange={() => handleToggleCompare(cand.candidate_id)}
                            className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/30" />
                          <button onClick={() => handleSelectCandidate(cand.candidate_id)} className="text-left min-w-0">
                            <p className="text-xs font-semibold text-zinc-800 truncate hover:text-indigo-600 transition">{cand.name}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">{cand.experience_years} yrs exp</p>
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <ScoreBadge score={cand.overall_score} />
                          <span className="text-[10px] text-zinc-400 font-bold">#{idx + 1}</span>
                        </div>
                      </div>
                    ))}
                    {screenedCandidates.length === 0 && <p className="text-xs text-zinc-400 text-center py-4">Upload resumes to see ranked candidates.</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-5">
              {/* Comparison Matrix */}
              {comparisonResult && (
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <h3 className="font-semibold text-zinc-900 text-sm">Comparison: {comparisonResult.job_title}</h3>
                    <button onClick={() => setComparisonResult(null)} className="text-xs text-indigo-600 font-medium hover:underline">Clear</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-100">
                          <th className="py-2.5 px-4 text-zinc-400 font-medium text-left text-xs uppercase tracking-wider">Metric</th>
                          {(comparisonResult.candidates ?? []).map((c: any) => (
                            <th key={c.candidate_id} className="py-2.5 px-4 font-bold text-zinc-900 text-center">{c.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {[
                          { label: "Rank", key: "rank", fmt: (v: any) => `#${v}` },
                          { label: "Overall", key: "overall_score", fmt: (v: any) => `${intVal(v)}%` },
                          { label: "Semantic", key: "semantic_match_score", fmt: (v: any) => `${intVal(v)}%` },
                          { label: "Skills", key: "skills_match_score", fmt: (v: any) => `${intVal(v)}%` },
                          { label: "Experience", key: "experience_years", fmt: (v: any) => `${v} yrs` },
                          { label: "ATS Score", key: "ats_compatibility_score", fmt: (v: any) => `${intVal(v)}/100` },
                        ].map(({ label, key, fmt }) => (
                          <tr key={label} className="hover:bg-zinc-50 transition-colors">
                            <td className="py-2.5 px-4 text-zinc-500 font-medium text-xs uppercase tracking-wider">{label}</td>
                            {(comparisonResult.candidates ?? []).map((c: any) => (
                              <td key={c.candidate_id} className="py-2.5 px-4 text-center text-zinc-800 font-semibold">{fmt(c[key])}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {isScreening && (
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-12 text-center space-y-4">
                  <div className="h-12 w-12 mx-auto rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                  <h4 className="font-semibold text-zinc-800">AI Matching Engine Processing…</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">Evaluating resume text, running token expansion, and scoring via LangGraph.</p>
                </div>
              )}

              {!isScreening && matchDetail && (
                <div className="space-y-5">
                  {/* Summary Card */}
                  <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-zinc-900">{matchDetail.candidate.name}</h2>
                        <p className="text-xs text-zinc-400 mt-1">{matchDetail.candidate.email}{matchDetail.candidate.phone && ` · ${matchDetail.candidate.phone}`}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Match Score</p>
                        <p className="text-3xl font-extrabold text-indigo-600 mt-1">{intVal(matchDetail.overall_score)}%</p>
                      </div>
                    </div>
                    {matchDetail.ai_summary && (
                      <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-sm text-zinc-600 leading-relaxed italic">&ldquo;{matchDetail.ai_summary}&rdquo;</div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <StatMiniBar label="Semantic Match" value={matchDetail.semantic_match_score} color="bg-indigo-600" />
                      <StatMiniBar label="Skills Match" value={matchDetail.skills_match_score} color="bg-violet-500" />
                      <StatMiniBar label="Experience" value={matchDetail.experience_match_score} color="bg-emerald-500" />
                      <StatMiniBar label="Education" value={matchDetail.education_match_score} color="bg-blue-500" />
                      <StatMiniBar label="Projects" value={matchDetail.projects_score} color="bg-pink-500" />
                      <StatMiniBar label="ATS Compatibility" value={matchDetail.ats_compatibility_score} color="bg-amber-500" />
                    </div>
                  </div>

                  {/* Skill Gap */}
                  {matchDetail.gap_analysis?.missing_skills?.length > 0 && (
                    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5 space-y-3">
                      <h4 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />Skill Gap Analysis
                        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${matchDetail.gap_analysis.priority === "High" ? "bg-rose-50 text-rose-600 border-rose-200" : matchDetail.gap_analysis.priority === "Medium" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                          {matchDetail.gap_analysis.priority} Priority
                        </span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(matchDetail.gap_analysis.missing_skills ?? []).map((s) => (
                          <span key={s} className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">{s}</span>
                        ))}
                      </div>
                      {matchDetail.gap_analysis.recommended_learning_path?.length > 0 && (
                        <div className="pt-1">
                          <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-2">Recommended Learning Path</p>
                          <ol className="space-y-1">
                            {(matchDetail.gap_analysis.recommended_learning_path ?? []).map((step, i) => (
                              <li key={i} className="text-xs text-zinc-600 flex items-start gap-2">
                                <span className="text-indigo-600 font-bold shrink-0">{i + 1}.</span>{step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resume Improvements */}
                  {matchDetail.resume_improvement?.length > 0 && (
                    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5 space-y-3">
                      <h4 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-indigo-600" />Resume Improvement Suggestions
                      </h4>
                      <div className="space-y-3">
                        {(matchDetail.resume_improvement ?? []).map((imp, i) => (
                          <div key={i} className="rounded-lg border border-zinc-200 overflow-hidden">
                            <div className="grid grid-cols-2 divide-x divide-zinc-200">
                              <div className="p-3 bg-rose-50">
                                <p className="text-[9px] font-bold text-rose-600 uppercase tracking-wider mb-1">Before</p>
                                <p className="text-xs text-zinc-500 leading-relaxed">{imp.before}</p>
                              </div>
                              <div className="p-3 bg-emerald-50">
                                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-1">After</p>
                                <p className="text-xs text-zinc-700 leading-relaxed">{imp.after}</p>
                              </div>
                            </div>
                            {imp.rationale && (
                              <div className="px-3 py-2 bg-zinc-50 border-t border-zinc-200">
                                <p className="text-[10px] text-zinc-400 leading-relaxed"><span className="text-zinc-600 font-semibold">Rationale:</span> {imp.rationale}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interview Simulator */}
                  {matchDetail.interview_questions && (
                    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5 space-y-3">
                      <h4 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                        <MessageSquareCode className="h-4 w-4 text-violet-600" />AI Mock Interview Simulator
                        <span className="ml-auto text-[10px] text-zinc-400">Click any question to simulate</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InterviewQuestionBlock category="technical" icon={Code2} questions={matchDetail.interview_questions.technical || []} onSimulate={handleSimulateAnswer} activeQuestion={activeQuestion} simulatedAnswer={simulatedAnswer} simulationFeedback={simulationFeedback} isSimulating={isSimulating} />
                        <InterviewQuestionBlock category="behavioral" icon={Users} questions={matchDetail.interview_questions.behavioral || []} onSimulate={handleSimulateAnswer} activeQuestion={activeQuestion} simulatedAnswer={simulatedAnswer} simulationFeedback={simulationFeedback} isSimulating={isSimulating} />
                        <InterviewQuestionBlock category="coding" icon={Terminal} questions={matchDetail.interview_questions.coding || []} onSimulate={handleSimulateAnswer} activeQuestion={activeQuestion} simulatedAnswer={simulatedAnswer} simulationFeedback={simulationFeedback} isSimulating={isSimulating} />
                        <InterviewQuestionBlock category="project" icon={GitBranch} questions={matchDetail.interview_questions.project || []} onSimulate={handleSimulateAnswer} activeQuestion={activeQuestion} simulatedAnswer={simulatedAnswer} simulationFeedback={simulationFeedback} isSimulating={isSimulating} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isScreening && !matchDetail && (
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-12 text-center space-y-3">
                  <div className="h-12 w-12 mx-auto rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-zinc-300" />
                  </div>
                  <h4 className="font-semibold text-zinc-400">No candidate selected</h4>
                  <p className="text-xs text-zinc-300 max-w-xs mx-auto">Select a job opening, then click a candidate from the standings to trigger AI screening.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ TAB 3: CANDIDATE HUB ══ */}
        {activeTab === "candidate" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5 space-y-3 lg:col-span-1">
              <h3 className="font-semibold text-zinc-900 flex items-center gap-2 text-sm border-b border-zinc-100 pb-3">
                <Users className="h-4 w-4 text-indigo-600" />All Candidates
                <span className="ml-auto text-xs text-zinc-400 font-normal">{candidates.length} profiles</span>
              </h3>
              <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
                {candidates.map((c) => (
                  <button key={c.id} onClick={() => { setCandidateDetail(c); setCandidateMatch(null); }}
                    className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${candidateDetail?.id === c.id ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"}`}>
                    <p className="font-semibold truncate">{c.name}</p>
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className={candidateDetail?.id === c.id ? "text-indigo-200 truncate" : "text-zinc-400 truncate"}>{c.email}</span>
                      <span className={candidateDetail?.id === c.id ? "text-indigo-200 shrink-0 ml-2" : "text-indigo-600 shrink-0 ml-2"}>{c.experience_years} yrs</span>
                    </div>
                  </button>
                ))}
                {candidates.length === 0 && <p className="text-xs text-zinc-400 text-center py-6">No candidates. Upload resumes from the dashboard.</p>}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-5">
              {candidateDetail ? (
                <>
                  <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-zinc-900">{candidateDetail.name}</h2>
                        <p className="text-xs text-zinc-400 mt-1">{candidateDetail.email}{candidateDetail.phone && ` · ${candidateDetail.phone}`}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2">
                        <Clock className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm text-zinc-700 font-semibold">{candidateDetail.experience_years} yrs exp</span>
                      </div>
                    </div>
                    {candidateDetail.education && (
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <BookMarked className="h-4 w-4 text-blue-500" />{candidateDetail.education}
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-2">Skills ({candidateDetail.skills.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {candidateDetail.skills.map((s) => (
                          <span key={s} className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">{s}</span>
                        ))}
                      </div>
                    </div>
                    {candidateDetail.projects && candidateDetail.projects.length > 0 && (
                      <div>
                        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-2">Projects</p>
                        <div className="flex flex-wrap gap-1.5">
                          {candidateDetail.projects.map((p) => (
                            <span key={p} className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {candidateDetail.certifications && candidateDetail.certifications.length > 0 && (
                      <div>
                        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-2">Certifications</p>
                        <div className="flex flex-wrap gap-1.5">
                          {candidateDetail.certifications.map((c) => (
                            <span key={c} className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100"><Award className="h-3 w-3 inline mr-1" />{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-5 space-y-4">
                    <h4 className="text-sm font-semibold text-zinc-900 flex items-center gap-2"><Target className="h-4 w-4 text-pink-600" />Check Job Compatibility</h4>
                    <div className="flex gap-3">
                      <select value={candidateJobId} onChange={(e) => setCandidateJobId(e.target.value)} className={inputCls + " flex-1"}>
                        <option value="">Select a job opening…</option>
                        {jobs.map((j) => <option key={j.id} value={j.id}>{j.title} ({j.department})</option>)}
                      </select>
                      <button onClick={handleCandidateScreen} disabled={!candidateJobId || isCandidateScreening}
                        className="px-5 py-2.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-medium text-sm disabled:opacity-50 flex items-center gap-2 transition shadow-sm">
                        {isCandidateScreening ? <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <><Zap className="h-4 w-4" />Screen</>}
                      </button>
                    </div>
                    {candidateMatch && (
                      <div className="space-y-4 pt-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-zinc-700 font-medium">Overall Match</p>
                          <ScoreBadge score={candidateMatch.overall_score} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <StatMiniBar label="Semantic Match" value={candidateMatch.semantic_match_score} color="bg-indigo-600" />
                          <StatMiniBar label="Skills Match" value={candidateMatch.skills_match_score} color="bg-violet-500" />
                          <StatMiniBar label="ATS Compatibility" value={candidateMatch.ats_compatibility_score} color="bg-amber-500" />
                          <StatMiniBar label="Projects Score" value={candidateMatch.projects_score} color="bg-pink-500" />
                        </div>
                        {candidateMatch.ai_summary && (
                          <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 leading-relaxed italic">&ldquo;{candidateMatch.ai_summary}&rdquo;</div>
                        )}
                        {candidateMatch.gap_analysis?.missing_skills?.length > 0 && (
                          <div>
                            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-2">Missing Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {(candidateMatch.gap_analysis.missing_skills ?? []).map((s) => (
                                <span key={s} className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-12 text-center space-y-3">
                  <div className="h-12 w-12 mx-auto rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center">
                    <Users className="h-6 w-6 text-zinc-300" />
                  </div>
                  <h4 className="font-semibold text-zinc-400">No candidate selected</h4>
                  <p className="text-xs text-zinc-300 max-w-xs mx-auto">Select a candidate from the list to view their profile and run compatibility checks.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Job Create Modal */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <h3 className="font-bold text-zinc-900">New Job Opening</h3>
              <button onClick={() => setShowJobModal(false)} className="text-zinc-400 hover:text-zinc-700 transition text-lg leading-none">✕</button>
            </div>
            <form onSubmit={handleCreateJob} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 font-medium">Job Title *</label>
                  <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Senior Software Engineer" className={inputCls + " mt-1"} required />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 font-medium">Department</label>
                  <input value={jobDept} onChange={(e) => setJobDept(e.target.value)} placeholder="Engineering" className={inputCls + " mt-1"} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-500 font-medium">Min. Experience (yrs)</label>
                  <input type="number" value={jobExp} onChange={(e) => setJobExp(Number(e.target.value))} min={0} max={20} className={inputCls + " mt-1"} />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 font-medium">Education</label>
                  <select value={jobEdu} onChange={(e) => setJobEdu(e.target.value)} className={inputCls + " mt-1"}>
                    <option>High School</option>
                    <option>Associate&apos;s</option>
                    <option>Bachelor&apos;s</option>
                    <option>Master&apos;s</option>
                    <option>Ph.D.</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-medium">Job Description *</label>
                <textarea value={jobText} onChange={(e) => setJobText(e.target.value)} placeholder="We are looking for a Senior Software Engineer…" rows={5} className={inputCls + " mt-1 resize-none"} required />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowJobModal(false)} className="flex-1 py-2.5 rounded-lg border border-zinc-200 text-sm text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 transition">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-sm">Create Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
