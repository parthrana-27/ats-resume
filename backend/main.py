import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from shared.config import settings
from shared.schemas import (
    ResumeUploadResponse, JobDescriptionCreate, JobDescriptionResponse, 
    MatchResultResponse, CompareCandidatesResponse, SystemMetricsResponse
)
from ai.database import get_db, init_db, Candidate, JobDescription, MatchResult, generate_local_embedding
from services.resume_service import parse_document
from services.job_service import create_job_description, extract_job_metadata_mock
from services.matching_service import get_or_create_match, calculate_match_scores
from services.analytics_service import get_system_metrics

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema
    init_db()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Resume Screening & Candidate Intelligence Platform API Gateway",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all. In production, restrict.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Status
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "mock_mode": settings.is_mock_mode,
        "database": "sqlite"
    }

# 1. Candidate Resumes Endpoints
@app.post("/api/resumes/upload", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Uploads a PDF, DOCX or TXT resume, parses it, and persists candidate details."""
    file_bytes = await file.read()
    
    try:
        # Extract and clean text
        raw_text, ext = parse_document(file.filename, file_bytes)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")
        
    if not raw_text or len(raw_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="The document contains insufficient text or is empty.")
        
    # Process Candidate Parsing via LangGraph
    # We dynamically construct a temporary Candidate profile to pass to the Multi-Agent graph
    temp_candidate = Candidate(raw_text=raw_text, skills=[])
    
    # Generate local embeddings based on parsed details
    # We run the Multi-Agent graph nodes (parsing, skills, etc.)
    from ai.agents.graph import parsing_agent, skills_agent, experience_agent
    
    # 1. Run Parsing Agent
    parse_state = parsing_agent({"raw_resume_text": raw_text})
    details = parse_state["parsed_details"]
    
    # 2. Generate local semantic representation vector
    embedding = generate_local_embedding(details["skills"], raw_text)
    
    # Save Candidate in Database
    db_candidate = Candidate(
        name=details["name"],
        email=details.get("email"),
        phone=details.get("phone"),
        skills=details["skills"],
        experience_years=details["experience_years"],
        education=details.get("education"),
        certifications=details["certifications"],
        projects=details["projects"],
        raw_text=raw_text,
        structured_json=details,
        embedding=embedding
    )
    
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    
    return {
        "candidate_id": db_candidate.id,
        "name": db_candidate.name,
        "email": db_candidate.email,
        "phone": db_candidate.phone,
        "skills": db_candidate.skills,
        "experience_years": db_candidate.experience_years,
        "education": db_candidate.education,
        "certifications": db_candidate.certifications,
        "projects": db_candidate.projects,
        "created_at": db_candidate.created_at
    }

@app.get("/api/candidates", response_model=List[Dict[str, Any]])
def list_candidates(db: Session = Depends(get_db)):
    """Lists all uploaded candidate profiles."""
    candidates = db.query(Candidate).order_by(Candidate.created_at.desc()).all()
    return [{
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "skills": c.skills,
        "experience_years": c.experience_years,
        "education": c.education,
        "created_at": c.created_at
    } for c in candidates]

@app.get("/api/candidates/{candidate_id}", response_model=Dict[str, Any])
def get_candidate_details(candidate_id: str, db: Session = Depends(get_db)):
    """Fetches details for a specific candidate."""
    cand = db.query(Candidate).filter_by(id=candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {
        "id": cand.id,
        "name": cand.name,
        "email": cand.email,
        "phone": cand.phone,
        "skills": cand.skills,
        "experience_years": cand.experience_years,
        "education": cand.education,
        "certifications": cand.certifications,
        "projects": cand.projects,
        "raw_text": cand.raw_text,
        "created_at": cand.created_at
    }

# 2. Job Descriptions Endpoints
@app.post("/api/jobs", response_model=JobDescriptionResponse)
def create_job(job_in: JobDescriptionCreate, db: Session = Depends(get_db)):
    """Creates a new job description and triggers auto-extraction of keywords/experience requirements."""
    db_job = create_job_description(db, job_in)
    return db_job

@app.get("/api/jobs", response_model=List[JobDescriptionResponse])
def list_jobs(db: Session = Depends(get_db)):
    """Lists all active job descriptions."""
    return db.query(JobDescription).order_by(JobDescription.created_at.desc()).all()

@app.get("/api/jobs/{job_id}", response_model=JobDescriptionResponse)
def get_job_description(job_id: str, db: Session = Depends(get_db)):
    """Fetches a specific job description's parameters."""
    job = db.query(JobDescription).filter_by(id=job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")
    return job

# 3. AI Matching Engine & Screening Endpoints
@app.post("/api/screen", response_model=MatchResultResponse)
def screen_candidate(candidate_id: str = Form(...), job_id: str = Form(...), db: Session = Depends(get_db)):
    """Triggers the LangGraph screening pipeline to calculate ranking and AI recommendations."""
    try:
        match_result = get_or_create_match(db, candidate_id, job_id)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Screening engine failed: {str(e)}")
        
    cand = match_result.candidate
    return MatchResultResponse(
        match_id=match_result.id,
        candidate={
            "candidate_id": cand.id,
            "name": cand.name,
            "email": cand.email,
            "phone": cand.phone,
            "skills": cand.skills,
            "experience_years": cand.experience_years,
            "education": cand.education,
            "certifications": cand.certifications,
            "projects": cand.projects
        },
        job_id=match_result.job_id,
        overall_score=match_result.overall_score,
        semantic_match_score=match_result.semantic_match_score,
        skills_match_score=match_result.skills_match_score,
        experience_match_score=match_result.experience_match_score,
        education_match_score=match_result.education_match_score,
        projects_score=match_result.projects_score,
        certifications_score=match_result.certifications_score,
        ats_compatibility_score=match_result.ats_compatibility_score,
        gap_analysis=match_result.gap_analysis,
        resume_improvement=match_result.resume_improvement,
        ai_summary=match_result.ai_summary or "",
        interview_questions=match_result.interview_questions,
        created_at=match_result.created_at
    )

@app.get("/api/jobs/{job_id}/candidates", response_model=List[Dict[str, Any]])
def get_ranked_candidates(job_id: str, db: Session = Depends(get_db)):
    """Screen all candidates against a specific job, returning them sorted by overall score."""
    job = db.query(JobDescription).filter_by(id=job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")
        
    candidates = db.query(Candidate).all()
    ranked_list = []
    
    for cand in candidates:
        # Trigger screen (re-uses existing cache or generates new one)
        try:
            match_res = get_or_create_match(db, cand.id, job.id)
            ranked_list.append({
                "match_id": match_res.id,
                "candidate_id": cand.id,
                "name": cand.name,
                "email": cand.email,
                "overall_score": match_res.overall_score,
                "semantic_match_score": match_res.semantic_match_score,
                "skills_match_score": match_res.skills_match_score,
                "experience_years": cand.experience_years,
                "ats_compatibility_score": match_res.ats_compatibility_score,
                "created_at": match_res.created_at
            })
        except Exception as e:
            # Skip candidate if screening completely fails
            print(f"Skipping candidate {cand.name} due to matching failure: {e}")
            
    # Sort candidates by overall score descending
    ranked_list = sorted(ranked_list, key=lambda x: x["overall_score"], reverse=True)
    return ranked_list

@app.get("/api/compare", response_model=CompareCandidatesResponse)
def compare_candidates(job_id: str, candidate_ids: List[str] = Query(...), db: Session = Depends(get_db)):
    """Returns side-by-side metrics comparing selected candidates against a job description."""
    job = db.query(JobDescription).filter_by(id=job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job description not found")
        
    compare_list = []
    for cand_id in candidate_ids:
        cand = db.query(Candidate).filter_by(id=cand_id).first()
        if not cand:
            continue
        try:
            m = get_or_create_match(db, cand.id, job.id)
            compare_list.append({
                "candidate_id": cand.id,
                "name": cand.name,
                "overall_score": m.overall_score,
                "semantic_match_score": m.semantic_match_score,
                "skills_match_score": m.skills_match_score,
                "experience_years": cand.experience_years,
                "ats_compatibility_score": m.ats_compatibility_score,
                "rank": 0 # Set dynamically below
            })
        except Exception as e:
            print(f"Failed to match {cand_id}: {e}")
            
    # Sort and assign ranks
    compare_list = sorted(compare_list, key=lambda x: x["overall_score"], reverse=True)
    for idx, item in enumerate(compare_list):
        item["rank"] = idx + 1
        
    return CompareCandidatesResponse(
        job_id=job.id,
        job_title=job.title,
        candidates=compare_list
    )

# 4. Analytics Endpoints
@app.get("/api/analytics", response_model=SystemMetricsResponse)
def fetch_analytics(db: Session = Depends(get_db)):
    """Fetches global recruiting statistics and log activities."""
    return get_system_metrics(db)
