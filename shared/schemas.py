from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Resume Schemas
class ResumeUploadResponse(BaseModel):
    candidate_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    experience_years: float = 0.0
    education: Optional[str] = None
    certifications: List[str] = []
    projects: List[str] = []
    created_at: datetime

# Job Description Schemas
class JobDescriptionCreate(BaseModel):
    title: str
    department: Optional[str] = None
    raw_text: str
    experience_years: float = 0.0
    education: Optional[str] = None
    required_skills: List[str] = []
    preferred_skills: List[str] = []

class JobDescriptionResponse(BaseModel):
    id: str
    title: str
    department: Optional[str] = None
    raw_text: str
    required_skills: List[str]
    preferred_skills: List[str]
    experience_years: float
    education: Optional[str] = None
    created_at: datetime

# Match Results Schemas
class GapAnalysis(BaseModel):
    missing_skills: List[str]
    priority: str
    recommended_learning_path: List[str]

class ResumeImprovementItem(BaseModel):
    before: str
    after: str
    rationale: str

class InterviewQuestions(BaseModel):
    technical: List[str]
    behavioral: List[str]
    coding: List[str]
    project: List[str]

class CandidateMatchDetail(BaseModel):
    candidate_id: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str]
    experience_years: float
    education: Optional[str] = None
    certifications: List[str]
    projects: List[str]

class MatchResultResponse(BaseModel):
    match_id: str
    candidate: CandidateMatchDetail
    job_id: str
    overall_score: float
    semantic_match_score: float
    skills_match_score: float
    experience_match_score: float
    education_match_score: float
    projects_score: float
    certifications_score: float
    ats_compatibility_score: float
    gap_analysis: GapAnalysis
    resume_improvement: List[ResumeImprovementItem]
    ai_summary: str
    interview_questions: InterviewQuestions
    created_at: datetime

class CandidateComparisonItem(BaseModel):
    candidate_id: str
    name: str
    overall_score: float
    semantic_match_score: float
    skills_match_score: float
    experience_years: float
    ats_compatibility_score: float
    rank: int

class CompareCandidatesResponse(BaseModel):
    job_id: str
    job_title: str
    candidates: List[CandidateComparisonItem]

class SystemMetricsResponse(BaseModel):
    total_resumes: int
    total_jobs: int
    average_score: float
    parsing_latency_ms: float
    token_usage: int
    recent_activity: List[Dict[str, Any]]
