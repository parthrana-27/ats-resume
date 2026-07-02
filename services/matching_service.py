import json
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from ai.database import Candidate, JobDescription, MatchResult, cosine_similarity, generate_local_embedding
from shared.config import settings

def calculate_education_score(candidate_edu: str, job_edu: str) -> float:
    """Calculates education match score based on level mapping."""
    if not job_edu:
        return 100.0
    if not candidate_edu:
        return 50.0
        
    cand_lower = candidate_edu.lower()
    job_lower = job_edu.lower()
    
    # Simple hierarchy mapping
    def get_level(edu_text: str) -> int:
        if "phd" in edu_text or "ph.d" in edu_text or "doctor" in edu_text:
            return 3
        if "master" in edu_text or "m.s" in edu_text or "m.tech" in edu_text or "mba" in edu_text:
            return 2
        if "bachelor" in edu_text or "b.s" in edu_text or "b.tech" in edu_text or "b.e" in edu_text:
            return 1
        return 0
        
    cand_level = get_level(cand_lower)
    job_level = get_level(job_lower)
    
    if cand_level >= job_level:
        return 100.0
    elif cand_level == 2 and job_level == 3:
        return 80.0
    elif cand_level == 1 and job_level == 2:
        return 75.0
    elif cand_level == 1 and job_level == 3:
        return 60.0
    else:
        return 50.0

def calculate_skills_score(candidate_skills: List[str], required_skills: List[str], preferred_skills: List[str]) -> Tuple[float, List[str]]:
    """Calculates skills match score and identifies missing skills."""
    if not required_skills:
        return 100.0, []
        
    cand_skills_set = {s.strip().lower() for s in candidate_skills}
    req_skills_set = {s.strip().lower() for s in required_skills}
    pref_skills_set = {s.strip().lower() for s in preferred_skills}
    
    # Calculate required skills match
    matched_req = req_skills_set.intersection(cand_skills_set)
    req_match_ratio = len(matched_req) / len(req_skills_set)
    
    # Calculate preferred skills match (optional bonus)
    pref_bonus = 0.0
    if pref_skills_set:
        matched_pref = pref_skills_set.intersection(cand_skills_set)
        pref_bonus = (len(matched_pref) / len(pref_skills_set)) * 10.0 # max 10% bonus
        
    skills_score = min((req_match_ratio * 100.0) + pref_bonus, 100.0)
    
    # Find missing required and preferred skills
    missing = []
    for skill in required_skills:
        if skill.strip().lower() not in cand_skills_set:
            missing.append(skill)
            
    return float(skills_score), missing

def calculate_match_scores(candidate: Candidate, job: JobDescription) -> Dict[str, float]:
    """Computes all detailed match scores based on the candidate ranking formula."""
    
    # 1. Semantic Match (40%)
    sem_score = 0.0
    if candidate.embedding and job.embedding:
        # Cosine similarity range is [-1, 1], map to [0, 100]
        similarity = cosine_similarity(candidate.embedding, job.embedding)
        sem_score = max(0.0, similarity * 100.0)
    else:
        # Fallback to local embedding generation if missing
        c_emb = generate_local_embedding(candidate.skills, candidate.raw_text or "")
        j_emb = generate_local_embedding(job.required_skills + job.preferred_skills, job.raw_text or "")
        similarity = cosine_similarity(c_emb, j_emb)
        sem_score = max(0.0, similarity * 100.0)
        
    # 2. Skills Match (20%)
    skills_score, missing_skills = calculate_skills_score(
        candidate.skills, job.required_skills, job.preferred_skills
    )
    
    # 3. Experience Match (15%)
    exp_score = 0.0
    if job.experience_years == 0.0:
        exp_score = 100.0
    else:
        exp_score = min((candidate.experience_years / job.experience_years) * 100.0, 100.0)
        
    # 4. Education Match (10%)
    edu_score = calculate_education_score(candidate.education or "", job.education or "")
    
    # 5. Projects Score (10%)
    num_projects = len(candidate.projects or [])
    if num_projects >= 2:
        proj_score = 100.0
    elif num_projects == 1:
        proj_score = 70.0
    else:
        proj_score = 40.0
        
    # 6. Certifications Score (5%)
    num_certs = len(candidate.certifications or [])
    cert_score = 100.0 if num_certs >= 1 else 50.0
    
    # Overall Score Calculation
    overall = (
        (sem_score * 0.40) + 
        (skills_score * 0.20) + 
        (exp_score * 0.15) + 
        (edu_score * 0.10) + 
        (proj_score * 0.10) + 
        (cert_score * 0.05)
    )
    
    # ATS Compatibility Check
    ats_score = int(
        (skills_score * 0.4) + 
        (exp_score * 0.3) + 
        (edu_score * 0.1) + 
        (100.0 if "action" in (candidate.raw_text or "").lower() else 70.0) * 0.2
    )
    ats_score = min(max(50, ats_score), 99)
    
    return {
        "overall_score": float(overall),
        "semantic_match_score": float(sem_score),
        "skills_match_score": float(skills_score),
        "experience_match_score": float(exp_score),
        "education_match_score": float(edu_score),
        "projects_score": float(proj_score),
        "certifications_score": float(cert_score),
        "ats_compatibility_score": float(ats_score)
    }

def run_local_match_generation(candidate: Candidate, job: JobDescription) -> Dict[str, Any]:
    """Generates mock AI gap analysis, resume improvements, summaries, and questions."""
    
    # 1. Gap Analysis
    skills_score, missing_skills = calculate_skills_score(
        candidate.skills, job.required_skills, job.preferred_skills
    )
    
    learning_path = []
    for skill in missing_skills:
        learning_path.append(f"Complete '{skill} Fundamentals' course on Coursera/Udemy")
        learning_path.append(f"Build a miniature personal project using {skill}")
        
    gap_analysis = {
        "missing_skills": missing_skills,
        "priority": "High" if len(missing_skills) > 2 else "Medium",
        "recommended_learning_path": learning_path[:6] if learning_path else ["Continue mastering core development technologies."]
    }
    
    # 2. Resume Improvement suggestions
    resume_improvement = [
        {
            "before": "Responsible for developing backend features.",
            "after": "Architected and implemented FastAPI microservices handling 15,000+ daily API requests, reducing system latency by 28%.",
            "rationale": "Uses strong action verbs ('Architected', 'Implemented') and quantifies the impact to demonstrate scale and value."
        },
        {
            "before": "Maintained database and fixed queries.",
            "after": "Optimized complex PostgreSQL queries and connection pool settings, yielding a 40% speedup in candidate search retrieval times.",
            "rationale": "Specifies the technology (PostgreSQL) and provides clear performance metrics to show technical capability."
        }
    ]
    
    # 3. AI Summary
    skills_csv = ", ".join(candidate.skills[:5])
    summary = (
        f"{candidate.name} is a software professional with {candidate.experience_years} years of experience. "
        f"Key technical competencies include: {skills_csv}. Demonstrated record of educational credentials "
        f"({candidate.education or 'Degree/Diploma'}) and structured hands-on projects. "
        f"Highly suitable matching candidate for the {job.title} role."
    )
    
    # 4. Interview questions
    interview_questions = {
        "technical": [
            f"Can you explain how you would design a system using {skills_csv} for high concurrency?",
            "What is the difference between REST API design and GraphQL in a FastAPI microservice architecture?",
            "How do you handle database migration conflicts when working with SQLAlchemy or Alembic?"
        ],
        "behavioral": [
            "Describe a time when you discovered a performance bottleneck in your code. How did you diagnose and resolve it?",
            "Tell us about a time you had to work with a technology you weren't familiar with to deliver a project on schedule."
        ],
        "coding": [
            "Design a thread-safe LRU Cache in Python.",
            "Implement a rate-limiting middleware for a FastAPI application using an in-memory sliding window algorithm."
        ],
        "project": [
            f"Looking at your projects, could you explain the architecture of one of your featured applications?",
            "What was the most challenging technical decision you made in your projects, and why did you choose that approach?"
        ]
    }
    
    return {
        "gap_analysis": gap_analysis,
        "resume_improvement": resume_improvement,
        "ai_summary": summary,
        "interview_questions": interview_questions
    }

def get_or_create_match(db: Session, candidate_id: str, job_id: str) -> MatchResult:
    """Computes ranking metrics, runs LangGraph or mock generation, and persists in MatchResult."""
    
    # Check if match result already exists
    existing = db.query(MatchResult).filter_by(candidate_id=candidate_id, job_id=job_id).first()
    if existing:
        return existing
        
    candidate = db.query(Candidate).filter_by(id=candidate_id).first()
    job = db.query(JobDescription).filter_by(id=job_id).first()
    
    if not candidate or not job:
        raise ValueError("Candidate or JobDescription not found.")
        
    # Calculate formula scores
    scores = calculate_match_scores(candidate, job)
    
    # AI Generation (LangGraph workflow or local mock engine)
    # By default, if settings.is_mock_mode is True, we run local generation.
    # If not, we run the live LangGraph agent workflow (we'll implement this workflow in the next task).
    if settings.is_mock_mode:
        ai_data = run_local_match_generation(candidate, job)
    else:
        # We will dynamically load the LangGraph runner to prevent import cycles
        try:
            from ai.agents.graph import run_langgraph_match
            ai_data = run_langgraph_match(candidate, job)
        except Exception as e:
            # Fallback if LangGraph fails
            print(f"LangGraph failed, falling back to mock generation: {e}")
            ai_data = run_local_match_generation(candidate, job)
            
    match_res = MatchResult(
        candidate_id=candidate_id,
        job_id=job_id,
        overall_score=scores["overall_score"],
        semantic_match_score=scores["semantic_match_score"],
        skills_match_score=scores["skills_match_score"],
        experience_match_score=scores["experience_match_score"],
        education_match_score=scores["education_match_score"],
        projects_score=scores["projects_score"],
        certifications_score=scores["certifications_score"],
        ats_compatibility_score=scores["ats_compatibility_score"],
        gap_analysis=ai_data["gap_analysis"],
        resume_improvement=ai_data["resume_improvement"],
        ai_summary=ai_data["ai_summary"],
        interview_questions=ai_data["interview_questions"]
    )
    
    db.add(match_res)
    db.commit()
    db.refresh(match_res)
    return match_res
