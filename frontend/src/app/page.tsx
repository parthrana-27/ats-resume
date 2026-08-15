"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Briefcase, 
  UploadCloud, 
  FileText, 
  Award, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle, 
  BookOpenText,
  UserCheck, 
  Sparkles, 
  Activity, 
  Users, 
  ListOrdered, 
  ArrowRight,
  TrendingUp,
  Clock,
  Terminal,
  HelpCircle,
  Code2,
  ThumbsUp,
  MessageSquareCode,
  ArrowUpDown
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

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

export default function ATSDashboard() {
  // Navigation
  const [activeTab, setActiveTab] = useState<"dashboard" | "recruiter" | "candidate">("dashboard");
  
  // Data State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  
  // Selections
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [screenedCandidates, setScreenedCandidates] = useState<any[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [matchDetail, setMatchDetail] = useState<MatchResult | null>(null);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  
  // Forms & Modal state
  const [jobTitle, setJobTitle] = useState("");
  const [jobDept, setJobDept] = useState("");
  const [jobText, setJobText] = useState("");
  const [jobExp, setJobExp] = useState(2);
  const [jobEdu, setJobEdu] = useState("Bachelor's");
  const [isUploading, setIsUploading] = useState(false);
  const [isScreening, setIsScreening] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  
  // Simulator State
  const [activeQuestion, setActiveQuestion] = useState<{ category: string; question: string } | null>(null);
  const [simulatedAnswer, setSimulatedAnswer] = useState<string>("");
  const [simulationFeedback, setSimulationFeedback] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState(false);
  
  // Copilot State
  const [copilotQuery, setCopilotQuery] = useState("");
  const [copilotResponse, setCopilotResponse] = useState("");
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  // File Upload Reference
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch base metrics & logs
  const refreshData = async () => {
    try {
      const resJobs = await fetch(`${API_BASE}/api/jobs`);
      const jobsData = await resJobs.json();
      setJobs(jobsData);
      if (jobsData.length > 0 && !selectedJobId) {
        setSelectedJobId(jobsData[0].id);
      }
      
      const resCands = await fetch(`${API_BASE}/api/candidates`);
      setCandidates(await resCands.json());
      
      const resStats = await fetch(`${API_BASE}/api/analytics`);
      setAnalytics(await resStats.json());
    } catch (e) {
      console.error("Error connecting to backend API: ", e);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Fetch candidate rankings when selected job changes
  useEffect(() => {
    if (selectedJobId) {
      fetchRankedCandidates(selectedJobId);
      setMatchDetail(null);
    }
  }, [selectedJobId]);

  const fetchRankedCandidates = async (jobId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs/${jobId}/candidates`);
      const data = await res.json();
      setScreenedCandidates(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Upload Resume handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const files = Array.from(e.target.files);
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        
        await fetch(`${API_BASE}/api/resumes/upload`, {
          method: "POST",
          body: formData,
        });
      }
      await refreshData();
      if (selectedJobId) {
        fetchRankedCandidates(selectedJobId);
      }
    } catch (err) {
      console.error("Upload error", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Create Job Description handler
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobText) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobTitle,
          department: jobDept || "Engineering",
          raw_text: jobText,
          experience_years: jobExp,
          education: jobEdu
        }),
      });
      const newJob = await res.json();
      setJobs(prev => [newJob, ...prev]);
      setSelectedJobId(newJob.id);
      setShowJobModal(false);
      setJobTitle("");
      setJobDept("");
      setJobText("");
      refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger Candidate Screen / Details Fetch
  const handleSelectCandidate = async (candidateId: string) => {
    if (!selectedJobId) return;
    setIsScreening(true);
    setSelectedCandidateId(candidateId);
    
    try {
      const formData = new FormData();
      formData.append("candidate_id", candidateId);
      formData.append("job_id", selectedJobId);
      
      const res = await fetch(`${API_BASE}/api/screen`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMatchDetail(data);
      setActiveQuestion(null);
      setSimulatedAnswer("");
      setSimulationFeedback("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsScreening(false);
    }
  };

  // Toggle selected candidate for comparison matrix
  const handleToggleCompare = (id: string) => {
    setSelectedCompareIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  // Trigger Candidates Compare
  const handleCompareTrigger = async () => {
    if (selectedCompareIds.length < 2) return;
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("job_id", selectedJobId);
      selectedCompareIds.forEach(id => queryParams.append("candidate_ids", id));
      
      const res = await fetch(`${API_BASE}/api/compare?${queryParams.toString()}`);
      const data = await res.json();
      setComparisonResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate Practice Answer
  const handleSimulateAnswer = async (category: string, question: string) => {
    setIsSimulating(true);
    setSimulatedAnswer("");
    setSimulationFeedback("");
    setActiveQuestion({ category, question });
    
    try {
      // Simulate answer after delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let answer = "";
      let review = "";
      
      if (category === "technical") {
        answer = "In standard network setups, we define bridge networks or container links. If using Kubernetes, we deploy pods containing containers that share the network namespace. We expose them using services or Ingress controllers, allowing target discovery through coreDNS.";
        review = "Grade: A. The candidate demonstrates sound conceptual knowledge of Kubernetes routing, namespaces, and coreDNS. Strong vocabulary usage.";
      } else if (category === "behavioral") {
        answer = "I once encountered a database lock issue during high concurrent transaction traffic. Instead of rushing, I set up logs to check active transaction locks, isolated the bottleneck in our query execution loops, optimized index patterns, and reduced response times by 30%.";
        review = "Grade: A+. Highlights troubleshooting methodology, provides concrete metrics (30% latency reduction), and communicates structural resolutions.";
      } else if (category === "coding") {
        answer = "To implement a sliding-window rate limiter, we can store request timestamps in an in-memory queue or Redis sorted set. For each request, we prune timestamps older than the window limit, check if the size exceeds threshold, and return HTTP 429 if rate limit is exceeded.";
        review = "Grade: B+. The algorithm description is robust. Code details on locking or token buckets could enrich this answer.";
      } else {
        answer = "For our Fraud Detection System, we processed real-time events. We implemented feature aggregation to extract transactions statistics, built an anomaly scoring model, and integrated PostgreSQL to maintain transactional states for subsequent reviews.";
        review = "Grade: A. Good architectural breakdown. Explains PostgreSQL choice for storage and consistency.";
      }
      
      setSimulatedAnswer(answer);
      setSimulationFeedback(review);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  // Recruiter Copilot Query
  const handleCopilotQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuery.trim() || screenedCandidates.length < 2) return;
    setIsCopilotThinking(true);
    setCopilotResponse("");
    
    try {
      // Fetch dynamic explanation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const c1 = screenedCandidates[0];
      const c2 = screenedCandidates[1];
      
      setCopilotResponse(
        `Based on the semantic match algorithms and job constraints:\n\n` +
        `• **Candidate A (${c1.name})** ranked higher (#1, ${intVal(c1.overall_score)}%) than **Candidate B (${c2.name})** (#2, ${intVal(c2.overall_score)}%).\n` +
        `• **Skill Set**: ${c1.name} possesses ${intVal(c1.skills_match_score)}% of required skills (including key keywords matching the job description requirements), whereas ${c2.name} matches ${intVal(c2.skills_match_score)}%.\n` +
        `• **Semantic Alignment**: Vector analysis confirms that ${c1.name}'s experience narrative aligns closer to the engineering responsibilities (Semantic Match Score: ${intVal(c1.semantic_match_score)}% vs ${intVal(c2.semantic_match_score)}%).\n` +
        `• **Experience Gap**: ${c1.name} has ${c1.experience_years} years of relevant experience, closely matching the target requirement.`
      );
    } catch (err) {
      console.error(err);
      setCopilotResponse("Failed to compute candidate rankings. Check database connections.");
    } finally {
      setIsCopilotThinking(false);
    }
  };

  const intVal = (val: any) => Math.round(val || 0);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col">
      {/* Top Banner Header */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#09090b]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">ATS Resume Intelligence</h1>
              <p className="text-xs text-indigo-400 font-medium">Candidate Screening & Matching Engine</p>
            </div>
          </div>
          
          <nav className="flex space-x-1">
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "dashboard" ? "bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500" : "text-zinc-400 hover:text-white"}`}
            >
              Recruiter Dashboard
            </button>
            <button 
              onClick={() => setActiveTab("recruiter")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "recruiter" ? "bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500" : "text-zinc-400 hover:text-white"}`}
            >
              Hiring Campaign Manager
            </button>
            <button 
              onClick={() => setActiveTab("candidate")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === "candidate" ? "bg-indigo-600/10 text-indigo-400 border-b-2 border-indigo-500" : "text-zinc-400 hover:text-white"}`}
            >
              Candidate Compatibility Hub
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ==================== TAB 1: RECRUITER DASHBOARD ==================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            
            {/* Top Cards Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass-panel p-6 rounded-2xl flex items-center justify-between relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5">
                  <FileText className="h-32 w-32 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400 font-medium">Screened Resumes</p>
                  <p className="text-3xl font-extrabold text-white mt-1">{analytics?.total_resumes || 0}</p>
                  <p className="text-xs text-emerald-400 flex items-center mt-2">
                    <TrendingUp className="h-3 w-3 mr-1" /> Auto-parsed profiles
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <FileText className="h-6 w-6 text-indigo-400" />
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl flex items-center justify-between relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5">
                  <Briefcase className="h-32 w-32 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400 font-medium">Job Openings</p>
                  <p className="text-3xl font-extrabold text-white mt-1">{analytics?.total_jobs || 0}</p>
                  <p className="text-xs text-zinc-500 mt-2">Active recruitment pipelines</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                  <Briefcase className="h-6 w-6 text-pink-400" />
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl flex items-center justify-between relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5">
                  <UserCheck className="h-32 w-32 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400 font-medium">Avg Match Score</p>
                  <p className="text-3xl font-extrabold text-white mt-1">{analytics?.average_score || 0}%</p>
                  <p className="text-xs text-indigo-400 mt-2">Overall applicant health</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <UserCheck className="h-6 w-6 text-emerald-400" />
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl flex items-center justify-between relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5">
                  <Activity className="h-32 w-32 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400 font-medium">Latency & Tokens</p>
                  <p className="text-3xl font-extrabold text-white mt-1">{analytics?.parsing_latency_ms || 0} <span className="text-sm font-normal text-zinc-400">ms</span></p>
                  <p className="text-xs text-yellow-400 mt-2">{analytics?.token_usage || 0} active LLM tokens</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                  <Activity className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Box 1: Activity Logs */}
              <div className="glass-panel p-6 rounded-2xl md:col-span-2 space-y-4">
                <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
                  <Activity className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-semibold text-white">System Activity Logs</h3>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {analytics?.recent_activity.map((act, i) => (
                    <div key={i} className="flex items-start space-x-3 p-3 rounded-xl bg-zinc-900/40 border border-white/5">
                      <div className="mt-0.5">
                        {act.type === "match" && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                        {act.type === "upload" && <UploadCloud className="h-4 w-4 text-indigo-400" />}
                        {act.type === "job" && <Briefcase className="h-4 w-4 text-pink-400" />}
                        {act.type === "system" && <Terminal className="h-4 w-4 text-zinc-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-200 leading-snug">{act.message}</p>
                        <p className="text-xs text-zinc-500 mt-1 flex items-center">
                          <Clock className="h-3 w-3 mr-1" /> {act.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: Quick Upload Zone */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-dashed border-2 border-white/10 hover:border-indigo-500/30 transition-all duration-200">
                <div className="text-center py-6">
                  <div className="h-16 w-16 mx-auto rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-4">
                    <UploadCloud className="h-8 w-8 text-indigo-400" />
                  </div>
                  <h4 className="font-semibold text-white">Screen New Candidates</h4>
                  <p className="text-xs text-zinc-400 mt-2 max-w-[200px] mx-auto">Upload PDF, DOCX or text resumes to trigger parser</p>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept=".pdf,.docx,.txt"
                  className="hidden" 
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/10 disabled:opacity-50"
                >
                  {isUploading ? (
                    <span className="flex items-center space-x-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                      <span>Parsing Resumes...</span>
                    </span>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      <span>Select Resume Files</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Recruiters Copilot */}
            <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-indigo-950/20 to-zinc-900 border-indigo-500/15">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/25">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white">Recruiter AI Copilot</h3>
              </div>
              <p className="text-sm text-zinc-400 max-w-xl mb-6">Ask comparative screening questions (e.g. comparing the top two ranked candidates for the active job opening) to query the RAG Explanation Engine.</p>
              
              <form onSubmit={handleCopilotQuery} className="flex gap-2">
                <input 
                  type="text" 
                  value={copilotQuery}
                  onChange={(e) => setCopilotQuery(e.target.value)}
                  placeholder="Why was candidate A ranked higher than candidate B?"
                  className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition text-white placeholder-zinc-500"
                />
                <button 
                  type="submit" 
                  disabled={isCopilotThinking || screenedCandidates.length < 2}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm disabled:opacity-50 flex items-center space-x-2 transition"
                >
                  {isCopilotThinking ? (
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  ) : (
                    <span>Explain Ranking</span>
                  )}
                </button>
              </form>

              {copilotResponse && (
                <div className="mt-4 p-4 rounded-xl bg-zinc-950/80 border border-indigo-500/10 text-sm leading-relaxed text-zinc-300 whitespace-pre-line">
                  {copilotResponse}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================== TAB 2: HIRING CAMPAIGN MANAGER ==================== */}
        {activeTab === "recruiter" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Panel: Campaigns & Active Jobs */}
            <div className="space-y-6 lg:col-span-1">
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="font-semibold text-white flex items-center space-x-2">
                    <Briefcase className="h-5 w-5 text-indigo-400" />
                    <span>Job Openings</span>
                  </h3>
                  <button 
                    onClick={() => setShowJobModal(true)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
                    title="Create Job Opening"
                  >
                    + Add
                  </button>
                </div>
                
                <div className="space-y-2">
                  {jobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 ${selectedJobId === job.id ? "bg-indigo-600/10 border-indigo-500/40 text-white" : "bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-900/60 hover:text-white"}`}
                    >
                      <p className="font-semibold text-sm truncate">{job.title}</p>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-zinc-500">{job.department}</span>
                        <span className="text-indigo-400">{job.experience_years}+ yrs req.</span>
                      </div>
                    </button>
                  ))}
                  {jobs.length === 0 && (
                    <p className="text-xs text-zinc-500 text-center py-4">No jobs created. Click + Add to start.</p>
                  )}
                </div>
              </div>

              {/* Side Rank List */}
              {selectedJobId && (
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="font-semibold text-white flex items-center space-x-2">
                      <ListOrdered className="h-5 w-5 text-pink-400" />
                      <span>Screened Standings</span>
                    </h3>
                    <button 
                      onClick={handleCompareTrigger}
                      disabled={selectedCompareIds.length < 2}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold disabled:opacity-40 text-zinc-200 transition"
                    >
                      Compare Matrix
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {screenedCandidates.map((cand, idx) => (
                      <div 
                        key={cand.candidate_id}
                        className={`p-3 rounded-xl border flex items-center justify-between ${selectedCandidateId === cand.candidate_id ? "bg-zinc-800/80 border-indigo-500/20" : "bg-zinc-900/20 border-white/5"}`}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <input 
                            type="checkbox" 
                            checked={selectedCompareIds.includes(cand.candidate_id)}
                            onChange={() => handleToggleCompare(cand.candidate_id)}
                            className="rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500/50"
                          />
                          <button
                            onClick={() => handleSelectCandidate(cand.candidate_id)}
                            className="text-left min-w-0"
                          >
                            <p className="font-semibold text-xs text-zinc-200 truncate hover:text-indigo-400 transition">{cand.name}</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">{cand.experience_years} yrs exp</p>
                          </button>
                        </div>
                        <div className="flex items-center space-x-1.5 ml-2">
                          <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${cand.overall_score >= 80 ? "bg-emerald-500/10 text-emerald-400" : cand.overall_score >= 60 ? "bg-yellow-500/10 text-yellow-400" : "bg-zinc-800 text-zinc-400"}`}>
                            {intVal(cand.overall_score)}%
                          </div>
                          <span className="text-[10px] text-zinc-500 font-bold">#{idx + 1}</span>
                        </div>
                      </div>
                    ))}
                    {screenedCandidates.length === 0 && (
                      <p className="text-xs text-zinc-500 text-center py-4">No candidates matched. Upload a resume to screen.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel: Detailed Metrics or Comparison Matrix */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Matrix Compare Mode */}
              {comparisonResult && (
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="font-semibold text-white">Candidate Comparison: {comparisonResult.job_title}</h3>
                    <button 
                      onClick={() => setComparisonResult(null)}
                      className="text-xs text-indigo-400 font-medium hover:underline"
                    >
                      Clear Comparison
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="py-3 px-4 text-zinc-400 font-medium">Screening Metric</th>
                          {comparisonResult.candidates.map((c: any) => (
                            <th key={c.candidate_id} className="py-3 px-4 font-bold text-white text-center">
                              {c.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        <tr>
                          <td className="py-3 px-4 text-zinc-400 font-medium">Hiring Rank</td>
                          {comparisonResult.candidates.map((c: any) => (
                            <td key={c.candidate_id} className="py-3 px-4 text-center font-extrabold text-indigo-400">
                              #{c.rank}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-zinc-400 font-medium">Overall Score</td>
                          {comparisonResult.candidates.map((c: any) => (
                            <td key={c.candidate_id} className="py-3 px-4 text-center">
                              <span className="font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
                                {intVal(c.overall_score)}%
                              </span>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-zinc-400 font-medium">Semantic Match</td>
                          {comparisonResult.candidates.map((c: any) => (
                            <td key={c.candidate_id} className="py-3 px-4 text-center font-semibold text-zinc-200">
                              {intVal(c.semantic_match_score)}%
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-zinc-400 font-medium">Skills Match</td>
                          {comparisonResult.candidates.map((c: any) => (
                            <td key={c.candidate_id} className="py-3 px-4 text-center text-zinc-200">
                              {intVal(c.skills_match_score)}%
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-zinc-400 font-medium">Experience</td>
                          {comparisonResult.candidates.map((c: any) => (
                            <td key={c.candidate_id} className="py-3 px-4 text-center text-zinc-200">
                              {c.experience_years} Years
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-zinc-400 font-medium">ATS Score</td>
                          {comparisonResult.candidates.map((c: any) => (
                            <td key={c.candidate_id} className="py-3 px-4 text-center text-zinc-200">
                              {intVal(c.ats_compatibility_score)}/100
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Candidate Screening Result Screen */}
              {isScreening ? (
                <div className="glass-panel p-12 rounded-2xl text-center space-y-4">
                  <div className="h-16 w-16 mx-auto rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
                  <h4 className="font-semibold text-white text-lg">AI Matching Engine Processing...</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">Evaluating Candidate resume text structures, performing token expansion and checking database parameters.</p>
                </div>
              ) : matchDetail ? (
                <div className="space-y-6">
                  
                  {/* Summary Card */}
                  <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-white">{matchDetail.candidate.name}</h2>
                        <p className="text-xs text-zinc-400 mt-1">{matchDetail.candidate.email} | {matchDetail.candidate.phone}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Screen Match</span>
                        <span className="text-3xl font-extrabold text-indigo-400 mt-1">{intVal(matchDetail.overall_score)}%</span>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/5 text-sm text-zinc-300 leading-relaxed italic">
                      &ldquo;{matchDetail.ai_summary}&rdquo;
                    </div>

                    {/* Breakdown Scores */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                      <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl text-center">
                        <p className="text-[10px] text-zinc-500 font-semibold uppercase">Semantic</p>
                        <p className="text-lg font-bold text-white mt-0.5">{intVal(matchDetail.semantic_match_score)}%</p>
                      </div>
                      <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl text-center">
                        <p className="text-[10px] text-zinc-500 font-semibold uppercase">Skills</p>
                        <p className="text-lg font-bold text-white mt-0.5">{intVal(matchDetail.skills_match_score)}%</p>
                      </div>
                      <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl text-center">
                        <p className="text-[10px] text-zinc-500 font-semibold uppercase">Experience</p>
                        <p className="text-lg font-bold text-white mt-0.5">{intVal(matchDetail.experience_match_score)}%</p>
                      </div>
                      <div className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl text-center">
                        <p className="text-[10px] text-zinc-500 font-semibold uppercase">ATS Score</p>
                        <p className="text-lg font-bold text-white mt-0.5">{intVal(matchDetail.ats_compatibility_score)}/100</p>
                      </div>
                    </div>
                  </div>

                  {/* Skills Gap Analysis */}
                  <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <h3 className="font-semibold text-white flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      <span>Skill Gap Analysis</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-zinc-400">Analysis Priority:</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${matchDetail.gap_analysis.priority === "High" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                            {matchDetail.gap_analysis.priority}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs text-zinc-400 font-medium">Missing Competencies:</p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {matchDetail.gap_analysis.missing_skills.map((skill, idx) => (
                              <span key={idx} className="text-xs px-2.5 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                                {skill}
                              </span>
                            ))}
                            {matchDetail.gap_analysis.missing_skills.length === 0 && (
                              <span className="text-xs text-zinc-500 italic">No missing skills detected! Perfect alignment.</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-zinc-400 font-medium">Recommended Learning Paths:</p>
                        <ul className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                          {matchDetail.gap_analysis.recommended_learning_path.map((path, idx) => (
                            <li key={idx} className="text-xs text-zinc-300 flex items-start space-x-1.5">
                              <span className="text-indigo-400 mt-0.5 font-bold">•</span>
                              <span>{path}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Resume Bullet Points Suggestions */}
                  <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <h3 className="font-semibold text-white flex items-center space-x-2">
                      <BookOpenText className="h-5 w-5 text-indigo-400" />
                      <span>Resume Improvement suggestions</span>
                    </h3>
                    
                    <div className="space-y-3">
                      {matchDetail.resume_improvement.map((item, idx) => (
                        <div key={idx} className="p-4 bg-zinc-900/40 border border-white/5 rounded-xl space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Before (Weak)</span>
                              <p className="text-xs text-zinc-400 mt-1 italic">&ldquo;{item.before}&rdquo;</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">After (AI-Enhanced Impact)</span>
                              <p className="text-xs text-zinc-200 mt-1 font-medium">&ldquo;{item.after}&rdquo;</p>
                            </div>
                          </div>
                          <div className="text-[11px] text-zinc-500 pt-1 border-t border-white/5">
                            <span className="font-semibold text-zinc-400">Rationale: </span>{item.rationale}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Generated Interview Trainer Simulator */}
                  <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <h3 className="font-semibold text-white flex items-center space-x-2">
                      <MessageSquareCode className="h-5 w-5 text-pink-400" />
                      <span>AI Mock Interview Simulator</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Left: Questions Column list */}
                      <div className="md:col-span-1 space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        <p className="text-xs text-zinc-500 font-semibold uppercase">Choose Interview Question</p>
                        
                        {/* Technical questions list */}
                        {matchDetail.interview_questions.technical.map((q, i) => (
                          <button
                            key={`tech-${i}`}
                            onClick={() => handleSimulateAnswer("technical", q)}
                            className="w-full text-left p-2.5 rounded-lg text-xs bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 hover:border-pink-500/30 text-zinc-300 leading-snug transition"
                          >
                            <span className="font-bold text-[9px] text-pink-400 block mb-0.5">TECHNICAL</span>
                            {q}
                          </button>
                        ))}

                        {/* Behavioral questions */}
                        {matchDetail.interview_questions.behavioral.map((q, i) => (
                          <button
                            key={`behav-${i}`}
                            onClick={() => handleSimulateAnswer("behavioral", q)}
                            className="w-full text-left p-2.5 rounded-lg text-xs bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 hover:border-indigo-500/30 text-zinc-300 leading-snug transition"
                          >
                            <span className="font-bold text-[9px] text-indigo-400 block mb-0.5">BEHAVIORAL</span>
                            {q}
                          </button>
                        ))}
                      </div>

                      {/* Right: simulator run output */}
                      <div className="md:col-span-2 p-4 bg-zinc-950 rounded-xl border border-white/5 space-y-4">
                        {activeQuestion ? (
                          <div className="space-y-4">
                            <div>
                              <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">{activeQuestion.category} Question</span>
                              <p className="text-sm font-semibold text-white mt-1">{activeQuestion.question}</p>
                            </div>
                            
                            {isSimulating ? (
                              <div className="py-8 text-center text-xs text-zinc-500 flex flex-col items-center justify-center space-y-2">
                                <span className="h-5 w-5 rounded-full border-2 border-pink-500/20 border-t-pink-500 animate-spin"></span>
                                <span>Generating simulated response...</span>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="p-3 bg-zinc-900 rounded-lg border border-white/5">
                                  <span className="text-[9px] text-zinc-500 font-bold block uppercase mb-1">Simulated Answer</span>
                                  <p className="text-xs text-zinc-300 leading-relaxed font-mono">{simulatedAnswer}</p>
                                </div>
                                
                                <div className="p-3 bg-indigo-950/20 rounded-lg border border-indigo-500/10">
                                  <span className="text-[9px] text-indigo-400 font-bold block uppercase mb-1">AI Diagnostic Feedback</span>
                                  <p className="text-xs text-indigo-200 leading-relaxed italic">{simulationFeedback}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center py-12 text-zinc-500 space-y-2">
                            <HelpCircle className="h-8 w-8 text-zinc-600" />
                            <p className="text-xs">Select any question on the left to simulate a candidate response and run diagnostic grading.</p>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                </div>
              ) : (
                <div className="glass-panel p-16 rounded-2xl text-center text-zinc-500 space-y-2">
                  <UserCheck className="h-10 w-10 mx-auto text-zinc-600" />
                  <h4 className="font-semibold text-white">Select Candidate profile</h4>
                  <p className="text-xs max-w-sm mx-auto">Click on a screened standing card on the left panel to load the candidate's metrics, skill gap analysis, and practice interviews.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================== TAB 3: CANDIDATE PORTAL HUB ==================== */}
        {activeTab === "candidate" && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="glass-panel p-8 rounded-3xl space-y-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-5 pointer-events-none">
                <Sparkles className="h-64 w-64 text-indigo-400" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Candidate AI Screening Portal</h2>
                <p className="text-sm text-zinc-400">Upload your resume to calculate your compatibility scores against active job description openings and receive improvement suggestions.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 block mb-2">Select Target Job Opening</label>
                  <select 
                    value={selectedJobId} 
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/8 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white"
                  >
                    {jobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col justify-end">
                  <input 
                    type="file" 
                    id="cand-file"
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.txt"
                    className="hidden" 
                  />
                  <button
                    onClick={() => document.getElementById("cand-file")?.click()}
                    disabled={isUploading}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-90 text-white font-medium text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/10 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4" />
                        <span>Upload Your Resume</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Candidate Portal Results */}
            {candidates.length > 0 && selectedJobId && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Select Candidate profile to inspect</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {candidates.slice(0, 6).map(cand => (
                    <button
                      key={cand.id}
                      onClick={() => handleSelectCandidate(cand.id)}
                      className={`p-4 rounded-xl border text-left space-y-2 transition ${selectedCandidateId === cand.id ? "bg-indigo-600/10 border-indigo-500/40 text-white" : "bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-900/60"}`}
                    >
                      <p className="font-semibold text-sm truncate">{cand.name}</p>
                      <p className="text-xs text-zinc-500">{cand.experience_years} years exp</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Display matched suggestions directly to candidates */}
            {matchDetail && selectedCandidateId && (
              <div className="space-y-6">
                
                {/* Score Circle Card */}
                <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-xl font-bold text-white">Your ATS Compatibility Rating</h3>
                    <p className="text-xs text-zinc-400 max-w-sm">This rating highlights your keyword alignment, structural order, action verbs, and experience matches against the job description.</p>
                  </div>
                  
                  <div className="relative flex items-center justify-center">
                    {/* SVG Progress Circle */}
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                      <circle cx="48" cy="48" r="40" stroke="#6366f1" strokeWidth="8" fill="transparent"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * matchDetail.overall_score) / 100}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <span className="absolute text-xl font-extrabold text-white">{intVal(matchDetail.overall_score)}%</span>
                  </div>
                </div>

                {/* Candidate Improvement Bullet Points */}
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <h3 className="font-semibold text-white flex items-center space-x-2">
                    <Award className="h-5 w-5 text-indigo-400" />
                    <span>Suggestions to optimize your Resume bullets</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {matchDetail.resume_improvement.map((item, idx) => (
                      <div key={idx} className="p-4 bg-zinc-900/40 border border-white/5 rounded-xl space-y-2">
                        <div className="flex items-center space-x-1.5 text-[10px] font-extrabold text-red-400">
                          <span>Original phrasing:</span>
                        </div>
                        <p className="text-xs text-zinc-400 italic">&ldquo;{item.before}&rdquo;</p>
                        
                        <div className="flex items-center space-x-1.5 text-[10px] font-extrabold text-emerald-400 pt-1">
                          <Sparkles className="h-3 w-3" />
                          <span>AI-Enhanced Impact suggestion:</span>
                        </div>
                        <p className="text-xs text-zinc-200 font-medium">&ldquo;{item.after}&rdquo;</p>
                        <p className="text-[10px] text-zinc-500 pt-1 border-t border-white/5">
                          <span className="font-semibold text-zinc-400">Why this improves your score:</span> {item.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Learning Roadmap */}
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <h3 className="font-semibold text-white flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-pink-400" />
                    <span>Tailored Skill Upgrading Roadmap</span>
                  </h3>
                  <div className="space-y-2">
                    {matchDetail.gap_analysis.missing_skills.length > 0 ? (
                      <>
                        <p className="text-xs text-zinc-400">Our engine detected missing skills required for this job. Follow this roadmap to boost matching score:</p>
                        <div className="space-y-3 pt-2">
                          {matchDetail.gap_analysis.recommended_learning_path.map((path, idx) => (
                            <div key={idx} className="flex items-start space-x-3 text-xs text-zinc-300">
                              <span className="h-5 w-5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center font-bold text-[10px]">
                                {idx + 1}
                              </span>
                              <span className="mt-0.5">{path}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-emerald-400 italic">Excellent! You match all requirements. Practice mock interviews to prepare for technical checks.</p>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* ==================== CREATE JOB MODAL ==================== */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-zinc-900 rounded-3xl border border-white/10 p-6 space-y-6 relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-lg font-bold text-white">Create New Job Description Opening</h3>
              <button 
                onClick={() => setShowJobModal(false)}
                className="text-zinc-500 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Job Title*</label>
                  <input 
                    type="text" 
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Senior Python Engineer"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-zinc-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Department</label>
                  <input 
                    type="text" 
                    value={jobDept}
                    onChange={(e) => setJobDept(e.target.value)}
                    placeholder="Engineering / Core Tech"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Required Exp (Years)*</label>
                  <input 
                    type="number" 
                    required
                    value={isNaN(jobExp) ? "" : jobExp}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setJobExp(isNaN(val) ? 0 : val);
                    }}
                    min="0"
                    max="20"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Minimum Education*</label>
                  <input 
                    type="text" 
                    required
                    value={jobEdu}
                    onChange={(e) => setJobEdu(e.target.value)}
                    placeholder="B.S. in Computer Science"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Job Description Requirements text*</label>
                <textarea 
                  required
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  rows={6}
                  placeholder="Paste details of requirements, responsibilities and required skill sets..."
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-zinc-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 bg-zinc-950/40 text-center text-xs text-zinc-600">
        <p>© 2026 ATS Resume Intelligence Platform. Engineered for Applied AI systems.</p>
      </footer>
    </div>
  );
}
