import re
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from ai.database import JobDescription, generate_local_embedding
from shared.schemas import JobDescriptionCreate
from shared.config import settings

# A helper list of common technical skills to scan in mock mode
SKILL_KEYWORDS = [
    "python", "fastapi", "sqlalchemy", "postgresql", "postgres", "docker", "kubernetes", "redis", "kafka", 
    "react", "next.js", "nextjs", "tailwind", "typescript", "javascript", "aws", "ci/cd", "git", 
    "machine learning", "ml", "tensorflow", "pytorch", "data engineering", "java", "spring boot", 
    "c++", "go", "rust", "html", "css", "node.js", "nodejs", "express", "mongodb", "graphql", "rest api",
    "scikit-learn", "pandas", "numpy", "elastic search", "gcp", "azure", "docker compose", 
    "microservices", "unit testing", "pytest", "github actions", "sql", "nosql", "cicd", "terraform"
]

def extract_job_metadata_mock(text: str) -> Tuple[List[str], List[str], float, str]:
    """
    Extracts required skills, preferred skills, experience years, and education 
    from job description text using rules and regex. Used in mock mode.
    """
    text_lower = text.lower()
    
    # 1. Extract skills
    skills_found = []
    for skill in SKILL_KEYWORDS:
        # Match as word boundaries
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            # Normalize to standard case
            skills_found.append(skill.title() if skill != "next.js" else "Next.js")
            
    # Divide skills into required (first 60%) and preferred (rest 40%)
    split_idx = int(len(skills_found) * 0.6)
    required = skills_found[:split_idx] if split_idx > 0 else skills_found
    preferred = skills_found[split_idx:] if split_idx > 0 else []
    
    if not required:
        # Default fallback skills if none detected
        required = ["Python", "SQL", "Git"]
        preferred = ["Docker"]

    # 2. Extract experience
    experience = 0.0
    exp_matches = re.findall(r'(\d+)\+?\s*(?:years?|yrs?)\b', text_lower)
    if exp_matches:
        experience = float(max(int(m) for m in exp_matches))
    else:
        # Check standard text patterns like "3 years of experience"
        exp_matches_text = re.findall(r'(?:experience|required)\s*:\s*(\d+)\s*(?:years?|yrs?)', text_lower)
        if exp_matches_text:
            experience = float(exp_matches_text[0])
            
    # 3. Extract education
    education = "B.S. in Computer Science or equivalent"
    if "m.s." in text_lower or "master" in text_lower:
        education = "M.S. in Computer Science or equivalent"
    elif "phd" in text_lower or "ph.d" in text_lower:
        education = "Ph.D. in Computer Science or related field"
    elif "b.tech" in text_lower:
        education = "B.Tech in Computer Science or Information Technology"
        
    return required, preferred, experience, education

def create_job_description(db: Session, job_in: JobDescriptionCreate) -> JobDescription:
    """Creates a new JobDescription and computes its vector embedding."""
    
    # Extract metadata using mock rule-based logic or live LLM logic if configured
    # For now, we use our robust rule extractor as a baseline, which is extremely reliable.
    # If we are in live mode, we can override or enhance this with the AI engine.
    required_skills, preferred_skills, experience_years, education = extract_job_metadata_mock(job_in.raw_text)
    
    # Generate vector embedding for semantic search
    embedding = generate_local_embedding(required_skills + preferred_skills, job_in.raw_text)
    
    db_job = JobDescription(
        title=job_in.title,
        department=job_in.department,
        raw_text=job_in.raw_text,
        required_skills=job_in.required_skills or required_skills,
        preferred_skills=job_in.preferred_skills or preferred_skills,
        experience_years=job_in.experience_years or experience_years,
        education=job_in.education or education,
        embedding=embedding
    )
    
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job
