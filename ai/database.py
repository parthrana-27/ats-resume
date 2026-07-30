import json
import datetime
import uuid
import numpy as np
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine, Column, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from shared.config import settings

Base = declarative_base()

class Candidate(Base):
    __tablename__ = 'candidates'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    skills = Column(JSON, default=list) # List[str]
    experience_years = Column(Float, default=0.0)
    education = Column(String(200), nullable=True)
    certifications = Column(JSON, default=list) # List[str]
    projects = Column(JSON, default=list) # List[str]
    raw_text = Column(Text, nullable=True)
    structured_json = Column(JSON, default=dict)
    embedding = Column(JSON, nullable=True) # List[float]
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    match_results = relationship("MatchResult", back_populates="candidate", cascade="all, delete-orphan")

class JobDescription(Base):
    __tablename__ = 'job_descriptions'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(100), nullable=False)
    department = Column(String(100), nullable=True)
    raw_text = Column(Text, nullable=True)
    required_skills = Column(JSON, default=list) # List[str]
    preferred_skills = Column(JSON, default=list) # List[str]
    experience_years = Column(Float, default=0.0)
    education = Column(String(200), nullable=True)
    embedding = Column(JSON, nullable=True) # List[float]
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    match_results = relationship("MatchResult", back_populates="job", cascade="all, delete-orphan")

class MatchResult(Base):
    __tablename__ = 'match_results'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey('candidates.id'), nullable=False)
    job_id = Column(String(36), ForeignKey('job_descriptions.id'), nullable=False)
    
    overall_score = Column(Float, default=0.0)
    semantic_match_score = Column(Float, default=0.0)
    skills_match_score = Column(Float, default=0.0)
    experience_match_score = Column(Float, default=0.0)
    education_match_score = Column(Float, default=0.0)
    projects_score = Column(Float, default=0.0)
    certifications_score = Column(Float, default=0.0)
    ats_compatibility_score = Column(Float, default=0.0)
    
    gap_analysis = Column(JSON, default=dict) # dict with missing_skills, priority, learning_path
    resume_improvement = Column(JSON, default=list) # list of before/after tips
    ai_summary = Column(Text, nullable=True)
    interview_questions = Column(JSON, default=dict) # dict of tech, behavioral, coding, project questions
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    candidate = relationship("Candidate", back_populates="match_results")
    job = relationship("JobDescription", back_populates="match_results")

# Database Connection Setup
engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

# Helper functions for database operations
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Cosine Similarity Vector Helper
def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Computes the cosine similarity between two vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    arr1 = np.array(v1, dtype=np.float32)
    arr2 = np.array(v2, dtype=np.float32)
    
    norm1 = np.linalg.norm(arr1)
    norm2 = np.linalg.norm(arr2)
    
    if norm1 == 0.0 or norm2 == 0.0:
        return 0.0
        
    return float(np.dot(arr1, arr2) / (norm1 * norm2))

# Global vocabulary of common skills for mock local embeddings
COMMON_SKILLS_VOCAB = [
    "python", "fastapi", "sqlalchemy", "postgresql", "docker", "kubernetes", "redis", "kafka", 
    "react", "next.js", "tailwind", "typescript", "javascript", "aws", "ci/cd", "git", 
    "machine learning", "tensorflow", "pytorch", "data engineering", "java", "spring boot", 
    "c++", "go", "rust", "html", "css", "node.js", "express", "mongodb", "graphql", "rest api",
    "scikit-learn", "pandas", "numpy", "elastic search", "gcp", "azure", "docker compose", 
    "microservices", "unit testing", "pytest", "github actions", "sql", "nosql", "cicd", "terraform"
]

_hf_model = None

def get_hf_model():
    """Lazily load and cache the Hugging Face sentence-transformers model."""
    global _hf_model
    if _hf_model is None:
        from sentence_transformers import SentenceTransformer
        model_name = getattr(settings, "EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
        _hf_model = SentenceTransformer(model_name)
    return _hf_model

def generate_local_embedding(skills: List[str], text_content: str = "") -> List[float]:
    """
    Generates a local semantic representation (vector) using a Hugging Face SentenceTransformer
    model, with a fallback to a vocabulary-based vector if the model fails to load or encode.
    """
    try:
        model = get_hf_model()
        # Embed the raw text content if available; otherwise embed the skills list
        input_text = text_content if text_content.strip() else ", ".join(skills)
        if input_text.strip():
            embedding = model.encode(input_text)
            return embedding.tolist()
    except Exception as e:
        print(f"Hugging Face embedding generation failed: {e}. Falling back to vocabulary-based representation.")

    # Fallback: Vocabulary-based representation
    vector = [0.0] * len(COMMON_SKILLS_VOCAB)
    text_lower = text_content.lower()
    
    # 1. Base weights from identified skills list
    for skill in skills:
        skill_clean = skill.strip().lower()
        if skill_clean in COMMON_SKILLS_VOCAB:
            idx = COMMON_SKILLS_VOCAB.index(skill_clean)
            vector[idx] += 2.0
            
    # 2. Text contents check (for synonyms or keyword occurrences)
    for idx, skill in enumerate(COMMON_SKILLS_VOCAB):
        # Handle word boundaries or direct matching
        if skill in text_lower:
            vector[idx] += 1.0
            
    # Normalize the vector
    arr = np.array(vector, dtype=np.float32)
    norm = np.linalg.norm(arr)
    if norm > 0:
        arr = arr / norm
    return arr.tolist()

