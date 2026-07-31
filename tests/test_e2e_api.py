import httpx
import os
import json

API_BASE = "http://127.0.0.1:8000"

def test_e2e_flow():
    client = httpx.Client(timeout=60.0)
    
    # 1. Health check
    r = client.get(f"{API_BASE}/health")
    print(f"Health Check: {r.status_code} - {r.json()}")
    assert r.status_code == 200
    
    import io
    
    # 2. Upload John Doe resume
    print("Uploading John Doe resume...")
    john_content = b"""
    John Doe
    Email: john.doe@example.com | Phone: 555-0199
    Experience: 5 years
    Degree: Bachelor's in Computer Science
    
    Skills: Python, FastAPI, PostgreSQL, Docker, Git, REST API, Microservices
    
    Work Experience:
    Senior Developer at TechCorp (2021 - Present)
    - Built scalable backend services using Python and FastAPI
    - Implemented PostgreSQL database schemas and optimized queries
    - Deployed containerized applications using Docker and Git CI/CD pipelines
    """
    r = client.post(
        f"{API_BASE}/api/resumes/upload",
        files={"file": ("john_doe.txt", io.BytesIO(john_content), "text/plain")}
    )
    print(f"John Doe Upload Response: {r.status_code}")
    assert r.status_code == 200
    john_data = r.json()
    john_id = john_data["candidate_id"]
    print(f"Parsed Name: {john_data['name']}, ID: {john_id}")
    
    # 3. Upload Jane Smith resume
    print("Uploading Jane Smith resume...")
    jane_content = b"""
    Jane Smith
    Email: jane.smith@example.com | Phone: 555-0188
    Experience: 2 years
    Degree: Master's in Data Science
    
    Skills: Python, Data Analysis, Machine Learning, SQL, Git
    
    Work Experience:
    Junior Data Scientist at Analytics Inc (2022 - Present)
    - Analyzed datasets using Python, Pandas, and SQL
    - Built machine learning models for candidate scoring
    """
    r = client.post(
        f"{API_BASE}/api/resumes/upload",
        files={"file": ("jane_smith.txt", io.BytesIO(jane_content), "text/plain")}
    )
    print(f"Jane Smith Upload Response: {r.status_code}")
    assert r.status_code == 200
    jane_data = r.json()
    jane_id = jane_data["candidate_id"]
    print(f"Parsed Name: {jane_data['name']}, ID: {jane_id}")
    
    # 4. Create Job Description
    print("Creating Job Description...")
    job_payload = {
        "title": "Senior Python Developer",
        "department": "Core Platform",
        "raw_text": "Looking for a Senior Python Developer experienced in FastAPI, SQLAlchemy, PostgreSQL, and Git. Preferred qualifications include Docker and Kubernetes.",
        "experience_years": 3,
        "education": "Bachelor's"
    }
    r = client.post(f"{API_BASE}/api/jobs", json=job_payload)
    print(f"Create Job Response: {r.status_code}")
    assert r.status_code == 200
    job_data = r.json()
    job_id = job_data["id"]
    print(f"Job Created: {job_data['title']}, ID: {job_id}")
    
    # 5. Screen Candidates against the Job
    print("Screening John Doe...")
    r = client.post(
        f"{API_BASE}/api/screen",
        data={"candidate_id": john_id, "job_id": job_id}
    )
    print(f"Screen John Doe Response: {r.status_code}")
    assert r.status_code == 200
    john_match = r.json()
    print(f"John Doe Score: {john_match['overall_score']}%, Compatibility: {john_match['ats_compatibility_score']}/100")
    
    print("Screening Jane Smith...")
    r = client.post(
        f"{API_BASE}/api/screen",
        data={"candidate_id": jane_id, "job_id": job_id}
    )
    print(f"Screen Jane Smith Response: {r.status_code}")
    assert r.status_code == 200
    jane_match = r.json()
    print(f"Jane Smith Score: {jane_match['overall_score']}%, Compatibility: {jane_match['ats_compatibility_score']}/100")
    
    # 6. Fetch Ranked Standings
    print("Fetching ranked standings...")
    r = client.get(f"{API_BASE}/api/jobs/{job_id}/candidates")
    print(f"Rankings Response: {r.status_code}")
    assert r.status_code == 200
    standings = r.json()
    print("--- RANKED STANDINGS ---")
    for idx, c in enumerate(standings):
        print(f"#{idx+1}: {c['name']} - Score: {c['overall_score']}% (Experience: {c['experience_years']} yrs)")
        
    # 7. Compare matrix
    print("Fetching comparison matrix...")
    r = client.get(f"{API_BASE}/api/compare?job_id={job_id}&candidate_ids={john_id}&candidate_ids={jane_id}")
    print(f"Compare Matrix Response: {r.status_code}")
    assert r.status_code == 200
    comparison = r.json()
    print(json.dumps(comparison, indent=2))
    
    # 8. Fetch analytics
    print("Fetching global analytics dashboard metrics...")
    r = client.get(f"{API_BASE}/api/analytics")
    print(f"Analytics Response: {r.status_code}")
    assert r.status_code == 200
    print(json.dumps(r.json(), indent=2))
    
    print("\nE2E API FLOW TESTING COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    test_e2e_flow()
