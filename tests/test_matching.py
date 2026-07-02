import pytest
from ai.database import cosine_similarity, generate_local_embedding, Candidate, JobDescription
from services.matching_service import calculate_skills_score, calculate_match_scores, calculate_education_score

def test_cosine_similarity():
    # Identical vectors
    v1 = [1.0, 2.0, 3.0]
    v2 = [1.0, 2.0, 3.0]
    assert pytest.approx(cosine_similarity(v1, v2), 0.01) == 1.0
    
    # Orthogonal vectors
    v3 = [1.0, 0.0]
    v4 = [0.0, 1.0]
    assert cosine_similarity(v3, v4) == 0.0
    
    # Empty list
    assert cosine_similarity([], [1.0]) == 0.0

def test_skills_matching():
    cand_skills = ["Python", "FastAPI", "SQL", "Git"]
    req_skills = ["Python", "SQL", "Docker"]
    pref_skills = ["FastAPI", "Kubernetes"]
    
    score, missing = calculate_skills_score(cand_skills, req_skills, pref_skills)
    
    # Matched req: Python, SQL (2 out of 3 = 66.6%)
    # Matched pref: FastAPI (1 out of 2 = 50% * 10% = 5% bonus)
    # Total = 71.6%
    assert pytest.approx(score, 0.1) == 71.6
    assert "Docker" in missing

def test_education_matching():
    assert calculate_education_score("Ph.D. in CS", "Bachelor's") == 100.0
    assert calculate_education_score("Bachelor of Engineering", "Bachelor's") == 100.0
    assert calculate_education_score("Bachelor's", "Master's") == 75.0
    assert calculate_education_score("", "Bachelor's") == 50.0

def test_ranking_formula():
    candidate = Candidate(
        name="Test Dev",
        skills=["Python", "FastAPI", "SQLAlchemy", "PostgreSQL", "Docker", "Git"],
        experience_years=3.0,
        education="M.S. in Computer Science",
        projects=["E-Commerce API", "Chat System"],
        certifications=["AWS Practitioner"]
    )
    
    job = JobDescription(
        title="Python Backend Engineer",
        required_skills=["Python", "FastAPI", "SQLAlchemy", "PostgreSQL"],
        preferred_skills=["Docker", "Kubernetes"],
        experience_years=3.0,
        education="Bachelor's"
    )
    
    # Local embeddings
    candidate.embedding = generate_local_embedding(candidate.skills, "Worked on python backend projects.")
    job.embedding = generate_local_embedding(job.required_skills + job.preferred_skills, "Looking for python backend developer.")
    
    scores = calculate_match_scores(candidate, job)
    
    assert scores["overall_score"] > 60.0
    assert scores["experience_match_score"] == 100.0
    assert scores["education_match_score"] == 100.0
    assert scores["projects_score"] == 100.0
    assert scores["certifications_score"] == 100.0
